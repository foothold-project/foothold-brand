#!/usr/bin/env python3
"""Generate FOOTHOLD CSS custom properties from the canonical token JSON.

Run from this directory:
    python generate_tokens.py

`foothold.tokens.css` is generated output. Edit `foothold.tokens.json`, then
regenerate; never edit the CSS file directly.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE = HERE / "foothold.tokens.json"
OUTPUT = HERE / "foothold.tokens.css"
REFERENCE = re.compile(r"^\{([^}]+)\}$")


def leaf_tokens(node: dict, path: tuple[str, ...] = ()):
    if "$value" in node:
        yield path, node
        return
    for key, value in node.items():
        if not key.startswith("$") and isinstance(value, dict):
            yield from leaf_tokens(value, path + (key,))


def token_at(tokens: dict, path: str) -> dict:
    node = tokens
    for part in path.split("."):
        node = node[part]
    return node


def raw_value(node: dict, mode: str):
    foothold = node.get("$extensions", {}).get("foothold", {})
    return foothold.get("mode", {}).get(mode, node["$value"])


def resolve(tokens: dict, node: dict, mode: str, trail: tuple[str, ...] = ()):
    value = raw_value(node, mode)
    if not isinstance(value, str):
        return value
    match = REFERENCE.match(value)
    if not match:
        return value
    reference = match.group(1)
    if reference in trail:
        raise ValueError(f"Circular token alias: {' -> '.join(trail + (reference,))}")
    return resolve(tokens, token_at(tokens, reference), mode, trail + (reference,))


def css_entries(tokens: dict, mode: str):
    entries = []
    for path, node in leaf_tokens(tokens.get("semantic", {}), ("semantic",)):
        foothold = node.get("$extensions", {}).get("foothold", {})
        css_name = foothold.get("css")
        if css_name:
            entries.append((css_name, foothold.get("cssValue", resolve(tokens, node, mode))))
    return entries


def render_block(selector: str, entries: list[tuple[str, str]], indent: str = "") -> str:
    lines = [f"{indent}{selector}{{"]
    lines.extend(f"{indent}  {name}:{value};" for name, value in entries)
    lines.append(f"{indent}}}")
    return "\n".join(lines)


def render(tokens: dict) -> str:
    light = css_entries(tokens, "light")
    dark = css_entries(tokens, "dark")
    names = [name for name, _ in light]
    if len(names) != len(set(names)):
        raise ValueError("Duplicate CSS custom-property mapping in semantic tokens")
    mapped = dict(light)
    if mapped.get("--dim") != "var(--brand)":
        raise ValueError("Compatibility rule violated: --dim must remain var(--brand)")
    required = {"--brand", "--dim", "--paper", "--ink", "--grid", "--measure", "--nav"}
    missing = required - set(names)
    if missing:
        raise ValueError(f"Missing required CSS mappings: {', '.join(sorted(missing))}")
    return "\n".join([
        "/* GENERATED FILE — edit foothold.tokens.json, then run generate_tokens.py. */",
        "/* Canonical source: brand/tokens/foothold.tokens.json */",
        render_block(":root", light),
        "",
        "@media (prefers-color-scheme:dark){",
        render_block(":root", dark, "  "),
        "}",
        "",
        render_block(':root[data-theme="dark"]', dark),
        "",
        render_block(':root[data-theme="light"]', light),
        ""
    ])


def main() -> None:
    tokens = json.loads(SOURCE.read_text(encoding="utf-8"))
    OUTPUT.write_text(render(tokens), encoding="utf-8", newline="\n")
    print(f"Generated {OUTPUT.name} from {SOURCE.name}")


if __name__ == "__main__":
    main()
