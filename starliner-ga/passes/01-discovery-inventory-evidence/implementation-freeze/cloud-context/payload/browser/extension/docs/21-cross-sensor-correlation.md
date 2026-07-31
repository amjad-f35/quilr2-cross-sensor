# Cross-Sensor Correlation

**Analysis status:** Complete for the pinned source scope.  
**Evidence rule:** Current-behavior statements use the mission labels; target behavior is `Proposed`.  
**Purpose:** Define overlap, authority and conflict rules with endpoint, identity, gateway, connector and repository sources.


| Overlap ID | Browser sensor contribution | Other sensor/source | Overlap or complement | Correlation keys | Authority rule | Conflict handling | Availability | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| XO-001 | Persona email/account activity | Identity provider/HR | Browser observes use; IdP/HR owns identity/account authority | tenant, personaId, provider account ID, email weakly | External authoritative source owns person/account lifecycle | Keep both observations; do not merge solely on email | Requires an external authoritative source | Proposed |
| XO-002 | Device ID/hostname/serial clues | Endpoint/MDM | Browser provides heartbeat use; endpoint/MDM owns device inventory/health | tenant, assigned device ID, hardware token | MDM/endpoint should own canonical device identity | Quality-ranked identifiers and temporal assertions | Requires an external authoritative source | Proposed |
| XO-003 | Browser product/version | Endpoint software inventory | Browser is direct for active extension context; endpoint may inventory installed browsers | device ID, browser product, profile instance ID | Browser sensor owns observed profile activity; endpoint owns host software inventory | Represent separate product/install/profile entities | Requires minor sensor instrumentation | Proposed |
| XO-004 | Third-party extension inventory | Browser management/enterprise browser admin | Sensor directly observes profile; admin source owns intended policy/deployment | browser profile ID, extension ID | Keep observed and configured states separately | Finding only on observed/configured drift with coverage | Requires minor sensor instrumentation | Proposed |
| XO-005 | Web app/account use | SaaS connector/CASB/IdP | Browser sees interaction; connector sees server-side tenancy/data | tenant, provider account ID, app domain, time | Neither source alone is global authority for use | Correlate with confidence and preserve source | Available through adapter mapping only | Proposed |
| XO-006 | AI prompt activity | LLM gateway | Browser sees UI and unsupported direct traffic; gateway sees proxied API | user/account, app/model, time, content hash if allowed | Do not double count; gateway authoritative for proxied request delivery, browser for UI action | Dedup by explicit request/correlation ID preferred | Requires minor sensor instrumentation | Proposed |
| XO-007 | Prompt DLP result | LLM gateway DLP | Potential duplicate detectors/enforcement | detector ID/version, prompt event ID | Preserve both decisions; platform correlates | Show disagreements as evidence, not overwrite | Requires minor sensor instrumentation | Proposed |
| XO-008 | Browser copy/paste | Endpoint clipboard | Browser supplies web domain; native supplies source process/content metadata | sensor/device, time, privacy-safe hash | Combine for transfer path only within bounded window | No hash/no event means unresolved, not no transfer | Requires minor sensor instrumentation | Proposed |
| XO-009 | Upload/download | Endpoint/network/CASB | Browser sees intent/page; native sees file; network sees transfer | per-file event ID, device, URL, time | Each source owns its stage | State machine records attempted/scanned/allowed/transferred | Requires minor sensor instrumentation | Proposed |
| XO-010 | File label/DLP | Data catalog/label service | Native extracts point-in-time local metadata | file content hash/label ID if allowed | Authoritative label service owns label definitions | Retain observed label/version/time | Requires an external authoritative source | Proposed |
| XO-011 | Policy control | Central policy engine | Sensor consumes/enforces; platform owns desired policy/version | control ID/version, enforcement point ID | Platform owns configuration; sensor owns local action evidence | Show config/evaluation/effect separately | Requires minor sensor instrumentation | Proposed |
| XO-012 | Sensor health | Endpoint deployment/extension admin | Heartbeat observes runtime; deployment source owns expected installations | sensor instance/device/browser profile | Expected vs observed sources distinct | Coverage finding needs both expected and observed | Requires an external authoritative source | Proposed |
| XO-013 | MCP discovery | MCP gateway/backend sensor | Browser sensor has none | None currently | MCP source owns server/tool/connector identity | No inference from AI web app use | Not observable by this sensor | Verified in source |
| XO-014 | Agent definitions/skills/repos | Repository/CI/filesystem semantic scanner | Browser sensor has none | Repository commit/path/content identity | Repository scanner owns definitions; runtime sensor owns execution | Do not infer agent from prompt or markdown filename alone | Not observable by this sensor | Verified in source |

Correlation never upgrades sampled browser visibility to global coverage.
Missing browser activity is not proof of non-use. The platform must preserve
source provenance and confidence when gateway, endpoint, connector, IdP, MDM
or repository evidence disagrees.
