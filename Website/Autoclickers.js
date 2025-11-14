import { game } from './main.js';

// Autoclicker class: één object per autoclicker-type
export class Autoclicker {
    constructor(name, description, baseCost, baseProduction) {
        this.name = name;
        this.type = 'autoclicker';
        this.description = description; 
        this.baseCost = baseCost;
        this.baseProduction = baseProduction;
        this.owned = 0;
        // Koppelt het juiste button-element uit de HTML aan dit object
        this.buttonElement = document.getElementById(this.name);


    }

    // Berekent de prijs voor de volgende aankoop (stijgt exponentieel)
    getCost() {
        return Math.ceil(this.baseCost * Math.pow(1.15, this.owned));
    }

    // Berekent de totale productie van deze autoclicker
    calculateProduction() {
        return this.owned * this.baseProduction;
    }

    // Controleert of je genoeg cookies hebt om te kopen
    canBuy() {
        return game.canAfford(this.getCost());
    }

    // Wordt aangeroepen als de knop wordt geklikt
    handleBuy() {
        if (this.buy()) {
            this.updateUI();
            game.recalculateCps();
        }
    }

    // Probeert een autoclicker te kopen; geeft true terug als het lukt
    buy() {
        const cost = this.getCost();
        if (game.canAfford(cost)) {
            game.spendCookies(cost);
            this.owned++;
            return true; // Aankoop gelukt
        }
        return false; // Aankoop mislukt
    }
    
    // Past een upgrade toe op deze autoclicker (verhoogt productie)
    applyUpgrade(boost) {
        this.baseProduction *= boost;
        this.updateUI();
    }

    // Update de knop: tekst en disabled-state
     updateUI() {
        if (!this.buttonElement) return;
        if (this.canBuy()) {
            this.buttonElement.classList.remove('disabled');
        } else {
            this.buttonElement.classList.add('disabled');
        }
    }
}