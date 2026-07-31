# FastMCP tool and resource registry

Protocol-facing tool/resource declaration evidence.

`Verified:` 18 FastMCP-decorated tools/resources/prompts are declared in the scoped tree. Registration is performed by the decorators when the owning module imports successfully; deployment is analyzed separately.

| Kind | Protocol name or URI | Implementation | Signature | Annotations/tags |
| --- | --- | --- | --- | --- |
| `tool` | `add_numbers` | `example_backend.py:45::add_numbers` | `` | None declared |
| `tool` | `get_greeting` | `example_backend.py:51::get_greeting` | `` | None declared |
| `tool` | `calculate_square` | `example_backend.py:57::calculate_square` | `` | None declared |
| `resource` | `example://info` | `example_backend.py:63::get_server_info` | `` | None declared |
| `resource` | `example://data/{item_id}` | `example_backend.py:69::get_data` | `` | None declared |
| `tool` | `add` | `example_mcp_servers/math_mcp.py:7::add` | `` | None declared |
| `tool` | `subtract` | `example_mcp_servers/math_mcp.py:13::subtract` | `` | None declared |
| `tool` | `multiply` | `example_mcp_servers/math_mcp.py:19::multiply` | `` | None declared |
| `tool` | `divide` | `example_mcp_servers/math_mcp.py:25::divide` | `` | None declared |
| `tool` | `search_gmail_messages` | `google_workspace/server.py:110::search_gmail_messages` | `` | annotations `READ_ONLY`; tags `{"gmail", "read"}` |
| `tool` | `get_gmail_message` | `google_workspace/server.py:145::get_gmail_message` | `` | annotations `READ_ONLY`; tags `{"gmail", "read"}` |
| `tool` | `create_gmail_draft` | `google_workspace/server.py:154::create_gmail_draft` | `` | annotations `WRITE`; tags `{"gmail", "write"}` |
| `tool` | `send_gmail_message` | `google_workspace/server.py:185::send_gmail_message` | `` | annotations `DESTRUCTIVE`; tags `{"gmail", "write", "destructive"}` |
| `tool` | `list_google_calendars` | `google_workspace/server.py:221::list_google_calendars` | `` | annotations `READ_ONLY`; tags `{"calendar", "read"}` |
| `tool` | `list_google_calendar_events` | `google_workspace/server.py:241::list_google_calendar_events` | `` | annotations `READ_ONLY`; tags `{"calendar", "read"}` |
| `tool` | `get_google_calendar_event` | `google_workspace/server.py:296::get_google_calendar_event` | `` | annotations `READ_ONLY`; tags `{"calendar", "read"}` |
| `tool` | `create_google_calendar_event` | `google_workspace/server.py:309::create_google_calendar_event` | `` | annotations `WRITE`; tags `{"calendar", "write"}` |
| `tool` | `update_google_calendar_event` | `google_workspace/server.py:361::update_google_calendar_event` | `` | annotations `MODIFY`; tags `{"calendar", "write"}` |
