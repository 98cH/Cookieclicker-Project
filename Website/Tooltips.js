
const tooltipElement = document.getElementById('game-tooltip');
let currentTooltipClasses = [];
let tooltipInterval = null;

// Update de inhoud van de tooltip op basis van het item (autoclicker/upgrade)
function updateTooltipContent(item) {
    if (!tooltipElement) return;

    const cost = item.getCost();
    const name = item.displayName || item.name;
    const flavorText = item.description;

    let content = `<strong>${name}</strong>`;
    if (flavorText) content += `<br><small>"${flavorText}"</small>`;
    content += `<hr>Cost: ${cost.toLocaleString()}`;

    // Toon extra info afhankelijk van het type
    if (item.type === 'autoclicker') {
        const totalProduction = item.owned * item.baseProduction;
        content += `<br>Owned: ${item.owned}`;
        content += `<br>Each produces: ${item.baseProduction.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} cps`;
        content += `<br>Total production: ${totalProduction.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} cps`;
    } 
    else if (item.type === 'upgrade') {
        const targetName = item.target.charAt(0).toUpperCase() + item.target.slice(1);
        let effectText = `Doubles the production of ${targetName}s.`;
        if (item.productionBoost !== 2) {
            effectText = `Multiplies the production of ${targetName}s by ${item.productionBoost}.`;
        }
        content += `<br>${effectText}`;
    }

    tooltipElement.innerHTML = content;
}

// Zet de positie van de tooltip bij de juiste knop
function setTooltipPosition(item) {
    if (!tooltipElement || !item.buttonElement) return;
    
    const rect = item.buttonElement.getBoundingClientRect();
    tooltipElement.style.top = `${rect.bottom + 5}px`; // Position below the button
    tooltipElement.style.left = `${rect.left + rect.width / 2}px`; // Center horizontally
    tooltipElement.style.transform = 'translateX(-50%)';

    tooltipElement.classList.remove(...currentTooltipClasses);
    currentTooltipClasses = [];
    
    let newClass = '';
    if (item.type === 'autoclicker') {
        newClass = 'autoclicker-tooltip-right';
    } else if (item.type === 'upgrade') {
        newClass = 'upgrade-tooltip-below';
    }

    if (newClass) {
        tooltipElement.classList.add(newClass);
        currentTooltipClasses.push(newClass);
    }
}

// Toont de tooltip bij een item
function showTooltip(item) {
    if (!tooltipElement) return;
    clearInterval(tooltipInterval);
    setTooltipPosition(item);
    tooltipElement.style.visibility = 'visible';
    tooltipElement.style.opacity = '1';
    updateTooltipContent(item);
    tooltipInterval = setInterval(() => updateTooltipContent(item), 100);
}

// Verbergt de tooltip
function hideTooltip() {
    if (tooltipElement) {
        clearInterval(tooltipInterval);
        tooltipInterval = null;
        tooltipElement.style.visibility = 'hidden';
        tooltipElement.style.opacity = '0';
        tooltipElement.classList.remove(...currentTooltipClasses);
        currentTooltipClasses = [];
    }
}

// Koppelt mouseenter/mouseleave events aan alle knoppen van autoclickers/upgrades
export function initializeTooltips(items) {
    items.forEach(item => {
        if (item.buttonElement) {
            item.buttonElement.addEventListener('mouseenter', () => showTooltip(item));
            item.buttonElement.addEventListener('mouseleave', hideTooltip);
        }
    });
}