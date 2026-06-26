const wrapper = document.getElementById('timelineWrapper');
const progress = document.getElementById('timelineProgress');
const nodes = document.querySelectorAll('.node');
const sections = document.querySelectorAll('.section');
const hoverLabel = document.getElementById('timelineHoverLabel');

let isDragging = false;

function updateTimeline() {
    const scrollPos = window.scrollY;
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = totalScroll > 0 ? (scrollPos / totalScroll) * 100 : 0;

    progress.style.height = `${percentage}%`;

    let currentSectionIndex = -1;
    sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 180) {
            currentSectionIndex = index;
        }
    });

    nodes.forEach((node, index) => {
        if (index === currentSectionIndex) {
            node.classList.add('active');
            node.classList.remove('passed');
        } else if (index < currentSectionIndex) {
            node.classList.add('passed');
            node.classList.remove('active');
        } else {
            node.classList.remove('active', 'passed');
        }
    });
}

function handleTimelineInteraction(e) {
    const rect = wrapper.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, clickY / rect.height));

    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;

    window.scrollTo({
        top: percentage * totalScroll,
        behavior: isDragging ? 'auto' : 'smooth'
    });
}

wrapper.addEventListener('mousedown', (e) => {
    isDragging = true;
    handleTimelineInteraction(e);
});

window.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const hoverY = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, hoverY / rect.height));

    hoverLabel.style.top = `${hoverY}px`;

    const segmentCount = sections.length;
    let activeSegmentIndex = Math.floor(percentage * segmentCount);
    if (activeSegmentIndex >= segmentCount) activeSegmentIndex = segmentCount - 1;
    if (activeSegmentIndex < 0) activeSegmentIndex = 0;

    const targetSection = sections[activeSegmentIndex];
    if (targetSection) {
        const labelText = targetSection.getAttribute('data-label');
        hoverLabel.innerHTML = labelText || "";
    }

    if (!isDragging) return;
    handleTimelineInteraction(e);
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

nodes.forEach((node) => {
    node.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = node.getAttribute('data-target');
        const targetElement = document.getElementById(id);
        if (targetElement) {
            const elementTop = targetElement.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementTop - 160;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

window.addEventListener('scroll', updateTimeline);
window.addEventListener('resize', updateTimeline);
updateTimeline();