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
/* ===== CONTAGEM REGRESSIVA DO ANIVERSÁRIO ===== */
(function iniciarContagemRegressiva() {
  const dataFesta = new Date("2026-11-21T17:00:00-03:00").getTime();

const diasEl = document.getElementById("count-days");
const horasEl = document.getElementById("count-hours");
const minutosEl = document.getElementById("count-minutes");
const segundosEl = document.getElementById("count-seconds");

  if (!diasEl || !horasEl || !minutosEl || !segundosEl) return;

  function atualizarContagem() {
    const agora = Date.now();
    const diferenca = dataFesta - agora;

    if (diferenca <= 0) {
      diasEl.textContent = "00";
      horasEl.textContent = "00";
      minutosEl.textContent = "00";
      segundosEl.textContent = "00";
      return;
    }

    const dias = Math.floor(diferenca / 86400000);
    const horas = Math.floor((diferenca % 86400000) / 3600000);
    const minutos = Math.floor((diferenca % 3600000) / 60000);
    const segundos = Math.floor((diferenca % 60000) / 1000);

    diasEl.textContent = String(dias).padStart(2, "0");
    horasEl.textContent = String(horas).padStart(2, "0");
    minutosEl.textContent = String(minutos).padStart(2, "0");
    segundosEl.textContent = String(segundos).padStart(2, "0");
  }
  /* ===== PARTICULAS DE BRASA ===== */
(function criarBrasas() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const quantidade = window.innerWidth <= 600 ? 8 : 14;
  const estilo = document.createElement("style");
  estilo.textContent = `
    .brasa {
      left: var(--brasa-x);
      animation-delay: var(--brasa-atraso);
    }
  `;
  document.head.appendChild(estilo);

  for (let i = 0; i < quantidade; i++) {
    const particula = document.createElement("span");
    particula.className = "brasa";
    particula.setAttribute("aria-hidden", "true");

    particula.style.setProperty("--brasa-x", `${Math.random() * 100}%`);
    particula.style.setProperty("--brasa-atraso", `${Math.random() * -12}s`);

    document.body.appendChild(particula);
  }
})();

  atualizarContagem();
  setInterval(atualizarContagem, 1000);
})();
/* ===== ANIMACAO DE ENTRADA DAS SECOES ===== */
(function animarElementosAoRolar() {
  const seletores = [
    ".countdown-section",
    ".extras-section .card-heading",
    ".extras-buttons",
    ".manual-card",
    ".event-details",
    ".rsvp-card"
  ];

  const elementos = document.querySelectorAll(seletores.join(","));

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elementos.forEach((elemento) => elemento.classList.add("visivel"));
    return;
  }

  if (!("IntersectionObserver" in window)) {
    elementos.forEach((elemento) => elemento.classList.add("visivel"));
    return;
  }

  elementos.forEach((elemento) => elemento.classList.add("animar-entrada"));

  const observador = new IntersectionObserver((entradas, observer) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visivel");
        observer.unobserve(entrada.target);
      }
    });
  }, {
    threshold: 0.12
  });

  elementos.forEach((elemento) => observador.observe(elemento));
})();
