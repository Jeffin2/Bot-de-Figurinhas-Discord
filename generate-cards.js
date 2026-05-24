const fs = require('fs');

const selections = [
    "Brazil", "Argentina", "France", "Germany", "Spain",
    "Portugal", "Italy", "England", "Netherlands", "Belgium",
    "Uruguay", "Croatia", "USA", "Mexico", "Japan",
    "South Korea", "Morocco", "Senegal", "Switzerland", "Denmark",
    "Poland", "Ecuador", "Canada", "Australia", "Serbia",
    "Cameroon", "Ghana", "Nigeria", "Peru", "Chile",
    "Colombia", "Saudi Arabia", "Qatar", "Iran", "Costa Rica",
    "Wales", "Austria", "Hungary", "Czechia", "Scotland",
    "Turkey", "Ukraine", "Romania", "Norway", "Iceland",
    "Algeria", "Egypt"
];

const legends = "Legends";
const mythics = "Mythics";

function getRarity(i) {

    if (i === 0) return "Legendary";
    if (i === 1 || i === 2) return "Epic";
    if (i <= 6) return "Rare";
    return "Common";
}

let cards = [];
let idCounter = 1;

// ==========================
// WORLD CUP (48 seleções)
// ==========================
selections.forEach((team, index) => {

    for (let i = 0; i < 10; i++) {

        cards.push({
            id: `WC${String(idCounter).padStart(3, '0')}`,
            name: `${team} Player ${i + 1}`,
            rarity: getRarity(i),
            selection: team,
            teamType: "worldcup",
            page: index + 1
        });

        idCounter++;
    }
});

// ==========================
// LEGENDS (10 jogadores)
// ==========================
for (let i = 0; i < 10; i++) {

    cards.push({
        id: `LG${String(i + 1).padStart(3, '0')}`,
        name: `Legend Player ${i + 1}`,
        rarity: "Legendary",
        selection: legends,
        teamType: "legends",
        page: 49
    });
}

// ==========================
// MYTHICS (10 jogadores)
// ==========================
for (let i = 0; i < 10; i++) {

    cards.push({
        id: `MY${String(i + 1).padStart(3, '0')}`,
        name: `Mythic Player ${i + 1}`,
        rarity: "Mythic",
        selection: mythics,
        teamType: "mythics",
        page: 50
    });
}

// salvar arquivo final
fs.writeFileSync(
    './src/models/cards.js',
    `module.exports = ${JSON.stringify(cards, null, 4)};`
);

console.log("✅ 500 cartas geradas com sucesso!");