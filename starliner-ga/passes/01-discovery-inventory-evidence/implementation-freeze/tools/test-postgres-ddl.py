#!/usr/bin/env python3
"""Parse every PostgreSQL baseline statement with the PostgreSQL grammar.

This is an early syntax gate. It does not replace executing migrations, grants,
RLS checks, exclusion constraints, triggers, and rollback/upgrade tests against
every supported PostgreSQL version.
"""

from pathlib import Path
import re

from pglast import parse_sql


ROOT = Path(__file__).resolve().parent.parent
SQL_FILES = (
    ROOT / "sql" / "001-die-core.sql",
    ROOT / "sql" / "003-die-roles-and-grants.sql",
    ROOT / "tools" / "live" / "postgres-conformance.sql",
)


def main() -> None:
    statement_count = 0
    for path in SQL_FILES:
        sql = path.read_text(encoding="utf-8")
        parse_input = sql
        if path.name == "postgres-conformance.sql":
            parse_input = "\n".join(
                line for line in sql.splitlines() if not line.startswith("\\")
            )
        statements = parse_sql(parse_input)
        statement_count += len(statements)
        print(f"PASS {path.relative_to(ROOT)}: {len(statements)} statements")

        if path.name == "001-die-core.sql":
            if re.search(r"\bjsonb_object_length\s*\(", sql):
                raise AssertionError(
                    "PostgreSQL has no jsonb_object_length function; use "
                    "die_authz.jsonb_object_key_count"
                )
            for required_fragment in (
                "CREATE OR REPLACE FUNCTION "
                "die_authz.jsonb_object_key_count(value jsonb)",
                "CHECK (die_authz.jsonb_object_key_count(payload) <= 32)",
                "UNIQUE (tenant_id, object_key)",
                "record_id::text ~",
                "state text NOT NULL CHECK (state IN ('building','sealed','executing'))",
                "UNIQUE (tenant_id, execution_id)",
                "actual_object_target_count <> 1",
                "IF OLD.state = 'sealed' AND NEW.state = 'executing' THEN",
                "plan.state = 'executing'",
                "PERFORM pg_advisory_xact_lock(",
                "NEW.tenant_id || E'\\x1f' || NEW.evidence_id::text",
                "legal hold or deletion cancellation is too late after erasure execution commit",
                "hash_format text NOT NULL DEFAULT "
                "'die.audit.pg-jsonb-utc.v1'",
                "CREATE OR REPLACE FUNCTION die_audit.compute_audit_event_hash(",
                "audit_row.occurred_at AT TIME ZONE 'UTC'",
                "computed_hash := die_audit.compute_audit_event_hash(NEW)",
            ):
                if required_fragment not in sql:
                    raise AssertionError(
                        "PostgreSQL baseline lacks required runtime-safe "
                        f"fragment: {required_fragment}"
                    )
            roles_sql = (ROOT / "sql" / "003-die-roles-and-grants.sql").read_text(
                encoding="utf-8"
            )
            if (
                "GRANT UPDATE (state, sealed_at, execution_id, execution_started_at)"
                not in roles_sql
            ):
                raise AssertionError(
                    "maintenance role cannot commit the erasure execution "
                    "linearization fields"
                )
            if "(to_jsonb(NEW) - 'event_hash')::text" in sql:
                raise AssertionError(
                    "audit hashing must not use session-TimeZone-sensitive "
                    "generic row-to-JSON serialization"
                )
            create_positions = {
                match.group(1): match.start()
                for match in re.finditer(
                    r"\bCREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+"
                    r"(die_[a-z0-9_]+\.[a-z0-9_]+)",
                    sql,
                    flags=re.IGNORECASE,
                )
            }
            ordering_errors = []
            for pattern, operation in (
                (
                    r"\bREFERENCES\s+(die_[a-z0-9_]+\.[a-z0-9_]+)",
                    "REFERENCES",
                ),
                (
                    r"\bALTER\s+TABLE\s+(die_[a-z0-9_]+\.[a-z0-9_]+)",
                    "ALTER TABLE",
                ),
            ):
                for match in re.finditer(pattern, sql, flags=re.IGNORECASE):
                    table = match.group(1).lower()
                    created_at = create_positions.get(table)
                    if created_at is None:
                        ordering_errors.append(
                            f"{operation} names an uncreated DIE table {table}"
                        )
                    elif created_at > match.start():
                        line = sql.count("\n", 0, match.start()) + 1
                        ordering_errors.append(
                            f"line {line}: {operation} uses {table} before CREATE TABLE"
                        )
            if ordering_errors:
                raise AssertionError(
                    "PostgreSQL baseline is not executable in file order:\n- "
                    + "\n- ".join(ordering_errors)
                )

            tables = set(create_positions)
            rls_enabled = set(
                match.group(1).lower()
                for match in re.finditer(
                    r"\bALTER\s+TABLE\s+(die_[a-z0-9_]+\.[a-z0-9_]+)"
                    r"\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY",
                    sql,
                    flags=re.IGNORECASE,
                )
            )
            rls_forced = set(
                match.group(1).lower()
                for match in re.finditer(
                    r"\bALTER\s+TABLE\s+(die_[a-z0-9_]+\.[a-z0-9_]+)"
                    r"\s+FORCE\s+ROW\s+LEVEL\s+SECURITY",
                    sql,
                    flags=re.IGNORECASE,
                )
            )
            policy_tables = set(
                match.group(1).lower()
                for match in re.finditer(
                    r"\bCREATE\s+POLICY\s+[a-z0-9_]+\s+ON\s+"
                    r"(die_[a-z0-9_]+\.[a-z0-9_]+)",
                    sql,
                    flags=re.IGNORECASE,
                )
            )
            for label, covered in (
                ("ENABLE RLS", rls_enabled),
                ("FORCE RLS", rls_forced),
                ("tenant policy", policy_tables),
            ):
                missing = sorted(tables - covered)
                if missing:
                    raise AssertionError(
                        f"PostgreSQL baseline lacks {label} on: "
                        + ", ".join(missing)
                    )
    print(f"PostgreSQL DDL parse passed: {statement_count} statements.")


if __name__ == "__main__":
    main()
