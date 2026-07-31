# Global Evidence Manifest

The manifest has 87 NDJSON records: 74 frozen artifacts, 5 profile input files, and 8 supporting platform records.

Each row contains the mission-required evidence ID, profile/repository/revision links where known, locator, type, content digest, proof status, reachability classification, capture environment, retention location, owner, and assertion references.

**Verified:** source-file digests are mechanically rechecked by `validate-evidence-links.mjs`.

**Boundary:** supporting Quilr1 evidence remains archival/supporting and is not promoted to a source profile.
