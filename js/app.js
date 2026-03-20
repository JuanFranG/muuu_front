/* ============================================
   MUUU APP – LÓGICA PRINCIPAL
   Universidad del Magdalena · 2025
   ============================================ */

"use strict";

// ============================================
// NAVEGACIÓN
// ============================================
let currentScreen = "screen-splash";

function goTo(id, animation) {
  animation = animation || "fade";
  const from = document.getElementById(currentScreen);
  const to   = document.getElementById(id);
  if (!to || id === currentScreen) return;

  from.style.opacity    = "0";
  from.style.transform  = animation === "slide-in-left"
    ? "translateX(-40px)"
    : animation === "slide-in-right"
      ? "translateX(40px)"
      : "translateX(0)";
  from.style.transition = "opacity .2s ease, transform .2s ease";

  setTimeout(function () {
    from.classList.remove("active");
    from.style.opacity   = "";
    from.style.transform = "";
    from.style.transition = "";

    to.classList.add("active");
    to.classList.add(animation);
    setTimeout(function () { to.classList.remove(animation); }, 400);

    currentScreen = id;
    updateNavControls(id);
  }, 180);
}

function navTo(id) {
  goTo(id, "fade");
}

function updateNavControls(id) {
  document.querySelectorAll(".nav-ctrl-btn").forEach(function (btn) {
    btn.classList.remove("active");
    var onclick = btn.getAttribute("onclick") || "";
    if (onclick.includes(id)) btn.classList.add("active");
  });
}

// Auto-avance del splash después de 2.5 s
setTimeout(function () {
  if (currentScreen === "screen-splash") goTo("screen-login", "slide-in-right");
}, 2500);

// ============================================
// PESTAÑAS DE FILTRO
// ============================================
function setActiveTab(el) {
  el.closest(".filter-tabs").querySelectorAll(".filter-tab").forEach(function (t) {
    t.classList.remove("active");
  });
  el.classList.add("active");
}

function setModeActive(el) {
  el.closest(".mode-selector").querySelectorAll(".mode-btn").forEach(function (b) {
    b.classList.remove("active");
  });
  el.classList.add("active");
}

// ============================================
// PONTE A PRUEBA – FLIP CARD & QUIZ
// ============================================
var selectedOption = null;
var correctAnswer  = "A";
var isFlipped      = false;
var timerInterval  = null;
var seconds        = 0;

// Observar cambio de pantalla para el timer
var pruebaScreen = document.getElementById("screen-prueba");
if (pruebaScreen) {
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.target.id !== "screen-prueba") return;
      if (m.target.classList.contains("active")) {
        startTimer();
      } else {
        stopTimer();
      }
    });
  });
  observer.observe(pruebaScreen, { attributes: true, attributeFilter: ["class"] });
}

function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(function () {
    seconds++;
    var m  = Math.floor(seconds / 60);
    var s  = seconds % 60;
    var el = document.getElementById("timer");
    if (el) el.textContent = m + ":" + String(s).padStart(2, "0");
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function flipCard() {
  var card = document.getElementById("flip-card");
  if (!card) return;
  isFlipped = !isFlipped;
  card.classList.toggle("flipped", isFlipped);
}

function selectOption(btn, letter) {
  if (btn.classList.contains("correct") || btn.classList.contains("wrong")) return;
  document.querySelectorAll(".option-btn").forEach(function (b) {
    b.classList.remove("selected");
  });
  btn.classList.add("selected");
  selectedOption = letter;

  var verifyBtn = document.getElementById("verify-btn");
  if (verifyBtn) verifyBtn.classList.add("active");
}

function verifyAnswer() {
  if (!selectedOption) return;

  var optMap = { A: "opt-A", B: "opt-B", C: "opt-C", D: "opt-D" };

  document.querySelectorAll(".option-btn").forEach(function (b) {
    b.classList.remove("selected");
  });

  var selectedBtn = document.getElementById(optMap[selectedOption]);
  var correctBtn  = document.getElementById(optMap[correctAnswer]);

  if (selectedOption === correctAnswer) {
    selectedBtn.classList.add("correct");
    selectedBtn.innerHTML += ' <span class="option-check">✓</span>';
    var cc = document.getElementById("correct-count");
    if (cc) cc.textContent = parseInt(cc.textContent) + 1;
  } else {
    selectedBtn.classList.add("wrong");
    selectedBtn.innerHTML += ' <span class="option-check">✕</span>';
    correctBtn.classList.add("correct");
    correctBtn.innerHTML += ' <span class="option-check">✓</span>';
    var wc = document.getElementById("wrong-count");
    if (wc) wc.textContent = parseInt(wc.textContent) + 1;
    // Quitar una vida
    var lives = document.getElementById("lives");
    if (lives && lives.textContent.length > 0) {
      lives.textContent = lives.textContent.slice(0, -2);
    }
  }

  var verifyBtn = document.getElementById("verify-btn");
  if (verifyBtn) {
    verifyBtn.classList.remove("active");
    verifyBtn.textContent = "SIGUIENTE →";
    verifyBtn.onclick = nextQuestion;
  }

  // Voltear si no está volteado
  if (!isFlipped) flipCard();
}

function nextQuestion() {
  // Resetear opciones
  document.querySelectorAll(".option-btn").forEach(function (b) {
    b.classList.remove("correct", "wrong", "selected");
    var check = b.querySelector(".option-check");
    if (check) check.remove();
  });

  var card = document.getElementById("flip-card");
  if (card) card.classList.remove("flipped");
  isFlipped      = false;
  selectedOption = null;

  var verifyBtn = document.getElementById("verify-btn");
  if (verifyBtn) {
    verifyBtn.classList.remove("active");
    verifyBtn.textContent = "VERIFICAR RESPUESTA";
    verifyBtn.onclick = verifyAnswer;
  }

  // Actualizar contador de pregunta (demo: cicla)
  var qLabel   = document.getElementById("question-label");
  var pctLabel = document.getElementById("pct-label");
  var bar      = document.getElementById("prueba-bar");

  if (qLabel) {
    var match = qLabel.textContent.match(/(\d+) de (\d+)/);
    if (match) {
      var current = parseInt(match[1]);
      var total   = parseInt(match[2]);
      current = current < total ? current + 1 : 1;
      qLabel.textContent = "Pregunta " + current + " de " + total;
      var pct = Math.round((current / total) * 100);
      if (pctLabel) pctLabel.textContent = pct + "%";
      if (bar) bar.style.width = pct + "%";
    }
  }
}

// ============================================
// COPIAR CÓDIGO DE SALA
// ============================================
document.querySelectorAll(".copy-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var code = document.querySelector(".code-display");
    if (!code) return;
    var text = code.textContent.replace(/\s+/g, "");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        var orig = btn.innerHTML;
        btn.innerHTML = "✅ ¡Copiado!";
        setTimeout(function () { btn.innerHTML = orig; }, 1500);
      });
    }
  });
});
