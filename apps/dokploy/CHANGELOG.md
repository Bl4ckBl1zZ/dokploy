## [0.44.1](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.44.0...v0.44.1) (2026-10-18)


### Bug Fixes

* **billing:** guard loadStripe behind key check for self-hosted instances ([8377300](https://github.com/Bl4ckBl1zZ/dokploy/commit/837730038caeabc98c02a4356a17fd741e6c0acf))
* decode Route53 octal escapes in record names ([#5553](https://github.com/Bl4ckBl1zZ/dokploy/issues/5553)) ([e0c8d80](https://github.com/Bl4ckBl1zZ/dokploy/commit/e0c8d80cdea15a4ac3fe495a6ad38e043b4b80b5))
* escape HTML and truncate long messages in Telegram notifications ([7430afd](https://github.com/Bl4ckBl1zZ/dokploy/commit/7430afd701f3db36e4a90b808fe5c81f709a4ae0))
* escape metadata fields and fix entity boundary off-by-one ([41cecde](https://github.com/Bl4ckBl1zZ/dokploy/commit/41cecde7353d837240af659e0419f45f9f4e0199))
* **ui:** fix server badge and appName overflow on mobile ([829f8af](https://github.com/Bl4ckBl1zZ/dokploy/commit/829f8af63fa34141df5e43db2b0b6a5feb156887))
* **ui:** prevent mobile service header overflow ([949ac8e](https://github.com/Bl4ckBl1zZ/dokploy/commit/949ac8e0a226301416da846462e3f9c9706ff63b))
* **ui:** prevent service header overflow on mobile ([5ccc15f](https://github.com/Bl4ckBl1zZ/dokploy/commit/5ccc15f00d3d6263fd9cbf22ba4c63f76f60fa44))

# [0.44.0](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.43.0...v0.44.0) (2026-10-16)


### Bug Fixes

* **ai:** fix PermissionCtx type on resolveInputApiKey ([0049421](https://github.com/Bl4ckBl1zZ/dokploy/commit/00494210954756fa7bd842f630fcae89d945614f))
* **ai:** mask apiKey exposure, add audit logging, resolve masked-key UX regression ([2bfcac5](https://github.com/Bl4ckBl1zZ/dokploy/commit/2bfcac58b00281b897615b1a6c9cea54dbe7d7f0))
* **ai:** require update permission for stored key resolution, deduplicate resolve logic ([3d67665](https://github.com/Bl4ckBl1zZ/dokploy/commit/3d67665c33c9d967f825e6d4c9603e3b0f1d6e3f))
* **deps:** bump next, shell-quote and proxy-addr for critical advisories ([7289a3f](https://github.com/Bl4ckBl1zZ/dokploy/commit/7289a3f68e6dfa6fc846d8da63c6a587838eaeb3))
* **deps:** bump nodemailer and patch transitive high advisories ([9992659](https://github.com/Bl4ckBl1zZ/dokploy/commit/9992659f2429d0cf2a0ed26a52420ef18eff45a2))
* **deps:** resolve open Dependabot alerts ([5e0b021](https://github.com/Bl4ckBl1zZ/dokploy/commit/5e0b021ec2727f266c2530b8fd57bbb1ddcd16a5))
* **permissions:** mask apiKey on ai.one, add audit logging, remove dead endpoint ([a7d8378](https://github.com/Bl4ckBl1zZ/dokploy/commit/a7d8378f52002432f2e6261a72801d584d54c42a))
* **permissions:** resolve AI module authorization edge cases and test failures ([cd9edb2](https://github.com/Bl4ckBl1zZ/dokploy/commit/cd9edb290bfd782f8ee56d493b38fbc994e0bdc7))
* redact apiKey from getAll AI endpoint to prevent credential exposure ([bdefc02](https://github.com/Bl4ckBl1zZ/dokploy/commit/bdefc02e77a8319da6d5e44ac9974bdcaa57c293))
* resolve cross-tenant access and granular role UI issues for AI settings ([293e197](https://github.com/Bl4ckBl1zZ/dokploy/commit/293e19703a0eac50cd2a3deacd45c705bf67a694))
* **server:** let members list servers in server pickers ([749bb2c](https://github.com/Bl4ckBl1zZ/dokploy/commit/749bb2c1ce9a17eb51dead21fb2950e5fcc61439))
* **settings:** check server organization in traefik file endpoints ([136a09d](https://github.com/Bl4ckBl1zZ/dokploy/commit/136a09d0161e46fbab14a1872c7c7149a580ed89))
* **settings:** confine Traefik file read/write to the Traefik config directory ([1f1acac](https://github.com/Bl4ckBl1zZ/dokploy/commit/1f1acacf585238f9a8f86f8b2a9ad1cb23834deb))
* suppress EPIPE errors in pipeBetweenServers when target exits early ([37df4e4](https://github.com/Bl4ckBl1zZ/dokploy/commit/37df4e484e3002e16df6afd0f274edb10bbefaa9))
* **templates:** cap visible tags so the Create button stays visible ([94f3815](https://github.com/Bl4ckBl1zZ/dokploy/commit/94f3815eb46695485cea03a02895394de82451f5)), closes [#5660](https://github.com/Bl4ckBl1zZ/dokploy/issues/5660)
* **transfer:** keep source stream flowing after target closes its stdin ([5a8f5ce](https://github.com/Bl4ckBl1zZ/dokploy/commit/5a8f5ce0f294b6a4602cce43b4facd1db0ea052c))


### Features

* **logs-and-metrics:** ship container logs and metrics to external providers via Vector ([b329595](https://github.com/Bl4ckBl1zZ/dokploy/commit/b3295953703e8bc422951120245096fd3b4b2ac0))
* **permissions:** add AI module to enterprise custom roles ([b5473e6](https://github.com/Bl4ckBl1zZ/dokploy/commit/b5473e63fdac3d9756a16786f902d643e53197a8))


### Performance Improvements

* **ai:** optimize permission evaluation and remove redundant DB queries ([5ff8d05](https://github.com/Bl4ckBl1zZ/dokploy/commit/5ff8d05ff7f1e7711e0f66f06b8799ed7c637771))

# [0.43.0](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.42.0...v0.43.0) (2026-10-14)


### Bug Fixes

* **backups:** preserve service selection when changing database type ([b4681b3](https://github.com/Bl4ckBl1zZ/dokploy/commit/b4681b318f5f075974a2b5c3f384289dbb401f5f))
* **dns:** enforce the configured OVH zone on record operations ([2674eb2](https://github.com/Bl4ckBl1zZ/dokploy/commit/2674eb200dec358914ba10e7dc0ee0f41d8f954c))
* **enterprise:** address review feedback for dual-mode branding ([d277913](https://github.com/Bl4ckBl1zZ/dokploy/commit/d2779136c5d3f3ad02f7a1e11dfa7f126a703611))
* **enterprise:** preserve light-mode URLs when toggling dual branding off ([0898642](https://github.com/Bl4ckBl1zZ/dokploy/commit/0898642e3209dafde1274d1294ec91a882e7ba2a))
* **gitlab:** share one token refresh between concurrent callers ([412516d](https://github.com/Bl4ckBl1zZ/dokploy/commit/412516d47b07c50bdd98cfeb58b1c10d97b919eb))
* **ui:** wrap and clamp service card description on environment page ([726664a](https://github.com/Bl4ckBl1zZ/dokploy/commit/726664ab3c250ce5b9678f729e4a6852182c13fb))


### Features

* **dns:** add optional zone to OVH provider ([e8f236c](https://github.com/Bl4ckBl1zZ/dokploy/commit/e8f236c9dbce7fb30581e2661ed33e61f1b34104))
* **enterprise:** dual-mode branding with separate light/dark theme logos ([0b537a8](https://github.com/Bl4ckBl1zZ/dokploy/commit/0b537a815dfe8c571416b9212b102edeb03614ef))
* **ui:** make projects card clickable on home dashboard ([3cc8158](https://github.com/Bl4ckBl1zZ/dokploy/commit/3cc8158fdc3917252a52234192f713a0e9d6d266))

# [0.42.0](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.41.1...v0.42.0) (2026-10-12)


### Bug Fixes

* accept deploy webhook payloads up to 25 MB ([4396451](https://github.com/Bl4ckBl1zZ/dokploy/commit/43964510956839ec7253eaae5b04c33f7a96ee1d))
* account for all style end-tag variants like </style/> ([13bb1ac](https://github.com/Bl4ckBl1zZ/dokploy/commit/13bb1ac5d155775ad30d591955d96935801f864b))
* account for whitespace in style tag regex to prevent XSS ([5606a2b](https://github.com/Bl4ckBl1zZ/dokploy/commit/5606a2bd1ebe1278cadae974aa70e70460fd1ace))
* add clipboard addon to docker container terminal ([65198f6](https://github.com/Bl4ckBl1zZ/dokploy/commit/65198f6082596d71a6e30f610efdd575934eb422)), closes [#5065](https://github.com/Bl4ckBl1zZ/dokploy/issues/5065)
* add createEnvFile toggle to Compose, mirroring Application ([5c862f7](https://github.com/Bl4ckBl1zZ/dokploy/commit/5c862f7ef4958a8eda01199dabd3c17f94c65396))
* add env -i PATH prefix to fresh volumes down command ([c668f6c](https://github.com/Bl4ckBl1zZ/dokploy/commit/c668f6c7bd75cf5ef717193a827538897512e08e))
* add sourceType to apiCreateCompose and apiCreateApplication ([30c408b](https://github.com/Bl4ckBl1zZ/dokploy/commit/30c408b130cd0b50f670725378d7fe228886c3ca))
* add unzip to arch server set up ([f21931d](https://github.com/Bl4ckBl1zZ/dokploy/commit/f21931da60fcd5e9f7116a6bde1d39e2dc55b5b5))
* address PR feedback (SVG helper & AddOrganization crash) ([4877c4f](https://github.com/Bl4ckBl1zZ/dokploy/commit/4877c4ffa34182885963dc53ed788c12eb2c4137))
* allow docker compose command chaining ([ac57e22](https://github.com/Bl4ckBl1zZ/dokploy/commit/ac57e22b87dff954d668929e4f24972afdeb2dab))
* allow Option/Alt composed characters in terminals on macOS ([b203489](https://github.com/Bl4ckBl1zZ/dokploy/commit/b20348908f0525093169524b99db5088199d85d8))
* **api:** configurable body size limits for OpenAPI catch-all route ([d11735d](https://github.com/Bl4ckBl1zZ/dokploy/commit/d11735d4cd4030c3134b17696a2e05c96e334804))
* **api:** reject non-integer body size env vars ([529f54e](https://github.com/Bl4ckBl1zZ/dokploy/commit/529f54e2a52738c23e2c6266eb983b31d32091e5))
* **api:** validate OpenAPI body size limits against Greptile findings ([8144e1a](https://github.com/Bl4ckBl1zZ/dokploy/commit/8144e1a2fe563ec502d134f736a3f7f539d05311))
* **application:** remove preview deployments when deleting an application ([f6b0700](https://github.com/Bl4ckBl1zZ/dokploy/commit/f6b0700ea544c4e36a4cdc11cfa4f7881ddf0570))
* apply compose file patches in preview and domain injection ([bc935ae](https://github.com/Bl4ckBl1zZ/dokploy/commit/bc935ae3adc77010ba3428bc41a574d9e383a884))
* apply watch path negations as a pattern set ([abc2439](https://github.com/Bl4ckBl1zZ/dokploy/commit/abc2439ec49d2ec3048aa010441c33a0a3d74cd4))
* assign tags created from the project dialog ([0ea7de7](https://github.com/Bl4ckBl1zZ/dokploy/commit/0ea7de7d31d3a958a60e318be198960bf66de5c0)), closes [#5117](https://github.com/Bl4ckBl1zZ/dokploy/issues/5117)
* **auth:** block passkey authentication and email signup when SSO is enforced ([5f10ed6](https://github.com/Bl4ckBl1zZ/dokploy/commit/5f10ed6884af889365d7f0a639fa22a25d3fa571))
* **auth:** enforce SSO on server-side sign-in endpoints ([b839e6d](https://github.com/Bl4ckBl1zZ/dokploy/commit/b839e6d6be9ee7a19272bce9ce20eb6f6afab475)), closes [#5288](https://github.com/Bl4ckBl1zZ/dokploy/issues/5288)
* **auth:** enforce SSO on server-side sign-in endpoints ([#5291](https://github.com/Bl4ckBl1zZ/dokploy/issues/5291)) ([5c0d3b8](https://github.com/Bl4ckBl1zZ/dokploy/commit/5c0d3b84af0cc992b0a295cdc4005610401094a2)), closes [#5288](https://github.com/Bl4ckBl1zZ/dokploy/issues/5288)
* **auth:** link SCIM-provisioned users through SSO and surface sign-in errors ([a1a672b](https://github.com/Bl4ckBl1zZ/dokploy/commit/a1a672b672647b3a65b14f04860f930184e99517)), closes [#4973](https://github.com/Bl4ckBl1zZ/dokploy/issues/4973)
* **auth:** prefetch SSO state in SSR to prevent layout flash ([9cae609](https://github.com/Bl4ckBl1zZ/dokploy/commit/9cae609a0a249f576f8d7f0e442fb92fb4d3eb58))
* **billing:** allow switching billing interval during trial ([c453ac3](https://github.com/Bl4ckBl1zZ/dokploy/commit/c453ac3a2f491c753d6fbdc3e25ba935c525bb97))
* **billing:** one reminder at 1 day, guarded by an advisory lock ([0372304](https://github.com/Bl4ckBl1zZ/dokploy/commit/037230496c1880ed4ff1463ffc812dd7a01165b2))
* **billing:** pick a plan for the trial and warn before it expires ([95b2712](https://github.com/Bl4ckBl1zZ/dokploy/commit/95b2712c26ac5dd3fc0d94e16a8edbbe1a6a8f7e))
* **billing:** stop the reminder claim from rewriting stale metadata ([14e0597](https://github.com/Bl4ckBl1zZ/dokploy/commit/14e059784cdde4212d94f92154f7b304b78c7e39))
* **billing:** update server inclusion descriptions for clarity ([e369541](https://github.com/Bl4ckBl1zZ/dokploy/commit/e369541a1622f30e5fabc782d1d792dc53d11775))
* **build:** exclude CLI-only auth config from server dist build ([d92de5a](https://github.com/Bl4ckBl1zZ/dokploy/commit/d92de5a4a0a8882dacce484a9d26374643eb4be1))
* **ci:** create release tags on the pushed commit instead of default branch ([98af5a2](https://github.com/Bl4ckBl1zZ/dokploy/commit/98af5a2f07687379f32cb4f3bf3334307589609b))
* **ci:** create release tags on the pushed commit instead of default branch ([472ebed](https://github.com/Bl4ckBl1zZ/dokploy/commit/472ebed06c9b804369af51585390cce37ac4c1a4))
* **ci:** deploy postgres/mongo instead of start ([2643ae0](https://github.com/Bl4ckBl1zZ/dokploy/commit/2643ae0a86a7cfc801a3536c140f98eb9925ecdf))
* **ci:** generate OpenAPI spec from the release commit in sync-version ([ff9fa74](https://github.com/Bl4ckBl1zZ/dokploy/commit/ff9fa7418f98ad0bdc0fdab5da33d82833968585))
* **ci:** handle both old (flat) and new (nested) project.create response formats ([f29a1a1](https://github.com/Bl4ckBl1zZ/dokploy/commit/f29a1a1976db0526de13bf39ef7b457d8dc87fde))
* **ci:** pin pnpm and strip v prefix in sync-version job ([b6190ff](https://github.com/Bl4ckBl1zZ/dokploy/commit/b6190ff3142fef95990334b26d6e98f1a42276d0))
* **ci:** push hotfix cherry-picks with PAT to satisfy branch rules ([06b67d4](https://github.com/Bl4ckBl1zZ/dokploy/commit/06b67d451991b281be3b87acb9410260f48fd32f))
* **ci:** raise floor to v0.29.4, require environmentId from project.create ([f59f114](https://github.com/Bl4ckBl1zZ/dokploy/commit/f59f11474b6a40892020742d7c8cf6f6854057fe))
* **ci:** run dokploy install.sh as root, install version A directly via DOKPLOY_VERSION ([ade7a79](https://github.com/Bl4ckBl1zZ/dokploy/commit/ade7a79bf14e3341babff03f1b286d1fdda0f55d))
* clear stale stack log container selection ([c77f6d8](https://github.com/Bl4ckBl1zZ/dokploy/commit/c77f6d889d088fff01790db2d59c107c1abdb4e5))
* close terminal websocket when local container shell exits ([1053743](https://github.com/Bl4ckBl1zZ/dokploy/commit/1053743a1c87d8b67b37e8ae4d451bc3874cbb61))
* **cloud:** load HubSpot chat widget for startup plan users ([c231c29](https://github.com/Bl4ckBl1zZ/dokploy/commit/c231c2979b671886fc67ee8559afbc1fbe327460))
* **cloud:** remove HubSpot chat widget when dashboard unmounts ([382fdfc](https://github.com/Bl4ckBl1zZ/dokploy/commit/382fdfc478697744538f6cf430b7fbb114948087))
* **compose:** clean domain labels across services ([67fa8e4](https://github.com/Bl4ckBl1zZ/dokploy/commit/67fa8e4104b372fdd8cfd76d9c2c2cc4e4de4f57))
* **compose:** clean up mapping domain labels ([f14f12c](https://github.com/Bl4ckBl1zZ/dokploy/commit/f14f12c778a9f2f441a7e8ee24e8d4512094f57e))
* **compose:** move Fresh Volumes into a Danger Zone with typed confirmation ([38d157a](https://github.com/Bl4ckBl1zZ/dokploy/commit/38d157adc0fd1102d54b75df7cd8b5b08f3c7b4e))
* **compose:** Preserve raw remote mounts ([e43d99e](https://github.com/Bl4ckBl1zZ/dokploy/commit/e43d99e7965bfff67b642a734a313d211faec3bf)), closes [#4794](https://github.com/Bl4ckBl1zZ/dokploy/issues/4794)
* **compose:** regenerate mapping domain labels ([5ceb88b](https://github.com/Bl4ckBl1zZ/dokploy/commit/5ceb88bebe38e0e528cceee4c1f507a21fea7fbe))
* **compose:** remove stale labels for disabled domains ([37c8d64](https://github.com/Bl4ckBl1zZ/dokploy/commit/37c8d6477e6550c6d1c81d77bcdb0e3e060a84cd))
* correct add-invitation form reset logic and select state ([143dfca](https://github.com/Bl4ckBl1zZ/dokploy/commit/143dfcafe3e2fd9a8804f991362b9060b3135f50))
* correct log-tail server resolution, drop unrelated Networks gating ([95b1afc](https://github.com/Bl4ckBl1zZ/dokploy/commit/95b1afc2c255eebc72b8b6c22f894408195808c3))
* correct network monitoring chart labels and units ([a822db5](https://github.com/Bl4ckBl1zZ/dokploy/commit/a822db59676ad6c91db1a15358d113e27b08a4d0)), closes [#5115](https://github.com/Bl4ckBl1zZ/dokploy/issues/5115)
* correct switch thumb translate-x for checked state ([76c2416](https://github.com/Bl4ckBl1zZ/dokploy/commit/76c2416613fd947f179c68d6efd9215904c38304)), closes [#5120](https://github.com/Bl4ckBl1zZ/dokploy/issues/5120)
* count only physical disks in host Block I/O stats ([#5540](https://github.com/Bl4ckBl1zZ/dokploy/issues/5540)) ([0d3a396](https://github.com/Bl4ckBl1zZ/dokploy/commit/0d3a3966b010bd853f6f9cf92089e86f59d38b8a))
* deploy monitoring as a swarm service instead of a standalone container ([#5055](https://github.com/Bl4ckBl1zZ/dokploy/issues/5055)) ([3848fa9](https://github.com/Bl4ckBl1zZ/dokploy/commit/3848fa9c0d69ec7abbced1535de7fad4c1bad82d))
* **deps:** bump next to 16.3.4 to patch critical RCE advisories ([4cd4b83](https://github.com/Bl4ckBl1zZ/dokploy/commit/4cd4b835232141303d13276cf06f4b177b627e4f))
* detect billing plan across all active Stripe subscriptions ([e79239a](https://github.com/Bl4ckBl1zZ/dokploy/commit/e79239a100422c181fd92cbfa4f0fae3a610cd57))
* detect network delete/recreate by Docker ID during sync ([63efbff](https://github.com/Bl4ckBl1zZ/dokploy/commit/63efbffcfde21e669b8af92df6f9ba737a648d47)), closes [#5179](https://github.com/Bl4ckBl1zZ/dokploy/issues/5179)
* disable delete/unlink user button while mutation is pending ([fee0071](https://github.com/Bl4ckBl1zZ/dokploy/commit/fee0071223fe70216f4a9aefa010b327e2864e9c)), closes [#5063](https://github.com/Bl4ckBl1zZ/dokploy/issues/5063)
* disable minimumReleaseAge (broke builds on unrelated AWS SDK deps) ([9412b52](https://github.com/Bl4ckBl1zZ/dokploy/commit/9412b521720819a51fe4ea3b059e2e54f77ccbb5)), closes [#4679](https://github.com/Bl4ckBl1zZ/dokploy/issues/4679)
* disable recharts animation on monitoring charts ([bd7fb8f](https://github.com/Bl4ckBl1zZ/dokploy/commit/bd7fb8f23c4d8229d909e90f4b3b962cbc764e8b))
* **dns:** apply content normalization in upsert match logic to prevent duplicates ([df0986b](https://github.com/Bl4ckBl1zZ/dokploy/commit/df0986b4e1c16f28a91ec63efe68aa27cebf1481))
* **dns:** do not report a restored OVH record as lost ([2311f34](https://github.com/Bl4ckBl1zZ/dokploy/commit/2311f346d4e5ae9769feb5eca5c2a69b4213c4df)), closes [#5258](https://github.com/Bl4ckBl1zZ/dokploy/issues/5258)
* **dns:** extract and normalize prio for porkbun MX/SRV records to prevent duplicates ([94cd503](https://github.com/Bl4ckBl1zZ/dokploy/commit/94cd5035efffde9305127ebef44070d2a5a626c9))
* **dns:** fallback to data fields comparison for cloudflare structured SRV/CAA records ([ea1c6fc](https://github.com/Bl4ckBl1zZ/dokploy/commit/ea1c6fc3fe193b0dc8f7e8825d2b4c29570ad881))
* **dns:** keep the record table on a valid page while filtering ([130be40](https://github.com/Bl4ckBl1zZ/dokploy/commit/130be40b49c0bfb0944a2631fc43e3d105bf32a6))
* **dns:** match apex records stored under any apex spelling ([be4a5da](https://github.com/Bl4ckBl1zZ/dokploy/commit/be4a5da40536db7c26cd58cfdce63b2f3ab1a3d0)), closes [#5257](https://github.com/Bl4ckBl1zZ/dokploy/issues/5257)
* **dns:** match record content in upsertRecord to prevent overwriting existing records ([91db4e6](https://github.com/Bl4ckBl1zZ/dokploy/commit/91db4e60c497ccec6addf18a4782d16b159ff709))
* **dns:** paginate the documented Infomaniak products endpoint ([59a7484](https://github.com/Bl4ckBl1zZ/dokploy/commit/59a74849a8d79d3572ca52480d23dc09b1a87411)), closes [#5257](https://github.com/Bl4ckBl1zZ/dokploy/issues/5257)
* **dns:** preserve every value of a Route53 record set ([38e855b](https://github.com/Bl4ckBl1zZ/dokploy/commit/38e855bc5e2625f6a9de1234cc00fa2fe861c7b6))
* **dns:** report an OVH zone refresh failure for what it is ([28f71e7](https://github.com/Bl4ckBl1zZ/dokploy/commit/28f71e727a9b0e279e9e889aa8fbf710ac01056f)), closes [#5258](https://github.com/Bl4ckBl1zZ/dokploy/issues/5258)
* **dns:** represent the Infomaniak apex as a root dot ([2bc22c5](https://github.com/Bl4ckBl1zZ/dokploy/commit/2bc22c520db2893f07ce18b6d09326e3d2f2761d))
* **dns:** restore the original OVH record when a type change fails ([80a6baf](https://github.com/Bl4ckBl1zZ/dokploy/commit/80a6baf58ed63bf1a279dfb5dd411070c844facb)), closes [#5258](https://github.com/Bl4ckBl1zZ/dokploy/issues/5258)
* **dns:** send SRV and CAA values to Cloudflare as structured data ([db2eb4f](https://github.com/Bl4ckBl1zZ/dokploy/commit/db2eb4f60a5ce2b2a114b281b6742a1322d5c517))
* **dns:** spell out the OVH right that lists zones ([f83097b](https://github.com/Bl4ckBl1zZ/dokploy/commit/f83097b80f1567d6566d08a18e3eaab414f25b3f)), closes [#5258](https://github.com/Bl4ckBl1zZ/dokploy/issues/5258)
* docker cleanup hangs silently on false-positive busy-wait match ([#5051](https://github.com/Bl4ckBl1zZ/dokploy/issues/5051)) ([34c5b68](https://github.com/Bl4ckBl1zZ/dokploy/commit/34c5b688ace86c8b863638cb7d617125eae4ddaf)), closes [#5044](https://github.com/Bl4ckBl1zZ/dokploy/issues/5044)
* domain validation false negative on servers with multiple IPs ([9761616](https://github.com/Bl4ckBl1zZ/dokploy/commit/976161647ff30dbec0399d533f64b324f175dc95)), closes [#4658](https://github.com/Bl4ckBl1zZ/dokploy/issues/4658)
* **domain:** allow single-label hostnames without a TLD ([5d231bf](https://github.com/Bl4ckBl1zZ/dokploy/commit/5d231bf3e3ce27dbb337c1fab7628cf03450b6ce))
* **domains:** add status tooltip to table ([92b628c](https://github.com/Bl4ckBl1zZ/dokploy/commit/92b628c8fcf29ef3bf58437f9cf6866655991fd9))
* **domains:** don't fetch AddDomain queries until the dialog opens ([0f28775](https://github.com/Bl4ckBl1zZ/dokploy/commit/0f28775a1e3deb79da78fc3ba0416eb1dcdbf2a6)), closes [#5279](https://github.com/Bl4ckBl1zZ/dokploy/issues/5279)
* **domains:** include server interface addresses in validation ([e79ed76](https://github.com/Bl4ckBl1zZ/dokploy/commit/e79ed7691fe0a02cf6eb57d3ef5257f9e114e714))
* don't auto-run Health diagnostics on mount ([c741ff3](https://github.com/Bl4ckBl1zZ/dokploy/commit/c741ff36c097be7786ff5453cfb3466ec5d745a7))
* don't cancel schedule deployments running outside the panel process on restart ([#5053](https://github.com/Bl4ckBl1zZ/dokploy/issues/5053)) ([f12ecc3](https://github.com/Bl4ckBl1zZ/dokploy/commit/f12ecc335007aca85b45044f4337c11563b2dae2)), closes [#4986](https://github.com/Bl4ckBl1zZ/dokploy/issues/4986)
* don't leak git provider secrets to non-owner org members ([a426140](https://github.com/Bl4ckBl1zZ/dokploy/commit/a42614004f7e57b6a59f6610bbeeeb650c05c940))
* don't quote .env values for stack deploys ([d183018](https://github.com/Bl4ckBl1zZ/dokploy/commit/d183018201c05c578a1dc26da126dc0f58c6ecc8)), closes [#4694](https://github.com/Bl4ckBl1zZ/dokploy/issues/4694) [#5096](https://github.com/Bl4ckBl1zZ/dokploy/issues/5096) [#5110](https://github.com/Bl4ckBl1zZ/dokploy/issues/5110)
* **editor:** consistent YAML auto-indent on newline ([7ca96f6](https://github.com/Bl4ckBl1zZ/dokploy/commit/7ca96f6087741e928261547725512dfaceae26e6)), closes [#4650](https://github.com/Bl4ckBl1zZ/dokploy/issues/4650)
* eliminate FOUC for whitelabeling across all pages ([26d716b](https://github.com/Bl4ckBl1zZ/dokploy/commit/26d716b34f839315c95c9070da95c384ecaebf86))
* enable tailwindDirectives in biome css parser ([ae2edc7](https://github.com/Bl4ckBl1zZ/dokploy/commit/ae2edc79bfdd3c3270d367cec827148b861484d8))
* enhance error handling and directory management in updateFileMount function ([e4012d8](https://github.com/Bl4ckBl1zZ/dokploy/commit/e4012d857ddbd582bc1f2ba6da7d8d98d8bf9840))
* escape env values written to the Compose .env file so $, #, and quotes survive literally ([ff39cb5](https://github.com/Bl4ckBl1zZ/dokploy/commit/ff39cb51e6b1af7a645be0fea9717ffeb4382d93))
* exclude node_modules/.next from biome scanner, bump to 2.5.7 ([dced797](https://github.com/Bl4ckBl1zZ/dokploy/commit/dced7970ac6de4600030098c11fed238815ac716))
* Fix server card title overflow for responsiveness ([f904a7b](https://github.com/Bl4ckBl1zZ/dokploy/commit/f904a7bd55436bcc7658beae77d26cf808fa1d5c))
* **github-webhook:** apply preview limit only to new previews ([98dbc59](https://github.com/Bl4ckBl1zZ/dokploy/commit/98dbc59a028fa365a84c9e85f73d6ee440a658b8)), closes [#4074](https://github.com/Bl4ckBl1zZ/dokploy/issues/4074)
* **gitlab:** handle missing expires_in in OAuth token response ([fc5b8d0](https://github.com/Bl4ckBl1zZ/dokploy/commit/fc5b8d03e5423010a7b005677cf6b3d1db18fb74)), closes [#4362](https://github.com/Bl4ckBl1zZ/dokploy/issues/4362)
* honour metaName for page titles and show a loading state in requests ([6204415](https://github.com/Bl4ckBl1zZ/dokploy/commit/6204415dc54631e38a22826da7c9171f8ac6aad5))
* improve mount path warning for PostgreSQL by handling multiple data mounts ([c0694eb](https://github.com/Bl4ckBl1zZ/dokploy/commit/c0694eb5b2e32280c2b4709a800b273042941c0f))
* improve responsive layout for application logs page ([24cc455](https://github.com/Bl4ckBl1zZ/dokploy/commit/24cc4551686bf288d0094e604bcbf6ba4736d588))
* invalid replacement placeholder in redirect form ([#5050](https://github.com/Bl4ckBl1zZ/dokploy/issues/5050)) ([3fbd67f](https://github.com/Bl4ckBl1zZ/dokploy/commit/3fbd67fe4d53597b9b77a19bf624f7c1fd6888fd))
* invalidate railpack build cache when env changes ([7da9681](https://github.com/Bl4ckBl1zZ/dokploy/commit/7da96810a821acf296352ea70b04789e56013415))
* keep native log container id in sync when Swarm/compose replaces it ([cf0e8d2](https://github.com/Bl4ckBl1zZ/dokploy/commit/cf0e8d236cef8962796b465e9c468d57dbbed445)), closes [#5134](https://github.com/Bl4ckBl1zZ/dokploy/issues/5134)
* kill deployment log tail when the client disconnects early ([7b89d1f](https://github.com/Bl4ckBl1zZ/dokploy/commit/7b89d1f94818356b91b762b6ee4c667c41d59048))
* **libsql:** validate appName like the other database kinds ([06b3bb2](https://github.com/Bl4ckBl1zZ/dokploy/commit/06b3bb282ae5edeb983d6bac09179e07e3b72e89))
* **lint:** clear Biome 2.5.7 errors inherited from upstream canary ([9e4c4ee](https://github.com/Bl4ckBl1zZ/dokploy/commit/9e4c4eead542435fc17573b4eb374b5c56a8b1e1))
* list stack containers across swarm nodes via docker stack ps ([1f73ebd](https://github.com/Bl4ckBl1zZ/dokploy/commit/1f73ebd0b0f89e827e3294d044a46ac7a29c7539))
* lock sidebar-inset scroll while a modal is open ([dc9c671](https://github.com/Bl4ckBl1zZ/dokploy/commit/dc9c67129e1a96c2171174ff40d87141009590de)), closes [#5064](https://github.com/Bl4ckBl1zZ/dokploy/issues/5064)
* **logs:** don't classify explicit non-error key/values as error ([faf600b](https://github.com/Bl4ckBl1zZ/dokploy/commit/faf600bd88e1293cbe73f91138de707bc7746fa1)), closes [#4538](https://github.com/Bl4ckBl1zZ/dokploy/issues/4538)
* **logs:** require complete no-error values in colon pairs ([60112d8](https://github.com/Bl4ckBl1zZ/dokploy/commit/60112d84a5792716b183b3aba2d2840cbdb54134))
* **logs:** respect log level explicitly declared by structured loggers ([dc2fc40](https://github.com/Bl4ckBl1zZ/dokploy/commit/dc2fc40c3810e7fa7f2e684a3ecda28a9a265aa0))
* make fallback og image url absolute for social scrapers ([15bf663](https://github.com/Bl4ckBl1zZ/dokploy/commit/15bf663aad3a913edc7dd2137c14b947d99f9cd7))
* mark session cookie as Secure when served over HTTPS ([f5c21db](https://github.com/Bl4ckBl1zZ/dokploy/commit/f5c21db1ef47b47f0a1bf3180eaed60373f13c4b)), closes [#4709](https://github.com/Bl4ckBl1zZ/dokploy/issues/4709)
* mkdir parent dir before writing file mount updates ([3a8fad5](https://github.com/Bl4ckBl1zZ/dokploy/commit/3a8fad57e6104872b3c63217632dd737f0a09ce3)), closes [#5152](https://github.com/Bl4ckBl1zZ/dokploy/issues/5152)
* **monitoring:** remove legacy container and default empty cronJob ([bee6918](https://github.com/Bl4ckBl1zZ/dokploy/commit/bee6918d9a7d2403cd02d107705ba0487c24c450))
* normalize email argument before lookup in reset-password ([8db39a8](https://github.com/Bl4ckBl1zZ/dokploy/commit/8db39a8d1584d37f8c4b2dfb673f7712272d0ea2))
* **notifications:** add missing newline to ntfy database backup message ([341f38b](https://github.com/Bl4ckBl1zZ/dokploy/commit/341f38bba66e92bb4be70ee6f46f79910218dd95))
* **notifications:** send server threshold alerts through email, resend, gotify and ntfy channels ([3638c7b](https://github.com/Bl4ckBl1zZ/dokploy/commit/3638c7b35ba3c1b4a63e8a8c28fcd24509bc5da0))
* **notifications:** use real server name in remote threshold alerts ([e19dd43](https://github.com/Bl4ckBl1zZ/dokploy/commit/e19dd432933c1f1f3deaaf4f0dffe25fac21069c))
* only pin --project-directory when compose has mounts ([ec8e645](https://github.com/Bl4ckBl1zZ/dokploy/commit/ec8e6457581117cad5d0ad28ce1f7d3abbadd424)), closes [#5181](https://github.com/Bl4ckBl1zZ/dokploy/issues/5181) [#5230](https://github.com/Bl4ckBl1zZ/dokploy/issues/5230) [#5242](https://github.com/Bl4ckBl1zZ/dokploy/issues/5242) [#5235](https://github.com/Bl4ckBl1zZ/dokploy/issues/5235) [#5230](https://github.com/Bl4ckBl1zZ/dokploy/issues/5230) [#5242](https://github.com/Bl4ckBl1zZ/dokploy/issues/5242)
* only sum currentPriceAmount from the identified plan subscription ([3f6dfba](https://github.com/Bl4ckBl1zZ/dokploy/commit/3f6dfbaaa7e682341f5221543fcc2702a5d4b91b))
* open deployments tab when opening a service from the deployments list ([60ad782](https://github.com/Bl4ckBl1zZ/dokploy/commit/60ad78282ee262c9312a0bddb70cbd4aa42b3498))
* parse Block I/O and Network I/O stats to numeric MB so monitoring charts render ([b3e7a8a](https://github.com/Bl4ckBl1zZ/dokploy/commit/b3e7a8a74ce9c03efd92abe57df6fe9c754b2995))
* parse deploy webhook bodies in the handler so the size limit can be configured ([1c6d333](https://github.com/Bl4ckBl1zZ/dokploy/commit/1c6d333739df7502bf8c3752aa236e253a6422a4))
* pass timezone when removing repeatable schedule job ([4e38925](https://github.com/Bl4ckBl1zZ/dokploy/commit/4e38925119cc22d84cc8b0822aff58ea2b9b48a5))
* persist serverThreshold for gotify/ntfy and guard teams dispatch ([4730807](https://github.com/Bl4ckBl1zZ/dokploy/commit/47308070a820bcbde1c0364e0a4a7000e39d62dd))
* pin traefik routing to the isolated network when isolated deployment is enabled ([a8c35f7](https://github.com/Bl4ckBl1zZ/dokploy/commit/a8c35f750113581fe8a604bb488fca6bb07bfcfa))
* preserve ${VAR} interpolation in .env files ([452b7aa](https://github.com/Bl4ckBl1zZ/dokploy/commit/452b7aa2f2a3e18f6ad80bfb185f2380b23d2013)), closes [#5151](https://github.com/Bl4ckBl1zZ/dokploy/issues/5151)
* preserve application status when saving provider settings ([0d6e984](https://github.com/Bl4ckBl1zZ/dokploy/commit/0d6e984b5405fc6a76ce9f6e617c7409f7d5f7e1))
* preserve compose status when saving provider settings ([#5544](https://github.com/Bl4ckBl1zZ/dokploy/issues/5544)) ([560e790](https://github.com/Bl4ckBl1zZ/dokploy/commit/560e790e733f7335cbe5beef36a035823bdf56f5))
* preserve parameter expansion (${VAR:-default}) in .env interpolation ([b67519e](https://github.com/Bl4ckBl1zZ/dokploy/commit/b67519ebd51f430b7122f222282c218e8b4b90c3))
* preserve selected log container on refetch ([d7c152a](https://github.com/Bl4ckBl1zZ/dokploy/commit/d7c152af0dd12c3a0cc5268066ecffe0feb2f7dc))
* preserve selected stack log container ([a5b8626](https://github.com/Bl4ckBl1zZ/dokploy/commit/a5b86263458b43261ae023cf1eaeaf2ea92f7ae4))
* preserve server schedule failures through tee pipeline ([eb80f79](https://github.com/Bl4ckBl1zZ/dokploy/commit/eb80f79862b751029de4ba3a4fe655003926850a))
* preserve stack log selection on fetch failures ([2221b8a](https://github.com/Bl4ckBl1zZ/dokploy/commit/2221b8a99cb70d85a7a7527540f64151ca0c0bc9))
* prevent deployment commit hash overflow on mobile ([d6ec4bd](https://github.com/Bl4ckBl1zZ/dokploy/commit/d6ec4bd3d14e4165deb890187a242a6bf235b66e))
* prevent Postgres 100-argument limit crash and restore data parity for restricted-member project access ([2cb499f](https://github.com/Bl4ckBl1zZ/dokploy/commit/2cb499fb64f05ddfccbc6b539b091d605935122c))
* prevent unsaved organization form fields from resetting on window focus ([f46cd46](https://github.com/Bl4ckBl1zZ/dokploy/commit/f46cd4601ca742bb747e542a8ef02113e94b1821))
* **preview-deployment:** refetch github provider before authenticating ([30e8d9b](https://github.com/Bl4ckBl1zZ/dokploy/commit/30e8d9b86e04b7bcfbf39bbf1d294618d8fcbbfe)), closes [#4898](https://github.com/Bl4ckBl1zZ/dokploy/issues/4898)
* reap HEALTHCHECK zombies by running tini as PID 1 ([dec05ac](https://github.com/Bl4ckBl1zZ/dokploy/commit/dec05aca227bb119f653da0f1c489e9ae95aec8c))
* redact S3 credentials in backup logs regardless of shell quoting ([6215c7f](https://github.com/Bl4ckBl1zZ/dokploy/commit/6215c7f159dfaa3b57f78b7e021932c0c14a80e0))
* redact S3 credentials in backup logs regardless of shell quoting ([#5527](https://github.com/Bl4ckBl1zZ/dokploy/issues/5527)) ([916bb50](https://github.com/Bl4ckBl1zZ/dokploy/commit/916bb50e73ba16d0f770eb311611a316371394d5))
* remove empty routers/services traefik config instead of writing invalid yaml ([032e804](https://github.com/Bl4ckBl1zZ/dokploy/commit/032e80411472d5a8b31ad61ba1176b94744b5803)), closes [#5189](https://github.com/Bl4ckBl1zZ/dokploy/issues/5189)
* remove Route53 endpoint override and pin AWS SDK to an aged version ([02edd6a](https://github.com/Bl4ckBl1zZ/dokploy/commit/02edd6abe75e8f4baf8c6173d4a68cb1f189575f))
* replace metaTitle with ogImageUrl in reset payloads ([13b043e](https://github.com/Bl4ckBl1zZ/dokploy/commit/13b043edd97b387616e583e3630d3b3effb7cef2))
* report remote-node containers correctly in stack monitoring ([0efe7fe](https://github.com/Bl4ckBl1zZ/dokploy/commit/0efe7feaf586de24ad521bc4d7bd2e12f4e3532e))
* **requests:** guard RequestHost before filtering to avoid crash on malformed logs ([314a31d](https://github.com/Bl4ckBl1zZ/dokploy/commit/314a31dc27d9edb2f2042e18191a169c29dd4792))
* reset stack log selection when switching modes ([60612b0](https://github.com/Bl4ckBl1zZ/dokploy/commit/60612b098602688b726eb6f6b914a2920a3b648f))
* resolve @ to the zone's apex domain before sending it to the provider ([37f0bba](https://github.com/Bl4ckBl1zZ/dokploy/commit/37f0bba43f1aef8001bf9f4f00723b8eea234627))
* resolve 6 critical Dependabot alerts ([1958969](https://github.com/Bl4ckBl1zZ/dokploy/commit/19589694ea740914819ae738088323fad17e8fab))
* resolve environment variables on application rollback ([2739690](https://github.com/Bl4ckBl1zZ/dokploy/commit/2739690758cbc96810b0c66e1923bc9d912a60af))
* resolve relative bind mounts against code dir for git-based compose deploys ([87b9149](https://github.com/Bl4ckBl1zZ/dokploy/commit/87b914996f37b2238dd09b362c0105d65b0465dc)), closes [#5181](https://github.com/Bl4ckBl1zZ/dokploy/issues/5181)
* resolve security vulnerabilities in whitelabeling ([6282b6e](https://github.com/Bl4ckBl1zZ/dokploy/commit/6282b6ef398df31b133685f9b1dba43a9350188d))
* resolve SVG unicode base64 encoding error and image upload race conditions ([8806d4e](https://github.com/Bl4ckBl1zZ/dokploy/commit/8806d4ef8078fa55c5d4d2c71129072ff0e3ead0))
* **restore:** drop USE/CREATE DATABASE statements so mysql/mariadb restores target the selected database ([2505c34](https://github.com/Bl4ckBl1zZ/dokploy/commit/2505c347bc9cbccc071f120a1bb5f4923d434c5e))
* return a valid docker host for docker desktop ([3e11897](https://github.com/Bl4ckBl1zZ/dokploy/commit/3e1189776238cd6fd24b75ec531146f210bc67bf))
* run database dump once per backup and clean up partial uploads on failure ([f633d4b](https://github.com/Bl4ckBl1zZ/dokploy/commit/f633d4b0a35a9b099f5a632b1bc485c726be846b))
* run Railpack install with sudo during remote deploy ([679dbf9](https://github.com/Bl4ckBl1zZ/dokploy/commit/679dbf98cb92104eedd9797a0395ebebd54afede)), closes [#5007](https://github.com/Bl4ckBl1zZ/dokploy/issues/5007)
* satisfy HttpRouter type in traefik config test ([22450ab](https://github.com/Bl4ckBl1zZ/dokploy/commit/22450abc4b4a6633c7f3fd1922ac8c3862f2a905))
* **schedule:** return deployment metadata from runManually and fail early on missing container ([cbb3450](https://github.com/Bl4ckBl1zZ/dokploy/commit/cbb3450b9346c40c83b5209c6fdc51f1d89524c8))
* **security:** escape compose domain error message to prevent command injection ([a83b202](https://github.com/Bl4ckBl1zZ/dokploy/commit/a83b2026f64a6bb6ed8e0825d687fa19cb6dbda8))
* **security:** update Traefik from v3.6.7 to v3.6.20 ([cee6742](https://github.com/Bl4ckBl1zZ/dokploy/commit/cee674235f648a2f9a6e63b712bb7a39e2c5a568))
* **security:** update Traefik to v3.6.25 ([36db6f5](https://github.com/Bl4ckBl1zZ/dokploy/commit/36db6f589a5c0b5561ee800db48d7821d7516791))
* **server-health:** detect custom default-address-pools via docker info ([ea3f9f3](https://github.com/Bl4ckBl1zZ/dokploy/commit/ea3f9f3b53354f23204f4f7067eb1ce59c2a11b0)), closes [#5383](https://github.com/Bl4ckBl1zZ/dokploy/issues/5383)
* **server:** allow plus, at, and valid path characters in readValidDirectory ([bd8ba12](https://github.com/Bl4ckBl1zZ/dokploy/commit/bd8ba128cd0cbf0c8ff934822047d362b23547ab))
* **server:** sanitize sshd config values in security audit JSON output ([09ea766](https://github.com/Bl4ckBl1zZ/dokploy/commit/09ea766fb512a556d92d85c239656f10c4de23df))
* **setup:** use Docker 29.4.2 on Ubuntu 26.04 to fix install failure ([b9a8064](https://github.com/Bl4ckBl1zZ/dokploy/commit/b9a8064371354052a574b23fbd6fe3fcb01b7889)), closes [#4327](https://github.com/Bl4ckBl1zZ/dokploy/issues/4327) [#4349](https://github.com/Bl4ckBl1zZ/dokploy/issues/4349) [#4501](https://github.com/Bl4ckBl1zZ/dokploy/issues/4501)
* sort imports in domain.ts (biome) ([286938b](https://github.com/Bl4ckBl1zZ/dokploy/commit/286938bbbbfa8090bc5dda5981a83cd5046d07d3))
* **sso:** trust admin-configured SSO providers for account linking ([67f6890](https://github.com/Bl4ckBl1zZ/dokploy/commit/67f6890fc80345f17db2e53a37e792d8051d91e5)), closes [#5099](https://github.com/Bl4ckBl1zZ/dokploy/issues/5099)
* strip git provider secrets from compose.one response ([6239073](https://github.com/Bl4ckBl1zZ/dokploy/commit/6239073e2a25d4c1e20d15971e9589e611544b50))
* surface native stack inspection failures ([49055a0](https://github.com/Bl4ckBl1zZ/dokploy/commit/49055a05b17bbe26543cf18a2e958bc14b2b03ad))
* surface the error state instead of "No results." when the log query fails ([7e9b77e](https://github.com/Bl4ckBl1zZ/dokploy/commit/7e9b77e93f9bae7a5dd8d156066339d55614dd6b))
* sync pnpm-lock.yaml with nanoid 3.3.18 ([ad00669](https://github.com/Bl4ckBl1zZ/dokploy/commit/ad00669f0f328215aea58e3bf35474f315fd83c6))
* sync terminal size with backend PTY, avoid connecting with placeholder container ID ([ff275fe](https://github.com/Bl4ckBl1zZ/dokploy/commit/ff275fe94efd23a675692fc62838f699c7ff5b38)), closes [#5092](https://github.com/Bl4ckBl1zZ/dokploy/issues/5092) [xtermjs/xterm.js#5011](https://github.com/xtermjs/xterm.js/issues/5011)
* **terminal:** prevent terminal from collapsing on zoom ([5c19d1b](https://github.com/Bl4ckBl1zZ/dokploy/commit/5c19d1b70405ec81d67483f57af5405748e8facb))
* tooltip incorrectly lists volumes among Daily Cleanup targets ([4032895](https://github.com/Bl4ckBl1zZ/dokploy/commit/403289517653371f36e9b0ae8eeea7a64c8b5483)), closes [#3267](https://github.com/Bl4ckBl1zZ/dokploy/issues/3267)
* **traefik:** skip empty service reconnect ([ede4626](https://github.com/Bl4ckBl1zZ/dokploy/commit/ede46263965d55ef6453dba4e5e974d1ab2540a0))
* **typecheck:** fix twoFactorRedirect typescript error ([f23b5b9](https://github.com/Bl4ckBl1zZ/dokploy/commit/f23b5b9532f52c7ed5f528c9ac69713a3c55bcba))
* **ui:** align close button in web server update modal ([0c19973](https://github.com/Bl4ckBl1zZ/dokploy/commit/0c19973fbf74b552c8f26c71fdef57a5c32fea91))
* **ui:** change filter layout breakpoint to lg to prevent overflow on tablets ([1e9873b](https://github.com/Bl4ckBl1zZ/dokploy/commit/1e9873b3e4fcb6a3dbf2231f17cf3dac796f8170))
* **ui:** expose isStaticSpa toggle for nixpacks + publish directory ([94098b2](https://github.com/Bl4ckBl1zZ/dokploy/commit/94098b2686c809ec8f1bafa8f18aa69a8c268dff)), closes [#4993](https://github.com/Bl4ckBl1zZ/dokploy/issues/4993)
* **ui:** keep dropdown menus open on window blur ([081cf3f](https://github.com/Bl4ckBl1zZ/dokploy/commit/081cf3fb80093390b2c0aab2ed2a57961b72e55d))
* **ui:** persist trigger type selection in GitHub provider forms ([15bc4b5](https://github.com/Bl4ckBl1zZ/dokploy/commit/15bc4b5dc5053bb6dd0638ca59f9d6576c06206a))
* **ui:** prevent collapsed avatar clipping ([9999f0a](https://github.com/Bl4ckBl1zZ/dokploy/commit/9999f0a18e0209f44ec23ff75b3e23ea3633b6dd)), closes [Dokploy/dokploy#4946](https://github.com/Dokploy/dokploy/issues/4946)
* **ui:** prevent layout shift in log counter using tabular-nums ([bb0c59f](https://github.com/Bl4ckBl1zZ/dokploy/commit/bb0c59fc5c30fe0168f53a02b47ee0893f654416))
* **ui:** prevent tooltips from getting stuck when server modals close ([35d26a8](https://github.com/Bl4ckBl1zZ/dokploy/commit/35d26a806b878d2937da3c638512591073ed2bee))
* **ui:** remove early return to render theme-aware favicon immediately ([689ae51](https://github.com/Bl4ckBl1zZ/dokploy/commit/689ae51ee75db7704f977d8e66b77687d095a867))
* **ui:** resolve tooltips overlapping open modals on remote servers page ([a4a13b9](https://github.com/Bl4ckBl1zZ/dokploy/commit/a4a13b90b8e0102d73273ca1f48fd96e9f2ab2ff))
* **ui:** scope deployment delete loading ([268ec1f](https://github.com/Bl4ckBl1zZ/dokploy/commit/268ec1f397ad8573787aa98639e421552c492635))
* **ui:** show real status code on error page ([325c2a4](https://github.com/Bl4ckBl1zZ/dokploy/commit/325c2a4180a2a0e0896d9ab92ba062a6e732a67f))
* **ui:** standardize settings layout widths to full width ([a6c1f30](https://github.com/Bl4ckBl1zZ/dokploy/commit/a6c1f3048fd5ea90d61621b9ec14528a679084b2))
* **ui:** structurally resolve unclickable watch path badges ([ae95485](https://github.com/Bl4ckBl1zZ/dokploy/commit/ae95485b74f56c98283ed8e1d7ab6da8e6f15575))
* **ui:** track concurrent deployment deletes ([6e79270](https://github.com/Bl4ckBl1zZ/dokploy/commit/6e792704239f6da2059249b78ca60f0f1ac05bb4))
* **ui:** truncate organization name properly in sidebar without clipping descenders ([bbca400](https://github.com/Bl4ckBl1zZ/dokploy/commit/bbca400a6d1e4f8fc8cfc0f618ff93bd028c625c))
* **ui:** unify tab header styles across backups, schedules, volume backups and patches ([3951247](https://github.com/Bl4ckBl1zZ/dokploy/commit/3951247ebd15dfba4f93e51b30a78787dfdb9563))
* **ui:** update favicon dynamically based on app theme ([9be96d4](https://github.com/Bl4ckBl1zZ/dokploy/commit/9be96d4195d80819b6824c8d77fc22100bf2a2d8)), closes [#4100](https://github.com/Bl4ckBl1zZ/dokploy/issues/4100)
* **ui:** vertically align enable submodules and improve watchpath button a11y ([a94f8b9](https://github.com/Bl4ckBl1zZ/dokploy/commit/a94f8b96d3615cae3d1e4e11bd2fa398e5aefd51))
* **ui:** widen restore backup dialog to match other backup dialogs ([5ae289c](https://github.com/Bl4ckBl1zZ/dokploy/commit/5ae289cae3c668defe2b8d4f2a73b2ee63cf127c))
* use dockerode API instead of shell docker ps for changePassword container lookup ([41d355c](https://github.com/Bl4ckBl1zZ/dokploy/commit/41d355c7dc7fd1d1945a1720e57c4cbc7d7e634a)), closes [#5108](https://github.com/Bl4ckBl1zZ/dokploy/issues/5108)
* use lazy initializer for useState with function calls ([43f9f54](https://github.com/Bl4ckBl1zZ/dokploy/commit/43f9f545c684e067e367ad4d07f0307734291ca4))
* use proper linting ([f3c7edc](https://github.com/Bl4ckBl1zZ/dokploy/commit/f3c7edcfd6af736aa869daa9c3d5cb89a3232bd6))
* use updateJob to replace repeatable schedule job on update in cloud ([91bcf88](https://github.com/Bl4ckBl1zZ/dokploy/commit/91bcf88df9fcb2cb75e4fa1a913509c90bae9b5f)), closes [#5233](https://github.com/Bl4ckBl1zZ/dokploy/issues/5233)
* **vault:** expand Infisical secret references when listing secrets ([6e760da](https://github.com/Bl4ckBl1zZ/dokploy/commit/6e760da93bb47a427d2c284e907473fa52860d58))
* **vault:** read Infisical secrets pulled in through an import ([0c1dfe9](https://github.com/Bl4ckBl1zZ/dokploy/commit/0c1dfe978c237ff91cdff0e64ac0d21fa9c39c0d)), closes [#5413](https://github.com/Bl4ckBl1zZ/dokploy/issues/5413)
* verify server ownership before running IP detection ([4b7a629](https://github.com/Bl4ckBl1zZ/dokploy/commit/4b7a6295fc88decc3d032d1bb058bdd4f77cb2a2)), closes [#5214](https://github.com/Bl4ckBl1zZ/dokploy/issues/5214)
* verify swarm task convergence before marking db deploys done ([5624dff](https://github.com/Bl4ckBl1zZ/dokploy/commit/5624dff5c1d4ea72f80cee649c93634212673219))
* **volume-backups:** preserve backup failure status ([c6ab76f](https://github.com/Bl4ckBl1zZ/dokploy/commit/c6ab76fe09093dfacd6d11ddde36e3b7f77719ae))
* **volume-backups:** restart services after backup failure ([2598a62](https://github.com/Bl4ckBl1zZ/dokploy/commit/2598a6277153e32638b4bf31e365f9b5f1e833b2))
* warn when the postgres image implies a data directory that mismatches the mounted volume ([6a10923](https://github.com/Bl4ckBl1zZ/dokploy/commit/6a10923a505db2669b6faad78bfb0b4effde83d3))
* **webhook:** include added and removed files in watchPaths validation ([2df02f5](https://github.com/Bl4ckBl1zZ/dokploy/commit/2df02f596afe6cd8e9cd4c015d2393cea709a252))
* write remote traefik config via SFTP instead of exec+base64 ([68a0555](https://github.com/Bl4ckBl1zZ/dokploy/commit/68a05551d04142b541090aea81685e8190b1d0c6))


### Features

* account deletion for Dokploy Cloud ([a87a5c0](https://github.com/Bl4ckBl1zZ/dokploy/commit/a87a5c06f0755465be8e09586676ccbb66bbc338))
* add "Deploy with Fresh Volumes" button for Docker Compose projects ([36ba9fc](https://github.com/Bl4ckBl1zZ/dokploy/commit/36ba9fcb3e8152b067cdc178f3993fdaef793a21))
* add @aws-sdk/client-secrets-manager dependency to pnpm-lock.yaml ([fada032](https://github.com/Bl4ckBl1zZ/dokploy/commit/fada032f72a7ce72e9ac5f01f65b262130f79001))
* add AWS Secrets Manager client dependency ([be9c826](https://github.com/Bl4ckBl1zZ/dokploy/commit/be9c8260c64b47bcbe6b269d8bc72e73eec6720b))
* add baseUrl to github provider to support github enterprise url ([1cf81e3](https://github.com/Bl4ckBl1zZ/dokploy/commit/1cf81e3802296e0584e1437e55f56cf0e6f11d64))
* add DNS provider integration (Cloudflare, AWS Route53) ([4d58f39](https://github.com/Bl4ckBl1zZ/dokploy/commit/4d58f3987fafe570e1b7b6f53c113fefee366b05))
* add Docker events tab to docker dashboard ([daba2d7](https://github.com/Bl4ckBl1zZ/dokploy/commit/daba2d7fbcdbc1f0c1d26dfa9a0d2f6bb65330dc))
* add Docker Health diagnostics tab ([4bf6dff](https://github.com/Bl4ckBl1zZ/dokploy/commit/4bf6dfff13154318dfa77a09fc8c74ccdf17d80b))
* add drag-and-drop logo upload for organizations ([0393c26](https://github.com/Bl4ckBl1zZ/dokploy/commit/0393c2635bf0a4314792d6bd19901b07e81e2977))
* add dynamic open graph metadata for enterprise whitelabeling ([b5c3d86](https://github.com/Bl4ckBl1zZ/dokploy/commit/b5c3d8660ecaea1c7d928362df29e7e018a1cd85))
* add dynamic open graph metadata for link previews ([#5348](https://github.com/Bl4ckBl1zZ/dokploy/issues/5348)) ([2d5a6ef](https://github.com/Bl4ckBl1zZ/dokploy/commit/2d5a6ef679e43e0373bf68993f850487a2f2b490))
* add go-to-page input to Docker events pagination ([3be9cdf](https://github.com/Bl4ckBl1zZ/dokploy/commit/3be9cdfe65ecbcdb68bbb57b80f33dcd86642bf7))
* add Images and Disk Usage tabs to docker dashboard ([c2071bb](https://github.com/Bl4ckBl1zZ/dokploy/commit/c2071bbbfd583f5e33b807899f4857d3d325d20a))
* add Infomaniak DNS provider support ([ff3ebef](https://github.com/Bl4ckBl1zZ/dokploy/commit/ff3ebefc70dbb283cfc2767f3937a3f5fa2d6a6b))
* add OpenPanel analytics to cloud version ([2f7f50a](https://github.com/Bl4ckBl1zZ/dokploy/commit/2f7f50aec5486a225061f6db6050c0f04a34c8f0))
* add Overview dashboard (Services, Backups & Domains tabs) ([046a608](https://github.com/Bl4ckBl1zZ/dokploy/commit/046a608f8c02534eb1fd00b7d47bbb288ac8e628))
* add OVHcloud DNS provider support ([e629248](https://github.com/Bl4ckBl1zZ/dokploy/commit/e629248deab2a1a79b0e1741971a8966659f8ce4))
* add Porkbun DNS provider support ([74d2d41](https://github.com/Bl4ckBl1zZ/dokploy/commit/74d2d41961863989789cb2f2af67bb4a6b2e61bf))
* add session management page (list active sessions + revoke) ([7728e5e](https://github.com/Bl4ckBl1zZ/dokploy/commit/7728e5ea9eae130f69c0d52e77f6979663ef1d95))
* add sorting and pagination to Docker events table ([fa7a54b](https://github.com/Bl4ckBl1zZ/dokploy/commit/fa7a54b4eba69ff6648c3653b05174f453cbd0a7))
* add target_version input, replace extra_pairs field ([a504449](https://github.com/Bl4ckBl1zZ/dokploy/commit/a504449f1dfedcd78acab809f489bb346d01e189))
* add upgrade integration test workflow (manual, matrix-based) ([55704ff](https://github.com/Bl4ckBl1zZ/dokploy/commit/55704ff98fff53a1c36fa79497efff4a062c7d52))
* add user filtering to session management and update search functionality ([a2329ae](https://github.com/Bl4ckBl1zZ/dokploy/commit/a2329aed2668cddd18585ce830a360d72cd906bf))
* add volumes section and file explorer for containers and volumes ([d0eb6ef](https://github.com/Bl4ckBl1zZ/dokploy/commit/d0eb6ef1ca70bb0364b60b017fb8855b59033e11))
* **ai:** add Perplexity integration attribution ([f2ba262](https://github.com/Bl4ckBl1zZ/dokploy/commit/f2ba262499025f22913c77461f12476eadc5d5b1))
* allow reset-password script to target a specific user by email ([dada304](https://github.com/Bl4ckBl1zZ/dokploy/commit/dada3049a84768c134f127c447e4489fb9bfd87e))
* **auth:** add passkey support via better-auth ([7b0bcee](https://github.com/Bl4ckBl1zZ/dokploy/commit/7b0bcee65248dc17a4cf50b285475d270f57cb87))
* bulk import secrets from vault providers ([50acb79](https://github.com/Bl4ckBl1zZ/dokploy/commit/50acb791cd256f197f94c8cd26f98abf1c757ef0))
* **ci:** add hotfix cherry-pick and release workflows ([2f8af90](https://github.com/Bl4ckBl1zZ/dokploy/commit/2f8af90da4c319dabf0358577bafb929ddcb52ee))
* cloud onboarding wizard, billing trial card, and post-checkout server setup ([2e2e0c8](https://github.com/Bl4ckBl1zZ/dokploy/commit/2e2e0c8c29120f7bc7c236631e41d6c1f8cb0014))
* **compose:** add pull latest images on deploy toggle ([49b8214](https://github.com/Bl4ckBl1zZ/dokploy/commit/49b8214e5dc67672722d694f0c3371b638db6f11))
* **compose:** support AI models in Compose specification ([29cdc81](https://github.com/Bl4ckBl1zZ/dokploy/commit/29cdc815db49c52125b4a9f026cbc3e829485fbb))
* consecutive upgrade pairs, drop curated pair and extra_pairs input ([eaec680](https://github.com/Bl4ckBl1zZ/dokploy/commit/eaec68023ede4fd9f37ef9212d204c83175b3b39))
* **dns:** rework provider management and support all record types ([9c4ad14](https://github.com/Bl4ckBl1zZ/dokploy/commit/9c4ad14c7084005186169e4c396df54841a60882))
* **domains:** add enable/disable toggle for domains ([ee802cd](https://github.com/Bl4ckBl1zZ/dokploy/commit/ee802cd54cd875fa4fc19bd96bde8c395a683151))
* **domains:** show redeploy hint on all compose domain actions ([898af1f](https://github.com/Bl4ckBl1zZ/dokploy/commit/898af1f74ccc5fb7480f5146fd1c1f7a843cde97))
* enable Google Tag Manager on cloud version only ([aedb35b](https://github.com/Bl4ckBl1zZ/dokploy/commit/aedb35b8dfee9731d44152d7e8e3b0647cd42981))
* enhance vault provider access control and environment variable handling ([9747e83](https://github.com/Bl4ckBl1zZ/dokploy/commit/9747e832acf70c387ee9711628c66b696872c254))
* enhance vault provider management and environment variable resolution ([f662242](https://github.com/Bl4ckBl1zZ/dokploy/commit/f6622428f7d28b6cf3a307ad57a723e9d8161dff))
* implement session management with filtering and sorting capabilities ([f6c1e77](https://github.com/Bl4ckBl1zZ/dokploy/commit/f6c1e7727902cbd5b149d15a1e46e9dad197e857))
* implement utility functions to streamline owner selection for backups and domains ([d770e3c](https://github.com/Bl4ckBl1zZ/dokploy/commit/d770e3ce7d086d2df8ab8fe0bd52d5615550e690))
* integrate vault provider management and environment variable resolution ([b8822a1](https://github.com/Bl4ckBl1zZ/dokploy/commit/b8822a1fde29b5dfffafc690efb52f918fe114d9))
* interactive feature showcase on the signup panel ([ac9ad72](https://github.com/Bl4ckBl1zZ/dokploy/commit/ac9ad7287555f1752a27dd74b8ec3bf071bf621b))
* list associated services in delete server modal ([0276021](https://github.com/Bl4ckBl1zZ/dokploy/commit/02760212f7d26be27ed08ecc7a9ba48bae1576f1))
* make organization selector larger and searchable ([#5052](https://github.com/Bl4ckBl1zZ/dokploy/issues/5052)) ([3cad115](https://github.com/Bl4ckBl1zZ/dokploy/commit/3cad115155bf6b2c25e4faf4c8449b2c32556f18)), closes [#5043](https://github.com/Bl4ckBl1zZ/dokploy/issues/5043)
* move deployments into an overview page tab ([518ee44](https://github.com/Bl4ckBl1zZ/dokploy/commit/518ee44ea63f825086232bc7fcbbb6da33379f4f))
* **networks:** add MTU option to network creation ([69a5615](https://github.com/Bl4ckBl1zZ/dokploy/commit/69a56155447a482cd90877d5d1e99802a03f38f9))
* **organization:** allow setting a default role for new members ([aaf8d7e](https://github.com/Bl4ckBl1zZ/dokploy/commit/aaf8d7e12f8786fbd19d3ea01d44b73a4c034d15))
* **permissions:** add server.terminal to decouple server access from root SSH ([bbde5eb](https://github.com/Bl4ckBl1zZ/dokploy/commit/bbde5ebbc3937c4ce1661811f3f16164513592ca))
* refactor serviceColumns for project access and enhance data retrieval ([479e8bb](https://github.com/Bl4ckBl1zZ/dokploy/commit/479e8bb551bb0b226a8c7477d7d732ab73ff409e))
* remove unnecesary checks for ip and comments ([14be318](https://github.com/Bl4ckBl1zZ/dokploy/commit/14be31850236d4eb6be4677e95a93d90fa2747ad))
* restrict self-service account deletion to cloud organization owners ([318ad36](https://github.com/Bl4ckBl1zZ/dokploy/commit/318ad36967af64379b63c70176228a735581197c))
* track cloud sign_up event in dataLayer ([d8b7c1e](https://github.com/Bl4ckBl1zZ/dokploy/commit/d8b7c1ea5e892c93b408b3d9dfcddb0fdb3c50af))
* **transfer:** move services between servers with their volumes, mounts and config ([9dcdb53](https://github.com/Bl4ckBl1zZ/dokploy/commit/9dcdb53aa1620bb26fd33da2c2ef1f87ac4a430c))
* **trial-banner:** add trial banner component to display trial status in sidebar ([988f5b6](https://github.com/Bl4ckBl1zZ/dokploy/commit/988f5b64d66b72463a1149c2933a4898e356ffda))
* **trial-notifications:** add email notification for expiring trials and integrate with webhook ([a0e1001](https://github.com/Bl4ckBl1zZ/dokploy/commit/a0e1001808817dfc6950b42aaf8f883dc21d81e1))
* **ui:** inline deployments filter bar and fix layout jumping ([26317e9](https://github.com/Bl4ckBl1zZ/dokploy/commit/26317e9126d20eca1aed1b0d095fbacc5b1c1075))
* **ui:** smart truncation tooltips, org name limits, and logo UI polish ([#5345](https://github.com/Bl4ckBl1zZ/dokploy/issues/5345)) ([1a29694](https://github.com/Bl4ckBl1zZ/dokploy/commit/1a2969448178a2a0db0822e4158550301c891acf))
* update icons for Sessions and S3 Destinations in the sidebar menu ([c61163d](https://github.com/Bl4ckBl1zZ/dokploy/commit/c61163d721ee84959be06757ea516ba42ddfe1ab))
* upgrade to TypeScript 7 and Next.js 16.3 ([71521f2](https://github.com/Bl4ckBl1zZ/dokploy/commit/71521f2711d1c96ae06f908f5e5c22d8a863de7c))
* **vault:** add AWS Parameter Store provider ([1d26fdd](https://github.com/Bl4ckBl1zZ/dokploy/commit/1d26fdd027b9a09e01a4902f61f9d13407d9421d))
* **vault:** add Phase.dev secrets provider ([80859dc](https://github.com/Bl4ckBl1zZ/dokploy/commit/80859dc5b6cd631d638dfe346cdfc0e2977a9eac)), closes [#5122](https://github.com/Bl4ckBl1zZ/dokploy/issues/5122)
* **vault:** add Scaleway Secret Manager provider ([f238347](https://github.com/Bl4ckBl1zZ/dokploy/commit/f238347ed7b6ab8279d0e430e603a5fb776b9ce3))
* **vault:** address an Infisical folder from the reference ([5611662](https://github.com/Bl4ckBl1zZ/dokploy/commit/56116623511859cc15217999548ab1a7a750f20e))


### Performance Improvements

* **dns:** filter Infomaniak records server-side when upserting ([8409b8c](https://github.com/Bl4ckBl1zZ/dokploy/commit/8409b8ce60da3b5e5cdf08a4620d573f61a32647)), closes [#5257](https://github.com/Bl4ckBl1zZ/dokploy/issues/5257)


### Reverts

* go back to a literal 25mb body limit for deploy webhooks ([82545bf](https://github.com/Bl4ckBl1zZ/dokploy/commit/82545bf500a729bf4e5deb697a215931a6adb5d9))

## [0.41.1](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.41.0...v0.41.1) (2026-07-31)


### Bug Fixes

* **ui:** persist trigger type selection in GitHub provider forms ([18618e7](https://github.com/Bl4ckBl1zZ/dokploy/commit/18618e73e1fff58f0511a1abd2eaf6321abbb4ae))

# [0.41.0](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.40.1...v0.41.0) (2026-07-30)


### Bug Fixes

* avoid postgres 100-argument limit in findRollbackById ([4ba7972](https://github.com/Bl4ckBl1zZ/dokploy/commit/4ba7972ffa6dd0e70ae6078f0788cf61f2c894c5)), closes [#4257](https://github.com/Bl4ckBl1zZ/dokploy/issues/4257)
* avoid postgres 100-argument limit in schedule, volume backup and port queries ([7047e4f](https://github.com/Bl4ckBl1zZ/dokploy/commit/7047e4f199ae494b3176d5d79314561ab3edaeca))
* **domains:** don't render CDN info message as an error in DNS tooltip ([8f0702c](https://github.com/Bl4ckBl1zZ/dokploy/commit/8f0702c4da91074b9ccdcb81fec6cba979d70a86)), closes [#4910](https://github.com/Bl4ckBl1zZ/dokploy/issues/4910)
* enhance server validation in createNetwork function ([d542972](https://github.com/Bl4ckBl1zZ/dokploy/commit/d542972522bda896c0de791bfc29c68e9686a9b0))
* **ui:** make interactive icons inside badges clickable again ([268fd7d](https://github.com/Bl4ckBl1zZ/dokploy/commit/268fd7d7716a72134fc3f553b0d9c4776430c0d4))


### Features

* add network management schema and update related tables ([5f50816](https://github.com/Bl4ckBl1zZ/dokploy/commit/5f508163e55f97380e001a0445d674a5fadd679f))
* add networkIds column to multiple database tables ([efcad7b](https://github.com/Bl4ckBl1zZ/dokploy/commit/efcad7bbf587713248ff36d877206819b1ce6866))
* add new test ([ec74035](https://github.com/Bl4ckBl1zZ/dokploy/commit/ec74035c7030f96fbf42b4c4c25154403832faaf))
* **api:** enhance OpenAPI schema for application endpoints and network validation ([d768adb](https://github.com/Bl4ckBl1zZ/dokploy/commit/d768adb6adb2c7ccd547d19048610f10ba8cb372))
* **audit:** integrate auditing for network operations ([29fcc74](https://github.com/Bl4ckBl1zZ/dokploy/commit/29fcc74ca5d3b2dc9ea0f3b1fdbb291ce5881b51))
* create network table and update related schemas ([e7c38d4](https://github.com/Bl4ckBl1zZ/dokploy/commit/e7c38d4c548694f74e3e68e998704526b00ca22c))
* **icon:** enhance icon management for services ([6e1d020](https://github.com/Bl4ckBl1zZ/dokploy/commit/6e1d0207695ab70be35645baecca20634755b85d))
* implement Docker network management functionality ([6959882](https://github.com/Bl4ckBl1zZ/dokploy/commit/69598821ed33da85e0fab18c930dc6c638fa88cc))
* **network:** add network management schema and update related tables ([99e483c](https://github.com/Bl4ckBl1zZ/dokploy/commit/99e483c1a18b648b46b1de25098c5a7db0dc895a))
* **networks:** add network configuration viewer and enhance network actions ([c578c18](https://github.com/Bl4ckBl1zZ/dokploy/commit/c578c185006aa68b06efc9f596acb4586234c8e7))
* **networks:** enhance network management and UI components ([97885ee](https://github.com/Bl4ckBl1zZ/dokploy/commit/97885ee44a80ddda8f635d57534b02b34c070c85))
* **networks:** enhance network management with server filtering and synchronization ([adcbd6f](https://github.com/Bl4ckBl1zZ/dokploy/commit/adcbd6fd8e6507e3f2f46f5f7d04e9c77e1bf98c))
* **networks:** implement network recreation functionality and enhance synchronization ([8a37626](https://github.com/Bl4ckBl1zZ/dokploy/commit/8a376266369dcdf2e8473429a5464213ac6c7f08))

## [0.40.1](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.40.0...v0.40.1) (2026-07-23)


### Bug Fixes

* prevent environment form from resetting while editing ([86ea311](https://github.com/Bl4ckBl1zZ/dokploy/commit/86ea311714e2ccb057f59b2bef7ac962306acdc0))

# [0.40.0](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.39.1...v0.40.0) (2026-07-22)


### Bug Fixes

* **2fa:** show correct error for invalid TOTP code ([6d65a36](https://github.com/Bl4ckBl1zZ/dokploy/commit/6d65a36aac8c7abd81874e2860a3c102609e06a6))
* **ai:** only show Custom Presets button to owner/admin roles ([366e44b](https://github.com/Bl4ckBl1zZ/dokploy/commit/366e44b75a62c8df2ded805d35d1ac07d9820ca0))
* **auth:** enable email verification for SSO and user creation ([e9b5166](https://github.com/Bl4ckBl1zZ/dokploy/commit/e9b51667e2b6cd742cc61df12730a4749ba8c185))
* **compose:** preserve named-volume access mode when adding suffix ([bc22d05](https://github.com/Bl4ckBl1zZ/dokploy/commit/bc22d05f8dcc9f338e64c795cbee75989e8dc6e9)), closes [#4818](https://github.com/Bl4ckBl1zZ/dokploy/issues/4818)
* rename compose "Reload" action to "Rebuild" ([15fe3b2](https://github.com/Bl4ckBl1zZ/dokploy/commit/15fe3b21c95d3ade145adae9de45ce36b3ae8ea0)), closes [#4666](https://github.com/Bl4ckBl1zZ/dokploy/issues/4666)
* **schedule:** give scheduleType a clean enum type for the host-access gate ([8fe3294](https://github.com/Bl4ckBl1zZ/dokploy/commit/8fe3294a08fa0f4908ac9459fd4f465795eb489c))
* **security:** authenticate and authorize the GitHub App setup callback ([5ae344d](https://github.com/Bl4ckBl1zZ/dokploy/commit/5ae344db5814bfdcd700c5cc8ee8eb1a23af7253))
* **security:** authorize docker/terminal WebSocket handlers ([68f5afa](https://github.com/Bl4ckBl1zZ/dokploy/commit/68f5afae42fca353dcb3d3bc6219ffe9e168cb91))
* **security:** base64-encode remote traefik YAML and escape config paths ([92310dd](https://github.com/Bl4ckBl1zZ/dokploy/commit/92310ddb143c8e67ca95eb7db661838a76579f2e))
* **security:** check service access before server in wss authz, and pass serviceId from log views ([1e354a3](https://github.com/Bl4ckBl1zZ/dokploy/commit/1e354a3cf2b8123f13db880a5c5f33311a470635))
* **security:** command injection in registry.testRegistry/testRegistryById remote path ([d3f522b](https://github.com/Bl4ckBl1zZ/dokploy/commit/d3f522b7a6f5100fc0fc0bff5851e48d11d459e2))
* **security:** enforce org-scope on git provider read endpoints ([071d9ea](https://github.com/Bl4ckBl1zZ/dokploy/commit/071d9eacee9744f13193e92757a7fcd3bab0956a))
* **security:** enforce org-scope on swarm reads and escape nodeId ([5563699](https://github.com/Bl4ckBl1zZ/dokploy/commit/5563699f71b2058b49eebdfd66c6c3dbd92ede9c))
* **security:** enforce organization ownership on server.remove ([4aee66b](https://github.com/Bl4ckBl1zZ/dokploy/commit/4aee66b2d1dc2c027749a541e553aa49947075c1))
* **security:** enforce owner/admin gate on host schedules regardless of service link ([1e3f10b](https://github.com/Bl4ckBl1zZ/dokploy/commit/1e3f10bd22c1c28a7b65a2d7ac15a0a5e47599eb))
* **security:** escape compose path and validate custom compose command ([d48037a](https://github.com/Bl4ckBl1zZ/dokploy/commit/d48037a80203bb0ecaec4f5653aef75fcfdb656d))
* **security:** escape dockerImage in database service remote docker pull ([b24202e](https://github.com/Bl4ckBl1zZ/dokploy/commit/b24202e69b244f0ece8d2f56e99cad9bb5e1a248))
* **security:** escape file paths and remote schedule command in shell invocations ([16b5b72](https://github.com/Bl4ckBl1zZ/dokploy/commit/16b5b7293f9883327a89c69fcb6e5718767b064a))
* **security:** escape S3/rclone args and restore paths to prevent command injection ([eeb6e7b](https://github.com/Bl4ckBl1zZ/dokploy/commit/eeb6e7b8ea88e4b4b1fac8460755464100516ac9))
* **security:** escape swarm nodeId and registry tag in cluster commands ([df2779e](https://github.com/Bl4ckBl1zZ/dokploy/commit/df2779eaeb4a58f0c85d4caa713c776c790fa708))
* **security:** escape user input in docker build/pull commands ([cba0b25](https://github.com/Bl4ckBl1zZ/dokploy/commit/cba0b253c7de4157dd932de7f16a2ad247c7cee9))
* **security:** escape user input in git clone commands across all providers ([47347ab](https://github.com/Bl4ckBl1zZ/dokploy/commit/47347ab885b0ad1f5d0ef0e5e74bbba35c7f93bc))
* **security:** pass db backup/restore identifiers via env vars to avoid injection ([ccd2e83](https://github.com/Bl4ckBl1zZ/dokploy/commit/ccd2e83c57d99f725220d37e0152270e0827d71b))
* **security:** pass serviceId from the remaining terminal entry points ([79c9cf9](https://github.com/Bl4ckBl1zZ/dokploy/commit/79c9cf99e0812ea0e7abc197b2a7707c9500d870))
* **security:** redact git provider secrets from application.one response ([68ea9f7](https://github.com/Bl4ckBl1zZ/dokploy/commit/68ea9f7771afe6acca57032dc4328f93c4f25999))
* **security:** redact SSH private key from server read responses ([439eee4](https://github.com/Bl4ckBl1zZ/dokploy/commit/439eee45edf8cd4c0a886984b6115922c87ff4b2))
* **security:** service access is authoritative for service-scoped wss ops ([eb1f11b](https://github.com/Bl4ckBl1zZ/dokploy/commit/eb1f11b908206c1f4bfe816db453dd7047ef63ed))
* **security:** validate volumeName and escape volume-backup file names ([d629fae](https://github.com/Bl4ckBl1zZ/dokploy/commit/d629faebc6dcb9d4785f84bf30b2b285f9f59379))
* **settings:** allow clearing the server domain ([d5dd35c](https://github.com/Bl4ckBl1zZ/dokploy/commit/d5dd35c8f89f74507a730f3077c630ebf5a66f5b)), closes [#4821](https://github.com/Bl4ckBl1zZ/dokploy/issues/4821)
* **types:** guard git-provider access check for optional id in getBranches ([26cae3b](https://github.com/Bl4ckBl1zZ/dokploy/commit/26cae3b8a99b282c861feb7e99cda71ab35c96bb))
* **ui:** disambiguate repos with the same name in the repository selector ([de62aff](https://github.com/Bl4ckBl1zZ/dokploy/commit/de62aff0fb6119c845ff4e4462ff012ffc8983b6)), closes [#4793](https://github.com/Bl4ckBl1zZ/dokploy/issues/4793)
* **ui:** organization menu clipped when sidebar is collapsed ([3b102fa](https://github.com/Bl4ckBl1zZ/dokploy/commit/3b102fac560df934a20e1efc8f24ecc3e6dfbc99)), closes [#4840](https://github.com/Bl4ckBl1zZ/dokploy/issues/4840)
* **ui:** typos ([12d3f18](https://github.com/Bl4ckBl1zZ/dokploy/commit/12d3f1871cf44e4fb2d8a7bd0249b21020c08a32))
* validate API key name length to prevent opaque 500 ([f577778](https://github.com/Bl4ckBl1zZ/dokploy/commit/f577778667ec40242060ca29d86c5fbdfcabd31f)), closes [#4798](https://github.com/Bl4ckBl1zZ/dokploy/issues/4798)


### Features

* **ai:** allow organizations to define custom AI provider presets ([7ba3853](https://github.com/Bl4ckBl1zZ/dokploy/commit/7ba3853bab2c86713aa56dd11d2ec59905a2a7ab))

## [0.39.1](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.39.0...v0.39.1) (2026-07-15)


### Bug Fixes

* prevent oversized Tailscale resource query ([#30](https://github.com/Bl4ckBl1zZ/dokploy/issues/30)) ([9681abe](https://github.com/Bl4ckBl1zZ/dokploy/commit/9681abe0b040e753bf05c66f3ba7be80ed48443a))

# [0.39.0](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.38.1...v0.39.0) (2026-07-15)


### Features

* add fully managed Tailscale networking ([#29](https://github.com/Bl4ckBl1zZ/dokploy/issues/29)) ([33643e3](https://github.com/Bl4ckBl1zZ/dokploy/commit/33643e32ae5d4ba63b27dccffdbc4fb3eef6de29))

## [0.38.1](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.38.0...v0.38.1) (2026-07-14)


### Bug Fixes

* pre-pull Dokploy self-update image ([#28](https://github.com/Bl4ckBl1zZ/dokploy/issues/28)) ([9afea32](https://github.com/Bl4ckBl1zZ/dokploy/commit/9afea32ae7a2038251cce1293b656b05f8daa83e))

# [0.38.0](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.37.1...v0.38.0) (2026-07-13)


### Features

* **cloudflare:** polish settings experience ([#27](https://github.com/Bl4ckBl1zZ/dokploy/issues/27)) ([03de5fe](https://github.com/Bl4ckBl1zZ/dokploy/commit/03de5fe8b24f9890ac98b403b21c8f2ffa99715f))

## [0.37.1](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.37.0...v0.37.1) (2026-07-13)


### Bug Fixes

* make Dokploy self-updates converge ([a20f130](https://github.com/Bl4ckBl1zZ/dokploy/commit/a20f1301be302f4e9dac3742b91c8ebc2a97f266))

# [0.37.0](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.36.2...v0.37.0) (2026-07-13)


### Bug Fixes

* add docker cleanup toggle to remote server creation ([#4559](https://github.com/Bl4ckBl1zZ/dokploy/issues/4559)) ([e6fc3db](https://github.com/Bl4ckBl1zZ/dokploy/commit/e6fc3db08f7ad65e020854a185bedd2c5c0d091c))
* add method="post" to auth forms to prevent credential leak in URL ([#4683](https://github.com/Bl4ckBl1zZ/dokploy/issues/4683)) ([8b64815](https://github.com/Bl4ckBl1zZ/dokploy/commit/8b6481501e6e379b9ce32c4da4201fcb7a65364a))
* add tls=true label for domains when certificateType is none ([#4018](https://github.com/Bl4ckBl1zZ/dokploy/issues/4018)) ([#4474](https://github.com/Bl4ckBl1zZ/dokploy/issues/4474)) ([103e2f7](https://github.com/Bl4ckBl1zZ/dokploy/commit/103e2f70a8432d028117eddd3e8b346fb2c4a849))
* add type="button" to TooltipTrigger in form components to prevent accidental submission ([#4422](https://github.com/Bl4ckBl1zZ/dokploy/issues/4422)) ([f6e6e5c](https://github.com/Bl4ckBl1zZ/dokploy/commit/f6e6e5cc004d8d54c3f970acf3f84fcd4f0ebc9c))
* **ai:** allow configFiles to be null in template generator Details type ([#4736](https://github.com/Bl4ckBl1zZ/dokploy/issues/4736)) ([38de9ef](https://github.com/Bl4ckBl1zZ/dokploy/commit/38de9ef2183f9237d1fcc084e909ca83a95a731e))
* **ai:** allow Ollama Cloud API key in AI settings ([#4262](https://github.com/Bl4ckBl1zZ/dokploy/issues/4262)) ([ca2708a](https://github.com/Bl4ckBl1zZ/dokploy/commit/ca2708a58aea96109e2f1e33a887b3ea33e5148c))
* **ai:** use nullable instead of optional for configFiles in AI suggestion schema ([#4732](https://github.com/Bl4ckBl1zZ/dokploy/issues/4732)) ([3e11c0a](https://github.com/Bl4ckBl1zZ/dokploy/commit/3e11c0a240d16dc519f7b05505c0fc70a26d5129)), closes [#4267](https://github.com/Bl4ckBl1zZ/dokploy/issues/4267)
* allow members with git providers permission to create and delete their own ([#4713](https://github.com/Bl4ckBl1zZ/dokploy/issues/4713)) ([aa72091](https://github.com/Bl4ckBl1zZ/dokploy/commit/aa720913165ffb924da26ef1177ea407ab6cc55f)), closes [#4695](https://github.com/Bl4ckBl1zZ/dokploy/issues/4695)
* allow square brackets in zip path validation for Next.js dynamic routes ([#4468](https://github.com/Bl4ckBl1zZ/dokploy/issues/4468)) ([af8072d](https://github.com/Bl4ckBl1zZ/dokploy/commit/af8072d7ad33b5fd5b216ae30e3e1fb1a0dade2d))
* automatically converting username to lowercase both in creation of register, and build for extra. ([#4382](https://github.com/Bl4ckBl1zZ/dokploy/issues/4382)) ([6e342ee](https://github.com/Bl4ckBl1zZ/dokploy/commit/6e342ee2f2b728a42c3a5901749c42dfc41b7ef2))
* **backup:** redact S3 credentials from logs and error output ([#4648](https://github.com/Bl4ckBl1zZ/dokploy/issues/4648)) ([f8a3561](https://github.com/Bl4ckBl1zZ/dokploy/commit/f8a3561f1ed906821baf4ec32ca7b1f108bcdc13)), closes [#4621](https://github.com/Bl4ckBl1zZ/dokploy/issues/4621) [#4621](https://github.com/Bl4ckBl1zZ/dokploy/issues/4621)
* copy Dokploy server IP when clicking server badge ([#4390](https://github.com/Bl4ckBl1zZ/dokploy/issues/4390)) ([8d88a34](https://github.com/Bl4ckBl1zZ/dokploy/commit/8d88a34a6459eb99674ab7d238695b0efd6d9b44))
* correct deriveCookieSecret test to validate 16-byte hex secret as per oauth2-proxy requirements ([dfbae18](https://github.com/Bl4ckBl1zZ/dokploy/commit/dfbae18557f8f47b9ed91dc0ab57fa741fe5069b))
* correct git provider access check for existing deploys ([#4570](https://github.com/Bl4ckBl1zZ/dokploy/issues/4570)) ([e9a0932](https://github.com/Bl4ckBl1zZ/dokploy/commit/e9a0932b2393c95e77d18283037fa76e61fbc4b1)), closes [#4469](https://github.com/Bl4ckBl1zZ/dokploy/issues/4469)
* **databases:** resolve crash when opening rebuild database dialog ([4e3a6db](https://github.com/Bl4ckBl1zZ/dokploy/commit/4e3a6db83aa72f2e2532d82da8eb82cda566c442))
* **databases:** update default Redis version from 7 to 8 ([#4224](https://github.com/Bl4ckBl1zZ/dokploy/issues/4224)) ([475a01c](https://github.com/Bl4ckBl1zZ/dokploy/commit/475a01c4a2138d0a2f668553fbb0fc515ecf3c5d)), closes [#4172](https://github.com/Bl4ckBl1zZ/dokploy/issues/4172)
* **deployment:** resolve schedule to its service before permission check in allByType ([#4733](https://github.com/Bl4ckBl1zZ/dokploy/issues/4733)) ([8a0e442](https://github.com/Bl4ckBl1zZ/dokploy/commit/8a0e44291f68189fb3b1b077ff1c9741a2c15959))
* **domain:** validate hostname format to reject invalid characters ([#4729](https://github.com/Bl4ckBl1zZ/dokploy/issues/4729)) ([b2692cd](https://github.com/Bl4ckBl1zZ/dokploy/commit/b2692cd594eb2f6ba92855f9e44157b791511a1e)), closes [#4716](https://github.com/Bl4ckBl1zZ/dokploy/issues/4716)
* don't let ssh-keyscan abort SSH git clones ([#4605](https://github.com/Bl4ckBl1zZ/dokploy/issues/4605)) ([8d44c6a](https://github.com/Bl4ckBl1zZ/dokploy/commit/8d44c6a1e81a133f7daf39babc4455e1802d5998))
* enable comment toggle shortcut in env variable editor ([#4402](https://github.com/Bl4ckBl1zZ/dokploy/issues/4402)) ([#4473](https://github.com/Bl4ckBl1zZ/dokploy/issues/4473)) ([34d38cf](https://github.com/Bl4ckBl1zZ/dokploy/commit/34d38cf90ed861c6adbc34a6a4740608976f37aa))
* enforce docker:read on container start/stop/kill/restart mutations ([#4568](https://github.com/Bl4ckBl1zZ/dokploy/issues/4568)) ([a0288f8](https://github.com/Bl4ckBl1zZ/dokploy/commit/a0288f83d5063436150bcf1cd3ee6ac8520be1a9))
* grant create and delete SSH key permissions when canAccessToSSHKeys is enabled for members ([#4512](https://github.com/Bl4ckBl1zZ/dokploy/issues/4512)) ([4ba0f71](https://github.com/Bl4ckBl1zZ/dokploy/commit/4ba0f7122085cd6fdd4871e85d7e24a2dbea0f50))
* **migrate-auth-secret:** exit cleanly when there are no 2FA records ([9f10f0f](https://github.com/Bl4ckBl1zZ/dokploy/commit/9f10f0f4e979978f753ff42fc6440d6b0a0ce619)), closes [#4392](https://github.com/Bl4ckBl1zZ/dokploy/issues/4392)
* preserve HOME in compose deploy so --with-registry-auth can read docker config ([#4485](https://github.com/Bl4ckBl1zZ/dokploy/issues/4485)) ([85211af](https://github.com/Bl4ckBl1zZ/dokploy/commit/85211afd415f8424f11c109754c5e55a3348e94b)), closes [#4401](https://github.com/Bl4ckBl1zZ/dokploy/issues/4401)
* prevent registry password from appearing in error messages and shell commands ([#4579](https://github.com/Bl4ckBl1zZ/dokploy/issues/4579)) ([1f4f940](https://github.com/Bl4ckBl1zZ/dokploy/commit/1f4f94042f1d874349c42d8ae7fee51346cd086e))
* prevent request path truncation in request logs ([#4643](https://github.com/Bl4ckBl1zZ/dokploy/issues/4643)) ([1bf661b](https://github.com/Bl4ckBl1zZ/dokploy/commit/1bf661b621829f43f895c9b68a1e15f89cdc6c5c)), closes [#4642](https://github.com/Bl4ckBl1zZ/dokploy/issues/4642)
* prevent webhook deploy crash when commit data lacks modified files ([#4470](https://github.com/Bl4ckBl1zZ/dokploy/issues/4470)) ([b06138b](https://github.com/Bl4ckBl1zZ/dokploy/commit/b06138b23002a1fc72e735dc390fb16b4ad44ea9))
* **projects:** make project cards grid fill available width on wide screens ([#4731](https://github.com/Bl4ckBl1zZ/dokploy/issues/4731)) ([b96c5e8](https://github.com/Bl4ckBl1zZ/dokploy/commit/b96c5e865501b047c1a0e1a311d0e77cd83f8ce3))
* refine permission check for privileged static roles in permission service ([95633b4](https://github.com/Bl4ckBl1zZ/dokploy/commit/95633b412221446301c74ebfc50cf0768ce4fe89))
* **registry:** preserve username case for ECR compatibility ([#4632](https://github.com/Bl4ckBl1zZ/dokploy/issues/4632)) ([#4647](https://github.com/Bl4ckBl1zZ/dokploy/issues/4647)) ([ec9dd28](https://github.com/Bl4ckBl1zZ/dokploy/commit/ec9dd289244ba24af0fc4e1d9590fc99eb56b64e))
* **requests:** remove nested ResponsiveContainer breaking chart height ([c9ac723](https://github.com/Bl4ckBl1zZ/dokploy/commit/c9ac7236a77577a134023d91330f84dceab9b577))
* resolve server from parent entity in deployment.readLogs ([#4689](https://github.com/Bl4ckBl1zZ/dokploy/issues/4689)) ([b4e2d27](https://github.com/Bl4ckBl1zZ/dokploy/commit/b4e2d274b1f8320968489fcd9c434bf811cfbd74)), closes [#4687](https://github.com/Bl4ckBl1zZ/dokploy/issues/4687)
* resolve traefik container dynamically in access-log cleanup ([#4646](https://github.com/Bl4ckBl1zZ/dokploy/issues/4646)) ([d87229c](https://github.com/Bl4ckBl1zZ/dokploy/commit/d87229ccd3bc6f9d14e2b52eeeb6ef57ae6181ec)), closes [#4620](https://github.com/Bl4ckBl1zZ/dokploy/issues/4620)
* respect gitProviders permissions in git provider UI ([#4561](https://github.com/Bl4ckBl1zZ/dokploy/issues/4561)) ([c377be0](https://github.com/Bl4ckBl1zZ/dokploy/commit/c377be0a14fbe927018f195042eab2f972e25ffa))
* responsive layout ([#4391](https://github.com/Bl4ckBl1zZ/dokploy/issues/4391)) ([ef0cf9b](https://github.com/Bl4ckBl1zZ/dokploy/commit/ef0cf9bd02be4569b1e0077bc5fd69162b63f097))
* scope dokploy-server schedules to organization instead of user ([#4526](https://github.com/Bl4ckBl1zZ/dokploy/issues/4526)) ([c73632c](https://github.com/Bl4ckBl1zZ/dokploy/commit/c73632cbe0f3eeb03e1d186a6bd98798f3ebc7de)), closes [#4300](https://github.com/Bl4ckBl1zZ/dokploy/issues/4300)
* scope dokploy-server schedules to organization instead of user ([#4526](https://github.com/Bl4ckBl1zZ/dokploy/issues/4526)) ([6ff2ca0](https://github.com/Bl4ckBl1zZ/dokploy/commit/6ff2ca0173e6dffecca73f63b9f896690449a19b)), closes [#4300](https://github.com/Bl4ckBl1zZ/dokploy/issues/4300)
* **server-setup:** report the installed Docker version in the setup banner ([#4723](https://github.com/Bl4ckBl1zZ/dokploy/issues/4723)) ([db0cb66](https://github.com/Bl4ckBl1zZ/dokploy/commit/db0cb66f0dafc855b50131560e6173fbbbe7351c))
* **sso:** apply trusted origin changes without server restart ([b3621bc](https://github.com/Bl4ckBl1zZ/dokploy/commit/b3621bcfff5fb3613fc65ee89f5f1514962c9f72))
* strip credentials from gitProvider.getAll API response ([#4569](https://github.com/Bl4ckBl1zZ/dokploy/issues/4569)) ([6b68fca](https://github.com/Bl4ckBl1zZ/dokploy/commit/6b68fcab8c22d5de646973b438bb057bd03bf213))
* strip credentials from service-level API responses ([#4564](https://github.com/Bl4ckBl1zZ/dokploy/issues/4564)) ([c968a27](https://github.com/Bl4ckBl1zZ/dokploy/commit/c968a2755e85bf76fc97eb6ba15e23c4ff65a5c7))
* swarm health check fields not resetting to default values ([#4558](https://github.com/Bl4ckBl1zZ/dokploy/issues/4558)) ([57ef96a](https://github.com/Bl4ckBl1zZ/dokploy/commit/57ef96a45821fdf1a1b884222ad94954205875e6)), closes [#4553](https://github.com/Bl4ckBl1zZ/dokploy/issues/4553)
* **tag-filter:** update no tags message and improve layout ([8c90040](https://github.com/Bl4ckBl1zZ/dokploy/commit/8c900408bdd779465b3aa6c1ed93f7fb7050849b))
* **ui:** adjust button container to grid layout to prevent overflow in 2FA screen ([01ac309](https://github.com/Bl4ckBl1zZ/dokploy/commit/01ac30974ff3f59fdc46458362c46f46164e0685))
* **ui:** enable vertical scroll on collapsed sidebar ([a296407](https://github.com/Bl4ckBl1zZ/dokploy/commit/a296407c8588f2897f46ff4cb5578ce2468d0339))
* **ui:** improve select component behavior and styling across various providers ([8db1250](https://github.com/Bl4ckBl1zZ/dokploy/commit/8db1250487c7c97f2fa09ebaa183c2cba4cb5a58))
* **ui:** prevent scrollbar layout shift ([71bbbb4](https://github.com/Bl4ckBl1zZ/dokploy/commit/71bbbb44dbd2a74b964daea924457eb9b242400a))
* **ui:** resolve CommandDialog crash on ⌘J shortcut ([17fdd64](https://github.com/Bl4ckBl1zZ/dokploy/commit/17fdd64c10b4643dd0ee590bce2ffb1138876935))
* **ui:** update project name display in environment page ([d7b9f01](https://github.com/Bl4ckBl1zZ/dokploy/commit/d7b9f015677f0b698823c120113e8f1d9b7cd5ef))
* update deriveCookieSecret to meet oauth2-proxy requirements ([c1c887d](https://github.com/Bl4ckBl1zZ/dokploy/commit/c1c887d03c3f7da6b1d3df6563981f9324acfe22))
* update schedule scoping from user to organization ([6a0acd9](https://github.com/Bl4ckBl1zZ/dokploy/commit/6a0acd9cad0a00f2ef09a10124d2d40f57e220f6))
* use create permission for basic auth delete instead of delete ([#4513](https://github.com/Bl4ckBl1zZ/dokploy/issues/4513)) ([d7d6422](https://github.com/Bl4ckBl1zZ/dokploy/commit/d7d642230cde13ba4e493484bba5a9bc294deb42))
* use github owner login for webhook deploy matching ([#4674](https://github.com/Bl4ckBl1zZ/dokploy/issues/4674)) ([f5ded8b](https://github.com/Bl4ckBl1zZ/dokploy/commit/f5ded8b2731e68b66adf17b1cbfdaa53c2f593c0))
* use stop-first update order for all database services ([#4560](https://github.com/Bl4ckBl1zZ/dokploy/issues/4560)) ([e944603](https://github.com/Bl4ckBl1zZ/dokploy/commit/e944603f99df989772fd14945ab317d7b1064733)), closes [#4550](https://github.com/Bl4ckBl1zZ/dokploy/issues/4550)
* use swarm advertise address in docker swarm join command ([#4567](https://github.com/Bl4ckBl1zZ/dokploy/issues/4567)) ([4900204](https://github.com/Bl4ckBl1zZ/dokploy/commit/4900204107a8ccbdd5bccddf50012e73757f0b3b))
* **user:** scope user.get relation columns to reduce SSR payload size ([#4730](https://github.com/Bl4ckBl1zZ/dokploy/issues/4730)) ([3e74f9a](https://github.com/Bl4ckBl1zZ/dokploy/commit/3e74f9a374a2354540a36fc5020d95d586af3871))
* **validation:** allow hashtag in git branch names ([#4714](https://github.com/Bl4ckBl1zZ/dokploy/issues/4714)) ([6431e9b](https://github.com/Bl4ckBl1zZ/dokploy/commit/6431e9b7b0e97f6319051d42768cc3f90c367c00)), closes [feat#123](https://github.com/feat/issues/123) [feat#123](https://github.com/feat/issues/123) [#4585](https://github.com/Bl4ckBl1zZ/dokploy/issues/4585)
* wrap long server names and keep actions menu visible ([#4434](https://github.com/Bl4ckBl1zZ/dokploy/issues/4434)) ([ad680ae](https://github.com/Bl4ckBl1zZ/dokploy/commit/ad680ae108de2b0e98fe6373f2fa7821bffbf3b4))


### Features

* add claim mapping functionality to OIDC registration dialog ([#4712](https://github.com/Bl4ckBl1zZ/dokploy/issues/4712)) ([c2a9587](https://github.com/Bl4ckBl1zZ/dokploy/commit/c2a95870f5815d0cf6066ce466cbe7bb6519314f))
* add self-hosted enterprise restrictions (remote-servers-only, enforce-sso) ([#4511](https://github.com/Bl4ckBl1zZ/dokploy/issues/4511)) ([8018027](https://github.com/Bl4ckBl1zZ/dokploy/commit/801802733057931f6b356d1fb7ed593ebf64612c))
* add SQL migration for lucky echo and update foreign key constraints ([aa545ec](https://github.com/Bl4ckBl1zZ/dokploy/commit/aa545ec71c9fcde002c423e25e817b59858b8695))
* **ci:** attach install.sh from website repo to each release ([d3e0b10](https://github.com/Bl4ckBl1zZ/dokploy/commit/d3e0b100a00331b9f64a8894c01206c3c1b68656))
* **ci:** pin install.sh release asset to the released version ([9749d86](https://github.com/Bl4ckBl1zZ/dokploy/commit/9749d86b4c808607f48893ec9dfe685eac70337d))
* **compose:** add import from base64 in create service dropdown ([754774e](https://github.com/Bl4ckBl1zZ/dokploy/commit/754774ea02d07b02cda9cfbf4e581b230f7ebe98))
* **databases:** add copy button to User and Database Name fields ([#4735](https://github.com/Bl4ckBl1zZ/dokploy/issues/4735)) ([cb23d72](https://github.com/Bl4ckBl1zZ/dokploy/commit/cb23d726fe7970eca8cb68f65855ef50cd38781d)), closes [#4495](https://github.com/Bl4ckBl1zZ/dokploy/issues/4495)
* **deployment:** add readLogs procedure to fetch deployment logs ([558d809](https://github.com/Bl4ckBl1zZ/dokploy/commit/558d8098719039d2523037289c31160633ac25d9))
* **deployment:** add server access validation for deployment actions ([aff200f](https://github.com/Bl4ckBl1zZ/dokploy/commit/aff200f84f30647658149b6487feca7a86f25ac5))
* encrypt environment variables at rest with AES-256-GCM ([1cb9491](https://github.com/Bl4ckBl1zZ/dokploy/commit/1cb94910133532e545c18bb3ccb330812c7930e9))
* enhance container dashboard with new features ([1c44141](https://github.com/Bl4ckBl1zZ/dokploy/commit/1c4414165d4aedbf6e28afab7a94c8fb7c053373))
* enhance TLS certificate selection UI in AddDomain component ([#4705](https://github.com/Bl4ckBl1zZ/dokploy/issues/4705)) ([ed0abb2](https://github.com/Bl4ckBl1zZ/dokploy/commit/ed0abb24656bf997641a87f397d674e04fd88547))
* export full keyring in backup encryption key file ([c04d56b](https://github.com/Bl4ckBl1zZ/dokploy/commit/c04d56bf2ca65aebeb1b1b3f0f1da59d7365cac6))
* implement forward authentication settings and UI components ([41c09cd](https://github.com/Bl4ckBl1zZ/dokploy/commit/41c09cd86bb62e0028d3d57be1b2ba16b630c741))
* make concurrent builds an OSS feature without license gating ([8d0ae19](https://github.com/Bl4ckBl1zZ/dokploy/commit/8d0ae19b58142e9ec307d15f15babf3068f707b1))
* optionally include encryption key in web server backups ([2e867c5](https://github.com/Bl4ckBl1zZ/dokploy/commit/2e867c5be1fa3c136d0d3f738f0c0d39e1d4de6e))
* **organization:** prevent inviting users with owner role ([67278d8](https://github.com/Bl4ckBl1zZ/dokploy/commit/67278d87839a3a649aa4537fdba3bbccc235231f))
* **scim:** implement SCIM 2.0 user provisioning support ([d831607](https://github.com/Bl4ckBl1zZ/dokploy/commit/d831607f3a4b06fbfd0b1f7be68122c26679b4e8))
* **settings:** add copy button to server IP in web server settings ([#4397](https://github.com/Bl4ckBl1zZ/dokploy/issues/4397)) ([a50f958](https://github.com/Bl4ckBl1zZ/dokploy/commit/a50f958a6f99a6123935e3b1438c4477b5b056e0))
* **sidebar:** add enterprise badge for valid license in sidebar ([86f941d](https://github.com/Bl4ckBl1zZ/dokploy/commit/86f941d606e618ff94151e5dcb00587d8de3242f))
* **user:** implement session cleanup on user update ([1fdbe87](https://github.com/Bl4ckBl1zZ/dokploy/commit/1fdbe87d84c0481ec5e1c1f4a159aebae9556028))
* **whitelabeling:** implement public whitelabeling configuration retrieval ([8f9be16](https://github.com/Bl4ckBl1zZ/dokploy/commit/8f9be1636c8d21f1fbe63827c1009dfaac813569))


### Performance Improvements

* share db, docker and auth singletons across duplicated bundles ([7924794](https://github.com/Bl4ckBl1zZ/dokploy/commit/7924794ae70b2d7c569bce56a0697528c4dd2e93))

## [0.36.2](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.36.1...v0.36.2) (2026-06-06)


### Bug Fixes

* provide build auth secret for GHCR image ([3e53940](https://github.com/Bl4ckBl1zZ/dokploy/commit/3e5394091080e0ce1ada30799d2573cbbbe36185))

## [0.36.1](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.36.0...v0.36.1) (2026-06-05)


### Bug Fixes

* preserve fork image during Dokploy updates ([87dcdaf](https://github.com/Bl4ckBl1zZ/dokploy/commit/87dcdafa4bd557ba5610cfbe2b84eb748f8254be))

# [0.36.0](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.35.2...v0.36.0) (2026-05-12)


### Bug Fixes

* align card footers to bottom on project and service cards ([1ed41fe](https://github.com/Bl4ckBl1zZ/dokploy/commit/1ed41fe2f8c2ad6283179d6a7f8e06af87c1061c))
* broken layout in project/[projectId]/environment/[environmentId].tsx ([9d6bc4c](https://github.com/Bl4ckBl1zZ/dokploy/commit/9d6bc4cd18bd4ddeaab141cb61fedd4f09973eca))
* broken layout in project/[projectId]/environment/[environmentId].tsx ([65b27af](https://github.com/Bl4ckBl1zZ/dokploy/commit/65b27af0f524e58de6b10665e459eff42813ade2))
* broken layout in project/[projectId]/environment/[environmentId].tsx ([6165114](https://github.com/Bl4ckBl1zZ/dokploy/commit/6165114bc3ba1d5124ecc40fa1226f2c34c10125))
* broken layout in project/[projectId]/environment/[environmentId].tsx ([d310935](https://github.com/Bl4ckBl1zZ/dokploy/commit/d3109359fb34c529759fad2884c76cb4bb21e075))
* broken layout in project/[projectId]/environment/[environmentId].tsx ([58f527d](https://github.com/Bl4ckBl1zZ/dokploy/commit/58f527d029d4bb94a09ff61d0499e80013a13d9d))
* **compose-file-editor:** simplify form reset logic in ComposeFileEditor component ([15296d5](https://github.com/Bl4ckBl1zZ/dokploy/commit/15296d5c858faab106a40aa0d5a234bf3fc6c498))
* enforce email length validation in reset password form ([ed006dc](https://github.com/Bl4ckBl1zZ/dokploy/commit/ed006dc5f9ffb16378ad2dbe2b14dfa0c9fedd83))
* **esbuild:** update path for migrate-auth-secret script ([62aeed5](https://github.com/Bl4ckBl1zZ/dokploy/commit/62aeed5aedd757e75cf3da8ae49fb96e328d8d0d))
* reduce healthcheck frequency to lower memory pressure ([8f3d824](https://github.com/Bl4ckBl1zZ/dokploy/commit/8f3d824ea6e4573472206af6ff3ef0a8fcac0754)), closes [#3909](https://github.com/Bl4ckBl1zZ/dokploy/issues/3909)
* remove leftover debug console.log statements ([7417928](https://github.com/Bl4ckBl1zZ/dokploy/commit/741792883aacd8c4e9e52cda797e0dbd5062c6d1))
* reorder imports and clean up unused ones across various components ([4a3fa6e](https://github.com/Bl4ckBl1zZ/dokploy/commit/4a3fa6e63f7bee6f02a47b32ae1b7fd47e092264))
* replace traefik.me with sslip.io for auto-generated domains ([f5ddc36](https://github.com/Bl4ckBl1zZ/dokploy/commit/f5ddc36f24e4289f4f27f1c27c1f566159e6a70d)), closes [#4365](https://github.com/Bl4ckBl1zZ/dokploy/issues/4365)
* responsiveness in components/dashboard/settings/web-domain.tsx ([de7d6f8](https://github.com/Bl4ckBl1zZ/dokploy/commit/de7d6f81474e02f0e04d1cfd74d2930140b97308))
* **sidebar:** close mobile sidebar on navigation ([096b8b3](https://github.com/Bl4ckBl1zZ/dokploy/commit/096b8b33fc69d3d910dff3ead86183f35dd3b380)), closes [#4340](https://github.com/Bl4ckBl1zZ/dokploy/issues/4340)
* **templates:** add fetch timeout and handle network errors gracefully ([5f5ed0f](https://github.com/Bl4ckBl1zZ/dokploy/commit/5f5ed0f2c2b24f2c48d5a998d6304137a9e5fc5b)), closes [#4282](https://github.com/Bl4ckBl1zZ/dokploy/issues/4282)
* **traefik:** update remote config writing to use base64 encoding ([06a3491](https://github.com/Bl4ckBl1zZ/dokploy/commit/06a349152f20a6e12f56cbb24c8e332acae33a7c))
* ui responsiveness for mobile, tab and desktop screens ([bca62d4](https://github.com/Bl4ckBl1zZ/dokploy/commit/bca62d43d24d4e258f758c82c7eb09141caecff1))
* ui responsiveness for mobile, tab and desktop screens ([d502f4a](https://github.com/Bl4ckBl1zZ/dokploy/commit/d502f4a206a0ea9d34c6360fbc9c03e86da97adc))
* use temporary redirects for auth checks in getServerSideProps ([c854a38](https://github.com/Bl4ckBl1zZ/dokploy/commit/c854a38adb1a2bd2e350fd045721ca13aaf16868)), closes [#4220](https://github.com/Bl4ckBl1zZ/dokploy/issues/4220)
* **validation:** update regex for directory validation in WebSocket utility ([282d358](https://github.com/Bl4ckBl1zZ/dokploy/commit/282d358d048cef0ef648e872bab5418b819e10fc))
* **webhook:** cast signature to string to fix TS2345 ([fc6df3a](https://github.com/Bl4ckBl1zZ/dokploy/commit/fc6df3ae0528d3a2fc63acc0e592cabd238738e5))
* **webhook:** return 401 when signature header is missing ([ba3591b](https://github.com/Bl4ckBl1zZ/dokploy/commit/ba3591b3acab0bb8f185830f6329d201ed89c03f))


### Features

* add copy button to AI log analysis result ([ad490dc](https://github.com/Bl4ckBl1zZ/dokploy/commit/ad490dca3fc60aee4470a669d886bfd2149f462f))
* **auth:** implement migration script for auth secret and refactor secret handling ([9c71458](https://github.com/Bl4ckBl1zZ/dokploy/commit/9c71458eff439e45bcccd9ea8248a3c3f9020dcf))
* **deployment:** enhance log retrieval by encoding log path in base64 ([a4e2317](https://github.com/Bl4ckBl1zZ/dokploy/commit/a4e2317f3e0612a13a4fde5c4ca4f599cf9a2f61))
* **schedules:** add optional description field to schedule form and display ([d3292a2](https://github.com/Bl4ckBl1zZ/dokploy/commit/d3292a28109d896c37ab61e185607727a4c51fed))
* **sync:** add job to sync OpenAPI specification to SDK repository ([2f08b33](https://github.com/Bl4ckBl1zZ/dokploy/commit/2f08b33931e37677a36633f6e7772501f44cabd4))
* **templates:** add isolated deployment configuration to CompleteTemplate ([ffd51cf](https://github.com/Bl4ckBl1zZ/dokploy/commit/ffd51cf32fb081b2fa406eea4c57a0b000d43d01))
* **templates:** support isolated = false opt-out in template.toml ([c182755](https://github.com/Bl4ckBl1zZ/dokploy/commit/c182755591dcad5f6d035a25b5753434c645b7bb)), closes [#4366](https://github.com/Bl4ckBl1zZ/dokploy/issues/4366)
* **validation:** add branch name validation across provider schemas ([fef2de1](https://github.com/Bl4ckBl1zZ/dokploy/commit/fef2de1ec587c9b4da37e5548dc9a5e0ce8732f1))
* **validation:** enhance destination path validation in file upload schema ([b9e97eb](https://github.com/Bl4ckBl1zZ/dokploy/commit/b9e97eb321358145d6aed0bad67d3ac789ae69c4))
* **validation:** enhance registry URL validation in schema ([547ba2d](https://github.com/Bl4ckBl1zZ/dokploy/commit/547ba2d04bc66f820e3635826a85d6141a233b7e))
* **validation:** standardize branch name validation across provider schemas ([5e02179](https://github.com/Bl4ckBl1zZ/dokploy/commit/5e021797f3cdce3b268de72a925f99d789b80110))

## [0.35.2](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.35.1...v0.35.2) (2026-05-03)


### Bug Fixes

* **cloudflare:** prevent infinite render loop in domain fields ([f046514](https://github.com/Bl4ckBl1zZ/dokploy/commit/f04651425741eaf881821e05b5df0ff3154602e8))

## [0.35.1](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.35.0...v0.35.1) (2026-05-03)


### Bug Fixes

* address coderabbit review findings ([16f4e04](https://github.com/Bl4ckBl1zZ/dokploy/commit/16f4e04e18f27634f69f101687e4166b57f7e098))
* address second coderabbit review pass ([023be2b](https://github.com/Bl4ckBl1zZ/dokploy/commit/023be2b06d3c2407e5b8177731c6c1853a179462))
* address third coderabbit review pass ([bcc6eda](https://github.com/Bl4ckBl1zZ/dokploy/commit/bcc6eda3533bdf15bc21801460459731f3f18076))
* **cloudflare:** cleanup DNS records when deleting application or compose ([e8fae25](https://github.com/Bl4ckBl1zZ/dokploy/commit/e8fae256f0b19537e946657403cfd15b4daca844))

# [0.35.0](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.34.0...v0.35.0) (2026-05-03)


### Features

* **cloudflare:** local tunnel for Dokploy panel host ([76b3a67](https://github.com/Bl4ckBl1zZ/dokploy/commit/76b3a671bb93c88d8fff007dc611b0e609188f67))

# [0.34.0](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.33.0...v0.34.0) (2026-05-03)


### Features

* **cloudflare:** account-aware orchestrator (picker + pre-flight) ([1368f20](https://github.com/Bl4ckBl1zZ/dokploy/commit/1368f2077a8e1176ef4929a6abedf893aa152850))
* **cloudflare:** group available zones by account in add dialog ([8465875](https://github.com/Bl4ckBl1zZ/dokploy/commit/84658759f98de548418c892671b0307ad21c1fce))
* **cloudflare:** multi-account schema (accounts jsonb, server.tunnelAccountId) ([f9ea950](https://github.com/Bl4ckBl1zZ/dokploy/commit/f9ea950b66e0bb3d221e8c96eef1199697134af1))
* **cloudflare:** per-server account picker + rename Reconcile to Push ([3f654d0](https://github.com/Bl4ckBl1zZ/dokploy/commit/3f654d0185a5b8083d7dbd6b434e4ea1fb41cd3d))
* **cloudflare:** pickTunnelAccount derivation helper ([9444468](https://github.com/Bl4ckBl1zZ/dokploy/commit/944446885e51272bcb45739121a9a84b6cf0ccc0))
* **cloudflare:** show all accessible accounts on settings page ([2258e8f](https://github.com/Bl4ckBl1zZ/dokploy/commit/2258e8ffa30e7faadeede20a6b409ceaf76d633a))
* **cloudflare:** surface zone/tunnel account mismatches on server card ([212fb49](https://github.com/Bl4ckBl1zZ/dokploy/commit/212fb49e4aae60015d9770675bdbeee75713deaf))
* **cloudflare:** tRPC procedures for accounts + picker + tunnel-account binding ([1ccee10](https://github.com/Bl4ckBl1zZ/dokploy/commit/1ccee105e5162d31744033ebc93b076d48d21cfe))
* **cloudflare:** verifyToken returns full accounts list ([e3de1b3](https://github.com/Bl4ckBl1zZ/dokploy/commit/e3de1b3dcbaee40d9643b677c9ad4a6d854045cf))

# [0.33.0](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.32.0...v0.33.0) (2026-05-02)


### Bug Fixes

* **cloudflare:** address PR review findings ([5456ab4](https://github.com/Bl4ckBl1zZ/dokploy/commit/5456ab4e2fb752b9c2bc1aa06d321f0da35a7d43))
* **cloudflare:** register cloudflare in free-tier permissions test fixture ([e400330](https://github.com/Bl4ckBl1zZ/dokploy/commit/e400330ab727cfcda05390b5bab17263239e5591))
* **cloudflare:** second pass on PR review findings ([5de95bf](https://github.com/Bl4ckBl1zZ/dokploy/commit/5de95bf2875b84054d059b4731a1b86cf862904b))


### Features

* **cloudflare:** domain modal CF picker + list view CF badge ([749d784](https://github.com/Bl4ckBl1zZ/dokploy/commit/749d784d133869e59a7d2d9fc825a29326b88537))
* **cloudflare:** HTTP service module + SSH tunnel installer ([16abd2f](https://github.com/Bl4ckBl1zZ/dokploy/commit/16abd2f0e62d32fb9b6d330763e5adbd2817181e))
* **cloudflare:** orchestrator + auto-provision on server setup ([12c05eb](https://github.com/Bl4ckBl1zZ/dokploy/commit/12c05ebdab2b9940288940b11dec37de8e83c8f7))
* **cloudflare:** schema foundation for CF tunnels + managed domains ([dd0aaa3](https://github.com/Bl4ckBl1zZ/dokploy/commit/dd0aaa359e79ec80126aeab9e6917e0637b2f498))
* **cloudflare:** server card tunnel pill + actions menu ([19beccf](https://github.com/Bl4ckBl1zZ/dokploy/commit/19beccf968aba141511388c53fbfe1db52b5ba86))
* **cloudflare:** settings page + sidebar nav ([9715ceb](https://github.com/Bl4ckBl1zZ/dokploy/commit/9715ceb9a19ffd4fd473958270be04ba54ddee60))
* **cloudflare:** tRPC routers + tunnel/domain hooks ([1f77aa5](https://github.com/Bl4ckBl1zZ/dokploy/commit/1f77aa53dad04bf149bbdf915b8f999372b4c252))

# [0.32.0](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.31.1...v0.32.0) (2026-05-02)


### Bug Fixes

* **typecheck:** drop unused [@ts-expect-error](https://github.com/ts-expect-error) in web-server terminal ([d78086b](https://github.com/Bl4ckBl1zZ/dokploy/commit/d78086b680b9a66ec904df51f9f7c6aad9baf615))


### Features

* **ui:** mobile-optimize dashboard layouts and primitives ([e47788b](https://github.com/Bl4ckBl1zZ/dokploy/commit/e47788b1d0f468223fc27a7ca59dbf877d3ab736))

## [0.31.1](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.31.0...v0.31.1) (2026-04-30)


### Bug Fixes

* **release:** disable github plugin PR/issue commenting ([97c412f](https://github.com/Bl4ckBl1zZ/dokploy/commit/97c412f9a41dffb32d7778297c3ca0b2820c6d5f)), closes [#4303](https://github.com/Bl4ckBl1zZ/dokploy/issues/4303)

# [0.31.0](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.30.1...v0.31.0) (2026-04-30)


### Bug Fixes

* add cross-org ownership checks to cluster, deployment, backup, and WebSocket endpoints ([018e2b1](https://github.com/Bl4ckBl1zZ/dokploy/commit/018e2b153e564cf9af163d47ce4a1ee409dfb848))
* fallback to DownstreamStatus when OriginStatus is 0 in requests table ([e9fdc19](https://github.com/Bl4ckBl1zZ/dokploy/commit/e9fdc19b9615dfd6dc832e52b1fcda4e2e39cd86)), closes [#4250](https://github.com/Bl4ckBl1zZ/dokploy/issues/4250)
* filter requests by hostname instead of path ([598fae0](https://github.com/Bl4ckBl1zZ/dokploy/commit/598fae0e92e5bd9941f78170d26ac6b6a088e9cc)), closes [#4249](https://github.com/Bl4ckBl1zZ/dokploy/issues/4249)
* limit application columns in findPreviewDeploymentById to avoid postgres 100-arg limit ([54417ca](https://github.com/Bl4ckBl1zZ/dokploy/commit/54417ca8e73ad7ff26558fc305256abf45208587)), closes [#4256](https://github.com/Bl4ckBl1zZ/dokploy/issues/4256)
* **release:** bump version with exec plugin instead of npm ([b714c8d](https://github.com/Bl4ckBl1zZ/dokploy/commit/b714c8dcf447b71c1bfe39d23a4c5cd62c028699))
* stop leaking Drizzle SQL queries in webhook error responses ([#4276](https://github.com/Bl4ckBl1zZ/dokploy/issues/4276)) ([f8c6c8f](https://github.com/Bl4ckBl1zZ/dokploy/commit/f8c6c8f7ccee57ac16b5d13cba398a967b92706d))
* strictly use ssh2 1.16.0 package ([eafbd03](https://github.com/Bl4ckBl1zZ/dokploy/commit/eafbd0353e067abfb289707fb44957fcc170dd52))
* update import statements to include file extensions for consistency ([628f16e](https://github.com/Bl4ckBl1zZ/dokploy/commit/628f16e8cb5683bd29e0ba18fdb883808f29d0ae))
* upgrade ssh2 from 1.15.0 to ^1.16.0 (util.isDate removed in Node.js v23+) ([91ebf3b](https://github.com/Bl4ckBl1zZ/dokploy/commit/91ebf3b6f5937c72970ab1c3627880d01b3b3af7))


### Features

* add organization-level authorization checks to WebSocket servers ([232ccc9](https://github.com/Bl4ckBl1zZ/dokploy/commit/232ccc913967e28d58635a989a80cd77733d9f96))
* enhance schedule management with permission checks and cloud restrictions ([c3fa638](https://github.com/Bl4ckBl1zZ/dokploy/commit/c3fa638a566e77dc4d71d9b49de84a1942e1f824))
* implement invitation email functionality for organization creation ([b610f7a](https://github.com/Bl4ckBl1zZ/dokploy/commit/b610f7aeffccbb6f841bcb73ec50a4b68733d152))

# Changelog

## [0.30.1](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.30.0...v0.30.1) (2026-04-19)


### Bug Fixes

* **monitoring:** collect container metrics by default and surface failures ([#8](https://github.com/Bl4ckBl1zZ/dokploy/issues/8)) ([d8bcd56](https://github.com/Bl4ckBl1zZ/dokploy/commit/d8bcd56fbcbb8f971c0489d07d3be26aeb2a736f))

## [0.30.0](https://github.com/Bl4ckBl1zZ/dokploy/compare/v0.29.1...v0.30.0) (2026-04-18)


### Features

* **monitoring:** expose remote-server monitoring tab on self-hosted ([#4](https://github.com/Bl4ckBl1zZ/dokploy/issues/4)) ([2f83478](https://github.com/Bl4ckBl1zZ/dokploy/commit/2f83478af73fab271a52a463c1ab6288019d7770))
