class Player {
    constructor() {
        this.cookies = 0;
        this.totalClicks = 0;
        this.cookiesPerSecond = 0;
        this.autoclickers = {};
        this.upgrades = {};
        
        this.totalCookiesEarned = 0;
        this.moneySpent = 0;
        this.bestCookiesPerSecond = 0;
        this.gameStartTime = Date.now();
        

        
        this.initializeAutoclickers();
        this.initializeUpgrades();
    }
    
    initializeAutoclickers() {
        const autoclickerTypes = ['cursor', 'grandma', 'farm', 'mine', 'factory', 'bank', 'temple', 'spaceship'];
        autoclickerTypes.forEach(type => {
            this.autoclickers[type] = {
                owned: 0,
                baseCost: this.getBaseCost(type),
                baseProduction: this.getBaseProduction(type)
            };
        });
    }
    
    initializeUpgrades() {
        const upgradeTypes = ['cursor-upgrade', 'grandma-upgrade', 'farm-upgrade', 'mine-upgrade', 'factory-upgrade', 'bank-upgrade', 'temple-upgrade', 'spaceship-upgrade'];
        upgradeTypes.forEach(type => {
            this.upgrades[type] = {
                owned: 0,
                baseCost: this.getUpgradeBaseCost(type),
                targetAutoclicker: this.getUpgradeTarget(type),
                multiplier: this.getUpgradeMultiplier(type)
            };
        });
    }
    
    getBaseCost(type) {
        const costs = {
            cursor: 15,
            grandma: 100,
            farm: 1100,
            mine: 12000,
            factory: 130000,
            bank: 1400000,
            temple: 20000000,
            spaceship: 330000000
        };
        return costs[type] || 15;
    }
    
    getBaseProduction(type) {
        const production = {
            cursor: 0.1,
            grandma: 1,
            farm: 8,
            mine: 47,
            factory: 260,
            bank: 1400,
            temple: 7800,
            spaceship: 44000
        };
        return production[type] || 0.1;
    }
    
    getUpgradeBaseCost(type) {
        const costs = {
            'cursor-upgrade': 100,
            'grandma-upgrade': 1000,
            'farm-upgrade': 11000,
            'mine-upgrade': 120000,
            'factory-upgrade': 1300000,
            'bank-upgrade': 14000000,
            'temple-upgrade': 200000000,
            'spaceship-upgrade': 3300000000
        };
        return costs[type] || 100;
    }
    
    getUpgradeTarget(type) {
        const targets = {
            'cursor-upgrade': 'cursor',
            'grandma-upgrade': 'grandma',
            'farm-upgrade': 'farm',
            'mine-upgrade': 'mine',
            'factory-upgrade': 'factory',
            'bank-upgrade': 'bank',
            'temple-upgrade': 'temple',
            'spaceship-upgrade': 'spaceship'
        };
        return targets[type];
    }
    
    getUpgradeMultiplier(type) {
        return 2.0;
    }
    
    addCookies(amount = 1, isManualClick = true) {
        this.cookies += amount;
        this.totalCookiesEarned += amount;
        if (isManualClick) {
            this.totalClicks++;
        }
    }
    
    getUpgradeCost(type) {
        const base = this.upgrades[type].baseCost;
        const owned = this.upgrades[type].owned;
        return Math.ceil(base * Math.pow(1.15, owned) * (owned + 1));
    }
    
    buyUpgrade(type) {
        if (!this.upgrades[type]) {
            return false;
        }
        
        const cost = this.getUpgradeCost(type);
        
        if (this.cookies >= cost) {
            this.cookies -= cost;
            this.moneySpent += cost;
            this.upgrades[type].owned++;
            this.applyUpgradeEffect(type);
            return true;
        }
        
        return false;
    }
    
    applyUpgradeEffect(type) {
        const upgrade = this.upgrades[type];
        const targetAutoclicker = upgrade.targetAutoclicker;
        const multiplier = upgrade.multiplier;
        
        if (this.autoclickers[targetAutoclicker]) {
            this.autoclickers[targetAutoclicker].baseProduction *= multiplier;
            this.updateCookiesPerSecond();
        }
    }
    
    getAutoclickerCost(type) {
        const base = this.autoclickers[type].baseCost;
        const owned = this.autoclickers[type].owned;
        return Math.ceil(base * Math.pow(1.15, owned));
    }
    
    buyAutoclicker(type) {
        if (!this.autoclickers[type]) {
            return false;
        }
        
        const cost = this.getAutoclickerCost(type);
        
        if (this.cookies >= cost) {
            this.cookies -= cost;
            this.moneySpent += cost;
            this.autoclickers[type].owned++;
            this.updateCookiesPerSecond();
            return true;
        }
        
        return false;
    }
    
    updateCookiesPerSecond() {
        this.cookiesPerSecond = 0;
        
        // Bereken basis CPS van alle autoclickers
        for (let type in this.autoclickers) {
            const owned = this.autoclickers[type].owned;
            const production = this.autoclickers[type].baseProduction;
            this.cookiesPerSecond += owned * production;
        }
        
        if (this.cookiesPerSecond > this.bestCookiesPerSecond) {
            this.bestCookiesPerSecond = this.cookiesPerSecond;
        }
    }
    
    // Nieuwe functie: bereken CPS voor specifieke autoclicker (alleen voor tooltips)
    getAutoclickerCPS(type) {
        if (this.autoclickers[type]) {
            const owned = this.autoclickers[type].owned;
            const production = this.autoclickers[type].baseProduction;
            return owned * production;
        }
        return 0;
    }
    
    saveGame() {
        const saveData = {
            cookies: this.cookies,
            totalClicks: this.totalClicks,
            cookiesPerSecond: this.cookiesPerSecond,
            totalCookiesEarned: this.totalCookiesEarned,
            moneySpent: this.moneySpent,
            bestCookiesPerSecond: this.bestCookiesPerSecond,
            gameStartTime: this.gameStartTime,
            autoclickers: {},
            upgrades: {}
        };
        
        for (let type in this.autoclickers) {
            saveData.autoclickers[type] = {
                owned: this.autoclickers[type].owned,
                baseProduction: this.autoclickers[type].baseProduction
            };
        }
        
        for (let type in this.upgrades) {
            saveData.upgrades[type] = {
                owned: this.upgrades[type].owned
            };
        }
        
        try {
            localStorage.setItem('cookieClickerSave', JSON.stringify(saveData));
            return true;
        } catch (error) {
            return false;
        }
    }
    
    loadGame() {
        try {
            const saveData = localStorage.getItem('cookieClickerSave');
            if (!saveData) {
                return false;
            }
            
            const data = JSON.parse(saveData);
            
            this.cookies = data.cookies || 0;
            this.totalClicks = data.totalClicks || 0;
            this.cookiesPerSecond = data.cookiesPerSecond || 0;
            this.totalCookiesEarned = data.totalCookiesEarned || 0;
            this.moneySpent = data.moneySpent || 0;
            this.bestCookiesPerSecond = data.bestCookiesPerSecond || 0;
            this.gameStartTime = data.gameStartTime || Date.now();
            
            if (data.autoclickers) {
                for (let type in data.autoclickers) {
                    if (this.autoclickers[type]) {
                        this.autoclickers[type].owned = data.autoclickers[type].owned || 0;
                        this.autoclickers[type].baseProduction = data.autoclickers[type].baseProduction || this.getBaseProduction(type);
                    }
                }
            }
            
            if (data.upgrades) {
                for (let type in data.upgrades) {
                    if (this.upgrades[type]) {
                        this.upgrades[type].owned = data.upgrades[type].owned || 0;
                    }
                }
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }
    
    hasExistingSave() {
        return localStorage.getItem('cookieClickerSave') !== null;
    }
    
    deleteSave() {
        try {
            localStorage.removeItem('cookieClickerSave');
            return true;
        } catch (error) {
            return false;
        }
    }
}

class Game {
    constructor() {
        this.player = new Player();
        this.isRunning = false;
        this.gameLoop = null;
        this.autoSaveInterval = null;
        this.cookieElement = null;
        this.scoreElement = null;
    }
    
    setupGame() {
        this.findDOMElements();
        this.setupEventListeners();
        this.loadGameIfExists();
        this.updateDisplay();
        this.startGameLoop();
        this.startAutoSave();
    }
    
    loadGameIfExists() {
        if (this.player.hasExistingSave()) {
            const success = this.player.loadGame();
            if (success) {
                this.addEvent('💾 Game loaded from save!');
            } else {
                this.addEvent('❌ Failed to load save data');
            }
        } else {
            this.addEvent('🆕 New game started!');
        }
    }
    
    startAutoSave() {
        // Stop bestaande auto-save als die al loopt
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(() => {
            this.saveGame();
        }, 500); // Auto-save elke 0.5 seconde
    }
    
    saveGame() {
        const success = this.player.saveGame();
        if (success) {
            this.showSaveIndicator();
        }
        return success;
    }
    
    manualSave() {
        const success = this.player.saveGame();
        if (success) {
            this.addEvent('💾 Game saved manually!');
            this.showSaveIndicator();
        } else {
            this.addEvent('❌ Failed to save game');
        }
        return success;
    }
    

    // showSaveIndicator is nu leeg, geen melding meer
    showSaveIndicator() {
        // Geen actie meer, melding wordt niet getoond
    }
    
    shareGame() {
        const stats = this.generateShareText();
        
        if (navigator.share) {
            navigator.share({
                title: '🍪 Cookie Clicker Progress',
                text: stats,
                url: window.location.href
            }).then(() => {
                this.addEvent('📤 Game shared successfully!');
            }).catch((error) => {
                this.fallbackShare(stats);
            });
        } else {
            this.fallbackShare(stats);
        }
    }
    
    generateShareText() {
        const player = this.player;
        
        return `🍪 My Cookie Clicker Progress:\n` +
               `💰 ${this.formatNumber(Math.floor(player.cookies))} cookies\n` +
               `📈 ${this.formatNumber(player.cookiesPerSecond, 1)} cookies/sec\n` +
               `🎯 ${this.formatNumber(Math.floor(player.totalCookiesEarned))} total cookies earned!`;
    }
    
    fallbackShare(stats) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(stats).then(() => {
                this.addEvent('📋 Progress copied to clipboard!');
                this.showShareDialog(stats);
            }).catch(() => {
                this.showShareDialog(stats);
            });
        } else {
            this.showShareDialog(stats);
        }
    }
    
    showShareDialog(stats) {
        alert(`🍪 Your Cookie Clicker Progress:\n\n${stats}\n\n📋 Text copied to clipboard! Share it with friends!`);
    }
    
    findDOMElements() {
        this.cookieElement = document.querySelector('.cookie');
        this.scoreElement = document.getElementById('cookie-count');
        this.cpsElement = document.getElementById('cookies-per-second');
    }
    
    setupEventListeners() {
        if (this.cookieElement) {
            this.cookieElement.addEventListener('click', () => {
                this.handleCookieClick();
            });
        }
        
        const autoclickerButtons = document.querySelectorAll('.autoclickers button');
        autoclickerButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleAutoclickerPurchase(button.id);
            });
        });
        
        const upgradeButtons = document.querySelectorAll('.upgrades button');
        upgradeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleUpgradePurchase(button.id);
            });
        });
        
        const saveButton = document.getElementById('save-game');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.manualSave();
            });
        }
        
        const restartButton = document.getElementById('restart-game');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                this.handleRestart();
            });
        }
        
        const shareButton = document.getElementById('share-game');
        if (shareButton) {
            shareButton.addEventListener('click', () => {
                this.shareGame();
            });
        }
        
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }
    
    handleRestart() {
        if (confirm('Restart game? All progress will be lost!')) {
            this.player = new Player();
            this.updateDisplay();
            this.addEvent('🔄 Game restarted!');
        }
    }
    
    handleKeyboardShortcuts(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (event.key.toLowerCase()) {
            case 's':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.manualSave();
                }
                break;
            case ' ':
                event.preventDefault();
                this.handleCookieClick();
                break;
        }
    }
    
    handleCookieClick() {
        const oldCookies = this.player.cookies;
        // Fix: clickValue is niet gedefinieerd, dus standaard op 1
        let clickValue = 1;
        this.player.addCookies(clickValue);
        this.checkMilestones(oldCookies, this.player.cookies);
        this.updateDisplay();
        this.animateCookieClick();
        // Toon de juiste click waarde (kan meer dan 1 zijn bij Energy Burst)
        const displayValue = clickValue === 1 ? '+1' : `+${Math.floor(clickValue)}`;
        this.showFloatingNumber(displayValue, this.cookieElement);
    }
    
    handleAutoclickerPurchase(type) {
        const success = this.player.buyAutoclicker(type);
        
        if (success) {
            this.updateDisplay();
            this.addEvent(`🏭 Bought ${type}! (${this.formatNumber(this.player.autoclickers[type].owned)} owned)`);
            
            const button = document.getElementById(type);
            this.animatePurchaseSuccess(button);
            
            // Gebruik de juiste emoji per autoclicker type
            const autoclickerEmojis = {
                'cursor': '👆🏼',
                'grandma': '👩🏼‍🦳',
                'farm': '👩🏼‍🌾',
                'mine': '👩🏻‍🏭',
                'factory': '👩🏻‍🔬',
                'bank': '👩🏻‍💻',
                'temple': '🧙🏼‍♂️',
                'spaceship': '👨🏼‍🚀'
            };
            
            const emoji = autoclickerEmojis[type] || '🏭';
            this.showFloatingNumber(`${emoji} +1`, button, 'purchase');
            
            updateActiveTooltip(type);
            this.saveGame(); // Auto-save na aankoop
        }
    }
    
    handleUpgradePurchase(type) {
        const success = this.player.buyUpgrade(type);
        
        if (success) {
            this.updateDisplay();
            this.addEvent(`⚡ Bought ${type}! (${this.formatNumber(this.player.upgrades[type].owned)} owned)`);
            
            const button = document.getElementById(type);
            this.animatePurchaseSuccess(button);
            
            // Gebruik upgrade emoji in floating animatie
            const upgradeEmoji = button.textContent || '⚡';
            this.showFloatingNumber(`${upgradeEmoji}+`, button, 'upgrade');
            
            updateActiveTooltip(type);
            this.saveGame(); // Auto-save na aankoop
        }
    }
    
    updateDisplay() {
        if (this.scoreElement) {
            this.scoreElement.textContent = this.formatNumber(Math.floor(this.player.cookies));
        }
        
        if (this.cpsElement) {
            this.cpsElement.textContent = this.formatNumber(this.player.cookiesPerSecond, 1);
        }
        
        this.updateAutoclickerDisplay();
        this.updateUpgradeDisplay();
        
        if (currentTooltipButton) {
            const tooltip = document.getElementById('game-tooltip');
            updateTooltipContent(currentTooltipButton, tooltip);
        }
        
        document.title = `${this.formatNumber(Math.floor(this.player.cookies))} cookies - Cookie Clicker`;
    }
    
    // Centrale number formatting functie
    formatNumber(num, decimals = 0) {
        try {
            if (num === null || num === undefined || isNaN(num)) return '0';
            if (num === 0) return '0';
            
            const absNum = Math.abs(num);
            
            // Voor zeer grote nummers, gebruik M/B/T notatie
            if (absNum >= 1e12) {
                return (num / 1e12).toFixed(decimals) + 'T';
            } else if (absNum >= 1e9) {
                return (num / 1e9).toFixed(decimals) + 'B';
            } else if (absNum >= 1e6) {
                return (num / 1e6).toFixed(decimals) + 'M';
            } else {
                // Voor alle andere nummers, gebruik veilige formatting
                if (decimals > 0) {
                    return num.toFixed(decimals);
                } else {
                    return Math.floor(num).toLocaleString();
                }
            }
        } catch (error) {
            console.error('formatNumber error:', error, 'for value:', num);
            return String(num || '0');
        }
    }
    
    updateAutoclickerDisplay() {
        const autoclickerButtons = document.querySelectorAll('.autoclickers button');
        
        autoclickerButtons.forEach(button => {
            const type = button.id;
            const autoclicker = this.player.autoclickers[type];
            
            if (autoclicker) {
                if (this.player.cookies >= this.player.getAutoclickerCost(type)) {
                    button.classList.remove('disabled');
                } else {
                    button.classList.add('disabled');
                }
            }
        });
    }
    
    updateUpgradeDisplay() {
        const upgradeButtons = document.querySelectorAll('.upgrades button');
        
        upgradeButtons.forEach(button => {
            const type = button.id;
            const upgrade = this.player.upgrades[type];
            
            if (upgrade) {
                // Map upgrade types naar autoclicker types
                const autoclickerMap = {
                    'cursor-upgrade': 'cursor',
                    'grandma-upgrade': 'grandma', 
                    'farm-upgrade': 'farm',
                    'mine-upgrade': 'mine',
                    'factory-upgrade': 'factory',
                    'bank-upgrade': 'bank',
                    'temple-upgrade': 'temple',
                    'spaceship-upgrade': 'spaceship'
                };
                
                const requiredAutoclicker = autoclickerMap[type];
                const hasAutoclicker = requiredAutoclicker && this.player.autoclickers[requiredAutoclicker].owned > 0;
                const hasEnoughCookies = this.player.cookies >= this.player.getUpgradeCost(type);
                
                if (hasAutoclicker && hasEnoughCookies) {
                    button.classList.remove('disabled');
                } else {
                    button.classList.add('disabled');
                }
            }
        });
    }
    
    addEvent(message) {
        const eventsList = document.getElementById('events-list');
        if (eventsList) {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            eventItem.textContent = message;
            eventsList.insertBefore(eventItem, eventsList.firstChild);
            
            while (eventsList.children.length > 10) {
                eventsList.removeChild(eventsList.lastChild);
            }
        }
    }
    
    startGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        this.isRunning = true;
        this.gameLoop = setInterval(() => {
            this.gameStep();
        }, 100);
    }
    
    stopGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        this.isRunning = false;
    }
    
    gameStep() {
        if (this.player.cookiesPerSecond > 0) {
            const cookiesToAdd = this.player.cookiesPerSecond / 10;
            this.player.cookies += cookiesToAdd;
            this.updateDisplay();
        }
    }
    
    animateCookieClick() {
        const cookieImg = document.querySelector('.cookie');
        if (cookieImg) {
            // Stop bestaande animatie en reset direct
            cookieImg.classList.remove('cookie-click');
            cookieImg.style.animation = 'none';
            
            // Force reflow om animatie te resetten
            cookieImg.offsetHeight;
            
            // Reset style en start nieuwe animatie
            cookieImg.style.animation = '';
            cookieImg.classList.add('cookie-click');
            
            // Clean up na animatie
            setTimeout(() => {
                cookieImg.classList.remove('cookie-click');
            }, 200);
        }
    }
    
    showFloatingNumber(text, element, type = 'click') {
        const floatingElement = document.createElement('div');
        floatingElement.textContent = text;
        floatingElement.className = `floating-number floating-${type}`;
        
        const rect = element.getBoundingClientRect();
        floatingElement.style.position = 'fixed';
        floatingElement.style.pointerEvents = 'none';
        floatingElement.style.zIndex = '1000';
        
        // Voor autoclicker purchase: animatie begint boven de emoji
        if (type === 'purchase') {
            // Emoji is de eerste 50px van de button, dus center op 25px
            floatingElement.style.left = (rect.left + 25) + 'px'; // Midden van emoji
            floatingElement.style.top = (rect.top - 10) + 'px';   // Boven de emoji
        } else {
            // Voor andere types (clicks, etc.): gebruik midden van element
            floatingElement.style.left = (rect.left + rect.width / 2) + 'px';
            floatingElement.style.top = rect.top + 'px';
        }
        
        document.body.appendChild(floatingElement);
        
        setTimeout(() => {
            if (floatingElement.parentNode) {
                floatingElement.parentNode.removeChild(floatingElement);
            }
        }, 2000);
    }
    
    animatePurchaseSuccess(element) {
        if (element) {
            element.classList.add('purchase-success');
            setTimeout(() => {
                element.classList.remove('purchase-success');
            }, 600);
        }
    }
    
    pulseElement(element) {
        if (element) {
            element.classList.add('pulse');
            setTimeout(() => {
                element.classList.remove('pulse');
            }, 1000);
        }
    }
    
    checkMilestones(oldValue, newValue) {
        const milestones = [10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000];
        
        for (let milestone of milestones) {
            if (oldValue < milestone && newValue >= milestone) {
                this.celebrateMilestone(milestone);
                break;
            }
        }
    }
    
    celebrateMilestone(milestone) {
        if (this.scoreElement) {
            this.pulseElement(this.scoreElement);
        }
        
        this.showFloatingNumber(`🎉 ${this.formatNumber(milestone)} COOKIES!`, this.cookieElement, 'milestone');
        
        this.addEvent(`🎉 Milestone reached: ${this.formatNumber(milestone)} cookies!`);
    }
}

// TOOLTIP SYSTEEM
let currentTooltipButton = null;

function initializeTooltips() {
    const upgradeButtons = document.querySelectorAll('.upgrades button');
    const autoclickerButtons = document.querySelectorAll('.autoclickers button');
    
    upgradeButtons.forEach(button => {
        button.removeEventListener('mouseenter', showTooltip);
        button.removeEventListener('mouseleave', hideTooltip);
        button.addEventListener('mouseenter', showTooltip);
        button.addEventListener('mouseleave', hideTooltip);
    });
    
    autoclickerButtons.forEach(button => {
        button.removeEventListener('mouseenter', showTooltip);
        button.removeEventListener('mouseleave', hideTooltip);
        button.addEventListener('mouseenter', showTooltip);
        button.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.getElementById('game-tooltip');
    currentTooltipButton = this;
    
    const type = this.id;
    if (window.cookieGame && window.cookieGame.player) {
        const isUpgrade = window.cookieGame.player.upgrades[type];
        const isAutoclicker = window.cookieGame.player.autoclickers[type];
        
        if (isUpgrade || isAutoclicker) {
            updateTooltipContent(this, tooltip);
            
            // Maak tooltip tijdelijk zichtbaar voor correcte dimensie meting
            tooltip.style.opacity = '0';
            tooltip.style.visibility = 'visible';
            
            const rect = this.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            
            // Bereken horizontale en verticale positie
            let tooltipX, tooltipY;
            
            if (isAutoclicker) {
                // Autoclickers: rechts van de emoji + extra 4.5cm naar rechts
                // Emoji is 50px breed + 20px gap + 90px (3cm) + 45px (1.5cm) = 205px totaal
                tooltipX = rect.left + 50 + 20 + 90 + 45; // 50px emoji + 20px gap + 135px extra (≈4.5cm)
                tooltipY = rect.top + (rect.height / 2) - (tooltipRect.height / 2); // Gecentreerd verticaal
                tooltip.className = 'autoclicker-tooltip-right';
                
                // Als tooltip buiten rechter kant van scherm gaat, toon dan links van emoji
                if (tooltipX + tooltipRect.width > viewportWidth - 10) {
                    tooltipX = rect.left - tooltipRect.width - 15; // Links van de hele button
                    tooltip.className = 'autoclicker-tooltip-left';
                }
                
                // Als tooltip boven het scherm zou gaan, verplaats naar beneden
                if (tooltipY < 10) {
                    tooltipY = 10;
                }
                
                // Als tooltip onder het scherm zou gaan, verplaats naar boven
                if (tooltipY + tooltipRect.height > window.innerHeight - 10) {
                    tooltipY = window.innerHeight - tooltipRect.height - 10;
                }
                
                // Bereken pijl positie (wijst naar de emoji)
                const emojiCenterX = rect.left + 25; // Midden van de 50px emoji
                const emojiCenterY = rect.top + (rect.height / 2);
                
                if (tooltip.className === 'autoclicker-tooltip-right') {
                    // Pijl wijst van links naar de emoji
                    const arrowTop = emojiCenterY - tooltipY;
                    const clampedArrowTop = Math.max(15, Math.min(arrowTop, tooltipRect.height - 15));
                    tooltip.style.setProperty('--arrow-top', clampedArrowTop + 'px');
                } else {
                    // Links tooltip - pijl wijst van rechts naar de emoji
                    const arrowTop = emojiCenterY - tooltipY;
                    const clampedArrowTop = Math.max(15, Math.min(arrowTop, tooltipRect.height - 15));
                    tooltip.style.setProperty('--arrow-top', clampedArrowTop + 'px');
                }
                
            } else {
                // Upgrades: onder de button (zoals eerder)
                tooltipX = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                tooltipY = rect.bottom + 10;
                
                // Zorg dat tooltip niet buiten linker kant gaat
                if (tooltipX < 10) {
                    tooltipX = 10;
                }
                // Zorg dat tooltip niet buiten rechter kant gaat
                if (tooltipX + tooltipRect.width > viewportWidth - 10) {
                    tooltipX = viewportWidth - tooltipRect.width - 10;
                }
                
                // Als tooltip onder het scherm zou gaan, toon dan boven de button
                if (tooltipY + tooltipRect.height > window.innerHeight - 10) {
                    tooltipY = rect.top - tooltipRect.height - 10;
                    tooltip.className = 'upgrade-tooltip-above';
                } else {
                    tooltip.className = 'upgrade-tooltip-below';
                }
                
                // Pijl exact in het midden van de button
                const buttonCenterX = rect.left + (rect.width / 2);
                const arrowLeft = buttonCenterX - tooltipX;
                tooltip.style.setProperty('--arrow-left', arrowLeft + 'px');
            }
            
            tooltip.style.left = tooltipX + 'px';
            tooltip.style.top = tooltipY + 'px';
            
            // Arrow properties NIET resetten zodat pijl goed uitgelijnd blijft
            
            tooltip.style.opacity = '1';
        }
    }
}

function hideTooltip() {
    const tooltip = document.getElementById('game-tooltip');
    currentTooltipButton = null;
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';
    tooltip.className = ''; // Reset class
    tooltip.style.removeProperty('--arrow-left'); // Reset arrow position
}

function updateTooltipContent(button, tooltip) {
    const type = button.id;
    const upgrade = window.cookieGame.player.upgrades[type];
    const autoclicker = window.cookieGame.player.autoclickers[type];
    const name = button.getAttribute('data-name') || type;
    
    if (upgrade) {
        const cost = window.cookieGame.player.getUpgradeCost(type);
        const owned = upgrade.owned;
        
        // Voeg beschrijving toe voor elke upgrade
        const descriptions = {
            'cursor-upgrade': 'Boosts cursor clicking power - each click gives more cookies!',
            'grandma-upgrade': 'Grandmas bake faster - increases grandma cookie production!',
            'farm-upgrade': 'Farms grow better crops - boosts farm cookie production!',
            'mine-upgrade': 'Mines dig deeper - increases mine cookie production!',
            'factory-upgrade': 'Factories work more efficiently - boosts factory production!',
            'bank-upgrade': 'Banks invest better - increases bank cookie production!',
            'temple-upgrade': 'Temples are more blessed - boosts temple production!',
            'spaceship-upgrade': 'Spaceships travel faster - increases spaceship production!'
        };
        
        const description = descriptions[type] || 'Boosts your cookie production!';
        const tooltipText = `${description}\n\nCost: ${window.cookieGame.formatNumber(cost)} cookies\nOwned: ${window.cookieGame.formatNumber(owned)}`;
        
        tooltip.textContent = tooltipText;
    } else if (autoclicker) {
        // AUTOCLICKER TOOLTIP
        const cost = window.cookieGame.player.getAutoclickerCost(type);
        const owned = autoclicker.owned;
        const production = autoclicker.baseProduction;
        
        // Nieuwe functie gebruiken voor CPS berekening
        const currentCPS = window.cookieGame.player.getAutoclickerCPS(type);
        
        // Voeg beschrijving toe voor elke autoclicker
        const descriptions = {
            'cursor': 'Clicks the cookie automatically - basic but reliable production!',
            'grandma': 'Wise grandma bakes cookies constantly - steady cookie income!',
            'farm': 'Cookie farm grows cookie plants - natural cookie production!',
            'mine': 'Cookie mine extracts cookie ore - solid cookie generation!',
            'factory': 'Cookie factory mass produces - efficient cookie creation!',
            'bank': 'Cookie bank generates interest - money makes cookies!',
            'temple': 'Cookie temple blesses production - divine cookie power!',
            'spaceship': 'Cookie spaceship explores space - cosmic cookie discovery!'
        };
        
        const description = descriptions[type] || 'Automatically generates cookies for you!';
        const tooltipText = `${description}\n\nCost: ${window.cookieGame.formatNumber(cost)} cookies\nOwned: ${window.cookieGame.formatNumber(owned)}\nProduction per unit: ${window.cookieGame.formatNumber(production, 1)} cookies/sec\n\n🍪 TOTAL PRODUCTION FROM THIS AUTOCLICKER: ${window.cookieGame.formatNumber(currentCPS, 1)} cookies/sec`;
        
        tooltip.textContent = tooltipText;
    }
}

function updateActiveTooltip(buttonType) {
    if (currentTooltipButton && currentTooltipButton.id === buttonType) {
        const tooltip = document.getElementById('game-tooltip');
        updateTooltipContent(currentTooltipButton, tooltip);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeTooltips();

    // Speler profiel functionaliteit
    const playerEmojiBtn = document.getElementById('player-emoji-btn');
    const playerNameEl = document.getElementById('player-name');
    const emojiPicker = document.getElementById('emoji-picker');
    const emojiButtons = emojiPicker ? emojiPicker.querySelectorAll('.emoji-choice') : [];

    // Theme kleuren
    const themeBg = '#f3d5b5';
    const themeText = '#5d4e37';

    // Laad uit localStorage
    const savedName = localStorage.getItem('playerName');
    const savedEmoji = localStorage.getItem('playerEmoji');
    if (savedName) playerNameEl.value = savedName;
    if (savedEmoji) playerEmojiBtn.textContent = savedEmoji;

    // Emoji-picker toggle
    if (playerEmojiBtn && emojiPicker) {
        playerEmojiBtn.addEventListener('click', function() {
            emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'flex' : 'none';
        });
    }

    // Naam wijzigen
    playerNameEl.addEventListener('input', function() {
        localStorage.setItem('playerName', playerNameEl.value);
    });

    // Emoji kiezen
    emojiButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            playerEmojiBtn.textContent = btn.dataset.emoji;
            localStorage.setItem('playerEmoji', btn.dataset.emoji);
            // Highlight gekozen emoji
            emojiButtons.forEach(b => b.style.background = themeBg);
            btn.style.background = themeText;
            btn.style.color = themeBg;
            emojiPicker.style.display = 'none';
        });
    });
    // Init highlight
    const activeEmoji = playerEmojiBtn.textContent;
    emojiButtons.forEach(btn => {
        if (btn.dataset.emoji === activeEmoji) {
            btn.style.background = themeText;
            btn.style.color = themeBg;
        } else {
            btn.style.background = themeBg;
            btn.style.color = themeText;
        }
    });

    // Start game
    const cookieGame = new Game();
    cookieGame.setupGame();
    window.cookieGame = cookieGame;
});