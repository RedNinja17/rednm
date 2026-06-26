document.addEventListener('DOMContentLoaded', () => {
    const dockTrigger = document.getElementById('dockTrigger');
    const actionDock = document.getElementById('actionDock');

    if (dockTrigger && actionDock) {
        dockTrigger.addEventListener('click', () => {
            actionDock.classList.toggle('expanded');
        });

        document.addEventListener('click', (e) => {
            if (!actionDock.contains(e.target)) {
                actionDock.classList.remove('expanded');
            }
        });
    }

    const filterContainer = document.getElementById('filterContainer');
    const projectCards = document.querySelectorAll('.project-card');

    const techDisplayNames = {
        'cpp': 'C++',
        'fusion': 'Fusion 360',
        'web': 'HTML / CSS',
        'python': 'Python',
        'unity': 'Unity'
    };

    const uniqueTechs = new Set();
    projectCards.forEach(card => {
        const techAttr = card.getAttribute('data-tech');
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
        btn.setAttribute('data-filter', tech);
        btn.textContent = techDisplayNames[tech] || tech;
        filterContainer.appendChild(btn);
    });

    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            projectCards.forEach(card => {
                const cardTechAttr = card.getAttribute('data-tech') || '';
                const cardTechs = cardTechAttr.split(' ');

                if (filterValue === 'all' || cardTechs.includes(filterValue)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
});