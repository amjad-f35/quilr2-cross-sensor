# Finding correlation example

## Signals

- Browser: sensitive file uploaded to a personal Claude account.
- Native/endpoint: file read from a protected directory.
- DLP: content classified as customer data.
- Endpoint/gateway: destination is `claude.ai`; no approved enterprise-account/gateway context matches.

## Root-cause finding

```text
Finding: Customer data sent to a personal Claude account
Root cause: personal Application Account + prohibited transfer
Affected: Human User, Tenant Application, Data Asset/Class, Device
Dedup key: tenant + finding type + account + data class + bounded campaign window
Evidence: four observations, detector versions, correlation decision
Confidence: raised by independent endpoint/browser/DLP evidence
Severity: data class × destination governance × transfer completion × coverage
Owner: application/data owner fallback to user manager/security queue
Actions: revoke personal use, remove provider copy, rotate exposed secrets,
         move work to enterprise account, investigate recurrence
Resolution: destination/account blocked or migrated and no recurrence during confirmation window
Reopen: new prohibited transfer after resolution
```

If account type is only inferred from email/domain, open a lower-confidence review finding or inventory badge; do not state “personal” as fact.
