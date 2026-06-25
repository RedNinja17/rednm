window.addEventListener("load", () => {
    initVirtualScroll();
});

function initVirtualScroll() {
    const scrollArea = document.querySelector(".project-scroll");
    const panels = Array.from(document.querySelectorAll(".project-panel"));
    const iconList = document.querySelector(".icon-list");
    const projectCount = panels.length;
    if (projectCount === 0) return;

    iconList.innerHTML = "";
    const letters = panels.map((_, i) => String.fromCharCode(65 + i));

    for (let i = 0; i < 3; i++) {
        letters.forEach((letter, index) => {
            const div = document.createElement("div");
            div.classList.add("icon");
            div.textContent = letter;
            div.dataset.index = index;
            iconList.appendChild(div);
        });
    }

    const icons = Array.from(iconList.querySelectorAll(".icon"));

    let targetIndex = 0;
    let currentIndex = 0;
    let isDragging = false;
    let startY = 0;

    function updateElements() {
        panels.forEach((panel, index) => {
            let diff = index - (currentIndex % projectCount);

            if (diff > projectCount / 2) {
                diff -= projectCount;
            } else if (diff < -projectCount / 2) {
                diff += projectCount;
            }

            const absDiff = Math.abs(diff);

            const targetY = diff * 550;
            panel.style.transform = `translateY(${targetY}px)`;

            if (absDiff < 0.5) {
                panel.classList.add("active-panel");
                panel.style.opacity = Math.max(0, 1 - absDiff * 2);
            } else {
                panel.classList.remove("active-panel");
                panel.style.opacity = "0";
            }
        });

        const radiusX = 45;
        const radiusY = 175;
        const angleStep = 26;
        const totalIcons = projectCount * 3;
        const centerProgressIndex = projectCount + (currentIndex % projectCount);

        icons.forEach((icon, index) => {
            let diff = index - centerProgressIndex;

            diff = ((diff + totalIcons * 1.5) % totalIcons) - totalIcons * 0.5;

            const absDiff = Math.abs(diff);

            if (absDiff > 3.5) {
                icon.style.opacity = "0";
                icon.style.transform = "translate(-50%, -50%) scale(0)";
                icon.classList.remove("active");
                return;
            }

            const angle = diff * angleStep;
            const rad = angle * Math.PI / 180;

            const x = Math.cos(rad) * radiusX;
            const y = Math.sin(rad) * radiusY;

            const fade = Math.max(0, 1 - (absDiff / 3.5));
            const scale = Math.max(0.4, 1.25 - (absDiff * 0.22));

            icon.style.opacity = fade;
            icon.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;

            if (absDiff < 0.5) {
                icon.classList.add("active");
            } else {
                icon.classList.remove("active");
            }
        });
    }

    function animate() {
        if (!isDragging) {
            currentIndex += (targetIndex - currentIndex) * 0.1;
            if (Math.abs(targetIndex - currentIndex) < 0.001) {
                currentIndex = targetIndex;
            }
        } else {
            currentIndex += (targetIndex - currentIndex) * 0.3;
        }

        updateElements();
        requestAnimationFrame(animate);
    }

    let wheelTimeout = null;
    window.addEventListener("wheel", (e) => {
        if (!e.target.closest(".project-viewer")) return;
        e.preventDefault();

        targetIndex += e.deltaY * 0.003;

        if (wheelTimeout) clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
            if (!isDragging) {
                targetIndex = Math.round(targetIndex);
            }
        }, 150);
    }, { passive: false });

    scrollArea.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".project-link")) return;
        isDragging = true;
        startY = e.clientY;
        scrollArea.setPointerCapture(e.pointerId);
    });

    scrollArea.addEventListener("pointermove", (e) => {
        if (!isDragging) return;
        const deltaY = e.clientY - startY;
        startY = e.clientY;

        targetIndex -= deltaY * 0.007;
    });

    const endDrag = (e) => {
        if (!isDragging) return;
        isDragging = false;
        targetIndex = Math.round(targetIndex);
    };

    scrollArea.addEventListener("pointerup", endDrag);
    scrollArea.addEventListener("pointercancel", endDrag);

    icons.forEach((icon, i) => {
        icon.addEventListener("click", () => {
            const targetBase = parseInt(icon.dataset.index, 10);
            const currentActiveBase = ((Math.round(targetIndex) % projectCount) + projectCount) % projectCount;

            let diff = targetBase - currentActiveBase;
            if (diff > projectCount / 2) diff -= projectCount;
            if (diff < -projectCount / 2) diff += projectCount;

            targetIndex += diff;
        });
    });

    updateElements();
    requestAnimationFrame(animate);
}