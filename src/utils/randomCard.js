const cards = require('../models/cards');

function randomCard() {

    const randomIndex =
        Math.floor(Math.random() * cards.length);

    return cards[randomIndex];
}

module.exports = randomCard;