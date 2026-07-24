"use strict";

const STORAGE_KEY = "nixie-live-sheet-basic-v1-portraits";
const BUILTIN_AVATARS = { mage: "assets/nixie-mage-form.png", idol: "assets/nixie-idol-form.png" };

function uid() {
  return `nixie-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const defaultState = {
  activeTab: "stats",
  form: "mage",
  rollMode: "normal",
  inspirationUsed: 0,
  rollLog: [],
  avatars: { mage: "", idol: "" },
  fields: {},
  spellSlots: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 },
    3: { max: 2, used: 0 }
  },
  hammer: {
    mage: { attack: "+4", damage: "1d4+1", label: "Bludgeoning", property: "Light" },
    idol: { attack: "+4", damage: "1d6+1", radiant: "1d6", property: "Radiant Performance" }
  },
  performanceSpells: [],
  inventory: [
    { id: uid(), name: "Banhammer", quantity: 1, weight: "4 lb.", notes: "Attuned signature weapon; changes with Go Live." },
    { id: uid(), name: "MOD", quantity: 1, weight: "5 lb.", notes: "Homebrew item; details not defined in the supplied sheet." },
    { id: uid(), name: "Leather Armor", quantity: 1, weight: "10 lb.", notes: "Equipped." },
    { id: uid(), name: "Dagger", quantity: 1, weight: "1 lb.", notes: "" },
    { id: uid(), name: "Backpack", quantity: 1, weight: "5 lb.", notes: "" },
    { id: uid(), name: "Lute", quantity: 1, weight: "2 lb.", notes: "Musical instrument and spellcasting focus." },
    { id: uid(), name: "Bedroll", quantity: 1, weight: "7 lb.", notes: "" },
    { id: uid(), name: "Candles", quantity: 5, weight: "—", notes: "" },
    { id: uid(), name: "Costume Clothes", quantity: 2, weight: "8 lb.", notes: "Idol and performance costumes." },
    { id: uid(), name: "Rations", quantity: 5, weight: "10 lb.", notes: "Five days." },
    { id: uid(), name: "Waterskin", quantity: 1, weight: "5 lb.", notes: "" },
    { id: uid(), name: "Disguise Kit", quantity: 1, weight: "3 lb.", notes: "" }
  ]
};

const abilities = [
  { key: "str", name: "Strength", short: "STR", score: 12, mod: 1, save: 1, proficient: false },
  { key: "dex", name: "Dexterity", short: "DEX", score: 9, mod: -1, save: 2, proficient: true },
  { key: "con", name: "Constitution", short: "CON", score: 14, mod: 2, save: 2, proficient: false },
  { key: "int", name: "Intelligence", short: "INT", score: 13, mod: 1, save: 1, proficient: false },
  { key: "wis", name: "Wisdom", short: "WIS", score: 11, mod: 0, save: 0, proficient: false },
  { key: "cha", name: "Charisma", short: "CHA", score: 20, mod: 5, save: 8, proficient: true }
];

const skills = [
  { name: "Acrobatics", ability: "DEX", mod: 2, rank: "P" },
  { name: "Animal Handling", ability: "WIS", mod: 1, rank: "½" },
  { name: "Arcana", ability: "INT", mod: 4, rank: "P" },
  { name: "Athletics", ability: "STR", mod: 7, rank: "E" },
  { name: "Deception", ability: "CHA", mod: 8, rank: "P" },
  { name: "History", ability: "INT", mod: 2, rank: "½" },
  { name: "Insight", ability: "WIS", mod: 1, rank: "½" },
  { name: "Intimidation", ability: "CHA", mod: 6, rank: "½" },
  { name: "Investigation", ability: "INT", mod: 2, rank: "½" },
  { name: "Medicine", ability: "WIS", mod: 1, rank: "½" },
  { name: "Nature", ability: "INT", mod: 2, rank: "½" },
  { name: "Perception", ability: "WIS", mod: 1, rank: "½" },
  { name: "Performance", ability: "CHA", mod: 11, rank: "E" },
  { name: "Persuasion", ability: "CHA", mod: 8, rank: "P" },
  { name: "Religion", ability: "INT", mod: 2, rank: "½" },
  { name: "Sleight of Hand", ability: "DEX", mod: 2, rank: "P" },
  { name: "Stealth", ability: "DEX", mod: 0, rank: "½" },
  { name: "Survival", ability: "WIS", mod: 1, rank: "½" }
];

// The supplied PDF lists spell names and casting metadata but not full damage/healing formulas.
// A few common starter formulas are included only to make the prototype roller immediately usable; all can be edited in code or via exported JSON.
const baseSpells = [
  { id: "vicious-mockery", name: "Vicious Mockery", level: 0, action: "Action", range: "60 ft.", check: "WIS save DC 16", formula: "2d6", effect: "Psychic damage roll. Apply the spell’s full rules at the table." },
  { id: "minor-illusion", name: "Minor Illusion", level: 0, action: "Action", range: "30 ft. / 5 ft. cube", check: "No roll", formula: "", effect: "Creates a brief illusion; no damage formula is stored." },
  { id: "prestidigitation", name: "Prestidigitation", level: 0, action: "Action", range: "10 ft.", check: "No roll", formula: "", effect: "Minor magical effect; no damage formula is stored." },
  { id: "healing-word", name: "Healing Word", level: 1, action: "Bonus Action", range: "60 ft.", check: "Healing", formula: "1d4+5", effect: "Starter healing formula at 1st level." },
  { id: "dissonant-whispers", name: "Dissonant Whispers", level: 1, action: "Action", range: "60 ft.", check: "WIS save DC 16", formula: "3d6", effect: "Starter damage formula at 1st level." },
  { id: "faerie-fire", name: "Faerie Fire", level: 1, action: "Action", range: "60 ft. / 20 ft. cube", check: "DEX save DC 16", formula: "", effect: "Concentration, up to 1 minute." },
  { id: "hideous-laughter", name: "Tasha’s Hideous Laughter", level: 1, action: "Action", range: "30 ft.", check: "WIS save DC 16", formula: "", effect: "Concentration, up to 1 minute." },
  { id: "silent-image", name: "Silent Image", level: 1, action: "Action", range: "60 ft. / 15 ft. cube", check: "No roll", formula: "", effect: "Concentration, up to 10 minutes. Source: MOD." },
  { id: "command", name: "Command", level: 1, action: "Action", range: "60 ft.", check: "WIS save DC 16", formula: "", effect: "One round. Fey Touched: one free cast per long rest." },
  { id: "suggestion", name: "Suggestion", level: 2, action: "Action", range: "30 ft.", check: "WIS save DC 16", formula: "", effect: "Concentration, up to 8 hours." },
  { id: "invisibility", name: "Invisibility", level: 2, action: "Action", range: "Touch", check: "No roll", formula: "", effect: "Concentration, up to 1 hour." },
  { id: "shatter", name: "Shatter", level: 2, action: "Action", range: "60 ft. / 10 ft. sphere", check: "CON save DC 16", formula: "3d8", effect: "Starter damage formula at 2nd level." },
  { id: "misty-step", name: "Misty Step", level: 2, action: "Bonus Action", range: "Self", check: "No roll", formula: "", effect: "Fey Touched: one free cast per long rest." },
  { id: "hypnotic-pattern", name: "Hypnotic Pattern", level: 3, action: "Action", range: "120 ft. / 30 ft. cube", check: "WIS save DC 16", formula: "", effect: "Concentration, up to 1 minute." }
];

let state = loadState();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeState(saved) {
  const merged = deepClone(defaultState);
  if (!saved || typeof saved !== "object") return merged;
  Object.assign(merged, saved);
  merged.avatars = { ...defaultState.avatars, ...(saved.avatars || {}) };
  merged.spellSlots = { ...deepClone(defaultState.spellSlots), ...(saved.spellSlots || {}) };
  merged.hammer = {
    mage: { ...defaultState.hammer.mage, ...(saved.hammer?.mage || {}) },
    idol: { ...defaultState.hammer.idol, ...(saved.hammer?.idol || {}) }
  };
  merged.fields = saved.fields || {};
  merged.performanceSpells = Array.isArray(saved.performanceSpells) ? saved.performanceSpells : [];
  merged.inventory = Array.isArray(saved.inventory) ? saved.inventory : deepClone(defaultState.inventory);
  merged.rollLog = Array.isArray(saved.rollLog) ? saved.rollLog : [];
  return merged;
}

function loadState() {
  try {
    return mergeState(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch (error) {
    console.warn("Could not load saved sheet:", error);
    return deepClone(defaultState);
  }
}

function saveState() {
  captureFields();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function captureFields() {
  $$('input:not([type="file"]):not([type="checkbox"]), textarea, select').forEach((element) => {
    if (!element.id || ["quickSpellSelect"].includes(element.id)) return;
    state.fields[element.id] = element.value;
  });
  state.hammer.mage = {
    attack: $("#mageHammerAttack").value,
    damage: $("#mageHammerDamage").value,
    label: $("#mageHammerDamageLabel").value,
    property: $("#mageHammerProperty").value
  };
  state.hammer.idol = {
    attack: $("#idolHammerAttack").value,
    damage: $("#idolHammerDamage").value,
    radiant: $("#idolHammerRadiant").value,
    property: $("#idolHammerProperty").value
  };
}

function restoreFields() {
  Object.entries(state.fields || {}).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element && element.type !== "file") element.value = value;
  });

  $("#mageHammerAttack").value = state.hammer.mage.attack;
  $("#mageHammerDamage").value = state.hammer.mage.damage;
  $("#mageHammerDamageLabel").value = state.hammer.mage.label;
  $("#mageHammerProperty").value = state.hammer.mage.property;
  $("#idolHammerAttack").value = state.hammer.idol.attack;
  $("#idolHammerDamage").value = state.hammer.idol.damage;
  $("#idolHammerRadiant").value = state.hammer.idol.radiant;
  $("#idolHammerProperty").value = state.hammer.idol.property;
}

function formatModifier(value) {
  const number = Number(value) || 0;
  return number >= 0 ? `+${number}` : `${number}`;
}

function numericModifier(value) {
  const match = String(value).match(/[+-]?\d+/);
  return match ? Number(match[0]) : 0;
}

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollD20(modifier = 0) {
  const first = rollDie(20);
  const second = rollDie(20);
  let chosen = first;
  let detail = `${first}`;

  if (state.rollMode === "advantage") {
    chosen = Math.max(first, second);
    detail = `${first}, ${second} → ${chosen}`;
  } else if (state.rollMode === "disadvantage") {
    chosen = Math.min(first, second);
    detail = `${first}, ${second} → ${chosen}`;
  }

  return { natural: chosen, total: chosen + modifier, detail };
}

function parseAndRollFormula(formula) {
  const normalized = String(formula || "").replace(/\s+/g, "").toLowerCase();
  if (!normalized) return { total: null, detail: "No dice formula stored." };
  if (!/^[+-]?(?:\d*d\d+|\d+)(?:[+-](?:\d*d\d+|\d+))*$/.test(normalized)) {
    return { total: null, detail: `Unsupported formula: ${formula}` };
  }

  const tokens = normalized.match(/[+-]?[^+-]+/g) || [];
  let total = 0;
  const details = [];

  for (const token of tokens) {
    const sign = token.startsWith("-") ? -1 : 1;
    const clean = token.replace(/^[+-]/, "");
    if (clean.includes("d")) {
      const [countRaw, sidesRaw] = clean.split("d");
      const count = countRaw === "" ? 1 : Number(countRaw);
      const sides = Number(sidesRaw);
      if (!Number.isInteger(count) || !Number.isInteger(sides) || count < 1 || count > 100 || sides < 2 || sides > 1000) {
        return { total: null, detail: `Unsupported formula: ${formula}` };
      }
      const rolls = Array.from({ length: count }, () => rollDie(sides));
      const subtotal = rolls.reduce((sum, value) => sum + value, 0) * sign;
      total += subtotal;
      details.push(`${sign < 0 ? "-" : ""}${count}d${sides} [${rolls.join(", ")}]`);
    } else {
      const value = Number(clean) * sign;
      total += value;
      details.push(`${value >= 0 ? "+" : ""}${value}`);
    }
  }

  return { total, detail: details.join(" ").replace(/^\+/, "") };
}

function addLog(title, text) {
  const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  state.rollLog.unshift({ id: uid(), title, text, stamp });
  state.rollLog = state.rollLog.slice(0, 8);
  renderRollLog();
  saveState();
}

function renderRollLog() {
  const container = $("#rollLog");
  if (!state.rollLog.length) {
    container.textContent = "No rolls yet.";
    return;
  }
  container.innerHTML = state.rollLog
    .map((entry) => `<div class="roll-line"><strong>${escapeHtml(entry.title)}</strong> <span class="muted">${escapeHtml(entry.stamp)}</span>\n${escapeHtml(entry.text)}</div>`)
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setActiveTab(tabName) {
  state.activeTab = tabName;
  $$(".tab-button").forEach((button) => button.classList.toggle("active", button.dataset.tab === tabName));
  $$(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === `tab-${tabName}`));
  saveState();
}

function currentHammer() {
  return state.form === "idol" ? state.hammer.idol : state.hammer.mage;
}

function updateFormPresentation() {
  const idol = state.form === "idol";
  document.body.dataset.form = state.form;
  $("#goLiveToggle").checked = idol;
  $("#formBadge").textContent = idol ? "Idol Form" : "Mage Form";
  $("#characterSubtitle").textContent = `Level 5 Changeling Bard · ${idol ? "Idol Form" : "Mage Form"}`;
  $("#switchStatus").textContent = idol ? "ON" : "OFF";
  $("#liveHeading").textContent = idol ? "Nixie Is Live!" : "Ready Backstage";
  $("#liveDescription").textContent = idol
    ? "Idol form engaged. Performance spells and the empowered Banhammer are active."
    : "Nixie is in her normal mage form.";
  $("#performanceStatus").textContent = idol ? "Performance Spellbook Active" : "Base Spellbook";
  $("#performanceLockChip").textContent = idol ? "Active" : "Locked";
  $("#performanceSpellSection").classList.toggle("locked", !idol);
  updateAvatar();
  updateBanhammerCard();
  renderSpells();
  populateQuickSpells();
}

function updateAvatar() {
  const src = state.avatars[state.form] || BUILTIN_AVATARS[state.form];
  const image = $("#activeAvatar");
  const fallback = $("#avatarFallback");
  if (src) {
    image.src = src;
    image.hidden = false;
    fallback.hidden = true;
  } else {
    image.removeAttribute("src");
    image.hidden = true;
    fallback.hidden = false;
    fallback.textContent = state.form === "idol" ? "IDOL" : "NN";
  }
}

function updateBanhammerCard() {
  captureFields();
  const idol = state.form === "idol";
  const hammer = currentHammer();
  $("#banhammerFormChip").textContent = idol ? "Empowered Idol Form" : "Normal Club";
  $("#banhammerSummary").textContent = idol
    ? "The Banhammer strengthens and adds Radiant damage while Go Live is active."
    : "A normal club while Nixie is in Mage form.";
  $("#banhammerAttackDisplay").textContent = hammer.attack;
  $("#banhammerDamageDisplay").textContent = idol
    ? `${hammer.damage} Bludgeoning + ${hammer.radiant} Radiant`
    : `${hammer.damage} ${hammer.label}`;
  $("#banhammerPropertyDisplay").textContent = hammer.property;
}

function renderInspiration() {
  const container = $("#inspirationPips");
  container.innerHTML = "";
  for (let i = 0; i < 5; i += 1) {
    const button = document.createElement("button");
    button.type = "button";
    const available = i >= state.inspirationUsed;
    button.className = `pip ${available ? "available" : ""}`;
    button.textContent = available ? "d8" : "Used";
    button.title = available ? "Click to spend this use" : "Click to restore this use";
    button.addEventListener("click", () => {
      state.inspirationUsed = available ? Math.min(5, i + 1) : i;
      renderInspiration();
      saveState();
    });
    container.appendChild(button);
  }
}

function renderAttributes() {
  const container = $("#attributeGrid");
  container.innerHTML = "";
  abilities.forEach((ability) => {
    const scoreId = `ability-${ability.key}-score`;
    const score = Number(state.fields[scoreId] ?? ability.score);
    const modifier = Math.floor((score - 10) / 2);
    const saveModifier = ability.proficient ? modifier + 3 : modifier;

    const card = document.createElement("article");
    card.className = "card attribute-card";
    card.innerHTML = `
      <p class="eyebrow">${ability.short}</p>
      <h3>${ability.name}</h3>
      <input class="attribute-score" id="${scoreId}" type="number" value="${score}" aria-label="${ability.name} score" />
      <button class="modifier-button" type="button">${formatModifier(modifier)} Check</button>
      <button class="save-button" type="button">${formatModifier(saveModifier)} Save${ability.proficient ? " · Proficient" : ""}</button>
    `;

    const scoreInput = card.querySelector("input");
    const checkButton = card.querySelector(".modifier-button");
    const saveButton = card.querySelector(".save-button");

    const refresh = () => {
      const currentScore = Number(scoreInput.value) || 10;
      const currentMod = Math.floor((currentScore - 10) / 2);
      const currentSave = currentMod + (ability.proficient ? 3 : 0);
      checkButton.textContent = `${formatModifier(currentMod)} Check`;
      saveButton.textContent = `${formatModifier(currentSave)} Save${ability.proficient ? " · Proficient" : ""}`;
      state.fields[scoreId] = scoreInput.value;
      saveState();
    };

    scoreInput.addEventListener("change", refresh);
    checkButton.addEventListener("click", () => {
      const mod = Math.floor(((Number(scoreInput.value) || 10) - 10) / 2);
      const roll = rollD20(mod);
      addLog(`${ability.name} Check`, `d20 (${roll.detail}) ${formatModifier(mod)} = ${roll.total}`);
    });
    saveButton.addEventListener("click", () => {
      const mod = Math.floor(((Number(scoreInput.value) || 10) - 10) / 2) + (ability.proficient ? 3 : 0);
      const roll = rollD20(mod);
      addLog(`${ability.name} Save`, `d20 (${roll.detail}) ${formatModifier(mod)} = ${roll.total}`);
    });

    container.appendChild(card);
  });
}

function renderSkills() {
  const container = $("#skillList");
  container.innerHTML = "";
  skills.forEach((skill) => {
    const row = document.createElement("div");
    row.className = "skill-row";
    row.innerHTML = `
      <span class="skill-marker" title="P = proficient, E = expertise, ½ = Jack of All Trades">${skill.rank}</span>
      <span><strong>${skill.name}</strong><br><small class="muted">${skill.ability}</small></span>
      <button type="button">${formatModifier(skill.mod)}</button>
    `;
    row.querySelector("button").addEventListener("click", () => {
      const roll = rollD20(skill.mod);
      addLog(`${skill.name} Check`, `d20 (${roll.detail}) ${formatModifier(skill.mod)} = ${roll.total}`);
    });
    container.appendChild(row);
  });
}

function renderSpellSlots() {
  const row = $("#spellSlotRow");
  row.innerHTML = "";
  Object.entries(state.spellSlots).forEach(([level, slot]) => {
    const card = document.createElement("article");
    card.className = "slot-card";
    card.innerHTML = `<h3>Level ${level} Slots</h3><div class="slot-pips"></div>`;
    const pips = card.querySelector(".slot-pips");
    for (let index = 0; index < slot.max; index += 1) {
      const button = document.createElement("button");
      button.type = "button";
      const available = index >= slot.used;
      button.className = `slot-pip ${available ? "available" : ""}`;
      button.textContent = available ? level : "×";
      button.title = available ? "Click to spend slot" : "Click to restore slot";
      button.addEventListener("click", () => {
        slot.used = available ? Math.min(slot.max, index + 1) : index;
        renderSpellSlots();
        saveState();
      });
      pips.appendChild(button);
    }
    row.appendChild(card);
  });
}

function allAvailableSpells() {
  return state.form === "idol" ? [...baseSpells, ...state.performanceSpells] : baseSpells;
}

function renderSpellCard(spell, performance = false) {
  const locked = performance && state.form !== "idol";
  const article = document.createElement("article");
  article.className = `card spell-card ${locked ? "locked" : ""}`;
  article.innerHTML = `
    ${performance ? '<button class="delete-card-button" type="button" title="Delete spell">×</button>' : ""}
    <p class="eyebrow">${performance ? "Performance" : spell.level === 0 ? "Cantrip" : `Level ${spell.level}`}</p>
    <h3>${escapeHtml(spell.name)}</h3>
    <div class="spell-meta"><span>${escapeHtml(spell.action || "Action")}</span><span>·</span><span>${escapeHtml(spell.range || "—")}</span></div>
    <div class="spell-meta"><span>${escapeHtml(spell.check || (spell.formula ? "Roll" : "No roll"))}</span></div>
    <p class="spell-effect">${escapeHtml(spell.effect || "No effect text stored.")}</p>
    <div class="button-row"><button class="spell-roll" type="button" ${locked ? "disabled" : ""}>Roll / Use</button></div>
  `;

  article.querySelector(".spell-roll").addEventListener("click", () => castSpell(spell));
  const deleteButton = article.querySelector(".delete-card-button");
  if (deleteButton) {
    deleteButton.addEventListener("click", () => {
      state.performanceSpells = state.performanceSpells.filter((item) => item.id !== spell.id);
      renderSpells();
      populateQuickSpells();
      saveState();
    });
  }
  return article;
}

function renderSpells() {
  const baseGrid = $("#baseSpellGrid");
  const performanceGrid = $("#performanceSpellGrid");
  baseGrid.innerHTML = "";
  performanceGrid.innerHTML = "";

  baseSpells.forEach((spell) => baseGrid.appendChild(renderSpellCard(spell, false)));

  if (!state.performanceSpells.length) {
    performanceGrid.innerHTML = '<div class="empty-state"><strong>No Performance spells added yet.</strong><br>Add the exact homebrew abilities when their rules are ready.</div>';
  } else {
    state.performanceSpells.forEach((spell) => performanceGrid.appendChild(renderSpellCard(spell, true)));
  }
}

function populateQuickSpells() {
  const select = $("#quickSpellSelect");
  const previous = select.value;
  select.innerHTML = "";
  allAvailableSpells().forEach((spell) => {
    const option = document.createElement("option");
    option.value = spell.id;
    option.textContent = `${spell.name}${state.performanceSpells.some((item) => item.id === spell.id) ? " · Performance" : ""}`;
    select.appendChild(option);
  });
  if ([...select.options].some((option) => option.value === previous)) select.value = previous;
  updateQuickSpellDetails();
}

function selectedQuickSpell() {
  return allAvailableSpells().find((spell) => spell.id === $("#quickSpellSelect").value) || allAvailableSpells()[0];
}

function updateQuickSpellDetails() {
  const spell = selectedQuickSpell();
  if (!spell) return;
  $("#quickSpellDetails").innerHTML = `
    <strong>${escapeHtml(spell.name)}</strong><br>
    ${escapeHtml(spell.action || "Action")} · ${escapeHtml(spell.range || "—")}<br>
    ${escapeHtml(spell.check || "No roll")} ${spell.formula ? `· ${escapeHtml(spell.formula)}` : ""}
  `;
}

function castSpell(spell, consumeSlot = false) {
  if (!spell) return;
  if (state.performanceSpells.some((item) => item.id === spell.id) && state.form !== "idol") {
    addLog(spell.name, "Performance spell unavailable until Go Live is active.");
    return;
  }

  let text = `${spell.action || "Action"} · ${spell.range || "—"}`;
  if (spell.formula) {
    const roll = parseAndRollFormula(spell.formula);
    text += `\n${roll.detail}${roll.total !== null ? ` = ${roll.total}` : ""}`;
  } else if (String(spell.check || "").includes("save")) {
    text += `\nTarget makes ${spell.check}.`;
  } else {
    text += "\nNo dice formula stored.";
  }

  if (consumeSlot && Number(spell.level) > 0) {
    const slot = state.spellSlots[spell.level];
    if (!slot) {
      text += `\nNo level ${spell.level} slot tracker exists in this prototype.`;
    } else if (slot.used >= slot.max) {
      text += `\nNo level ${spell.level} spell slots remain.`;
    } else {
      slot.used += 1;
      text += `\nLevel ${spell.level} spell slot consumed.`;
      renderSpellSlots();
    }
  }

  addLog(spell.name, text);
  saveState();
}

function renderInventory() {
  const list = $("#inventoryList");
  list.innerHTML = "";
  state.inventory.forEach((item) => {
    const row = document.createElement("div");
    row.className = "inventory-row";
    row.innerHTML = `
      <span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.notes || "")}</small></span>
      <input class="item-qty" type="number" min="0" value="${Number(item.quantity) || 0}" aria-label="${escapeHtml(item.name)} quantity" />
      <span class="item-weight">${escapeHtml(item.weight || "—")}</span>
      <button class="secondary small" type="button">Remove</button>
    `;
    row.querySelector(".item-qty").addEventListener("change", (event) => {
      item.quantity = Number(event.target.value) || 0;
      saveState();
    });
    row.querySelector("button").addEventListener("click", () => {
      state.inventory = state.inventory.filter((entry) => entry.id !== item.id);
      renderInventory();
      saveState();
    });
    list.appendChild(row);
  });
}

function uploadAvatar(form, file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    addLog("Avatar Upload", "That file is not an image.");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    state.avatars[form] = reader.result;
    updateAvatar();
    saveState();
  };
  reader.readAsDataURL(file);
}

function exportState() {
  saveState();
  const payload = {
    app: "Nixie Live Character Sheet",
    version: 1,
    exportedAt: new Date().toISOString(),
    state
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "nixie-live-sheet-save.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importState(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      state = mergeState(parsed.state || parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      location.reload();
    } catch (error) {
      addLog("Import Failed", "The selected file is not a valid Nixie sheet JSON save.");
    }
  };
  reader.readAsText(file);
}

function resetSheet() {
  if (!confirm("Reset the Nixie sheet to its original basic-version data?")) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

function initializeEvents() {
  $$(".tab-button").forEach((button) => button.addEventListener("click", () => setActiveTab(button.dataset.tab)));

  $("#goLiveToggle").addEventListener("change", (event) => {
    state.form = event.target.checked ? "idol" : "mage";
    updateFormPresentation();
    addLog("Go Live", state.form === "idol" ? "Idol form engaged." : "Returned to Mage form.");
    saveState();
  });

  $("#damageBtn").addEventListener("click", () => {
    const amount = Math.max(0, Number($("#hpChange").value) || 0);
    let temp = Math.max(0, Number($("#tempHp").value) || 0);
    let current = Math.max(0, Number($("#currentHp").value) || 0);
    const absorbed = Math.min(temp, amount);
    temp -= absorbed;
    current = Math.max(0, current - (amount - absorbed));
    $("#tempHp").value = temp;
    $("#currentHp").value = current;
    addLog("Damage", `${amount} damage applied${absorbed ? `; ${absorbed} absorbed by temporary HP` : ""}.`);
  });

  $("#healBtn").addEventListener("click", () => {
    const amount = Math.max(0, Number($("#hpChange").value) || 0);
    const max = Math.max(1, Number($("#maxHp").value) || 1);
    const current = Math.min(max, Math.max(0, Number($("#currentHp").value) || 0) + amount);
    $("#currentHp").value = current;
    addLog("Healing", `${amount} HP restored.`);
  });

  $("#shortRestBtn").addEventListener("click", () => {
    state.inspirationUsed = 0;
    renderInspiration();
    addLog("Short Rest", "Bardic Inspiration restored to five uses.");
  });

  $("#longRestBtn").addEventListener("click", () => {
    $("#currentHp").value = $("#maxHp").value;
    $("#tempHp").value = 0;
    state.inspirationUsed = 0;
    Object.values(state.spellSlots).forEach((slot) => { slot.used = 0; });
    renderInspiration();
    renderSpellSlots();
    addLog("Long Rest", "HP, Bardic Inspiration, and tracked spell slots restored.");
  });

  $("#rollInspirationBtn").addEventListener("click", () => {
    addLog("Bardic Inspiration", `1d8 [${rollDie(8)}]`);
  });

  $("#banhammerAttackBtn").addEventListener("click", () => {
    captureFields();
    const hammer = currentHammer();
    const modifier = numericModifier(hammer.attack);
    const roll = rollD20(modifier);
    addLog(`Banhammer Attack · ${state.form === "idol" ? "Idol" : "Mage"}`, `d20 (${roll.detail}) ${formatModifier(modifier)} = ${roll.total}`);
  });

  $("#banhammerDamageBtn").addEventListener("click", () => {
    captureFields();
    const hammer = currentHammer();
    const weapon = parseAndRollFormula(hammer.damage);
    let text = `${weapon.detail}${weapon.total !== null ? ` = ${weapon.total} Bludgeoning` : ""}`;
    if (state.form === "idol") {
      const radiant = parseAndRollFormula(hammer.radiant);
      text += `\n${radiant.detail}${radiant.total !== null ? ` = ${radiant.total} Radiant` : ""}`;
    }
    addLog(`Banhammer Damage · ${state.form === "idol" ? "Idol" : "Mage"}`, text);
  });

  $("#quickSpellSelect").addEventListener("change", updateQuickSpellDetails);
  $("#quickSpellRollBtn").addEventListener("click", () => castSpell(selectedQuickSpell(), false));
  $("#quickSpellSlotBtn").addEventListener("click", () => castSpell(selectedQuickSpell(), true));

  $$("[data-roll-mode]").forEach((button) => button.addEventListener("click", () => {
    state.rollMode = button.dataset.rollMode;
    $$("[data-roll-mode]").forEach((entry) => entry.classList.toggle("active", entry.dataset.rollMode === state.rollMode));
    saveState();
  }));

  $("#clearLogBtn").addEventListener("click", () => {
    state.rollLog = [];
    renderRollLog();
    saveState();
  });

  $("#addPerformanceSpellBtn").addEventListener("click", () => $("#performanceSpellDialog").showModal());
  $("#cancelSpellDialogBtn").addEventListener("click", () => $("#performanceSpellDialog").close());
  $("#performanceSpellForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("#newSpellName").value.trim();
    if (!name) return;
    state.performanceSpells.push({
      id: uid(),
      name,
      level: Math.max(0, Number($("#newSpellLevel").value) || 0),
      action: $("#newSpellAction").value.trim() || "Action",
      range: $("#newSpellRange").value.trim() || "—",
      check: $("#newSpellFormula").value.trim() ? "Roll" : "No roll",
      formula: $("#newSpellFormula").value.trim(),
      effect: $("#newSpellEffect").value.trim()
    });
    event.target.reset();
    $("#newSpellLevel").value = 1;
    $("#newSpellAction").value = "Action";
    $("#newSpellRange").value = "60 ft.";
    $("#performanceSpellDialog").close();
    renderSpells();
    populateQuickSpells();
    saveState();
  });

  $("#addInventoryBtn").addEventListener("click", () => $("#inventoryDialog").showModal());
  $("#cancelInventoryDialogBtn").addEventListener("click", () => $("#inventoryDialog").close());
  $("#inventoryForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("#newItemName").value.trim();
    if (!name) return;
    state.inventory.push({
      id: uid(),
      name,
      quantity: Math.max(1, Number($("#newItemQuantity").value) || 1),
      weight: $("#newItemWeight").value.trim() || "—",
      notes: $("#newItemNotes").value.trim()
    });
    event.target.reset();
    $("#newItemQuantity").value = 1;
    $("#newItemWeight").value = "0 lb.";
    $("#inventoryDialog").close();
    renderInventory();
    saveState();
  });

  $("#mageAvatarInput").addEventListener("change", (event) => uploadAvatar("mage", event.target.files[0]));
  $("#idolAvatarInput").addEventListener("change", (event) => uploadAvatar("idol", event.target.files[0]));
  $("#clearAvatarsBtn").addEventListener("click", () => {
    state.avatars = { mage: "", idol: "" };
    updateAvatar();
    addLog("Avatars", "Custom avatars cleared. Reverted to the bundled Mage and Idol portraits.");
    saveState();
  });

  ["mageHammerAttack", "mageHammerDamage", "mageHammerDamageLabel", "mageHammerProperty", "idolHammerAttack", "idolHammerDamage", "idolHammerRadiant", "idolHammerProperty"]
    .forEach((id) => document.getElementById(id).addEventListener("input", () => {
      captureFields();
      updateBanhammerCard();
      saveState();
    }));

  $("#exportBtn").addEventListener("click", exportState);
  $("#importInput").addEventListener("change", (event) => importState(event.target.files[0]));
  $("#resetBtn").addEventListener("click", resetSheet);

  document.addEventListener("input", (event) => {
    if (event.target.matches('input:not([type="file"]), textarea, select')) saveState();
  });
}

function initialize() {
  restoreFields();
  renderAttributes();
  renderSkills();
  renderInspiration();
  renderSpellSlots();
  renderInventory();
  renderRollLog();
  initializeEvents();
  setActiveTab(state.activeTab || "stats");
  state.form = state.form === "idol" ? "idol" : "mage";
  $$("[data-roll-mode]").forEach((button) => button.classList.toggle("active", button.dataset.rollMode === state.rollMode));
  updateFormPresentation();
}

initialize();
