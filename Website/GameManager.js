
// Centrale Game class: beheert alle state en logica
export class CookieGame {
    constructor(autoclickers = [], upgrades = [], uiUpdater = () => {}) {
        this.cookies = 0;
        this.cookiesPerSecond = 0;
        this.autoclickers = autoclickers;
        this.upgrades = upgrades;
        this.uiUpdater = uiUpdater;
        this.gameLoopInterval = null;
    }

    // Geeft het huidige aantal cookies terug 
    getCookies() {
        return this.cookies;
    }

    // Geeft de huidige cookies per seconde terug
    getCps() {
        return this.cookiesPerSecond;
    }

    // Controleert of er genoeg cookies zijn voor een aankoop
    canAfford(cost) {
        return this.cookies >= cost;
    }

    // Verlaagt het aantal cookies met een bepaald bedrag
    spendCookies(amount) {
        if (this.canAfford(amount)) {
            this.cookies -= amount;
        }
    }

    // Verhoogt het aantal cookies met een bepaald bedrag (voor handmatige clicks)
    addCookies(amount) {
        this.cookies += amount;
    }

    // Stelt het aantal cookies direct in (voor laden van een spel)
    setCookies(amount) {
        this.cookies = amount;
    }

    // Herrekent de totale CPS op basis van alle gekochte autoclickers
    recalculateCps() {
        let totalCps = 0;
        this.autoclickers.forEach(ac => {
            totalCps += ac.calculateProduction();
        });
        this.cookiesPerSecond = totalCps;
    }

    // Vindt een autoclicker-object op basis van naam
    findAutoclickerByName(name) {
        return this.autoclickers.find(ac => ac.name === name);
    }

    // Game loop: wordt periodiek uitgevoerd
    gameStep() {
        this.addCookies(this.cookiesPerSecond / 10); // 10x per seconde
        this.uiUpdater();
    }

    // Start de game loop
    startGameLoop() {
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
        }
        this.gameLoopInterval = setInterval(() => this.gameStep(), 100);
    }

    // Stop de game loop
    stopGameLoop() {
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
        }
    }

        
    
}