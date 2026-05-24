const base = [
  "Lucas","João","Pedro","Gabriel","Rafael",
  "Mateus","Bruno","Diego","Thiago","Carlos",
  "Alex","Daniel","Leon","Miguel","Victor"
];

const surnames = [
  "Silva","Santos","Costa","Oliveira","Pereira",
  "Almeida","Ferreira","Rodrigues","Lima","Gomes"
];

function r(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName(selection) {

  if (selection === "Lendárias") {
    const legends = [
      "Pelé ICON","Maradona ICON","Zidane ICON",
      "Ronaldo ICON","Messi ICON","Cristiano ICON"
    ];
    return r(legends);
  }

  if (selection === "Míticas") {
    const mythics = [
      "Deus do Futebol",
      "Titã Supremo",
      "Lenda Imortal",
      "Caos Absoluto",
      "Fantasma Dourado"
    ];
    return r(mythics);
  }

  return `${r(base)} ${r(surnames)}`;
}

module.exports = generateName;