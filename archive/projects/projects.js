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

    const filterContainer = document.getElementById('filterContainer');
    const projectCards = document.querySelectorAll('.project');
    const projectGrid = document.getElementById('grid')

    const techDisplayNames = {
        'cpp': 'C++',
        'fusion': 'Fusion 360',
        'web': 'HTML / CSS',
        'python': 'Python',
        'unity': 'Unity'
    };

    const uniqueTechs = new Set();
    projectCards.forEach(card => {
        const techAttr = card.getAttribute('data');
        if (techAttr) {
            techAttr.split(' ').forEach(tech => {
                const trimmed = tech.trim();
                if (trimmed) uniqueTechs.add(trimmed);
            });
        }
    });

    uniqueTechs.forEach(tech => {
        const btn = document.createElement('button');
        btn.classList.add('filter-btn');
        btn.setAttribute('filter', tech);
        btn.textContent = techDisplayNames[tech] || tech;
        filterContainer.appendChild(btn);
    });

    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('filter');

            projectGrid.classList.add('hidden');

            projectCards.forEach(card => {
                const cardTechAttr = card.getAttribute('data') || '';
                const cardTechs = cardTechAttr.split(' ');

                if (filterValue === 'all' || cardTechs.includes(filterValue)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });

            projectGrid.classList.remove('hidden');
        });
    });
});