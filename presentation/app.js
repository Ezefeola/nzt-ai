(() => {
  "use strict";

  const slides = [...document.querySelectorAll(".slide")];
  const currentLabel = document.querySelector("#currentSlide");
  const totalLabel = document.querySelector("#totalSlides");
  const progressBar = document.querySelector("#progressBar");
  const sectionLabel = document.querySelector("#sectionLabel");
  const slideTitle = document.querySelector("#slideTitle");
  const notesPanel = document.querySelector("#notesPanel");
  const notesContent = document.querySelector("#notesContent");
  const overview = document.querySelector("#overview");
  const overviewGrid = document.querySelector("#overviewGrid");
  const shortcutsDialog = document.querySelector("#shortcutsDialog");
  const timerButton = document.querySelector("#timerButton");
  const timerText = document.querySelector("#timerText");
  const toast = document.querySelector("#toast");

  const floatingBoxes = document.querySelectorAll(
    ".agenda-item, .failure, .quote-card, .compare-card, .layer-card, .loop-step, .stop-card, .code-card, .phase-rail article, .artifact, .not-card, .proof-grid article, .expectation-grid article, .demo-route li, .prompt-card, .closing-actions > div, .route-line > span"
  );
  floatingBoxes.forEach((box, index) => {
    box.classList.add("floating-box");
    box.style.setProperty("--float-duration", `${7 + (index % 5) * .5}s`);
    box.style.setProperty("--float-delay", `${-(index % 7) * .8}s`);
  });

  let current = initialSlide();
  let timerSeconds = 0;
  let timerId = null;
  let touchStartX = null;
  let toastId = null;

  function initialSlide() {
    const match = location.hash.match(/(?:#\/|#)(\d+)/);
    return match ? Math.max(0, Math.min(slides.length - 1, Number(match[1]) - 1)) : 0;
  }

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function render(index, updateHash = true) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === current));

    const slide = slides[current];
    currentLabel.textContent = pad(current + 1);
    totalLabel.textContent = pad(slides.length);
    progressBar.style.width = `${((current + 1) / slides.length) * 100}%`;
    sectionLabel.textContent = (slide.dataset.section || "NZT").toUpperCase();
    slideTitle.textContent = slide.dataset.title || "";
    document.title = `${slide.dataset.title || "NZT"} — NZT`;

    document.querySelector("#prevButton").disabled = current === 0;
    document.querySelector("#nextButton").disabled = current === slides.length - 1;
    syncNotes();
    syncOverview();

    if (updateHash) history.replaceState(null, "", `#/${current + 1}`);
  }

  function go(delta) {
    render(current + delta);
  }

  function syncNotes() {
    const notes = slides[current].querySelector(".speaker-notes");
    notesContent.innerHTML = notes ? notes.innerHTML : "<p>Sin notas para esta diapositiva.</p>";
  }

  function toggleNotes(force) {
    const shouldOpen = typeof force === "boolean" ? force : !notesPanel.classList.contains("is-open");
    notesPanel.classList.toggle("is-open", shouldOpen);
    document.querySelector("#notesButton").setAttribute("aria-pressed", String(shouldOpen));
  }

  function buildOverview() {
    const fragment = document.createDocumentFragment();
    slides.forEach((slide, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "overview-card";
      button.dataset.index = index;
      button.innerHTML = `<span>${pad(index + 1)} · ${(slide.dataset.section || "NZT").toUpperCase()}</span><strong>${slide.dataset.title || "Sin título"}</strong><small>${slide.dataset.minutes || "—"} min</small>`;
      button.addEventListener("click", () => {
        render(index);
        toggleOverview(false);
      });
      fragment.appendChild(button);
    });
    overviewGrid.appendChild(fragment);
  }

  function syncOverview() {
    [...overviewGrid.children].forEach((card, index) => card.classList.toggle("is-current", index === current));
  }

  function toggleOverview(force) {
    const shouldOpen = typeof force === "boolean" ? force : !overview.classList.contains("is-open");
    overview.classList.toggle("is-open", shouldOpen);
    overview.setAttribute("aria-hidden", String(!shouldOpen));
    if (shouldOpen) overviewGrid.querySelector(".is-current")?.focus();
  }

  function toggleTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
      timerButton.classList.remove("is-running");
      return;
    }
    timerButton.classList.add("is-running");
    timerId = setInterval(() => {
      timerSeconds += 1;
      const minutes = Math.floor(timerSeconds / 60);
      const seconds = timerSeconds % 60;
      timerText.textContent = `${pad(minutes)}:${pad(seconds)}`;
      timerButton.classList.toggle("is-over", minutes >= 55);
    }, 1000);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text.trim());
    } catch {
      const field = document.createElement("textarea");
      field.value = text.trim();
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    showToast("Prompt copiado");
  }

  function showToast(message) {
    clearTimeout(toastId);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastId = setTimeout(() => toast.classList.remove("is-visible"), 1400);
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      showToast("Pantalla completa no disponible");
    }
  }

  function isTypingTarget(target) {
    return target instanceof HTMLElement && (target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName));
  }

  document.querySelector("#prevButton").addEventListener("click", () => go(-1));
  document.querySelector("#nextButton").addEventListener("click", () => go(1));
  document.querySelector("#notesButton").addEventListener("click", () => toggleNotes());
  document.querySelector("#closeNotes").addEventListener("click", () => toggleNotes(false));
  document.querySelector("#overviewButton").addEventListener("click", () => toggleOverview());
  document.querySelector("#closeOverview").addEventListener("click", () => toggleOverview(false));
  document.querySelector("#fullscreenButton").addEventListener("click", toggleFullscreen);
  document.querySelector("#motionButton").addEventListener("click", event => {
    const paused = document.body.classList.toggle("motion-paused");
    const label = paused ? "Reanudar animaciones ambientales" : "Pausar animaciones ambientales";
    event.currentTarget.setAttribute("aria-pressed", String(paused));
    event.currentTarget.setAttribute("aria-label", label);
    event.currentTarget.title = label;
    event.currentTarget.textContent = paused ? "▷" : "Ⅱ";
  });
  document.querySelector("#capabilityMotion").addEventListener("click", event => {
    const paused = document.querySelector("#capabilityMap").classList.toggle("is-paused");
    event.currentTarget.setAttribute("aria-pressed", String(paused));
    event.currentTarget.textContent = paused ? "Reanudar movimiento" : "Pausar movimiento";
  });
  timerButton.addEventListener("click", toggleTimer);
  shortcutsDialog.querySelector(".dialog-close").addEventListener("click", () => shortcutsDialog.close());

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-copy], [data-copy-target]");
    if (!button) return;
    const direct = button.dataset.copy;
    const target = button.dataset.copyTarget ? document.getElementById(button.dataset.copyTarget) : null;
    copyText(direct || target?.textContent || "");
  });

  document.addEventListener("keydown", event => {
    if (isTypingTarget(event.target)) return;
    if (shortcutsDialog.open && event.key !== "Escape") return;
    if (overview.classList.contains("is-open") && event.key === "Escape") return toggleOverview(false);

    const key = event.key.toLowerCase();
    if (["arrowright", "pagedown", " "].includes(key)) { event.preventDefault(); go(1); }
    else if (["arrowleft", "pageup"].includes(key)) { event.preventDefault(); go(-1); }
    else if (key === "home") render(0);
    else if (key === "end") render(slides.length - 1);
    else if (key === "o") toggleOverview();
    else if (key === "s") toggleNotes();
    else if (key === "f") toggleFullscreen();
    else if (key === "t") toggleTimer();
    else if (key === "?") shortcutsDialog.showModal();
    else if (key === "escape") { toggleNotes(false); toggleOverview(false); }
  });

  document.addEventListener("touchstart", event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  document.addEventListener("touchend", event => {
    if (touchStartX === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 55) go(distance < 0 ? 1 : -1);
    touchStartX = null;
  }, { passive: true });

  window.addEventListener("hashchange", () => render(initialSlide(), false));

  buildOverview();
  render(current, false);
})();
