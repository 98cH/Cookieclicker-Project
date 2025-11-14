export class PlayerProfile {
    constructor() {
        this.name = '';
        this.emoji = '👤';
        this.nameInput = document.getElementById('player-name');
        this.emojiBtn = document.getElementById('player-emoji-btn');
        this.emojiPicker = document.getElementById('emoji-picker');
        this.emojiChoices = Array.from(document.querySelectorAll('.emoji-choice'));
        this.bindUI();

    }

    bindUI() {
        // Toon/verberg emoji-picker bij klik op emoji-knop
        this.emojiBtn.addEventListener('click', () => {
            this.emojiPicker.style.display = this.emojiPicker.style.display === 'flex' ? 'none' : 'flex';
        });
        // Kies emoji
        this.emojiChoices.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setEmoji(btn.textContent);
                this.emojiPicker.style.display = 'none';
            });
        });
        // Naam opslaan bij wijziging
        this.nameInput.addEventListener('input', () => {
            this.setName(this.nameInput.value);
        });
    }

    setEmoji(emoji) {
        this.emoji = emoji;
        this.emojiBtn.textContent = emoji;
        
    }

    setName(name) {
        this.name = name;
        if (this.nameInput) this.nameInput.value = name; 
        
    }

    getProfileData() {
    return {
        name: this.name,
        emoji: this.emoji,
    };
}

    setProfileData(data) {
     if (data.name !== undefined) this.setName(data.name); 
    if (data.emoji !== undefined) this.setEmoji(data.emoji);
}

}