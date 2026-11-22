import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBDWfaVFUsMzeorQ8M65ZLmQ8g3Io9uyI",
  authDomain: "mi-nevera-app.firebaseapp.com",
  projectId: "mi-nevera-app",
  storageBucket: "mi-nevera-app.firebasestorage.app",
  messagingSenderId: "791110029618",
  appId: "1:791110029618:web:436a6fbf9ac5733dcbc72b",
  measurementId: "G-D7MK1MD763"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 1. PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencias del DOM
const viewSelect = document.getElementById("view-select");
const viewFridge = document.getElementById("view-fridge");
const currentFridgeTitle = document.getElementById("current-fridge-title");
const foodList = document.getElementById("food-list");
const modalOverlay = document.getElementById("modal-overlay");

let unsubscribeFridge = null;

// Diccionario simple de iconos (ampliable a futuro)
function getFoodIcon(name) {
  const text = name.toLowerCase();
  if (text.includes("carne") || text.includes("res") || text.includes("cerdo")) return "🥩";
  if (text.includes("pollo") || text.includes("pechuga")) return "🍗";
  if (text.includes("pescado") || text.includes("atun") || text.includes("camaron")) return "🐟";
  if (text.includes("huevo")) return "🥚";
  if (text.includes("leche") || text.includes("yogur")) return "🥛";
  if (text.includes("queso")) return "🧀";
  if (text.includes("arroz")) return "🍚";
  if (text.includes("pan")) return "🍞";
  if (text.includes("manzana") || text.includes("fruta") || text.includes("guineo")) return "🍎";
  if (text.includes("tomate") || text.includes("lechuga") || text.includes("verdura")) return "🥬";
  if (text.includes("agua") || text.includes("jugo") || text.includes("te")) return "🥤";
  return "🍽️"; // Icono por defecto
}

// --- NAVEGACIÓN ENTRE PESTAÑAS ---
document.querySelectorAll(".fridge-card").forEach(card => {
  card.addEventListener("click", () => {
    const fridgeId = card.dataset.fridgeId;
    const fridgeName = card.dataset.fridgeName;
    openFridge(fridgeId, fridgeName);
  });
});

document.getElementById("btn-back").addEventListener("click", () => {
  if (unsubscribeFridge) unsubscribeFridge(); // Dejar de escuchar cambios al salir
  viewFridge.classList.remove("active");
  viewSelect.classList.add("active");
});

// --- ESCUCHAR FIREBASE EN TIEMPO REAL ---
function openFridge(fridgeId, fridgeName) {
  currentFridgeTitle.textContent = fridgeName;
  viewSelect.classList.remove("active");
  viewFridge.classList.add("active");
  foodList.innerHTML = `<li class="empty-msg">Cargando alimentos...</li>`;

  // Escucha la subcolección: neveras -> [fridgeId] -> alimentos
  const itemsRef = collection(db, "neveras", fridgeId, "alimentos");

  unsubscribeFridge = onSnapshot(itemsRef, (snapshot) => {
    foodList.innerHTML = "";

    if (snapshot.empty) {
      foodList.innerHTML = `<li class="empty-msg">La nevera está vacía</li>`;
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
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
        <span class="food-qty">${cantidad}</span>
      `;
      foodList.appendChild(li);
    });
  }, (error) => {
    console.error("Error leyendo Firestore:", error);
    foodList.innerHTML = `<li class="empty-msg">Error de conexión con la base de datos</li>`;
  });
}

// --- BOTONES EMERGENTES (AÚN SIN FUNCIONAR) ---
function showTempModal() {
  modalOverlay.classList.remove("hidden");
}

document.getElementById("btn-add").addEventListener("click", showTempModal);
document.getElementById("btn-remove").addEventListener("click", showTempModal);
document.getElementById("btn-close-modal").addEventListener("click", () => {
  modalOverlay.classList.add("hidden");
});