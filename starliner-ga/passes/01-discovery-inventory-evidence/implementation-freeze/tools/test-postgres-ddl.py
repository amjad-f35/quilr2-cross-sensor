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
                "CREATE TABLE IF NOT EXISTS die_control.sensor_bootstrap",
                "CREATE TABLE IF NOT EXISTS die_control.organization_tenant",
                "UNIQUE (tenant_id, organization_tenant_id)",
                "sensor_bootstrap_business_scope_fk",
                "CREATE TABLE IF NOT EXISTS die_control.sensor_bootstrap_issue_attempt",
                "CREATE TABLE IF NOT EXISTS die_control.installation_enrollment",
                "CREATE TABLE IF NOT EXISTS die_control.producer_component_set",
                "CREATE TABLE IF NOT EXISTS die_control.workload_credential",
                "CREATE TABLE IF NOT EXISTS die_control.credential_renewal_attempt",
                "CREATE TABLE IF NOT EXISTS die_control.workload_proof_replay",
                "CREATE TABLE IF NOT EXISTS die_control.producer_revocation_attempt",
                "UNIQUE (tenant_id, producer_id, idempotency_key_digest)",
                "producer artifact_digest must equal the delivery-owner runtime artifact",
                "endpoint component set requires exactly one % component",
                "health policy required_components must equal the active component-set health population",
                "producer health policy differs from its cryptographically verified manifest effects",
                "certification fields differ from the cryptographically verified certify manifest",
                "passed manifest verification must retain verifier-derived semantic effects",
                "to_jsonb(NEW) - 'applied_at'",
                "expires_at <= issued_at + interval '15 minutes'",
                "CREATE POLICY tenant_isolation_sensor_bootstrap",
                "ALTER TABLE die_control.workload_credential FORCE ROW LEVEL SECURITY",
                "sha256:e5bab26ef08a3eea4f96fa8a2919d0a96ba292dd3d650f3051b85bf02e6ed442",
                "sha256:d07d20c3141e148dcc596ad18d17e537202821789cb3ea5119857404c1d8543e",
                "browser_backend 1.0.0 has unknown schema digest %; refusing silent convergence",
            ):
                if required_fragment not in sql:
                    raise AssertionError(
                        "PostgreSQL baseline lacks required runtime-safe "
                        f"fragment: {required_fragment}"
                    )
            generic_profile_seed = sql[
                sql.index("INSERT INTO die_control.source_profile_version") :
                sql.index("-- Browser Backend 1.0.0 was corrected before GA")
            ]
            if "('browser_backend', '1.0.0'" in generic_profile_seed:
                raise AssertionError(
                    "Browser Backend corrected profile cannot use generic "
                    "ON CONFLICT DO NOTHING convergence"
                )
            if not re.search(
                r"ELSIF\s+current_digest\s*=\s*"
                r"'sha256:e5bab26ef08a3eea4f96fa8a2919d0a96ba292dd3d650f3051b85bf02e6ed442'"
                r"[\s\S]*?UPDATE\s+die_control\.source_profile_version"
                r"[\s\S]*?'sha256:d07d20c3141e148dcc596ad18d17e537202821789cb3ea5119857404c1d8543e'",
                sql,
            ):
                raise AssertionError(
                    "Browser Backend known pre-GA digest has no guarded upgrade path"
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
            for required_grant in (
                "'die_enrollment'",
                "GRANT USAGE ON SCHEMA die_control, die_audit, die_authz TO die_enrollment",
                "ON die_control.sensor_bootstrap TO die_enrollment",
                "GRANT INSERT ON die_control.installation_enrollment",
                "GRANT SELECT, INSERT ON die_control.sensor_bootstrap_issue_attempt",
                "ON die_control.workload_credential TO die_enrollment",
                "ALTER ROLE die_enrollment NOBYPASSRLS",
            ):
                if required_grant not in roles_sql:
                    raise AssertionError(
                        "installed-producer control role lacks least-privilege grant: "
                        f"{required_grant}"
                    )
            if re.search(
                r"GRANT\s+INSERT[^;]*die_control\.sensor_bootstrap[^;]*TO\s+die_enrollment",
                roles_sql,
                flags=re.IGNORECASE | re.DOTALL,
            ):
                raise AssertionError(
                    "network enrollment role must consume but never issue Discovery bootstraps"
                )
            if re.search(
                r"GRANT[^;]*ALL TABLES IN SCHEMA die_control[^;]*TO die_enrollment",
                roles_sql,
                flags=re.IGNORECASE | re.DOTALL,
            ):
                raise AssertionError(
                    "network enrollment role received blanket control-plane privileges"
                )
            for prohibited_grant in (
                r"GRANT\s+INSERT[^;]*die_control\.certification[^;]*TO\s+die_enrollment",
                r"GRANT\s+INSERT[^;]*die_control\.manifest_verification[^;]*TO\s+die_enrollment",
                r"GRANT\s+INSERT[^;]*die_control\.producer_capability[^;]*TO\s+die_enrollment",
                r"GRANT\s+INSERT[^;]*die_control\.producer_health_policy[^;]*TO\s+die_enrollment",
                r"GRANT\s+INSERT[^;]*die_control\.expected_population[^;]*TO\s+die_enrollment",
                r"GRANT\s+INSERT[^;]*die_control\.enrollment_manifest[^;]*TO\s+die_enrollment",
                r"GRANT\s+UPDATE[^;]*die_control\.producer[^;]*TO\s+die_enrollment",
                r"GRANT\s+INSERT[^;]*die_control\.manifest_verification[^;]*TO\s+die_control_admin",
                r"GRANT\s+UPDATE\s*\([^)]*applied_effects[^)]*\)[^;]*die_control\.manifest_verification[^;]*TO\s+die_control_admin",
                r"GRANT\s+(?:SELECT,\s*)?INSERT[^;]*die_control\.manifest_signer_key[^;]*TO\s+die_control_admin",
            ):
                if re.search(
                    prohibited_grant,
                    roles_sql,
                    flags=re.IGNORECASE | re.DOTALL,
                ):
                    raise AssertionError(
                        "network enrollment role can self-certify or elevate producer trust"
                    )
            if "GRANT INSERT ON die_control.manifest_verification TO die_verifier" not in roles_sql:
                raise AssertionError("isolated verifier cannot record signature results")
            if "GRANT INSERT ON die_control.manifest_verification TO die_maintenance" in roles_sql:
                raise AssertionError("maintenance must not impersonate the isolated verifier")
            if "GRANT UPDATE (applied_at)\n  ON die_control.manifest_verification TO die_control_admin" not in roles_sql:
                raise AssertionError(
                    "control administration must apply but never rewrite verifier-derived effects"
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

            # Release-managed profile registries are global control metadata.
            # They contain no tenant data and are writable only by the
            # migration owner, so tenant RLS is neither applicable nor useful.
            global_tables = {
                "die_control.source_profile",
                "die_control.source_profile_version",
            }
            tables = set(create_positions) - global_tables
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
