import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBDWfaVFUsMzeorQ8M65ZLmQ8g3Io9uyI",
  authDomain: "mi-nevera-app.firebaseapp.com",
  projectId: "mi-nevera-app",
  storageBucket: "mi-nevera-app.firebasestorage.app",
  messagingSenderId: "791110029618",
  appId: "1:791110029618:web:436a6fbf9ac5733dcbc72b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencias del DOM
const viewSelect = document.getElementById("view-select");
const viewFridge = document.getElementById("view-fridge");
const currentFridgeTitle = document.getElementById("current-fridge-title");
const foodList = document.getElementById("food-list");
const modalAdd = document.getElementById("modal-add");
const formAddFood = document.getElementById("form-add-food");
const inputFoodName = document.getElementById("input-food-name");
const inputFoodQty = document.getElementById("input-food-qty");
const btnRemove = document.getElementById("btn-remove");
const removeBanner = document.getElementById("remove-banner");

let currentFridgeId = null;
let unsubscribeFridge = null;
let isRemoveMode = false;

// Diccionario simple de iconos
function getFoodIcon(name) {
  const text = name.toLowerCase();
  if (text.includes("carne") || text.includes("res") || text.includes("cerdo") || text.includes("chuleta")) return "🥩";
  if (text.includes("pollo") || text.includes("pechuga") || text.includes("ala")) return "🍗";
  if (text.includes("pescado") || text.includes("atun") || text.includes("camaron")) return "🐟";
  if (text.includes("salchicha") || text.includes("chorizo") || text.includes("jamon")) return "🌭";
  if (text.includes("huevo")) return "🥚";
  if (text.includes("leche") || text.includes("yogur")) return "🥛";
  if (text.includes("queso")) return "🧀";
  if (text.includes("arroz")) return "🍚";
  if (text.includes("pasta") || text.includes("fideo")) return "🍝";
  if (text.includes("pan")) return "🍞";
  if (text.includes("manzana") || text.includes("fruta") || text.includes("guineo")) return "🍎";
  if (text.includes("tomate") || text.includes("lechuga") || text.includes("verdura") || text.includes("cebolla")) return "🥬";
  if (text.includes("agua") || text.includes("jugo") || text.includes("te")) return "🥤";
  return "🍽️";
}

// --- NAVEGACIÓN ENTRE PESTAÑAS ---
document.querySelectorAll(".fridge-card").forEach((card) => {
  card.addEventListener("click", () => {
    const fridgeId = card.dataset.fridgeId;
    const fridgeName = card.dataset.fridgeName;
    openFridge(fridgeId, fridgeName);
  });
});

document.getElementById("btn-back").addEventListener("click", () => {
  if (unsubscribeFridge) unsubscribeFridge();
  setRemoveMode(false);
  currentFridgeId = null;
  viewFridge.classList.remove("active");
  viewSelect.classList.add("active");
});

// --- ESCUCHAR FIREBASE EN TIEMPO REAL ---
function openFridge(fridgeId, fridgeName) {
  currentFridgeId = fridgeId;
  currentFridgeTitle.textContent = fridgeName;
  viewSelect.classList.remove("active");
  viewFridge.classList.add("active");
  foodList.innerHTML = `<li class="empty-msg">Cargando alimentos...</li>`;

  const itemsRef = collection(db, "neveras", fridgeId, "alimentos");
  const q = query(itemsRef, orderBy("creadoEn", "desc"));

  unsubscribeFridge = onSnapshot(q, (snapshot) => {
    foodList.innerHTML = "";

    if (snapshot.empty) {
      setRemoveMode(false);
      foodList.innerHTML = `<li class="empty-msg">La nevera está vacía</li>`;
      return;
    }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const nombre = data.nombre || "Sin nombre";
      const cantidad = data.cantidad ? `(${data.cantidad})` : "";
      const icono = getFoodIcon(nombre);

      const li = document.createElement("li");
      li.className = "food-item";
      li.innerHTML = `
        <div class="food-info">
          <span class="food-icon">${icono}</span>
          <span>${nombre}</span>
        </div>
        <div class="food-right">
          <span class="food-qty">${cantidad}</span>
          <button class="btn-delete-item ${isRemoveMode ? "" : "hidden"}" data-id="${docSnap.id}">Quitar</button>
        </div>
      `;

      li.querySelector(".btn-delete-item").addEventListener("click", async () => {
        await deleteDoc(doc(db, "neveras", currentFridgeId, "alimentos", docSnap.id));
      });

      foodList.appendChild(li);
    });
  }, (error) => {
    console.error("Error leyendo Firestore:", error);
    foodList.innerHTML = `<li class="empty-msg">Error de conexión con la base de datos</li>`;
  });
}

// --- MODO AGREGAR ALIMENTO ---
document.getElementById("btn-add").addEventListener("click", () => {
  setRemoveMode(false);
  formAddFood.reset();
  modalAdd.classList.remove("hidden");
  inputFoodName.focus();
});

document.getElementById("btn-cancel-add").addEventListener("click", () => {
  modalAdd.classList.add("hidden");
});

formAddFood.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentFridgeId) return;

  const nombre = inputFoodName.value.trim();
  const cantidad = inputFoodQty.value.trim();
  if (!nombre) return;

  modalAdd.classList.add("hidden");

  try {
    await addDoc(collection(db, "neveras", currentFridgeId, "alimentos"), {
      nombre,
      cantidad,
      creadoEn: serverTimestamp()
    });
  } catch (error) {
    console.error("Error al guardar:", error);
    alert("No se pudo guardar el alimento. Revisa la consola.");
  }
});

// --- MODO RETIRAR ALIMENTO ---
function setRemoveMode(active) {
  isRemoveMode = active;
  btnRemove.classList.toggle("active-mode", active);
  btnRemove.textContent = active ? "Listo" : "- Retirar";
  removeBanner.classList.toggle("hidden", !active);

  document.querySelectorAll(".btn-delete-item").forEach((btn) => {
    btn.classList.toggle("hidden", !active);
  });
}

btnRemove.addEventListener("click", () => {
  setRemoveMode(!isRemoveMode);
});