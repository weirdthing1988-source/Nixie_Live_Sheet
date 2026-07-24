"use strict";

const STORAGE_KEY = "nixie-live-sheet-v2-parallel-classes";
const LEGACY_KEYS = ["nixie-live-sheet-basic-v1-portraits", "nixie-live-sheet-basic-v1"];
const BUILTIN_AVATARS = {
  mage: "assets/nixie-mage-avatar.png",
  idol: "assets/nixie-idol-avatar.png"
};

function uid() {
  return `nixie-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const defaultState = {
  activeTab: "stats",
  form: "mage",
  rollMode: "normal",
  inspirationUsed: 0,
  encoreUsed: false,
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
    idol: { attack: "+10", damage: "1d6+2", radiant: "1d6", property: "Empowered · Radiant" }
  },
  customIdolMoves: [],
  inventory: [
    { id: uid(), name: "Banhammer", quantity: 1, weight: "4 lb.", notes: "Attuned signature weapon; dormant in Mage form and unfurled in Idol form." },
    { id: uid(), name: "MOD", quantity: 1, weight: "5 lb.", notes: "Nixie’s performance companion and broadcast device." },
    { id: uid(), name: "Leather Armor", quantity: 1, weight: "10 lb.", notes: "Equipped." },
    { id: uid(), name: "Dagger", quantity: 1, weight: "1 lb.", notes: "" },
    { id: uid(), name: "Backpack", quantity: 1, weight: "5 lb.", notes: "" },
    { id: uid(), name: "Lute", quantity: 1, weight: "2 lb.", notes: "Musical instrument and focus." },
    { id: uid(), name: "Bedroll", quantity: 1, weight: "7 lb.", notes: "" },
    { id: uid(), name: "Candles", quantity: 5, weight: "—", notes: "" },
    { id: uid(), name: "Costume Clothes", quantity: 2, weight: "8 lb.", notes: "Mage and Idol wardrobes." },
    { id: uid(), name: "Rations", quantity: 5, weight: "10 lb.", notes: "Five days." },
    { id: uid(), name: "Waterskin", quantity: 1, weight: "5 lb.", notes: "" },
    { id: uid(), name: "Disguise Kit", quantity: 1, weight: "3 lb.", notes: "" }
  ]
};

const abilities = [
  { key: "str", name: "Strength", short: "STR", score: 12, proficient: false },
  { key: "dex", name: "Dexterity", short: "DEX", score: 9, proficient: true },
  { key: "con", name: "Constitution", short: "CON", score: 14, proficient: false },
  { key: "int", name: "Intelligence", short: "INT", score: 13, proficient: false },
  { key: "wis", name: "Wisdom", short: "WIS", score: 11, proficient: false },
  { key: "cha", name: "Charisma", short: "CHA", score: 20, proficient: true }
];

const skills = [
  { name: "Acrobatics", ability: "DEX", abilityKey: "dex", rank: "P" },
  { name: "Animal Handling", ability: "WIS", abilityKey: "wis", rank: "½" },
  { name: "Arcana", ability: "INT", abilityKey: "int", rank: "P" },
  { name: "Athletics", ability: "STR", abilityKey: "str", rank: "E" },
  { name: "Deception", ability: "CHA", abilityKey: "cha", rank: "P" },
  { name: "History", ability: "INT", abilityKey: "int", rank: "½" },
  { name: "Insight", ability: "WIS", abilityKey: "wis", rank: "½" },
  { name: "Intimidation", ability: "CHA", abilityKey: "cha", rank: "½" },
  { name: "Investigation", ability: "INT", abilityKey: "int", rank: "½" },
  { name: "Medicine", ability: "WIS", abilityKey: "wis", rank: "½" },
  { name: "Nature", ability: "INT", abilityKey: "int", rank: "½" },
  { name: "Perception", ability: "WIS", abilityKey: "wis", rank: "½" },
  { name: "Performance", ability: "CHA", abilityKey: "cha", rank: "E" },
  { name: "Persuasion", ability: "CHA", abilityKey: "cha", rank: "P" },
  { name: "Religion", ability: "INT", abilityKey: "int", rank: "½" },
  { name: "Sleight of Hand", ability: "DEX", abilityKey: "dex", rank: "P" },
  { name: "Stealth", ability: "DEX", abilityKey: "dex", rank: "½" },
  { name: "Survival", ability: "WIS", abilityKey: "wis", rank: "½" }
];

const mageSpells = [
  {
    id: "mage-hand", name: "Mage Hand", level: 0, category: "Utility Cantrip", action: "Action", range: "30 ft.", check: "No roll", formula: "",
    effect: "Create a spectral hand that manipulates light objects, opens unlocked doors or containers, and performs simple remote interactions."
  },
  {
    id: "disguise-self", name: "Disguise Self", level: 1, category: "Mage Spell", action: "Action", range: "Self", check: "No roll", formula: "",
    effect: "Alter Nixie’s visible appearance, clothing, armour and equipment for 1 hour. This complements her natural changeling transformation by changing the whole presentation."
  },
  {
    id: "magic-missile", name: "Magic Missile", level: 1, category: "Mage Spell", action: "Action", range: "120 ft.", check: "Automatic hits", formula: "3d4+3", scaling: "missile",
    effect: "Three magical darts strike creatures Nixie can see. Each higher slot creates one additional dart."
  },
  {
    id: "shield", name: "Shield", level: 1, category: "Mage Spell", action: "Reaction", range: "Self", check: "+5 AC until next turn", formula: "",
    effect: "Cast when hit by an attack or targeted by Magic Missile. Nixie gains +5 AC until the start of her next turn and takes no damage from Magic Missile."
  },
  {
    id: "detect-magic", name: "Detect Magic", level: 1, category: "Utility Spell", action: "Action / Ritual", range: "Self · 30-ft. sense", check: "Concentration, 10 minutes", formula: "",
    effect: "Sense nearby magic and identify its school when an aura is visible. May be cast as a ritual."
  },
  {
    id: "locate-object", name: "Locate Object", level: 2, category: "Utility Spell", action: "Action", range: "Self · 1,000 ft.", check: "Concentration, 10 minutes", formula: "",
    effect: "Sense the direction of a familiar object. Nixie primarily uses this when she loses the Banhammer."
  }
];

const idolMoves = [
  {
    id: "spotlight", name: "Spotlight", level: 1, category: "Performance Move", action: "Bonus Action", range: "60 ft.", check: "No save", formula: "",
    effect: "Place a magical spotlight over one enemy. The next attack roll made against that creature before the end of Nixie’s next turn has Advantage; the effect then ends."
  },
  {
    id: "superchat", name: "Superchat", level: 1, category: "Performance Move", action: "Bonus Action", range: "60 ft.", check: "Healing", formula: "1d4+5", scaling: "superchat",
    quote: "Thank you for the Superchat!",
    effect: "Nixie thanks an ally for the Superchat and restores 1d4 + Charisma modifier HP. Each higher slot adds 1d4 healing."
  },
  {
    id: "get-hyped", name: "Get Hyped!", level: 1, category: "Performance Move", action: "Bonus Action", range: "60 ft.", check: "No save", formula: "", scaling: "targets",
    effect: "One ally who can see or hear Nixie gains Advantage on their next attack before the end of their next turn. Each higher slot affects one additional ally."
  },
  {
    id: "winky-heart", name: "Winky Heart", level: 1, category: "Performance Move", action: "Action", range: "60 ft.", check: "WIS save DC 16", formula: "",
    effect: "Nixie makes a heart with her hands and winks. On a failed save, a creature that can see her is Charmed for up to 1 minute with Concentration, repeating the save after damage and at the end of each turn."
  },
  {
    id: "stage-fog", name: "Stage Fog", level: 1, category: "Performance Move", action: "Action", range: "120 ft.", check: "Concentration, up to 1 hour", formula: "",
    effect: "Create a dry-ice-style cloud that heavily obscures its area. Wind disperses it normally; the cloud does not automatically spare Nixie or her allies."
  },
  {
    id: "dubstep", name: "Dubstep", level: 2, category: "Performance Move", action: "Bonus Action", range: "Self · 30-ft. teleport", check: "No roll", formula: "",
    effect: "Nixie vanishes on the musical drop and reappears in an unoccupied space she can see within 30 feet, bursting into harmless Radiant stage light."
  },
  {
    id: "echoing-illusion", name: "Echoing Illusion", level: 2, category: "Performance Move", action: "Action", range: "60 ft.", check: "Concentration, up to 10 minutes", formula: "",
    effect: "Create up to five illusory backup dancers that copy Nixie’s appearance, movements and spoken words. They cannot attack, cast spells or physically interact and vanish when touched."
  },
  {
    id: "crowd-surf", name: "Crowd Surf", level: 3, category: "Performance Move", action: "Action", range: "Self · move up to Speed", check: "STR save DC 16", formula: "3d6",
    effect: "Move through hostile creatures without provoking Opportunity Attacks. Each creature passed through takes Thunder damage and is pushed 10 feet on a failed save, or half damage without the push on a success."
  },
  {
    id: "radiant-laser", name: "Radiant Laser", level: 3, category: "Performance Move", action: "Action", range: "Self · 15-ft. radius", check: "DEX save DC 16", formula: "4d6",
    effect: "Choreographed lasers erupt around Nixie. Creatures of her choice in the area take full Radiant damage on a failed save or half on a success."
  }
];

const idolFeatures = [
  {
    id: "encore", name: "Encore", unlock: 1, category: "Idol Class Feature", action: "Ally Reaction + Nixie Reaction", range: "See or hear Nixie", check: "Ally CHA (Performance or Persuasion), DC 10 + move level",
    effect: "Once per short rest, an ally calls for an Encore immediately after Nixie uses a spell or Performance Move. On a successful check, Nixie repeats it without another slot at half damage, healing, targets, movement, range or duration where applicable. An Encore cannot Encore itself."
  },
  {
    id: "vtube-2d", name: "V-Tube FX: 2D Mode", unlock: 2, category: "V-Tube FX", action: "Bonus Action", range: "Self", check: "Up to 10 minutes",
    effect: "Nixie becomes a flat animated sprite. Attacks against her have Disadvantage; she can squeeze through 1-inch gaps and has Advantage to hide against flat scenery. She cannot attack, cast, use Performance Moves, wield the Banhammer, grapple or shove. Area effects and saves affect her normally."
  },
  {
    id: "vtube-chibi", name: "V-Tube FX: Chibi Mode", unlock: 5, category: "V-Tube FX", action: "Bonus Action", range: "Self", check: "Up to 10 minutes",
    effect: "Nixie becomes Tiny, gains Advantage on Stealth checks, can hide inside small spaces and can share a willing creature’s space. Her speed is reduced and she cannot wield the Banhammer or make weapon attacks."
  },
  {
    id: "vtube-transition", name: "V-Tube FX: Scene Transition", unlock: 8, category: "V-Tube FX", action: "Action", range: "Long-range reposition", check: "Rules to finalise",
    effect: "A stream transition relocates Nixie over a longer distance than Dubstep and may eventually carry one willing adjacent ally. This feature is locked until Idol level 8."
  },
  {
    id: "vtube-difficulties", name: "V-Tube FX: Technical Difficulties", unlock: 11, category: "V-Tube FX", action: "Reaction", range: "Enemy in range", check: "Rules to finalise",
    effect: "Glitch an enemy’s perception to interfere with an attack or concentration. This feature is locked until Idol level 11 and its final mechanics remain editable."
  }
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
  merged.customIdolMoves = Array.isArray(saved.customIdolMoves)
    ? saved.customIdolMoves
    : Array.isArray(saved.performanceSpells) ? saved.performanceSpells : [];
  merged.inventory = Array.isArray(saved.inventory) ? saved.inventory : deepClone(defaultState.inventory);
  merged.rollLog = Array.isArray(saved.rollLog) ? saved.rollLog : [];
  merged.encoreUsed = Boolean(saved.encoreUsed);
  return merged;
}

function loadState() {
  const keys = [STORAGE_KEY, ...LEGACY_KEYS];
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return mergeState(JSON.parse(raw));
    } catch (error) {
      console.warn(`Could not load ${key}:`, error);
    }
  }
  return deepClone(defaultState);
}

function saveState() {
  captureFields();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Could not save sheet. An uploaded avatar may be too large for browser storage.", error);
  }
}

function captureFields() {
  $$('input:not([type="file"]):not([type="checkbox"]), textarea, select').forEach((element) => {
    if (!element.id || ["quickSpellSelect", "activeClass"].includes(element.id)) return;
    state.fields[element.id] = element.value;
  });
  if ($("#mageHammerAttack")) {
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
}

function restoreFields() {
  Object.entries(state.fields || {}).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element && element.type !== "file" && !element.readOnly) element.value = value;
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
  const compact = String(formula || "").replace(/\s+/g, "");
  if (!compact) return { total: null, detail: "No dice formula stored." };
  const match = compact.match(/^(\d*)d(\d+)([+-]\d+)?$/i);
  if (!match) return { total: null, detail: `Formula: ${compact}` };
  const count = Number(match[1] || 1);
  const sides = Number(match[2]);
  const modifier = Number(match[3] || 0);
  const rolls = Array.from({ length: count }, () => rollDie(sides));
  const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
  const modText = modifier ? ` ${modifier >= 0 ? "+" : "−"} ${Math.abs(modifier)}` : "";
  return { total, detail: `${count}d${sides} [${rolls.join(", ")}]${modText}` };
}

function addLog(title, text) {
  state.rollLog.unshift({ title, text, stamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
  state.rollLog = state.rollLog.slice(0, 12);
  renderRollLog();
  saveState();
}

function renderRollLog() {
  const container = $("#rollLog");
  if (!state.rollLog.length) {
    container.textContent = "No rolls yet.";
    return;
  }
  container.innerHTML = state.rollLog.map((entry) => `
    <div class="roll-line"><strong>${escapeHtml(entry.title)}</strong> <span class="muted">${escapeHtml(entry.stamp)}</span>\n${escapeHtml(entry.text)}</div>
  `).join("");
}

function getLevel() {
  return Math.max(1, Math.min(20, Number($("#characterLevel")?.value || state.fields.characterLevel || 5)));
}

function getProficiencyBonus() {
  return Math.ceil(getLevel() / 4) + 1;
}

function setActiveTab(tabName) {
  state.activeTab = tabName;
  $$(".tab-button").forEach((button) => button.classList.toggle("active", button.dataset.tab === tabName));
  $$(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === `tab-${tabName}`));
  saveState();
}

function activeClassName() {
  return state.form === "idol" ? "Idol" : "Bard";
}

function currentHammer() {
  return state.form === "idol" ? state.hammer.idol : state.hammer.mage;
}

function activeActions() {
  return state.form === "idol" ? [...idolMoves, ...state.customIdolMoves] : mageSpells;
}

function updateAvatar() {
  const src = state.avatars[state.form] || BUILTIN_AVATARS[state.form];
  const image = $("#activeAvatar");
  const fallback = $("#avatarFallback");
  image.onerror = () => {
    image.hidden = true;
    fallback.hidden = false;
    fallback.textContent = state.form === "idol" ? "IDOL" : "NN";
  };
  image.src = src;
  image.hidden = false;
  fallback.hidden = true;
}

function updateBanhammerCard() {
  captureFields();
  const idol = state.form === "idol";
  const hammer = currentHammer();
  $("#banhammerFormChip").textContent = idol ? "Unfurled Idol Fist" : "Dormant Club";
  $("#banhammerSummary").textContent = idol
    ? "Go Live unfurls the fist, strengthens the Banhammer and adds Radiant damage."
    : "The fist is folded shut, leaving the Banhammer as a normal club.";
  $("#banhammerAttackDisplay").textContent = hammer.attack;
  $("#banhammerDamageDisplay").textContent = idol
    ? `${hammer.damage} Bludgeoning + ${hammer.radiant} Radiant`
    : `${hammer.damage} ${hammer.label}`;
  $("#banhammerPropertyDisplay").textContent = hammer.property;
}

function updateFormPresentation() {
  const idol = state.form === "idol";
  const level = getLevel();
  document.body.dataset.form = state.form;
  $("#goLiveToggle").checked = idol;
  $("#formBadge").textContent = idol ? "Idol Form" : "Mage Form";
  $("#activeClass").value = idol ? "Idol" : "Bard";
  $("#characterSubtitle").textContent = `Level ${level} ${$("#species").value || "Changeling"} · ${activeClassName()} Active · ${idol ? "Idol" : "Mage"} Form`;
  $("#switchStatus").textContent = idol ? "ON" : "OFF";
  $("#liveHeading").textContent = idol ? "Nixie Is Live!" : "Ready Backstage";
  $("#liveDescription").textContent = idol
    ? "Idol is active. Performance Moves, Idol features and the empowered Banhammer replace Bard magic."
    : "Bard is active. Mage spells and the dormant Banhammer are available.";
  $("#bardClassChip").textContent = `Bard · Level ${level}`;
  $("#idolClassChip").textContent = `Idol · Level ${level}`;
  $("#bardClassChip").classList.toggle("active", !idol);
  $("#idolClassChip").classList.toggle("active", idol);
  $("#quickActionHeading").textContent = idol ? "Performance Move Roller" : "Mage Spell Roller";
  $("#activeBookStatus").textContent = idol ? "Idol Setlist" : "Bard Spellbook";
  $("#spellbookHeading").textContent = idol ? "Idol · Performance Setlist" : "Bard · Mage Spellbook";
  $("#spellbookFormChip").textContent = idol ? "Idol Form" : "Mage Form";
  $("#spellbookExplainer").textContent = idol
    ? "Bard-only spells vanish while Go Live is active. Idol Performance Moves and unlocked V-Tube FX take their place."
    : "Mage-only spells are available. Idol Performance Moves are unavailable until Go Live.";
  $("#mageSpellSection").hidden = idol;
  $("#idolMoveSection").hidden = !idol;
  updateAvatar();
  updateBanhammerCard();
  renderClassFeaturePanel();
  renderSpellsAndMoves();
  populateQuickActions();
  updatePersonalityHighlights();
}

function renderInspirationPips(container) {
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
      renderClassFeaturePanel();
      saveState();
    });
    container.appendChild(button);
  }
}

function renderClassFeaturePanel() {
  const idol = state.form === "idol";
  const body = $("#classFeatureBody");
  if (!idol) {
    $("#classFeatureEyebrow").textContent = "Bard Feature";
    $("#classFeatureHeading").textContent = "Bardic Inspiration";
    body.innerHTML = `
      <p>Five d8 uses, restored on a short or long rest.</p>
      <div class="pip-row" id="inspirationPips" aria-label="Bardic Inspiration uses"></div>
      <button id="rollInspirationBtn" type="button">Roll Inspiration d8</button>
    `;
    renderInspirationPips($("#inspirationPips"));
    $("#rollInspirationBtn").addEventListener("click", () => addLog("Bardic Inspiration", `1d8 [${rollDie(8)}]`));
    return;
  }

  $("#classFeatureEyebrow").textContent = "Idol Features";
  $("#classFeatureHeading").textContent = "Encore & V-Tube FX";
  const level = getLevel();
  const unlocked = idolFeatures.filter((feature) => feature.unlock <= level && feature.id !== "encore");
  body.innerHTML = `
    <div class="encore-panel ${state.encoreUsed ? "used" : ""}">
      <div><strong>Encore</strong><small>${state.encoreUsed ? "Used · returns on Short Rest" : "Available · once per Short Rest"}</small></div>
      <button id="useEncoreBtn" class="${state.encoreUsed ? "secondary" : ""}" type="button">${state.encoreUsed ? "Restore" : "Use Encore"}</button>
    </div>
    <p class="muted small-copy">An ally rolls CHA (Performance or Persuasion) against DC 10 + move level. On success, Nixie repeats the move at half effectiveness without another slot.</p>
    <div class="feature-button-list" id="vtubeFeatureButtons"></div>
  `;
  $("#useEncoreBtn").addEventListener("click", () => {
    state.encoreUsed = !state.encoreUsed;
    addLog("Encore", state.encoreUsed ? "Encore marked as used. The repeated move is applied at half effectiveness." : "Encore restored manually.");
    renderClassFeaturePanel();
    saveState();
  });
  const list = $("#vtubeFeatureButtons");
  unlocked.forEach((feature) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary feature-use-button";
    button.textContent = feature.name.replace("V-Tube FX: ", "");
    button.addEventListener("click", () => addLog(feature.name, `${feature.action} · ${feature.check}\n${feature.effect}`));
    list.appendChild(button);
  });
}

function renderAttributes() {
  const container = $("#attributeGrid");
  container.innerHTML = "";
  abilities.forEach((ability) => {
    const scoreId = `ability-${ability.key}-score`;
    const score = Number(state.fields[scoreId] ?? ability.score);
    const card = document.createElement("article");
    card.className = "card attribute-card";
    card.innerHTML = `
      <p class="eyebrow">${ability.short}</p><h3>${ability.name}</h3>
      <input class="attribute-score" id="${scoreId}" type="number" value="${score}" aria-label="${ability.name} score" />
      <button class="modifier-button" type="button"></button>
      <button class="save-button" type="button"></button>
    `;
    const scoreInput = card.querySelector("input");
    const checkButton = card.querySelector(".modifier-button");
    const saveButton = card.querySelector(".save-button");
    const refresh = () => {
      const currentScore = Number(scoreInput.value) || 10;
      const mod = Math.floor((currentScore - 10) / 2);
      const save = mod + (ability.proficient ? getProficiencyBonus() : 0);
      checkButton.textContent = `${formatModifier(mod)} Check`;
      saveButton.textContent = `${formatModifier(save)} Save${ability.proficient ? " · Proficient" : ""}`;
      state.fields[scoreId] = scoreInput.value;
    };
    refresh();
    scoreInput.addEventListener("change", () => { refresh(); renderSkills(); saveState(); });
    checkButton.addEventListener("click", () => {
      const mod = Math.floor(((Number(scoreInput.value) || 10) - 10) / 2);
      const roll = rollD20(mod);
      addLog(`${ability.name} Check`, `d20 (${roll.detail}) ${formatModifier(mod)} = ${roll.total}`);
    });
    saveButton.addEventListener("click", () => {
      const mod = Math.floor(((Number(scoreInput.value) || 10) - 10) / 2) + (ability.proficient ? getProficiencyBonus() : 0);
      const roll = rollD20(mod);
      addLog(`${ability.name} Save`, `d20 (${roll.detail}) ${formatModifier(mod)} = ${roll.total}`);
    });
    container.appendChild(card);
  });
}

function skillModifier(skill) {
  const ability = abilities.find((entry) => entry.key === skill.abilityKey);
  const score = Number(state.fields[`ability-${skill.abilityKey}-score`] ?? ability?.score ?? 10);
  const abilityMod = Math.floor((score - 10) / 2);
  const proficiency = getProficiencyBonus();
  if (skill.rank === "E") return abilityMod + (proficiency * 2);
  if (skill.rank === "P") return abilityMod + proficiency;
  return abilityMod + Math.floor(proficiency / 2);
}

function renderSkills() {
  const container = $("#skillList");
  container.innerHTML = "";
  skills.forEach((skill) => {
    const mod = skillModifier(skill);
    const row = document.createElement("div");
    row.className = "skill-row";
    row.innerHTML = `
      <span class="skill-marker" title="P = proficient, E = expertise, ½ = Jack of All Trades">${skill.rank}</span>
      <span><strong>${skill.name}</strong><br><small class="muted">${skill.ability}</small></span>
      <button type="button">${formatModifier(mod)}</button>
    `;
    row.querySelector("button").addEventListener("click", () => {
      const currentMod = skillModifier(skill);
      const roll = rollD20(currentMod);
      addLog(`${skill.name} Check`, `d20 (${roll.detail}) ${formatModifier(currentMod)} = ${roll.total}`);
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

function abilityLabel(ability) {
  if (ability.unlock) return `Unlocks at Idol ${ability.unlock}`;
  if (ability.level === 0) return ability.category || "Cantrip";
  return `${ability.category || "Spell"} · Level ${ability.level}`;
}

function renderAbilityCard(ability, options = {}) {
  const locked = Boolean(options.locked);
  const custom = Boolean(options.custom);
  const article = document.createElement("article");
  article.className = `card spell-card ${locked ? "locked" : ""}`;
  article.innerHTML = `
    ${custom ? '<button class="delete-card-button" type="button" title="Delete custom move">×</button>' : ""}
    <p class="eyebrow">${escapeHtml(abilityLabel(ability))}</p>
    <h3>${escapeHtml(ability.name)}</h3>
    <div class="spell-meta"><span>${escapeHtml(ability.action || "Action")}</span><span>·</span><span>${escapeHtml(ability.range || "—")}</span></div>
    <div class="spell-meta"><span>${escapeHtml(ability.check || "No roll")}</span>${ability.formula ? `<span>·</span><span>${escapeHtml(ability.formula)}</span>` : ""}</div>
    ${ability.quote ? `<blockquote>“${escapeHtml(ability.quote)}”</blockquote>` : ""}
    <p class="spell-effect">${escapeHtml(ability.effect || "No effect text stored.")}</p>
    <div class="button-row">
      <button class="ability-use" type="button" ${locked ? "disabled" : ""}>${locked ? "Locked" : "Roll / Use"}</button>
      ${Number(ability.level) > 0 && !ability.unlock ? `<button class="ability-slot secondary" type="button" ${locked ? "disabled" : ""}>Use Slot</button>` : ""}
    </div>
  `;
  const useButton = article.querySelector(".ability-use");
  useButton.addEventListener("click", () => useAbility(ability, false));
  const slotButton = article.querySelector(".ability-slot");
  if (slotButton) slotButton.addEventListener("click", () => useAbility(ability, true));
  const deleteButton = article.querySelector(".delete-card-button");
  if (deleteButton) {
    deleteButton.addEventListener("click", () => {
      state.customIdolMoves = state.customIdolMoves.filter((item) => item.id !== ability.id);
      renderSpellsAndMoves();
      populateQuickActions();
      saveState();
    });
  }
  return article;
}

function renderSpellsAndMoves() {
  const mageGrid = $("#mageSpellGrid");
  const idolGrid = $("#idolMoveGrid");
  const featureGrid = $("#idolFeatureGrid");
  mageGrid.innerHTML = "";
  idolGrid.innerHTML = "";
  featureGrid.innerHTML = "";
  mageSpells.forEach((spell) => mageGrid.appendChild(renderAbilityCard(spell)));
  [...idolMoves, ...state.customIdolMoves].forEach((move) => idolGrid.appendChild(renderAbilityCard(move, { custom: state.customIdolMoves.some((item) => item.id === move.id) })));
  const level = getLevel();
  idolFeatures.forEach((feature) => featureGrid.appendChild(renderAbilityCard(feature, { locked: feature.unlock > level })));
}

function populateQuickActions() {
  const select = $("#quickSpellSelect");
  const previous = select.value;
  select.innerHTML = "";
  activeActions().forEach((ability) => {
    const option = document.createElement("option");
    option.value = ability.id;
    option.textContent = `${ability.name}${ability.level > 0 ? ` · L${ability.level}` : ""}`;
    select.appendChild(option);
  });
  if ([...select.options].some((option) => option.value === previous)) select.value = previous;
  updateQuickActionDetails();
}

function selectedQuickAction() {
  return activeActions().find((ability) => ability.id === $("#quickSpellSelect").value) || activeActions()[0];
}

function updateQuickActionDetails() {
  const ability = selectedQuickAction();
  if (!ability) {
    $("#quickSpellDetails").textContent = "No actions available.";
    return;
  }
  $("#quickSpellDetails").innerHTML = `
    <strong>${escapeHtml(ability.name)}</strong><br>
    ${escapeHtml(ability.action || "Action")} · ${escapeHtml(ability.range || "—")}<br>
    ${escapeHtml(ability.check || "No roll")}${ability.formula ? ` · ${escapeHtml(ability.formula)}` : ""}
  `;
  $("#quickSpellSlotBtn").disabled = !(Number(ability.level) > 0);
}

function chooseSlotLevel(minimum) {
  const response = window.prompt(`Use which spell-slot level? (${minimum}–3)`, String(minimum));
  if (response === null) return null;
  const level = Number(response);
  if (!Number.isInteger(level) || level < minimum || level > 3) {
    window.alert(`Choose a whole-number slot level from ${minimum} to 3.`);
    return null;
  }
  return level;
}

function scaledFormula(ability, slotLevel) {
  if (!ability.formula) return "";
  const extra = Math.max(0, slotLevel - Number(ability.level || 0));
  if (ability.scaling === "superchat") return `${1 + extra}d4+5`;
  if (ability.scaling === "missile") return `${3 + extra}d4+${3 + extra}`;
  return ability.formula;
}

function useAbility(ability, consumeSlot) {
  if (!ability) return;
  if (ability.id === "encore") {
    if (state.encoreUsed) {
      addLog("Encore", "Encore has already been used and returns after a Short Rest.");
      return;
    }
    state.encoreUsed = true;
    addLog("Encore", `${ability.action} · ${ability.check}\n${ability.effect}`);
    renderClassFeaturePanel();
    saveState();
    return;
  }
  let slotLevel = Number(ability.level || 0);
  let text = `${ability.action || "Action"} · ${ability.range || "—"}`;

  if (consumeSlot && slotLevel > 0) {
    slotLevel = chooseSlotLevel(slotLevel);
    if (slotLevel === null) return;
    const slot = state.spellSlots[slotLevel];
    if (!slot || slot.used >= slot.max) {
      addLog(ability.name, `No level ${slotLevel} spell slots remain.`);
      return;
    }
    slot.used += 1;
    text += `\nLevel ${slotLevel} spell slot consumed.`;
    renderSpellSlots();
  }

  const formula = scaledFormula(ability, slotLevel);
  if (formula) {
    const roll = parseAndRollFormula(formula);
    text += `\n${roll.detail}${roll.total !== null ? ` = ${roll.total}` : ""}`;
    if (ability.id === "crowd-surf") text += " Thunder damage";
    if (ability.id === "radiant-laser") text += " Radiant damage";
    if (ability.id === "superchat") text += " HP restored";
    if (ability.id === "magic-missile") text += " force damage across the darts";
  } else if (String(ability.check || "").toLowerCase().includes("save")) {
    text += `\nTarget makes ${ability.check}.`;
  } else {
    text += `\n${ability.check || "No dice roll required."}`;
  }

  if (ability.scaling === "targets" && consumeSlot) {
    text += `\nTargets: ${slotLevel} ally${slotLevel === 1 ? "" : "ies"}.`;
  }
  if (ability.quote) text += `\n“${ability.quote}”`;
  text += `\n${ability.effect}`;
  addLog(ability.name, text);
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

function updatePersonalityHighlights() {
  const idol = state.form === "idol";
  const cards = $$(".portrait-card");
  if (cards.length >= 2) {
    cards[0].classList.toggle("current-form", !idol);
    cards[1].classList.toggle("current-form", idol);
  }
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
  const payload = { app: "Nixie Parallel-Class Character Sheet", version: 2, exportedAt: new Date().toISOString(), state };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "nixie-parallel-class-sheet-save.json";
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
  if (!window.confirm("Reset the Nixie sheet to the parallel-class default data?")) return;
  localStorage.removeItem(STORAGE_KEY);
  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  location.reload();
}

function initializeEvents() {
  $$(".tab-button").forEach((button) => button.addEventListener("click", () => setActiveTab(button.dataset.tab)));

  $("#goLiveToggle").addEventListener("change", (event) => {
    state.form = event.target.checked ? "idol" : "mage";
    updateFormPresentation();
    addLog("Go Live", state.form === "idol" ? "Idol class engaged. Bard-only magic has vanished." : "Returned to Bard class and Mage form.");
    saveState();
  });

  $("#characterLevel").addEventListener("change", () => {
    const level = getLevel();
    $("#characterLevel").value = level;
    $("#proficiency").value = formatModifier(getProficiencyBonus());
    renderAttributes();
    renderSkills();
    updateFormPresentation();
    saveState();
  });

  $("#species").addEventListener("input", updateFormPresentation);

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
    $("#currentHp").value = Math.min(max, Math.max(0, Number($("#currentHp").value) || 0) + amount);
    addLog("Healing", `${amount} HP restored.`);
  });

  $("#shortRestBtn").addEventListener("click", () => {
    state.inspirationUsed = 0;
    state.encoreUsed = false;
    renderClassFeaturePanel();
    addLog("Short Rest", "Bardic Inspiration and Encore restored.");
  });

  $("#longRestBtn").addEventListener("click", () => {
    $("#currentHp").value = $("#maxHp").value;
    $("#tempHp").value = 0;
    state.inspirationUsed = 0;
    state.encoreUsed = false;
    Object.values(state.spellSlots).forEach((slot) => { slot.used = 0; });
    renderClassFeaturePanel();
    renderSpellSlots();
    addLog("Long Rest", "HP, class features and all tracked spell slots restored.");
  });

  $("#banhammerAttackBtn").addEventListener("click", () => {
    captureFields();
    const hammer = currentHammer();
    const modifier = numericModifier(hammer.attack);
    const roll = rollD20(modifier);
    addLog(`Banhammer Attack · ${activeClassName()}`, `d20 (${roll.detail}) ${formatModifier(modifier)} = ${roll.total}`);
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
    addLog(`Banhammer Damage · ${activeClassName()}`, text);
  });

  $("#quickSpellSelect").addEventListener("change", updateQuickActionDetails);
  $("#quickSpellRollBtn").addEventListener("click", () => useAbility(selectedQuickAction(), false));
  $("#quickSpellSlotBtn").addEventListener("click", () => useAbility(selectedQuickAction(), true));

  $$('[data-roll-mode]').forEach((button) => button.addEventListener("click", () => {
    state.rollMode = button.dataset.rollMode;
    $$('[data-roll-mode]').forEach((entry) => entry.classList.toggle("active", entry.dataset.rollMode === state.rollMode));
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
    state.customIdolMoves.push({
      id: uid(),
      name,
      level: Math.max(0, Number($("#newSpellLevel").value) || 0),
      category: "Custom Idol Move",
      action: $("#newSpellAction").value.trim() || "Action",
      range: $("#newSpellRange").value.trim() || "—",
      check: $("#newSpellCheck").value.trim() || "No roll",
      formula: $("#newSpellFormula").value.trim(),
      effect: $("#newSpellEffect").value.trim()
    });
    event.target.reset();
    $("#newSpellLevel").value = 1;
    $("#newSpellAction").value = "Action";
    $("#newSpellRange").value = "60 ft.";
    $("#performanceSpellDialog").close();
    renderSpellsAndMoves();
    populateQuickActions();
    saveState();
  });

  $("#addInventoryBtn").addEventListener("click", () => $("#inventoryDialog").showModal());
  $("#cancelInventoryDialogBtn").addEventListener("click", () => $("#inventoryDialog").close());
  $("#inventoryForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("#newItemName").value.trim();
    if (!name) return;
    state.inventory.push({
      id: uid(), name,
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
    addLog("Avatars", "Bundled Mage and Idol avatars restored.");
    saveState();
  });

  ["mageHammerAttack", "mageHammerDamage", "mageHammerDamageLabel", "mageHammerProperty", "idolHammerAttack", "idolHammerDamage", "idolHammerRadiant", "idolHammerProperty"]
    .forEach((id) => document.getElementById(id).addEventListener("input", () => { captureFields(); updateBanhammerCard(); saveState(); }));

  $("#exportBtn").addEventListener("click", exportState);
  $("#importInput").addEventListener("change", (event) => importState(event.target.files[0]));
  $("#resetBtn").addEventListener("click", resetSheet);

  document.addEventListener("input", (event) => {
    if (event.target.matches('input:not([type="file"]), textarea, select')) saveState();
  });
}

function initialize() {
  restoreFields();
  if (!state.fields.proficiency) $("#proficiency").value = formatModifier(getProficiencyBonus());
  renderAttributes();
  renderSkills();
  renderSpellSlots();
  renderInventory();
  renderRollLog();
  initializeEvents();
  setActiveTab(state.activeTab || "stats");
  state.form = state.form === "idol" ? "idol" : "mage";
  $$('[data-roll-mode]').forEach((button) => button.classList.toggle("active", button.dataset.rollMode === state.rollMode));
  updateFormPresentation();
}

initialize();
