const fs = require("fs");
const generateName = require("./src/utils/nameGenerator");

const selecoes = [
  "Brasil","Argentina","França","Alemanha","Portugal",
  "Espanha","Inglaterra","Itália","Holanda","Uruguai",
  "Colômbia","México","Estados Unidos","Bélgica","Croácia",
  "Marrocos","Japão","Coreia do Sul","Senegal","Suíça",
  "Dinamarca","Noruega","Suécia","Polônia","Chile",
  "Peru","Equador","Paraguai","Bolívia","Áustria",
  "Sérvia","Turquia","Rússia","Grécia","Camarões",
  "Nigéria","Costa do Marfim","Austrália","Arábia Saudita",
  "Irã","Tunísia","Egito","Canadá","Jamaica",
  "Panamá","Honduras","Venezuela"
];

const cards = [];

// 🌍 48 seleções
selecoes.forEach(sel => {
  for (let i = 1; i <= 10; i++) {
    cards.push({
      id: `${sel.slice(0,3).toUpperCase()}${i}`,
      name: generateName(sel),
      selection: sel,
      rarity:
        i <= 6 ? "Comum" :
        i <= 9 ? "Raro" : "Épico"
    });
  }
});

// ⭐ LENDÁRIAS
for (let i = 1; i <= 10; i++) {
  cards.push({
    id: `LEG${i}`,
    name: generateName("Lendárias"),
    selection: "Lendárias",
    rarity: "Lendário"
  });
}

// 🔴 MÍTICAS
for (let i = 1; i <= 10; i++) {
  cards.push({
    id: `MYT${i}`,
    name: generateName("Míticas"),
    selection: "Míticas",
    rarity: "Mítico"
  });
}

// 💾 SALVA FIXO (ESSENCIAL)
fs.writeFileSync(
  "./cards.json",
  JSON.stringify(cards, null, 2)
);

console.log("✔ Cards gerados com sucesso: " + cards.length);