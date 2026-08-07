#!/usr/bin/env node

// Executable semantic vectors for installed-product enrollment and renewal.
// JSON Schema deliberately checks only wire shape; acceptance must perform
// these cryptographic and replay checks with a vetted JOSE implementation.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  createHash,
  createPrivateKey,
  createPublicKey,
  sign,
  verify,
} from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const b64u = (value) => Buffer.from(value).toString('base64url')
const sha256Bytes = (value) => createHash('sha256').update(value).digest()
const sha256 = (value) => `sha256:${sha256Bytes(value).toString('hex')}`

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

function thumbprint(jwk) {
  const members = jwk.kty === 'OKP'
    ? { crv: jwk.crv, kty: jwk.kty, x: jwk.x }
    : { crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y }
  return sha256(canonical(members))
}

// RFC 8032 test-vector 1. The private seed exists only in this executable
// test; the production contract and database admit public members only.
const publicJwk = {
  kty: 'OKP',
  crv: 'Ed25519',
  x: '11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo',
}
const privateJwk = {
  ...publicJwk,
  d: b64u(Buffer.from('9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60', 'hex')),
}
const publicKey = createPublicKey({ key: publicJwk, format: 'jwk' })
const privateKey = createPrivateKey({ key: privateJwk, format: 'jwk' })
const keyThumbprint = thumbprint(publicJwk)
assert.equal(
  keyThumbprint,
  'sha256:90facafea9b1556698540f70c0117a22ea37bd5cf3ed3c47093c1707282b4b89',
  'RFC 7638 thumbprint must select and canonically order the required public members',
)

// Fixed, valid P-256 key material used only by this executable vector. This is
// a real curve point/private scalar, not the lexical A/B placeholder retained
// by the schema-shape fixtures.
const esPublicJwk = {
  kty: 'EC',
  crv: 'P-256',
  x: 'DBxkWaohkMulXUkhf47TEC9dnpLBtIzjOOGKlA_n8No',
  y: 'oNxz3eEAvq6CG9umo-OPbFC9eDzPqJGdYCLepxFQc3A',
}
const esPrivateJwk = {
  ...esPublicJwk,
  d: 'aitXd_GY5mIRFJhiSXWRzjKp8n_Fw6ajNOC2Yx_xbW8',
}
const esPublicKey = createPublicKey({ key: esPublicJwk, format: 'jwk' })
const esPrivateKey = createPrivateKey({ key: esPrivateJwk, format: 'jwk' })

const clone = (value) => JSON.parse(JSON.stringify(value))
const here = dirname(fileURLToPath(import.meta.url))
const fixture = (name) => JSON.parse(readFileSync(resolve(
  here,
  '../fixtures/installed-product',
  name,
), 'utf8'))

function signBytes(algorithm, privateSigningKey, bytes) {
  return algorithm === 'ES256'
    ? sign('sha256', bytes, { key: privateSigningKey, dsaEncoding: 'ieee-p1363' })
    : sign(null, bytes, privateSigningKey)
}

function verifyBytes(algorithm, publicVerificationKey, bytes, signature) {
  return algorithm === 'ES256'
    ? verify('sha256', bytes, {
      key: publicVerificationKey,
      dsaEncoding: 'ieee-p1363',
    }, signature)
    : verify(null, bytes, publicVerificationKey, signature)
}

function buildFullEnrollmentVector(name, algorithm, publicProofJwk, privateSigningKey, publicVerificationKey) {
  const request = fixture(name)
  const proof = request.installation_proof
  proof.algorithm = algorithm
  proof.public_jwk = publicProofJwk
  proof.key_thumbprint = thumbprint(publicProofJwk)

  // Digest authority and signature authority are deliberately different. The
  // digest omits both self-referential fields; the detached JWS signs the full
  // canonical request with the computed request_digest present and only the
  // detached signature omitted.
  delete proof.request_digest
  delete proof.detached_jws
  proof.request_digest = sha256(canonical(request))

  const protectedHeader = {
    alg: algorithm,
    b64: false,
    crit: ['b64'],
    kid: proof.key_thumbprint,
    typ: 'starliner-installation-proof+jws',
  }
  const protectedB64 = b64u(canonical(protectedHeader))
  const signedPayload = canonical(request)
  const signingInput = Buffer.concat([
    Buffer.from(`${protectedB64}.`, 'ascii'),
    Buffer.from(signedPayload, 'utf8'),
  ])
  const signature = signBytes(algorithm, privateSigningKey, signingInput)
  proof.detached_jws = `${protectedB64}..${b64u(signature)}`

  assert.equal(verifyBytes(algorithm, publicVerificationKey, signingInput, signature), true)
  assert.match(proof.detached_jws, /^[A-Za-z0-9_-]+\.\.[A-Za-z0-9_-]+$/)
  assert.ok(request.component_set.packages.length > 0)
  assert.ok(request.component_set.components.length > 0)
  assert.equal(request.component_set.source_profile, request.source_profile)

  const digestInput = clone(request)
  delete digestInput.installation_proof.request_digest
  delete digestInput.installation_proof.detached_jws
  assert.equal(proof.request_digest, sha256(canonical(digestInput)))

  const tampered = clone(request)
  tampered.display_name += ' tampered'
  delete tampered.installation_proof.detached_jws
  const tamperedInput = Buffer.concat([
    Buffer.from(`${protectedB64}.`, 'ascii'),
    Buffer.from(canonical(tampered), 'utf8'),
  ])
  assert.equal(
    verifyBytes(algorithm, publicVerificationKey, tamperedInput, signature),
    false,
    `${name} must reject a signed-field mutation`,
  )
  return request
}

const browserFullVector = buildFullEnrollmentVector(
  'browser-enrollment-request.valid.json',
  'ES256',
  esPublicJwk,
  esPrivateKey,
  esPublicKey,
)
const endpointFullVector = buildFullEnrollmentVector(
  'endpoint-enrollment-request.valid.json',
  'EdDSA',
  publicJwk,
  privateKey,
  publicKey,
)
assert.notEqual(browserFullVector.installation_proof.request_digest, endpointFullVector.installation_proof.request_digest)

const enrollmentPayload = canonical({
  api_version: 'starliner.control.enrollment-request.v1',
  bootstrap_id: '11111111-1111-4111-8111-111111111111',
  component_set_digest: `sha256:${'a'.repeat(64)}`,
  idempotency_key_digest: `sha256:${'b'.repeat(64)}`,
  installation_key_thumbprint: keyThumbprint,
  organization_tenant_id: '22222222-2222-4222-8222-222222222222',
  request_id: '33333333-3333-4333-8333-333333333333',
})
const detachedProtected = {
  alg: 'EdDSA',
  b64: false,
  crit: ['b64'],
  kid: keyThumbprint,
  typ: 'starliner-installation-proof+jws',
}
const detachedProtectedB64 = b64u(canonical(detachedProtected))
const detachedSigningInput = Buffer.concat([
  Buffer.from(`${detachedProtectedB64}.`, 'ascii'),
  Buffer.from(enrollmentPayload, 'utf8'),
])
const detachedSignature = sign(null, detachedSigningInput, privateKey)
const detachedJws = `${detachedProtectedB64}..${b64u(detachedSignature)}`
assert.match(detachedJws, /^[A-Za-z0-9_-]+\.\.[A-Za-z0-9_-]+$/)
assert.equal(verify(null, detachedSigningInput, publicKey, detachedSignature), true)
assert.equal(
  verify(
    null,
    Buffer.concat([
      Buffer.from(`${detachedProtectedB64}.`, 'ascii'),
      Buffer.from(`${enrollmentPayload} `, 'utf8'),
    ]),
    publicKey,
    detachedSignature,
  ),
  false,
  'a lexically valid detached JWS must reject a changed canonical payload',
)

const accessToken = 'fixture-only-dpop-access-token'
const htu = 'https://control.quilr.example/starliner/control/v1/producers/44444444-4444-4444-8444-444444444444/credentials:renew'
function normalizeHtu(raw) {
  const parsed = new URL(raw)
  assert.equal(parsed.protocol, 'https:')
  const defaultPort = parsed.port === '' || parsed.port === '443'
  return `https://${parsed.hostname.toLowerCase()}${defaultPort ? '' : `:${parsed.port}`}${parsed.pathname}`
}
assert.equal(
  normalizeHtu('HTTPS://CONTROL.QUILR.EXAMPLE:443/starliner/control/v1/producers/44444444-4444-4444-8444-444444444444/credentials:renew?ignored=yes#ignored'),
  htu,
  'DPoP htu authority must normalize scheme, host, effective port and path while omitting query and fragment',
)
const proofHeader = { alg: 'EdDSA', jwk: publicJwk, typ: 'dpop+jwt' }
const proofClaims = {
  ath: b64u(sha256Bytes(accessToken)),
  htm: 'POST',
  htu,
  iat: 1785945600,
  jti: '55555555-5555-4555-8555-555555555555',
  nonce: 'fixture-server-nonce-0001',
}
const proofInput = `${b64u(canonical(proofHeader))}.${b64u(canonical(proofClaims))}`
const proofSignature = sign(null, Buffer.from(proofInput, 'ascii'), privateKey)
const proofJwt = `${proofInput}.${b64u(proofSignature)}`
assert.equal(
  verify(null, Buffer.from(proofInput, 'ascii'), publicKey, proofSignature),
  true,
)
assert.equal(thumbprint(proofHeader.jwk), keyThumbprint)
assert.equal(proofHeader.typ, 'dpop+jwt')
assert.equal(proofClaims.htm, 'POST')
assert.equal(normalizeHtu(proofClaims.htu), htu)
assert.equal(proofClaims.ath, b64u(sha256Bytes(accessToken)))
assert.match(proofJwt, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)

const acceptedAt = proofClaims.iat + 30
assert.ok(proofClaims.iat >= acceptedAt - 300 && proofClaims.iat <= acceptedAt + 60)

const nonceLedger = new Map([[proofClaims.nonce, {
  credentialId: 'credential-1',
  htm: proofClaims.htm,
  htu: normalizeHtu(proofClaims.htu),
  state: 'issued',
}]])
const nonce = nonceLedger.get(proofClaims.nonce)
assert.deepEqual(
  { htm: nonce.htm, htu: nonce.htu, state: nonce.state },
  { htm: 'POST', htu, state: 'issued' },
)
nonce.state = 'consumed'
assert.equal(nonceLedger.get(proofClaims.nonce).state, 'consumed')
assert.throws(() => {
  if (nonceLedger.get(proofClaims.nonce).state !== 'issued') throw new Error('nonce_replayed')
}, /nonce_replayed/)

const replayLedger = new Set()
const replayKey = [
  'tenant-internal-1',
  keyThumbprint,
  proofClaims.jti,
].join('\u001f')
assert.equal(replayLedger.has(replayKey), false)
replayLedger.add(replayKey)
assert.equal(replayLedger.has(replayKey), true, 'second proof is a replay and must be rejected')

const renewalRequest = {
  previous_credential_id: 'credential-1',
  producer_id: '44444444-4444-4444-8444-444444444444',
  requested_generation: 2,
}
const requestDigest = sha256(canonical(renewalRequest))
const idempotencyKeyDigest = sha256('fixture-renewal-idempotency-key')
const renewalLedger = new Map()
const renewalKey = `${renewalRequest.producer_id}\u001f${idempotencyKeyDigest}`
renewalLedger.set(renewalKey, {
  requestDigest,
  credentialId: 'credential-2',
  effectDigest: sha256('credential-2-effect'),
})
assert.deepEqual(renewalLedger.get(renewalKey), {
  requestDigest,
  credentialId: 'credential-2',
  effectDigest: sha256('credential-2-effect'),
}, 'same idempotency key and request must replay the same credential effect')
assert.throws(() => {
  const existing = renewalLedger.get(renewalKey)
  const changedRequestDigest = sha256(canonical({ ...renewalRequest, requested_generation: 3 }))
  if (existing.requestDigest !== changedRequestDigest) throw new Error('idempotency_digest_conflict')
}, /idempotency_digest_conflict/)

assert.throws(
  () => createPublicKey({
    key: { ...publicJwk, x: b64u(Buffer.alloc(31)) },
    format: 'jwk',
  }),
  undefined,
  'base64url shape alone must not admit a wrong-length Ed25519 coordinate',
)

console.log('Installed-product crypto semantics passed: RFC7638, RFC7797/JCS, RFC9449 signature/binding/replay and negative vectors.')
