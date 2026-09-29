// Quem sou eu? — tablet na testa, o grupo dá as dicas.
(function () {
  "use strict";
  const JOGO = {
    id: "quem-sou-eu", nome: "Quem sou eu?", icone: "🤔", cor: "#E8590C", jogadores: "2+", duracao: "10–20 min", min: 2, max: 30,
    resumo: "Tablet na testa: o grupo dá dicas e você tenta adivinhar a palavra. Incline para baixo se acertou.",
    descricao: "Com o tablet na testa, você tenta adivinhar a palavra que todo mundo está vendo — e o grupo dá as dicas.",
    regras: `<p>1. Quem adivinha segura o tablet na testa, deitado, com a tela virada para o grupo.</p>
      <p>2. Depois do 3-2-1 aparece uma palavra. O grupo dá dicas do jeito que quiser — falando, fazendo mímica, cantando — só não pode dizer a palavra nem parte dela.</p>
      <p>3. <b>Acertou:</b> incline o tablet para baixo (tela para o chão). <b>Quer pular:</b> incline para cima (tela para o teto).</p>
      <p>4. No modo <b>Apoiado</b>, o tablet fica em pé na mesa e um ajudante toca em ACERTOU ou PASSA.</p>
      <p>+1 ponto por acerto. No fim do tempo, dá para corrigir cada carta no resumo.</p>`,
    abrir: () => configurar(),
  };
  F.registrarJogo(JOGO);

  const decks = () => (window.CONTEUDO.quemSouEu || []).filter((d) => F.publicoOk(null, d));
  const PADRAO = { modo: null, controle: "testa", tempo: 60, voltas: 1, puloCusta: false, baralhos: ["animais", "comidas", "objetos"] };
  const sensorCfg = () => Object.assign({ limite: 45, rearme: 20 }, F.prefs.sensor || {});

  // Ângulo da tela em relação ao horizonte: +90 = virada para o teto, −90 = para o chão, 0 = em pé.
  // Usa beta/gamma do deviceorientation, que valem em qualquer orientação da tela.
  function angulo(e) {
    const r = Math.PI / 180;
    const up = Math.cos(e.beta * r) * Math.cos(e.gamma * r);
    return Math.asin(Math.max(-1, Math.min(1, up))) / r;
  }
  async function pedirSensor() {
    try {
      if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        const r = await DeviceOrientationEvent.requestPermission();
        if (r !== "granted") return false;
      }
    } catch (e) { return false; }
    if (!("DeviceOrientationEvent" in window)) return false;
    return new Promise((resolve) => {
      let ok = false;
      const h = (e) => { if (e.beta != null && e.gamma != null) { ok = true; window.removeEventListener("deviceorientation", h); resolve(true); } };
      window.addEventListener("deviceorientation", h);
      setTimeout(() => { if (!ok) { window.removeEventListener("deviceorientation", h); resolve(false); } }, 1200);
    });
  }
  function ouvirSensor(cb) {
    const h = (e) => { if (e.beta != null && e.gamma != null) cb(angulo(e)); };
    window.addEventListener("deviceorientation", h);
    const parar = () => window.removeEventListener("deviceorientation", h);
    F.aoLimpar(parar);
    return parar;
  }
  async function paisagem() {
    try { if (!document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); } catch (e) {}
    try { await screen.orientation.lock("landscape"); } catch (e) {}
  }
  function soltarPaisagem() {
    try { screen.orientation.unlock(); } catch (e) {}
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
  }

  function configurar(participantes) {
    const cfg = F.config("quem-sou-eu", PADRAO);
    const ds = decks();
    cfg.baralhos = cfg.baralhos.filter((id) => ds.some((d) => d.id === id));
    if (!cfg.baralhos.length) cfg.baralhos = ds.slice(0, 3).map((d) => d.id);
    const tela = F.telaConfig({
      jogo: JOGO, min: 2, max: 30, participantes,
      corpo: () => {
        const modo = cfg.modo || (F.ativos().length >= 4 ? "equipes" : "todos");
        return F.opcao("Modo", F.chipsOpcao("modo", [["equipes", "👥 Equipes"], ["todos", "🙋 Todos contra todos"]], modo)) +
          F.opcao("Controle", F.chipsOpcao("controle", [["testa", "🤳 Na testa (inclinar)"], ["apoiado", "🖐️ Apoiado (botões)"]], cfg.controle) + '<button class="btn fantasma" id="testar" style="align-self:flex-start">🧭 Testar sensor</button>') +
          F.opcao("Tempo por turno", F.chipsOpcao("tempo", [[30, "30 s"], [60, "60 s"], [90, "90 s"], [120, "120 s"]], cfg.tempo)) +
          F.opcao("Voltas", F.chipsOpcao("voltas", [[1, "1"], [2, "2"], [3, "3"]], cfg.voltas)) +
          F.opcao("Pulo custa ponto", F.chipsOpcao("puloCusta", [[false, "Não"], [true, "Sim (−1)"]], cfg.puloCusta)) +
          F.opcao("Baralhos", F.chipsMulti("baralhos", ds.map((d) => [d.id, d.icone + " " + d.nome]), cfg.baralhos));
      },
      montar: (main, render) => {
        F.ligarChips(main, cfg, render, { tempo: "number", voltas: "number", puloCusta: "boolean", modo: "string" });
        F.$("#testar", main).onclick = () => testarSensor(() => tela.render());
      },
      aoComecar: (jogs) => {
        cfg.modo = cfg.modo || (jogs.length >= 4 ? "equipes" : "todos");
        F.guardarConfig("quem-sou-eu", cfg);
        if (cfg.modo === "equipes") {
          if (jogs.length < 4) { F.toast("Para jogar em equipes são precisos 4 jogadores. Mudei para todos contra todos."); cfg.modo = "todos"; partida(cfg, jogs, null); return; }
          F.montarTimes({ jogadores: jogs, min: 2, max: 4, minPorTime: 2, titulo: "Quem sou eu? · times", aoPronto: (times) => partida(cfg, jogs, times) });
        } else partida(cfg, jogs, null);
      },
    });
  }

  async function testarSensor(voltar) {
    const ok = await pedirSensor();
    const sc = sensorCfg();
    let neutro = null, ult = 0;
    const main = F.mostrar(`<div class="card" style="align-items:center;text-align:center">
        <h2>🧭 Testar sensor</h2>
        ${ok ? '<p class="lede">Segure o tablet na testa, toque em "Marcar neutro" e incline para baixo e para cima.</p>' : '<div class="aviso-box">Sensor de movimento indisponível ou sem permissão. Use o modo Apoiado.</div>'}
        <div class="gigante" id="ang">–</div><div class="medio" id="res">&nbsp;</div>
        <div class="campo" style="width:min(420px,100%)"><span class="rotulo">Inclinação para contar: <b id="lv">${sc.limite}°</b></span><input type="range" min="25" max="70" value="${sc.limite}" id="lim"></div>
        <div class="campo" style="width:min(420px,100%)"><span class="rotulo">Volta ao neutro: <b id="rv">±${sc.rearme}°</b></span><input type="range" min="8" max="35" value="${sc.rearme}" id="rea"></div>
        <div class="linha"><button class="btn sec" id="neutro">Marcar neutro</button><button class="btn" id="ok">Pronto</button></div></div>`, { titulo: "Quem sou eu?" });
    F.$("#lim", main).oninput = (e) => { sc.limite = +e.target.value; F.$("#lv", main).textContent = sc.limite + "°"; };
    F.$("#rea", main).oninput = (e) => { sc.rearme = +e.target.value; F.$("#rv", main).textContent = "±" + sc.rearme + "°"; };
    F.$("#neutro", main).onclick = () => { neutro = ult; F.som("toque"); };
    const parar = ouvirSensor((a) => {
      ult = a;
      const el = F.$("#ang"); if (!el) return;
      const d = neutro == null ? a : a - neutro;
      el.textContent = Math.round(d) + "°";
      F.$("#res").textContent = neutro == null ? "" : d <= -sc.limite ? "✓ ACERTOU" : d >= sc.limite ? "↷ PASSOU" : Math.abs(d) <= sc.rearme ? "neutro" : "…";
    });
    F.$("#ok", main).onclick = () => { parar(); F.prefs.sensor = sc; F.salvarPrefs(); voltar(); };
  }

  function partida(cfg, jogs, times) {
    F.telaAcesa(true);
    const P = { inicio: F.agoraISO(), pontos: {}, turnos: [], idx: 0, pulados: [], acertosJog: {} };
    const escolhidos = decks().filter((d) => cfg.baralhos.includes(d.id));
    const todas = [];
    escolhidos.forEach((d) => d.cartas.forEach((c) => todas.push({ deck: d.id, carta: c })));
    const chave = (x) => x.deck + ":" + x.carta;
    let fila = F.novos("quem-sou-eu", todas, chave);
    let controle = cfg.controle;

    // Ordem dos turnos
    if (times) {
      times.forEach((t) => { P.pontos[t.id] = 0; });
      const maior = Math.max(...times.map((t) => t.jogadores.length));
      for (let k = 0; k < maior * cfg.voltas; k++) times.forEach((t) => P.turnos.push({ time: t, jogador: t.jogadores[k % t.jogadores.length] }));
    } else {
      jogs.forEach((j) => { P.pontos[j.id] = 0; });
      for (let v = 0; v < cfg.voltas; v++) jogs.forEach((j) => P.turnos.push({ time: null, jogador: j.id }));
    }
    jogs.forEach((j) => { P.acertosJog[j.id] = 0; });

    function proximaCarta() {
      while (fila.length) {
        const c = fila.shift();
        if (!F.banida("quem-sou-eu", chave(c))) { F.marcarUsado("quem-sou-eu", chave(c)); return c; }
      }
      if (P.pulados.length) { fila = F.embaralhar(P.pulados); P.pulados = []; return fila.shift(); }
      return null;
    }

    function telaVez() {
      const t = P.turnos[P.idx];
      const j = F.jog(t.jogador);
      const main = F.mostrar(`<div class="card" style="align-items:center;text-align:center">
          <span class="rotulo">Turno ${P.idx + 1} de ${P.turnos.length}</span>
          ${F.bolaGrande(j)}<div class="gigante">Vez de ${F.esc(j.nome.toUpperCase())}</div>
          ${t.time ? F.tagTime(t.time) : ""}
          <p class="lede">${controle === "testa" ? "🤳 Segure o tablet na testa, deitado, com a tela virada para o grupo. Incline para <b>baixo</b> se acertou e para <b>cima</b> para pular." : "🖐️ Apoie o tablet virado para o grupo. Quem adivinha fica de costas para a tela; um ajudante toca em ACERTOU ou PASSA."}</p>
          <div class="linha"><button class="btn sec" id="trocar">${controle === "testa" ? "Usar modo Apoiado" : "Usar na testa"}</button><button class="btn grande" id="comecar">Começar ▶</button></div></div>`,
        { titulo: "Quem sou eu?", emPartida: true });
      F.$("#trocar", main).onclick = () => { controle = controle === "testa" ? "apoiado" : "testa"; telaVez(); };
      F.$("#comecar", main).onclick = async () => {
        if (controle === "testa") {
          const ok = await pedirSensor();
          if (!ok) { controle = "apoiado"; F.toast("Sensor indisponível — mudei para o modo Apoiado.", true); telaVez(); return; }
        }
        paisagem();
        turno(t);
      };
    }

    function turno(t) {
      const cartas = []; // { item, status: "ok"|"pulou" }
      let atual = null, cron = null, desde = 0, armado = true, neutro = null, ultAng = null, bloqueado = false, acabou = false, pausado = false;
      let pararSensor = null;
      if (controle === "testa") pararSensor = ouvirSensor((a) => { ultAng = a; checar(); });

      async function comecar() {
        const eqTxt = t.time ? `<div>${F.tagTime(t.time)}</div>` : "";
        await F.contagem({ titulo: "Quem sou eu?", acima: eqTxt, abaixo: controle === "testa" ? '<p class="medio">Tablet na testa!</p>' : "" });
        neutro = ultAng; armado = true;
        mostrarCarta(atual || proximaCarta());
      }
      function mostrarCarta(c) {
        atual = c;
        if (!c) { fimTurno(true); return; }
        desde = performance.now();
        const main = F.mostrar(`
          <div style="position:relative; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; padding:12px; min-height:70vh">
            <div class="linha entre" style="width:100%"><span id="cr"></span><span class="medio">✓ <span id="nacertos">${cartas.filter((x) => x.status === "ok").length}</span></span></div>
            <div id="palavra" class="gigante" style="text-align:center; width:100%; line-height:1.05">${F.esc(c.carta)}</div>
            ${controle === "apoiado" ? `<div class="linha" style="width:100%; justify-content:space-between">
                <button class="btn grande aviso" id="passa" style="flex:1; min-height:90px">↷ PASSA</button>
                <button class="btn grande ok" id="acertou" style="flex:1.4; min-height:90px">✓ ACERTOU</button></div>` : '<p class="mudo">⬇ acertou · ⬆ passa</p>'}
            <button class="btn fantasma" id="encerrar" style="position:absolute; right:8px; bottom:8px; min-height:40px; padding:6px 12px; font-size:.85rem">⏹ Encerrar</button>
          </div>`, { titulo: t.time ? t.time.nome + " · " + F.nome(t.jogador) : F.nome(t.jogador), emPartida: true, classe: "cheia" });
        if (!cron) {
          cron = F.cronometro({ segundos: cfg.tempo, tam: 96, cor: t.time ? t.time.cor : F.jog(t.jogador).cor, somFim: "apito", aoTerminar: () => fimTurno(false) });
          cron.iniciar();
        }
        F.$("#cr", main).appendChild(cron.el);
        F.caber(F.$("#palavra", main), Math.min(window.innerWidth / 5, 190), 40, 2);
        const ac = F.$("#acertou", main), ps = F.$("#passa", main);
        if (ac) ac.onclick = () => registrar("ok");
        if (ps) ps.onclick = () => registrar("pulou");
        F.segurarPara(F.$("#encerrar", main), 1000, () => fimTurno(false));
        F.aoPausar = pausar;
      }
      function checar() {
        if (bloqueado || acabou || pausado || !atual || neutro == null || ultAng == null) {
          if (neutro == null && ultAng != null && atual && !acabou) neutro = ultAng;
          return;
        }
        const sc = sensorCfg();
        const d = ultAng - neutro;
        if (!armado) { if (Math.abs(d) <= sc.rearme) armado = true; return; }
        if (performance.now() - desde < 500) return;
        if (d <= -sc.limite) { armado = false; registrar("ok"); }
        else if (d >= sc.limite) { armado = false; registrar("pulou"); }
      }
      function registrar(status) {
        if (bloqueado || acabou || !atual) return;
        bloqueado = true;
        cartas.push({ item: atual, status });
        if (status === "pulou") P.pulados.push(atual);
        atual = null;
        if (status === "ok") { F.som("acerto"); F.vibrar(80); F.flash("verde", "✓ ACERTOU"); }
        else { F.som("passa"); F.vibrar([40, 40, 40]); F.flash("laranja", "↷ PASSOU"); }
        F.timeout(() => { bloqueado = false; if (!acabou && !pausado) mostrarCarta(proximaCarta()); }, 800);
      }
      function pausar() {
        if (acabou || pausado) return;
        pausado = true;
        cron && cron.pausar();
        const main = F.mostrar(`<div class="coluna" style="align-items:center;text-align:center;margin-top:10vh"><div class="enorme">⏸ Pausado</div>
          <p class="lede">Restam ${Math.ceil(cron ? cron.restante() : cfg.tempo)} s.</p><button class="btn grande" id="cont">Continuar ▶</button></div>`, { titulo: "Quem sou eu?", emPartida: true });
        F.$("#cont", main).onclick = async () => {
          await F.contagem({ titulo: "Quem sou eu?" });
          neutro = ultAng; armado = true; pausado = false; bloqueado = false;
          mostrarCarta(atual || proximaCarta());
          cron.iniciar();
        };
        F.aoPausar = null;
      }
      function fimTurno(esgotado) {
        if (acabou) return;
        acabou = true;
        cron && cron.parar();
        if (pararSensor) pararSensor();
        soltarPaisagem();
        if (atual) { fila.unshift(atual); atual = null; } // carta na tela quando o tempo acabou não conta
        F.flash("vermelho", esgotado ? "Baralho esgotado" : "⏱ TEMPO!", 1200);
        F.timeout(() => resumo(t, cartas), 1200);
      }
      comecar();
    }

    function resumo(t, cartas) {
      const render = () => {
        const ok = cartas.filter((c) => c.status === "ok").length, pul = cartas.filter((c) => c.status === "pulou").length;
        const pts = ok - (cfg.puloCusta ? pul : 0);
        const main = F.mostrar(`<div class="card">
            <div class="linha entre"><h2>Resumo do turno — ${F.esc(F.nome(t.jogador))}</h2><span class="medio">${pts >= 0 ? "+" : ""}${pts} pt${Math.abs(pts) === 1 ? "" : "s"}</span></div>
            <p class="lede">Toque numa carta para corrigir (✓ ↔ ↷). 🚫 tira a carta do jogo para sempre.</p>
            <div class="coluna">${cartas.map((c, i) => `<div class="linha" style="gap:8px">
                <button class="btn ${c.status === "ok" ? "ok" : "aviso"}" data-i="${i}" style="flex:1; justify-content:flex-start">${c.status === "ok" ? "✓" : "↷"} ${F.esc(c.item.carta)}</button>
                <button class="mini-btn" data-ban="${i}" title="Não mostrar mais esta carta">🚫</button></div>`).join("") || '<p class="mudo">Nenhuma carta neste turno.</p>'}</div>
            <div class="linha fim"><button class="btn grande" id="ok">Confirmar ✓</button></div></div>`, { titulo: "Quem sou eu?", emPartida: true });
        F.$$("[data-i]", main).forEach((b) => b.onclick = () => { const c = cartas[+b.dataset.i]; c.status = c.status === "ok" ? "pulou" : "ok"; render(); });
        F.$$("[data-ban]", main).forEach((b) => b.onclick = async () => {
          const c = cartas[+b.dataset.ban];
          if (await F.confirmar(`Não mostrar mais "${c.item.carta}"?`, "Ela sai deste jogo em todas as noites.", { sim: "Tirar a carta" })) { F.banir("quem-sou-eu", chave(c.item)); P.pulados = P.pulados.filter((x) => chave(x) !== chave(c.item)); F.toast("Carta removida."); }
        });
        F.$("#ok", main).onclick = () => {
          const alvo = t.time ? t.time.id : t.jogador;
          P.pontos[alvo] += pts;
          P.acertosJog[t.jogador] += ok;
          // pulos corrigidos para acerto não voltam ao baralho
          P.pulados = P.pulados.filter((x) => !cartas.some((c) => c.status === "ok" && chave(c.item) === chave(x)));
          P.idx += 1;
          if (P.idx >= P.turnos.length) terminar(); else placar();
        };
      };
      render();
    }

    function placar() {
      const prox = P.turnos[P.idx];
      const linhas = times
        ? times.slice().sort((a, b) => P.pontos[b.id] - P.pontos[a.id]).map((t) => `<div class="linha entre">${F.tagTime(t)}<strong style="font-size:1.8rem">${P.pontos[t.id]}</strong></div>`)
        : jogs.slice().sort((a, b) => P.pontos[b.id] - P.pontos[a.id]).map((j) => `<div class="linha entre">${F.pill(j)}<strong style="font-size:1.6rem">${P.pontos[j.id]}</strong></div>`);
      const main = F.mostrar(`<div class="card"><h2>Placar da partida</h2><div class="coluna">${linhas.join("")}</div>
          <div class="linha entre"><span class="lede">Próximo: <b>${F.esc(F.nome(prox.jogador))}</b> ${prox.time ? F.tagTime(prox.time) : ""}</span>
          <button class="btn grande" id="seg">Próximo turno ▶</button></div></div>`, { titulo: "Quem sou eu?", emPartida: true });
      F.$("#seg", main).onclick = telaVez;
    }

    function terminar() {
      const best = Object.entries(P.acertosJog).sort((a, b) => b[1] - a[1])[0];
      const destaques = best && best[1] ? [`${F.nome(best[0])} adivinhou ${best[1]} carta${best[1] === 1 ? "" : "s"}`] : [];
      const resultados = times ? F.resultadosDeTimes(times, P.pontos) : F.resultadosIndividuais(P.pontos);
      F.finalizarPartida({ jogo: "quem-sou-eu", inicio: P.inicio, resultados, destaques, jogarDeNovo: () => configurar(jogs.map((j) => j.id)) });
    }
    telaVez();
  }
})();
