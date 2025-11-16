export const PLAYLISTS = [
  {
    id: "pl-geral",
    nome: "Músicas gerais",
    categoria: "Geral",
    img: require("../assets_images/imgmusica7.jpg"),
    tracks: [
      {
        id: "musica1",
        nome: "Worderful",
        categoria: "Geral",
        duracao: "4:37",
        img: require("../assets_images/imgmusica5.jpg"),
        file: require("../assets_audios/musica1.mp3"),
      },
      {
        id: "musica2",
        nome: "LoFi",
        categoria: "Geral",
        duracao: "2:50",
        img: require("../assets_images/imgmusica6.jpg"),
        file: require("../assets_audios/musica2.mp3"),
      },
    ],
  },
  {
    id: "pl-natureza",
    nome: "Natureza",
    categoria: "Ambiente",
    img: require("../assets_images/imgmusica8.png"),
    tracks: [
      {
        id: "nat1",
        nome: "Chuva",
        categoria: "Natureza",
        duracao: "15:00",
        img: require("../assets_images/imgmusica3.jpg"),
        file: require("../assets_audios/nat1.mp3"),
      },
      {
        id: "nat2",
        nome: "Floresta",
        categoria: "Natureza",
        duracao: "10:00",
        img: require("../assets_images/imgmusica4.jpg"),
        file: require("../assets_audios/nat2.mp3"),
      },
    ],
  },
  {
    id: "pl-freq",
    nome: "Frequências para Focar",
    categoria: "Ruído",
    img: require("../assets_images/imgmusica9.jpg"),
    tracks: [
      {
        id: "ruido1",
        nome: "white noise",
        categoria: "Freq foco",
        duracao: "15:00",
        img: require("../assets_images/imgmusica1.jpeg"),
        file: require("../assets_audios/ruido1.mp3"),
      },
      {
        id: "ruido2",
        nome: "Brown noise",
        categoria: "Freq foco",
        duracao: "10:20",
        img: require("../assets_images/imgmusica2.jpg"),
        file: require("../assets_audios/ruido2.mp3"),
      },
    ],
  },
];

export default PLAYLISTS;
