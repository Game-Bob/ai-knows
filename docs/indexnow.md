# IndexNow deployment integration

The IndexNow actions in `.github/actions/` use a build fingerprint instead of assuming that every generated page changed.

The detection action scans the built `index.html` files, maps them to their canonical domains, and stores a SHA-256 fingerprint for each URL in a technical `indexnow-state` branch. The branch is written only after a successful production deployment. A failed deployment therefore remains pending for the next successful run. This branch is intentionally limited to the generated manifest and is not a source branch.

The resulting manifest contains:

- pages whose generated HTML is new or different;
- pages that disappeared from the previous successful manifest;
- the complete current page fingerprint map for the next run.

This catches changes caused by updated utility packages, shared layouts, translations, generated content, and direct page edits. A dependency lockfile does not need special treatment: if the package changes rendered HTML, its page hash changes.

The route map must contain only canonical production paths. The `games` and `concepts` builds serve two domains from one output, so their workflows map Spanish paths to `www.jjlmoya.es` and international paths to `www.gamebob.dev`.

The submit action reads the public IndexNow key file from each canonical domain and posts all changed or deleted URLs to the global IndexNow endpoint. The key is intentionally public because the protocol verifies ownership by fetching that file.

The root `jjlmoya` and `website` repositories are also deployed through Cloudflare outside their repository workflows. Enable Crawler Hints for the `jjlmoya.es` and `gamebob.dev` zones so those deployments are covered automatically. Cloudflare uses cache misses as a freshness signal and supports IndexNow for created, updated, and deleted content. The Cloudflare-routed `games` and `concepts` deployments are additionally wired here with exact build fingerprints and explicit URL submissions.
