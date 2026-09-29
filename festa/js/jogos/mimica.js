// Tabuleiro da Mímica — o jogo original, que continua sendo uma página própria (mimica.html).
(function () {
  "use strict";
  F.registrarJogo({
    id: "mimica", nome: "Tabuleiro da Mímica", icone: "🎭", cor: "#FF5A36", jogadores: "2–6 equipes", duracao: "20–40 min", externo: true,
    resumo: "Mímica em tabuleiro: cada acerto anda uma casa. Casas misteriosas, 10 categorias e mais de mil palavras.",
    abrir: () => { window.location.href = F.MIMICA_URL; },
  });
})();
