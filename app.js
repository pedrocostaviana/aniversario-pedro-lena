import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const form = document.querySelector("#rsvp-form");
const submitButton = document.querySelector("#submit-button");
const message = document.querySelector("#form-message");

function showMessage(text, kind) {
  message.textContent = text;
  message.className = `message ${kind}`;
}

function firebaseConfigured() {
  return firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "COLE_SUA_API_KEY" &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== "SEU_PROJECT_ID";
}

if (!firebaseConfigured()) {
  showMessage("O convite está pronto visualmente, mas ainda precisa ser conectado ao Firebase. Siga o README incluído nos arquivos.", "error");
  submitButton.disabled = true;
} else {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.querySelector("#guest-name").value.trim();
    const attendance = new FormData(form).get("attendance");

    if (name.length < 2) {
      showMessage("Informe seu nome completo para continuar.", "error");
      return;
    }
    if (!["yes", "no"].includes(attendance)) {
      showMessage("Selecione uma opção de presença.", "error");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";
    try {
      await addDoc(collection(db, "rsvps"), {
        name,
        attendance,
        createdAt: serverTimestamp()
      });
      form.reset();
      showMessage(
        attendance === "yes"
          ? "Confirmação enviada! Ficamos felizes em contar com você. Até lá! ✨"
          : "Resposta registrada. Obrigado por avisar! ❤️",
        "success"
      );
    } catch (error) {
      console.error("Falha ao enviar confirmação:", error);
      showMessage("Não foi possível enviar agora. Verifique sua conexão e tente novamente. Se o erro continuar, avise os anfitriões.", "error");
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Enviar confirmação <span aria-hidden="true">→</span>';
    }
  });
}
