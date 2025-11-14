import { game } from './main.js';

// Upgrade class: één object per upgrade-type
export class Upgrade {
    constructor(name, displayName, description, baseCost, target, productionBoost) {
        this.name = name;
        this.type = 'upgrade';
        this.displayName = displayName;
        this.description = description;
        this.baseCost = baseCost;
        this.target = target; 
        this.productionBoost = productionBoost;
        this.owned = 0; 
        // Koppelt het juiste button-element uit de HTML aan dit object
        this.buttonElement = document.getElementById(this.name);
    }

    getCost() {
        // Prijs stijgt exponentieel per aankoop
        return Math.ceil(this.baseCost * Math.pow(1.15, this.owned));
    }

    canBuy(targetAutoclicker) {
        return (
            targetAutoclicker &&
            targetAutoclicker.owned > 0 &&
            game.canAfford(this.getCost())
        );
    }

    handleBuy(findAutoclickerByName) {
        const targetAutoclicker = findAutoclickerByName(this.target);
        if (this.buy(targetAutoclicker)) {
            this.updateUI(findAutoclickerByName);
        }
    }

    buy(targetAutoclicker) {
        const cost = this.getCost();
        if (this.canBuy(targetAutoclicker)) {
            game.spendCookies(cost);
            this.owned++;
            this.applyEffect(targetAutoclicker);
            return true;
        }
        return false;
    }

    applyEffect(targetAutoclicker) {
        if (targetAutoclicker) {
            targetAutoclicker.applyUpgrade(this.productionBoost);
            game.recalculateCps();
        }
    }

    // Update alleen de disabled-state van de knop
    updateUI(findAutoclickerByName) {
        if (!this.buttonElement) return;
        const targetAutoclicker = findAutoclickerByName(this.target);
        if (!this.canBuy(targetAutoclicker)) {
            this.buttonElement.classList.add('disabled');
        } else {
            this.buttonElement.classList.remove('disabled');
        }
    }
}