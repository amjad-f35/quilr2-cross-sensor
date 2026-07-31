# 06 — Feature and Capability Merger

The source ledger supplies 63 features grouped into
31 endpoint logical capabilities. Grouping does not merge
semantically distinct source behaviors; each feature retains entry point,
symbols, inputs, outputs, consumer, platform, conditions, proof and
reachability.

Major capability families include lifecycle/supervision, process/application
discovery, local artifact/configuration discovery, package scanning, hooks,
proxy/TLS/DLP/policy, alerting, diagnostics, identity context, process control,
packaging/updating and source-local persistence.

`Verified limitation:` capability presence is not estate-wide discovery. The
endpoint supports active macOS/Windows paths and selected local scans. It does
not exhaustively discover Linux, cloud instances, serverless, containers,
CI/CD runners, remote SCM trees, all MCP capability definitions, all agent
runtimes or enterprise identity/ownership.

`Inference:` frozen product capabilities can be built only for facts marked
`adapter_derivable`; `new_capture_required` and future connector rows remain
unsourced until implementation/evidence changes.
