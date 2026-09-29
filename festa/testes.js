// Testes automáticos dos cálculos do placar e do sorteio. Uso: node festa/testes.js
const assert = require("assert");
const C = require("./js/calculos.js");

let ok = 0;
function teste(nome, fn) {
  try { fn(); ok += 1; console.log("✓ " + nome); }
  catch (e) { console.error("✗ " + nome + "\n  " + e.message); process.exitCode = 1; }
}
const pts = (res) => Object.fromEntries(res.map((r) => [r.id, [r.colocacao, r.pontosDaNoite]]));

teste("tabela padrão 5/3/2/1", () => {
  const r = pts(C.calcularPontosDaNoite([{ id: "a", pontosDeJogo: 7 }, { id: "b", pontosDeJogo: 5 }, { id: "c", pontosDeJogo: 3 }, { id: "d", pontosDeJogo: 1 }]));
  assert.deepStrictEqual(r, { a: [1, 5], b: [2, 3], c: [3, 2], d: [4, 1] });
});
teste("dois empatados em 1º recebem 5; o próximo é 3º e recebe 2", () => {
  const r = pts(C.calcularPontosDaNoite([{ id: "a", pontosDeJogo: 4 }, { id: "b", pontosDeJogo: 4 }, { id: "c", pontosDeJogo: 2 }, { id: "d", pontosDeJogo: 1 }]));
  assert.deepStrictEqual(r, { a: [1, 5], b: [1, 5], c: [3, 2], d: [4, 1] });
});
teste("empate em 2º pula o 3º", () => {
  const r = pts(C.calcularPontosDaNoite([{ id: "a", pontosDeJogo: 9 }, { id: "b", pontosDeJogo: 4 }, { id: "c", pontosDeJogo: 4 }, { id: "d", pontosDeJogo: 3 }]));
  assert.deepStrictEqual(r, { a: [1, 5], b: [2, 3], c: [2, 3], d: [4, 1] });
});
teste("três empatados em 1º", () => {
  const r = pts(C.calcularPontosDaNoite([{ id: "a", pontosDeJogo: 2 }, { id: "b", pontosDeJogo: 2 }, { id: "c", pontosDeJogo: 2 }, { id: "d", pontosDeJogo: 1 }]));
  assert.deepStrictEqual(r, { a: [1, 5], b: [1, 5], c: [1, 5], d: [4, 1] });
});
teste("individual: quem fez 0 ou menos recebe 1, qualquer que seja a colocação", () => {
  const r = pts(C.calcularPontosDaNoite([{ id: "a", pontosDeJogo: 3 }, { id: "b", pontosDeJogo: 0 }, { id: "c", pontosDeJogo: -2 }], { individual: true }));
  assert.deepStrictEqual(r, { a: [1, 5], b: [2, 1], c: [3, 1] });
});
teste("ninguém pontuou: todos recebem 1", () => {
  const r = pts(C.calcularPontosDaNoite([{ id: "a", pontosDeJogo: 0 }, { id: "b", pontosDeJogo: 0 }, { id: "c", pontosDeJogo: -1 }]));
  assert.deepStrictEqual(r, { a: [1, 1], b: [1, 1], c: [3, 1] });
});
teste("equipes: time com pontos negativos ainda recebe pela colocação", () => {
  const r = pts(C.calcularPontosDaNoite([{ id: "t0", pontosDeJogo: 5 }, { id: "t1", pontosDeJogo: -1 }], { individual: false }));
  assert.deepStrictEqual(r, { t0: [1, 5], t1: [2, 3] });
});

const noite = () => ({
  jogadores: ["a", "b", "c"].map((id) => ({ id })),
  partidas: [
    { id: "p1", resultados: [{ jogadorId: "a", colocacao: 1, pontosDaNoite: 5 }, { jogadorId: "b", colocacao: 2, pontosDaNoite: 3 }, { jogadorId: "c", colocacao: 3, pontosDaNoite: 2 }] },
    { id: "p2", resultados: [{ jogadorId: "b", colocacao: 1, pontosDaNoite: 5 }, { jogadorId: "c", colocacao: 2, pontosDaNoite: 3 }] },
  ],
  ajustes: [{ jogadorId: "c", pontos: 3 }],
});
teste("totais somam partidas e ajustes", () => {
  const t = C.calcularTotais(noite());
  assert.deepStrictEqual(t.map((x) => [x.id, x.total, x.posicao]), [["b", 8, 1], ["c", 8, 2], ["a", 5, 3]]);
});
teste("desempate no total: mais 1º lugares vence", () => {
  const t = C.calcularTotais(noite());
  assert.strictEqual(t[0].id, "b");
  assert.strictEqual(t[0].primeiros, 1);
});
teste("excluir partida recalcula tudo", () => {
  const t = C.calcularTotais(noite(), "p2");
  assert.deepStrictEqual(t.map((x) => [x.id, x.total]), [["a", 5], ["c", 5], ["b", 3]]);
  assert.strictEqual(t[0].posicao, 1); assert.strictEqual(t[1].posicao, 2);
});
teste("empate total persistente divide a posição", () => {
  const n = { jogadores: [{ id: "a" }, { id: "b" }], partidas: [{ id: "p", resultados: [{ jogadorId: "a", colocacao: 1, pontosDaNoite: 5 }, { jogadorId: "b", colocacao: 1, pontosDaNoite: 5 }] }], ajustes: [] };
  const t = C.calcularTotais(n);
  assert.deepStrictEqual(t.map((x) => x.posicao), [1, 1]);
});
teste("validação rejeita jogador repetido, inexistente e pontos fora de 0–5", () => {
  const n = noite();
  assert.deepStrictEqual(C.validarPartida(n, { id: "x", jogo: "j", resultados: [{ jogadorId: "a", colocacao: 1, pontosDaNoite: 5 }] }), []);
  assert.ok(C.validarPartida(n, { id: "x", jogo: "j", resultados: [{ jogadorId: "a", colocacao: 1, pontosDaNoite: 5 }, { jogadorId: "a", colocacao: 2, pontosDaNoite: 3 }] }).length);
  assert.ok(C.validarPartida(n, { id: "x", jogo: "j", resultados: [{ jogadorId: "zz", colocacao: 1, pontosDaNoite: 5 }] }).length);
  assert.ok(C.validarPartida(n, { id: "x", jogo: "j", resultados: [{ jogadorId: "a", colocacao: 1, pontosDaNoite: 6 }] }).length);
  assert.ok(C.validarPartida(n, { id: "x", jogo: "j", resultados: [{ jogadorId: "a", colocacao: 1, pontosDaNoite: 2.5 }] }).length);
});

teste("sorteio justo: 10 mil sorteios, cada posição perto de 1/N", () => {
  const N = 6, R = 10000, cont = new Array(N).fill(0);
  for (let i = 0; i < R; i++) cont[C.randInt(N)] += 1;
  cont.forEach((c) => assert.ok(Math.abs(c / R - 1 / N) < 0.02, `frequência fora do esperado: ${cont}`));
});
teste("embaralhar: cada item cai em cada posição perto de 1/N", () => {
  const N = 5, R = 10000, m = Array.from({ length: N }, () => new Array(N).fill(0));
  for (let i = 0; i < R; i++) C.embaralhar([0, 1, 2, 3, 4]).forEach((x, pos) => { m[x][pos] += 1; });
  m.forEach((l) => l.forEach((c) => assert.ok(Math.abs(c / R - 1 / N) < 0.025, "viés no embaralhamento")));
});
teste("dividir em times: diferença máxima de 1", () => {
  for (let n = 4; n <= 13; n++) for (let t = 2; t <= 4; t++) {
    const g = C.dividirEmTimes(Array.from({ length: n }, (_, i) => i), t).map((x) => x.length);
    assert.ok(Math.max(...g) - Math.min(...g) <= 1);
    assert.strictEqual(g.reduce((a, b) => a + b, 0), n);
  }
});

console.log(`\n${ok} testes passaram.`);
