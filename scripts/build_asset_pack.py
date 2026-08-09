#!/usr/bin/env python3
"""Build the cross-platform FOOTHOLD SVG asset-pack archive deterministically."""
from __future__ import annotations

import argparse
import io
from pathlib import Path
import zipfile


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUTPUT = ASSETS / "FOOTHOLD_SVG_ASSET_PACK_V1.zip"
FIXED_TIME = (2026, 8, 9, 0, 0, 0)


def source_files() -> list[Path]:
    files = [ASSETS / "ASSET_INDEX.md"]
    files.extend(path for path in (ASSETS / "exports" / "v1").rglob("*") if path.is_file() and path.suffix in {".svg", ".json"})
    files.extend(path for path in (ASSETS / "logo" / "v1").rglob("*") if path.is_file() and path.suffix in {".svg", ".py"})
    return sorted(files, key=lambda path: path.relative_to(ASSETS).as_posix())


def build_bytes() -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for source in source_files():
            relative = source.relative_to(ASSETS).as_posix()
            info = zipfile.ZipInfo(relative, FIXED_TIME)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, source.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    return buffer.getvalue()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    expected = build_bytes()
    if args.check:
        if not OUTPUT.is_file() or OUTPUT.read_bytes() != expected:
            raise SystemExit("Asset-pack ZIP is stale. Run python scripts/build_asset_pack.py")
        print("Asset-pack ZIP is current.")
        return
    OUTPUT.write_bytes(expected)
    print(f"Built {OUTPUT.relative_to(ROOT)} with {len(source_files())} files.")


if __name__ == "__main__":
    main()
