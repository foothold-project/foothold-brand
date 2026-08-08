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

async function createAssetCard(asset) {
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
  preview.resize(360, 190);
  preview.primaryAxisSizingMode = "FIXED";
  preview.counterAxisSizingMode = "FIXED";
  preview.primaryAxisAlignItems = "CENTER";
  preview.counterAxisAlignItems = "CENTER";
  preview.clipsContent = true;
  preview.cornerRadius = 8;
  preview.fills = [solidPaint(asset.theme === "dark" ? light("ink") : light("paper"))];

  const artwork = figma.createNodeFromSvg(asset.svg);
  artwork.name = asset.name;
  const scale = Math.min(328 / asset.width, 158 / asset.height);
  artwork.resize(asset.width * scale, asset.height * scale);
  preview.appendChild(artwork);
  card.appendChild(preview);
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
  library.name = "FOOTHOLD / Logo & Asset Library";
  setOwned(library, "asset-library");
  library.layoutMode = "VERTICAL";
  library.counterAxisSizingMode = "FIXED";
  library.resize(1280, 400);
  library.primaryAxisSizingMode = "AUTO";
  library.minHeight = 400;
  library.itemSpacing = 28;
  library.fills = [];
  library.clipsContent = false;
  library.appendChild(await makeText("LOGO & ASSET LIBRARY", 36, "Bold", light("ink")));
  library.appendChild(await makeWrappedText(
    `${FOOTHOLD_DATA.libraryAssets.length} approved vector assets from the Git manifest. Canonical paths remain frozen; Figma nodes are visual working copies.`,
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
  return library;
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
  frame.appendChild(await makeText(FOOTHOLD_DATA.messages.whyKo, 36, "Semi Bold", light("ink")));
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
  if (module.id === "M01") {
    const lockup = figma.createNodeFromSvg(FOOTHOLD_DATA.svg.primaryLight);
    lockup.name = "Canonical Primary Lockup";
    lockup.resize(579, 120);
    frame.appendChild(lockup);
  }
  if (module.id === "M02") frame.appendChild(await makeText(FOOTHOLD_DATA.messages.whyKo, 28, "Semi Bold", light("ink")));
  if (module.id === "M10") frame.appendChild(await makeText("Find the next foothold.", 28, "Semi Bold", light("ink")));
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
  board.appendChild(await makeText("Why → What → How → Evidence · Pending facts stay visibly pending", 18, "Regular", light("ink-secondary")));
  for (const module of FOOTHOLD_DATA.modules) board.appendChild(await createModule(module));
  return board;
}

async function buildSkeleton() {
  await syncFoundations();
  const pages = await ensurePages();
  const cover = await createCover(pages.get("Cover & Guide"));
  const foundations = await createFoundations(pages.get("Foundations"));
  const board = await createMasterBoard(pages.get("Master Board"));
  figma.viewport.scrollAndZoomIntoView([board]);
  return { pages: PAGE_NAMES, nodes: [cover.id, foundations.id, board.id], modules: FOOTHOLD_DATA.modules.length };
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
  const handoff = {
    schemaVersion: "1.0.0",
    brandVersion: FOOTHOLD_DATA.brandVersion,
    exportedAt: new Date().toISOString(),
    sourceDigest: FOOTHOLD_DATA.sourceDigest,
    file: { name: figma.root.name, key: figma.fileKey || "local" },
    masterBoard: serializeNode(board)
  };
  const svg = await board.exportAsync({ format: "SVG_STRING", svgOutlineText: true, svgIdAttribute: true });
  const png = await board.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: 1 } });
  post("downloads", {
    files: [
      { name: "foothold-handoff.json", mime: "application/json", text: JSON.stringify(handoff, null, 2) },
      { name: "foothold-master-board.svg", mime: "image/svg+xml", text: svg },
      { name: "foothold-master-board.png", mime: "image/png", bytes: Array.from(png) }
    ]
  });
  return { files: 3, sourceDigest: FOOTHOLD_DATA.sourceDigest };
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
