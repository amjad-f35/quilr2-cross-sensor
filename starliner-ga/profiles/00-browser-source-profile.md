# Browser Source Profile

Status: **normative profile; current source binding verified at pinned audited revisions**

## Purpose and authority

This profile covers the browser extension client and its local/native-host observation boundary. The browser backend/service is a separate producer governed by the [Browser Backend Source Profile](05-browser-backend-source-profile.md).

The browser client directly observes browser-local AI surfaces and interactions within its permitted scope. It is strong for web application surface discovery and browser policy effects. It is not authoritative for enterprise ownership, model deployment identity, endpoint-wide process activity, or activity outside covered browsers/profiles.

The exact extension, native-host and browser-backend integration seams and required corrections are in the [browser sensor binding](../implementation/12-browser-sensor-binding.md).

## Source object types

- browser installation and profile pseudonym;
- extension deployment;
- web origin and AI application surface;
- browser session;
- authenticated-account hint where safely available;
- interaction/execution observation;
- upload/download or data-use indicator;
- local policy decision and effect;
- profile health and reconciliation scope.

## Strong identifiers

Preferred identifiers:

- managed browser/extension installation ID;
- privacy-safe browser profile ID;
- normalized origin;
- catalog-backed web surface ID;
- source request/session ID;
- tenant-scoped pseudonymous user/device bridge, where authorized.

Cookies, raw tokens, DOM text, and page titles are not identity keys.

## Default-safe fields

- origin and catalog surface;
- observation/operation type;
- event and observation time;
- browser/extension version;
- policy and decision identifiers;
- upload/download occurrence and coarse data class;
- request/response status class;
- privacy-safe size/count;
- source correlation ID;
- enforcement outcome.

## Restricted or prohibited

- prompts, responses, DOM contents, clipboard contents, form values, and uploaded file contents are restricted;
- cookies, authorization headers, session tokens, passwords, and API keys are prohibited;
- full URLs are normalized to origin unless a reviewed path policy applies;
- user identity is pseudonymous unless an approved IdP bridge exists.

## Lifecycle and reconciliation

The profile reports installation/profile lifecycle, extension health, catalog surface discovery, and bounded reconciliation of current managed installations. Web activity is event-based; absence of activity does not prove an application is retired.

## Capability classes

- observe AI web surface;
- observe privacy-safe interaction metadata;
- warn;
- require justification;
- block navigation or supported interaction;
- report effect;
- limited data-class signal where technically and legally supported.

Each capability is browser/version/management-mode specific.

Client evidence relayed through the browser backend retains original producer and lineage so it is not double-counted as an independent backend observation.

## Central resolution contributions

- application surface aliases;
- account and user bridge claims;
- application `USED_BY` principal candidates;
- application `USES` model candidate only when directly exposed by the source;
- data-use indicators;
- browser coverage.

## Required certification

Supported browsers/versions, managed and unmanaged modes, extension permissions, incognito behavior, profile isolation, privacy leakage, resource impact, offline WAL, upgrade, policy latency, bypass behavior, and effect observation.

## Product caveats

The browser sensor can support “this covered profile used this AI web surface.” It cannot by itself support “the enterprise has exactly N users,” “this is the business owner,” or “this web product used model deployment D.”
