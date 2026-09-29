// Palavra proibida — faça seu time adivinhar sem usar as palavras mais óbvias.
(function () {
  "use strict";
  const JOGO = {
    id: "palavra-proibida", nome: "Palavra proibida", icone: "🚫", cor: "#C2255C", jogadores: "4+", duracao: "10–25 min", min: 4, max: 30,
    resumo: "Explique a palavra para o seu time sem dizer as cinco palavras proibidas. O fiscal está de olho na buzina!",
    descricao: "Faça seu time adivinhar a palavra sem usar as palavras mais óbvias — elas estão proibidas.",
    regras: `<p>1. Os times se alternam. No turno do time, um <b>explicador</b> descreve a palavra-alvo e o resto do time adivinha.</p>
      <p>2. Não vale dizer a palavra-alvo nem as <b>cinco proibidas</b> — nem em outra forma (plural, diminutivo, derivada), nem em outra língua, nem pedaços da palavra.</p>
      <p>3. Não vale gesto, mímica, soletrar ou dar pistas da forma da palavra (letra inicial, número de sílabas, "rima com…").</p>
      <p>4. Um jogador do outro time é o <b>fiscal</b>: fica ao lado do explicador e aperta a <b>buzina</b> se ouvir uma infração.</p>
      <p>Acerto +1, buzina −1, pulo 0 (ou −1, se configurado).</p>`,
    abrir: () => configurar(),
  };
  F.registrarJogo(JOGO);

  const decks = () => (window.CONTEUDO.palavraProibida || []).filter((d) => F.publicoOk(null, d));
  const PADRAO = { tempo: 60, duracao: "voltas", voltas: 1, meta: 25, puloCusta: false, limitePulos: 0, ultimaChance: false, dificuldade: "misturado", baralhos: null };

  function configurar(participantes) {
    const cfg = F.config("palavra-proibida", PADRAO);
    const ds = decks();
    if (!cfg.baralhos || !cfg.baralhos.length) cfg.baralhos = ds.map((d) => d.id);
    cfg.baralhos = cfg.baralhos.filter((id) => ds.some((d) => d.id === id));
    if (!cfg.baralhos.length) cfg.baralhos = ds.map((d) => d.id);
    F.telaConfig({
      jogo: JOGO, min: 4, max: 30, participantes,
      corpo: () => F.opcao("Tempo por turno", F.chipsOpcao("tempo", [[45, "45 s"], [60, "60 s"], [90, "90 s"]], cfg.tempo)) +
        F.opcao("Duração", F.chipsOpcao("duracao", [["voltas", "Por voltas"], ["meta", "Por meta de pontos"]], cfg.duracao) +
          (cfg.duracao === "voltas" ? F.chipsOpcao("voltas", [[1, "1 volta"], [2, "2 voltas"], [3, "3 voltas"]], cfg.voltas) : F.chipsOpcao("meta", [[15, "15 pontos"], [25, "25 pontos"], [35, "35 pontos"]], cfg.meta))) +
        F.opcao("Pulo", F.chipsOpcao("puloCusta", [[false, "Livre"], [true, "Custa 1 ponto"]], cfg.puloCusta)) +
        F.opcao("Limite de pulos por turno", F.chipsOpcao("limitePulos", [[0, "Sem limite"], [3, "3"], [5, "5"]], cfg.limitePulos)) +
        F.opcao("Última chance (adversário tenta em 5 s)", F.chipsOpcao("ultimaChance", [[false, "Não"], [true, "Sim"]], cfg.ultimaChance)) +
        F.opcao("Dificuldade", F.chipsOpcao("dificuldade", [["facil", "Fácil"], ["medio", "Médio"], ["dificil", "Difícil"], ["misturado", "Misturado"]], cfg.dificuldade)) +
        F.opcao("Baralhos", F.chipsMulti("baralhos", ds.map((d) => [d.id, d.nome]), cfg.baralhos)),
      montar: (main, render) => F.ligarChips(main, cfg, render, { tempo: "number", voltas: "number", meta: "number", limitePulos: "number", puloCusta: "boolean", ultimaChance: "boolean" }),
      aoComecar: (jogs) => {
        F.guardarConfig("palavra-proibida", cfg);
        F.montarTimes({ jogadores: jogs, min: 2, max: 4, minPorTime: 2, titulo: "Palavra proibida · times", texto: "Mínimo de 2 jogadores por time.", aoPronto: (times) => partida(cfg, jogs, times) });
      },
    });
  }

  function partida(cfg, jogs, times) {
    F.telaAcesa(true);
    const P = { inicio: F.agoraISO(), pontos: {}, jogados: {}, rodizio: {}, turnoN: 0, fiscalIdx: {}, acertosJog: {} };
    times.forEach((t) => { P.pontos[t.id] = 0; P.jogados[t.id] = 0; P.rodizio[t.id] = 0; P.fiscalIdx[t.id] = 0; });
    jogs.forEach((j) => { P.acertosJog[j.id] = 0; });
    const maior = Math.max(...times.map((t) => t.jogadores.length));
    const turnosPorTime = maior * cfg.voltas;
    const todas = [];
    decks().filter((d) => cfg.baralhos.includes(d.id)).forEach((d) => d.cartas.forEach((c) => {
      if (cfg.dificuldade === "misturado" || c.dificuldade === cfg.dificuldade) todas.push(c);
    }));
    const chave = (c) => c.alvo;
    let fila = F.novos("palavra-proibida", todas, chave);
    let desempate = null; // lista de times no desempate

    function proximaCarta() {
      while (fila.length) {
        const c = fila.shift();
        if (!F.banida("palavra-proibida", chave(c))) { F.marcarUsado("palavra-proibida", chave(c)); return c; }
      }
      fila = F.novos("palavra-proibida", todas, chave); // acabou: libera as já vistas
      const c = fila.shift();
      if (c) F.marcarUsado("palavra-proibida", chave(c));
      return c || null;
    }

    function timeDaVez() {
      if (desempate) return desempate[0];
      return times[P.turnoN % times.length];
    }
    function fimDaPartida() {
      const completouVolta = P.turnoN % times.length === 0;
      if (!completouVolta) return false;
      if (cfg.duracao === "voltas") return P.turnoN >= turnosPorTime * times.length;
      return times.some((t) => P.pontos[t.id] >= cfg.meta);
    }

    function telaVez() {
      const t = timeDaVez();
      const expl = t.jogadores[P.rodizio[t.id] % t.jogadores.length];
      const idxT = times.indexOf(t);
      const adv = times[(idxT + 1) % times.length];
      const fiscal = adv.jogadores[P.fiscalIdx[adv.id] % adv.jogadores.length];
      const main = F.mostrar(`<div class="card" style="align-items:center;text-align:center">
          <span class="rotulo">${desempate ? "Desempate — turno extra de 30 s" : cfg.duracao === "voltas" ? `Turno ${P.turnoN + 1} de ${turnosPorTime * times.length}` : `Meta: ${cfg.meta} pontos`}</span>
          ${F.tagTime(t)}
          <div class="gigante">Explica ${F.esc(F.nome(expl).toUpperCase())}</div>
          <p class="lede">Fiscal sugerido: <b>${F.esc(F.nome(fiscal))}</b> (${F.esc(adv.nome)}) — fica ao lado do explicador, vendo a carta, com o dedo na buzina. Qualquer adversário pode buzinar.</p>
          <button class="btn grande" id="comecar">Começar ▶</button></div>`, { titulo: "Palavra proibida", emPartida: true });
      F.$("#comecar", main).onclick = () => turno(t, expl, adv);
    }

    function turno(t, expl, adv) {
      const cartas = []; // { carta, status: ok|pulou|buzina }
      let atual = null, cron = null, bloqueado = false, acabou = false, pausado = false;
      const tempo = desempate ? 30 : cfg.tempo;
      const pulos = () => cartas.filter((c) => c.status === "pulou").length;

      async function comecar() {
        await F.contagem({ titulo: "Palavra proibida", acima: F.tagTime(t) });
        mostrar(proximaCarta());
      }
      function mostrar(c) {
        atual = c;
        if (!c) { fim(); return; }
        const podePular = !cfg.limitePulos || pulos() < cfg.limitePulos;
        const main = F.mostrar(`
          <button id="buzina" style="border:none; width:100%; min-height:84px; background:#C2261D; color:#fff; font-family:'Baloo 2'; font-weight:800; font-size:1.8rem; letter-spacing:.05em; touch-action:manipulation">📢 BUZINA</button>
          <div style="flex:1; display:flex; flex-direction:column; gap:14px; padding:14px 16px; align-items:center">
            <div class="linha entre" style="width:100%"><span id="cr"></span>${F.tagTime(t)}<span class="medio">✓ ${cartas.filter((x) => x.status === "ok").length}</span></div>
            <div class="faixa" style="--cor:${t.cor}; justify-content:center; width:min(760px,100%); min-height:110px"><div id="alvo" class="gigante" style="text-align:center; width:100%">${F.esc(c.alvo)}</div></div>
            <div class="coluna" style="width:min(520px,100%); gap:6px">${c.proibidas.map((p) => `<div class="medio" style="display:flex;gap:10px;align-items:center;border-bottom:1.5px dashed var(--border);padding:4px 0">🚫 <span>${F.esc(p)}</span></div>`).join("")}</div>
            <div class="linha" style="width:min(760px,100%); margin-top:auto">
              <button class="btn grande sec" id="pular" style="flex:1" ${podePular ? "" : "disabled"}>↷ PULAR${cfg.limitePulos ? ` (${cfg.limitePulos - pulos()})` : ""}</button>
              <button class="btn grande ok" id="acertou" style="flex:2; min-height:96px; font-size:1.6rem">✓ ACERTOU</button>
            </div>
          </div>`, { titulo: "Palavra proibida", emPartida: true, classe: "cheia" });
        if (!cron) { cron = F.cronometro({ segundos: tempo, tam: 90, cor: t.cor, somFim: "fim", aoTerminar: () => fim() }); cron.iniciar(); }
        F.$("#cr", main).appendChild(cron.el);
        F.caber(F.$("#alvo", main), Math.min(window.innerWidth / 7, 110), 30, 1);
        F.$("#acertou", main).onclick = () => marcar("ok");
        F.$("#pular", main).onclick = () => marcar("pulou");
        F.$("#buzina", main).addEventListener("pointerdown", (e) => { e.preventDefault(); marcar("buzina"); });
        F.aoPausar = pausar;
      }
      function marcar(st) {
        if (bloqueado || acabou || pausado || !atual) return;
        bloqueado = true;
        cartas.push({ carta: atual, status: st });
        atual = null;
        if (st === "ok") { F.som("acerto"); F.vibrar(60); }
        else if (st === "pulou") F.som("passa");
        else { F.som("buzina"); F.vibrar([200, 60, 200]); F.flash("vermelho", "📢 BUZINA!"); }
        F.timeout(() => { bloqueado = false; if (!acabou && !pausado) mostrar(proximaCarta()); }, st === "buzina" ? 800 : 250);
      }
      function pausar() {
        if (acabou || pausado) return;
        pausado = true;
        cron && cron.pausar();
        const main = F.mostrar(`<div class="coluna" style="align-items:center;text-align:center;margin-top:10vh"><div class="enorme">⏸ Pausado</div>
          <button class="btn grande" id="cont">Continuar ▶</button></div>`, { titulo: "Palavra proibida", emPartida: true });
        F.$("#cont", main).onclick = () => { pausado = false; bloqueado = false; mostrar(atual || proximaCarta()); cron.iniciar(); };
      }
      function fim() {
        if (acabou) return;
        acabou = true;
        cron && cron.parar();
        const emJogo = atual; // descartada
        atual = null;
        F.flash("vermelho", "⏱ TEMPO!", 1100);
        F.timeout(() => (cfg.ultimaChance && emJogo && !desempate ? ultimaChance(emJogo) : resumo(null)), 1100);
      }
      function ultimaChance(carta) {
        const c5 = F.cronometro({ segundos: 5, tam: 180, cor: adv.cor, alerta: 5, aoTerminar: () => {} });
        const main = F.mostrar(`<div class="card" style="align-items:center;text-align:center">
            <span class="rotulo">Última chance</span>${F.tagTime(adv)}
            <div class="enorme">5 segundos para adivinhar a carta que estava em jogo!</div><div id="cr"></div>
            <p class="lede">O explicador confere: a palavra era a da última carta.</p>
            <div class="linha"><button class="btn grande perigo" id="nao">✗ Não</button><button class="btn grande ok" id="sim">✓ Acertaram (+1)</button></div></div>`, { titulo: "Palavra proibida", emPartida: true });
        F.$("#cr", main).appendChild(c5.el);
        c5.iniciar();
        F.$("#sim", main).onclick = () => { c5.parar(); F.som("acerto"); resumo({ time: adv, carta }); };
        F.$("#nao", main).onclick = () => { c5.parar(); resumo(null); };
      }
      function resumo(uc) {
        const ICON = { ok: "✓", pulou: "↷", buzina: "📢" }, PROX = { ok: "pulou", pulou: "buzina", buzina: "ok" }, COR = { ok: "ok", pulou: "aviso", buzina: "perigo" };
        const render = () => {
          const ok = cartas.filter((c) => c.status === "ok").length, bz = cartas.filter((c) => c.status === "buzina").length, pl = pulos();
          const pts = ok - bz - (cfg.puloCusta ? pl : 0);
          const main = F.mostrar(`<div class="card">
              <div class="linha entre"><h2>Resumo — ${F.esc(t.nome)}</h2><span class="medio">${pts >= 0 ? "+" : ""}${pts}</span></div>
              <p class="lede">Toque numa carta para corrigir (✓ → ↷ → 📢). O grupo decide as contestações. 🚫 tira a carta do jogo.</p>
              <div class="coluna">${cartas.map((c, i) => `<div class="linha" style="gap:8px"><button class="btn ${COR[c.status]}" data-i="${i}" style="flex:1;justify-content:flex-start">${ICON[c.status]} ${F.esc(c.carta.alvo)}</button>
                <button class="mini-btn" data-ban="${i}">🚫</button></div>`).join("") || '<p class="mudo">Nenhuma carta.</p>'}</div>
              ${uc ? `<div class="aviso-box">Última chance: ${F.esc(uc.time.nome)} acertou "${F.esc(uc.carta.alvo)}" (+1)</div>` : ""}
              <div class="linha fim"><button class="btn grande" id="ok">Confirmar ✓</button></div></div>`, { titulo: "Palavra proibida", emPartida: true });
          F.$$("[data-i]", main).forEach((b) => b.onclick = () => { const c = cartas[+b.dataset.i]; c.status = PROX[c.status]; render(); });
          F.$$("[data-ban]", main).forEach((b) => b.onclick = async () => {
            const c = cartas[+b.dataset.ban];
            if (await F.confirmar(`Não mostrar mais "${c.carta.alvo}"?`, "", { sim: "Tirar a carta" })) { F.banir("palavra-proibida", chave(c.carta)); F.toast("Carta removida."); }
          });
          F.$("#ok", main).onclick = () => {
            P.pontos[t.id] += pts;
            P.acertosJog[expl] += ok;
            if (uc) P.pontos[uc.time.id] += 1;
            P.rodizio[t.id] += 1;
            P.fiscalIdx[adv.id] += 1;
            depoisDoTurno();
          };
        };
        render();
      }
      comecar();
    }

    function depoisDoTurno() {
      if (desempate) {
        desempate.shift();
        if (desempate.length) { placar(); return; }
        desempate = null;
        terminar();
        return;
      }
      P.turnoN += 1;
      if (fimDaPartida()) {
        const max = Math.max(...times.map((t) => P.pontos[t.id]));
        const empatados = times.filter((t) => P.pontos[t.id] === max);
        if (empatados.length > 1 && !P.jaDesempatou) {
          P.jaDesempatou = true;
          desempate = empatados.slice();
          F.modal(`<h2>Empate!</h2><p class="lede">${empatados.map((t) => F.esc(t.nome)).join(" e ")} empataram com ${max} pontos. Cada um joga um turno extra de 30 s.</p><div class="linha fim"><button class="btn" data-f>Vamos!</button></div>`,
            (el, m) => { F.$("[data-f]", el).onclick = () => { m.fechar(); placar(); }; });
          return;
        }
        terminar();
        return;
      }
      placar();
    }

    function placar() {
      const prox = timeDaVez();
      const main = F.mostrar(`<div class="card"><h2>Placar</h2>
          <div class="coluna">${times.slice().sort((a, b) => P.pontos[b.id] - P.pontos[a.id]).map((t) => `<div class="linha entre">${F.tagTime(t)}<span class="mudo">${t.jogadores.map(F.nome).join(", ")}</span><strong style="font-size:1.8rem">${P.pontos[t.id]}</strong></div>`).join("")}</div>
          <div class="linha entre"><span class="lede">Agora: ${F.tagTime(prox)}</span><button class="btn grande" id="seg">Próximo turno ▶</button></div></div>`, { titulo: "Palavra proibida", emPartida: true });
      F.$("#seg", main).onclick = telaVez;
    }

    function terminar() {
      const best = Object.entries(P.acertosJog).sort((a, b) => b[1] - a[1])[0];
      F.finalizarPartida({
        jogo: "palavra-proibida", inicio: P.inicio, resultados: F.resultadosDeTimes(times, P.pontos), rotuloPJ: "pts do time",
        destaques: best && best[1] ? [`Melhor explicador: ${F.nome(best[0])} (${best[1]} acertos)`] : [],
        jogarDeNovo: () => configurar(jogs.map((j) => j.id)),
      });
    }
    telaVez();
  }
})();
