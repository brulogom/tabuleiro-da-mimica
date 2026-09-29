// Cálculos puros do placar e do sorteio — sem DOM, para rodar também nos testes (node).
(function (raiz) {
  "use strict";

  // Número inteiro aleatório em [0, n), com gerador criptográfico e sem viés (rejeição).
  function randInt(n) {
    if (n <= 1) return 0;
    const c = raiz.crypto || (typeof require === "function" ? require("crypto").webcrypto : null);
    const limite = Math.floor(0x100000000 / n) * n;
    const buf = new Uint32Array(1);
    let x;
    do { c.getRandomValues(buf); x = buf[0]; } while (x >= limite);
    return x % n;
  }

  function embaralhar(lista) {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = randInt(i + 1);
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function sortear(lista) { return lista[randInt(lista.length)]; }

  // Sorteio com pesos: itens = [{ item, peso }]
  function sortearComPeso(itens) {
    const validos = itens.filter((i) => i.peso > 0);
    const total = validos.reduce((s, i) => s + i.peso, 0);
    if (!validos.length) return null;
    const escala = 10000;
    let r = randInt(Math.round(total * escala)) / escala;
    for (const i of validos) { r -= i.peso; if (r < 0) return i.item; }
    return validos[validos.length - 1].item;
  }

  // Distribui itens em n grupos em rodízio (diferença máxima de 1).
  function dividirEmTimes(itens, n) {
    const emb = embaralhar(itens);
    const times = Array.from({ length: n }, () => []);
    emb.forEach((x, i) => times[i % n].push(x));
    return times;
  }

  const TABELA = { 1: 5, 2: 3, 3: 2 };

  // ranking: [{ id, pontosDeJogo }] → [{ id, colocacao, pontosDeJogo, pontosDaNoite }]
  // Empates recebem a melhor posição e a seguinte é pulada (1, 1, 3...).
  function calcularPontosDaNoite(ranking, opcoes) {
    const individual = !opcoes || opcoes.individual !== false;
    const ord = ranking.slice().sort((a, b) => b.pontosDeJogo - a.pontosDeJogo);
    const ninguemPontuou = ord.every((r) => r.pontosDeJogo <= 0);
    let colocacao = 0;
    return ord.map((r, i) => {
      if (i === 0 || r.pontosDeJogo !== ord[i - 1].pontosDeJogo) colocacao = i + 1;
      let pn = TABELA[colocacao] || 1;
      if (ninguemPontuou) pn = 1;
      else if (individual && r.pontosDeJogo <= 0) pn = 1;
      return { id: r.id, colocacao, pontosDeJogo: r.pontosDeJogo, pontosDaNoite: pn };
    });
  }

  // Totais da noite, sempre recalculados a partir das partidas e ajustes.
  // Desempate: mais 1º lugares, depois mais 2º lugares; persistindo, dividem a posição.
  function calcularTotais(noite, excluirPartidaId) {
    const mapa = {};
    noite.jogadores.forEach((j) => {
      mapa[j.id] = { id: j.id, total: 0, primeiros: 0, segundos: 0, partidas: 0 };
    });
    noite.partidas.forEach((p) => {
      if (p.id === excluirPartidaId) return;
      p.resultados.forEach((r) => {
        const m = mapa[r.jogadorId];
        if (!m) return;
        m.total += r.pontosDaNoite;
        m.partidas += 1;
        if (r.colocacao === 1) m.primeiros += 1;
        if (r.colocacao === 2) m.segundos += 1;
      });
    });
    (noite.ajustes || []).forEach((a) => { if (mapa[a.jogadorId]) mapa[a.jogadorId].total += a.pontos; });
    const lista = Object.values(mapa).sort((a, b) =>
      b.total - a.total || b.primeiros - a.primeiros || b.segundos - a.segundos);
    lista.forEach((m, i) => {
      const ant = lista[i - 1];
      if (ant && ant.total === m.total && ant.primeiros === m.primeiros && ant.segundos === m.segundos) m.posicao = ant.posicao;
      else m.posicao = i + 1;
    });
    return lista;
  }

  // Validação do contrato registrarPartida. Devolve lista de erros (vazia = ok).
  function validarPartida(noite, p) {
    const erros = [];
    if (!p || typeof p !== "object") return ["partida ausente"];
    if (!p.id) erros.push("partida sem id");
    if (!p.jogo) erros.push("partida sem jogo");
    if (!Array.isArray(p.resultados) || !p.resultados.length) erros.push("partida sem resultados");
    else {
      const vistos = {};
      const ids = {};
      noite.jogadores.forEach((j) => { ids[j.id] = true; });
      p.resultados.forEach((r) => {
        if (vistos[r.jogadorId]) erros.push("jogador repetido: " + r.jogadorId);
        vistos[r.jogadorId] = true;
        if (!ids[r.jogadorId]) erros.push("jogador inexistente: " + r.jogadorId);
        if (!Number.isInteger(r.pontosDaNoite) || r.pontosDaNoite < 0 || r.pontosDaNoite > 5) erros.push("pontosDaNoite inválido para " + r.jogadorId);
        if (!Number.isInteger(r.colocacao) || r.colocacao < 1) erros.push("colocação inválida para " + r.jogadorId);
      });
    }
    return erros;
  }

  const api = { randInt, embaralhar, sortear, sortearComPeso, dividirEmTimes, calcularPontosDaNoite, calcularTotais, validarPartida };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else raiz.Calc = api;
})(typeof window !== "undefined" ? window : globalThis);
