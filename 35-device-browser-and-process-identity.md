# 35. Device, browser, and process identity

## Device layers

Do not treat “device” as one row:

```text
physical hardware
→ OS installation
→ managed-device record
→ cloud VM instance
→ endpoint-agent installation
→ current boot
→ process instance
```

A reimage may preserve hardware while replacing OS installation, enrollment, boot, processes, and credentials.

## Identifier evaluation

| Identifier | Strength | Caveat |
| --- | --- | --- |
| MDM/EDR device object ID | Strong within provider tenant | Re-enrollment/provider migration semantics required |
| Directory/cloud instance ID | Strong within issuer/account | VM recreation creates a new instance |
| Hardware-backed key/device certificate | Cryptographic | Validation, rotation, revocation, and ownership still required |
| TPM endorsement-key fingerprint | High-assurance hardware candidate | Privacy and attestation policy required |
| Hardware serial | Secondary | May be unavailable, duplicated, or changed by board replacement |
| OS installation ID/host UUID | Secondary | Changes on reimage/cloning behavior varies |
| MAC address | Weak | Mutable and non-unique across interfaces/virtualization |
| Hostname | Weak | Mutable and reusable |

No hostname or MAC address can independently auto-merge a device.

## Current endpoint evidence

Endpoint and browser analyses expose:

- Persona/device identifiers and local email/account candidates;
- process names, paths, PIDs, destinations, files, and user/device context;
- endpoint discovery IDs and backend canonical IDs for selected artifacts;
- native-host and browser-extension installations/versions;
- diagnostic component IDs.

But MDM/EDR authority, device certificate, hardware attestation, stable boot identity, and a universal process identity are absent or unresolved.

## Browser layers

```text
browser product
browser installation
browser profile
extension installation
managed browser account
current browser session
SaaS application account
```

Vanguard/Sentinel/BES provide useful event/persona/browser/device fields but do not prove a universal browser profile or SaaS provider account identity. Personal versus enterprise account type therefore remains unknown unless provider or managed-browser telemetry supplies proof.

## Process identity

A process instance is:

```text
device/OS installation
+ boot ID
+ PID
+ process start time
+ parent process
+ executable path
+ binary digest and code signer
+ package/container identity
+ effective OS user
```

PID alone is ephemeral. Process name/path can create application candidates, while bundle/package ID, code signer, and verified binary digest strengthen resolution.

## Attribution claims

For each endpoint/browser event, independently record whether evidence supports:

- logged-in human;
- effective OS user;
- device/OS installation/current boot;
- browser installation/profile/session;
- process and binary;
- extension/agent/sensor instance;
- source/destination and data asset;
- agent runtime;
- credential used.

Missing layers remain null/unknown; they are not copied from a different event merely because timestamps are close.

## Enrollment and lifecycle

```text
candidate
→ enrolled
→ authenticated
→ active/heartbeat
→ reimaged/reinstalled/restarted
→ stale
→ revoked
→ retired
→ reappeared
```

Enrollment binds tenant, native device/installation IDs, public key/certificate, sensor artifact/version, and management authority. Reimage/reinstall rules decide whether to create a new OS/agent installation under the same hardware identity.

## Event authenticity

Sensitive endpoint/browser events should carry:

```text
sensor canonical ID and instance
sensor version/artifact
tenant enrollment
authenticated channel or signature
source event ID and sequence
event/ingestion time
replay protection
device/browser/process references
```

Current caller-supplied component/sensor names are treated only as claims.

