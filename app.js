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
const addCancelBtn = document.getElementById("addCancelBtn");

const recipeTitleInput = document.getElementById("recipeTitleInput");
const recipeRawText = document.getElementById("recipeRawText");
const recipeSaveBtn = document.getElementById("recipeSaveBtn");
const recipeDeleteBtn = document.getElementById("recipeDeleteBtn");

const ingredientsListEl = document.getElementById("ingredientsList");
const addIngredientBtn = document.getElementById("addIngredientBtn");
const stepsListEl = document.getElementById("stepsList");
const addStepBtn = document.getElementById("addStepBtn");

const photosListEl = document.getElementById("photosList");
const photoFileInput = document.getElementById("photoFileInput");
const addPhotoBtn = document.getElementById("addPhotoBtn");

const entriesListEl = document.getElementById("entriesList");
const addEntryBtn = document.getElementById("addEntryBtn");
const entryOverlay = document.getElementById("entryOverlay");
const entryType = document.getElementById("entryType");
const entryText = document.getElementById("entryText");
const entrySave = document.getElementById("entrySave");
const entryCancel = document.getElementById("entryCancel");

const tabLibrary = document.getElementById("tabLibrary");
const tabKnowledge = document.getElementById("tabKnowledge");
const knowledgeView = document.getElementById("knowledgeView");
const knowledgeListEl = document.getElementById("knowledgeList");
const knowledgeTypeFilter = document.getElementById("knowledgeTypeFilter");
const knowledgeSearchInput = document.getElementById("knowledgeSearchInput");
const exportBtn = document.getElementById("exportBtn");

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
let allEntries = [];         // alle Hinweise/Erfahrungen, live von Firestore
let activeTab = "library";   // "library" oder "knowledge"
let currentPhotos = [];      // Fotos des gerade geöffneten Rezepts
let unsubscribePhotos = null;

function formatDate(ts) {
  if (!ts || !ts.toDate) return "";
  return ts.toDate().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function currentParentId() {
  return path[path.length - 1].id;
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
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Noch nichts hier. Mit + oben rechts eine Kategorie oder ein Rezept anlegen.";
    listEl.appendChild(empty);
    return;
  }

  cats.forEach(cat => {
    const row = document.createElement("div");
    row.className = "row";

    const nameBtn = document.createElement("button");
    nameBtn.className = "row-name";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = cat.name;
    const chevron = document.createElement("span");
    chevron.className = "chevron";
    chevron.textContent = "›";
    nameBtn.appendChild(nameSpan);
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

    const nameSpan = document.createElement("span");
    nameSpan.textContent = (recipe.favorite ? "★ " : "") + (recipe.title || "Ohne Titel");
    nameBtn.appendChild(nameSpan);

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
function renderEntries() {
  const entries = entriesOf(currentRecipeId);
  entriesListEl.innerHTML = "";

  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "entries-empty";
    empty.textContent = "Noch keine Hinweise oder Erfahrungen.";
    entriesListEl.appendChild(empty);
    return;
  }

  entries.forEach(entry => {
    const row = document.createElement("div");
    row.className = "entry-row";

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
    entriesListEl.appendChild(row);
  });
}

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
  listEl.hidden = true;
  recipeView.hidden = true;
  knowledgeView.hidden = true;
  searchView.hidden = true;
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
    const empty = document.createElement("p");
    empty.className = "entries-empty";
    empty.textContent = "Keine Einträge gefunden.";
    knowledgeListEl.appendChild(empty);
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
    const hint = document.createElement("p");
    hint.className = "entries-empty";
    hint.textContent = "Tippe, um in Rezepten, Zutaten und Hinweisen zu suchen.";
    searchResultsEl.appendChild(hint);
    return;
  }

  const matchingCategories = allCategories.filter(c => (c.name || "").toLowerCase().includes(q));

  const matchingRecipes = allRecipes.filter(r => {
    if ((r.title || "").toLowerCase().includes(q)) return true;
    if ((r.rawText || "").toLowerCase().includes(q)) return true;
    if ((r.ingredients || []).some(i => (i.name || "").toLowerCase().includes(q))) return true;
    if ((r.steps || []).some(s => (s || "").toLowerCase().includes(q))) return true;
    return false;
  });

  const matchingEntries = allEntries.filter(e => (e.text || "").toLowerCase().includes(q));

  if (matchingCategories.length === 0 && matchingRecipes.length === 0 && matchingEntries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "entries-empty";
    empty.textContent = "Nichts gefunden.";
    searchResultsEl.appendChild(empty);
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

    const data = serializeForExport({
      exportedAt: new Date().toISOString(),
      categories: allCategories,
      recipes: allRecipes,
      knowledgeEntries: allEntries,
      photos: photosForExport
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
    const empty = document.createElement("p");
    empty.className = "entries-empty";
    empty.textContent = "Erst Zutaten mit Mengenangabe hinzufügen.";
    scaleIngredientsListEl.appendChild(empty);
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
    const empty = document.createElement("p");
    empty.className = "photos-empty";
    empty.textContent = "Noch keine Fotos.";
    photosListEl.appendChild(empty);
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
  renderIngredients();
  renderSteps();
  renderEntries();
  subscribePhotosForRecipe(id);
}

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
    updatedAt: serverTimestamp()
  });
  render();
});

recipeDeleteBtn.addEventListener("click", async () => {
  if (confirm("Dieses Rezept wirklich löschen?")) {
    const relatedPhotos = currentPhotos.slice();
    const relatedEntries = entriesOf(currentRecipeId);
    await deleteDoc(doc(db, "recipes", currentRecipeId));
    await Promise.all(relatedPhotos.map(p => deleteDoc(doc(db, "photos", p.id))));
    await Promise.all(relatedEntries.map(e => deleteDoc(doc(db, "knowledgeEntries", e.id))));
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
      favorite: false,
      categoryIds: currentParentId() ? [currentParentId()] : [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    openRecipe(ref.id);
  });
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
