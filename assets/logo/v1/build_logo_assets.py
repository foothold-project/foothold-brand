#!/usr/bin/env python3
"""Verify the frozen FOOTHOLD v1 SVG asset pack.

The filename is retained for compatibility with earlier documentation. Since
v1.1, approved logo geometry is canonical SVG path data and MUST NOT be
regenerated from a locally installed font. This script performs read-only
integrity checks; it does not rewrite approved assets.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path


SCRIPT = Path(__file__).resolve()
BRAND_DIR = SCRIPT.parents[3]
MANIFEST_PATH = BRAND_DIR / "assets" / "exports" / "v1" / "manifest.json"
APPROVED_WORDMARK_ASPECT = 7.841215388


def main() -> None:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    if manifest.get("version") != "1.0.2":
        raise SystemExit("Unexpected approved asset-pack version")
    if manifest.get("approvedWordmarkAspect") != APPROVED_WORDMARK_ASPECT:
        raise SystemExit("Approved wordmark aspect changed")

    checked = 0
    for item in manifest.get("assets", []):
        path = BRAND_DIR / item["path"]
        if not path.is_file():
            raise SystemExit(f"Missing asset: {item['path']}")
        actual = hashlib.sha256(path.read_bytes()).hexdigest()
        if actual != item["sha256"]:
            raise SystemExit(f"Canonical asset changed: {item['path']}")
        if item["path"].startswith("assets/logo/v1/"):
            svg = path.read_text(encoding="utf-8")
            if "<text" in svg.lower():
                raise SystemExit(f"Live text found in canonical logo: {item['path']}")
        checked += 1

    print(f"Verified {checked} frozen SVG assets")
    print(f"Approved wordmark aspect: {APPROVED_WORDMARK_ASPECT}")


if __name__ == "__main__":
    main()
