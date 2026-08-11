document.addEventListener("DOMContentLoaded", () => {
  const dock = document.getElementById("dock");
  const dockBtn = document.getElementById("dock-btn");
  const settingsBtn = document.getElementById("settings-btn");
  const settingsPopup = document.getElementById("settings-pop-up");

  dockBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    dock.classList.toggle("expanded");
  });

  document.addEventListener("click", (e) => {
    if (dock && !dock.contains(e.target)) {
      dock.classList.remove("expanded");
    }
  });

  settingsBtn?.addEventListener("click", () => settingsPopup?.classList.add("active"));

  settingsPopup?.addEventListener("click", (e) => {
    if (e.target === settingsPopup) {
      settingsPopup.classList.remove("active");
    }
  });
});