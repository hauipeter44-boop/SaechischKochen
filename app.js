import {
  db, collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp
} from "./firebase.js";

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
tabLibrary.addEventListener("click", () => {
  activeTab = "library";
  tabLibrary.classList.add("active");
  tabKnowledge.classList.remove("active");
  knowledgeView.hidden = true;
  render();
});

tabKnowledge.addEventListener("click", () => {
  activeTab = "knowledge";
  tabKnowledge.classList.add("active");
  tabLibrary.classList.remove("active");
  listEl.hidden = true;
  recipeView.hidden = true;
  knowledgeView.hidden = false;
  backBtn.hidden = true;
  addBtn.hidden = true;
  favoriteBtn.hidden = true;
  titleEl.textContent = "Wissen";
  renderKnowledgeView();
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
  tabLibrary.classList.add("active");
  tabKnowledge.classList.remove("active");
  knowledgeView.hidden = true;
  path = [{ id: null, name: "Kategorien" }];
  openRecipe(recipeId);
}

knowledgeTypeFilter.addEventListener("change", renderKnowledgeView);
knowledgeSearchInput.addEventListener("input", renderKnowledgeView);

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
    await deleteDoc(doc(db, "recipes", currentRecipeId));
    render();
  }
});

// --- Firestore-Abos (live, automatisch synchronisiert) ---
function subscribeCategories() {
  const q = query(collection(db, "categories"), orderBy("sortIndex"));
  onSnapshot(q, (snapshot) => {
    allCategories = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    if (viewState === "list") render();
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
    if (viewState === "list") render();
  });
}

function subscribeEntries() {
  const q = query(collection(db, "knowledgeEntries"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    allEntries = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    if (viewState === "recipe") renderEntries();
    if (activeTab === "knowledge") renderKnowledgeView();
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

// --- Start ---
subscribeCategories();
subscribeRecipes();
subscribeEntries();
