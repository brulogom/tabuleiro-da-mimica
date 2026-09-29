// Impostor — todos recebem a mesma palavra secreta, menos o impostor.
(function () {
  "use strict";
  const JOGO = {
    id: "impostor", nome: "Impostor", icone: "🕵️", cor: "#7048E8", jogadores: "4–12", duracao: "3–5 min/rodada", min: 4, max: 12,
    resumo: "Todos sabem a palavra secreta, menos um. Descubram o impostor antes que ele descubra a palavra.",
    descricao: "Todos recebem a mesma palavra secreta — menos o impostor, que precisa fingir que sabe qual é.",
    regras: `<p>1. O tablet passa de mão em mão. Cada um vê a palavra secreta em segredo — menos o <b>impostor</b>, que só vê o tema.</p>
      <p>2. <b>Pistas:</b> a partir de quem o app sortear, cada um diz <b>uma única palavra</b> ligada à secreta. Vaga para não entregar, precisa para provar que você sabe.</p>
      <p>3. <b>Discussão</b> e <b>votação</b>: no três, todos apontam para quem acham que é o impostor.</p>
      <p>4. Se o mais votado não for o impostor, ele vence (+3). Se for, ele tem uma última chance: acertar a palavra (+2). Errou, todos os outros ganham +1.</p>`,
    abrir: () => configurar(),
  };
  F.registrarJogo(JOGO);

  const temasDisp = () => (window.CONTEUDO.impostor || []).filter((t) => F.publicoOk(null, t));
  const PADRAO = { rodadas: 5, temas: null, voltas: 1, discussao: 120, votacao: "aberta", veTema: true, impostorComeca: false };

  function configurar(participantes) {
    const cfg = F.config("impostor", PADRAO);
    const disp = temasDisp();
    if (!cfg.temas || !cfg.temas.length) cfg.temas = disp.map((t) => t.id);
    cfg.temas = cfg.temas.filter((id) => disp.some((t) => t.id === id));
    if (!cfg.temas.length) cfg.temas = disp.map((t) => t.id);
    F.telaConfig({
      jogo: JOGO, min: 4, max: 12, participantes,
      corpo: () => F.opcao("Rodadas", F.chipsOpcao("rodadas", [[3, "3"], [5, "5"], [8, "8"]], cfg.rodadas)) +
        F.opcao("Temas", F.chipsMulti("temas", disp.map((t) => [t.id, t.tema]), cfg.temas)) +
        F.opcao("Voltas de pistas", F.chipsOpcao("voltas", [[1, "1 volta"], [2, "2 voltas"]], cfg.voltas)) +
        F.opcao("Discussão", F.chipsOpcao("discussao", [[0, "Sem"], [60, "1 min"], [120, "2 min"], [180, "3 min"]], cfg.discussao)) +
        F.opcao("Votação", F.chipsOpcao("votacao", [["aberta", "Aberta (apontar)"], ["secreta", "Secreta (no tablet)"]], cfg.votacao)) +
        F.opcao("Impostor vê o tema", F.chipsOpcao("veTema", [[true, "Sim"], [false, "Não"]], cfg.veTema)) +
        F.opcao("Impostor pode começar as pistas", F.chipsOpcao("impostorComeca", [[false, "Não"], [true, "Sim"]], cfg.impostorComeca)),
      montar: (main, render) => F.ligarChips(main, cfg, render, { rodadas: "number", voltas: "number", discussao: "number", veTema: "boolean", impostorComeca: "boolean" }),
      aoComecar: (jogs) => { F.guardarConfig("impostor", cfg); partida(cfg, jogs); },
    });
  }

  function partida(cfg, jogs) {
    F.telaAcesa(true);
    const temas = temasDisp().filter((t) => cfg.temas.includes(t.id));
    const P = { inicio: F.agoraISO(), rodada: 0, pontos: {}, impostores: [], escapes: {}, pegos: 0 };
    jogs.forEach((j) => { P.pontos[j.id] = 0; P.escapes[j.id] = 0; });
    let R = null; // rodada atual

    function sortearPalavra() {
      const pool = [];
      temas.forEach((t) => t.palavras.forEach((p) => pool.push({ tema: t, palavra: p })));
      const item = F.novos("impostor", pool, (x) => x.tema.id + ":" + x.palavra)[0];
      F.marcarUsado("impostor", item.tema.id + ":" + item.palavra);
      return item;
    }
    function sortearImpostor() {
      const n = P.impostores.length;
      return F.calc.sortearComPeso(jogs.map((j) => {
        let peso = 1;
        if (P.impostores[n - 1] === j.id) peso = 0; // nunca duas rodadas seguidas
        else if (P.impostores[n - 2] === j.id) peso = 0.4;
        else if (P.impostores[n - 3] === j.id) peso = 0.7;
        return { item: j.id, peso };
      }));
    }
    function sortearRodada() {
      const w = sortearPalavra();
      R = { tema: w.tema, palavra: w.palavra, impostor: sortearImpostor() };
      const podem = jogs.filter((j) => cfg.impostorComeca || j.id !== R.impostor);
      R.comeca = F.sortear(podem).id;
    }
    function novaRodada() {
      P.rodada += 1;
      sortearRodada();
      distribuir();
    }
    function segredo(j) {
      if (j.id === R.impostor) return { topo: "Você é o", grande: "IMPOSTOR", baixo: cfg.veTema ? "Tema: " + R.tema.tema : "Tema: ???", extra: "Finja que sabe a palavra!" };
      return { topo: "Sua palavra:", grande: R.palavra.toUpperCase(), baixo: "Tema: " + R.tema.tema, extra: "Não deixe o impostor descobrir!" };
    }
    async function refazer() {
      if (!(await F.confirmar("Sortear de novo?", "Sai uma palavra nova e um impostor novo, e a distribuição recomeça para todos.", { sim: "Sortear de novo" }))) return;
      sortearRodada();
      distribuir();
    }
    function distribuir() {
      F.distribuir({
        jogadores: jogs, modo: "segurar", titulo: `Impostor · rodada ${P.rodada}/${cfg.rodadas}`, segredo,
        botoes: [{ texto: "🤷 Não conheço essa palavra", acao: refazer }],
        aoTerminar: () => pistas(1),
      });
    }

    function ordemDesde(id) {
      const i = jogs.findIndex((j) => j.id === id);
      return jogs.slice(i).concat(jogs.slice(0, i));
    }
    function verDeNovo(voltar) {
      F.escolherJogador(jogs, "Quem quer ver a carta de novo?").then((j) => {
        if (!j) { voltar(); return; }
        F.privacidade({ jogador: j, modo: "segurar", segredo, titulo: "Ver a carta de novo", aoConcluir: voltar });
      });
    }

    function pistas(volta) {
      const c = F.jog(R.comeca);
      const main = F.mostrar(`<div class="card">
          <div class="linha entre"><span class="rotulo">Rodada ${P.rodada} de ${cfg.rodadas} · Pistas · volta ${volta} de ${cfg.voltas}</span><span class="rotulo">Tema: ${F.esc(R.tema.tema)}</span></div>
          <div class="coluna" style="align-items:center; text-align:center">
            <p class="medio mudo">Começa</p>${F.bolaGrande(c)}<div class="gigante">${F.esc(c.nome.toUpperCase())}</div>
            <p class="lede">Cada um diz <b>uma única palavra</b> ligada à palavra secreta, nesta ordem:</p>
            <div class="chips" style="justify-content:center">${ordemDesde(R.comeca).map((j, i) => `<span class="pill"><b>${i + 1}.</b> ${F.pill(j)}</span>`).join("")}</div>
          </div>
          <div class="linha"><button class="btn sec" id="ver">👀 Ver minha carta de novo</button>${volta === 1 ? '<button class="btn fantasma" id="refazer">🔄 Refazer sorteio</button>' : ""}
            <span class="espaco"></span><button class="btn grande" id="seguir">${volta < cfg.voltas ? "Próxima volta ▶" : cfg.discussao ? "Discussão ▶" : "Votação ▶"}</button></div>
        </div>`, { titulo: "Impostor", emPartida: true });
      F.$("#ver", main).onclick = () => verDeNovo(() => pistas(volta));
      const rf = F.$("#refazer", main);
      if (rf) rf.onclick = refazer;
      F.$("#seguir", main).onclick = () => (volta < cfg.voltas ? pistas(volta + 1) : cfg.discussao ? discussao() : votacao(jogs.map((j) => j.id), false));
    }

    function discussao() {
      const cron = F.cronometro({ segundos: cfg.discussao, tam: 220, aoTerminar: () => { F.som("apito"); } });
      const main = F.mostrar(`<div class="card" style="align-items:center; text-align:center">
          <span class="rotulo">Rodada ${P.rodada} de ${cfg.rodadas}</span>
          <h2 class="enorme">Discussão</h2><p class="lede">Conversem à vontade: quem parece não saber a palavra?</p>
          <div id="cr"></div>
          <div class="linha"><button class="btn sec" id="pausa">⏸ Pausar</button><button class="btn sec" id="ver">👀 Ver carta</button><button class="btn grande" id="votar">Ir para a votação ▶</button></div>
        </div>`, { titulo: "Impostor", emPartida: true });
      F.$("#cr", main).appendChild(cron.el);
      cron.iniciar();
      F.$("#pausa", main).onclick = (e) => { if (cron.rodando()) { cron.pausar(); e.target.textContent = "▶ Continuar"; } else { cron.iniciar(); e.target.textContent = "⏸ Pausar"; } };
      F.$("#ver", main).onclick = () => { cron.parar(); verDeNovo(discussao); };
      F.$("#votar", main).onclick = () => { cron.parar(); votacao(jogs.map((j) => j.id), false); };
      F.aoPausar = () => { cron.pausar(); const b = F.$("#pausa"); if (b) b.textContent = "▶ Continuar"; };
    }

    // candidatos: ids que podem ser votados; desempate: se já é a segunda votação
    function votacao(candidatos, desempate) {
      if (cfg.votacao === "secreta") return votacaoSecreta(candidatos, desempate);
      const main = F.mostrar(`<div class="card" style="align-items:center; text-align:center">
          <span class="rotulo">${desempate ? "Nova votação — só entre os empatados" : "Votação"}</span>
          <h2 class="enorme">No três, todo mundo aponta para quem acha que é o impostor!</h2>
          <button class="btn grande" id="ja">3, 2, 1… apontem! ☝️</button></div>`, { titulo: "Impostor", emPartida: true });
      F.$("#ja", main).onclick = async () => {
        await F.contagem({ titulo: "Impostor", acima: '<p class="medio">Preparem o dedo…</p>' });
        F.som("buzina");
        escolherMaisVotado(candidatos, desempate);
      };
    }
    function escolherMaisVotado(candidatos, desempate) {
      const main = F.mostrar(`<div class="card">
          <h2 class="enorme centro-txt">APONTEM! 👉</h2>
          <p class="lede">Toque em quem recebeu mais votos.</p>
          <div class="chips">${candidatos.map((id) => `<button class="chip radio" data-v="${id}" style="padding:8px; font-size:1.2rem">${F.pill(F.jog(id))}</button>`).join("")}</div>
          <div class="linha"><button class="btn sec" id="empate">🤝 Deu empate</button></div></div>`, { titulo: "Impostor", emPartida: true });
      F.$$("[data-v]", main).forEach((b) => b.onclick = async () => {
        const j = F.jog(b.dataset.v);
        if (await F.confirmar(`${j.nome} foi o mais votado?`, "", { sim: "Confirmar" })) revelar(j.id);
      });
      F.$("#empate", main).onclick = () => {
        if (desempate) { revelar(null); return; }
        const sel = new Set();
        F.modal(`<h2>Quem empatou?</h2><div class="chips">${candidatos.map((id) => `<button class="chip" data-e="${id}" style="padding:4px">${F.pill(F.jog(id))}</button>`).join("")}</div>
          <div class="linha fim"><button class="btn sec" data-c>Cancelar</button><button class="btn" data-ok>Defesas ▶</button></div>`, (el, m) => {
          F.$$("[data-e]", el).forEach((b) => b.onclick = () => { const id = b.dataset.e; sel.has(id) ? sel.delete(id) : sel.add(id); b.classList.toggle("ativo", sel.has(id)); });
          F.$("[data-c]", el).onclick = m.fechar;
          F.$("[data-ok]", el).onclick = () => { if (sel.size < 2) { F.toast("Escolha pelo menos 2."); return; } m.fechar(); defesas(Array.from(sel)); };
        });
      };
    }
    function defesas(empatados) {
      let i = 0;
      const prox = () => {
        if (i >= empatados.length) { votacao(empatados, true); return; }
        const j = F.jog(empatados[i]);
        const cron = F.cronometro({ segundos: 20, tam: 200, cor: j.cor, aoTerminar: () => { i += 1; F.timeout(prox, 800); } });
        const main = F.mostrar(`<div class="card" style="align-items:center;text-align:center">
            <span class="rotulo">Empate — defesa ${i + 1} de ${empatados.length}</span>${F.bolaGrande(j)}
            <div class="gigante">${F.esc(j.nome.toUpperCase())}</div><p class="medio">defenda-se!</p><div id="cr"></div>
            <button class="btn sec" id="pular">Terminou ▶</button></div>`, { titulo: "Impostor", emPartida: true });
        F.$("#cr", main).appendChild(cron.el);
        cron.iniciar();
        F.$("#pular", main).onclick = () => { cron.parar(); i += 1; prox(); };
        F.aoPausar = () => cron.pausar();
      };
      prox();
    }
    function votacaoSecreta(candidatos, desempate) {
      const votos = {};
      candidatos.forEach((id) => { votos[id] = 0; });
      let i = 0;
      const prox = () => {
        if (i >= jogs.length) return apurar();
        const eleitor = jogs[i];
        F.privacidade({
          jogador: eleitor, modo: "interagir", titulo: desempate ? "Nova votação secreta" : "Votação secreta",
          montar: (area, pronto) => {
            const opcoes = candidatos.filter((id) => id !== eleitor.id);
            area.innerHTML = `<div class="card"><h2>${F.esc(eleitor.nome)}, quem é o impostor?</h2><p class="lede">Seu voto é secreto.</p>
              <div class="chips">${opcoes.map((id) => `<button class="chip radio" data-v="${id}" style="padding:8px;font-size:1.15rem">${F.pill(F.jog(id))}</button>`).join("")}</div></div>`;
            F.$$("[data-v]", area).forEach((b) => b.onclick = async () => {
              if (!(await F.confirmar(`Votar em ${F.nome(b.dataset.v)}?`, "", { sim: "Votar" }))) return;
              votos[b.dataset.v] += 1;
              pronto();
            });
            if (!opcoes.length) pronto();
          },
          aoConcluir: () => { i += 1; prox(); },
        });
      };
      const apurar = () => {
        const max = Math.max(...Object.values(votos));
        const topo = Object.keys(votos).filter((id) => votos[id] === max);
        const main = F.mostrar(`<div class="card" style="align-items:center;text-align:center"><h2 class="enorme">Apuração</h2>
          <div class="coluna" style="width:min(480px,100%)">${Object.keys(votos).sort((a, b) => votos[b] - votos[a]).map((id) => `<div class="linha entre">${F.pill(F.jog(id))}<strong style="font-size:1.4rem">${votos[id]} voto${votos[id] === 1 ? "" : "s"}</strong></div>`).join("")}</div>
          <button class="btn grande" id="seg">${topo.length > 1 ? (desempate ? "Empate de novo… ▶" : "Empate! Defesas ▶") : "Revelar ▶"}</button></div>`, { titulo: "Impostor", emPartida: true });
        F.$("#seg", main).onclick = () => { if (topo.length === 1) revelar(topo[0]); else if (desempate) revelar(null); else defesas(topo); };
      };
      prox();
    }

    async function revelar(votadoId) {
      const main = F.mostrar(`<div class="coluna" style="align-items:center;text-align:center;margin-top:12vh"><div class="enorme pisca">Revelando…</div></div>`, { titulo: "Impostor", emPartida: true });
      void main;
      F.som("suspense");
      await F.esperar(2000);
      const imp = F.jog(R.impostor);
      F.som("revelacao");
      let html;
      if (!votadoId) {
        html = `<p class="medio">Empate de novo — ninguém sai.</p>${F.bolaGrande(imp)}<div class="gigante">${F.esc(imp.nome.toUpperCase())}</div><p class="medio">era o impostor e escapou! 🎉</p>`;
      } else if (votadoId === R.impostor) {
        html = `${F.bolaGrande(imp)}<div class="gigante">${F.esc(imp.nome.toUpperCase())}</div><p class="medio"><b>era</b> o impostor! 🎯</p>`;
      } else {
        const v = F.jog(votadoId);
        html = `<div class="enorme">${F.esc(v.nome.toUpperCase())}</div><p class="medio"><b>não era</b> o impostor… era ${imp.nome.toUpperCase()}!</p>${F.bolaGrande(imp)}`;
      }
      const pego = votadoId === R.impostor;
      const m2 = F.mostrar(`<div class="card" style="align-items:center;text-align:center">${html}
          <p class="lede">A palavra era <b>${F.esc(R.palavra)}</b>${pego ? " — mas o impostor ainda tem uma última chance." : "."}</p>
          <button class="btn grande" id="seg">${pego ? "Última chance ▶" : "Placar da rodada ▶"}</button></div>`, { titulo: "Impostor", emPartida: true });
      if (pego) {
        F.$(".lede", m2).innerHTML = "O impostor ainda tem uma última chance…";
        F.$("#seg", m2).onclick = ultimaChance;
      } else {
        F.$("#seg", m2).onclick = () => fimRodada("escapou");
      }
    }
    function ultimaChance() {
      const imp = F.jog(R.impostor);
      const main = F.mostrar(`<div class="card" style="align-items:center;text-align:center">
          <span class="rotulo">Última chance</span>${F.bolaGrande(imp)}
          <div class="enorme">${F.esc(imp.nome.toUpperCase())}, qual é a palavra?</div>
          <p class="lede">Diga em voz alta. Depois toquem para ver a palavra.</p>
          <button class="btn grande" id="mostrar">Mostrar a palavra 👀</button>
          <div id="res" class="oculto coluna" style="align-items:center"><div class="gigante">${F.esc(R.palavra.toUpperCase())}</div>
            <div class="linha"><button class="btn grande perigo" id="errou">✗ Errou</button><button class="btn grande ok" id="acertou">✓ Acertou</button></div></div>
        </div>`, { titulo: "Impostor", emPartida: true });
      F.$("#mostrar", main).onclick = (e) => { e.target.classList.add("oculto"); F.$("#res", main).classList.remove("oculto"); F.som("revelacao"); };
      F.$("#acertou", main).onclick = () => fimRodada("acertou");
      F.$("#errou", main).onclick = () => fimRodada("pego");
    }
    function fimRodada(desfecho) {
      P.impostores.push(R.impostor);
      const imp = F.jog(R.impostor);
      let txt;
      if (desfecho === "escapou") { P.pontos[R.impostor] += 3; P.escapes[R.impostor] += 1; txt = `${imp.nome} não foi descoberto: +3 para o impostor.`; F.som("erro"); }
      else if (desfecho === "acertou") { P.pontos[R.impostor] += 2; P.escapes[R.impostor] += 1; txt = `${imp.nome} foi pego, mas acertou a palavra: +2 para o impostor.`; F.som("acerto"); }
      else { jogs.forEach((j) => { if (j.id !== R.impostor) P.pontos[j.id] += 1; }); P.pegos += 1; txt = `${imp.nome} foi pego e errou a palavra: +1 para cada um dos outros.`; F.som("vitoria"); }
      const ultima = P.rodada >= cfg.rodadas;
      const ord = jogs.slice().sort((a, b) => P.pontos[b.id] - P.pontos[a.id]);
      const main = F.mostrar(`<div class="card">
          <div class="linha entre"><h2>Placar · rodada ${P.rodada} de ${cfg.rodadas}</h2></div>
          <div class="aviso-box" style="border-color:var(--accent);background:transparent">${F.esc(txt)}</div>
          <div class="coluna">${ord.map((j) => `<div class="linha entre">${F.pill(j)}<strong style="font-size:1.5rem">${P.pontos[j.id]}</strong></div>`).join("")}</div>
          <div class="linha fim"><button class="btn grande" id="seg">${ultima ? "Resultado da partida 🏁" : "Próxima rodada ▶"}</button></div></div>`, { titulo: "Impostor", emPartida: true });
      F.$("#seg", main).onclick = () => (ultima ? terminar() : novaRodada());
    }
    function terminar() {
      const destaques = [];
      jogs.forEach((j) => { if (P.escapes[j.id] >= 2) destaques.push(`${j.nome} escapou ${P.escapes[j.id]} vezes como impostor`); });
      if (P.pegos) destaques.push(`O grupo desmascarou o impostor ${P.pegos} vez${P.pegos === 1 ? "" : "es"}`);
      F.finalizarPartida({ jogo: "impostor", inicio: P.inicio, resultados: F.resultadosIndividuais(P.pontos), destaques, jogarDeNovo: () => configurar(jogs.map((j) => j.id)) });
    }
    novaRodada();
  }
})();
