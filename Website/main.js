// --- Imports ---
import { CookieGame } from './GameManager.js';
import { Autoclicker } from './Autoclickers.js';
import { Upgrade } from './Upgrades.js';
import * as UI from './UI.js';
import * as Tooltips from './Tooltips.js';
import { PlayerProfile } from './PlayerProfile.js';
import { SaveLoad } from './SaveLoad.js';

// --- Configuratie ---
const autoclickerConfigs = [
    { name: 'cursor', description: 'Auto-clicks once every 10 seconds.', baseCost: 15, baseProduction: 0.1 },
    { name: 'grandma', description: 'A nice grandma to bake more cookies.', baseCost: 100, baseProduction: 1 },
    { name: 'farm', description: 'Grows cookie plants from cookie seeds.', baseCost: 1100, baseProduction: 8 },
    { name: 'mine', description: 'Mines out cookie dough and chocolate chips.', baseCost: 12000, baseProduction: 47 },
    { name: 'factory', description: 'Produces large quantities of cookies.', baseCost: 130000, baseProduction: 260 },
    { name: 'bank', description: 'Generates cookies from interest.', baseCost: 1400000, baseProduction: 1400 },
    { name: 'temple', description: 'Full of precious, ancient chocolate.', baseCost: 20000000, baseProduction: 7800 },
    { name: 'spaceship', description: 'Brings cookies from the cookie planet.', baseCost: 330000000, baseProduction: 44000 },
];

const upgradeConfigs = [
    { name: 'cursor-upgrade', displayName: 'Cursor Booster', description: 'Boosts cursor clicking power', baseCost: 100, target: 'cursor', productionBoost: 2 },
    { name: 'grandma-upgrade', displayName: 'Grandma Power', description: 'Grandmas bake faster', baseCost: 1000, target: 'grandma', productionBoost: 2 },
    { name: 'farm-upgrade', displayName: 'Super Gro', description: 'Farms grow better crops', baseCost: 5000, target: 'farm', productionBoost: 2 },
    { name: 'mine-upgrade', displayName: 'Deep Dig', description: 'Mines dig deeper', baseCost: 20000, target: 'mine', productionBoost: 2 },
    { name: 'factory-upgrade', displayName: 'Automation', description: 'Factories more efficient', baseCost: 100000, target: 'factory', productionBoost: 2 },
    { name: 'bank-upgrade', displayName: 'Smart Investment', description: 'Banks invest better', baseCost: 400000, target: 'bank', productionBoost: 2 },
    { name: 'temple-upgrade', displayName: 'Ancient Blessing', description: 'Temples are more blessed', baseCost: 2000000, target: 'temple', productionBoost: 2 },
    { name: 'spaceship-upgrade', displayName: 'Warp Drive', description: 'Spaceships travel faster', baseCost: 10000000, target: 'spaceship', productionBoost: 2 },
];

// --- Objecten aanmaken ---
export const autoclickers = autoclickerConfigs.map(cfg => new Autoclicker(cfg.name, cfg.description, cfg.baseCost, cfg.baseProduction));
export const upgrades = upgradeConfigs.map(cfg => new Upgrade(cfg.name, cfg.displayName, cfg.description, cfg.baseCost, cfg.target, cfg.productionBoost));

// SaveLoad en PlayerProfile objecten aanmaken
const saveLoad = new SaveLoad();
const playerProfile = new PlayerProfile();

// Centraal game-object aanmaken (OOP)
export const game = new CookieGame(autoclickers, upgrades, () => UI.updateDisplay(autoclickers, upgrades));

export function findAutoclickerByName(name) {
    return autoclickers.find(ac => ac.name === name);
}

// --- Autoload game-state ---
const loadedState = saveLoad.load();
if (loadedState) {
    if (loadedState.cookies !== undefined) game.setCookies(loadedState.cookies);
     if (loadedState.cps !== undefined) game.cookiesPerSecond = loadedState.cps; 
    loadedState.autoclickers.forEach(savedAC => {
        const ac = autoclickers.find(a => a.name === savedAC.name);
        if (ac) {
            ac.owned = savedAC.owned;
            ac.baseProduction = savedAC.baseProduction;
            ac.baseCost = savedAC.baseCost;
        }
    });
    loadedState.upgrades.forEach(savedUpg => {
        const upg = upgrades.find(u => u.name === savedUpg.name);
        if (upg) upg.owned = savedUpg.owned;
    });
    if (loadedState.profile) {
        playerProfile.setProfileData(loadedState.profile);
    }
}
UI.updateDisplay(autoclickers, upgrades);

// --- Event listeners voor save en restart ---
document.getElementById('save-btn').addEventListener('click', () => {
    saveLoad.save(game, playerProfile);
    alert('The game is saved!');
     startAutosave();
});
document.getElementById('restart-btn').addEventListener('click', () => {
    if (window.confirm('Are you sure you want to restart? You will lose all your progress!')) {
        stopAutosave();
        saveLoad.reset();
    }
});

// --- Autosave setup ---
// --- Autosave setup ---
let autosaveInterval = null;
function startAutosave() {
    if (autosaveInterval) return;
    autosaveInterval = setInterval(() => {
        saveLoad.save(game, playerProfile);
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    }, 100);
}
function stopAutosave() {
    if (autosaveInterval) {
        clearInterval(autosaveInterval);
        autosaveInterval = null;
    }
}
game.startGameLoop();

// Voeg event listeners en UI-updates toe aan autoclickers (na game-object!)
autoclickers.forEach(ac => {
    if (ac.buttonElement) {
        ac.buttonElement.addEventListener('click', () => ac.handleBuy());
        ac.updateUI();
    }
});

// Voeg event listeners en UI-updates toe aan upgrades (na game-object!)
upgrades.forEach(upg => {
    if (upg.buttonElement) {
        upg.buttonElement.addEventListener('click', () => upg.handleBuy(findAutoclickerByName));
        upg.updateUI(findAutoclickerByName);
    }
});

// --- THEME OPSLAAN EN LADEN ---
function setTheme(isDark) {
    if (isDark) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    }
}

// Theme laden bij start
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
}

// Theme-knop event (na DOM is geladen)
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('theme-btn').addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark-theme');
        setTheme(isDark);
    });
});

// --- Start de Game ---
function init() {

    UI.initializeEventListeners(autoclickers, upgrades, findAutoclickerByName);
    Tooltips.initializeTooltips([...autoclickers, ...upgrades]);
    UI.updateDisplay(autoclickers, upgrades);
    console.log('Core game initialized (registry inline)');
}

init();
startAutosave();