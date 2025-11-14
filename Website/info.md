## Hoog-niveau overzicht

Bestanden:
- `Website/Index.html` — HTML-structuur en elementen (left/center/right kolommen, knoppen, cookie afbeelding, tooltip container).
- `Website/Coockie.js` — alle game‑logica, UI bindingen, tooltips, autosave, animaties.
- `Website/Coockie.css` — layout (3 kolommen), styling, tooltip-stijlen, animaties, responsive regels.

### Data model en state
- Klasse `Player`
	- Properties: `cookies`, `totalClicks`, `cookiesPerSecond`, `autoclickers`, `upgrades`, `totalCookiesEarned`, `moneySpent`, `bestCookiesPerSecond`, `gameStartTime`.
	- Methoden: `initializeAutoclickers()`, `initializeUpgrades()`, `addCookies()`, `buyAutoclicker()`, `buyUpgrade()`, `updateCookiesPerSecond()`, `getAutoclickerCost()`, `getUpgradeCost()`, `saveGame()`, `loadGame()`, `deleteSave()`.

- Klasse `Game`
	- Verantwoordelijkheid: UI- en runtime-coördinatie — DOM elementen vinden, events binden, game loop en autosave beheren, animaties en tooltips.
	- Belangrijke methodes: `setupGame()`, `findDOMElements()`, `setupEventListeners()`, `handleCookieClick()`, `handleAutoclickerPurchase()`, `handleUpgradePurchase()`, `updateDisplay()`, `startGameLoop()`, `startAutoSave()`, `saveGame()`.

### UI elementen en bindings
- Autoclicker buttons (`.autoclickers button`, ids: `cursor`, `grandma`, ... ) → kopen via `buyAutoclicker`.
- Upgrade buttons (`.upgrades button`, ids: `cursor-upgrade`, ... ) → kopen via `buyUpgrade`.
- Controls (`#save-game`, `#restart-game`, `#share-game`) → save / restart / share acties.
- Cookie afbeelding (`.cookie`) → klik: voeg cookies toe, animatie, floating number.
- Score displays: `#cookie-count`, `#cookies-per-second`, `#save-indicator`.
- Events log: `#events-list` (max 10 items).

### Timers / intervals
- Game loop: `setInterval(gameStep, 100)` — 10 ticks/sec, voegt `cookiesPerSecond / 10` per tick toe.
- Auto-save: `setInterval(saveGame, 500)` — autosave elke 0.5s.

### Storage / persistence
- `localStorage` keys:
	- `cookieClickerSave` — JSON met volledige spelerstate (cookies, autoclickers, upgrades, etc.).
	- `playerName`, `playerEmoji` — UI profiel.

### Visuals & Animaties
- CSS animaties: `cookieClick`, `purchaseSuccess`, `floatingNumber`, `pulse`.
- Floating numbers: dynamisch element `.floating-number` met types `purchase`, `upgrade`, `milestone`.
- Tooltip element `#game-tooltip` wordt dynamisch gepositioneerd en gevuld.

### Tooltip systeem
- Functies: `initializeTooltips()`, `showTooltip()`, `hideTooltip()`, `updateTooltipContent()`.
- Positie-logica: anders voor autoclickers (rechts/links van emoji) en upgrades (boven/onder de knop). Gebruikt CSS-variabelen `--arrow-top`/`--arrow-left`.

### Kostenberekeningen & aankopen
- Autoclicker cost: `ceil(baseCost * 1.15^owned)`.
- Upgrade cost: `ceil(baseCost * 1.15^owned * (owned + 1))`.
- Koop: controle op `cookies >= cost`, aftrekken, increment `owned`, update CPS / apply upgrade.

### Edge cases en aandachtspunten
- `showSaveIndicator()` is leeg — save-indicator UI wordt niet getoggled.
- Autosave 500ms is vrij agressief; kan debounced of verlengd worden.
- Tooltip- en floating-elementen gebruiken viewport-gebaseerde positionering (`fixed`) — werkt meestal correct.
- `formatNumber` retourneert `'0'` voor 0 (designkeuze).


