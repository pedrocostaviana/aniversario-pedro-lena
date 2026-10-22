import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore, collection, onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const loginPanel = document.querySelector("#login-panel");
const dashboard = document.querySelector("#dashboard");
const loginForm = document.querySelector("#login-form");
const loginButton = document.querySelector("#login-button");
const loginMessage = document.querySelector("#login-message");
const dashboardMessage = document.querySelector("#dashboard-message");
const logoutButton = document.querySelector("#logout-button");
const exportButton = document.querySelector("#export-button");
let currentRows = [];
let unsubscribeRows = null;

function setMessage(element, text, kind) {
  element.textContent = text;
  element.className = `message ${kind}`;
}
function isConfigured() {
  return firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "COLE_SUA_API_KEY" &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== "SEU_PROJECT_ID";
}
function formatDate(timestamp) {
  if (!timestamp || typeof timestamp.toDate !== "function") return "—";
  return timestamp.toDate().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
function renderRows(docs) {
  currentRows = docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const yes = currentRows.filter((r) => r.attendance === "yes").length;
  const no = currentRows.filter((r) => r.attendance === "no").length;
  document.querySelector("#yes-count").textContent = yes;
  document.querySelector("#no-count").textContent = no;
  document.querySelector("#total-count").textContent = currentRows.length;
  document.querySelector("#last-updated").textContent =
    `Atualizado em ${new Date().toLocaleString("pt-BR")}`;

  const tbody = document.querySelector("#rsvp-rows");
  tbody.replaceChildren();
  if (!currentRows.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 3;
    td.className = "empty-row";
    td.textContent = "Ainda não há confirmações.";
    tr.append(td);
    tbody.append(tr);
    return;
  }
  currentRows.sort((a, b) => (a.name || "").localeCompare(b.name || "", "pt-BR"));
  for (const row of currentRows) {
    const tr = document.createElement("tr");
    const name = document.createElement("td");
    name.textContent = row.name || "(sem nome)";
    const status = document.createElement("td");
    status.textContent = row.attendance === "yes" ? "Vai comparecer" : "Não poderá ir";
    status.className = row.attendance === "yes" ? "status-yes" : "status-no";
    const date = document.createElement("td");
    date.textContent = formatDate(row.createdAt);
    tr.append(name, status, date);
    tbody.append(tr);
  }
}
function startDashboard(db) {
  if (unsubscribeRows) unsubscribeRows();
  const q = query(collection(db, "rsvps"), orderBy("createdAt", "desc"));
  unsubscribeRows = onSnapshot(q, (snapshot) => {
    renderRows(snapshot.docs);
    dashboardMessage.className = "message";
  }, (error) => {
    console.error(error);
    setMessage(dashboardMessage, "Não foi possível carregar a lista. Confira as regras do Firestore e as permissões da conta administrativa.", "error");
  });
}
if (!isConfigured()) {
  loginButton.disabled = true;
  setMessage(loginMessage, "Configure primeiro o arquivo firebase-config.js conforme as instruções do README.", "error");
} else {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginButton.disabled = true;
    loginButton.textContent = "Entrando...";
    try {
      await signInWithEmailAndPassword(
        auth,
        document.querySelector("#admin-email").value.trim(),
        document.querySelector("#admin-password").value
      );
      loginForm.reset();
      loginMessage.className = "message";
    } catch (error) {
      console.error(error);
      setMessage(loginMessage, "Não foi possível entrar. Confira o e-mail, a senha e se a conta foi criada no Firebase.", "error");
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Entrar no painel";
    }
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginPanel.hidden = true;
      dashboard.hidden = false;
      startDashboard(db);
    } else {
      if (unsubscribeRows) unsubscribeRows();
      unsubscribeRows = null;
      currentRows = [];
      loginPanel.hidden = false;
      dashboard.hidden = true;
    }
  });

  logoutButton.addEventListener("click", async () => {
    await signOut(auth);
  });

  exportButton.addEventListener("click", () => {
    const quote = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const lines = [
      ["Nome", "Resposta", "Data do registro"],
      ...currentRows.map((r) => [
        r.name,
        r.attendance === "yes" ? "Vai comparecer" : "Não poderá ir",
        formatDate(r.createdAt)
      ])
    ];
    const csv = "\uFEFF" + lines.map((line) => line.map(quote).join(";")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "confirmacoes-aniversario-pedro-lena.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
}
