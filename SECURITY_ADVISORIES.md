# Dependency advisory assessment — October 22, 2026

Base: GitHub `main` commit `e068cdf1912130d133a163486b1d6d8058b223e9`. Exact resolutions come from `pnpm-lock.yaml`, not manifest ranges or package names. All production, development and optional lockfile paths were included in the advisory query.

The npm advisory response was independently checked against the full official [GitHub Advisory Database](https://github.com/github/advisory-database) JSON records and upstream notices linked below. All 161 distinct baseline GHSA IDs were retrieved, and their affected-version ranges checked against the exact locked versions. There were 176 package/range records; these counts are not 176 confirmed application vulnerabilities. Scanner severity totals can count multiple installed versions separately.

Each row distinguishes a version match from an exploitable application path. “Removed” means that particular baseline match no longer appears in the final lockfile scan; it does not establish that all vulnerabilities in the package or application are fixed. “Retained” is not a clean bill of health. Conditional or unproven paths require the stated prerequisites or additional investigation. No package-name match alone is labeled an exploit.

The only repository manifests/lockfiles present are `package.json` and `pnpm-lock.yaml` (format 9). No `composer.json`, `composer.lock`, npm lock/shrinkwrap, Yarn lock, Bun lock, PHP source, submodules or LFS pointers were found. None of the present manifests/lockfiles was unavailable to inspect. Runtime/deployment limits are recorded in [SECURITY_AUDIT.md](SECURITY_AUDIT.md).

## Exact baseline matches

### @babel/core

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-4x5r-pxfx-6jf8](https://github.com/advisories/GHSA-4x5r-pxfx-6jf8) — @babel/core: Arbitrary File Read via sourceMappingURL Comment | 7.28.4 | `<=7.29.0` / `>=7.29.6` | Retained version match | Build only; trusted source is transformed, with no API accepting Babel input/plugins/configuration. |

Example locked path: `. > @vitejs/plugin-react@5.0.4 > @babel/core@7.28.4 > @babel/helper-module-transforms@7.28.3 > @babel/core@7.28.4`.

### @smithy/config-resolver

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-6475-r3vj-m8vf](https://github.com/advisories/GHSA-6475-r3vj-m8vf) — AWS SDK for JavaScript v3 adopted defense in depth enhancement for region parameter value | 4.3.0 | `<4.4.0` / `>=4.4.0` | Retained version match | AWS clients are not imported by active server routes; upstream calls this a configuration safeguard, not a vulnerability fix. |

Example locked path: `. > @aws-sdk/client-s3@3.907.0 > @smithy/config-resolver@4.3.0`.

### @trpc/server

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-43p4-m455-4f4j](https://github.com/advisories/GHSA-43p4-m455-4f4j) — tRPC has possible prototype pollution in `experimental_nextAppDirCaller` | 11.6.0 | `>=11.0.0 <11.8.0` / `>=11.8.0` | Retained version match | Not reachable: only the Express adapter is mounted; experimental_nextAppDirCaller/experimental_caller is absent. |

Example locked path: `. > @trpc/server@11.6.0`.

### @vitest/mocker

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) — Vitest: Path Traversal / Arbitrary File Read via @vitest/mocker Redirect Mock | 2.1.9 | `>=2.1.0 <4.1.11` / `>=4.1.11` | Retained version match | No browser mocking/redirect-mock server is enabled by this Node-only test configuration. |
| [GHSA-qxg6-89mg-rqv8](https://github.com/advisories/GHSA-qxg6-89mg-rqv8) — Vitest: Code injection via unauthenticated manual mock registration | 2.1.9 | `>=2.1.0-beta.7 <4.1.12` / `>=4.1.12` | Retained version match | No browser mocking/redirect-mock server is enabled by this Node-only test configuration. |

Example locked path: `. > vitest@2.1.9 > @vitest/mocker@2.1.9`.

### axios

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-3p68-rc4w-qgx5](https://github.com/advisories/GHSA-3p68-rc4w-qgx5) — Axios has a NO_PROXY Hostname Normalization Bypass that Leads to SSRF | 1.12.2 | `>=1.0.0 <1.15.0` / `>=1.15.0` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-w9j2-pvgh-6h63](https://github.com/advisories/GHSA-w9j2-pvgh-6h63) — Axios: Authentication Bypass via Prototype Pollution Gadget in `validateStatus` Merge Strategy | 1.12.2 | `>=1.0.0 <1.15.1` / `>=1.15.1` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-pmwg-cvhr-8vh7](https://github.com/advisories/GHSA-pmwg-cvhr-8vh7) — Axios: Incomplete Fix for CVE-2025-62718 — NO_PROXY Protection Bypassed via RFC 1122 Loopback Subnet (127.0.0.0/8) in Axios 1.15.0 | 1.12.2 | `>=1.0.0 <1.15.1` / `>=1.15.1` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-3w6x-2g7m-8v23](https://github.com/advisories/GHSA-3w6x-2g7m-8v23) — Axios: Invisible JSON Response Tampering via Prototype Pollution Gadget in `parseReviver` | 1.12.2 | `>=1.0.0 <1.15.2` / `>=1.15.2` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-xhjh-pmcv-23jw](https://github.com/advisories/GHSA-xhjh-pmcv-23jw) — Axios: Null Byte Injection via Reverse-Encoding in AxiosURLSearchParams | 1.12.2 | `>=1.0.0 <1.15.1` / `>=1.15.1` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-445q-vr5w-6q77](https://github.com/advisories/GHSA-445q-vr5w-6q77) — Axios: CRLF Injection in multipart/form-data body via unsanitized blob.type in formDataToStream | 1.12.2 | `>=1.0.0 <1.15.1` / `>=1.15.1` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-m7pr-hjqh-92cm](https://github.com/advisories/GHSA-m7pr-hjqh-92cm) — Axios: no_proxy bypass via IP alias allows SSRF | 1.12.2 | `>=1.0.0 <1.15.1` / `>=1.15.1` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-5c9x-8gcm-mpgx](https://github.com/advisories/GHSA-5c9x-8gcm-mpgx) — Axios' HTTP adapter-streamed uploads bypass maxBodyLength when maxRedirects: 0 | 1.12.2 | `>=1.0.0 <1.15.1` / `>=1.15.1` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-vf2m-468p-8v99](https://github.com/advisories/GHSA-vf2m-468p-8v99) — Axios: HTTP adapter streamed responses bypass maxContentLength | 1.12.2 | `>=1.0.0 <1.15.1` / `>=1.15.1` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-pf86-5x62-jrwf](https://github.com/advisories/GHSA-pf86-5x62-jrwf) — Axios: Prototype Pollution Gadgets - Response Tampering, Data Exfiltration, and Request Hijacking | 1.12.2 | `>=1.0.0 <1.15.1` / `>=1.15.1` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-6chq-wfr3-2hj9](https://github.com/advisories/GHSA-6chq-wfr3-2hj9) — Axios: Header Injection via Prototype Pollution | 1.12.2 | `>=1.0.0 <1.15.1` / `>=1.15.1` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-xx6v-rp6x-q39c](https://github.com/advisories/GHSA-xx6v-rp6x-q39c) — Axios: XSRF Token Cross-Origin Leakage via Prototype Pollution Gadget in `withXSRFToken` Boolean Coercion | 1.12.2 | `>=1.0.0 <1.15.1` / `>=1.15.1` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-43fc-jf86-j433](https://github.com/advisories/GHSA-43fc-jf86-j433) — Axios is Vulnerable to Denial of Service via __proto__ Key in mergeConfig | 1.12.2 | `>=1.0.0 <=1.13.4` / `>=1.13.5` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-q8qp-cvcw-x6jj](https://github.com/advisories/GHSA-q8qp-cvcw-x6jj) — Axios has prototype pollution read-side gadgets in HTTP adapter that allow credential injection and request hijacking | 1.12.2 | `>=1.0.0 <1.15.2` / `>=1.15.2` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-fvcv-3m26-pcqx](https://github.com/advisories/GHSA-fvcv-3m26-pcqx) — Axios has Unrestricted Cloud Metadata Exfiltration via Header Injection Chain | 1.12.2 | `>=1.0.0 <1.15.0` / `>=1.15.0` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-62hf-57xw-28j9](https://github.com/advisories/GHSA-62hf-57xw-28j9) — Axios: unbounded recursion in toFormData causes DoS via deeply nested request data | 1.12.2 | `>=1.0.0 <1.15.1` / `>=1.15.1` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-hfxv-24rg-xrqf](https://github.com/advisories/GHSA-hfxv-24rg-xrqf) — Axios: Regular Expression Denial of Service (ReDoS) via Cookie Name Injection | 1.12.2 | `>=1.0.0 <1.16.0` / `>=1.16.0` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-777c-7fjr-54vf](https://github.com/advisories/GHSA-777c-7fjr-54vf) — Allocation of Resources Without Limits or Throttling in Axios | 1.12.2 | `>=1.7.0 <1.16.0` / `>=1.16.0` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-p92q-9vqr-4j8v](https://github.com/advisories/GHSA-p92q-9vqr-4j8v) — Axios: Proxy-Authorization Credential Leak to Origin Server Across HTTP-to-HTTPS Redirect in Axios Node.js HTTP Adapter | 1.12.2 | `>=1.0.0 <1.16.0` / `>=1.16.0` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-j5f8-grm9-p9fc](https://github.com/advisories/GHSA-j5f8-grm9-p9fc) — Axios: Proxy-Authorization header leaks to redirect target when proxy is re-evaluated to direct connection | 1.12.2 | `>=1.0.0 <1.16.0` / `>=1.16.0` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-3g43-6gmg-66jw](https://github.com/advisories/GHSA-3g43-6gmg-66jw) — axios Vulnerable to Credential Theft and Response Hijacking via Prototype Pollution Gadget in Config Merge | 1.12.2 | `>=1.0.0 <1.15.2` / `>=1.15.2` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-35jp-ww65-95wh](https://github.com/advisories/GHSA-35jp-ww65-95wh) — axios Vulnerable to Full Man-in-the-Middle via Prototype Pollution Gadget in `config.proxy` | 1.12.2 | `>=1.0.0 <1.16.0` / `>=1.16.0` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-898c-q2cr-xwhg](https://github.com/advisories/GHSA-898c-q2cr-xwhg) — axios has DoS & Header Injection via Prototype Pollution Read-Side Gadgets in axios merge functions | 1.12.2 | `>=1.0.0 <1.16.0` / `>=1.16.0` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-mmx7-hfxf-jppx](https://github.com/advisories/GHSA-mmx7-hfxf-jppx) — Axios: Prototype pollution gadgets can alter axios request construction | 1.12.2 | `>=1.0.0 <1.18.0` / `>=1.18.0` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-pmv8-rq9r-6j72](https://github.com/advisories/GHSA-pmv8-rq9r-6j72) — Axios: Deep formToJSON Key Recursion Can Cause Denial of Service | 1.12.2 | `>=1.0.0 <1.18.0` / `>=1.18.0` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-7q8q-rj6j-mhjq](https://github.com/advisories/GHSA-7q8q-rj6j-mhjq) — Axios: Nested axios option objects can consume polluted prototype values | 1.12.2 | `>=1.0.0 <1.18.0` / `>=1.18.0` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-jqh4-m9w3-8hp9](https://github.com/advisories/GHSA-jqh4-m9w3-8hp9) — Axios: Fetch adapter `ReadableStream` uploads bypass `maxBodyLength` | 1.12.2 | `>=1.7.0 <1.18.0` / `>=1.18.0` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-42h9-826w-cgv3](https://github.com/advisories/GHSA-42h9-826w-cgv3) — Axios: Excessive recursion in formDataToJSON can cause denial of service | 1.12.2 | `>=1.0.0 <1.18.0` / `>=1.18.0` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-vh66-26gq-q6x8](https://github.com/advisories/GHSA-vh66-26gq-q6x8) — Axios: Prototype pollution gadget in fetch adapter can alter outbound requests | 1.12.2 | `>=1.7.0 <1.20.0` / `>=1.20.0` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-9fr6-4gfg-395g](https://github.com/advisories/GHSA-9fr6-4gfg-395g) — Axios: Prototype-Pollution Gadget in the Default Instance Allows Inherited Object.prototype.method to Override HTTP Method | 1.12.2 | `>=1.0.0 <1.20.0` / `>=1.20.0` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-j8rh-479h-cp32](https://github.com/advisories/GHSA-j8rh-479h-cp32) — Axios: Header Injection via Inherited headers After Minimal Interceptor | 1.12.2 | `>=1.0.0 <1.20.0` / `>=1.20.0` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |
| [GHSA-4hqw-qxg8-jxx2](https://github.com/advisories/GHSA-4hqw-qxg8-jxx2) — Axios: Fetch Adapter Header Injection via Inherited FormData getHeaders | 1.12.2 | `>=1.12.0 <1.20.0` / `>=1.20.0` | Retained version match | Only legacy OAuth SDK calls Axios, with fixed endpoint paths and server-configured baseURL. No request-controlled config/URLs or prototype-pollution source found. Callback now disabled; no app exploit demonstrated. |

Example locked path: `. > axios@1.12.2`.

### baseline-browser-mapping

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-w5vr-8v7q-w6rv](https://github.com/advisories/GHSA-w5vr-8v7q-w6rv) — baseline-browser-mapping process termination on invalid input causes denial of service | 2.8.12 | `>=2.0.0 <2.11.0` / `>=2.11.0` | Retained version match | Build-time browser metadata lookup; attacker-controlled runtime query path not found. |

Example locked path: `. > autoprefixer@10.4.21 > browserslist@4.26.3 > baseline-browser-mapping@2.8.12`.

### body-parser

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-v422-hmwv-36x6](https://github.com/advisories/GHSA-v422-hmwv-36x6) — body-parser vulnerable to denial of service when invalid limit value silently disables size enforcement | 1.20.3 | `<1.20.6` / `>=1.20.6` | Baseline match removed | The configured JSON limit is a valid fixed 150mb value, not attacker-selected. URL-encoded parser removed; Express update removes old match. |

Example locked path: `. > express@4.21.2 > body-parser@1.20.3`.

### browserslist

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-c83g-rgw3-j3cx](https://github.com/advisories/GHSA-c83g-rgw3-j3cx) — Browserslist: Unbounded memory growth (no cache eviction) via distinct query results, leading to eventual OOM | 4.26.3 | `<=4.28.6` / `>=4.28.7` | Retained version match | Build targets/configuration are trusted; request input does not become a Browserslist query. |
| [GHSA-73wf-gq98-2v4g](https://github.com/advisories/GHSA-73wf-gq98-2v4g) — Browserslist: Uncaught crash / prototype write via untrusted browserslist-stats.json custom stats (normalizeStats) | 4.26.3 | `<=4.28.6` / `>=4.28.7` | Retained version match | Build targets/configuration are trusted; request input does not become a Browserslist query. |

Example locked path: `. > autoprefixer@10.4.21 > browserslist@4.26.3 > update-browserslist-db@1.1.3 > browserslist@4.26.3`.

### dompurify

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-v2wj-7wpq-c8vv](https://github.com/advisories/GHSA-v2wj-7wpq-c8vv) — DOMPurify contains a Cross-site Scripting vulnerability | 3.3.0 | `>=3.1.3 <=3.3.1` / `>=3.3.2` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-h7mw-gpvr-xq4m](https://github.com/advisories/GHSA-h7mw-gpvr-xq4m) — DOMPurify: FORBID_TAGS bypassed by function-based ADD_TAGS predicate (asymmetry with FORBID_ATTR fix) | 3.3.0 | `<3.4.0` / `>=3.4.0` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-crv5-9vww-q3g8](https://github.com/advisories/GHSA-crv5-9vww-q3g8) — DOMPurify has a SAFE_FOR_TEMPLATES bypass in RETURN_DOM mode | 3.3.0 | `>=1.0.10 <3.4.0` / `>=3.4.0` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-v9jr-rg53-9pgp](https://github.com/advisories/GHSA-v9jr-rg53-9pgp) — DOMPurify: Prototype Pollution to XSS Bypass via CUSTOM_ELEMENT_HANDLING Fallback | 3.3.0 | `>=3.0.1 <3.4.0` / `>=3.4.0` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-hpcv-96wg-7vj8](https://github.com/advisories/GHSA-hpcv-96wg-7vj8) — DOMPurify: Cross-realm IN_PLACE sanitization leaves executable markup intact via realm-bound `instanceof` checks | 3.3.0 | `<=3.4.5` / `>=3.4.6` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-r47g-fvhr-h676](https://github.com/advisories/GHSA-r47g-fvhr-h676) — DOMPurify: IN_PLACE mode preserves attributes of a clobbered root element, allowing XSS via attacker-controlled root DOM | 3.3.0 | `<=3.4.5` / `>=3.4.6` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-rp9w-3fw7-7cwq](https://github.com/advisories/GHSA-rp9w-3fw7-7cwq) — DOMPurify IN_PLACE Sanitization Bypass via Attached Shadow Root Inside <template>.content | 3.3.0 | `<=3.4.6` / `>=3.4.7` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-cmwh-pvxp-8882](https://github.com/advisories/GHSA-cmwh-pvxp-8882) — DOMPurify: Permanent `ALLOWED_ATTR` pollution via `setConfig()` bypassing the hook clone-guard (incomplete fix of the 3.4.7 hook-pollution patch) | 3.3.0 | `<=3.4.10` / `>=3.4.11` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-vxr8-fq34-vvx9](https://github.com/advisories/GHSA-vxr8-fq34-vvx9) — DOMPurify: Trusted Types policy survives `clearConfig()` and can poison later `RETURN_TRUSTED_TYPE` output | 3.3.0 | `<3.4.9` / `>=3.4.9` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-gvmj-g25r-r7wr](https://github.com/advisories/GHSA-gvmj-g25r-r7wr) — DOMPurify: SAFE_FOR_TEMPLATES bypass - template expressions survive sanitization inside <template> content when using DOM output modes | 3.3.0 | `>=3.0.0 <=3.4.7` / `>=3.4.8` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-x4vx-rjvf-j5p4](https://github.com/advisories/GHSA-x4vx-rjvf-j5p4) — DOMPurify: `IN_PLACE` mode trusts attacker-controlled `nodeName` on live non-form nodes, allowing script retention and XSS via attacker-supplied DOM objects | 3.3.0 | `<=3.4.6` / `<0.0.0` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-76mc-f452-cxcm](https://github.com/advisories/GHSA-76mc-f452-cxcm) — DOMPurify: Hook mutation of `data.allowedTags` / `data.allowedAttributes` permanently pollutes `DEFAULT_ALLOWED_TAGS` / `DEFAULT_ALLOWED_ATTR` | 3.3.0 | `<3.4.7` / `>=3.4.7` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-39q2-94rc-95cp](https://github.com/advisories/GHSA-39q2-94rc-95cp) — DOMPurify's ADD_TAGS function form bypasses FORBID_TAGS due to short-circuit evaluation | 3.3.0 | `<=3.3.3` / `>=3.4.0` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-cjmm-f4jc-qw8r](https://github.com/advisories/GHSA-cjmm-f4jc-qw8r) — DOMPurify ADD_ATTR predicate skips URI validation | 3.3.0 | `<=3.3.1` / `>=3.3.2` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-cj63-jhhr-wcxv](https://github.com/advisories/GHSA-cj63-jhhr-wcxv) — DOMPurify USE_PROFILES prototype pollution allows event handlers | 3.3.0 | `<=3.3.1` / `>=3.3.2` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-h8r8-wccr-v5f2](https://github.com/advisories/GHSA-h8r8-wccr-v5f2) — DOMPurify is vulnerable to mutation-XSS via Re-Contextualization  | 3.3.0 | `<3.3.2` / `>=3.3.2` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-55q2-fjhq-7xh7](https://github.com/advisories/GHSA-55q2-fjhq-7xh7) — DOMPurify: IN_PLACE hook removal leaves a detached subtree executable, causing XSS | 3.3.0 | `<=3.4.12` / `>=3.4.13` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-c2j3-45gr-mqc4](https://github.com/advisories/GHSA-c2j3-45gr-mqc4) — DOMPurify: `CUSTOM_ELEMENT_HANDLING` bypasses `afterSanitizeElements` for allowed custom elements. | 3.3.0 | `<=3.4.11` / `>=3.4.12` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-6688-9rhm-gjv2](https://github.com/advisories/GHSA-6688-9rhm-gjv2) — DOMPurify: IN_PLACE returns a force-removed rawtext root whose text carries attacker markup — pure HTML reparse executes | 3.3.0 | `<=3.4.15` / `>=3.4.16` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-mrv2-3pqr-j5jr](https://github.com/advisories/GHSA-mrv2-3pqr-j5jr) — DOMPurify IN_PLACE: hook that removes a parent or sibling leaves the detached subtree's event handlers armed (incomplete fix for GHSA-p98j-92pf-mc4p) | 3.3.0 | `<=3.4.16` / `>=3.4.17` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |
| [GHSA-c6gr-qvv4-5v3f](https://github.com/advisories/GHSA-c6gr-qvv4-5v3f) — DOMPurify: SMIL attributeName=href guard is skipped when PARSER_MEDIA_TYPE is application/xhtml+xml | 3.3.0 | `<=3.4.16` / `>=3.4.17` | Retained version match | Unused Streamdown/Mermaid subtree of AIChatBox; no current route imports it. Version affected, no application XSS demonstrated. |

Example locked path: `. > streamdown@1.4.0 > mermaid@11.12.0 > dompurify@3.3.0`.

### drizzle-orm

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-gpj5-g38j-94v9](https://github.com/advisories/GHSA-gpj5-g38j-94v9) — Drizzle ORM has SQL injection via improperly escaped SQL identifiers | 0.44.6 | `<0.45.2` / `>=0.45.2` | Retained version match | Not reachable under current queries: schema identifiers and aliases are static; request values use parameters. No sql.identifier/alias from input. |

Example locked path: `. > drizzle-orm@0.44.6`.

### esbuild

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99) — esbuild enables any website to send any requests to the development server and read the response | 0.18.20, 0.21.5 | `<=0.24.2` / `>=0.25.0` | Retained version match | Development tooling only; neither Drizzle Kit nor Vitest calls the affected esbuild serve API in the shipped app. |

Example locked path: `. > vitest@2.1.9 > vite@5.4.20 > esbuild@0.21.5`.

### fast-xml-parser

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-37qj-frw5-hhjh](https://github.com/advisories/GHSA-37qj-frw5-hhjh) — fast-xml-parser has RangeError DoS Numeric Entities Bug | 5.2.5 | `>=5.0.9 <=5.3.3` / `>=5.3.4` | Retained version match | AWS SDK XML handling is unused; active uploads do not invoke an XML parser. |
| [GHSA-m7jm-9gc2-mpf2](https://github.com/advisories/GHSA-m7jm-9gc2-mpf2) — fast-xml-parser has an entity encoding bypass via regex injection in DOCTYPE entity names | 5.2.5 | `>=5.0.0 <5.3.5` / `>=5.3.5` | Retained version match | AWS SDK XML handling is unused; active uploads do not invoke an XML parser. |
| [GHSA-jmr7-xgp7-cmfj](https://github.com/advisories/GHSA-jmr7-xgp7-cmfj) — fast-xml-parser affected by DoS through entity expansion in DOCTYPE (no expansion limit) | 5.2.5 | `>=5.0.0 <5.3.6` / `>=5.3.6` | Retained version match | AWS SDK XML handling is unused; active uploads do not invoke an XML parser. |
| [GHSA-fj3w-jwp8-x2g3](https://github.com/advisories/GHSA-fj3w-jwp8-x2g3) — fast-xml-parser has stack overflow in XMLBuilder with preserveOrder | 5.2.5 | `>=5.0.0 <5.3.8` / `>=5.3.8` | Retained version match | AWS SDK XML handling is unused; active uploads do not invoke an XML parser. |
| [GHSA-8gc5-j5rx-235r](https://github.com/advisories/GHSA-8gc5-j5rx-235r) — fast-xml-parser affected by numeric entity expansion bypassing all entity expansion limits (incomplete fix for CVE-2026-26278) | 5.2.5 | `>=5.0.0 <5.5.6` / `>=5.5.6` | Retained version match | AWS SDK XML handling is unused; active uploads do not invoke an XML parser. |
| [GHSA-jp2q-39xq-3w4g](https://github.com/advisories/GHSA-jp2q-39xq-3w4g) — Entity Expansion Limits Bypassed When Set to Zero Due to JavaScript Falsy Evaluation in fast-xml-parser | 5.2.5 | `>=5.0.0 <5.5.7` / `>=5.5.7` | Retained version match | AWS SDK XML handling is unused; active uploads do not invoke an XML parser. |
| [GHSA-gh4j-gqv2-49f6](https://github.com/advisories/GHSA-gh4j-gqv2-49f6) — fast-xml-parser XMLBuilder: XML Comment and CDATA Injection via Unescaped Delimiters | 5.2.5 | `<5.7.0` / `>=5.7.0` | Retained version match | AWS SDK XML handling is unused; active uploads do not invoke an XML parser. |

Example locked path: `. > @aws-sdk/client-s3@3.907.0 > @aws-sdk/xml-builder@3.901.0 > fast-xml-parser@5.2.5`.

### follow-redirects

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-r4q5-vmmm-2653](https://github.com/advisories/GHSA-r4q5-vmmm-2653) — follow-redirects leaks Custom Authentication Headers to Cross-Domain Redirect Targets | 1.15.11 | `<=1.15.11` / `>=1.16.0` | Retained version match | Only legacy OAuth SDK uses Axios. Default target is local; external OAuth callback is now disabled. Hostile redirects are not an active upload path. |

Example locked path: `. > axios@1.12.2 > follow-redirects@1.15.11`.

### form-data

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-hmw2-7cc7-3qxx](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx) — form-data: CRLF injection in form-data via unescaped multipart field names and filenames | 4.0.4 | `>=4.0.0 <4.0.6` / `>=4.0.6` | Retained version match | No active Axios multipart uploads. Audio/images use JSON base64 and native fetch, not form-data field/filename construction. |

Example locked path: `. > axios@1.12.2 > form-data@4.0.4`.

### katex

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-238p-pmpm-9mq7](https://github.com/advisories/GHSA-238p-pmpm-9mq7) — KaTeX: Existing prototype pollution can bypass trust restrictions | 0.16.25 | `>=0.11.0 <0.18.2` / `>=0.18.2` | Retained version match | Unused Streamdown subtree; clinical output uses escaped React text, not KaTeX rendering. |

Example locked path: `. > streamdown@1.4.0 > katex@0.16.25`.

### lodash

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-r5fr-rjxr-66jc](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) — lodash vulnerable to Code Injection via `_.template` imports key names | 4.17.21 | `>=4.0.0 <=4.17.23` / `>=4.18.0` | Retained version match | No request-controlled template, merge target or property path found in application calls. Version affected; exploitable call path unproven. |
| [GHSA-f23m-r3pf-42rh](https://github.com/advisories/GHSA-f23m-r3pf-42rh) — lodash vulnerable to Prototype Pollution via array path bypass in `_.unset` and `_.omit` | 4.17.21 | `<=4.17.23` / `>=4.18.0` | Retained version match | No request-controlled template, merge target or property path found in application calls. Version affected; exploitable call path unproven. |
| [GHSA-xxjr-mmjv-4gpg](https://github.com/advisories/GHSA-xxjr-mmjv-4gpg) — Lodash has Prototype Pollution Vulnerability in `_.unset` and `_.omit` functions | 4.17.21 | `>=4.0.0 <=4.17.22` / `>=4.17.23` | Retained version match | No request-controlled template, merge target or property path found in application calls. Version affected; exploitable call path unproven. |

Example locked path: `. > recharts@2.15.4 > lodash@4.17.21`.

### lodash-es

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-r5fr-rjxr-66jc](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) — lodash vulnerable to Code Injection via `_.template` imports key names | 4.17.21 | `>=4.0.0 <=4.17.23` / `>=4.18.0` | Retained version match | No request-controlled template, merge target or property path found in application calls. Version affected; exploitable call path unproven. |
| [GHSA-f23m-r3pf-42rh](https://github.com/advisories/GHSA-f23m-r3pf-42rh) — lodash vulnerable to Prototype Pollution via array path bypass in `_.unset` and `_.omit` | 4.17.21 | `<=4.17.23` / `>=4.18.0` | Retained version match | No request-controlled template, merge target or property path found in application calls. Version affected; exploitable call path unproven. |
| [GHSA-xxjr-mmjv-4gpg](https://github.com/advisories/GHSA-xxjr-mmjv-4gpg) — Lodash has Prototype Pollution Vulnerability in `_.unset` and `_.omit` functions | 4.17.21 | `>=4.0.0 <=4.17.22` / `>=4.17.23` | Retained version match | No request-controlled template, merge target or property path found in application calls. Version affected; exploitable call path unproven. |

Example locked path: `. > streamdown@1.4.0 > mermaid@11.12.0 > lodash-es@4.17.21`.

### mdast-util-to-hast

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-4fh9-h7wg-q85m](https://github.com/advisories/GHSA-4fh9-h7wg-q85m) — mdast-util-to-hast has unsanitized class attribute | 13.2.0 | `>=13.0.0 <13.2.1` / `>=13.2.1` | Retained version match | Unused Streamdown/AIChatBox dependency; no route imports AIChatBox. No active renderer exposure found. |

Example locked path: `. > streamdown@1.4.0 > react-markdown@10.1.0 > mdast-util-to-hast@13.2.0`.

### mermaid

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-ghcm-xqfw-q4vr](https://github.com/advisories/GHSA-ghcm-xqfw-q4vr) — Mermaid: Improper sanitization of `classDef` in state diagrams leads to HTML injection | 11.12.0 | `>=11.0.0-alpha.1 <=11.14.0` / `>=11.15.0` | Retained version match | Only reached through unused Streamdown/AIChatBox; no diagram rendering route in the built application. |
| [GHSA-xcj9-5m2h-648r](https://github.com/advisories/GHSA-xcj9-5m2h-648r) — Mermaid: Improper sanitization of `classDefs` in diagrams leads to CSS injection | 11.12.0 | `>=11.0.0-alpha.1 <=11.14.0` / `>=11.15.0` | Retained version match | Only reached through unused Streamdown/AIChatBox; no diagram rendering route in the built application. |
| [GHSA-6m6c-36f7-fhxh](https://github.com/advisories/GHSA-6m6c-36f7-fhxh) — Mermaid Gantt Charts are vulnerable to an Infinite Loop DoS | 11.12.0 | `>=11.0.0-alpha.1 <=11.14.0` / `>=11.15.0` | Retained version match | Only reached through unused Streamdown/AIChatBox; no diagram rendering route in the built application. |
| [GHSA-87f9-hvmw-gh4p](https://github.com/advisories/GHSA-87f9-hvmw-gh4p) — Mermaid: Improper sanitization of configuration leads to CSS injection | 11.12.0 | `>=11.0.0-alpha.1 <=11.14.0` / `>=11.15.0` | Retained version match | Only reached through unused Streamdown/AIChatBox; no diagram rendering route in the built application. |
| [GHSA-c4c3-pg64-4m4v](https://github.com/advisories/GHSA-c4c3-pg64-4m4v) — Mermaid configuration APIs allow prototype pollution | 11.12.0 | `>=11.0.0-alpha.1 <11.16.1` / `>=11.16.1` | Retained version match | Only reached through unused Streamdown/AIChatBox; no diagram rendering route in the built application. |
| [GHSA-6x64-9x62-f2gx](https://github.com/advisories/GHSA-6x64-9x62-f2gx) — Mermaid allows CSS injection applying to sibling elements of the diagram | 11.12.0 | `>=11.0.0-alpha.1 <11.16.1` / `>=11.16.1` | Retained version match | Only reached through unused Streamdown/AIChatBox; no diagram rendering route in the built application. |
| [GHSA-3rrr-jr9j-h3q3](https://github.com/advisories/GHSA-3rrr-jr9j-h3q3) — Mermaid Architecture diagrams are vulnerable to prototype pollution | 11.12.0 | `>=11.5.0 <11.16.1` / `>=11.16.1` | Retained version match | Only reached through unused Streamdown/AIChatBox; no diagram rendering route in the built application. |
| [GHSA-2v8p-3f2j-5mp7](https://github.com/advisories/GHSA-2v8p-3f2j-5mp7) — Mermaid XY Charts are vulnerable to an infinite loop DoS | 11.12.0 | `>=11.0.0-alpha.1 <11.16.1` / `>=11.16.1` | Retained version match | Only reached through unused Streamdown/AIChatBox; no diagram rendering route in the built application. |
| [GHSA-rhh3-jpg6-66xh](https://github.com/advisories/GHSA-rhh3-jpg6-66xh) — Mermaid radar diagrams are vulnerable to DoS | 11.12.0 | `>=11.6.0 <11.16.1` / `>=11.16.1` | Retained version match | Only reached through unused Streamdown/AIChatBox; no diagram rendering route in the built application. |

Example locked path: `. > streamdown@1.4.0 > mermaid@11.12.0`.

### mysql2

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-3f6p-5ww8-9rcr](https://github.com/advisories/GHSA-3f6p-5ww8-9rcr) — MySQL2: Auth Plugin Downgrade to mysql_clear_password Leaks Plaintext Credentials | 3.15.1 | `<3.22.0` / `>=3.22.0` | Baseline match removed | Reachable in optional non-TLS MySQL connections if a rogue/MITM server requests cleartext authentication. SQLite is unaffected. Compatible security patch applied. |
| [GHSA-rgwj-5xj2-c3m3](https://github.com/advisories/GHSA-rgwj-5xj2-c3m3) — MySQL2: Unbounded zlib inflate in compressed MySQL protocol handler allows decompression-bomb DoS | 3.15.1 | `<=3.23.0` / `>=3.23.1` | Baseline match removed | Requires compress=true and a malicious/MITM MySQL server. Default Compose URL does not enable compression. Patched for optional custom configurations. |

Example locked path: `. > mysql2@3.15.1`.

### nanoid

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) — nanoid: non-secure generators can loop indefinitely with negative size | 5.1.6 | `>=4.0.0 <5.1.16` / `>=5.1.16` | Retained version match | Application calls nanoid() without attacker-controlled size, RNG, alphabet or custom generator. Other instances are tooling dependencies. |
| [GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) — nanoid: non-secure generators can loop indefinitely with negative size | 3.3.11 | `<3.3.16` / `>=3.3.16` | Retained version match | Application calls nanoid() without attacker-controlled size, RNG, alphabet or custom generator. Other instances are tooling dependencies. |
| [GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8) — nanoid: custom generators can loop indefinitely when size is zero | 3.3.11 | `<3.3.18` / `>=3.3.18` | Retained version match | Application calls nanoid() without attacker-controlled size, RNG, alphabet or custom generator. Other instances are tooling dependencies. |
| [GHSA-xwg4-73v4-xw9w](https://github.com/advisories/GHSA-xwg4-73v4-xw9w) — nanoid: Integer Overflow or Wraparound | 5.1.6 | `>=4.0.0 <5.1.11` / `>=5.1.11` | Retained version match | Application calls nanoid() without attacker-controlled size, RNG, alphabet or custom generator. Other instances are tooling dependencies. |
| [GHSA-xwg4-73v4-xw9w](https://github.com/advisories/GHSA-xwg4-73v4-xw9w) — nanoid: Integer Overflow or Wraparound | 3.3.11 | `<3.3.12` / `>=3.3.12` | Retained version match | Application calls nanoid() without attacker-controlled size, RNG, alphabet or custom generator. Other instances are tooling dependencies. |

Example locked path: `. > nanoid@5.1.6`.

### path-to-regexp

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-37ch-88jc-xwx2](https://github.com/advisories/GHSA-37ch-88jc-xwx2) — path-to-regexp vulnerable to Regular Expression Denial of Service via multiple route parameters | 0.1.12 | `<0.1.13` / `>=0.1.13` | Baseline match removed | Static/simple application routes; hostile dynamic route definitions were not found. Compatible Express update removes the match. |

Example locked path: `. > express@4.21.2 > path-to-regexp@0.1.12`.

### picomatch

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-3v7f-55p6-f55p](https://github.com/advisories/GHSA-3v7f-55p6-f55p) — Picomatch: Method Injection in POSIX Character Classes causes incorrect Glob Matching | 4.0.3 | `>=4.0.0 <4.0.4` / `>=4.0.4` | Retained version match | Build/test globs are fixed in source; HTTP input is not used as a glob pattern. |
| [GHSA-c2c7-rcm5-vvqj](https://github.com/advisories/GHSA-c2c7-rcm5-vvqj) — Picomatch has a ReDoS vulnerability via extglob quantifiers | 4.0.3 | `>=4.0.0 <4.0.4` / `>=4.0.4` | Retained version match | Build/test globs are fixed in source; HTTP input is not used as a glob pattern. |

Example locked path: `. > vite@7.1.9 > picomatch@4.0.3`.

### pnpm

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-379q-355j-w6rj](https://github.com/advisories/GHSA-379q-355j-w6rj) — pnpm v10+ Bypass "Dependency lifecycle scripts execution disabled by default" | 10.18.0 | `>=10.0.0 <10.26.0` / `>=10.26.0` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-7vhp-vf5g-r2fw](https://github.com/advisories/GHSA-7vhp-vf5g-r2fw) — pnpm Has Lockfile Integrity Bypass that Allows Remote Dynamic Dependencies | 10.18.0 | `<10.26.0` / `>=10.26.0` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-v253-rj99-jwpq](https://github.com/advisories/GHSA-v253-rj99-jwpq) — pnpm has Path Traversal via arbitrary file permission modification  | 10.18.0 | `<10.28.2` / `>=10.28.2` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-6pfh-p556-v868](https://github.com/advisories/GHSA-6pfh-p556-v868) — pnpm: Binary ZIP extraction allows arbitrary file write via path traversal (Zip Slip) | 10.18.0 | `<10.28.1` / `>=10.28.1` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-6x96-7vc8-cm3p](https://github.com/advisories/GHSA-6x96-7vc8-cm3p) — pnpm has Windows-specific tarball Path Traversal | 10.18.0 | `<10.28.1` / `>=10.28.1` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-xpqm-wm3m-f34h](https://github.com/advisories/GHSA-xpqm-wm3m-f34h) — pnpm scoped bin name Path Traversal allows arbitrary file creation outside node_modules/.bin | 10.18.0 | `<10.28.1` / `>=10.28.1` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-m733-5w8f-5ggw](https://github.com/advisories/GHSA-m733-5w8f-5ggw) — pnpm has symlink traversal in file:/git dependencies | 10.18.0 | `<10.28.2` / `>=10.28.2` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-2phv-j68v-wwqx](https://github.com/advisories/GHSA-2phv-j68v-wwqx) — pnpm vulnerable to Command Injection via environment variable substitution | 10.18.0 | `>=6.25.0 <10.27.0` / `>=10.27.0` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-hg3w-7f8c-63hp](https://github.com/advisories/GHSA-hg3w-7f8c-63hp) — pnpm: Tarball hash of GitHub git dependencies is not stored in lockfile | 10.18.0 | `<10.33.4` / `>=10.33.4` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-rxhj-4m44-96r4](https://github.com/advisories/GHSA-rxhj-4m44-96r4) — pnpm Vulnerable to Arbitrary File Write/Delete via Malicious Patch File (Path Traversal) | 10.18.0 | `<10.34.0` / `>=10.34.0` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-cjhr-43r9-cfmw](https://github.com/advisories/GHSA-cjhr-43r9-cfmw) — pnpm binds unscoped user-level npm auth credentials to a repository-selected registry | 10.18.0 | `<10.34.0` / `>=10.34.0` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-hwx4-2j3j-g496](https://github.com/advisories/GHSA-hwx4-2j3j-g496) — pnpm: Transitive dependency alias path traversal allows project path override via symlink replacement | 10.18.0 | `<10.34.0` / `>=10.34.0` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-p4xf-rf54-rj3x](https://github.com/advisories/GHSA-p4xf-rf54-rj3x) — pnpm: Git Fetch Argument Injection via Lockfile resolution.commit | 10.18.0 | `<10.34.0` / `>=10.34.0` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-q6j5-fjx5-2mc3](https://github.com/advisories/GHSA-q6j5-fjx5-2mc3) — pnpm Has an Integrity Check Bypass via Missing Lockfile Integrity Field | 10.18.0 | `<10.34.1` / `>=10.34.1` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-54hh-g5mx-jqcp](https://github.com/advisories/GHSA-54hh-g5mx-jqcp) — pnpm: Unsafe default behavior breaks integrity check | 10.18.0 | `<10.34.0` / `>=10.34.0` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-5wx6-mg75-v57r](https://github.com/advisories/GHSA-5wx6-mg75-v57r) — pnpm: Manifest identity spoof satisfies allowBuilds and runs attacker lifecycle | 10.18.0 | `<10.34.2` / `>=10.34.2` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-3qhv-2rgh-x77r](https://github.com/advisories/GHSA-3qhv-2rgh-x77r) — pnpm: Repository config can expand victim environment secrets into registry requests before scripts run | 10.18.0 | `<10.34.2` / `>=10.34.2` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-4gxm-v5v7-fqc4](https://github.com/advisories/GHSA-4gxm-v5v7-fqc4) — pnpm: Reserved bin name deletes PNPM_HOME during global remove | 10.18.0 | `<10.34.2` / `>=10.34.2` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-w466-c33r-3gjp](https://github.com/advisories/GHSA-w466-c33r-3gjp) — pnpm: Project env lockfile can short-circuit package-manager resolution and execute lockfile-selected pnpm bytes | 10.18.0 | `<10.34.2` / `>=10.34.2` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-72r4-9c5j-mj57](https://github.com/advisories/GHSA-72r4-9c5j-mj57) — pnpm: `patch-remove` could delete project-selected files outside the patches directory | 10.18.0 | `<10.34.4` / `>=10.34.4` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-fr4h-3cph-29xv](https://github.com/advisories/GHSA-fr4h-3cph-29xv) — pnpm: Hoisted install imports lockfile alias outside node_modules | 10.18.0 | `<10.34.4` / `>=10.34.4` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-qrv3-253h-g69c](https://github.com/advisories/GHSA-qrv3-253h-g69c) — pnpm: Path traversal in configDependencies env lockfile allows symlink creation outside node_modules/.pnpm-config | 10.18.0 | `<10.34.4` / `>=10.34.4` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-gj8w-mvpf-x27x](https://github.com/advisories/GHSA-gj8w-mvpf-x27x) — pnpm: Repository-controlled configDependencies can select a pacquet native install engine | 10.18.0 | `<10.34.2` / `>=10.34.2` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-vx52-2968-3vc6](https://github.com/advisories/GHSA-vx52-2968-3vc6) — pnpm: Environment secrets exfiltrated via env-placeholder expansion in proxy settings read from an untrusted pnpm-workspace.yaml | 10.18.0 | `>=10.7.0 <10.34.5` / `>=10.34.5` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-c59q-g84q-2gj5](https://github.com/advisories/GHSA-c59q-g84q-2gj5) — pnpm: Virtual store linker path traversal via unvalidated depPath name in lockfileToDepGraph | 10.18.0 | `<10.34.5` / `>=10.34.5` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |
| [GHSA-vq4v-j7r6-jq4m](https://github.com/advisories/GHSA-vq4v-j7r6-jq4m) — pnpm: A tarball dependency's manifest `name` escapes node_modules → arbitrary file write/overwrite on install | 10.18.0 | `<10.34.5` / `>=10.34.5` | Baseline match removed | Install/developer boundary, not HTTP runtime. Several advisories require hostile projects, lockfiles, registries or package archives; no compromise demonstrated. Tooling patched. |

Example locked path: `. > pnpm@10.18.0`.

### postcss

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) — PostCSS has XSS via Unescaped </style> in its CSS Stringify Output | 8.5.6 | `<8.5.10` / `>=8.5.10` | Retained version match | Build only, using trusted checked-in CSS. No untrusted CSS processing endpoint or patient-controlled source-map annotation. |
| [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q) — PostCSS: Arbitrary file read and information disclosure via attacker-controlled sourceMappingURL in CSS comments | 8.5.6 | `<=8.5.11` / `>=8.5.12` | Retained version match | Build only, using trusted checked-in CSS. No untrusted CSS processing endpoint or patient-controlled source-map annotation. |
| [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) — PostCSS: incomplete fix of GHSA-6g55-p6wh-862q — attacker-controlled sourceMappingURL reads arbitrary .map files when `from` is unset | 8.5.6 | `<=8.5.22` / `>=8.5.23` | Retained version match | Build only, using trusted checked-in CSS. No untrusted CSS processing endpoint or patient-controlled source-map annotation. |
| [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) — PostCSS: Path Traversal in Previous Source Map Auto-Loading (sourceMappingURL) leads to Arbitrary .map File Disclosure | 8.5.6 | `<=8.5.17` / `>=8.5.18` | Retained version match | Build only, using trusted checked-in CSS. No untrusted CSS processing endpoint or patient-controlled source-map annotation. |

Example locked path: `. > postcss@8.5.6`.

### postcss-selector-parser

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) — PostCSS: Quadratic complexity in flat selector parsing allows CPU exhaustion | 6.0.10 | `<7.1.6` / `>=7.1.6` | Retained version match | Build-only trusted selectors; no HTTP selector parsing endpoint. |

Example locked path: `. > @tailwindcss/typography@0.5.19 > postcss-selector-parser@6.0.10`.

### proxy-addr

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-jqcg-44mw-7w3h](https://github.com/advisories/GHSA-jqcg-44mw-7w3h) — proxy-addr vulnerable to IP spoofing via IPv4-mapped IPv6 trust subnet | 2.0.7 | `>=1.1.0 <2.0.8` / `>=2.0.8` | Retained version match | Express trust proxy is left disabled. Access decisions do not use forwarded IP/subnet trust; exploit prerequisite absent. |

Example locked path: `. > express@4.21.2 > proxy-addr@2.0.7`.

### qs

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-w7fw-mjwx-w883](https://github.com/advisories/GHSA-w7fw-mjwx-w883) — qs's arrayLimit bypass in comma parsing allows denial of service | 6.13.0 | `>=6.7.0 <=6.14.1` / `>=6.14.2` | Baseline match removed | No comma-array/stringify round trip. Default parameter limits mitigate the bracket case; patched Express uses a simple query parser and no URL-encoded body parser. |
| [GHSA-6rw7-vpxm-498p](https://github.com/advisories/GHSA-6rw7-vpxm-498p) — qs's arrayLimit bypass in its bracket notation allows DoS via memory exhaustion | 6.13.0 | `<6.14.1` / `>=6.14.1` | Baseline match removed | No comma-array/stringify round trip. Default parameter limits mitigate the bracket case; patched Express uses a simple query parser and no URL-encoded body parser. |
| [GHSA-q8mj-m7cp-5q26](https://github.com/advisories/GHSA-q8mj-m7cp-5q26) — qs has a remotely triggerable DoS: qs.stringify crashes with TypeError on null/undefined entries in comma-format arrays when encodeValuesOnly is set | 6.13.0 | `>=6.11.1 <=6.15.1` / `>=6.15.2` | Baseline match removed | No comma-array/stringify round trip. Default parameter limits mitigate the bracket case; patched Express uses a simple query parser and no URL-encoded body parser. |
| [GHSA-4mjr-xmp4-gh2g](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g) — qs: Denial of Service via Attacker Controlled isBuffer | 6.13.0 | `>=2.2.5 <6.16.0` / `>=6.16.0` | Baseline match removed | No comma-array/stringify round trip. Default parameter limits mitigate the bracket case; patched Express uses a simple query parser and no URL-encoded body parser. |

Example locked path: `. > express@4.21.2 > qs@6.13.0`.

### rollup

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-mw96-cpmx-2vgc](https://github.com/advisories/GHSA-mw96-cpmx-2vgc) — Rollup 4 has Arbitrary File Write via Path Traversal | 4.52.4 | `>=4.0.0 <4.59.0` / `>=4.59.0` | Retained version match | Build only, using checked-in trusted source. No untrusted project build endpoint; arbitrary output-path construction is not exposed. |

Example locked path: `. > vite@7.1.9 > rollup@4.52.4`.

### source-map-js

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) — source-map-js allows event-loop denial of service through indexed source-map section offsets | 1.2.1 | `>=1.0.0 <1.2.2` / `>=1.2.2` | Retained version match | Build-time trusted source maps; no API consumes user-supplied source-map objects. |

Example locked path: `. > postcss@8.5.6 > source-map-js@1.2.1`.

### tar

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-29xp-372q-xqph](https://github.com/advisories/GHSA-29xp-372q-xqph) — node-tar has a race condition leading to uninitialized memory exposure | 7.5.1 | `=7.5.1` / `>=7.5.2` | Baseline match removed | Installation fallback in @tailwindcss/oxide extracts registry tarballs. Malicious archive is the prerequisite; not an HTTP upload extractor. Same-major patch removes the vulnerable extractor. |
| [GHSA-34x7-hfp2-rc4v](https://github.com/advisories/GHSA-34x7-hfp2-rc4v) — node-tar Vulnerable to Arbitrary File Creation/Overwrite via Hardlink Path Traversal | 7.5.1 | `<7.5.7` / `>=7.5.7` | Baseline match removed | Installation fallback in @tailwindcss/oxide extracts registry tarballs. Malicious archive is the prerequisite; not an HTTP upload extractor. Same-major patch removes the vulnerable extractor. |
| [GHSA-8qq5-rm4j-mr97](https://github.com/advisories/GHSA-8qq5-rm4j-mr97) — node-tar is Vulnerable to Arbitrary File Overwrite and Symlink Poisoning via Insufficient Path Sanitization | 7.5.1 | `<=7.5.2` / `>=7.5.3` | Baseline match removed | Installation fallback in @tailwindcss/oxide extracts registry tarballs. Malicious archive is the prerequisite; not an HTTP upload extractor. Same-major patch removes the vulnerable extractor. |
| [GHSA-83g3-92jg-28cx](https://github.com/advisories/GHSA-83g3-92jg-28cx) — Arbitrary File Read/Write via Hardlink Target Escape Through Symlink Chain in node-tar Extraction | 7.5.1 | `<7.5.8` / `>=7.5.8` | Baseline match removed | Installation fallback in @tailwindcss/oxide extracts registry tarballs. Malicious archive is the prerequisite; not an HTTP upload extractor. Same-major patch removes the vulnerable extractor. |
| [GHSA-qffp-2rhf-9h96](https://github.com/advisories/GHSA-qffp-2rhf-9h96) — tar has Hardlink Path Traversal via Drive-Relative Linkpath | 7.5.1 | `<=7.5.9` / `>=7.5.10` | Baseline match removed | Installation fallback in @tailwindcss/oxide extracts registry tarballs. Malicious archive is the prerequisite; not an HTTP upload extractor. Same-major patch removes the vulnerable extractor. |
| [GHSA-9ppj-qmqm-q256](https://github.com/advisories/GHSA-9ppj-qmqm-q256) — node-tar Symlink Path Traversal via Drive-Relative Linkpath | 7.5.1 | `<=7.5.10` / `>=7.5.11` | Baseline match removed | Installation fallback in @tailwindcss/oxide extracts registry tarballs. Malicious archive is the prerequisite; not an HTTP upload extractor. Same-major patch removes the vulnerable extractor. |
| [GHSA-r6q2-hw4h-h46w](https://github.com/advisories/GHSA-r6q2-hw4h-h46w) — Race Condition in node-tar Path Reservations via Unicode Ligature Collisions on macOS APFS | 7.5.1 | `<=7.5.3` / `>=7.5.4` | Baseline match removed | Installation fallback in @tailwindcss/oxide extracts registry tarballs. Malicious archive is the prerequisite; not an HTTP upload extractor. Same-major patch removes the vulnerable extractor. |
| [GHSA-vmf3-w455-68vh](https://github.com/advisories/GHSA-vmf3-w455-68vh) — node-tar applies PAX size override to intermediary GNU long-name/long-link headers, causing tar parser interpretation differential (file smuggling) | 7.5.1 | `<=7.5.15` / `>=7.5.16` | Baseline match removed | Installation fallback in @tailwindcss/oxide extracts registry tarballs. Malicious archive is the prerequisite; not an HTTP upload extractor. Same-major patch removes the vulnerable extractor. |
| [GHSA-w8wr-v893-vjvp](https://github.com/advisories/GHSA-w8wr-v893-vjvp) — node-tar: Process crash via PAX numeric path type confusion | 7.5.1 | `<=7.5.17` / `>=7.5.18` | Baseline match removed | Installation fallback in @tailwindcss/oxide extracts registry tarballs. Malicious archive is the prerequisite; not an HTTP upload extractor. Same-major patch removes the vulnerable extractor. |
| [GHSA-23hp-3jrh-7fpw](https://github.com/advisories/GHSA-23hp-3jrh-7fpw) — node-tar: Decompression/parse DoS via unlimited input | 7.5.1 | `<=7.5.18` / `>=7.5.19` | Baseline match removed | Installation fallback in @tailwindcss/oxide extracts registry tarballs. Malicious archive is the prerequisite; not an HTTP upload extractor. Same-major patch removes the vulnerable extractor. |
| [GHSA-8x88-c5mf-7j5w](https://github.com/advisories/GHSA-8x88-c5mf-7j5w) — node-tar: Negative tar entry size causes infinite loop in archive replace | 7.5.1 | `<=7.5.17` / `>=7.5.18` | Baseline match removed | Installation fallback in @tailwindcss/oxide extracts registry tarballs. Malicious archive is the prerequisite; not an HTTP upload extractor. Same-major patch removes the vulnerable extractor. |
| [GHSA-gvwx-54wh-qm9j](https://github.com/advisories/GHSA-gvwx-54wh-qm9j) — node-tar: Uncaught Exception DoS via NUL byte in PAX path/linkpath records | 7.5.1 | `<=7.5.16` / `>=7.5.17` | Baseline match removed | Installation fallback in @tailwindcss/oxide extracts registry tarballs. Malicious archive is the prerequisite; not an HTTP upload extractor. Same-major patch removes the vulnerable extractor. |
| [GHSA-r292-9mhp-454m](https://github.com/advisories/GHSA-r292-9mhp-454m) — node-tar: Uncontrolled recursion in mapHas/filesFilter allows uncatchable stack-overflow DoS via crafted long-path tar with member selection | 7.5.1 | `<=7.5.20` / `>=7.5.21` | Baseline match removed | Installation fallback in @tailwindcss/oxide extracts registry tarballs. Malicious archive is the prerequisite; not an HTTP upload extractor. Same-major patch removes the vulnerable extractor. |

Example locked path: `. > @tailwindcss/vite@4.1.14 > @tailwindcss/oxide@4.1.14 > tar@7.5.1`.

### tinypool

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-5gmw-xhrv-c9v3](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3) — Tinypool: Prototype Pollution gadget in worker options leads to Remote Code Execution | 1.1.1 | `<=2.1.0` / `>=2.1.1` | Retained version match | Test-worker boundary only. No untrusted worker code or HTTP-accessible pool interface; exploit unproven here. |
| [GHSA-85c8-ppgw-ccpr](https://github.com/advisories/GHSA-85c8-ppgw-ccpr) — Tinypool: Prototype Pollution Gadget to RCE in run() options | 1.1.1 | `<2.1.2` / `>=2.1.2` | Retained version match | Test-worker boundary only. No untrusted worker code or HTTP-accessible pool interface; exploit unproven here. |

Example locked path: `. > vitest@2.1.9 > tinypool@1.1.1`.

### uuid

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) — uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided | 11.1.0 | `<11.1.1` / `>=11.1.1` | Retained version match | Unused AWS/markdown dependency paths; no request-controlled UUID conversion options found. |

Example locked path: `. > streamdown@1.4.0 > mermaid@11.12.0 > uuid@11.1.0`.

### vite

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-93m4-6634-74q7](https://github.com/advisories/GHSA-93m4-6634-74q7) — vite allows server.fs.deny bypass via backslash on Windows | 5.4.20 | `>=5.2.6 <=5.4.20` / `>=5.4.21` | Retained version match | Vitest-only Vite 5 dependency; no Vite 5 server is started by vitest run or production. Retained; do not expose test UI/server modes. |
| [GHSA-93m4-6634-74q7](https://github.com/advisories/GHSA-93m4-6634-74q7) — vite allows server.fs.deny bypass via backslash on Windows | 7.1.9 | `>=7.1.0 <=7.1.10` / `>=7.1.11` | Still matched at 5.4.20 | Conditional on Windows/editor configuration; Windows exploitation not tested. Direct dev-server dependency patched to 7.3.7. |
| [GHSA-4w7w-66w2-5vf9](https://github.com/advisories/GHSA-4w7w-66w2-5vf9) — Vite Vulnerable to Path Traversal in Optimized Deps `.map` Handling | 5.4.20 | `<=6.4.1` / `>=6.4.2` | Retained version match | Vitest-only Vite 5 dependency; no Vite 5 server is started by vitest run or production. Retained; do not expose test UI/server modes. |
| [GHSA-4w7w-66w2-5vf9](https://github.com/advisories/GHSA-4w7w-66w2-5vf9) — Vite Vulnerable to Path Traversal in Optimized Deps `.map` Handling | 7.1.9 | `>=7.0.0 <=7.3.1` / `>=7.3.2` | Still matched at 5.4.20 | Development server was network-bound, with live HMR and allowedHosts=true override. File-access feature is reachable in development; absent from production serving. Patched and listener restricted. |
| [GHSA-v2wj-q39q-566r](https://github.com/advisories/GHSA-v2wj-q39q-566r) — Vite: `server.fs.deny` bypassed with queries | 7.1.9 | `>=7.1.0 <=7.3.1` / `>=7.3.2` | Baseline match removed | Development server was network-bound, with live HMR and allowedHosts=true override. File-access feature is reachable in development; absent from production serving. Patched and listener restricted. |
| [GHSA-p9ff-h696-f583](https://github.com/advisories/GHSA-p9ff-h696-f583) — Vite Vulnerable to Arbitrary File Read via Vite Dev Server WebSocket | 7.1.9 | `>=7.0.0 <=7.3.1` / `>=7.3.2` | Baseline match removed | Development server was network-bound, with live HMR and allowedHosts=true override. File-access feature is reachable in development; absent from production serving. Patched and listener restricted. |
| [GHSA-v6wh-96g9-6wx3](https://github.com/advisories/GHSA-v6wh-96g9-6wx3) — launch-editor: NTLMv2 hash disclosure via UNC path handling on Windows | 5.4.20 | `<=6.4.2` / `>=6.4.3` | Retained version match | Vitest-only Vite 5 dependency; no Vite 5 server is started by vitest run or production. Retained; do not expose test UI/server modes. |
| [GHSA-v6wh-96g9-6wx3](https://github.com/advisories/GHSA-v6wh-96g9-6wx3) — launch-editor: NTLMv2 hash disclosure via UNC path handling on Windows | 7.1.9 | `>=7.0.0 <=7.3.4` / `>=7.3.5` | Still matched at 5.4.20 | Conditional on Windows/editor configuration; Windows exploitation not tested. Direct dev-server dependency patched to 7.3.7. |
| [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) — vite: `server.fs.deny` bypass on Windows alternate paths | 5.4.20 | `<=6.4.2` / `>=6.4.3` | Retained version match | Vitest-only Vite 5 dependency; no Vite 5 server is started by vitest run or production. Retained; do not expose test UI/server modes. |
| [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) — vite: `server.fs.deny` bypass on Windows alternate paths | 7.1.9 | `>=7.0.0 <=7.3.4` / `>=7.3.5` | Still matched at 5.4.20 | Conditional on Windows/editor configuration; Windows exploitation not tested. Direct dev-server dependency patched to 7.3.7. |
| [GHSA-698v-4r3x-3vcv](https://github.com/advisories/GHSA-698v-4r3x-3vcv) — launch-editor: escapeCmdArgs() omits % escaping on Windows | 5.4.20 | `<=6.4.3` / `>=6.4.4` | Retained version match | Vitest-only Vite 5 dependency; no Vite 5 server is started by vitest run or production. Retained; do not expose test UI/server modes. |
| [GHSA-698v-4r3x-3vcv](https://github.com/advisories/GHSA-698v-4r3x-3vcv) — launch-editor: escapeCmdArgs() omits % escaping on Windows | 7.1.9 | `>=7.0.0 <=7.3.6` / `>=7.3.7` | Still matched at 5.4.20 | Conditional on Windows/editor configuration; Windows exploitation not tested. Direct dev-server dependency patched to 7.3.7. |
| [GHSA-r825-w8mm-5pxw](https://github.com/advisories/GHSA-r825-w8mm-5pxw) — launch-editor: Editor CLI flag misinterpretation causing arbitrary command execution for some editors | 5.4.20 | `<=6.4.3` / `>=6.4.4` | Retained version match | Vitest-only Vite 5 dependency; no Vite 5 server is started by vitest run or production. Retained; do not expose test UI/server modes. |
| [GHSA-r825-w8mm-5pxw](https://github.com/advisories/GHSA-r825-w8mm-5pxw) — launch-editor: Editor CLI flag misinterpretation causing arbitrary command execution for some editors | 7.1.9 | `>=7.0.0 <=7.3.6` / `>=7.3.7` | Still matched at 5.4.20 | Conditional on Windows/editor configuration; Windows exploitation not tested. Direct dev-server dependency patched to 7.3.7. |
| [GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm) — launch-editor: `fs.existsSync()` existence check can be bypassed on Windows | 5.4.20 | `<=6.4.3` / `>=6.4.4` | Retained version match | Vitest-only Vite 5 dependency; no Vite 5 server is started by vitest run or production. Retained; do not expose test UI/server modes. |
| [GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm) — launch-editor: `fs.existsSync()` existence check can be bypassed on Windows | 7.1.9 | `>=7.0.0 <=7.3.6` / `>=7.3.7` | Still matched at 5.4.20 | Conditional on Windows/editor configuration; Windows exploitation not tested. Direct dev-server dependency patched to 7.3.7. |
| [GHSA-9jrq-w75r-8gcw](https://github.com/advisories/GHSA-9jrq-w75r-8gcw) — Vite: Cross origin script execution through Vite custom middleware | 5.4.20 | `<=6.4.3` / `>=6.4.4` | Retained version match | Vitest-only Vite 5 dependency; no Vite 5 server is started by vitest run or production. Retained; do not expose test UI/server modes. |
| [GHSA-9jrq-w75r-8gcw](https://github.com/advisories/GHSA-9jrq-w75r-8gcw) — Vite: Cross origin script execution through Vite custom middleware | 7.1.9 | `>=7.0.0 <=7.3.6` / `>=7.3.7` | Still matched at 5.4.20 | Middleware pattern exists, but client/index.html has no inline module script required by this advisory. Version patched; application exploit not demonstrated. |
| [GHSA-rq7h-c2jc-7f22](https://github.com/advisories/GHSA-rq7h-c2jc-7f22) — Vite: Files outside `server.fs.allow` could be served when project paths match system paths on non-Windows machine | 5.4.20 | `<=6.4.3` / `>=6.4.4` | Retained version match | Vitest-only Vite 5 dependency; no Vite 5 server is started by vitest run or production. Retained; do not expose test UI/server modes. |
| [GHSA-rq7h-c2jc-7f22](https://github.com/advisories/GHSA-rq7h-c2jc-7f22) — Vite: Files outside `server.fs.allow` could be served when project paths match system paths on non-Windows machine | 7.1.9 | `>=7.0.0 <=7.3.6` / `>=7.3.7` | Still matched at 5.4.20 | Conditional on Windows/editor configuration; Windows exploitation not tested. Direct dev-server dependency patched to 7.3.7. |

Example locked path: `. > vite@7.1.9`.

### vitest

| Official advisory | Exact baseline version | Affected range / patch | Final disposition | Reachability and prerequisites |
|---|---|---|---|---|
| [GHSA-5xrq-8626-4rwp](https://github.com/advisories/GHSA-5xrq-8626-4rwp) — When Vitest UI server is listening, arbitrary file can be read and executed | 2.1.9 | `<3.2.6` / `>=3.2.6` | Retained version match | pnpm test uses vitest run, with no UI/browser/mocker HTTP server. Do not expose test UI servers using this retained version. |
| [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) — Vitest: Path Traversal / Arbitrary File Read via @vitest/mocker Redirect Mock | 2.1.9 | `>=2.1.0 <4.1.11` / `>=4.1.11` | Retained version match | pnpm test uses vitest run, with no UI/browser/mocker HTTP server. Do not expose test UI servers using this retained version. |

Example locked path: `. > vitest@2.1.9`.

## Independently checked false positives and previously fixed issues

- React Server Components: React/React DOM 19.2.1 are installed, but no `react-server-dom-*`, Next.js, RSC plugin, Server Functions, or RSC transport exists. The React team’s [RCE notice](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) and [subsequent DoS/source-exposure notice](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) therefore do not establish an applicable application vulnerability.
- [Vite GHSA-8g5g-mxqh-grgj, published October 21](https://github.com/vitejs/vite/security/advisories/GHSA-8g5g-mxqh-grgj) affects 6.4.4 specifically. Neither baseline Vite 7.1.9 nor Vitest’s 5.4.20 matches that version. Other applicable Vite advisories are assessed separately above.
- The [Axios compromised releases](https://github.com/axios/axios/issues/10604) were 1.14.1 and 0.30.4. The repository locks 1.12.2 and does not lock their malicious dependency. This is a false positive for that supply-chain incident, not a statement that 1.12.2 is free of the other listed Axios advisories.
- The direct server build dependency esbuild 0.25.10 already includes the fix for [GHSA-67mh-4wv8-2f99](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99), fixed in 0.25.0. Older copies remain in Drizzle/Vitest tooling and are assessed separately; the app does not call their vulnerable serve API.
- [PHP’s October 21 critical notices](https://www.php.net/index.php) concern PHP web runtimes. No PHP source/runtime, Composer package or PHP server configuration is present in this repository, so no PHP advisory is confirmed applicable here.

## Remaining scan results

Final raw npm severity totals: `{"critical": 5, "high": 34, "info": 0, "low": 13, "moderate": 67}`. These still include unused code, tooling-only paths, and prerequisites absent from this app. They are not suppressed or represented as fixed.

Newly introduced transitive resolutions were also audited. The complete current lockfile remains the source of exact versions. This assessment is dated; future advisory revisions and new disclosures require a fresh query.
