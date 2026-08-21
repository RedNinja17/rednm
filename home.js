document.addEventListener("DOMContentLoaded", () => {
  const dock = document.getElementById("dock");
  const dockBtn = document.getElementById("dock-btn");

  dockBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    dock.classList.toggle("expanded");
  });

  document.addEventListener("click", (e) => {
    if (dock && !dock.contains(e.target)) {
      dock.classList.remove("expanded");
    }
  });
});