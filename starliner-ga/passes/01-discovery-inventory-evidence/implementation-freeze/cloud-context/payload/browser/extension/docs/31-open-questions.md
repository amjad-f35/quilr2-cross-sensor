# Open Questions

**Analysis status:** Complete for the pinned source scope.  
**Evidence rule:** Current-behavior statements use the mission labels; target behavior is `Proposed`.  
**Purpose:** Record only questions that require evidence outside the three pinned repositories or an explicit product decision.


1. **Unresolved:** What exact service, schema, authentication, retention and
   acknowledgement contract implements `extension-log-service`?
2. **Unresolved:** What are the production gateway rewrites for
   `/browser-extension`, `/extension-api-service` and other prefixes?
3. **Unresolved:** What are the private JWT decoder and `@RequiresPermission`
   enforcement semantics, including local `permitAll` behavior?
4. **Unresolved:** What Kafka topics/binders and downstream materializers are
   deployed for risk events in each environment?
5. **Unresolved:** Which of the application knowledge/interceptor paths are
   feature-enabled and passing production probes today?
6. **Unresolved:** What authoritative device/browser-profile identifiers exist
   in enrollment/MDM systems and may be safely reused?
7. **Product decision:** What raw prompt/clipboard/file/diagnostic evidence may
   be retained, for how long, under which consent and roles?
8. **Product decision:** Which extension permission/version rules become
   customer findings and which remain inventory attributes?
9. **Architecture decision:** Is the server adapter sufficient for phase 1, or
   must offline browser/native evidence be mandatory at launch?
10. **Performance decision:** After HTTP outbox benchmarks, do any measured
    throughput/latency/control-stream SLOs justify adding gRPC?

No open question represents unprocessed in-scope source. Each requires an
external repository/runtime/authority or a product decision.
