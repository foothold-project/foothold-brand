// SPDX-License-Identifier: MIT
const OWNER_KEY = "foothold.owner";
const OWNER_VALUE = "foothold-brand-sync/v1";
const PAGE_NAMES = ["Cover & Guide", "Foundations", "Master Board"];
const COLLECTIONS = {
  lightPrimitive: "FOOTHOLD / Light Primitives",
  darkPrimitive: "FOOTHOLD / Dark Primitives",
  lightSemantic: "FOOTHOLD / Light Semantic",
  darkSemantic: "FOOTHOLD / Dark Semantic",
  layout: "FOOTHOLD / Layout"
};
/** @type {Array<[string, number, number, string]>} */
const TEXT_STYLE_SPECS = [
  ["FOOTHOLD / Display / Hero", 56, 64, "Bold"],
  ["FOOTHOLD / Heading / Section", 32, 40, "Semi Bold"],
  ["FOOTHOLD / Body / Korean", 18, 28, "Regular"],
  ["FOOTHOLD / Label / Technical", 13, 18, "Semi Bold"],
  ["FOOTHOLD / Subtitle / English", 12, 18, "Regular"]
];
const DEPRECATED_TEXT_STYLE_NAMES = [
  "FOOTHOLD / Display",
  "FOOTHOLD / Heading",
  "FOOTHOLD / Body",
  "FOOTHOLD / Label",
  "FOOTHOLD / Caption"
];

figma.showUI(__html__, { width: 420, height: 620, themeColors: true });

function post(type, payload) {
  figma.ui.postMessage({ type, payload });
}

function hexToRgba(value) {
  const compact = value.trim().toLowerCase();
  const hex = compact.startsWith("#") ? compact.slice(1) : "";
  if (hex) {
    const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    if (full.length === 6) {
      return {
        r: parseInt(full.slice(0, 2), 16) / 255,
        g: parseInt(full.slice(2, 4), 16) / 255,
        b: parseInt(full.slice(4, 6), 16) / 255,
        a: 1
      };
    }
  }
  const rgba = compact.match(/^rgba?\(([^)]+)\)$/);
  if (rgba) {
    const parts = rgba[1].split(",").map((part) => Number(part.trim()));
    return { r: parts[0] / 255, g: parts[1] / 255, b: parts[2] / 255, a: parts.length > 3 ? parts[3] : 1 };
  }
  throw new Error(`Unsupported colour: ${value}`);
}

/** @returns {SolidPaint} */
function solidPaint(value) {
  const rgba = hexToRgba(value);
  return { type: "SOLID", color: { r: rgba.r, g: rgba.g, b: rgba.b }, opacity: rgba.a };
}

function leaves(node, path = []) {
  if (node && Object.prototype.hasOwnProperty.call(node, "$value")) return [{ path, node }];
  const result = [];
  for (const [key, value] of Object.entries(node || {})) {
    if (!key.startsWith("$") && value && typeof value === "object") result.push(...leaves(value, [...path, key]));
  }
  return result;
}

function sourceNode(path) {
  let current = FOOTHOLD_DATA.tokens;
  for (const part of path.split(".")) current = current[part];
  return current;
}

function rawValue(node, mode) {
  return node.$extensions?.foothold?.mode?.[mode] ?? node.$value;
}

function dimensionNumber(value) {
  if (typeof value === "number") return value;
  const match = String(value).match(/^(-?\d+(?:\.\d+)?)px$/);
  if (!match) throw new Error(`Unsupported dimension: ${value}`);
  return Number(match[1]);
}

async function collectionMap() {
  const all = await figma.variables.getLocalVariableCollectionsAsync();
  return new Map(all.map((collection) => [collection.name, collection]));
}

async function variableMap() {
  const all = await figma.variables.getLocalVariablesAsync();
  return new Map(all.map((variable) => [`${variable.variableCollectionId}:${variable.name}`, variable]));
}

async function ensureCollection(name, hidden) {
  const collections = await collectionMap();
  let collection = collections.get(name);
  if (!collection) collection = figma.variables.createVariableCollection(name);
  collection.hiddenFromPublishing = hidden;
  if (collection.modes.length !== 1) throw new Error(`${name} must contain exactly one Starter-compatible mode.`);
  collection.renameMode(collection.defaultModeId, "Value");
  collection.setPluginData(OWNER_KEY, OWNER_VALUE);
  return collection;
}

async function ensureVariable(collection, name, type, scopes, webSyntax) {
  const variables = await variableMap();
  let variable = variables.get(`${collection.id}:${name}`);
  if (!variable) variable = figma.variables.createVariable(name, collection, type);
  variable.scopes = scopes;
  variable.setVariableCodeSyntax("WEB", webSyntax);
  variable.setPluginData(OWNER_KEY, OWNER_VALUE);
  return variable;
}

function primitiveSyntax(path) {
  return `var(--primitive-${path.join("-").replace(/_/g, "-")})`;
}

function semanticScopes(name) {
  if (name.includes("/content/")) return ["TEXT_FILL"];
  if (name.includes("/border/")) return ["STROKE_COLOR"];
  return ["FRAME_FILL", "SHAPE_FILL", "STROKE_COLOR"];
}

async function syncColorCollection(collection, sourceGroup, mode, semantic) {
  const entries = leaves(sourceGroup);
  const created = new Map();
  for (const entry of entries) {
    const name = ["color", ...entry.path].join("/");
    const css = entry.node.$extensions?.foothold?.css;
    const variable = await ensureVariable(
      collection,
      name,
      "COLOR",
      semantic ? semanticScopes(`/${name}/`) : [],
      css ? `var(${css})` : primitiveSyntax(["color", ...entry.path])
    );
    created.set(entry.path.join("."), variable);
  }
  for (const entry of entries) {
    const variable = created.get(entry.path.join("."));
    const value = rawValue(entry.node, mode);
    if (typeof value === "string" && /^\{.+\}$/.test(value)) continue;
    variable.setValueForMode(collection.defaultModeId, hexToRgba(value));
  }
  return created;
}

async function syncSemanticCollection(collection, primitiveCollection, mode) {
  const entries = leaves(FOOTHOLD_DATA.tokens.semantic.color);
  const primitiveVariables = await variableMap();
  const created = new Map();
  for (const entry of entries) {
    const name = ["color", ...entry.path].join("/");
    const css = entry.node.$extensions?.foothold?.css;
    const variable = await ensureVariable(collection, name, "COLOR", semanticScopes(`/${name}/`), css ? `var(${css})` : primitiveSyntax(["semantic", ...entry.path]));
    created.set(["semantic", "color", ...entry.path].join("."), variable);
  }
  for (const entry of entries) {
    const key = ["semantic", "color", ...entry.path].join(".");
    const variable = created.get(key);
    const value = rawValue(entry.node, mode);
    if (typeof value === "string" && /^\{.+\}$/.test(value)) {
      const reference = value.slice(1, -1);
      let target = created.get(reference);
      if (!target && reference.startsWith("primitive.color.")) {
        const primitiveName = ["color", ...reference.split(".").slice(2)].join("/");
        target = primitiveVariables.get(`${primitiveCollection.id}:${primitiveName}`);
      }
      if (!target) throw new Error(`Missing variable alias target: ${reference}`);
      variable.setValueForMode(collection.defaultModeId, { type: "VARIABLE_ALIAS", id: target.id });
    } else {
      variable.setValueForMode(collection.defaultModeId, hexToRgba(value));
    }
  }
}

async function removeManagedPrimitiveDuplicates(collection) {
  const variables = (await figma.variables.getLocalVariablesAsync()).filter((variable) => variable.variableCollectionId === collection.id);
  const byName = new Map(variables.map((variable) => [variable.name, variable]));
  let removed = 0;
  for (const entry of leaves(FOOTHOLD_DATA.tokens.primitive.color)) {
    const shortName = entry.path.join("/");
    const canonicalName = ["color", ...entry.path].join("/");
    const duplicate = byName.get(shortName);
    if (duplicate && byName.has(canonicalName) && duplicate.getPluginData(OWNER_KEY) === OWNER_VALUE) {
      duplicate.remove();
      removed += 1;
    }
  }
  return removed;
}

async function syncLayoutCollection(collection) {
  for (const entry of leaves(FOOTHOLD_DATA.tokens.semantic.layout)) {
    const name = `layout/${entry.path.join("/")}`;
    const css = entry.node.$extensions?.foothold?.css;
    const variable = await ensureVariable(collection, name, "FLOAT", ["WIDTH_HEIGHT"], `var(${css})`);
    const reference = String(entry.node.$value).slice(1, -1);
    variable.setValueForMode(collection.defaultModeId, dimensionNumber(sourceNode(reference).$value));
  }
}

async function syncTextStyles() {
  const existing = new Map((await figma.getLocalTextStylesAsync()).map((style) => [style.name, style]));
  let removed = 0;
  for (const name of DEPRECATED_TEXT_STYLE_NAMES) {
    const style = existing.get(name);
    if (style && style.description === `Managed by ${OWNER_VALUE}.`) {
      style.remove();
      existing.delete(name);
      removed += 1;
    }
  }
  for (const [name, size, lineHeight, styleName] of TEXT_STYLE_SPECS) {
    const fontName = { family: "Inter", style: styleName };
    let style = existing.get(name);
    if (!style) {
      await figma.loadFontAsync(fontName);
      style = figma.createTextStyle();
      style.name = name;
      style.fontName = fontName;
      style.fontSize = size;
      style.lineHeight = { unit: "PIXELS", value: lineHeight };
      style.description = `Managed by ${OWNER_VALUE}.`;
      style.setPluginData(OWNER_KEY, OWNER_VALUE);
    } else if (style.getPluginData(OWNER_KEY) === OWNER_VALUE) {
      await figma.loadFontAsync(fontName);
      style.fontName = fontName;
      style.fontSize = size;
      style.lineHeight = { unit: "PIXELS", value: lineHeight };
      style.description = `Managed by ${OWNER_VALUE}.`;
    }
  }
  return { names: TEXT_STYLE_SPECS.map(([name]) => name), removed };
}

async function syncFoundations() {
  const lightPrimitive = await ensureCollection(COLLECTIONS.lightPrimitive, true);
  const darkPrimitive = await ensureCollection(COLLECTIONS.darkPrimitive, true);
  const lightSemantic = await ensureCollection(COLLECTIONS.lightSemantic, false);
  const darkSemantic = await ensureCollection(COLLECTIONS.darkSemantic, false);
  const layout = await ensureCollection(COLLECTIONS.layout, false);
  await syncColorCollection(lightPrimitive, FOOTHOLD_DATA.tokens.primitive.color, "light", false);
  await syncColorCollection(darkPrimitive, FOOTHOLD_DATA.tokens.primitive.color, "dark", false);
  await syncSemanticCollection(lightSemantic, lightPrimitive, "light");
  await syncSemanticCollection(darkSemantic, darkPrimitive, "dark");
  await syncLayoutCollection(layout);
  const removedPrimitiveVariables =
    (await removeManagedPrimitiveDuplicates(lightPrimitive)) +
    (await removeManagedPrimitiveDuplicates(darkPrimitive));
  const styles = await syncTextStyles();
  return {
    collections: Object.values(COLLECTIONS),
    styles: styles.names,
    repairs: { removedPrimitiveVariables, removedTextStyles: styles.removed }
  };
}

async function inspectFile() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const variables = await figma.variables.getLocalVariablesAsync();
  const variableById = new Map(variables.map((variable) => [variable.id, variable]));
  return {
    file: { name: figma.root.name, key: figma.fileKey || "local" },
    pages: figma.root.children.map((page) => ({ id: page.id, name: page.name })),
    collections: collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      modes: collection.modes.map((mode) => mode.name),
      variables: collection.variableIds.length,
      variableNames: collection.variableIds.map((id) => variableById.get(id)?.name).filter(Boolean).sort()
    })),
    variables: variables.length,
    textStyles: (await figma.getLocalTextStylesAsync()).map((style) => style.name),
    sourceDigest: FOOTHOLD_DATA.sourceDigest
  };
}

async function pageIsEmpty(page) {
  await page.loadAsync();
  return page.children.length === 0;
}

async function ensurePages() {
  const pages = new Map(figma.root.children.map((page) => [page.name, page]));
  if (!pages.has(PAGE_NAMES[0])) {
    const defaultPage = figma.root.children.find((page) => /^Page \d+$/.test(page.name));
    if (defaultPage && await pageIsEmpty(defaultPage)) {
      defaultPage.name = PAGE_NAMES[0];
      pages.set(PAGE_NAMES[0], defaultPage);
    }
  }
  for (const name of PAGE_NAMES) {
    if (!pages.has(name)) {
      if (figma.root.children.length >= 3) throw new Error(`Starter-safe setup cannot create '${name}': the file already has three pages.`);
      const page = figma.createPage();
      page.name = name;
      pages.set(name, page);
    }
  }
  return pages;
}

async function loadInter(style = "Regular") {
  const font = { family: "Inter", style };
  await figma.loadFontAsync(font);
  return font;
}

function setOwned(node, key) {
  node.setPluginData(OWNER_KEY, OWNER_VALUE);
  node.setPluginData("foothold.key", key);
}

function findOwned(page, key) {
  return page.findOne((node) => node.getPluginData && node.getPluginData(OWNER_KEY) === OWNER_VALUE && node.getPluginData("foothold.key") === key);
}

async function makeText(value, size, style, color) {
  const node = figma.createText();
  node.fontName = await loadInter(style);
  node.fontSize = size;
  node.characters = value;
  node.fills = [solidPaint(color)];
  node.textAutoResize = "HEIGHT";
  return node;
}

async function makeWrappedText(value, size, style, color, width) {
  const node = await makeText(value, size, style, color);
  node.resize(width, node.height);
  node.textAutoResize = "HEIGHT";
  return node;
}

function light(name) {
  return FOOTHOLD_DATA.tokens.primitive.color[name].$value;
}

function dark(name) {
  return rawValue(FOOTHOLD_DATA.tokens.primitive.color[name], "dark");
}

async function createAssetCard(asset) {
  const isSquare = asset.width / asset.height >= 0.8 && asset.width / asset.height <= 1.25;
  const previewHeight = isSquare ? 300 : 190;
  const card = figma.createFrame();
  card.name = `Asset / ${asset.name}`;
  card.layoutMode = "VERTICAL";
  card.counterAxisSizingMode = "FIXED";
  card.resize(400, 300);
  card.primaryAxisSizingMode = "AUTO";
  card.minHeight = 300;
  card.clipsContent = false;
  card.paddingTop = card.paddingBottom = 20;
  card.paddingLeft = card.paddingRight = 20;
  card.itemSpacing = 12;
  card.cornerRadius = 12;
  card.fills = [solidPaint(light("card"))];
  card.strokes = [solidPaint(light("rule"))];
  card.strokeWeight = 1;

  const preview = figma.createFrame();
  preview.name = "Preview";
  preview.layoutMode = "VERTICAL";
  preview.resize(360, previewHeight);
  preview.primaryAxisSizingMode = "FIXED";
  preview.counterAxisSizingMode = "FIXED";
  preview.primaryAxisAlignItems = "CENTER";
  preview.counterAxisAlignItems = "CENTER";
  preview.clipsContent = true;
  preview.cornerRadius = 8;
  preview.fills = [solidPaint(asset.theme === "dark" ? light("ink") : light("paper"))];

  const artwork = figma.createNodeFromSvg(asset.svg);
  artwork.name = asset.name;
  const safeWidth = preview.width - 40;
  const safeHeight = preview.height - 40;
  const scale = Math.min(safeWidth / artwork.width, safeHeight / artwork.height);
  artwork.resize(artwork.width * scale, artwork.height * scale);
  preview.appendChild(artwork);
  card.appendChild(preview);
  card.appendChild(await makeText((asset.status || "approved").toUpperCase(), 10, "Bold", asset.status === "provisional" ? light("amber") : light("teal-brand")));
  card.appendChild(await makeWrappedText(asset.name, 13, "Semi Bold", light("ink"), 360));
  card.appendChild(await makeWrappedText(asset.purpose, 12, "Regular", light("ink-secondary"), 360));
  card.appendChild(await makeWrappedText(asset.path, 10, "Regular", light("ink-caption"), 360));
  return card;
}

async function createAssetSection(name, assets) {
  const section = figma.createFrame();
  section.name = `Asset section / ${name}`;
  section.layoutMode = "VERTICAL";
  section.counterAxisSizingMode = "FIXED";
  section.resize(1280, 200);
  section.primaryAxisSizingMode = "AUTO";
  section.minHeight = 200;
  section.itemSpacing = 16;
  section.fills = [];
  section.clipsContent = false;
  section.appendChild(await makeText(name.toUpperCase(), 20, "Bold", light("ink")));
  for (let index = 0; index < assets.length; index += 3) {
    const row = figma.createFrame();
    row.name = `${name} / Row ${Math.floor(index / 3) + 1}`;
    row.layoutMode = "HORIZONTAL";
    row.primaryAxisSizingMode = "AUTO";
    row.counterAxisSizingMode = "AUTO";
    row.itemSpacing = 16;
    row.fills = [];
    for (const asset of assets.slice(index, index + 3)) row.appendChild(await createAssetCard(asset));
    section.appendChild(row);
  }
  return section;
}

async function createAssetLibrary() {
  const library = figma.createFrame();
  library.name = "FOOTHOLD / Identity & Asset Status";
  setOwned(library, "asset-library");
  library.layoutMode = "VERTICAL";
  library.counterAxisSizingMode = "FIXED";
  library.resize(1280, 400);
  library.primaryAxisSizingMode = "AUTO";
  library.minHeight = 400;
  library.itemSpacing = 28;
  library.fills = [];
  library.clipsContent = false;
  library.appendChild(await makeText("IDENTITY & ASSET STATUS", 36, "Bold", light("ink")));
  library.appendChild(await makeWrappedText(
    `${FOOTHOLD_DATA.libraryAssets.length} approved core vectors from Git. Canonical paths remain frozen; Figma nodes are visual working copies.`,
    14,
    "Regular",
    light("ink-secondary"),
    1280
  ));
  const grouped = new Map();
  for (const asset of FOOTHOLD_DATA.libraryAssets) {
    if (!grouped.has(asset.category)) grouped.set(asset.category, []);
    grouped.get(asset.category).push(asset);
  }
  for (const [name, assets] of grouped) library.appendChild(await createAssetSection(name, assets));
  library.appendChild(await makeWrappedText(
    `RETIRED · ${FOOTHOLD_DATA.retiredAssets.join(", ")} · preserve for history; exclude from new work.`,
    13,
    "Regular",
    light("red"),
    1280
  ));
  library.appendChild(await makeWrappedText(
    `SUPERSEDED COMPOSITION PROOFS · ${FOOTHOLD_DATA.legacyApplicationAssets.length} v1 application exports remain in Git for compatibility, not as finished OSMU templates.`,
    13,
    "Regular",
    light("ink-secondary"),
    1280
  ));
  if (FOOTHOLD_DATA.draftAssets.length) {
    library.appendChild(await createAssetSection("Draft applications / review required", FOOTHOLD_DATA.draftAssets));
  }
  return library;
}

async function createLogoUsageCard(label, usage, svg, sourceWidth, sourceHeight, darkSurface = false) {
  const card = figma.createFrame();
  card.name = `Logo usage / ${label}`;
  card.layoutMode = "VERTICAL";
  card.counterAxisSizingMode = "FIXED";
  card.resize(388, 240);
  card.primaryAxisSizingMode = "AUTO";
  card.minHeight = 240;
  card.paddingTop = card.paddingBottom = 20;
  card.paddingLeft = card.paddingRight = 20;
  card.itemSpacing = 12;
  card.cornerRadius = 12;
  card.fills = [solidPaint(light("paper-secondary"))];
  card.strokes = [solidPaint(light("rule"))];
  card.strokeWeight = 1;

  const preview = figma.createFrame();
  preview.name = `${label} preview`;
  preview.layoutMode = "VERTICAL";
  preview.resize(348, 150);
  preview.primaryAxisSizingMode = "FIXED";
  preview.counterAxisSizingMode = "FIXED";
  preview.primaryAxisAlignItems = "CENTER";
  preview.counterAxisAlignItems = "CENTER";
  preview.cornerRadius = 8;
  preview.fills = [solidPaint(darkSurface ? dark("paper") : light("paper"))];
  const artwork = figma.createNodeFromSvg(svg);
  artwork.name = `${label} canonical SVG`;
  const scale = Math.min(316 / sourceWidth, 118 / sourceHeight);
  artwork.resize(sourceWidth * scale, sourceHeight * scale);
  preview.appendChild(artwork);
  card.appendChild(preview);
  card.appendChild(await makeText(label.toUpperCase(), 13, "Semi Bold", light("ink")));
  card.appendChild(await makeWrappedText(usage, 12, "Regular", light("ink-secondary"), 348));
  return card;
}

async function createMessageCard(label, value, width) {
  const card = figma.createFrame();
  card.name = `Message / ${label}`;
  card.layoutMode = "VERTICAL";
  card.counterAxisSizingMode = "FIXED";
  card.resize(width, 160);
  card.primaryAxisSizingMode = "AUTO";
  card.minHeight = 160;
  card.paddingTop = card.paddingBottom = 24;
  card.paddingLeft = card.paddingRight = 24;
  card.itemSpacing = 12;
  card.cornerRadius = 12;
  card.fills = [solidPaint(light("paper-secondary"))];
  card.appendChild(await makeText(label.toUpperCase(), 12, "Bold", light("teal-brand")));
  card.appendChild(await makeWrappedText(value, 24, "Semi Bold", light("ink"), width - 48));
  return card;
}

async function placeText(frame, value, size, style, color, x, y, width) {
  const node = await makeWrappedText(value, size, style, color, width);
  frame.appendChild(node);
  node.x = x;
  node.y = y;
  return node;
}

function placeRect(frame, x, y, width, height, fill, radius = 0, opacity = 1) {
  const node = figma.createRectangle();
  node.resize(width, height);
  node.x = x;
  node.y = y;
  node.cornerRadius = radius;
  node.fills = [solidPaint(fill)];
  node.opacity = opacity;
  frame.appendChild(node);
  return node;
}

function placeSvg(frame, svg, name, x, y, width, height, opacity = 1) {
  const node = figma.createNodeFromSvg(svg);
  node.name = name;
  node.resize(width, height);
  node.x = x;
  node.y = y;
  node.opacity = opacity;
  frame.appendChild(node);
  return node;
}

async function createMediaReviewCard(label, role, width, height, darkSurface, draw) {
  const card = figma.createFrame();
  card.name = `OSMU / ${label}`;
  card.layoutMode = "VERTICAL";
  card.counterAxisSizingMode = "FIXED";
  card.resize(width + 40, height + 120);
  card.primaryAxisSizingMode = "AUTO";
  card.minHeight = height + 120;
  card.paddingTop = card.paddingBottom = 20;
  card.paddingLeft = card.paddingRight = 20;
  card.itemSpacing = 12;
  card.cornerRadius = 12;
  card.fills = [solidPaint(light("card"))];
  card.strokes = [solidPaint(light("rule"))];
  card.strokeWeight = 1;

  const preview = figma.createFrame();
  preview.name = `${label} / Provisional preview`;
  preview.resize(width, height);
  preview.clipsContent = true;
  preview.cornerRadius = 8;
  preview.fills = [solidPaint(darkSurface ? dark("paper") : light("paper"))];
  card.appendChild(preview);
  await draw(preview);
  card.appendChild(await makeText(`${label.toUpperCase()} · PROVISIONAL`, 12, "Bold", light("amber")));
  card.appendChild(await makeWrappedText(role, 12, "Regular", light("ink-secondary"), width));
  return card;
}

async function createWebHeaderReview() {
  return createMediaReviewCard("Web header", "Navigation-first: compact identity, live controls, and restrained brand presence.", 580, 92, false, async (preview) => {
    placeSvg(preview, FOOTHOLD_DATA.svg.compactLight, "Canonical Compact Lockup", 24, 24, 235, 42);
    placeRect(preview, 282, 20, 1, 52, light("rule"));
    await placeText(preview, "PROJECT     METHOD     EVIDENCE", 10, "Semi Bold", light("ink-secondary"), 310, 31, 200);
    placeRect(preview, 508, 25, 48, 28, light("teal-soft"), 14);
    await placeText(preview, "GIT", 10, "Bold", light("teal-ink-on-soft"), 521, 31, 28);
    placeRect(preview, 0, 90, 580, 2, light("teal-brand"));
  });
}

async function createReadmeHeroReview() {
  return createMediaReviewCard("GitHub README hero", "Repository-first: project definition and technical orientation before visual spectacle.", 580, 200, false, async (preview) => {
    placeSvg(preview, FOOTHOLD_DATA.svg.compactLight, "Canonical Compact Lockup", 24, 20, 224, 40);
    placeSvg(preview, FOOTHOLD_DATA.svg.symbolBrand, "Canonical Symbol Watermark", 452, 18, 88, 101, 0.12);
    await placeText(preview, FOOTHOLD_DATA.messages.closingEn, 28, "Bold", light("ink"), 24, 78, 430);
    await placeText(preview, "Terrain-adaptive quadruped locomotion policy", 12, "Regular", light("ink-secondary"), 24, 118, 430);
    const labels = ["01  SIMULATION", "02  POLICY LEARNING", "03  VALIDATION"];
    for (let index = 0; index < labels.length; index += 1) {
      const x = 24 + index * 178;
      placeRect(preview, x, 156, 164, 24, index === 2 ? light("amber-soft") : light("paper-secondary"), 4);
      await placeText(preview, labels[index], 9, "Semi Bold", index === 2 ? light("amber-ink-on-soft") : light("ink-secondary"), x + 10, 161, 144);
    }
  });
}

async function createPresentationReview() {
  return createMediaReviewCard("Presentation opener", "Story-first: one memorable statement with enough silence for a spoken opening.", 580, 326, true, async (preview) => {
    placeSvg(preview, FOOTHOLD_DATA.svg.primaryDark, "Canonical Primary Lockup / Dark", 34, 30, 290, 60);
    await placeText(preview, "Find the next", 44, "Bold", dark("ink"), 34, 132, 430);
    await placeText(preview, "foothold.", 44, "Bold", dark("ink"), 34, 184, 430);
    placeRect(preview, 34, 276, 512, 2, dark("rule"));
    placeRect(preview, 420, 94, 190, 18, dark("teal-brand"), 0, 0.18);
    placeRect(preview, 452, 122, 190, 18, dark("teal-brand"), 0, 0.32);
    placeRect(preview, 484, 150, 190, 18, dark("teal-brand"), 0, 0.52);
    await placeText(preview, "OPENING / 16:9", 10, "Semi Bold", dark("ink-secondary"), 34, 292, 160);
  });
}

async function createPosterHeaderReview() {
  return createMediaReviewCard("Poster header", "Evidence-first: editorial hierarchy that opens into diagrams, methods, and measured results.", 580, 214, false, async (preview) => {
    placeRect(preview, 0, 0, 14, 214, light("teal-brand"));
    await placeText(preview, "01 / TERRAIN-ADAPTIVE LOCOMOTION", 9, "Bold", light("teal-brand"), 34, 24, 300);
    placeSvg(preview, FOOTHOLD_DATA.svg.primaryLight, "Canonical Primary Lockup", 34, 52, 330, 68);
    await placeText(preview, "Reinforcement-learning policy development and validation for quadruped locomotion on rough terrain.", 13, "Regular", light("ink-secondary"), 34, 144, 410);
    placeRect(preview, 472, 24, 82, 82, light("paper-secondary"), 8);
    await placeText(preview, "M01", 22, "Bold", light("ink"), 488, 44, 50);
    await placeText(preview, "CORE", 9, "Semi Bold", light("ink-caption"), 488, 76, 50);
  });
}

async function createSocialReview() {
  return createMediaReviewCard("Social square", "Recognition-first: one symbol, one sentence, and no unreadable micro-copy.", 360, 360, true, async (preview) => {
    await placeText(preview, "FOOTHOLD / 01", 10, "Semi Bold", dark("ink-secondary"), 24, 22, 160);
    placeSvg(preview, FOOTHOLD_DATA.svg.symbolBrand, "Canonical Symbol", 104, 72, 152, 174);
    await placeText(preview, "Find the next foothold.", 24, "Bold", dark("ink"), 40, 284, 280);
  });
}

async function createStickerReview() {
  const asset = FOOTHOLD_DATA.draftAssets[0];
  return createMediaReviewCard("Round sticker", "Production-first: preferred stacked lockup, thinner border, and generous cut-safe margin.", 360, 360, false, async (preview) => {
    placeSvg(preview, asset.svg, "Provisional round sticker", 20, 20, 320, 320);
  });
}

async function createOsmuReview(page, masterBoard) {
  let board = findOwned(page, "osmu-review");
  if (!board) {
    board = figma.createFrame();
    setOwned(board, "osmu-review");
    page.appendChild(board);
  } else {
    for (const child of [...board.children]) child.remove();
  }
  board.name = "FOOTHOLD / OSMU Review";
  board.layoutMode = "VERTICAL";
  board.counterAxisSizingMode = "FIXED";
  board.resize(1440, 1000);
  board.primaryAxisSizingMode = "AUTO";
  board.minHeight = 1000;
  board.clipsContent = false;
  board.paddingTop = board.paddingBottom = 80;
  board.paddingLeft = board.paddingRight = 80;
  board.itemSpacing = 24;
  board.fills = [solidPaint(light("paper"))];
  board.x = masterBoard.x + masterBoard.width + 160;
  board.y = masterBoard.y;
  board.appendChild(await makeText("FOOTHOLD / OSMU REVIEW", 48, "Bold", light("ink")));
  board.appendChild(await makeWrappedText("Same identity, different communication job. All compositions remain provisional until exported and approved.", 18, "Regular", light("ink-secondary"), 1280));
  for (const pair of [
    [await createWebHeaderReview(), await createReadmeHeroReview()],
    [await createPresentationReview(), await createPosterHeaderReview()],
    [await createSocialReview(), await createStickerReview()]
  ]) {
    const row = figma.createFrame();
    row.name = "OSMU review row";
    row.layoutMode = "HORIZONTAL";
    row.primaryAxisSizingMode = "AUTO";
    row.counterAxisSizingMode = "AUTO";
    row.itemSpacing = 16;
    row.fills = [];
    for (const card of pair) row.appendChild(card);
    board.appendChild(row);
  }
  return board;
}

async function appendBrandCore(frame) {
  const row = figma.createFrame();
  row.name = "Approved lockup hierarchy";
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "AUTO";
  row.counterAxisSizingMode = "AUTO";
  row.itemSpacing = 16;
  row.fills = [];
  row.appendChild(await createLogoUsageCard("Primary", "Default two-row lockup for hero and formal identity use.", FOOTHOLD_DATA.svg.primaryLight, 868.345, 180));
  row.appendChild(await createLogoUsageCard("Compact", "Subtitle-free lockup for constrained horizontal spaces.", FOOTHOLD_DATA.svg.compactLight, 537.108, 96));
  row.appendChild(await createLogoUsageCard("Stacked", "Centred square lockup for avatars, stickers, and goods.", FOOTHOLD_DATA.svg.stackedLight, 600, 600));
  frame.appendChild(row);
  frame.appendChild(await createMessageCard("Canonical definition", FOOTHOLD_DATA.messages.projectDefinitionKo, 1208));
  frame.appendChild(await makeWrappedText(
    `Frozen SVG paths · approved wordmark aspect ${FOOTHOLD_DATA.approvedWordmarkAspect} · subtitle: ${FOOTHOLD_DATA.messages.subtitleEn}`,
    13,
    "Regular",
    light("ink-secondary"),
    1208
  ));
}

async function appendHeroHierarchy(frame) {
  const row = figma.createFrame();
  row.name = "Slogan to scope hierarchy";
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "AUTO";
  row.counterAxisSizingMode = "AUTO";
  row.itemSpacing = 16;
  row.fills = [];
  row.appendChild(await createMessageCard("Approved slogan", FOOTHOLD_DATA.messages.closingEn, 440));
  row.appendChild(await createMessageCard("What", FOOTHOLD_DATA.messages.whatKo, 752));
  frame.appendChild(row);
  frame.appendChild(await makeWrappedText("Approved English slogan · precise project scope · no platform claim", 13, "Regular", light("ink-secondary"), 1208));
  frame.appendChild(await createMessageCard("Approved Korean slogan", FOOTHOLD_DATA.messages.sloganKo, 1208));
}

async function appendWhyNorthStar(frame) {
  const panel = figma.createFrame();
  panel.name = "Why FOOTHOLD / Target Vision";
  panel.layoutMode = "VERTICAL";
  panel.counterAxisSizingMode = "FIXED";
  panel.resize(1208, 260);
  panel.primaryAxisSizingMode = "AUTO";
  panel.minHeight = 260;
  panel.paddingTop = panel.paddingBottom = 32;
  panel.paddingLeft = panel.paddingRight = 36;
  panel.itemSpacing = 18;
  panel.cornerRadius = 16;
  panel.fills = [solidPaint(dark("paper"))];
  panel.appendChild(await makeText("TARGET VISION / NORTH STAR", 13, "Bold", dark("teal-brand")));
  panel.appendChild(await makeWrappedText(FOOTHOLD_DATA.messages.whyNorthStarKo, 36, "Semi Bold", dark("ink"), 1136));
  panel.appendChild(await makeWrappedText(
    "INTENDED OUTCOME · Not a verified zero-fall field result · Source: VOICE_AND_MESSAGE.md",
    13,
    "Regular",
    dark("ink-secondary"),
    1136
  ));
  frame.appendChild(panel);
}

async function appendClosing(frame) {
  const panel = figma.createFrame();
  panel.name = "Approved closing panel / Dark";
  panel.layoutMode = "VERTICAL";
  panel.counterAxisSizingMode = "FIXED";
  panel.resize(1208, 260);
  panel.primaryAxisSizingMode = "AUTO";
  panel.minHeight = 260;
  panel.paddingTop = panel.paddingBottom = 32;
  panel.paddingLeft = panel.paddingRight = 32;
  panel.itemSpacing = 24;
  panel.cornerRadius = 16;
  panel.fills = [solidPaint(dark("paper"))];
  const lockup = figma.createNodeFromSvg(FOOTHOLD_DATA.svg.compactDark);
  lockup.name = "Canonical Compact Lockup / Dark";
  lockup.resize(403, 72);
  panel.appendChild(lockup);
  panel.appendChild(await makeText(FOOTHOLD_DATA.messages.closingEn, 36, "Semi Bold", dark("ink")));
  panel.appendChild(await makeText("APPROVED · Source: VOICE_AND_MESSAGE.md", 12, "Regular", dark("ink-secondary")));
  frame.appendChild(panel);
}

async function createCover(page) {
  await figma.setCurrentPageAsync(page);
  await page.loadAsync();
  let frame = findOwned(page, "cover");
  if (!frame) {
    frame = figma.createFrame();
    setOwned(frame, "cover");
    page.appendChild(frame);
  } else {
    for (const child of [...frame.children]) child.remove();
  }
  frame.name = "FOOTHOLD / Cover & Guide";
  frame.layoutMode = "VERTICAL";
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "FIXED";
  frame.resize(1440, 900);
  frame.paddingTop = frame.paddingBottom = 96;
  frame.paddingLeft = frame.paddingRight = 96;
  frame.itemSpacing = 28;
  frame.fills = [solidPaint(light("paper"))];
  const lockup = figma.createNodeFromSvg(FOOTHOLD_DATA.svg.primaryLight);
  lockup.name = "Canonical Primary Lockup";
  lockup.resize(868.345, 180);
  frame.appendChild(lockup);
  frame.appendChild(await makeText(FOOTHOLD_DATA.messages.closingEn, 48, "Semi Bold", light("ink")));
  frame.appendChild(await makeWrappedText(FOOTHOLD_DATA.messages.projectDefinitionKo, 24, "Regular", light("ink-secondary"), 1120));
  frame.appendChild(await makeText(`Brand ${FOOTHOLD_DATA.brandVersion} · Source ${FOOTHOLD_DATA.sourceDigest.slice(0, 12)} · Git is canonical`, 14, "Regular", light("ink-secondary")));
  return frame;
}

async function createFoundations(page) {
  await figma.setCurrentPageAsync(page);
  await page.loadAsync();
  let frame = findOwned(page, "foundations");
  if (!frame) {
    frame = figma.createFrame();
    setOwned(frame, "foundations");
    page.appendChild(frame);
  } else {
    for (const child of [...frame.children]) child.remove();
  }
  frame.name = "FOOTHOLD / Foundations";
  frame.layoutMode = "VERTICAL";
  frame.counterAxisSizingMode = "FIXED";
  frame.resize(1440, 900);
  frame.primaryAxisSizingMode = "AUTO";
  frame.minHeight = 900;
  frame.clipsContent = false;
  frame.paddingTop = frame.paddingBottom = 80;
  frame.paddingLeft = frame.paddingRight = 80;
  frame.itemSpacing = 24;
  frame.fills = [solidPaint(light("paper"))];
  frame.appendChild(await makeText("FOUNDATIONS", 48, "Bold", light("ink")));
  frame.appendChild(await makeText("Warm paper + engineering ink + semantic teal / amber / red", 18, "Regular", light("ink-secondary")));
  const row = figma.createFrame();
  row.name = "Canonical colour primitives";
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "AUTO";
  row.counterAxisSizingMode = "AUTO";
  row.itemSpacing = 16;
  row.fills = [];
  for (const name of ["paper", "ink", "teal-brand", "amber", "red"]) {
    const swatch = figma.createFrame();
    swatch.name = name;
    swatch.resize(220, 180);
    swatch.cornerRadius = 12;
    swatch.fills = [solidPaint(light(name))];
    row.appendChild(swatch);
  }
  frame.appendChild(row);
  frame.appendChild(await makeText("Values come from tokens/foothold.tokens.json. Do not sample this board to create new colours.", 14, "Regular", light("ink-secondary")));
  frame.appendChild(await createAssetLibrary());
  return frame;
}

async function createModule(module) {
  const frame = figma.createFrame();
  frame.name = `${module.id} / ${module.name}`;
  setOwned(frame, `module/${module.id}`);
  frame.layoutMode = "VERTICAL";
  frame.counterAxisSizingMode = "FIXED";
  frame.resize(1280, 240);
  frame.primaryAxisSizingMode = "AUTO";
  frame.minHeight = 240;
  frame.clipsContent = false;
  frame.paddingTop = frame.paddingBottom = 32;
  frame.paddingLeft = frame.paddingRight = 36;
  frame.itemSpacing = 14;
  frame.cornerRadius = 16;
  frame.fills = [solidPaint(light("card"))];
  frame.strokes = [solidPaint(light("rule"))];
  frame.strokeWeight = 1;
  frame.setSharedPluginData("foothold", "description", `${module.guidance} Source: ${module.source}. Status: ${module.status}.`);
  frame.appendChild(await makeText(`${module.id}  ${module.name.toUpperCase()}`, 14, "Bold", module.status === "ready" ? light("teal-brand") : light("amber")));
  frame.appendChild(await makeText(module.guidance, 24, "Semi Bold", light("ink")));
  frame.appendChild(await makeText(`${module.status.toUpperCase()} · Source: ${module.source}`, 13, "Regular", light("ink-secondary")));
  if (module.id === "M01") await appendBrandCore(frame);
  if (module.id === "M02") await appendHeroHierarchy(frame);
  if (module.id === "M05") await appendWhyNorthStar(frame);
  if (module.id === "M10") await appendClosing(frame);
  return frame;
}

async function createMasterBoard(page) {
  await figma.setCurrentPageAsync(page);
  await page.loadAsync();
  let board = findOwned(page, "master-board");
  if (!board) {
    board = figma.createFrame();
    setOwned(board, "master-board");
    page.appendChild(board);
  } else {
    for (const child of [...board.children]) child.remove();
  }
  board.name = "FOOTHOLD / Visual Master Board";
  board.layoutMode = "VERTICAL";
  board.counterAxisSizingMode = "FIXED";
  board.resize(1440, 1000);
  board.primaryAxisSizingMode = "AUTO";
  board.minHeight = 1000;
  board.clipsContent = false;
  board.paddingTop = board.paddingBottom = 80;
  board.paddingLeft = board.paddingRight = 80;
  board.itemSpacing = 24;
  board.fills = [solidPaint(light("paper"))];
  board.setSharedPluginData("foothold", "description", `Ratio-independent module source. Brand ${FOOTHOLD_DATA.brandVersion}; Git digest ${FOOTHOLD_DATA.sourceDigest}.`);
  board.appendChild(await makeText("FOOTHOLD / VISUAL MASTER BOARD", 48, "Bold", light("ink")));
  board.appendChild(await makeText("Why → What → How → Evidence · Target vision leads; evidence states stay explicit", 18, "Regular", light("ink-secondary")));
  for (const module of FOOTHOLD_DATA.modules) board.appendChild(await createModule(module));
  return board;
}

async function buildSkeleton() {
  await syncFoundations();
  const pages = await ensurePages();
  const cover = await createCover(pages.get("Cover & Guide"));
  const foundations = await createFoundations(pages.get("Foundations"));
  const board = await createMasterBoard(pages.get("Master Board"));
  const osmuReview = await createOsmuReview(pages.get("Master Board"), board);
  figma.viewport.scrollAndZoomIntoView([osmuReview]);
  return { pages: PAGE_NAMES, nodes: [cover.id, foundations.id, board.id, osmuReview.id], modules: FOOTHOLD_DATA.modules.length, osmuPreviews: 6 };
}

function serializeNode(node) {
  const value = { id: node.id, name: node.name, type: node.type, visible: node.visible };
  if ("x" in node) value.x = node.x;
  if ("y" in node) value.y = node.y;
  if ("width" in node) value.width = node.width;
  if ("height" in node) value.height = node.height;
  if (node.type === "TEXT") value.text = node.characters;
  if ("children" in node) value.children = node.children.map(serializeNode);
  return value;
}

async function exportReviewPackage() {
  const page = figma.root.children.find((item) => item.name === "Master Board");
  if (!page) throw new Error("Master Board page does not exist. Build the skeleton first.");
  await figma.setCurrentPageAsync(page);
  await page.loadAsync();
  const board = findOwned(page, "master-board");
  if (!board) throw new Error("FOOTHOLD Master Board frame does not exist.");
  const osmuReview = findOwned(page, "osmu-review");
  if (!osmuReview) throw new Error("FOOTHOLD OSMU Review frame does not exist.");
  const handoff = {
    schemaVersion: "1.0.0",
    brandVersion: FOOTHOLD_DATA.brandVersion,
    exportedAt: new Date().toISOString(),
    sourceDigest: FOOTHOLD_DATA.sourceDigest,
    file: { name: figma.root.name, key: figma.fileKey || "local" },
    masterBoard: serializeNode(board),
    osmuReview: serializeNode(osmuReview)
  };
  const svg = await board.exportAsync({ format: "SVG_STRING", svgOutlineText: true, svgIdAttribute: true });
  const png = await board.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: 1 } });
  const osmuSvg = await osmuReview.exportAsync({ format: "SVG_STRING", svgOutlineText: true, svgIdAttribute: true });
  const osmuPng = await osmuReview.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: 1 } });
  post("downloads", {
    files: [
      { name: "foothold-handoff.json", mime: "application/json", text: JSON.stringify(handoff, null, 2) },
      { name: "foothold-master-board.svg", mime: "image/svg+xml", text: svg },
      { name: "foothold-master-board.png", mime: "image/png", bytes: Array.from(png) },
      { name: "foothold-osmu-review.svg", mime: "image/svg+xml", text: osmuSvg },
      { name: "foothold-osmu-review.png", mime: "image/png", bytes: Array.from(osmuPng) }
    ]
  });
  return { files: 5, sourceDigest: FOOTHOLD_DATA.sourceDigest };
}

figma.ui.onmessage = async (message) => {
  try {
    post("status", { message: `Running ${message.command}…` });
    let result;
    if (message.command === "inspect") result = await inspectFile();
    else if (message.command === "sync-foundations") result = await syncFoundations();
    else if (message.command === "build-skeleton") result = await buildSkeleton();
    else if (message.command === "export") result = await exportReviewPackage();
    else throw new Error(`Unknown command: ${message.command}`);
    post("result", { command: message.command, result });
  } catch (error) {
    post("error", { command: message.command, message: error instanceof Error ? error.message : String(error) });
  }
};

post("ready", { brandVersion: FOOTHOLD_DATA.brandVersion, sourceDigest: FOOTHOLD_DATA.sourceDigest });
