# Field Transformation Lineage

**Analysis status:** Complete for the pinned source scope.  
**Evidence rule:** Current-behavior statements use the mission labels; target behavior is `Proposed`.  
**Purpose:** Trace acquisition, transformation, storage, emission and loss for all 776 field rows.


The exhaustive row-per-field lineage is
`../../../matrices/sensor-intelligence/browser-extension/field-lineage.csv`.

## Verified lossy transformations

1. Browser events are packaged under an untyped check/event map.
2. BES may add `email_label`, synthesize related credential-reuse records,
   replace `context_id`, and rename `data_leak_prevention` to `prompt`.
3. BES adds server-side timestamp, tenant/subscriber, vendor/product/type and
   routing identifiers.
4. Heartbeat binding drops the two enabled flags and supplies authenticated
   persona/tenant/email plus server receipt time.
5. Heartbeat aggregation keeps only the latest device+email entry per process
   and bucket, chunks it, and later projects it into Neo4j.
6. Native file results can omit DLP or extracted content depending on remote
   DLP mode; internal label-extraction details are skipped from serialization.
7. System identifier raw values remain in `extra_data` while strong top-level
   fields are explicitly emptied.

| Lineage ID | Field ID | Record | Field | Source acquisition | Transformations | Storage | Emission | Loss or discard | Target mapping | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FL-0001 | NF-0001 | PackageLogEnvelope | user | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0002 | NF-0002 | PackageLogEnvelope | user.username | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0003 | NF-0003 | PackageLogEnvelope | user.accountname | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0004 | NF-0004 | PackageLogEnvelope | user.machinename | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0005 | NF-0005 | PackageLogEnvelope | check | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0006 | NF-0006 | PackageLogEnvelope | check.id | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0007 | NF-0007 | PackageLogEnvelope | check.name | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0008 | NF-0008 | PackageLogEnvelope | check.properties | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0009 | NF-0009 | PackageLogEnvelope | check.properties.retry_count | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0010 | NF-0010 | PackageLogEnvelope | browser | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0011 | NF-0011 | PackageLogEnvelope | browser.name | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0012 | NF-0012 | PackageLogEnvelope | browser.version | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0013 | NF-0013 | PackageLogEnvelope | browser.os | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0014 | NF-0014 | PackageLogEnvelope | browser.useragent | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0015 | NF-0015 | PackageLogEnvelope | extension | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0016 | NF-0016 | PackageLogEnvelope | extension.id | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0017 | NF-0017 | PackageLogEnvelope | extension.version | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0018 | NF-0018 | PackageLogEnvelope | application | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0019 | NF-0019 | PackageLogEnvelope | application.name | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0020 | NF-0020 | PackageLogEnvelope | application.url | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0021 | NF-0021 | PackageLogEnvelope | application.domain | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0022 | NF-0022 | PackageLogEnvelope | application.authenticationtype | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0023 | NF-0023 | PackageLogEnvelope | application.is_newly_introduced | Extension context plus resolved check | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | Browser event HTTPS request | None identified | Available through adapter mapping only | Verified in source |
| FL-0024 | NF-0024 | AuthCheck | id | Authentication trail resolution | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | PackageLogEnvelope.check | None identified | Available through adapter mapping only | Verified in source |
| FL-0025 | NF-0025 | AuthCheck | name | Authentication trail resolution | Pass through or package under native envelope | See record catalog; no added persistence unless explicitly stated | PackageLogEnvelope.check | None identified | Available through adapter mapping only | Verified in source |

The table above is a preview; the CSV contains every field row, not only the
preview.
