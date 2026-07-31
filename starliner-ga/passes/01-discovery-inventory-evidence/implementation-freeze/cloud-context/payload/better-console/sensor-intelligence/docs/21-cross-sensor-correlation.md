# Cross-Sensor Correlation

| concept | llm | mcp | endpoint | browser | platform_role |
| --- | --- | --- | --- | --- | --- |
| application | gateway app | backend/client | process/app | web app/domain | resolve candidates; do not name-match blindly |
| human | request identity | caller identity | device user | persona/account | tenant-scoped identity resolution |
| device | rare/indirect | client metadata | native | browser workstation | prefer native source authority |
| conversation | native-ish | tool workflow | activity grouping | interaction/alert grouping | preserve source semantics |
| finding | detection signal | rejection/signal | DLP signal | alert lifecycle | central admission required |
| policy effect | gateway outcome | tool outcome | endpoint outcome | browser outcome | separate command acceptance/effect observation |
| topic | input events | input events | input events | input events | derived classifier output |

## Worked scenario

An LLM app, MCP backend, Endpoint process, and Browser domain may refer to one product. Preserve four source candidates and their evidence; resolve only through tenant-scoped identifiers, explicit aliases, time overlap, and reviewed rules. Name equality is supporting evidence, not identity proof.
