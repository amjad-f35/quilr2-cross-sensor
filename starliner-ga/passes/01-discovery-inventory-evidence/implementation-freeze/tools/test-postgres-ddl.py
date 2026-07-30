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
    print(f"PostgreSQL DDL parse passed: {statement_count} statements.")


if __name__ == "__main__":
    main()
