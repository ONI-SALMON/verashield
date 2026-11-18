# NSFWJS (vendored)

Self-hosted copy of the NSFWJS browser bundle, used for the on-device
NSFW/nudity pre-filter in `lib/flow/nsfwGuard.js`. Nothing in this folder
is modified from upstream.

- Source: https://github.com/infinitered/nsfwjs
- File: `dist/browser/nsfwjs.min.js` from the `nsfwjs` npm package
  (bundles TensorFlow.js internally; exposes a global `window.nsfwjs`,
  no separate `<script>` tag or import map needed).
- License: MIT, © 2019 Infinite Red, Inc. — see `LICENSE` in this folder.
- Model weights: self-hosted separately at `lib/vendor/nsfw-model/mobilenet_v2/`
  (the lightest of the three variants NSFWJS ships, ~2.6 MB), fetched from
  https://github.com/infinitered/nsfwjs/tree/master/models/mobilenet_v2 per the
  "host your own model" instructions in the NSFWJS README.

Why vendored instead of loaded from a CDN: nothing about this check — the
code or the model — should depend on a third-party host being reachable or
trustworthy, since the whole point is that no image data leaves the device.
