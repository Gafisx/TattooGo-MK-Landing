(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  const modal = document.querySelector("#interest-modal");
  const dialog = modal.querySelector(".interest-dialog");
  const audienceCopy = modal.querySelector(".dialog-audience");
  const closeButton = modal.querySelector(".modal-close");
  const doneButton = modal.querySelector(".modal-done");
  let lastFocused = null;

  const interestMessages = {
    cliente: "Para quem está pensando em fazer uma tattoo: a proposta é descobrir estilos, conhecer o trabalho de artistas independentes e começar uma conversa com mais confiança.",
    artista: "Para tatuadores independentes: a proposta é dar espaço ao seu portfólio e aproximar sua arte de pessoas que procuram um trabalho com a sua linguagem."
  };

  function closeMenu() {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu");
    nav.classList.remove("is-open");
  }

  menuButton.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!expanded));
    menuButton.setAttribute("aria-label", expanded ? "Abrir menu" : "Fechar menu");
    nav.classList.toggle("is-open", !expanded);
  });

  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (!modal.hidden) closeModal();
      closeMenu();
    }
  });
  document.addEventListener("click", event => {
    if (nav.classList.contains("is-open") && !nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });

  function openModal(type, trigger) {
    lastFocused = trigger;
    audienceCopy.textContent = interestMessages[type] || interestMessages.cliente;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    closeButton.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll("[data-interest]").forEach(button => {
    button.addEventListener("click", () => {
      closeMenu();
      openModal(button.dataset.interest, button);
    });
  });
  closeButton.addEventListener("click", closeModal);
  doneButton.addEventListener("click", closeModal);
  modal.addEventListener("click", event => {
    if (event.target === modal) closeModal();
  });
  dialog.addEventListener("keydown", event => {
    if (event.key !== "Tab") return;
    const focusable = [...dialog.querySelectorAll("button, a[href], [tabindex]:not([tabindex='-1'])")].filter(item => !item.disabled);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();
