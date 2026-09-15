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
