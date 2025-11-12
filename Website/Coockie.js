

const AUTOCLICKER_CONFIG = {
  cursor:    { name: 'Cursor',   emoji: '👆🏼',   baseCost: 15,       baseProduction: 0.1 },
  grandma:   { name: 'Grandma',  emoji: '👩🏼‍🦳', baseCost: 100,      baseProduction: 1 },
  farm:      { name: 'Farm',     emoji: '👩🏼‍🌾', baseCost: 1100,     baseProduction: 8 },
  mine:      { name: 'Mine',     emoji: '👩🏻‍🏭', baseCost: 12000,    baseProduction: 47 },
  factory:   { name: 'Factory',  emoji: '👩🏻‍🔬', baseCost: 130000,   baseProduction: 260 },
  bank:      { name: 'Bank',     emoji: '👩🏻‍💻', baseCost: 1400000,  baseProduction: 1400 },
  temple:    { name: 'Temple',   emoji: '🧙🏼‍♂️', baseCost: 20000000, baseProduction: 7800 },
  spaceship: { name: 'Spaceship',emoji: '👨🏼‍🚀', baseCost: 330000000,baseProduction: 44000 }
};

const UPGRADE_CONFIG = {
  'cursor-upgrade':    { target: 'cursor',   baseCost: 100,        multiplier: 2.0, desc: 'Boosts cursor clicking power' },
  'grandma-upgrade':   { target: 'grandma',  baseCost: 1000,       multiplier: 2.0, desc: 'Grandmas bake faster' },
  'farm-upgrade':      { target: 'farm',     baseCost: 11000,      multiplier: 2.0, desc: 'Farms grow better crops' },
  'mine-upgrade':      { target: 'mine',     baseCost: 120000,     multiplier: 2.0, desc: 'Mines dig deeper' },
  'factory-upgrade':   { target: 'factory',  baseCost: 1300000,    multiplier: 2.0, desc: 'Factories more efficient' },
  'bank-upgrade':      { target: 'bank',     baseCost: 14000000,   multiplier: 2.0, desc: 'Banks invest better' },
  'temple-upgrade':    { target: 'temple',   baseCost: 200000000,  multiplier: 2.0, desc: 'Temples are more blessed' },
  'spaceship-upgrade': { target: 'spaceship',baseCost: 3300000000, multiplier: 2.0, desc: 'Spaceships travel faster' }
};

/* ======= PLAYER ======= */
class Player {
  constructor() {
    this.cookies = 0;
    this.totalClicks = 0;
    this.cookiesPerSecond = 0;
    this.autoclickers = {}; // keyed by type
    this.upgrades = {};     // keyed by upgradeId

    this.totalCookiesEarned = 0;
    this.moneySpent = 0;
    this.bestCookiesPerSecond = 0;
    this.gameStartTime = Date.now();

    // Hot Drinks Challenge
    this.challengesStarted = 0;
    this.challengesChosen = 0;
    this.challengesTimeout = 0;
    this.chosenDrinks = { Coffee: 0, Tea: 0, Milk: 0 };
    this.totalBoostsReceived = 0;

    this._initAutoclickers();
    this._initUpgrades();
  }

  _initAutoclickers() {
    Object.keys(AUTOCLICKER_CONFIG).forEach(type => {
      const cfg = AUTOCLICKER_CONFIG[type];
      this.autoclickers[type] = {
        owned: 0,
        baseCost: cfg.baseCost,
        baseProduction: cfg.baseProduction
      };
    });
  }

  _initUpgrades() {
    Object.keys(UPGRADE_CONFIG).forEach(id => {
      const cfg = UPGRADE_CONFIG[id];
      this.upgrades[id] = {
        owned: 0,
        baseCost: cfg.baseCost,
        targetAutoclicker: cfg.target,
        multiplier: cfg.multiplier
      };
    });
  }

  // clickValue can be extended later by effects
  addCookies(amount = 1, isManualClick = true) {
    const delta = Number(amount) || 0;
    this.cookies += delta;
    this.totalCookiesEarned += delta;
    if (isManualClick) this.totalClicks++;
  }

  // Autoclicker pricing (standard exponential)
  getAutoclickerCost(type) {
    const cfg = this.autoclickers[type];
    if (!cfg) return Infinity;
    return Math.ceil(cfg.baseCost * Math.pow(1.15, cfg.owned));
  }

  buyAutoclicker(type) {
    if (!this.autoclickers[type]) return false;
    const cost = this.getAutoclickerCost(type);
    if (this.cookies < cost) return false;
    this.cookies -= cost;
    this.moneySpent += cost;
    this.autoclickers[type].owned++;
    this.updateCookiesPerSecond();
    return true;
  }

  // Upgrade pricing: base * 1.15^owned * (owned+1) (kept from your design)
  getUpgradeCost(upgradeId) {
    const u = this.upgrades[upgradeId];
    if (!u) return Infinity;
    return Math.ceil(u.baseCost * Math.pow(1.15, u.owned) * (u.owned + 1));
  }

  buyUpgrade(upgradeId) {
    const u = this.upgrades[upgradeId];
    if (!u) return false;
    const cost = this.getUpgradeCost(upgradeId);
    if (this.cookies < cost) return false;
    this.cookies -= cost;
    this.moneySpent += cost;
    u.owned++;
    this.applyUpgradeEffect(upgradeId);
    return true;
  }

  applyUpgradeEffect(upgradeId) {
    const u = this.upgrades[upgradeId];
    if (!u) return;
    const target = u.targetAutoclicker;
    if (this.autoclickers[target]) {
      this.autoclickers[target].baseProduction *= u.multiplier;
      this.updateCookiesPerSecond();
    }
  }

  updateCookiesPerSecond() {
    let cps = 0;
    for (const t in this.autoclickers) {
      const a = this.autoclickers[t];
      cps += a.owned * a.baseProduction;
    }
    this.cookiesPerSecond = cps;
    if (cps > this.bestCookiesPerSecond) this.bestCookiesPerSecond = cps;
  }

  getAutoclickerCPS(type) {
    const a = this.autoclickers[type];
    if (!a) return 0;
    return a.owned * a.baseProduction;
  }

  // SAVE / LOAD
  save() {
    const save = {
      cookies: this.cookies,
      totalClicks: this.totalClicks,
      cookiesPerSecond: this.cookiesPerSecond,
      totalCookiesEarned: this.totalCookiesEarned,
      moneySpent: this.moneySpent,
      bestCookiesPerSecond: this.bestCookiesPerSecond,
      gameStartTime: this.gameStartTime,
      autoclickers: {},
      upgrades: {}
      ,
      challengesStarted: this.challengesStarted,
      challengesChosen: this.challengesChosen,
      challengesTimeout: this.challengesTimeout,
      chosenDrinks: this.chosenDrinks,
      totalBoostsReceived: this.totalBoostsReceived
    };

    for (const t in this.autoclickers) {
      save.autoclickers[t] = {
        owned: this.autoclickers[t].owned,
        baseProduction: this.autoclickers[t].baseProduction
      };
    }
    for (const u in this.upgrades) {
      save.upgrades[u] = { owned: this.upgrades[u].owned };
    }

    try {
      localStorage.setItem('cookieClickerSave', JSON.stringify(save));
      return true;
    } catch (err) {
      console.error('Save failed', err);
      return false;
    }
  }

  load() {
    try {
      const raw = localStorage.getItem('cookieClickerSave');
      if (!raw) return false;
      const data = JSON.parse(raw);

      this.cookies = data.cookies || 0;
      this.totalClicks = data.totalClicks || 0;
      this.cookiesPerSecond = data.cookiesPerSecond || 0;
      this.totalCookiesEarned = data.totalCookiesEarned || 0;
      this.moneySpent = data.moneySpent || 0;
      this.bestCookiesPerSecond = data.bestCookiesPerSecond || 0;
      this.gameStartTime = data.gameStartTime || Date.now();

      // Hot Drinks Challenge
      this.challengesStarted = data.challengesStarted || 0;
      this.challengesChosen = data.challengesChosen || 0;
      this.challengesTimeout = data.challengesTimeout || 0;
      this.chosenDrinks = data.chosenDrinks || { Coffee: 0, Tea: 0, Milk: 0 };
      this.totalBoostsReceived = data.totalBoostsReceived || 0;

      if (data.autoclickers) {
        for (const t in data.autoclickers) {
          if (this.autoclickers[t]) {
            this.autoclickers[t].owned = data.autoclickers[t].owned || 0;
            this.autoclickers[t].baseProduction = data.autoclickers[t].baseProduction || this.autoclickers[t].baseProduction;
          }
        }
      }
      if (data.upgrades) {
        for (const u in data.upgrades) {
          if (this.upgrades[u]) this.upgrades[u].owned = data.upgrades[u].owned || 0;
        }
      }

      this.updateCookiesPerSecond();
      return true;
    } catch (err) {
      console.error('Load failed', err);
      return false;
    }
  }

  hasSave() {
    return localStorage.getItem('cookieClickerSave') !== null;
  }

  deleteSave() {
    try {
      localStorage.removeItem('cookieClickerSave');
      return true;
    } catch (err) {
      console.error('Delete save failed', err);
      return false;
    }
  }
}

/* ======= GAME ======= */
class Game {
  constructor() {
    this.player = new Player();
    this.isRunning = false;
    this.gameLoop = null;
    this.autoSaveInterval = null;

    // DOM refs
    this.cookieElement = null;
    this.scoreElement = null;
    this.cpsElement = null;

    // Tooltip state
    this.currentTooltipButton = null;
  }

  setupGame() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._setup());
    } else {
      this._setup();
    }
  }

  _setup() {
    this._findDOM();
    this._setupListeners();
    this._initTooltips();
      // Restore emoji and name from localStorage
      const playerEmojiBtn = document.getElementById('player-emoji-btn');
      const playerNameEl = document.getElementById('player-name');
      const emojiPicker = document.getElementById('emoji-picker');
      const savedEmoji = localStorage.getItem('playerEmoji') || '👤';
      const savedName = localStorage.getItem('playerName') || '';
      if (playerEmojiBtn) playerEmojiBtn.textContent = savedEmoji;
      if (playerNameEl) playerNameEl.value = savedName;
      if (emojiPicker) emojiPicker.style.display = 'none';

      // Emoji button click toggles picker
      if (playerEmojiBtn && emojiPicker) {
        playerEmojiBtn.addEventListener('click', () => {
          emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'flex' : 'none';
        });
        // Emoji choice click
        emojiPicker.querySelectorAll('.emoji-choice').forEach(btn => {
          btn.addEventListener('click', () => {
            const emoji = btn.getAttribute('data-emoji');
            playerEmojiBtn.textContent = emoji;
            localStorage.setItem('playerEmoji', emoji);
            emojiPicker.style.display = 'none';
          });
        });
      }
      // Name input change
      if (playerNameEl) {
        playerNameEl.addEventListener('input', () => {
          localStorage.setItem('playerName', playerNameEl.value);
        });
      }
    if (this.player.hasSave()) {
      if (this.player.load()) this.addEvent('💾 Game loaded from save!');
      else this.addEvent('❌ Failed to load save data');
    } else {
      this.addEvent('🆕 New game started!');
    }
    this.updateDisplay();
    this.startGameLoop();
    this.startAutoSave();
  }

  _findDOM() {
    this.cookieElement = document.querySelector('.cookie');
    this.scoreElement = document.getElementById('cookie-count');
    this.cpsElement = document.getElementById('cookies-per-second');
  }

  _setupListeners() {
    if (this.cookieElement) {
      this.cookieElement.addEventListener('click', () => this.handleCookieClick());
    }

    document.querySelectorAll('.autoclickers button').forEach(btn => {
      btn.addEventListener('click', () => this.handleAutoclickerPurchase(btn.id));
    });

    document.querySelectorAll('.upgrades button').forEach(btn => {
      btn.addEventListener('click', () => this.handleUpgradePurchase(btn.id));
    });

    const saveBtn = document.getElementById('save-game');
    if (saveBtn) saveBtn.addEventListener('click', () => this.manualSave());

    const restartBtn = document.getElementById('restart-game');
    if (restartBtn) restartBtn.addEventListener('click', () => this.handleRestart());

    const shareBtn = document.getElementById('share-game');
    if (shareBtn) shareBtn.addEventListener('click', () => this.shareGame());

    document.addEventListener('keydown', e => this._handleKeyShortcuts(e));
  }

  startGameLoop() {
    if (this.gameLoop) clearInterval(this.gameLoop);
    this.isRunning = true;
    this.gameLoop = setInterval(() => this.gameStep(), 100);
  }

  stopGameLoop() {
    if (this.gameLoop) clearInterval(this.gameLoop);
    this.gameLoop = null;
    this.isRunning = false;
  }

  gameStep() {
    // Add fractionally based on CPS (runs 10x/sec)
    this.player.updateCookiesPerSecond();
    if (this.player.cookiesPerSecond > 0) {
      const add = this.player.cookiesPerSecond / 10;
      this.player.cookies += add;
      this.player.totalCookiesEarned += add;
      this.updateDisplay();
    }
  }

  startAutoSave() {
    if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
  this.autoSaveInterval = setInterval(() => this.saveGame(), 100); // 0.1s
  }

  saveGame() {
  const ok = this.player.save();
  return ok;
  }

  manualSave() {
  const ok = this.player.save();
  if (ok) this.addEvent('💾 Game saved manually!');
  else this.addEvent('❌ Failed to save game');
  return ok;
  }



  generateShareText() {
    const p = this.player;
    return `🍪 My Cookie Clicker Progress:\n` +
           `💰 ${this.formatNumber(Math.floor(p.cookies))} cookies\n` +
           `📈 ${this.formatNumber(p.cookiesPerSecond, 1)} cookies/sec\n` +
           `🎯 ${this.formatNumber(Math.floor(p.totalCookiesEarned))} total cookies earned!`;
  }

  shareGame() {
    const stats = this.generateShareText();
    if (navigator.share) {
      navigator.share({ title: '🍪 Cookie Clicker Progress', text: stats, url: window.location.href })
        .then(() => this.addEvent('📤 Game shared successfully!'))
        .catch(() => this._fallbackShare(stats));
    } else this._fallbackShare(stats);
  }

  _fallbackShare(stats) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(stats).then(() => {
        this.addEvent('📋 Progress copied to clipboard!');
        alert(stats);
      }).catch(() => alert(stats));
    } else alert(stats);
  }

  handleRestart() {
    if (!confirm('Restart game? All progress will be lost!')) return;
    this.player = new Player();
    // Reset emoji and name
    localStorage.setItem('playerEmoji', '👤');
    localStorage.setItem('playerName', '');
    const playerEmojiBtn = document.getElementById('player-emoji-btn');
    const playerNameEl = document.getElementById('player-name');
    const emojiPicker = document.getElementById('emoji-picker');
    if (playerEmojiBtn) playerEmojiBtn.textContent = '👤';
    if (playerNameEl) playerNameEl.value = '';
    if (emojiPicker) emojiPicker.style.display = 'none';
     // Reset milestone tracking for challenge logic
     this._milestonesReached = {};
    this.updateDisplay();
    this.addEvent('🔄 Game restarted!');
  }

  _handleKeyShortcuts(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key.toLowerCase() === 's' && e.ctrlKey) {
      e.preventDefault();
      this.manualSave();
    } else if (e.key === ' ') {
      e.preventDefault();
      this.handleCookieClick();
    }
  }

  handleCookieClick() {
    const oldCookies = this.player.cookies;
    const clickValue = 1; // central place: later effects can modify
    this.player.addCookies(clickValue, true);
    this.checkMilestones(oldCookies, this.player.cookies);
    this.updateDisplay();
    this.animateCookieClick();
    const displayValue = clickValue === 1 ? '+1' : `+${Math.floor(clickValue)}`;
    this.showFloatingNumber(displayValue, this.cookieElement);
  }

  handleAutoclickerPurchase(type) {
    const success = this.player.buyAutoclicker(type);
    if (!success) {
      // optional feedback could be added
      return;
    }
    this.updateDisplay();
    this.addEvent(`🏭 Bought ${type}! (${this.formatNumber(this.player.autoclickers[type].owned)} owned)`);
    const btn = document.getElementById(type);
    this.animatePurchaseSuccess(btn);
    const emoji = AUTOCLICKER_CONFIG[type] ? AUTOCLICKER_CONFIG[type].emoji : '🏭';
    this.showFloatingNumber(`${emoji} +1`, btn, 'purchase');
    this.updateActiveTooltip(type);
    this.saveGame();
  }

  handleUpgradePurchase(id) {
    const success = this.player.buyUpgrade(id);
    if (!success) return;
    this.updateDisplay();
    this.addEvent(`⚡ Bought ${id}! (${this.formatNumber(this.player.upgrades[id].owned)} owned)`);
    const btn = document.getElementById(id);
    this.animatePurchaseSuccess(btn);
    const emoji = btn ? btn.textContent.trim() : '⚡';
    this.showFloatingNumber(`${emoji}+`, btn, 'upgrade');
    this.updateActiveTooltip(id);
    this.saveGame();
  }

  updateDisplay() {
    if (this.scoreElement) this.scoreElement.textContent = this.formatNumber(Math.floor(this.player.cookies));
    if (this.cpsElement) this.cpsElement.textContent = this.formatNumber(this.player.cookiesPerSecond, 1);
    this._updateAutoclickerButtons();
    this._updateUpgradeButtons();
    if (this.currentTooltipButton) {
      const tip = document.getElementById('game-tooltip');
      if (tip) updateTooltipContent(this.currentTooltipButton, tip);
    }
    document.title = `${this.formatNumber(Math.floor(this.player.cookies))} cookies - Cookie Clicker`;
  }

  /* UI helpers */
  formatNumber(num, decimals = 0) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    if (num === 0) return '0';
    const absNum = Math.abs(num);
    if (absNum >= 1e12) return (num / 1e12).toFixed(decimals) + 'T';
    if (absNum >= 1e9) return (num / 1e9).toFixed(decimals) + 'B';
    if (absNum >= 1e6) return (num / 1e6).toFixed(decimals) + 'M';
    if (decimals > 0) return Number(num).toFixed(decimals);
    return Math.floor(num).toLocaleString();
  }

  _updateAutoclickerButtons() {
    document.querySelectorAll('.autoclickers button').forEach(btn => {
      const type = btn.id;
      const a = this.player.autoclickers[type];
      if (!a) return;
      const cost = this.player.getAutoclickerCost(type);
      // set disabled class based on affordability
      if (this.player.cookies >= cost) btn.classList.remove('disabled');
      else btn.classList.add('disabled');

      // Optionally show cost/owned inside button if you want:
      const costEl = btn.querySelector('.autoclicker-cost');
      const ownedEl = btn.querySelector('.autoclicker-owned');
      if (costEl) costEl.textContent = `Cost: ${this.formatNumber(cost)}`;
      if (ownedEl) ownedEl.textContent = `Owned: ${this.formatNumber(a.owned)}`;
    });
  }

  _updateUpgradeButtons() {
    document.querySelectorAll('.upgrades button').forEach(btn => {
      const id = btn.id;
      const u = this.player.upgrades[id];
      if (!u) return;
      const requiredAutoclicker = u.targetAutoclicker;
      const hasAutoclicker = requiredAutoclicker && this.player.autoclickers[requiredAutoclicker].owned > 0;
      const cost = this.player.getUpgradeCost(id);
      const afford = this.player.cookies >= cost;
      if (hasAutoclicker && afford) btn.classList.remove('disabled');
      else btn.classList.add('disabled');

      const costEl = btn.querySelector('.upgrade-cost');
      const ownedEl = btn.querySelector('.upgrade-owned');
      if (costEl) costEl.textContent = `${this.formatNumber(cost)}`;
      if (ownedEl) ownedEl.textContent = `Owned: ${this.formatNumber(u.owned)}`;

      // tooltip data attribute for quick info (used by tooltip system)
      const nameEl = btn.querySelector('.upgrade-name');
      const title = nameEl ? nameEl.textContent : id;
      btn.setAttribute('data-tooltip', `${title}\nCost: ${this.formatNumber(cost)}\nOwned: ${u.owned}`);
    });
  }

  addEvent(message) {
    const eventsList = document.getElementById('events-list');
    if (!eventsList) return;
    const item = document.createElement('div');
    item.className = 'event-item';
    item.textContent = message;
    eventsList.insertBefore(item, eventsList.firstChild);
    while (eventsList.children.length > 10) eventsList.removeChild(eventsList.lastChild);
  }

  animateCookieClick() {
    const el = this.cookieElement;
    if (!el) return;
    el.classList.remove('cookie-click');
    // reset animation
    void el.offsetWidth;
    el.classList.add('cookie-click');
  setTimeout(() => el.classList.remove('cookie-click'), 150);
  }

  showFloatingNumber(text, element, type = 'click') {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const floating = document.createElement('div');
    floating.className = `floating-number floating-${type}`;
    floating.textContent = text;
    floating.style.position = 'fixed';
    floating.style.zIndex = 1000;
    // Purchase aligns near emoji & others center
    if (type === 'purchase') {
      floating.style.left = (rect.left + 25) + 'px';
      floating.style.top = (rect.top - 10) + 'px';
    } else {
      floating.style.left = (rect.left + rect.width / 2) + 'px';
      floating.style.top = rect.top + 'px';
    }
    document.body.appendChild(floating);
    setTimeout(() => floating.remove(), 2000);
  }

  animatePurchaseSuccess(el) {
    if (!el) return;
    el.classList.add('purchase-success');
    setTimeout(() => el.classList.remove('purchase-success'), 600);
  }

  pulseElement(el) {
    if (!el) return;
    el.classList.add('pulse');
    setTimeout(() => el.classList.remove('pulse'), 1000);
  }

  checkMilestones(oldValue, newValue) {
    // Only trigger challenge at first time reaching 100, 1000, 10000, ...
    const milestones = [100, 1000, 10000, 100000, 1000000];
    if (!this._milestonesReached) this._milestonesReached = {};
    const hasGrandma = this.player.autoclickers.grandma && this.player.autoclickers.grandma.owned > 0;
    for (const m of milestones) {
      // Mark milestone as reached only if grandma is owned
      if (!this._milestonesReached[m]) {
        if (hasGrandma && Math.floor(newValue) >= m) {
          this._milestonesReached[m] = true;
          this.celebrateMilestone(m, true);
          break;
        }
      }
    }
  }

  celebrateMilestone(m, allowChallenge = true) {
    if (this.scoreElement) this.pulseElement(this.scoreElement);
    this.showFloatingNumber(`🎉 ${this.formatNumber(m)} COOKIES!`, this.cookieElement, 'milestone');
    this.addEvent(`🎉 Milestone reached: ${this.formatNumber(m)} cookies!`);
    // Hot Drinks Challenge activation: only if allowed by checkMilestones
    if (allowChallenge && this.player.autoclickers.grandma && this.player.autoclickers.grandma.owned > 0) {
      this._triggerHotDrinksChallenge(m);
    }
  }

    // Returns true if player owns at least one autoclicker
    _playerHasAutoclicker() {
      return Object.values(this.player.autoclickers).some(a => a.owned > 0);
    }

    // Hot Drinks Challenge logic (overlay/timer will be added next)
      _triggerHotDrinksChallenge(milestone) {
        this.player.challengesStarted++;
        // Remove any existing overlay
        let oldOverlay = document.getElementById('drinks-challenge-overlay');
        if (oldOverlay) oldOverlay.remove();

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'drinks-challenge-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(245, 222, 179, 0.55)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.gap = '32px';
        overlay.style.pointerEvents = 'auto';

        // Ensure score/cps display stays above overlay
        const scoreDisplay = document.querySelector('.score-display');
        if (scoreDisplay) {
          scoreDisplay.style.position = 'relative';
          scoreDisplay.style.zIndex = '10000';
        }

  // Title (English)
  const title = document.createElement('div');
  title.textContent = `Warm up! Pick your favorite drink for a CPS boost!`;
        title.style.fontSize = '2.2rem';
        title.style.fontWeight = 'bold';
        title.style.color = '#5d4e37';
        overlay.appendChild(title);

        // Timer
        const timer = document.createElement('div');
        timer.id = 'drinks-challenge-timer';
        timer.textContent = '5';
        timer.style.fontSize = '2.5rem';
        timer.style.fontWeight = 'bold';
        timer.style.color = '#a9743a';
        overlay.appendChild(timer);

        // Drink choices
        const drinksRow = document.createElement('div');
        drinksRow.style.display = 'flex';
        drinksRow.style.gap = '48px';
        drinksRow.style.marginTop = '12px';

        const drinks = [
          { name: 'Coffee', emoji: '☕', boost: 0.05 },
          { name: 'Tea', emoji: '🍵', boost: 0.10 },
          { name: 'Milk', emoji: '🥛', boost: 0.15 }
        ];
        drinks.forEach(drink => {
          const btn = document.createElement('button');
          btn.textContent = drink.emoji;
          btn.title = `${drink.name} (+${Math.round(drink.boost*100)}% CPS)`;
          btn.style.fontSize = '4rem';
          btn.style.background = '#e7bc91';
          btn.style.border = 'none';
          btn.style.borderRadius = '16px';
          btn.style.padding = '18px 32px';
          btn.style.cursor = 'pointer';
          btn.style.boxShadow = '0 2px 12px #a9743a44';
          btn.onmouseenter = () => btn.style.background = '#f6e1c3';
          btn.onmouseleave = () => btn.style.background = '#e7bc91';
          btn.onclick = () => {
            clearInterval(timerInterval);
            overlay.remove();
            this._handleDrinkChoice(drink);
          };
          drinksRow.appendChild(btn);
        });
        overlay.appendChild(drinksRow);

        document.body.appendChild(overlay);

        // Timer countdown
        let timeLeft = 5;
        timer.textContent = timeLeft;
        const timerInterval = setInterval(() => {
          timeLeft--;
          timer.textContent = timeLeft;
          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            overlay.remove();
            this._handleDrinkTimeout();
          }
        }, 1000);
      }

      // Handle drink choice
      _handleDrinkChoice(drink) {
        this.player.challengesChosen++;
        this.player.chosenDrinks[drink.name]++;
        this.player.totalBoostsReceived++;
  this.addEvent(`You picked ${drink.emoji} ${drink.name}! Enjoy +${Math.round(drink.boost*100)}% CPS for 5 seconds!`);
        // CPS boost: temporarily increase cookiesPerSecond
        if (this._cpsBoostTimeout) clearTimeout(this._cpsBoostTimeout);
        if (this._cpsBoostTimerInterval) clearInterval(this._cpsBoostTimerInterval);

        // Save original CPS
        this._originalCPS = this.player.cookiesPerSecond;
        // Increase CPS
        const boostFactor = 1 + drink.boost;
        this.player.cookiesPerSecond *= boostFactor;
        this.updateDisplay();

        // Show boost-timer overlay (English)
        let boostOverlay = document.getElementById('cps-boost-overlay');
        if (boostOverlay) boostOverlay.remove();
        boostOverlay = document.createElement('div');
        boostOverlay.id = 'cps-boost-overlay';
        boostOverlay.style.position = 'fixed';
        boostOverlay.style.top = '32px';
        boostOverlay.style.left = '50%';
        boostOverlay.style.transform = 'translateX(-50%)';
        boostOverlay.style.background = '#e7bc91';
        boostOverlay.style.color = '#5d4e37';
        boostOverlay.style.fontSize = '1.7rem';
        boostOverlay.style.fontWeight = 'bold';
        boostOverlay.style.padding = '12px 32px';
        boostOverlay.style.borderRadius = '16px';
        boostOverlay.style.boxShadow = '0 2px 12px #a9743a44';
        boostOverlay.style.zIndex = '9999';
  boostOverlay.textContent = `${drink.emoji} ${drink.name} boost active! Time left: 5s`;
        document.body.appendChild(boostOverlay);

        let timeLeft = 5;
        this._cpsBoostTimerInterval = setInterval(() => {
          timeLeft--;
          boostOverlay.textContent = `${drink.emoji} ${drink.name} boost active! Time left: ${timeLeft}s`;
          if (timeLeft <= 0) {
            clearInterval(this._cpsBoostTimerInterval);
          }
        }, 1000);

        // Restore CPS after 5s
        this._cpsBoostTimeout = setTimeout(() => {
          this.player.cookiesPerSecond = this._originalCPS;
          this.updateDisplay();
          boostOverlay.textContent = `Your drink boost is over. Back to baking!`;
          setTimeout(() => boostOverlay.remove(), 1800);
        }, 5000);
      }

      // Handle timeout (no choice)
      _handleDrinkTimeout() {
    this.player.challengesTimeout++;
    this.addEvent('Too slow! Your drink got cold.');
    // Show timeout as overlay
    let timeoutOverlay = document.getElementById('cps-boost-overlay');
    if (timeoutOverlay) timeoutOverlay.remove();
    timeoutOverlay = document.createElement('div');
    timeoutOverlay.id = 'cps-boost-overlay';
    timeoutOverlay.style.position = 'fixed';
    timeoutOverlay.style.top = '32px';
    timeoutOverlay.style.left = '50%';
    timeoutOverlay.style.transform = 'translateX(-50%)';
    timeoutOverlay.style.background = '#e7bc91';
    timeoutOverlay.style.color = '#5d4e37';
    timeoutOverlay.style.fontSize = '1.7rem';
    timeoutOverlay.style.fontWeight = 'bold';
    timeoutOverlay.style.padding = '12px 32px';
    timeoutOverlay.style.borderRadius = '16px';
    timeoutOverlay.style.boxShadow = '0 2px 12px #a9743a44';
    timeoutOverlay.style.zIndex = '9999';
    timeoutOverlay.textContent = 'Too slow! Your drink got cold.';
    document.body.appendChild(timeoutOverlay);
    setTimeout(() => timeoutOverlay.remove(), 1800);
      }

  /* TOOLTIP system initialisation (uses global functions below) */
  _initTooltips() {
    initializeTooltips(this);
  }

  // Called by tooltip system when tooltip content should be refreshed
  updateActiveTooltip(buttonType) {
    if (this.currentTooltipButton && this.currentTooltipButton.id === buttonType) {
      const tip = document.getElementById('game-tooltip');
      if (tip) updateTooltipContent(this.currentTooltipButton, tip);
    }
  }
}

/* ======= TOOLTIP FUNCTIONS (kept modular) ======= */
/* these reuse the tooltip element #game-tooltip from your HTML/CSS */
function initializeTooltips(gameInstance) {
  // attach handlers to all relevant buttons
  document.querySelectorAll('.upgrades button, .autoclickers button').forEach(btn => {
    btn.removeEventListener('mouseenter', _showTooltip);
    btn.removeEventListener('mouseleave', _hideTooltip);
    btn.addEventListener('mouseenter', _showTooltip);
    btn.addEventListener('mouseleave', _hideTooltip);
  });

  // internal closures reference the active Game instance via window.cookieGame
  function _showTooltip(e) {
    const tooltip = document.getElementById('game-tooltip');
    if (!tooltip) return;
    // store current button on window.cookieGame for refreshs
    if (window.cookieGame) window.cookieGame.currentTooltipButton = this;
    updateTooltipContent(this, tooltip);

    // make visible then position
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'visible';

    // measure and position
    const rect = this.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const vw = window.innerWidth;
    let tx, ty;

    const isAutoclicker = !!(window.cookieGame && window.cookieGame.player && window.cookieGame.player.autoclickers[this.id]);

    if (isAutoclicker) {
      // try right side
      tx = rect.right + 12;
      ty = rect.top + (rect.height - tooltipRect.height) / 2;
      tooltip.className = 'autoclicker-tooltip-right';
      // if overflow to right, show left
      if (tx + tooltipRect.width > vw - 8) {
        tx = rect.left - tooltipRect.width - 12;
        tooltip.className = 'autoclicker-tooltip-left';
      }
      // clamp vertical
      ty = Math.max(8, Math.min(ty, window.innerHeight - tooltipRect.height - 8));
      // arrow top position:
      const arrowTop = (rect.top + rect.height / 2) - ty;
      tooltip.style.setProperty('--arrow-top', `${Math.max(15, Math.min(arrowTop, tooltipRect.height - 15))}px`);
    } else {
      // upgrades: below or above if not enough space
      tx = rect.left + (rect.width - tooltipRect.width) / 2;
      ty = rect.bottom + 10;
      if (tx < 8) tx = 8;
      if (tx + tooltipRect.width > vw - 8) tx = vw - tooltipRect.width - 8;
      if (ty + tooltipRect.height > window.innerHeight - 8) {
        ty = rect.top - tooltipRect.height - 10;
        tooltip.className = 'upgrade-tooltip-above';
      } else tooltip.className = 'upgrade-tooltip-below';
      const arrowLeft = (rect.left + rect.width / 2) - tx;
      tooltip.style.setProperty('--arrow-left', `${arrowLeft}px`);
    }

    tooltip.style.left = `${tx}px`;
    tooltip.style.top = `${ty}px`;
    tooltip.style.opacity = '1';
  }

  function _hideTooltip() {
    const tooltip = document.getElementById('game-tooltip');
    if (!tooltip) return;
    if (window.cookieGame) window.cookieGame.currentTooltipButton = null;
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';
    tooltip.className = '';
    tooltip.style.removeProperty('--arrow-left');
    tooltip.style.removeProperty('--arrow-top');
  }
}

function updateTooltipContent(button, tooltip) {
  const type = button.id;
  const game = window.cookieGame;
  if (!game || !game.player) return;
  const p = game.player;
  const upgrade = p.upgrades[type];
  const autoclicker = p.autoclickers[type];

  if (upgrade) {
    const cost = p.getUpgradeCost(type);
    const owned = upgrade.owned;
    const desc = UPGRADE_CONFIG[type] ? UPGRADE_CONFIG[type].desc : 'Boosts your cookie production';
    tooltip.textContent = `${desc}\n\nCost: ${game.formatNumber(cost)} cookies\nOwned: ${game.formatNumber(owned)}`;
    return;
  }

  if (autoclicker) {
    const cost = p.getAutoclickerCost(type);
    const owned = autoclicker.owned;
    const prod = autoclicker.baseProduction;
    const total = p.getAutoclickerCPS(type);
    const cfg = AUTOCLICKER_CONFIG[type] || {};
    const desc = cfg.name ? `${cfg.name} generates cookies automatically.` : 'Generates cookies automatically.';
    tooltip.textContent =
      `${desc}\n\nCost: ${game.formatNumber(cost)} cookies\nOwned: ${game.formatNumber(owned)}\nProduction per unit: ${game.formatNumber(prod, 1)} cookies/sec\n\n🍪 TOTAL: ${game.formatNumber(total, 1)} cookies/sec`;
    return;
  }

  // default fallback
  tooltip.textContent = '';
}

/* ======= INIT on DOMContentLoaded ======= */
document.addEventListener('DOMContentLoaded', () => {
  const cookieGame = new Game();
  cookieGame.setupGame();
  window.cookieGame = cookieGame;
});
