import { game } from './main.js';

// Formatteert getallen netjes met duizendtallen en decimalen
function formatNumber(num, decimals = 0) {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    const factor = Math.pow(10, decimals);
    const value = Math.round(num * factor) / factor;
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

// Animatie bij succesvolle aankoop
function animatePurchase(buttonElement) {
    if (!buttonElement) return;
    buttonElement.classList.add('purchase-success');
    setTimeout(() => buttonElement.classList.remove('purchase-success'), 500);
}

// Animatie bij cookie-click
function animateCookieClick() {
    const el = document.querySelector('.cookie');
    if (!el) return;
    el.classList.add('cookie-click');
    setTimeout(() => el.classList.remove('cookie-click'), 220);
}

// Update de enabled/disabled state van alle knoppen
function updateButtonStates(items) {
    items.forEach(item => {
        if (item.buttonElement) {
            const cost = item.getCost();
            const canAfford = game.canAfford(cost);
            let isDisabled = !canAfford;

            // Upgrades zijn altijd disabled als ze gekocht zijn
            if (item.type === 'upgrade' && item.purchased) {
                isDisabled = true;
            }
            item.buttonElement.classList.toggle('disabled', isDisabled);
        }
    });
}

// Update alle UI-elementen (score, CPS, knoppen)
export function updateDisplay(autoclickers, upgrades) {
    const scoreElement = document.getElementById('cookie-count');
    const cpsElement = document.getElementById('cookies-per-second');
    const cookiesVal = game.getCookies();
    const cpsVal = game.getCps();

    if (scoreElement) scoreElement.textContent = formatNumber(Math.floor(cookiesVal));
    if (cpsElement) cpsElement.textContent = formatNumber(cpsVal, 1);
    updateButtonStates([...autoclickers, ...upgrades]);
    document.title = `${formatNumber(Math.floor(game.getCookies()))} cookies - Cookie Clicker`;
}

// Initialiseert event listeners voor cookie, autoclickers en upgrades
export function initializeEventListeners(autoclickers, upgrades, findAutoclickerByName) {
    const cookieElement = document.querySelector('.cookie');
    if (cookieElement) {
        cookieElement.addEventListener('click', () => {
            game.addCookies(1);
            animateCookieClick();
            updateDisplay(autoclickers, upgrades);
        });
    }

    autoclickers.forEach(autoclicker => {
        if (autoclicker.buttonElement) {
            autoclicker.buttonElement.addEventListener('click', () => {
                if (autoclicker.buy()) {
                    animatePurchase(autoclicker.buttonElement);
                    updateDisplay(autoclickers, upgrades);
                }
            });
        }
    });

    upgrades.forEach(upgrade => {
        if (upgrade.buttonElement) {
            upgrade.buttonElement.addEventListener('click', () => {
                if (upgrade.buy(findAutoclickerByName)) {
                    animatePurchase(upgrade.buttonElement);
                    updateDisplay(autoclickers, upgrades);
                }
            });
        }
    });
}