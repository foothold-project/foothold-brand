# FOOTHOLD Logo Asset Authority

Use `v1/` for all new work.

The older SVG files directly under this directory predate the approved symbol reconstruction and wordmark direction. They remain only to avoid destructive removal and must not be used as canonical geometry.

## Current source chain

```text
assets/logo/v1/*.svg
  frozen canonical paths
        ↓
assets/exports/v1/**/*.svg
```

Do not regenerate the approved wordmark, symbol, or subtitle from a locally installed font. `v1/build_logo_assets.py` is retained as a cross-platform integrity verifier and does not rewrite assets. New derivatives must embed or reference the canonical SVG paths and remain traceable in the manifest.
