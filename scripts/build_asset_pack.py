#!/usr/bin/env python3
"""Build the cross-platform FOOTHOLD SVG-only and combined asset archives."""
from __future__ import annotations

import argparse
import io
from pathlib import Path
import zipfile


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
SVG_OUTPUT = ASSETS / "FOOTHOLD_SVG_ASSET_PACK_V1.zip"
COMBINED_OUTPUT = ASSETS / "FOOTHOLD_ASSET_PACK_V1.zip"
FIXED_TIME = (2026, 8, 9, 0, 0, 0)


def svg_source_files() -> list[Path]:
    files = [ASSETS / "ASSET_INDEX.md"]
    files.extend(path for path in (ASSETS / "exports" / "v1").rglob("*") if path.is_file() and path.suffix in {".svg", ".json"})
    files.extend(path for path in (ASSETS / "logo" / "v1").rglob("*") if path.is_file() and path.suffix in {".svg", ".py"})
    return sorted(files, key=lambda path: path.relative_to(ASSETS).as_posix())


def combined_source_files() -> list[Path]:
    files = svg_source_files()
    files.append(ASSETS / "raster" / "README.md")
    files.extend(path for path in (ASSETS / "raster" / "v1").rglob("*") if path.is_file() and path.suffix in {".png", ".jpg", ".json"})
    files.append(ASSETS / "exports" / "v1" / "FOOTHOLD_ASSET_PACK_V1_PREVIEW.png")
    return sorted(files, key=lambda path: path.relative_to(ASSETS).as_posix())


def build_bytes(files: list[Path]) -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for source in files:
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
    archives = [
        (SVG_OUTPUT, svg_source_files()),
        (COMBINED_OUTPUT, combined_source_files()),
    ]
    if args.check:
        stale = [output.name for output, files in archives if not output.is_file() or output.read_bytes() != build_bytes(files)]
        if stale:
            raise SystemExit(f"Asset-pack ZIP is stale: {', '.join(stale)}. Run python scripts/build_asset_pack.py")
        print("SVG-only and combined asset-pack ZIPs are current.")
        return
    for output, files in archives:
        output.write_bytes(build_bytes(files))
        print(f"Built {output.relative_to(ROOT)} with {len(files)} files.")


if __name__ == "__main__":
    main()
