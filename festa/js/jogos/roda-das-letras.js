// Roda das letras — tablet no meio da mesa: diga uma palavra, toque na letra, passe a vez.
(function () {
  "use strict";
  const JOGO = {
    id: "roda-das-letras", nome: "Roda das letras", icone: "🔤", cor: "#0C8599", jogadores: "2–8", duracao: "2–4 min/rodada", min: 2, max: 8,
    resumo: "Tablet no meio da mesa. Diga uma palavra da categoria, toque na letra inicial e passe a vez antes do tempo acabar.",
    descricao: "Tablet no meio da mesa, uma categoria e um anel de letras: diga uma palavra, toque na letra e passe a vez antes que o tempo acabe.",
    regras: `<p>1. Deixem o tablet deitado no centro da mesa. O app sorteia uma categoria (ex.: "Animais").</p>
      <p>2. Na sua vez, diga em voz alta uma palavra da categoria que comece com uma letra ainda disponível e <b>toque nessa letra</b>. A vez passa para o próximo, no sentido horário (ordem da mesa).</p>
      <p>3. Estourou o tempo? Está fora da rodada. Não vale repetir palavra já dita.</p>
      <p>4. Sobrou um? Ele vence a rodada (+3; o segundo +2; o terceiro +1). Se as letras acabarem com 2 ou mais na roda, vem uma nova categoria só para eles.</p>
      <p><b>Desfazer</b> devolve a última letra. <b>Contestar</b> pergunta se a palavra vale; se não valer, o jogador volta com só 5 s.</p>`,
    abrir: () => configurar(),
  };
  F.registrarJogo(JOGO);

  const L20 = "ABCDEFGHIJLMNOPRSTUV".split("");
  const L26 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const PADRAO = { tempo: 10, rodadas: 3, letras: "20", difs: ["facil", "medio"] };
  const cats = () => (window.CONTEUDO.rodaDasLetras || []).filter((c) => F.publicoOk(c));

  function css() {
    if (document.getElementById("css-roda")) return;
    const s = document.createElement("style");
    s.id = "css-roda";
    s.textContent = `
      .roda-wrap{flex:1; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; touch-action:manipulation; user-select:none; -webkit-user-select:none;}
      .roda{position:relative;}
      .letra-btn{position:absolute; border-radius:50%; border:none; background:var(--surface); color:var(--text); font-family:'Baloo 2'; font-weight:800;
        box-shadow:0 4px 0 var(--border), 0 6px 14px rgba(0,0,0,.12); display:flex; align-items:center; justify-content:center; touch-action:manipulation; padding:0;}
      .letra-btn.usada{background:var(--surface-2); color:var(--text-muted); opacity:.45; box-shadow:none;}
      .letra-btn.usada::after{content:"×"; position:absolute; font-size:.9em; color:var(--danger); opacity:.9;}
      .letra-btn.recente{outline:4px solid var(--accent);}
      .roda-centro{position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; text-align:center; pointer-events:none;}
      .roda-centro .cat{font-family:'Baloo 2'; font-weight:800; line-height:1.05; max-width:100%;}
      .roda-centro .quem{font-weight:800; display:flex; align-items:center; gap:6px;}
      .roda-centro .inv{transform:rotate(180deg);}
      .roda-canto{position:absolute; z-index:5;}
      .roda-jogs{display:flex; gap:6px; flex-wrap:wrap; justify-content:center; padding:6px 12px 12px;}
      .roda-jogs .pill.fora{opacity:.35; text-decoration:line-through;}
      .roda-jogs .pill.vez{border-color:var(--accent); box-shadow:0 0 0 2px var(--accent);}
    `;
    document.head.appendChild(s);
  }

  function configurar(participantes) {
    const cfg = F.config("roda-das-letras", PADRAO);
    F.telaConfig({
      jogo: JOGO, min: 2, max: 8, participantes,
      corpo: () => F.opcao("Tempo por vez", F.chipsOpcao("tempo", [[5, "5 s"], [8, "8 s"], [10, "10 s"], [15, "15 s"]], cfg.tempo)) +
        F.opcao("Rodadas", F.chipsOpcao("rodadas", [[1, "1"], [3, "3"], [5, "5"]], cfg.rodadas)) +
        F.opcao("Letras", F.chipsOpcao("letras", [["20", "20 (sem K, Q, W, X, Y, Z)"], ["26", "Todas as 26"]], cfg.letras)) +
        F.opcao("Categorias", F.chipsMulti("difs", [["facil", "Fáceis"], ["medio", "Médias"], ["dificil", "Difíceis"]], cfg.difs)) +
        '<p class="lede">A ordem da vez segue a ordem da mesa (👥 Jogadores). Todos precisam alcançar o tablet.</p>',
      montar: (main, render) => F.ligarChips(main, cfg, render, { tempo: "number", rodadas: "number", letras: "string" }),
      aoComecar: (jogs) => { F.guardarConfig("roda-das-letras", cfg); partida(cfg, jogs); },
    });
  }

  function partida(cfg, jogs) {
    css();
    F.telaAcesa(true);
    const LETRAS = cfg.letras === "26" ? L26 : L20;
    const pool = cats().filter((c) => cfg.difs.includes(c.dificuldade));
    let filaCats = F.novos("roda-das-letras", pool, (c) => c.nome);
    const P = { inicio: F.agoraISO(), pontos: {}, rodada: 0, saiu: new Set(), primeiroFora: null, vitorias: {} };
    jogs.forEach((j) => { P.pontos[j.id] = 0; P.vitorias[j.id] = 0; });

    function novaCategoria() {
      if (!filaCats.length) filaCats = F.novos("roda-das-letras", pool, (c) => c.nome);
      const c = filaCats.shift();
      F.marcarUsado("roda-das-letras", c.nome);
      return c;
    }

    function preRodada() {
      P.rodada += 1;
      const naMesa = jogs.filter((j) => !P.saiu.has(j.id));
      if (naMesa.length < 2) { terminar(); return; }
      let comeca = null;
      if (P.rodada > 1 && P.primeiroFora && !P.saiu.has(P.primeiroFora)) comeca = P.primeiroFora;
      const render = () => {
        const main = F.mostrar(`<div class="card" style="align-items:center;text-align:center">
            <span class="rotulo">Rodada ${P.rodada} de ${cfg.rodadas}</span>
            <h2 class="enorme">Tablet no meio da mesa!</h2>
            ${comeca ? `<p class="lede">Começa:</p>${F.bolaGrande(F.jog(comeca))}<div class="gigante">${F.esc(F.nome(comeca).toUpperCase())}</div>
              ${P.rodada > 1 ? '<p class="mudo">(quem saiu primeiro na rodada anterior)</p>' : ""}`
              : '<p class="lede">Quem começa?</p><div class="linha"><button class="btn sec" id="sortear">🎲 Sortear</button><button class="btn sec" id="dedos">☝️ Sorteador de dedos</button></div>'}
            <div class="linha"><button class="btn grande" id="ir" ${comeca ? "" : "disabled"}>Começar ▶</button></div></div>`, { titulo: "Roda das letras", emPartida: true });
        const s = F.$("#sortear", main);
        if (s) s.onclick = () => { comeca = F.sortear(naMesa).id; F.som("revelacao"); render(); };
        const d = F.$("#dedos", main);
        if (d) d.onclick = () => F.sorteador.abrir({ modo: "um", perguntar: true, jogadores: naMesa, aoTerminar: (r) => { if (r && r.escolhidos && r.escolhidos[0]) comeca = r.escolhidos[0]; render(); } });
        F.$("#ir", main).onclick = () => rodada(naMesa.map((j) => j.id), comeca);
      };
      render();
    }

    function rodada(ids, comeca) {
      const R = {
        ativos: ids.slice(), // ordem da mesa
        foraOrdem: [], // eliminados na ordem em que saíram
        usadas: new Set(), cat: novaCategoria(), vez: comeca, ultima: null, ultimoToque: 0, pausado: false, transicao: false, acabou: false,
      };
      let cron = null;
      const main = F.mostrar(`<div class="roda-wrap" id="wrap">
          <button class="icon-btn roda-canto" id="pausa" style="left:12px; top:8px">⏸ Pausar</button>
          <button class="icon-btn roda-canto" id="desfazer" style="right:12px; top:8px">↩️ Desfazer</button>
          <button class="icon-btn roda-canto" id="contestar" style="right:12px; bottom:8px">⚖️ Contestar</button>
          <span class="roda-canto mudo pequeno" style="left:14px; bottom:14px">Rodada ${P.rodada}/${cfg.rodadas}</span>
          <div class="roda" id="roda"></div>
        </div><div class="roda-jogs" id="jogs"></div>`, { titulo: "", emPartida: true, classe: "cheia" });
      const wrap = F.$("#wrap", main), roda = F.$("#roda", main);

      function layout() {
        const w = wrap.clientWidth, h = wrap.clientHeight;
        const tam = Math.max(300, Math.min(w - 20, h - 20));
        roda.style.width = roda.style.height = tam + "px";
        const n = LETRAS.length;
        const btn = Math.max(52, Math.min(96, (Math.PI * tam * 0.84) / n - 6));
        const raio = tam / 2 - btn / 2 - 4;
        roda.innerHTML = LETRAS.map((l, i) => {
          const th = (i / n) * 2 * Math.PI - Math.PI / 2; // começa no topo, sentido horário
          const x = tam / 2 + raio * Math.cos(th) - btn / 2, y = tam / 2 + raio * Math.sin(th) - btn / 2;
          const rot = (th * 180) / Math.PI - 90; // base da letra voltada para fora da roda
          return `<button class="letra-btn ${R.usadas.has(l) ? "usada" : ""} ${R.ultima && R.ultima.letra === l ? "recente" : ""}" data-l="${l}"
            style="left:${x}px; top:${y}px; width:${btn}px; height:${btn}px; font-size:${btn * 0.55}px; transform:rotate(${rot}deg)">${l}</button>`;
        }).join("") + `<div class="roda-centro" style="width:${tam - btn * 2 - 30}px; height:${tam - btn * 2 - 30}px">
            <div class="cat inv" style="font-size:${tam / 17}px">${F.esc(R.cat.nome)}</div>
            <div class="quem inv" id="q1" style="font-size:${tam / 26}px"></div>
            <div id="cr"></div>
            <div class="quem" id="q2" style="font-size:${tam / 26}px"></div>
            <div class="cat" style="font-size:${tam / 17}px">${F.esc(R.cat.nome)}</div></div>`;
        if (cron) F.$("#cr", roda).appendChild(cron.el);
        cron && cron.el.style.setProperty("--tam", Math.round(tam / 4.2) + "px");
        F.$$(".letra-btn", roda).forEach((b) => b.addEventListener("pointerdown", (e) => { e.preventDefault(); tocar(b.dataset.l); }));
        atualizarQuem();
      }
      function atualizarQuem() {
        const j = F.jog(R.vez);
        const html = j ? `<span class="bola" style="width:1.4em;height:1.4em;border-radius:50%;background:${j.cor};display:inline-block"></span>${F.esc(j.nome)}` : "";
        const q1 = F.$("#q1"), q2 = F.$("#q2");
        if (q1) q1.innerHTML = html;
        if (q2) q2.innerHTML = html;
        if (cron && j) cron.el.style.setProperty("--cor", j.cor);
        F.$("#jogs").innerHTML = ids.map((id) => {
          const jj = F.jog(id);
          const fora = !R.ativos.includes(id);
          return F.pill(jj).replace('class="pill', `class="pill${fora ? " fora" : ""}${id === R.vez ? " vez" : ""}`);
        }).join("");
      }
      function proximoDe(id) {
        const i = R.ativos.indexOf(id);
        if (i >= 0) return R.ativos[(i + 1) % R.ativos.length];
        // id já eliminado: próximo ativo depois dele na ordem da mesa
        const k = ids.indexOf(id);
        for (let s = 1; s <= ids.length; s++) { const c = ids[(k + s) % ids.length]; if (R.ativos.includes(c)) return c; }
        return R.ativos[0];
      }
      function iniciarTimer(seg) {
        if (cron) cron.parar();
        const tamAtual = cron ? cron.el.style.getPropertyValue("--tam") : null;
        cron = F.cronometro({ segundos: seg, tam: 120, alerta: 3, somFim: false, aoTerminar: estourou,
          aoSegundo: (s) => { if (s <= 3 && s > 0) F.timeout(() => { if (cron && cron.rodando()) F.som("tique"); }, 500); } });
        if (tamAtual) cron.el.style.setProperty("--tam", tamAtual);
        const alvo = F.$("#cr", roda);
        if (alvo) { alvo.innerHTML = ""; alvo.appendChild(cron.el); }
        layoutTimerTam();
        cron.iniciar();
        atualizarQuem();
      }
      function layoutTimerTam() { const tam = roda.clientWidth; if (cron) cron.el.style.setProperty("--tam", Math.round(tam / 4.2) + "px"); }

      function tocar(l) {
        if (R.pausado || R.transicao || R.acabou) return;
        const agora = performance.now();
        if (agora - R.ultimoToque < 500) return; // toques simultâneos: vale o primeiro
        if (R.usadas.has(l)) { F.som("nao"); return; }
        R.ultimoToque = agora;
        R.usadas.add(l);
        R.ultima = { letra: l, jogador: R.vez };
        F.som("toque"); F.vibrar(30);
        if (R.usadas.size >= LETRAS.length) {
          if (R.ativos.length >= 2) { prorrogacao(); return; }
        }
        R.vez = proximoDe(R.vez);
        layout();
        iniciarTimer(cfg.tempo);
      }
      function prorrogacao() {
        R.transicao = true;
        cron && cron.parar();
        R.cat = novaCategoria();
        R.usadas.clear(); R.ultima = null;
        R.vez = proximoDe(R.vez);
        F.som("revelacao");
        F.flash("verde", `<div>Prorrogação!</div><div style="font-size:.4em">${F.esc(R.cat.nome)}</div>`, 1800);
        F.timeout(() => { R.transicao = false; layout(); iniciarTimer(cfg.tempo); }, 1800);
      }
      function estourou() {
        if (R.acabou) return;
        F.som("buzina"); F.vibrar([200, 80, 200]);
        const quem = R.vez;
        eliminar(quem, `⏱ ${F.esc(F.nome(quem))} está fora!`);
      }
      function eliminar(quem, msg) {
        const prox = proximoDe(quem);
        R.ativos = R.ativos.filter((x) => x !== quem);
        R.foraOrdem.push(quem);
        R.ultima = null;
        if (R.ativos.length <= 1) { fimRodada(); return; }
        R.transicao = true;
        R.vez = prox;
        F.flash("vermelho", msg, 1000);
        layout();
        F.timeout(() => { R.transicao = false; iniciarTimer(cfg.tempo); }, 1000);
      }
      function desfazer(segundos) {
        if (!R.ultima) { F.toast("Nada para desfazer."); return; }
        R.usadas.delete(R.ultima.letra);
        R.vez = R.ultima.jogador;
        R.ultima = null;
        F.som("passa");
        layout();
        iniciarTimer(segundos || cfg.tempo);
      }
      async function contestar() {
        if (!R.ultima || !R.ativos.includes(R.ultima.jogador)) { F.toast("Não há palavra para contestar."); return; }
        R.pausado = true; cron && cron.pausar();
        const ok = await F.confirmar(`A palavra de ${F.nome(R.ultima.jogador)} vale?`, `Letra ${R.ultima.letra} — ${R.cat.nome}`, { sim: "✓ Vale", nao: "✗ Não vale" });
        R.pausado = false;
        if (ok) { cron && cron.iniciar(); return; }
        desfazer(5);
      }
      function pausar() {
        if (R.pausado || R.acabou) return;
        R.pausado = true; cron && cron.pausar();
        F.modal(`<h2>⏸ Pausado</h2><p class="lede">${F.esc(R.cat.nome)} · vez de ${F.esc(F.nome(R.vez))}</p>
          <div class="linha"><button class="btn fantasma" id="tirar">🚪 Tirar jogador</button><span class="espaco"></span><button class="btn grande" id="cont">Continuar ▶</button></div>`, (el, m) => {
          F.$("#cont", el).onclick = () => { m.fechar(); R.pausado = false; cron && cron.iniciar(); };
          F.$("#tirar", el).onclick = async () => {
            m.fechar();
            const j = await F.escolherJogador(R.ativos.map(F.jog), "Quem precisa sair?");
            R.pausado = false;
            if (!j) { cron && cron.iniciar(); return; }
            P.saiu.add(j.id);
            if (j.id === R.vez) { eliminar(j.id, `🚪 ${F.esc(j.nome)} saiu`); return; }
            R.ativos = R.ativos.filter((x) => x !== j.id);
            R.foraOrdem.push(j.id);
            if (R.ativos.length <= 1) { fimRodada(); return; }
            layout(); cron && cron.iniciar();
          };
        });
      }
      function fimRodada() {
        R.acabou = true;
        cron && cron.parar();
        const venc = R.ativos[0];
        const ordem = [venc].concat(R.foraOrdem.slice().reverse()); // 1º, 2º, 3º...
        const pts = [3, 2, 1];
        ordem.forEach((id, i) => { if (id && i < 3) P.pontos[id] += pts[i]; });
        if (venc) P.vitorias[venc] += 1;
        P.primeiroFora = R.foraOrdem[0];
        F.som("vitoria"); F.confete();
        const ultima = P.rodada >= cfg.rodadas;
        const m = F.mostrar(`<div class="card" style="align-items:center;text-align:center">
            <span class="rotulo">Rodada ${P.rodada} de ${cfg.rodadas}</span>
            ${venc ? `${F.bolaGrande(F.jog(venc))}<div class="gigante">${F.esc(F.nome(venc).toUpperCase())}</div><p class="medio">venceu a rodada! +3</p>` : ""}
            <div class="coluna" style="width:min(480px,100%)">${ordem.slice(1, 3).map((id, i) => `<div class="linha entre">${F.pill(F.jog(id))}<span>${i + 2}º · +${pts[i + 1]}</span></div>`).join("")}</div>
            <h3>Placar</h3>
            <div class="coluna" style="width:min(480px,100%)">${jogs.slice().sort((a, b) => P.pontos[b.id] - P.pontos[a.id]).map((j) => `<div class="linha entre">${F.pill(j)}<strong style="font-size:1.4rem">${P.pontos[j.id]}</strong></div>`).join("")}</div>
            <button class="btn grande" id="seg">${ultima ? "Resultado da partida 🏁" : "Próxima rodada ▶"}</button></div>`, { titulo: "Roda das letras", emPartida: true });
        F.$("#seg", m).onclick = () => (ultima ? terminar() : preRodada());
      }

      F.$("#desfazer", main).onclick = () => { if (!R.pausado && !R.transicao && !R.acabou) desfazer(); };
      F.$("#contestar", main).onclick = () => { if (!R.pausado && !R.transicao && !R.acabou) contestar(); };
      F.segurarPara(F.$("#pausa", main), 1000, pausar);
      const aoRedimensionar = () => { if (!R.acabou && F.$("#roda")) layout(); };
      window.addEventListener("resize", aoRedimensionar);
      F.aoLimpar(() => window.removeEventListener("resize", aoRedimensionar));
      F.aoPausar = pausar;
      layout();
      iniciarTimer(cfg.tempo);
    }

    function terminar() {
      const destaques = [];
      const top = Object.entries(P.vitorias).sort((a, b) => b[1] - a[1])[0];
      if (top && top[1] > 1) destaques.push(`${F.nome(top[0])} venceu ${top[1]} rodadas`);
      F.finalizarPartida({ jogo: "roda-das-letras", inicio: P.inicio, resultados: F.resultadosIndividuais(P.pontos), destaques, jogarDeNovo: () => configurar(jogs.map((j) => j.id)) });
    }
    preRodada();
  }
})();
