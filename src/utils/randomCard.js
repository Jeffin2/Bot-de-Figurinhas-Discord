const cards = require('../models/cards');

function getRandomRarity() {

    const random = Math.random() * 100;

    if (random < 60) return 'Common';

    if (random < 85) return 'Rare';

    if (random < 95) return 'Epic';

    if (random < 99) return 'Legendary';

    return 'Mythic';
}

function getRandomCard() {

    const rarity = getRandomRarity();

    const filtered =
        cards.filter(card =>
            card.rarity === rarity
        );

    return filtered[
        Math.floor(Math.random() * filtered.length)
    ];
}

module.exports = {
    getRandomCard
};