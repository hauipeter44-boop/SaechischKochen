import {
  db, auth, signInWithEmailAndPassword, onAuthStateChanged,
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs,
  onSnapshot, query, orderBy, where, serverTimestamp
} from "./firebase.js";

const loginScreen = document.getElementById("loginScreen");
const appRoot = document.getElementById("appRoot");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

// --- Elemente ---
const listEl = document.getElementById("list");
const recipeView = document.getElementById("recipeView");
const titleEl = document.getElementById("pageTitle");
const backBtn = document.getElementById("backBtn");
const addBtn = document.getElementById("addBtn");
const favoriteBtn = document.getElementById("favoriteBtn");

const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalInput = document.getElementById("modalInput");
const modalSave = document.getElementById("modalSave");
const modalCancel = document.getElementById("modalCancel");

const menuOverlay = document.getElementById("menuOverlay");
const menuRename = document.getElementById("menuRename");
const menuUp = document.getElementById("menuUp");
const menuDown = document.getElementById("menuDown");
const menuDelete = document.getElementById("menuDelete");
const menuCancel = document.getElementById("menuCancel");

const addChoiceOverlay = document.getElementById("addChoiceOverlay");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const addRecipeBtn = document.getElementById("addRecipeBtn");
const addOcrBtn = document.getElementById("addOcrBtn");
const addTemplateBtn = document.getElementById("addTemplateBtn");
const addCancelBtn = document.getElementById("addCancelBtn");
const ocrFileInput = document.getElementById("ocrFileInput");
const ocrOverlay = document.getElementById("ocrOverlay");
const ocrStatus = document.getElementById("ocrStatus");

const templateOverlay = document.getElementById("templateOverlay");
const templateInput = document.getElementById("templateInput");
const templateError = document.getElementById("templateError");
const templateCancelBtn = document.getElementById("templateCancelBtn");
const templateApplyBtn = document.getElementById("templateApplyBtn");

const startCookModeBtn = document.getElementById("startCookModeBtn");
const cookModeView = document.getElementById("cookModeView");
const cookExitBtn = document.getElementById("cookExitBtn");
const cookProgress = document.getElementById("cookProgress");
const cookStepNumber = document.getElementById("cookStepNumber");
const cookStepText = document.getElementById("cookStepText");
const cookTimerArea = document.getElementById("cookTimerArea");
const cookPrevBtn = document.getElementById("cookPrevBtn");
const cookNextBtn = document.getElementById("cookNextBtn");

const compareOpenBtn = document.getElementById("compareOpenBtn");
const compareView = document.getElementById("compareView");
const compareCloseBtn = document.getElementById("compareCloseBtn");
const compareTable = document.getElementById("compareTable");

const recipeTitleInput = document.getElementById("recipeTitleInput");
const recipeRawText = document.getElementById("recipeRawText");
const recipeSaveBtn = document.getElementById("recipeSaveBtn");
const recipeDeleteBtn = document.getElementById("recipeDeleteBtn");

const parentBanner = document.getElementById("parentBanner");
const parentBannerBtn = document.getElementById("parentBannerBtn");
const changeNotesInput = document.getElementById("changeNotesInput");
const createAblegerBtn = document.getElementById("createAblegerBtn");
const ablegerListEl = document.getElementById("ablegerListEl");

const ingredientsListEl = document.getElementById("ingredientsList");
const addIngredientBtn = document.getElementById("addIngredientBtn");
const stepsListEl = document.getElementById("stepsList");
const addStepBtn = document.getElementById("addStepBtn");

const photosListEl = document.getElementById("photosList");
const photoFileInput = document.getElementById("photoFileInput");
const addPhotoBtn = document.getElementById("addPhotoBtn");

const tagsListEl = document.getElementById("tagsList");
const tagInput = document.getElementById("tagInput");

const entriesListEl = document.getElementById("entriesList");
const addEntryBtn = document.getElementById("addEntryBtn");
const entryOverlay = document.getElementById("entryOverlay");
const entryType = document.getElementById("entryType");
const entryText = document.getElementById("entryText");
const entrySave = document.getElementById("entrySave");
const entryCancel = document.getElementById("entryCancel");

const goldenBlock = document.getElementById("goldenBlock");
const goldenEntriesListEl = document.getElementById("goldenEntriesList");
const toggleGoldenBtn = document.getElementById("toggleGoldenBtn");

const addRunBtn = document.getElementById("addRunBtn");
const runsListEl = document.getElementById("runsListEl");
const runOverlay = document.getElementById("runOverlay");
const runOverlayTitle = document.getElementById("runOverlayTitle");
const runDateInput = document.getElementById("runDateInput");
const runDeviations = document.getElementById("runDeviations");
const runMeasurementsListEl = document.getElementById("runMeasurementsList");
const addRunMeasurementBtn = document.getElementById("addRunMeasurementBtn");
const runNotes = document.getElementById("runNotes");
const runCancelBtn = document.getElementById("runCancelBtn");
const runSaveBtn = document.getElementById("runSaveBtn");
const runDeleteBtn = document.getElementById("runDeleteBtn");

const batchesListEl = document.getElementById("batchesList");
const addBatchBtn = document.getElementById("addBatchBtn");
const batchView = document.getElementById("batchView");
const batchTitle = document.getElementById("batchTitle");
const batchMeta = document.getElementById("batchMeta");
const batchFinishBtn = document.getElementById("batchFinishBtn");
const batchDeleteBtn = document.getElementById("batchDeleteBtn");
const batchEntriesListEl = document.getElementById("batchEntriesList");
const addBatchEntryBtn = document.getElementById("addBatchEntryBtn");
const batchEntryOverlay = document.getElementById("batchEntryOverlay");
const batchMeasurementsListEl = document.getElementById("batchMeasurementsList");
const addBatchMeasurementBtn = document.getElementById("addBatchMeasurementBtn");
const batchEntryNote = document.getElementById("batchEntryNote");
const batchEntrySave = document.getElementById("batchEntrySave");
const batchEntryCancel = document.getElementById("batchEntryCancel");

const tabLibrary = document.getElementById("tabLibrary");
const tabKnowledge = document.getElementById("tabKnowledge");
const knowledgeView = document.getElementById("knowledgeView");
const knowledgeListEl = document.getElementById("knowledgeList");
const knowledgeTypeFilter = document.getElementById("knowledgeTypeFilter");
const knowledgeSearchInput = document.getElementById("knowledgeSearchInput");
const exportBtn = document.getElementById("exportBtn");
const seedStructureBtn = document.getElementById("seedStructureBtn");

const tabSearch = document.getElementById("tabSearch");
const searchView = document.getElementById("searchView");
const searchResultsEl = document.getElementById("searchResults");
const globalSearchInput = document.getElementById("globalSearchInput");

const scaleOpenBtn = document.getElementById("scaleOpenBtn");
const scaleOverlay = document.getElementById("scaleOverlay");
const scaleFactorInput = document.getElementById("scaleFactorInput");
const scaleReferenceSelect = document.getElementById("scaleReferenceSelect");
const scaleReferenceAmount = document.getElementById("scaleReferenceAmount");
const scaleReferenceApply = document.getElementById("scaleReferenceApply");
const scaleIngredientsListEl = document.getElementById("scaleIngredientsList");
const scaleClose = document.getElementById("scaleClose");

// --- Zustand ---
let allCategories = [];
let allRecipes = [];
let path = [{ id: null, name: "Kategorien" }];
let activeMenuCategory = null;
let modalOnSave = null;
let viewState = "list"; // "list" oder "recipe"
let currentRecipeId = null;
let workingIngredients = []; // { amount, unit, name } – nur während des Bearbeitens
let workingSteps = [];       // Liste von Text-Strings – nur während des Bearbeitens
let workingTags = [];        // Liste von Tag-Strings – nur während des Bearbeitens
let allEntries = [];         // alle Hinweise/Erfahrungen, live von Firestore
let activeTab = "library";   // "library" oder "knowledge"
let currentPhotos = [];      // Fotos des gerade geöffneten Rezepts
let unsubscribePhotos = null;
let currentBatches = [];         // Fermentationsbatches des gerade geöffneten Rezepts
let unsubscribeBatches = null;
let currentBatchId = null;
let currentBatchEntries = [];    // Tagebucheinträge des gerade geöffneten Batches
let unsubscribeBatchEntries = null;
let workingBatchMeasurements = []; // { label, value } – nur während des Bearbeitens eines Tagebucheintrags
let tesseractWorker = null;
let goldenVisible = true;

let currentRuns = [];            // Versuche des gerade geöffneten Rezepts
let unsubscribeRuns = null;
let editingRunId = null;
let workingRunMeasurements = []; // { label, value } – nur während des Bearbeitens eines Versuchs

let cookSteps = [];
let cookStepIndex = 0;
let cookWakeLock = null;
let cookTimerInterval = null;
let cookTimerEndTime = null;

function formatDate(ts) {
  if (!ts || !ts.toDate) return "";
  return ts.toDate().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function currentParentId() {
  return path[path.length - 1].id;
}

function createEmptyState(className, icon, text) {
  const p = document.createElement("p");
  p.className = className;
  const iconSpan = document.createElement("span");
  iconSpan.className = "empty-icon";
  iconSpan.textContent = icon;
  p.appendChild(iconSpan);
  p.appendChild(document.createTextNode(text));
  return p;
}

const CATEGORY_ICON_RULES = [
  [/eingang|unsortiert/, "📥"],
  [/brot|sauerteig/, "🍞"],
  [/kuchen|tarte/, "🍰"],
  [/patisserie|croissant|feingeb/, "🥐"],
  [/keks|kleingeb/, "🍪"],
  [/teig|grundmass/, "🫓"],
  [/pasta|reis|getreide/, "🍝"],
  [/suppe|eintopf|fond|brühe/, "🍲"],
  [/vorspeise|snack/, "🥟"],
  [/gemüse|beilage/, "🥦"],
  [/fleisch/, "🥩"],
  [/fisch|meer/, "🐟"],
  [/sauce|senf|würz|aufstrich|gewürz|sirup|konzentrat/, "🫙"],
  [/öl|fett/, "🫒"],
  [/kombucha/, "🍵"],
  [/kefir/, "🥛"],
  [/fermentation|koji|miso|shoyu|ferment/, "🫧"],
  [/marmelade|gelee/, "🍓"],
  [/pickle|einlege|einkoch|konservier|trocknen/, "🥒"],
  [/eis|sorbet/, "🍨"],
  [/dessert|süß|creme|pudding|praline|konfekt/, "🍮"]
];

function getCategoryIcon(name) {
  const n = (name || "").toLowerCase();
  for (const [pattern, icon] of CATEGORY_ICON_RULES) {
    if (pattern.test(n)) return icon;
  }
  return "📁";
}

function childrenOf(parentId) {
  return allCategories
    .filter(c => c.parentId === parentId)
    .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0));
}

function recipesOf(parentId) {
  return allRecipes
    .filter(r => {
      const ids = r.categoryIds || [];
      return parentId === null ? ids.length === 0 : ids.includes(parentId);
    })
    .sort((a, b) => (a.title || "").localeCompare(b.title || "", "de"));
}

function entriesOf(recipeId) {
  return allEntries.filter(e => e.recipeId === recipeId);
}

// --- Listen-Ansicht (Kategorien + Rezepte der aktuellen Ebene) ---
function render() {
  if (unsubscribePhotos) { unsubscribePhotos(); unsubscribePhotos = null; }
  if (unsubscribeBatches) { unsubscribeBatches(); unsubscribeBatches = null; }
  if (unsubscribeBatchEntries) { unsubscribeBatchEntries(); unsubscribeBatchEntries = null; }
  if (unsubscribeRuns) { unsubscribeRuns(); unsubscribeRuns = null; }
  clearInterval(cookTimerInterval);
  if (cookWakeLock) { cookWakeLock.release().catch(() => {}); cookWakeLock = null; }
  cookModeView.hidden = true;
  compareView.hidden = true;
  viewState = "list";
  currentRecipeId = null;
  recipeView.hidden = true;
  listEl.hidden = false;
  favoriteBtn.hidden = true;
  addBtn.hidden = false;

  titleEl.textContent = path[path.length - 1].name;
  backBtn.hidden = path.length === 1;

  const cats = childrenOf(currentParentId());
  const recipes = recipesOf(currentParentId());
  listEl.innerHTML = "";

  if (cats.length === 0 && recipes.length === 0) {
    listEl.appendChild(createEmptyState("empty", "🍽️", "Noch nichts hier. Mit + oben rechts eine Kategorie oder ein Rezept anlegen."));
    return;
  }

  cats.forEach(cat => {
    const row = document.createElement("div");
    row.className = "row";

    const nameBtn = document.createElement("button");
    nameBtn.className = "row-name";

    const iconSpan = document.createElement("span");
    iconSpan.className = "row-icon";
    iconSpan.textContent = getCategoryIcon(cat.name);

    const nameSpan = document.createElement("span");
    nameSpan.textContent = cat.name;

    const nameWrap = document.createElement("span");
    nameWrap.style.display = "flex";
    nameWrap.style.alignItems = "center";
    nameWrap.appendChild(iconSpan);
    nameWrap.appendChild(nameSpan);

    const chevron = document.createElement("span");
    chevron.className = "chevron";
    chevron.textContent = "›";
    nameBtn.appendChild(nameWrap);
    nameBtn.appendChild(chevron);

    nameBtn.addEventListener("click", () => {
      path.push({ id: cat.id, name: cat.name });
      render();
    });

    const menuBtn = document.createElement("button");
    menuBtn.className = "row-menu";
    menuBtn.setAttribute("aria-label", "Optionen für " + cat.name);
    menuBtn.textContent = "⋯";
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openMenu(cat);
    });

    row.appendChild(nameBtn);
    row.appendChild(menuBtn);
    listEl.appendChild(row);
  });

  recipes.forEach(recipe => {
    const row = document.createElement("div");
    row.className = "row";

    const nameBtn = document.createElement("button");
    nameBtn.className = "row-name";

    const content = document.createElement("span");
    content.style.display = "flex";
    content.style.flexDirection = "column";
    content.style.alignItems = "flex-start";
    content.style.gap = "2px";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = (recipe.favorite ? "★ " : "") + (recipe.title || "Ohne Titel");
    content.appendChild(nameSpan);

    if (recipe.tags && recipe.tags.length > 0) {
      const tagsRow = document.createElement("span");
      tagsRow.className = "row-tags";
      recipe.tags.forEach(tag => {
        const tagBtn = document.createElement("button");
        tagBtn.className = "row-tag-btn";
        tagBtn.textContent = "#" + tag;
        tagBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          jumpToTagSearch(tag);
        });
        tagsRow.appendChild(tagBtn);
      });
      content.appendChild(tagsRow);
    }

    nameBtn.appendChild(content);
    nameBtn.addEventListener("click", () => openRecipe(recipe.id));

    row.appendChild(nameBtn);
    listEl.appendChild(row);
  });
}

// --- Zutaten-Bearbeitung ---
function renderIngredients() {
  ingredientsListEl.innerHTML = "";
  workingIngredients.forEach((ing, index) => {
    const row = document.createElement("div");
    row.className = "ingredient-row";

    const amountInput = document.createElement("input");
    amountInput.type = "text";
    amountInput.className = "ing-amount";
    amountInput.placeholder = "Menge";
    amountInput.value = ing.amount || "";
    amountInput.addEventListener("input", (e) => {
      workingIngredients[index].amount = e.target.value;
    });

    const unitInput = document.createElement("input");
    unitInput.type = "text";
    unitInput.className = "ing-unit";
    unitInput.placeholder = "Einheit";
    unitInput.value = ing.unit || "";
    unitInput.addEventListener("input", (e) => {
      workingIngredients[index].unit = e.target.value;
    });

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "ing-name";
    nameInput.placeholder = "Zutat";
    nameInput.value = ing.name || "";
    nameInput.addEventListener("input", (e) => {
      workingIngredients[index].name = e.target.value;
    });

    const removeBtn = document.createElement("button");
    removeBtn.className = "ing-remove";
    removeBtn.setAttribute("aria-label", "Zutat entfernen");
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      workingIngredients.splice(index, 1);
      renderIngredients();
    });

    row.appendChild(amountInput);
    row.appendChild(unitInput);
    row.appendChild(nameInput);
    row.appendChild(removeBtn);
    ingredientsListEl.appendChild(row);
  });
}

addIngredientBtn.addEventListener("click", () => {
  workingIngredients.push({ amount: "", unit: "", name: "" });
  renderIngredients();
  const lastRow = ingredientsListEl.lastElementChild;
  if (lastRow) lastRow.querySelector(".ing-name").focus();
});

// --- Tags ---
function renderTags() {
  tagsListEl.innerHTML = "";
  workingTags.forEach((tag, index) => {
    const chip = document.createElement("span");
    chip.className = "tag-chip";

    const label = document.createElement("span");
    label.textContent = tag;

    const removeBtn = document.createElement("button");
    removeBtn.className = "tag-remove";
    removeBtn.textContent = "×";
    removeBtn.setAttribute("aria-label", "Tag entfernen");
    removeBtn.addEventListener("click", () => {
      workingTags.splice(index, 1);
      renderTags();
    });

    chip.appendChild(label);
    chip.appendChild(removeBtn);
    tagsListEl.appendChild(chip);
  });
}

tagInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();
    const value = tagInput.value.trim().replace(/,$/, "");
    if (value && !workingTags.includes(value)) {
      workingTags.push(value);
      renderTags();
    }
    tagInput.value = "";
  }
});

// --- Schritte-Bearbeitung ---
function renderSteps() {
  stepsListEl.innerHTML = "";
  workingSteps.forEach((text, index) => {
    const row = document.createElement("div");
    row.className = "step-row";

    const numberSpan = document.createElement("span");
    numberSpan.className = "step-number";
    numberSpan.textContent = (index + 1) + ".";

    const textInput = document.createElement("textarea");
    textInput.className = "step-text";
    textInput.rows = 2;
    textInput.value = text || "";
    textInput.addEventListener("input", (e) => {
      workingSteps[index] = e.target.value;
    });

    const removeBtn = document.createElement("button");
    removeBtn.className = "ing-remove";
    removeBtn.setAttribute("aria-label", "Schritt entfernen");
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      workingSteps.splice(index, 1);
      renderSteps();
    });

    row.appendChild(numberSpan);
    row.appendChild(textInput);
    row.appendChild(removeBtn);
    stepsListEl.appendChild(row);
  });
}

addStepBtn.addEventListener("click", () => {
  workingSteps.push("");
  renderSteps();
  const lastRow = stepsListEl.lastElementChild;
  if (lastRow) lastRow.querySelector(".step-text").focus();
});

// --- Hinweise & Erfahrungen ---
function buildEntryRow(entry, isGolden) {
  const row = document.createElement("div");
  row.className = "entry-row";

  const header = document.createElement("div");
  header.className = "entry-header";

  const badge = document.createElement("span");
  badge.className = "entry-badge" + (isGolden ? " golden" : "");
  badge.textContent = entry.type || "Hinweis";

  const date = document.createElement("span");
  date.className = "entry-date";
  date.textContent = formatDate(entry.createdAt);

  header.appendChild(badge);
  header.appendChild(date);

  const text = document.createElement("p");
  text.className = "entry-text";
  text.textContent = entry.text;

  const removeBtn = document.createElement("button");
  removeBtn.className = "entry-remove";
  removeBtn.textContent = "Löschen";
  removeBtn.addEventListener("click", async () => {
    if (confirm("Diesen Eintrag wirklich löschen?")) {
      await deleteDoc(doc(db, "knowledgeEntries", entry.id));
    }
  });

  row.appendChild(header);
  row.appendChild(text);
  row.appendChild(removeBtn);
  return row;
}

function renderEntries() {
  const entries = entriesOf(currentRecipeId);
  const goldenEntries = entries.filter(e => e.type === "Goldener Hinweis");
  const normalEntries = entries.filter(e => e.type !== "Goldener Hinweis");

  goldenBlock.hidden = goldenEntries.length === 0;
  goldenEntriesListEl.innerHTML = "";
  goldenEntriesListEl.hidden = !goldenVisible;
  toggleGoldenBtn.textContent = goldenVisible ? "Ausblenden" : "Anzeigen";
  goldenEntries.forEach(entry => {
    goldenEntriesListEl.appendChild(buildEntryRow(entry, true));
  });

  entriesListEl.innerHTML = "";
  if (normalEntries.length === 0) {
    entriesListEl.appendChild(createEmptyState("entries-empty", "📝", "Noch keine Hinweise oder Erfahrungen."));
    return;
  }

  normalEntries.forEach(entry => {
    entriesListEl.appendChild(buildEntryRow(entry, false));
  });
}

toggleGoldenBtn.addEventListener("click", () => {
  goldenVisible = !goldenVisible;
  goldenEntriesListEl.hidden = !goldenVisible;
  toggleGoldenBtn.textContent = goldenVisible ? "Ausblenden" : "Anzeigen";
});

addEntryBtn.addEventListener("click", () => {
  entryType.value = "Hinweis";
  entryText.value = "";
  entryOverlay.hidden = false;
  entryText.focus();
});

entryCancel.addEventListener("click", () => {
  entryOverlay.hidden = true;
});

entrySave.addEventListener("click", async () => {
  const text = entryText.value.trim();
  if (!text) {
    entryText.focus();
    return;
  }
  const recipe = allRecipes.find(r => r.id === currentRecipeId);
  entryOverlay.hidden = true;
  await addDoc(collection(db, "knowledgeEntries"), {
    recipeId: currentRecipeId,
    recipeTitle: recipe ? recipe.title : "",
    type: entryType.value,
    text,
    createdAt: serverTimestamp()
  });
});

// --- Tab-Leiste ---
function hideAllViews() {
  if (unsubscribePhotos) { unsubscribePhotos(); unsubscribePhotos = null; }
  if (unsubscribeBatches) { unsubscribeBatches(); unsubscribeBatches = null; }
  if (unsubscribeBatchEntries) { unsubscribeBatchEntries(); unsubscribeBatchEntries = null; }
  if (unsubscribeRuns) { unsubscribeRuns(); unsubscribeRuns = null; }
  clearInterval(cookTimerInterval);
  if (cookWakeLock) { cookWakeLock.release().catch(() => {}); cookWakeLock = null; }
  cookModeView.hidden = true;
  compareView.hidden = true;
  listEl.hidden = true;
  recipeView.hidden = true;
  knowledgeView.hidden = true;
  searchView.hidden = true;
  batchView.hidden = true;
}

function setActiveTabButton(tab) {
  tabLibrary.classList.toggle("active", tab === "library");
  tabKnowledge.classList.toggle("active", tab === "knowledge");
  tabSearch.classList.toggle("active", tab === "search");
}

tabLibrary.addEventListener("click", () => {
  activeTab = "library";
  setActiveTabButton("library");
  hideAllViews();
  render();
});

tabKnowledge.addEventListener("click", () => {
  activeTab = "knowledge";
  setActiveTabButton("knowledge");
  hideAllViews();
  knowledgeView.hidden = false;
  backBtn.hidden = true;
  addBtn.hidden = true;
  favoriteBtn.hidden = true;
  titleEl.textContent = "Wissen";
  renderKnowledgeView();
});

tabSearch.addEventListener("click", () => {
  activeTab = "search";
  setActiveTabButton("search");
  hideAllViews();
  searchView.hidden = false;
  backBtn.hidden = true;
  addBtn.hidden = true;
  favoriteBtn.hidden = true;
  titleEl.textContent = "Suche";
  renderSearchResults();
  globalSearchInput.focus();
});

function jumpToTagSearch(tag) {
  activeTab = "search";
  setActiveTabButton("search");
  hideAllViews();
  searchView.hidden = false;
  backBtn.hidden = true;
  addBtn.hidden = true;
  favoriteBtn.hidden = true;
  titleEl.textContent = "Suche";
  globalSearchInput.value = tag;
  renderSearchResults();
}

function renderKnowledgeView() {
  const typeFilter = knowledgeTypeFilter.value;
  const searchText = knowledgeSearchInput.value.trim().toLowerCase();

  const filtered = allEntries.filter(e => {
    if (typeFilter && e.type !== typeFilter) return false;
    if (searchText && !(e.text || "").toLowerCase().includes(searchText)) return false;
    return true;
  });

  knowledgeListEl.innerHTML = "";

  if (filtered.length === 0) {
    knowledgeListEl.appendChild(createEmptyState("entries-empty", "🔍", "Keine Einträge gefunden."));
    return;
  }

  filtered.forEach(entry => {
    const row = document.createElement("button");
    row.className = "knowledge-row";

    const header = document.createElement("div");
    header.className = "entry-header";

    const badge = document.createElement("span");
    badge.className = "entry-badge";
    badge.textContent = entry.type || "Hinweis";

    const date = document.createElement("span");
    date.className = "entry-date";
    date.textContent = formatDate(entry.createdAt);

    header.appendChild(badge);
    header.appendChild(date);

    const recipeTitleEl = document.createElement("p");
    recipeTitleEl.className = "knowledge-recipe-title";
    recipeTitleEl.textContent = entry.recipeTitle || "Ohne Rezept";

    const text = document.createElement("p");
    text.className = "entry-text";
    text.textContent = entry.text;

    row.appendChild(header);
    row.appendChild(recipeTitleEl);
    row.appendChild(text);

    row.addEventListener("click", () => goToRecipeFromKnowledge(entry.recipeId));

    knowledgeListEl.appendChild(row);
  });
}

function goToRecipeFromKnowledge(recipeId) {
  activeTab = "library";
  setActiveTabButton("library");
  hideAllViews();
  path = [{ id: null, name: "Kategorien" }];
  openRecipe(recipeId);
}

knowledgeTypeFilter.addEventListener("change", renderKnowledgeView);
knowledgeSearchInput.addEventListener("input", renderKnowledgeView);

// --- Globale Suche ---
function renderSearchResults() {
  const q = globalSearchInput.value.trim().toLowerCase();
  searchResultsEl.innerHTML = "";

  if (!q) {
    searchResultsEl.appendChild(createEmptyState("entries-empty", "🔎", "Tippe, um in Rezepten, Zutaten und Hinweisen zu suchen."));
    return;
  }

  const matchingCategories = allCategories.filter(c => (c.name || "").toLowerCase().includes(q));

  const matchingRecipes = allRecipes.filter(r => {
    if ((r.title || "").toLowerCase().includes(q)) return true;
    if ((r.rawText || "").toLowerCase().includes(q)) return true;
    if ((r.ingredients || []).some(i => (i.name || "").toLowerCase().includes(q))) return true;
    if ((r.steps || []).some(s => (s || "").toLowerCase().includes(q))) return true;
    if ((r.tags || []).some(t => (t || "").toLowerCase().includes(q))) return true;
    return false;
  });

  const matchingEntries = allEntries.filter(e => (e.text || "").toLowerCase().includes(q));

  if (matchingCategories.length === 0 && matchingRecipes.length === 0 && matchingEntries.length === 0) {
    searchResultsEl.appendChild(createEmptyState("entries-empty", "🔍", "Nichts gefunden."));
    return;
  }

  if (matchingCategories.length > 0) {
    appendSearchSection("Kategorien", matchingCategories.map(cat => ({
      title: cat.name,
      subtitle: "",
      onClick: () => goToCategoryFromSearch(cat.id)
    })));
  }

  if (matchingRecipes.length > 0) {
    appendSearchSection("Rezepte", matchingRecipes.map(r => ({
      title: (r.favorite ? "★ " : "") + (r.title || "Ohne Titel"),
      subtitle: "",
      onClick: () => goToRecipeFromKnowledge(r.id)
    })));
  }

  if (matchingEntries.length > 0) {
    appendSearchSection("Hinweise & Erfahrungen", matchingEntries.map(e => ({
      title: e.text,
      subtitle: (e.type || "") + " · " + (e.recipeTitle || ""),
      onClick: () => goToRecipeFromKnowledge(e.recipeId)
    })));
  }
}

function appendSearchSection(heading, items) {
  const headingEl = document.createElement("h2");
  headingEl.className = "search-heading";
  headingEl.textContent = heading;
  searchResultsEl.appendChild(headingEl);

  items.forEach(item => {
    const row = document.createElement("button");
    row.className = "knowledge-row";

    const titleP = document.createElement("p");
    titleP.className = "search-item-title";
    titleP.textContent = item.title;
    row.appendChild(titleP);

    if (item.subtitle) {
      const subtitleP = document.createElement("p");
      subtitleP.className = "entry-date";
      subtitleP.textContent = item.subtitle;
      row.appendChild(subtitleP);
    }

    row.addEventListener("click", item.onClick);
    searchResultsEl.appendChild(row);
  });
}

function goToCategoryFromSearch(categoryId) {
  activeTab = "library";
  setActiveTabButton("library");
  hideAllViews();

  const newPath = [{ id: null, name: "Kategorien" }];
  const chain = [];
  let current = allCategories.find(c => c.id === categoryId);
  while (current) {
    chain.unshift(current);
    current = current.parentId ? allCategories.find(c => c.id === current.parentId) : null;
  }
  chain.forEach(c => newPath.push({ id: c.id, name: c.name }));
  path = newPath;
  render();
}

globalSearchInput.addEventListener("input", renderSearchResults);

// --- Datensicherung ---
function serializeForExport(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === "object" && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  if (Array.isArray(value)) {
    return value.map(serializeForExport);
  }
  if (typeof value === "object") {
    const result = {};
    for (const key of Object.keys(value)) {
      result[key] = serializeForExport(value[key]);
    }
    return result;
  }
  return value;
}

exportBtn.addEventListener("click", async () => {
  const originalLabel = exportBtn.textContent;
  exportBtn.disabled = true;
  exportBtn.textContent = "Sichere Daten…";
  try {
    const photosSnapshot = await getDocs(collection(db, "photos"));
    const photosForExport = photosSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const batchesSnapshot = await getDocs(collection(db, "fermentationBatches"));
    const batchesForExport = batchesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const batchEntriesSnapshot = await getDocs(collection(db, "fermentationEntries"));
    const batchEntriesForExport = batchEntriesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const runsSnapshot = await getDocs(collection(db, "recipeRuns"));
    const runsForExport = runsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const data = serializeForExport({
      exportedAt: new Date().toISOString(),
      categories: allCategories,
      recipes: allRecipes,
      knowledgeEntries: allEntries,
      photos: photosForExport,
      fermentationBatches: batchesForExport,
      fermentationEntries: batchEntriesForExport,
      recipeRuns: runsForExport
    });

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kochbuch-sicherung-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    alert("Sicherung fehlgeschlagen: " + err.message);
  } finally {
    exportBtn.disabled = false;
    exportBtn.textContent = originalLabel;
  }
});

// --- Standard-Kategoriestruktur ---
const DEFAULT_CATEGORY_STRUCTURE = [
  { name: "00 Eingang / Unsortiert" },
  { name: "01 Backen", children: [
    "Brot & Brötchen", "Pizza & Fladen", "Kuchen & Tartes",
    "Patisserie & Feingebäck", "Kekse & Kleingebäck", "Teige & Grundmassen"
  ] },
  { name: "02 Kochen", children: [
    "Vorspeisen & Snacks", "Suppen & Eintöpfe", "Pasta, Reis & Getreide",
    "Gemüse & Beilagen", "Fleisch", "Fisch & Meeresfrüchte", "Sonstiges"
  ] },
  { name: "03 Grundprodukte", children: [
    "Saucen", "Fonds & Brühen", "Senf", "Essig", "Öle & Fette",
    "Würzpasten", "Aufstriche", "Gewürzmischungen", "Sirupe & Konzentrate"
  ] },
  { name: "04 Fermentation", children: [
    "Sauerteig", "Kombucha", "Wasserkefir", "Gemüsefermente",
    "Essigfermentation", "Koji / Miso / Shoyu", "Sonstige Fermente"
  ] },
  { name: "05 Konservieren", children: [
    "Einkochen", "Marmelade & Gelee", "Pickles", "Einlegen", "Trocknen", "Sonstiges"
  ] },
  { name: "06 Desserts & Süßes", children: [
    "Cremes & Pudding", "Eis & Sorbet", "Süßspeisen", "Pralinen & Konfekt", "Sonstiges"
  ] }
];

function findCategoryIdByNameAndParent(name, parentId) {
  const match = allCategories.find(
    c => c.parentId === parentId && (c.name || "").trim().toLowerCase() === name.trim().toLowerCase()
  );
  return match ? match.id : null;
}

async function createCategoryLocal(name, parentId) {
  const siblings = allCategories.filter(c => c.parentId === parentId);
  const maxSort = siblings.reduce((m, c) => Math.max(m, c.sortIndex ?? 0), -1);
  const ref = await addDoc(collection(db, "categories"), {
    name,
    parentId,
    sortIndex: maxSort + 1,
    createdAt: serverTimestamp()
  });
  allCategories.push({ id: ref.id, name, parentId, sortIndex: maxSort + 1 });
  return ref.id;
}

seedStructureBtn.addEventListener("click", async () => {
  const originalLabel = seedStructureBtn.textContent;
  seedStructureBtn.disabled = true;
  seedStructureBtn.textContent = "Lege Struktur an…";
  try {
    let created = 0;
    for (const topLevel of DEFAULT_CATEGORY_STRUCTURE) {
      let topLevelId = findCategoryIdByNameAndParent(topLevel.name, null);
      if (!topLevelId) {
        topLevelId = await createCategoryLocal(topLevel.name, null);
        created++;
      }
      if (topLevel.children) {
        for (const childName of topLevel.children) {
          if (!findCategoryIdByNameAndParent(childName, topLevelId)) {
            await createCategoryLocal(childName, topLevelId);
            created++;
          }
        }
      }
    }
    alert(created > 0
      ? created + " neue Kategorie(n) angelegt."
      : "Alle Kategorien waren bereits vorhanden, nichts Neues angelegt.");
  } catch (err) {
    alert("Fehler beim Anlegen der Struktur: " + err.message);
  } finally {
    seedStructureBtn.disabled = false;
    seedStructureBtn.textContent = originalLabel;
  }
});

// --- Mengenrechner ---
function parseAmount(str) {
  if (!str) return null;
  const normalized = String(str).trim().replace(",", ".");
  const fractionMatch = normalized.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fractionMatch) {
    return parseInt(fractionMatch[1], 10) / parseInt(fractionMatch[2], 10);
  }
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

function formatAmount(num) {
  if (Number.isInteger(num)) return String(num);
  return String(Math.round(num * 100) / 100);
}

function openScaleCalculator() {
  scaleFactorInput.value = "1";
  scaleReferenceAmount.value = "";
  populateScaleReferenceSelect();
  renderScaleIngredients(1);
  scaleOverlay.hidden = false;
}

function populateScaleReferenceSelect() {
  scaleReferenceSelect.innerHTML = "";
  workingIngredients
    .filter(i => (i.name || "").trim() !== "" && parseAmount(i.amount) !== null)
    .forEach(ing => {
      const opt = document.createElement("option");
      opt.value = ing.name;
      opt.textContent = ing.name + " (" + ing.amount + (ing.unit ? " " + ing.unit : "") + ")";
      scaleReferenceSelect.appendChild(opt);
    });
}

function renderScaleIngredients(factor) {
  scaleIngredientsListEl.innerHTML = "";
  const ingredients = workingIngredients.filter(i => (i.name || "").trim() !== "");

  if (ingredients.length === 0) {
    scaleIngredientsListEl.appendChild(createEmptyState("entries-empty", "⚖️", "Erst Zutaten mit Mengenangabe hinzufügen."));
    return;
  }

  ingredients.forEach(ing => {
    const row = document.createElement("div");
    row.className = "scale-row";

    const label = document.createElement("span");
    label.textContent = ing.name;

    const value = document.createElement("span");
    value.className = "scale-row-value";
    const num = parseAmount(ing.amount);
    if (num === null) {
      value.textContent = ing.amount ? ing.amount + (ing.unit ? " " + ing.unit : "") : "—";
    } else {
      value.textContent = formatAmount(num * factor) + (ing.unit ? " " + ing.unit : "");
    }

    row.appendChild(label);
    row.appendChild(value);
    scaleIngredientsListEl.appendChild(row);
  });
}

scaleOpenBtn.addEventListener("click", openScaleCalculator);

scaleFactorInput.addEventListener("input", () => {
  const factor = parseAmount(scaleFactorInput.value);
  if (factor !== null && factor > 0) {
    renderScaleIngredients(factor);
  }
});

scaleReferenceApply.addEventListener("click", () => {
  const refName = scaleReferenceSelect.value;
  const refIngredient = workingIngredients.find(i => i.name === refName);
  if (!refIngredient) return;
  const originalNum = parseAmount(refIngredient.amount);
  const targetNum = parseAmount(scaleReferenceAmount.value);
  if (originalNum === null || targetNum === null || originalNum <= 0) return;
  const factor = targetNum / originalNum;
  scaleFactorInput.value = formatAmount(factor);
  renderScaleIngredients(factor);
});

scaleClose.addEventListener("click", () => {
  scaleOverlay.hidden = true;
});

// --- Fotos ---
function renderPhotos() {
  photosListEl.innerHTML = "";

  if (currentPhotos.length === 0) {
    photosListEl.appendChild(createEmptyState("photos-empty", "📷", "Noch keine Fotos."));
    return;
  }

  currentPhotos.forEach(photo => {
    const thumb = document.createElement("div");
    thumb.className = "photo-thumb";

    const img = document.createElement("img");
    img.src = photo.dataUrl;
    img.alt = "";

    const removeBtn = document.createElement("button");
    removeBtn.className = "photo-remove";
    removeBtn.setAttribute("aria-label", "Foto löschen");
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", async () => {
      if (confirm("Dieses Foto wirklich löschen?")) {
        await deleteDoc(doc(db, "photos", photo.id));
      }
    });

    thumb.appendChild(img);
    thumb.appendChild(removeBtn);
    photosListEl.appendChild(thumb);
  });
}

function subscribePhotosForRecipe(recipeId) {
  if (unsubscribePhotos) { unsubscribePhotos(); unsubscribePhotos = null; }
  const q = query(collection(db, "photos"), where("recipeId", "==", recipeId));
  unsubscribePhotos = onSnapshot(q, (snapshot) => {
    currentPhotos = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const at = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
        const bt = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
        return at - bt;
      });
    renderPhotos();
  });
}

function compressImage(file, maxDimension, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Bild konnte nicht geladen werden"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round(height * (maxDimension / width));
            width = maxDimension;
          } else {
            width = Math.round(width * (maxDimension / height));
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

addPhotoBtn.addEventListener("click", () => {
  photoFileInput.click();
});

photoFileInput.addEventListener("change", async () => {
  const file = photoFileInput.files[0];
  photoFileInput.value = "";
  if (!file || !currentRecipeId) return;
  try {
    const dataUrl = await compressImage(file, 1000, 0.7);
    await addDoc(collection(db, "photos"), {
      recipeId: currentRecipeId,
      dataUrl,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    alert("Foto konnte nicht verarbeitet werden: " + err.message);
  }
});

// --- Fermentation ---
function formatDateStr(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function subscribeBatchesForRecipe(recipeId) {
  if (unsubscribeBatches) { unsubscribeBatches(); unsubscribeBatches = null; }
  const q = query(collection(db, "fermentationBatches"), where("recipeId", "==", recipeId));
  unsubscribeBatches = onSnapshot(q, (snapshot) => {
    currentBatches = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.batchNumber || 0) - (b.batchNumber || 0));
    if (viewState === "recipe") renderBatches();
  });
}

function renderBatches() {
  batchesListEl.innerHTML = "";
  compareOpenBtn.hidden = currentBatches.length < 2;
  if (currentBatches.length === 0) {
    batchesListEl.appendChild(createEmptyState("entries-empty", "🫙", "Noch kein Fermentationsbatch gestartet."));
    return;
  }
  currentBatches.forEach(batch => {
    const row = document.createElement("button");
    row.className = "knowledge-row";

    const header = document.createElement("div");
    header.className = "entry-header";

    const badge = document.createElement("span");
    badge.className = "entry-badge";
    badge.textContent = "Batch #" + batch.batchNumber;

    const status = document.createElement("span");
    status.className = "entry-date";
    status.textContent = batch.status || "Aktiv";

    header.appendChild(badge);
    header.appendChild(status);

    const startInfo = document.createElement("p");
    startInfo.className = "entry-text";
    startInfo.textContent = "Gestartet: " + formatDateStr(batch.startDate);

    row.appendChild(header);
    row.appendChild(startInfo);
    row.addEventListener("click", () => openBatch(batch.id));
    batchesListEl.appendChild(row);
  });
}

addBatchBtn.addEventListener("click", async () => {
  const maxNum = currentBatches.reduce((m, b) => Math.max(m, b.batchNumber || 0), 0);
  const ref = await addDoc(collection(db, "fermentationBatches"), {
    recipeId: currentRecipeId,
    batchNumber: maxNum + 1,
    startDate: new Date().toISOString(),
    status: "Aktiv",
    createdAt: serverTimestamp()
  });
  openBatch(ref.id);
});

function openBatch(batchId) {
  const batch = currentBatches.find(b => b.id === batchId);
  if (!batch) return;
  currentBatchId = batchId;
  viewState = "batch";
  recipeView.hidden = true;
  batchView.hidden = false;
  addBtn.hidden = true;
  favoriteBtn.hidden = true;
  backBtn.hidden = false;
  titleEl.textContent = "Fermentation";
  batchTitle.textContent = "Batch #" + batch.batchNumber;
  batchMeta.textContent = "Gestartet: " + formatDateStr(batch.startDate) + " · " + (batch.status || "Aktiv");
  batchFinishBtn.textContent = batch.status === "Abgeschlossen" ? "Als aktiv markieren" : "Als abgeschlossen markieren";
  subscribeBatchEntries(batchId);
}

function subscribeBatchEntries(batchId) {
  if (unsubscribeBatchEntries) { unsubscribeBatchEntries(); unsubscribeBatchEntries = null; }
  const q = query(collection(db, "fermentationEntries"), where("batchId", "==", batchId));
  unsubscribeBatchEntries = onSnapshot(q, (snapshot) => {
    currentBatchEntries = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const at = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
        const bt = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
        return at - bt;
      });
    if (viewState === "batch") renderBatchEntries();
  });
}

function renderBatchEntries() {
  batchEntriesListEl.innerHTML = "";
  if (currentBatchEntries.length === 0) {
    batchEntriesListEl.appendChild(createEmptyState("entries-empty", "📔", "Noch keine Tagebucheinträge."));
    return;
  }
  currentBatchEntries.forEach(entry => {
    const row = document.createElement("div");
    row.className = "entry-row";

    const header = document.createElement("div");
    header.className = "entry-header";

    const badge = document.createElement("span");
    badge.className = "entry-badge";
    badge.textContent = "Eintrag";

    const date = document.createElement("span");
    date.className = "entry-date";
    date.textContent = formatDate(entry.createdAt);

    header.appendChild(badge);
    header.appendChild(date);
    row.appendChild(header);

    // Rückwärtskompatibel: ältere Einträge hatten nur ein festes "temperature"-Feld
    const measurements = entry.measurements || (
      entry.temperature !== null && entry.temperature !== undefined && entry.temperature !== ""
        ? [{ label: "Temperatur", value: entry.temperature + " °C" }]
        : []
    );
    if (measurements.length > 0) {
      const measRow = document.createElement("p");
      measRow.className = "entry-date";
      measRow.style.margin = "0 0 6px";
      measRow.textContent = measurements.map(m => m.label + ": " + m.value).join(" · ");
      row.appendChild(measRow);
    }

    const text = document.createElement("p");
    text.className = "entry-text";
    text.textContent = entry.note || "";

    const removeBtn = document.createElement("button");
    removeBtn.className = "entry-remove";
    removeBtn.textContent = "Löschen";
    removeBtn.addEventListener("click", async () => {
      if (confirm("Diesen Eintrag wirklich löschen?")) {
        await deleteDoc(doc(db, "fermentationEntries", entry.id));
      }
    });

    row.appendChild(text);
    row.appendChild(removeBtn);
    batchEntriesListEl.appendChild(row);
  });
}

function renderBatchMeasurements() {
  batchMeasurementsListEl.innerHTML = "";
  workingBatchMeasurements.forEach((m, index) => {
    const row = document.createElement("div");
    row.className = "ingredient-row";

    const labelInput = document.createElement("input");
    labelInput.type = "text";
    labelInput.className = "meas-label";
    labelInput.placeholder = "Name (z. B. pH)";
    labelInput.value = m.label || "";
    labelInput.addEventListener("input", (e) => { workingBatchMeasurements[index].label = e.target.value; });

    const valueInput = document.createElement("input");
    valueInput.type = "text";
    valueInput.className = "meas-value";
    valueInput.placeholder = "Wert";
    valueInput.value = m.value || "";
    valueInput.addEventListener("input", (e) => { workingBatchMeasurements[index].value = e.target.value; });

    const removeBtn = document.createElement("button");
    removeBtn.className = "ing-remove";
    removeBtn.textContent = "×";
    removeBtn.setAttribute("aria-label", "Messwert entfernen");
    removeBtn.addEventListener("click", () => {
      workingBatchMeasurements.splice(index, 1);
      renderBatchMeasurements();
    });

    row.appendChild(labelInput);
    row.appendChild(valueInput);
    row.appendChild(removeBtn);
    batchMeasurementsListEl.appendChild(row);
  });
}

addBatchMeasurementBtn.addEventListener("click", () => {
  workingBatchMeasurements.push({ label: "", value: "" });
  renderBatchMeasurements();
  const lastRow = batchMeasurementsListEl.lastElementChild;
  if (lastRow) lastRow.querySelector(".meas-label").focus();
});

addBatchEntryBtn.addEventListener("click", () => {
  workingBatchMeasurements = [];
  renderBatchMeasurements();
  batchEntryNote.value = "";
  batchEntryOverlay.hidden = false;
});

batchEntryCancel.addEventListener("click", () => {
  batchEntryOverlay.hidden = true;
});

batchEntrySave.addEventListener("click", async () => {
  const note = batchEntryNote.value.trim();
  const cleanedMeasurements = workingBatchMeasurements
    .filter(m => (m.label || "").trim() !== "")
    .map(m => ({ label: m.label.trim(), value: (m.value || "").trim() }));
  if (!note && cleanedMeasurements.length === 0) {
    batchEntryNote.focus();
    return;
  }
  batchEntryOverlay.hidden = true;
  await addDoc(collection(db, "fermentationEntries"), {
    batchId: currentBatchId,
    note,
    measurements: cleanedMeasurements,
    createdAt: serverTimestamp()
  });
});

batchFinishBtn.addEventListener("click", async () => {
  const batch = currentBatches.find(b => b.id === currentBatchId);
  if (!batch) return;
  const newStatus = batch.status === "Abgeschlossen" ? "Aktiv" : "Abgeschlossen";
  await updateDoc(doc(db, "fermentationBatches", currentBatchId), { status: newStatus });
  batchFinishBtn.textContent = newStatus === "Abgeschlossen" ? "Als aktiv markieren" : "Als abgeschlossen markieren";
  batchMeta.textContent = "Gestartet: " + formatDateStr(batch.startDate) + " · " + newStatus;
});

batchDeleteBtn.addEventListener("click", async () => {
  if (confirm("Diesen Batch inklusive Tagebuch wirklich löschen?")) {
    const entriesToDelete = currentBatchEntries.slice();
    await deleteDoc(doc(db, "fermentationBatches", currentBatchId));
    await Promise.all(entriesToDelete.map(e => deleteDoc(doc(db, "fermentationEntries", e.id))));
    if (unsubscribeBatchEntries) { unsubscribeBatchEntries(); unsubscribeBatchEntries = null; }
    viewState = "recipe";
    batchView.hidden = true;
    recipeView.hidden = false;
    titleEl.textContent = "Rezept";
  }
});

// --- Versuche (für alle Rezepte) ---
function subscribeRunsForRecipe(recipeId) {
  if (unsubscribeRuns) { unsubscribeRuns(); unsubscribeRuns = null; }
  const q = query(collection(db, "recipeRuns"), where("recipeId", "==", recipeId));
  unsubscribeRuns = onSnapshot(q, (snapshot) => {
    currentRuns = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.runNumber || 0) - (b.runNumber || 0));
    if (viewState === "recipe") renderRuns();
  });
}

function renderRuns() {
  runsListEl.innerHTML = "";
  if (currentRuns.length === 0) {
    runsListEl.appendChild(createEmptyState("entries-empty", "🧪", "Noch keine Versuche dokumentiert."));
    return;
  }
  currentRuns.forEach(run => {
    const row = document.createElement("button");
    row.className = "knowledge-row";

    const header = document.createElement("div");
    header.className = "entry-header";
    const badge = document.createElement("span");
    badge.className = "entry-badge";
    badge.textContent = "Versuch #" + run.runNumber;
    const date = document.createElement("span");
    date.className = "entry-date";
    date.textContent = formatDateStr(run.date);
    header.appendChild(badge);
    header.appendChild(date);

    const preview = document.createElement("p");
    preview.className = "entry-text";
    preview.textContent = run.deviations || run.notes || "";

    row.appendChild(header);
    row.appendChild(preview);
    row.addEventListener("click", () => openRunOverlay(run.id));
    runsListEl.appendChild(row);
  });
}

function renderRunMeasurements() {
  runMeasurementsListEl.innerHTML = "";
  workingRunMeasurements.forEach((m, index) => {
    const row = document.createElement("div");
    row.className = "ingredient-row";

    const labelInput = document.createElement("input");
    labelInput.type = "text";
    labelInput.className = "meas-label";
    labelInput.placeholder = "Name (z. B. Hydration %)";
    labelInput.value = m.label || "";
    labelInput.addEventListener("input", (e) => { workingRunMeasurements[index].label = e.target.value; });

    const valueInput = document.createElement("input");
    valueInput.type = "text";
    valueInput.className = "meas-value";
    valueInput.placeholder = "Wert";
    valueInput.value = m.value || "";
    valueInput.addEventListener("input", (e) => { workingRunMeasurements[index].value = e.target.value; });

    const removeBtn = document.createElement("button");
    removeBtn.className = "ing-remove";
    removeBtn.textContent = "×";
    removeBtn.setAttribute("aria-label", "Messwert entfernen");
    removeBtn.addEventListener("click", () => {
      workingRunMeasurements.splice(index, 1);
      renderRunMeasurements();
    });

    row.appendChild(labelInput);
    row.appendChild(valueInput);
    row.appendChild(removeBtn);
    runMeasurementsListEl.appendChild(row);
  });
}

addRunMeasurementBtn.addEventListener("click", () => {
  workingRunMeasurements.push({ label: "", value: "" });
  renderRunMeasurements();
  const lastRow = runMeasurementsListEl.lastElementChild;
  if (lastRow) lastRow.querySelector(".meas-label").focus();
});

function openRunOverlay(runId) {
  editingRunId = runId;
  const run = runId ? currentRuns.find(r => r.id === runId) : null;
  runOverlayTitle.textContent = run ? "Versuch #" + run.runNumber : "Neuer Versuch";
  runDateInput.value = run ? (run.date || "").slice(0, 10) : new Date().toISOString().slice(0, 10);
  runDeviations.value = run ? (run.deviations || "") : "";
  runNotes.value = run ? (run.notes || "") : "";
  workingRunMeasurements = run ? (run.measurements || []).map(m => ({ ...m })) : [];
  renderRunMeasurements();
  runDeleteBtn.hidden = !run;
  runOverlay.hidden = false;
}

addRunBtn.addEventListener("click", () => openRunOverlay(null));

runCancelBtn.addEventListener("click", () => {
  runOverlay.hidden = true;
});

runSaveBtn.addEventListener("click", async () => {
  const cleanedMeasurements = workingRunMeasurements
    .filter(m => (m.label || "").trim() !== "")
    .map(m => ({ label: m.label.trim(), value: (m.value || "").trim() }));

  const payload = {
    recipeId: currentRecipeId,
    date: runDateInput.value || new Date().toISOString().slice(0, 10),
    deviations: runDeviations.value.trim(),
    notes: runNotes.value.trim(),
    measurements: cleanedMeasurements
  };

  runOverlay.hidden = true;

  if (editingRunId) {
    await updateDoc(doc(db, "recipeRuns", editingRunId), payload);
  } else {
    const maxNum = currentRuns.reduce((m, r) => Math.max(m, r.runNumber || 0), 0);
    payload.runNumber = maxNum + 1;
    payload.createdAt = serverTimestamp();
    await addDoc(collection(db, "recipeRuns"), payload);
  }
});

runDeleteBtn.addEventListener("click", async () => {
  if (!editingRunId) return;
  if (confirm("Diesen Versuch wirklich löschen?")) {
    await deleteDoc(doc(db, "recipeRuns", editingRunId));
    runOverlay.hidden = true;
  }
});

// --- Kochmodus ---
function extractDurationMinutes(text) {
  if (!text) return null;
  const t = text.toLowerCase();
  let totalMinutes = 0;
  let found = false;

  const hourMatch = t.match(/(\d+[.,]?\d*)\s*(stunden?|std\.?|h\b)/);
  if (hourMatch) {
    totalMinutes += parseFloat(hourMatch[1].replace(",", ".")) * 60;
    found = true;
  }
  const minMatch = t.match(/(\d+[.,]?\d*)\s*(minuten?|min\.?)/);
  if (minMatch) {
    totalMinutes += parseFloat(minMatch[1].replace(",", "."));
    found = true;
  }
  return found ? Math.round(totalMinutes) : null;
}

startCookModeBtn.addEventListener("click", async () => {
  const recipe = allRecipes.find(r => r.id === currentRecipeId);
  if (!recipe || !recipe.steps || recipe.steps.length === 0) {
    alert("Dieses Rezept hat noch keine Zubereitungsschritte.");
    return;
  }
  cookSteps = recipe.steps;
  cookStepIndex = 0;
  recipeView.hidden = true;
  cookModeView.hidden = false;
  renderCookStep();

  try {
    if ("wakeLock" in navigator) {
      cookWakeLock = await navigator.wakeLock.request("screen");
    }
  } catch (err) {
    cookWakeLock = null;
  }
});

function renderCookStep() {
  clearInterval(cookTimerInterval);
  cookProgress.textContent = (cookStepIndex + 1) + " / " + cookSteps.length;
  cookStepNumber.textContent = "Schritt " + (cookStepIndex + 1);
  cookStepText.textContent = cookSteps[cookStepIndex];
  cookPrevBtn.disabled = cookStepIndex === 0;
  cookNextBtn.textContent = cookStepIndex === cookSteps.length - 1 ? "Fertig" : "Weiter";

  cookTimerArea.innerHTML = "";
  const minutes = extractDurationMinutes(cookSteps[cookStepIndex]);
  if (minutes && minutes > 0) {
    const btn = document.createElement("button");
    btn.className = "cook-timer-btn";
    btn.textContent = "⏱ " + minutes + " Min. Timer starten";
    btn.addEventListener("click", () => startCookTimer(minutes));
    cookTimerArea.appendChild(btn);
  }
}

function startCookTimer(minutes) {
  clearInterval(cookTimerInterval);
  cookTimerEndTime = Date.now() + minutes * 60 * 1000;
  renderCookTimerCountdown();
  cookTimerInterval = setInterval(renderCookTimerCountdown, 1000);
}

function renderCookTimerCountdown() {
  const remainingMs = cookTimerEndTime - Date.now();
  cookTimerArea.innerHTML = "";
  if (remainingMs <= 0) {
    clearInterval(cookTimerInterval);
    const done = document.createElement("p");
    done.className = "cook-timer-done";
    done.textContent = "⏰ Fertig!";
    cookTimerArea.appendChild(done);
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    return;
  }
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  const display = document.createElement("p");
  display.className = "cook-timer-display";
  display.textContent = mm + ":" + String(ss).padStart(2, "0");
  cookTimerArea.appendChild(display);
}

cookPrevBtn.addEventListener("click", () => {
  if (cookStepIndex > 0) {
    cookStepIndex--;
    renderCookStep();
  }
});

cookNextBtn.addEventListener("click", () => {
  if (cookStepIndex < cookSteps.length - 1) {
    cookStepIndex++;
    renderCookStep();
  } else {
    exitCookMode();
  }
});

async function exitCookMode() {
  clearInterval(cookTimerInterval);
  if (cookWakeLock) {
    try { await cookWakeLock.release(); } catch (err) { /* egal */ }
    cookWakeLock = null;
  }
  cookModeView.hidden = true;
  recipeView.hidden = false;
}

cookExitBtn.addEventListener("click", exitCookMode);

// --- Batches vergleichen ---
compareCloseBtn.addEventListener("click", () => {
  compareView.hidden = true;
  recipeView.hidden = false;
});

compareOpenBtn.addEventListener("click", async () => {
  const batchIds = currentBatches.map(b => b.id);
  const allEntriesForCompare = [];
  for (const batchId of batchIds) {
    const snap = await getDocs(query(collection(db, "fermentationEntries"), where("batchId", "==", batchId)));
    snap.docs.forEach(d => allEntriesForCompare.push({ id: d.id, batchId, ...d.data() }));
  }

  const labelSet = new Set();
  allEntriesForCompare.forEach(e => (e.measurements || []).forEach(m => labelSet.add(m.label)));
  const labels = Array.from(labelSet);

  renderCompareTable(labels, allEntriesForCompare);
  recipeView.hidden = true;
  compareView.hidden = false;
});

function renderCompareTable(labels, allEntriesForCompare) {
  compareTable.innerHTML = "";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.appendChild(document.createElement("th"));
  currentBatches.forEach(b => {
    const th = document.createElement("th");
    th.textContent = "Batch #" + b.batchNumber;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  compareTable.appendChild(thead);

  const tbody = document.createElement("tbody");

  function addRow(label, valueFn) {
    const tr = document.createElement("tr");
    const labelCell = document.createElement("td");
    labelCell.textContent = label;
    tr.appendChild(labelCell);
    currentBatches.forEach(b => {
      const td = document.createElement("td");
      td.textContent = valueFn(b);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }

  addRow("Status", b => b.status || "Aktiv");
  addRow("Start", b => formatDateStr(b.startDate));

  labels.forEach(label => {
    addRow(label, (b) => {
      const values = allEntriesForCompare
        .filter(e => e.batchId === b.id)
        .map(e => (e.measurements || []).find(m => m.label === label))
        .filter(Boolean)
        .map(m => m.value);
      return values.length > 0 ? values.join(" → ") : "—";
    });
  });

  addRow("Tagebucheinträge", b => allEntriesForCompare.filter(e => e.batchId === b.id).length + "");

  compareTable.appendChild(tbody);
}

// --- Rezept-Ansicht ---
function openRecipe(id) {
  const recipe = allRecipes.find(r => r.id === id);
  if (!recipe) return;
  viewState = "recipe";
  currentRecipeId = id;
  listEl.hidden = true;
  recipeView.hidden = false;
  addBtn.hidden = true;
  favoriteBtn.hidden = false;
  backBtn.hidden = false;
  titleEl.textContent = "Rezept";
  recipeTitleInput.value = recipe.title || "";
  recipeRawText.value = recipe.rawText || "";
  favoriteBtn.textContent = recipe.favorite ? "★" : "☆";

  workingIngredients = (recipe.ingredients || []).map(i => ({ ...i }));
  workingSteps = [...(recipe.steps || [])];
  workingTags = [...(recipe.tags || [])];
  renderIngredients();
  renderSteps();
  renderTags();
  renderEntries();
  renderAbleger(recipe);
  subscribePhotosForRecipe(id);
  subscribeBatchesForRecipe(id);
  subscribeRunsForRecipe(id);
}

// --- Ableger ---
function renderAbleger(recipe) {
  if (recipe.parentRecipeId) {
    const parent = allRecipes.find(r => r.id === recipe.parentRecipeId);
    parentBanner.hidden = false;
    parentBannerBtn.textContent = "Ableger von: " + (parent ? parent.title : "Unbekanntes Rezept");
    changeNotesInput.value = recipe.changeNotes || "";
  } else {
    parentBanner.hidden = true;
    changeNotesInput.value = "";
  }

  const children = allRecipes.filter(r => r.parentRecipeId === recipe.id);
  ablegerListEl.innerHTML = "";
  if (children.length === 0) {
    ablegerListEl.appendChild(createEmptyState("entries-empty", "🌱", "Noch keine Ableger."));
  } else {
    children.forEach(child => {
      const row = document.createElement("button");
      row.className = "knowledge-row";
      const titleP = document.createElement("p");
      titleP.className = "search-item-title";
      titleP.textContent = (child.favorite ? "★ " : "") + child.title;
      row.appendChild(titleP);
      row.addEventListener("click", () => openRecipe(child.id));
      ablegerListEl.appendChild(row);
    });
  }
}

parentBannerBtn.addEventListener("click", () => {
  const recipe = allRecipes.find(r => r.id === currentRecipeId);
  if (recipe && recipe.parentRecipeId) openRecipe(recipe.parentRecipeId);
});

createAblegerBtn.addEventListener("click", () => {
  const baseRecipe = allRecipes.find(r => r.id === currentRecipeId);
  if (!baseRecipe) return;
  openModal("Ableger erstellen", "", async (title) => {
    const ref = await addDoc(collection(db, "recipes"), {
      title,
      rawText: baseRecipe.rawText || "",
      ingredients: (baseRecipe.ingredients || []).map(i => ({ ...i })),
      steps: [...(baseRecipe.steps || [])],
      tags: [],
      favorite: false,
      categoryIds: baseRecipe.categoryIds || [],
      parentRecipeId: baseRecipe.id,
      changeNotes: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    openRecipe(ref.id);
  });
});

favoriteBtn.addEventListener("click", async () => {
  const recipe = allRecipes.find(r => r.id === currentRecipeId);
  if (!recipe) return;
  const newFav = !recipe.favorite;
  favoriteBtn.textContent = newFav ? "★" : "☆";
  await updateDoc(doc(db, "recipes", currentRecipeId), { favorite: newFav });
});

recipeSaveBtn.addEventListener("click", async () => {
  const title = recipeTitleInput.value.trim();
  if (!title) {
    recipeTitleInput.focus();
    return;
  }

  const cleanedIngredients = workingIngredients
    .filter(i => (i.name || "").trim() !== "")
    .map(i => ({
      amount: (i.amount || "").trim(),
      unit: (i.unit || "").trim(),
      name: i.name.trim()
    }));

  const cleanedSteps = workingSteps
    .map(s => (s || "").trim())
    .filter(s => s !== "");

  await updateDoc(doc(db, "recipes", currentRecipeId), {
    title,
    rawText: recipeRawText.value,
    ingredients: cleanedIngredients,
    steps: cleanedSteps,
    tags: workingTags,
    changeNotes: changeNotesInput.value.trim(),
    updatedAt: serverTimestamp()
  });
  render();
});

recipeDeleteBtn.addEventListener("click", async () => {
  if (confirm("Dieses Rezept wirklich löschen?")) {
    const relatedPhotos = currentPhotos.slice();
    const relatedEntries = entriesOf(currentRecipeId);
    const relatedBatches = currentBatches.slice();
    const relatedRuns = currentRuns.slice();
    await deleteDoc(doc(db, "recipes", currentRecipeId));
    await Promise.all(relatedPhotos.map(p => deleteDoc(doc(db, "photos", p.id))));
    await Promise.all(relatedEntries.map(e => deleteDoc(doc(db, "knowledgeEntries", e.id))));
    await Promise.all(relatedRuns.map(r => deleteDoc(doc(db, "recipeRuns", r.id))));
    for (const batch of relatedBatches) {
      const batchEntriesSnapshot = await getDocs(query(collection(db, "fermentationEntries"), where("batchId", "==", batch.id)));
      await Promise.all(batchEntriesSnapshot.docs.map(d => deleteDoc(doc(db, "fermentationEntries", d.id))));
      await deleteDoc(doc(db, "fermentationBatches", batch.id));
    }
    render();
  }
});

// --- Firestore-Abos (live, automatisch synchronisiert) ---
function subscribeCategories() {
  const q = query(collection(db, "categories"), orderBy("sortIndex"));
  onSnapshot(q, (snapshot) => {
    allCategories = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    if (activeTab === "library" && viewState === "list") render();
    if (activeTab === "search") renderSearchResults();
  }, (error) => {
    listEl.innerHTML = "";
    const err = document.createElement("p");
    err.className = "empty";
    err.textContent = "Fehler beim Laden: " + error.message;
    listEl.appendChild(err);
  });
}

function subscribeRecipes() {
  const q = query(collection(db, "recipes"), orderBy("title"));
  onSnapshot(q, (snapshot) => {
    allRecipes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    if (activeTab === "library" && viewState === "list") render();
    if (activeTab === "search") renderSearchResults();
  });
}

function subscribeEntries() {
  const q = query(collection(db, "knowledgeEntries"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    allEntries = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    if (activeTab === "library" && viewState === "recipe") renderEntries();
    if (activeTab === "knowledge") renderKnowledgeView();
    if (activeTab === "search") renderSearchResults();
  });
}

// --- Navigation ---
backBtn.addEventListener("click", () => {
  if (viewState === "batch") {
    if (unsubscribeBatchEntries) { unsubscribeBatchEntries(); unsubscribeBatchEntries = null; }
    viewState = "recipe";
    batchView.hidden = true;
    recipeView.hidden = false;
    titleEl.textContent = "Rezept";
    return;
  }
  if (viewState === "recipe") {
    render();
    return;
  }
  if (path.length > 1) {
    path.pop();
    render();
  }
});

// --- "+"-Auswahl: Kategorie oder Rezept ---
addBtn.addEventListener("click", () => {
  addChoiceOverlay.hidden = false;
});

addCancelBtn.addEventListener("click", () => {
  addChoiceOverlay.hidden = true;
});

addCategoryBtn.addEventListener("click", () => {
  addChoiceOverlay.hidden = true;
  openModal("Neue Kategorie", "", async (name) => {
    const siblings = childrenOf(currentParentId());
    const maxSort = siblings.reduce((m, c) => Math.max(m, c.sortIndex ?? 0), -1);
    await addDoc(collection(db, "categories"), {
      name,
      parentId: currentParentId(),
      sortIndex: maxSort + 1,
      createdAt: serverTimestamp()
    });
  });
});

addRecipeBtn.addEventListener("click", () => {
  addChoiceOverlay.hidden = true;
  openModal("Neues Rezept", "", async (title) => {
    const ref = await addDoc(collection(db, "recipes"), {
      title,
      rawText: "",
      ingredients: [],
      steps: [],
      tags: [],
      favorite: false,
      categoryIds: currentParentId() ? [currentParentId()] : [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    openRecipe(ref.id);
  });
});

// --- Rezept-Import per Foto (Texterkennung) ---
function loadTesseractScript() {
  return new Promise((resolve, reject) => {
    if (window.Tesseract) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Erkennungsmodul konnte nicht geladen werden. Internetverbindung prüfen."));
    document.head.appendChild(script);
  });
}

async function getTesseractWorker() {
  if (tesseractWorker) return tesseractWorker;
  ocrStatus.textContent = "Erkennungsmodul wird geladen…";
  await loadTesseractScript();
  tesseractWorker = await window.Tesseract.createWorker("deu");
  return tesseractWorker;
}

const OCR_UNIT_PATTERN = /^(g|kg|mg|ml|l|cl|el|tl|stück|stk|prise|prisen|bund|zehen?|dose|dosen|päckchen|scheiben?|blatt|blätter|handvoll|tasse|tassen)\.?$/i;
const OCR_AMOUNT_START = /^(\d+([.,]\d+)?(\s*\/\s*\d+)?)\s+(.*)$/;

function parseOcrText(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const ingredients = [];
  const steps = [];

  lines.forEach(line => {
    if (/^(zutaten|zubereitung|anleitung)\s*:?$/i.test(line)) return;

    const amountMatch = line.match(OCR_AMOUNT_START);
    if (amountMatch) {
      const amount = amountMatch[1];
      const rest = amountMatch[4].trim();
      const restWords = rest.split(/\s+/);
      const maybeUnit = restWords[0] || "";
      if (OCR_UNIT_PATTERN.test(maybeUnit)) {
        ingredients.push({ amount, unit: maybeUnit, name: restWords.slice(1).join(" ") });
      } else {
        ingredients.push({ amount, unit: "", name: rest });
      }
      return;
    }

    if (line.split(/\s+/).length >= 3) {
      steps.push(line);
    }
  });

  return { ingredients, steps };
}

addOcrBtn.addEventListener("click", () => {
  addChoiceOverlay.hidden = true;
  ocrFileInput.click();
});

// --- Rezept aus Vorlage (JSON einer KI einfügen) ---
addTemplateBtn.addEventListener("click", () => {
  addChoiceOverlay.hidden = true;
  templateInput.value = "";
  templateError.textContent = "";
  templateOverlay.hidden = false;
});

templateCancelBtn.addEventListener("click", () => {
  templateOverlay.hidden = true;
});

templateApplyBtn.addEventListener("click", async () => {
  const raw = templateInput.value.trim();
  templateError.textContent = "";
  if (!raw) {
    templateInput.focus();
    return;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    templateError.textContent = "Das ist kein gültiges JSON. Bitte die Antwort der KI unverändert einfügen.";
    return;
  }

  const title = (data.title || "Neues Rezept aus Vorlage").toString().trim() || "Neues Rezept aus Vorlage";

  const ingredients = Array.isArray(data.ingredients)
    ? data.ingredients
        .map(i => ({
          amount: (i && i.amount !== undefined ? i.amount : "").toString(),
          unit: (i && i.unit !== undefined ? i.unit : "").toString(),
          name: (i && i.name !== undefined ? i.name : "").toString().trim()
        }))
        .filter(i => i.name !== "")
    : [];

  const steps = Array.isArray(data.steps)
    ? data.steps.map(s => (s || "").toString().trim()).filter(s => s !== "")
    : [];

  templateOverlay.hidden = true;

  const ref = await addDoc(collection(db, "recipes"), {
    title,
    rawText: raw,
    ingredients,
    steps,
    tags: [],
    favorite: false,
    categoryIds: currentParentId() ? [currentParentId()] : [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  openRecipe(ref.id);
});

ocrFileInput.addEventListener("change", async () => {
  const file = ocrFileInput.files[0];
  ocrFileInput.value = "";
  if (!file) return;

  ocrStatus.textContent = "Foto wird vorbereitet…";
  ocrOverlay.hidden = false;

  try {
    const ocrImage = await compressImage(file, 1600, 0.85);
    const worker = await getTesseractWorker();
    ocrStatus.textContent = "Text wird erkannt… Das kann einen Moment dauern.";
    const result = await worker.recognize(ocrImage);
    const recognizedText = (result.data.text || "").trim();
    const parsed = parseOcrText(recognizedText);

    const ref = await addDoc(collection(db, "recipes"), {
      title: "Neues Rezept aus Foto",
      rawText: recognizedText,
      ingredients: parsed.ingredients,
      steps: parsed.steps,
      tags: [],
      favorite: false,
      categoryIds: currentParentId() ? [currentParentId()] : [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const photoImage = await compressImage(file, 1000, 0.7);
    await addDoc(collection(db, "photos"), {
      recipeId: ref.id,
      dataUrl: photoImage,
      createdAt: serverTimestamp()
    });

    ocrOverlay.hidden = true;
    openRecipe(ref.id);
  } catch (err) {
    ocrOverlay.hidden = true;
    alert("Texterkennung fehlgeschlagen: " + err.message);
  }
});

// --- Eingabe-Dialog (anlegen/umbenennen) ---
function openModal(title, initialValue, onSave) {
  modalTitle.textContent = title;
  modalInput.value = initialValue;
  modalOnSave = onSave;
  modalOverlay.hidden = false;
  modalInput.focus();
}

function closeModal() {
  modalOverlay.hidden = true;
  modalOnSave = null;
}

modalCancel.addEventListener("click", closeModal);

modalSave.addEventListener("click", async () => {
  const value = modalInput.value.trim();
  if (!value) {
    modalInput.focus();
    return;
  }
  const cb = modalOnSave;
  closeModal();
  if (cb) await cb(value);
});

modalInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") modalSave.click();
});

// --- Optionsmenü für Kategorien ---
function openMenu(cat) {
  activeMenuCategory = cat;
  menuOverlay.hidden = false;
}

function closeMenu() {
  menuOverlay.hidden = true;
  activeMenuCategory = null;
}

menuCancel.addEventListener("click", closeMenu);

menuRename.addEventListener("click", () => {
  const cat = activeMenuCategory;
  closeMenu();
  openModal("Kategorie umbenennen", cat.name, async (name) => {
    await updateDoc(doc(db, "categories", cat.id), { name });
  });
});

menuUp.addEventListener("click", async () => {
  const cat = activeMenuCategory;
  closeMenu();
  await moveCategory(cat, -1);
});

menuDown.addEventListener("click", async () => {
  const cat = activeMenuCategory;
  closeMenu();
  await moveCategory(cat, 1);
});

async function moveCategory(cat, direction) {
  const siblings = childrenOf(cat.parentId);
  const index = siblings.findIndex(c => c.id === cat.id);
  const swapIndex = index + direction;
  if (swapIndex < 0 || swapIndex >= siblings.length) return;
  const other = siblings[swapIndex];
  await updateDoc(doc(db, "categories", cat.id), { sortIndex: other.sortIndex });
  await updateDoc(doc(db, "categories", other.id), { sortIndex: cat.sortIndex });
}

menuDelete.addEventListener("click", async () => {
  const cat = activeMenuCategory;
  closeMenu();
  const hasChildren = allCategories.some(c => c.parentId === cat.id);
  if (hasChildren) {
    alert('"' + cat.name + '" hat noch Unterkategorien. Lösche oder verschiebe diese zuerst.');
    return;
  }
  if (confirm('"' + cat.name + '" wirklich löschen?')) {
    await deleteDoc(doc(db, "categories", cat.id));
  }
});

// --- Anmeldung ---
let appStarted = false;

function startApp() {
  if (appStarted) return;
  appStarted = true;
  subscribeCategories();
  subscribeRecipes();
  subscribeEntries();
}

loginBtn.addEventListener("click", async () => {
  loginError.textContent = "";
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  if (!email || !password) {
    loginError.textContent = "Bitte E-Mail und Passwort eingeben.";
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    loginError.textContent = "Anmeldung fehlgeschlagen. E-Mail oder Passwort prüfen.";
  }
});

loginPassword.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loginBtn.click();
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginScreen.hidden = true;
    appRoot.hidden = false;
    startApp();
  } else {
    loginScreen.hidden = false;
    appRoot.hidden = true;
  }
});
