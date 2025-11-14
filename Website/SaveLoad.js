export class SaveLoad {
    constructor() {
        this.gameSaveKey = 'cookieGameSave';
    }

    save(game, playerProfile) {
        const data = {
            cookies: game.getCookies(),
            cps: game.getCps(),
            autoclickers: game.autoclickers.map(ac => ({
                name: ac.name,
                owned: ac.owned,
                baseProduction: ac.baseProduction,
                baseCost: ac.baseCost
            })),
            upgrades: game.upgrades.map(up => ({
                name: up.name,
                owned: up.owned
            })),
          profile: playerProfile.getProfileData()
        };
        
        localStorage.setItem(this.gameSaveKey, JSON.stringify(data));
    }

    load() {
        const saved = localStorage.getItem(this.gameSaveKey);
        if (!saved) return null;
        return JSON.parse(saved);
    }

    reset() {
        localStorage.removeItem(this.gameSaveKey);
        location.reload();
    }
}
