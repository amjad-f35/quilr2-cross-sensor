# Dependency and Call Graph

## Primary request flow

`Axum route → session/tenant extractor → authorization/validation → console or management service → read-only store/external adapter → v2 mapping/legacy serializer → AppError/response → API completion middleware`

## Activity-topic flow

`main → activity_topics::start → mirror + optional generation → schema verification/creation → Redis per-tenant lease → source adapters → fixed batches → provider classifier → validation/corrections → three ClickHouse derived tables → SQLite mirror → console read models`

## Frontend flow

`main.tsx → App providers → BrowserRouter → SessionBoundary → route tree/page → generated React Query hook → fetch → Axum v2 route → response cache/store → components`

## External dependencies

Cargo metadata resolves 50 direct crates including Axum/Tokio, ClickHouse, SQLx/rusqlite, Redis, Neo4j, OIDC/SAML/XMLSec, Azure, Reqwest, Utoipa, tracing, and cryptographic helpers. Frontend uses React, Router, TanStack Query, Zustand, Zod, charts, Vite/Vitest/Playwright, and `@quilrbusiness/kit`. Exact resolved transitive versions remain in lockfiles.
