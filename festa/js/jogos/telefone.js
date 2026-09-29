// Telefone sem fio desenhado — frase vira desenho, que vira frase, que vira desenho…
(function () {
  "use strict";
  const JOGO = {
    id: "telefone", nome: "Telefone sem fio desenhado", icone: "✏️", cor: "#2F9E44", jogadores: "4–12", duracao: "10–20 min", min: 4, max: 12,
    resumo: "Uma frase vira desenho, que vira frase, que vira desenho… e no fim ninguém reconhece o começo.",
    descricao: "Uma frase vira desenho, que vira frase, que vira desenho... e no fim ninguém reconhece o que foi escrito no começo.",
    regras: `<p>1. O primeiro escreve uma frase (ou pede uma ideia ao app).</p>
      <p>2. O tablet passa: o próximo vê <b>só a frase</b> e desenha. O seguinte vê <b>só o desenho</b> e escreve o que acha que é. E assim por diante.</p>
      <p>3. Cada um vê apenas o passo imediatamente anterior.</p>
      <p>4. No fim vem a <b>revelação</b>: a corrente inteira, passo a passo. O grupo pode escolher o <b>melhor momento</b> — o autor ganha +2.</p>`,
    abrir: () => configurar(),
  };
  F.registrarJogo(JOGO);

  const PADRAO = { correntes: 2, tempoDesenho: 60, tempoDescricao: 45, melhorMomento: true, fraseInicial: "escrita" };
  const CORES = [["#1A1A1A", "preto"], ["#E03131", "vermelho"], ["#1971C2", "azul"], ["#2F9E44", "verde"], ["#FAB005", "amarelo"], ["#F76707", "laranja"], ["#8D5A2B", "marrom"], ["#E64980", "rosa"]];
  const ESPESSURAS = [[5, "fino"], [12, "médio"], [26, "grosso"]];
  const W = 1200, H = 900;

  function css() {
    if (document.getElementById("css-tel")) return;
    const s = document.createElement("style");
    s.id = "css-tel";
    s.textContent = `
      .tel-desenho{display:flex; gap:12px; flex:1; min-height:0; align-items:stretch;}
      .tel-quadro{flex:1; display:flex; align-items:center; justify-content:center; min-width:0; min-height:0;}
      .tel-quadro canvas{background:#fff; border-radius:14px; box-shadow:0 0 0 2px var(--border); touch-action:none; max-width:100%; max-height:100%;}
      .tel-ferr{display:flex; flex-direction:column; gap:8px; width:118px; flex-shrink:0; overflow:auto;}
      .tel-ferr .cores{display:grid; grid-template-columns:1fr 1fr; gap:6px;}
      .tel-ferr .cor-btn{width:48px; height:48px;}
      .tel-ferr .mini-btn{width:100%; height:46px;}
      .tel-ferr .mini-btn.ativo{background:var(--accent); color:var(--accent-ink); border-color:var(--accent);}
      .tel-img{background:#fff; border-radius:14px; box-shadow:0 0 0 2px var(--border); max-width:100%; max-height:100%; object-fit:contain;}
      .tel-miniaturas{display:grid; grid-template-columns:repeat(auto-fill, minmax(180px,1fr)); gap:10px;}
      .tel-mini{border:2px solid var(--border); border-radius:14px; background:var(--surface); padding:8px; display:flex; flex-direction:column; gap:6px; text-align:left; min-height:120px;}
      .tel-mini.ativo{border-color:var(--accent); box-shadow:0 0 0 3px var(--accent);}
      .tel-mini img{width:100%; border-radius:8px; background:#fff;}
      .tel-mini .t{font-weight:700;}
      @media (max-width:700px){ .tel-desenho{flex-direction:column;} .tel-ferr{width:auto; flex-direction:row; flex-wrap:wrap;} .tel-ferr .cores{display:flex;} }
    `;
    document.head.appendChild(s);
  }

  function configurar(participantes) {
    const cfg = F.config("telefone", PADRAO);
    F.telaConfig({
      jogo: JOGO, min: 4, max: 12, participantes,
      corpo: () => F.opcao("Correntes", F.chipsOpcao("correntes", [[1, "1"], [2, "2"], [3, "3"]], cfg.correntes)) +
        F.opcao("Tempo para desenhar", F.chipsOpcao("tempoDesenho", [[45, "45 s"], [60, "60 s"], [90, "90 s"]], cfg.tempoDesenho)) +
        F.opcao("Tempo para descrever", F.chipsOpcao("tempoDescricao", [[30, "30 s"], [45, "45 s"], [60, "60 s"]], cfg.tempoDescricao)) +
        F.opcao("Melhor momento (+2 para o autor)", F.chipsOpcao("melhorMomento", [[true, "Sim"], [false, "Não"]], cfg.melhorMomento)) +
        F.opcao("Frase inicial", F.chipsOpcao("fraseInicial", [["escrita", "Escrita pelo jogador"], ["sorteada", "Sempre sorteada"]], cfg.fraseInicial)),
      montar: (main, render) => F.ligarChips(main, cfg, render, { correntes: "number", tempoDesenho: "number", tempoDescricao: "number", melhorMomento: "boolean" }),
      aoComecar: (jogs) => { F.guardarConfig("telefone", cfg); partida(cfg, jogs); },
    });
  }

  function sortearFrase() {
    const lista = (window.CONTEUDO.telefone || []).filter((f) => F.publicoOk(f));
    const f = F.novos("telefone", lista, (x) => x.texto)[0];
    F.marcarUsado("telefone", f.texto);
    return f.texto;
  }

  // Quadro de desenho. Devolve { el, exportar(), parar() }.
  function quadro(area, st, cor) {
    st.tracos = st.tracos || [];
    st.cor = st.cor || "#1A1A1A";
    st.esp = st.esp || 12;
    st.borracha = !!st.borracha;
    area.innerHTML = `<div class="tel-desenho"><div class="tel-quadro" id="qd"><canvas width="${W}" height="${H}"></canvas></div>
      <div class="tel-ferr">
        <div class="cores">${CORES.map(([c, n]) => `<button class="cor-btn" data-cor="${c}" style="background:${c}" aria-label="${n}" title="${n}"></button>`).join("")}</div>
        ${ESPESSURAS.map(([e, n]) => `<button class="mini-btn" data-esp="${e}"><span style="display:inline-block;width:${Math.max(6, e)}px;height:${Math.max(6, e)}px;border-radius:50%;background:currentColor;vertical-align:middle"></span> ${n}</button>`).join("")}
        <button class="mini-btn" id="borr">🧽 Borracha</button>
        <button class="mini-btn" id="undo">↩️ Desfazer</button>
        <button class="mini-btn" id="limpar">🗑️ Limpar</button>
      </div></div>`;
    const canvas = F.$("canvas", area), ctx = canvas.getContext("2d"), box = F.$("#qd", area);
    function ajustar() {
      // Zera o canvas antes de medir, para o tamanho dele não inflar a caixa.
      canvas.style.width = canvas.style.height = "0px";
      const bw = box.clientWidth, bh = box.clientHeight || bw * 0.75;
      const esc = Math.min(bw / W, bh / H);
      canvas.style.width = Math.floor(W * esc) + "px";
      canvas.style.height = Math.floor(H * esc) + "px";
    }
    function linha(t, i) {
      const a = t.pts[i - 1], b = t.pts[i];
      ctx.strokeStyle = t.cor; ctx.lineWidth = t.esp; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(a[0] * W, a[1] * H); ctx.lineTo(b[0] * W, b[1] * H); ctx.stroke();
    }
    function ponto(t) {
      const p = t.pts[0];
      ctx.fillStyle = t.cor; ctx.beginPath(); ctx.arc(p[0] * W, p[1] * H, t.esp / 2, 0, Math.PI * 2); ctx.fill();
    }
    function redesenhar() {
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
      st.tracos.forEach((t) => { ponto(t); for (let i = 1; i < t.pts.length; i++) linha(t, i); });
    }
    function ferramentas() {
      F.$$("[data-cor]", area).forEach((b) => b.classList.toggle("ativo", !st.borracha && b.dataset.cor === st.cor));
      F.$$("[data-esp]", area).forEach((b) => b.classList.toggle("ativo", +b.dataset.esp === st.esp));
      F.$("#borr", area).classList.toggle("ativo", st.borracha);
    }
    F.$$("[data-cor]", area).forEach((b) => b.onclick = () => { st.cor = b.dataset.cor; st.borracha = false; ferramentas(); });
    F.$$("[data-esp]", area).forEach((b) => b.onclick = () => { st.esp = +b.dataset.esp; ferramentas(); });
    F.$("#borr", area).onclick = () => { st.borracha = !st.borracha; ferramentas(); };
    F.$("#undo", area).onclick = () => { st.tracos.pop(); redesenhar(); };
    F.$("#limpar", area).onclick = async () => { if (st.tracos.length && (await F.confirmar("Limpar o desenho todo?", "", { sim: "Limpar", perigo: true }))) { st.tracos = []; redesenhar(); } };

    let ativo = null; // pointerId em uso
    let atual = null;
    const coord = (e) => { const r = canvas.getBoundingClientRect(); return [Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))]; };
    canvas.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "pen") st.temCaneta = true;
      if (st.temCaneta && e.pointerType === "touch") return; // com caneta, ignora a palma/dedo
      if (ativo !== null) return;
      e.preventDefault();
      ativo = e.pointerId;
      try { canvas.setPointerCapture(e.pointerId); } catch (er) {}
      atual = { cor: st.borracha ? "#FFFFFF" : st.cor, esp: st.borracha ? st.esp * 2.2 : st.esp, pts: [coord(e)] };
      st.tracos.push(atual);
      ponto(atual);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (e.pointerId !== ativo || !atual) return;
      const co = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      const evs = co.length ? co : [e];
      evs.forEach((ev) => { atual.pts.push(coord(ev)); linha(atual, atual.pts.length - 1); });
    });
    const fim = (e) => { if (e.pointerId === ativo) { ativo = null; atual = null; } };
    ["pointerup", "pointercancel"].forEach((ev) => canvas.addEventListener(ev, fim));
    requestAnimationFrame(ajustar);
    window.addEventListener("resize", ajustar);
    const parar = () => window.removeEventListener("resize", ajustar);
    F.aoLimpar(parar);
    redesenhar(); ferramentas();
    return { exportar: () => canvas.toDataURL("image/jpeg", 0.82), parar };
  }

  function partida(cfg, jogs) {
    css();
    F.telaAcesa(true);
    const P = { inicio: F.agoraISO(), pontos: {}, correntes: [], c: 0, saiu: new Set(), favoritos: [] };
    jogs.forEach((j) => { P.pontos[j.id] = 0; });

    function iniciarCorrente() {
      const presentes = jogs.filter((j) => !P.saiu.has(j.id));
      if (presentes.length < 3) { terminar(); return; }
      const ini = P.c % presentes.length;
      const ordem = presentes.slice(ini).concat(presentes.slice(0, ini)).map((j) => j.id);
      const cor = { dono: ordem[0], ordem, passos: [] };
      P.correntes.push(cor);
      passo(cor);
    }
    function tipoDo(i) { return i === 0 ? "frase" : i % 2 === 1 ? "desenho" : "descricao"; }

    function passo(cor) {
      const i = cor.passos.length;
      if (i >= cor.ordem.length) { revelar(cor); return; }
      const jid = cor.ordem[i];
      const tipo = tipoDo(i);
      const anterior = cor.passos[i - 1];
      const st = { restante: null, extraUsado: false, texto: "" };
      let cron = null, desenho = null, enviado = false;
      const concluir = (conteudo) => {
        if (enviado) return;
        enviado = true;
        cron && cron.parar();
        desenho && desenho.parar();
        cor.passos.push({ tipo: tipo === "frase" ? "frase" : tipo === "desenho" ? "desenho" : "frase", autor: jid, conteudo });
      };
      F.privacidade({
        jogador: F.jog(jid), modo: "interagir", titulo: `Corrente ${P.c + 1} de ${cfg.correntes} · passo ${i + 1} de ${cor.ordem.length}`,
        rodapeNeutra: `<button class="btn fantasma" id="saiu">🚪 ${F.esc(F.nome(jid))} saiu — pular</button>`,
        aoNeutra: (main) => {
          F.$("#saiu", main).onclick = async () => {
            if (!(await F.confirmar(`${F.nome(jid)} saiu?`, "Essa pessoa será pulada nesta e nas próximas correntes.", { sim: "Pular" }))) return;
            P.saiu.add(jid);
            cor.ordem = cor.ordem.filter((x, k) => k < i || x !== jid);
            if (i === 0) cor.dono = cor.ordem[0];
            passo(cor);
          };
        },
        aoPausarInteracao: () => { if (cron) { st.restante = cron.restante(); cron.parar(); } if (tipo === "descricao") { const inp = F.$("#txt"); if (inp) st.texto = inp.value; } },
        montar: (area, pronto) => {
          area.style.minHeight = "calc(100dvh - 90px)";
          const fim = (conteudo) => { concluir(conteudo); pronto(); };
          if (tipo === "frase") {
            if (cfg.fraseInicial === "sorteada") {
              st.texto = st.texto || sortearFrase();
              area.innerHTML = `<div class="card" style="align-items:center;text-align:center"><span class="rotulo">Frase inicial sorteada</span>
                <div class="enorme">${F.esc(st.texto)}</div><p class="lede">Memorize e passe o tablet. O próximo vai desenhar esta frase.</p>
                <div class="linha"><button class="btn sec" id="outra">🎲 Outra</button><button class="btn grande" id="ok">Pronto ✓</button></div></div>`;
              F.$("#outra", area).onclick = () => { st.texto = sortearFrase(); area.querySelector(".enorme").textContent = st.texto; };
              F.$("#ok", area).onclick = () => fim(st.texto);
              return;
            }
            area.innerHTML = `<div class="card"><h2>${F.esc(F.nome(jid))}, escreva uma frase</h2>
              <p class="lede">Boa frase: um personagem, uma ação absurda e, se quiser, um lugar. Ex.: "Um gato pilotando um avião".</p>
              <input class="entrada" id="txt" maxlength="80" placeholder="Sua frase (até 80 letras)" value="${F.esc(st.texto)}" style="font-size:1.4rem">
              <div class="linha"><button class="btn sec" id="ideia">💡 Me dá uma ideia</button><span class="espaco"></span><button class="btn grande" id="ok">Pronto ✓</button></div></div>`;
            const inp = F.$("#txt", area);
            inp.focus();
            F.$("#ideia", area).onclick = () => { inp.value = sortearFrase(); };
            F.$("#ok", area).onclick = () => { const v = inp.value.trim(); if (!v) { F.toast("Escreva a frase ou peça uma ideia."); return; } fim(v); };
            return;
          }
          if (tipo === "desenho") {
            area.innerHTML = `<div class="linha entre" style="flex-wrap:nowrap"><div class="faixa" style="flex:1; font-size:clamp(1.1rem,2.6vw,1.7rem)">✏️ Desenhe: ${F.esc(anterior.conteudo)}</div><span id="cr"></span>
                <button class="btn grande ok" id="ok">Terminei ✓</button></div><div id="board" style="flex:1; display:flex; min-height:0; margin-top:10px"></div>`;
            area.style.height = "calc(100dvh - 110px)";
            desenho = quadro(F.$("#board", area), st);
            const seg = st.restante != null ? Math.max(1, Math.ceil(st.restante)) : cfg.tempoDesenho;
            cron = F.cronometro({ segundos: seg, tam: 76, somFim: "fim", aoTerminar: () => { F.toast("Tempo! Desenho enviado."); fim(desenho.exportar()); } });
            F.$("#cr", area).appendChild(cron.el);
            cron.iniciar();
            F.$("#ok", area).onclick = () => fim(desenho.exportar());
            return;
          }
          // descrever
          area.innerHTML = `<div class="coluna" style="flex:1; min-height:0">
              <div style="flex:1; min-height:0; display:flex; justify-content:center; max-height:52vh"><img class="tel-img" src="${anterior.conteudo}" alt="desenho anterior"></div>
              <div class="card plano" style="padding:14px"><div class="linha" style="flex-wrap:nowrap"><span id="cr"></span>
                <input class="entrada" id="txt" maxlength="80" placeholder="O que é este desenho?" value="${F.esc(st.texto)}" style="font-size:1.3rem; flex:1">
                <button class="btn grande" id="ok">Pronto ✓</button></div></div></div>`;
          const inp = F.$("#txt", area);
          const tempoFim = () => {
            const v = inp.value.trim();
            if (v) { fim(v); return; }
            if (!st.extraUsado) { st.extraUsado = true; F.toast("+15 s para escrever!"); cron = F.cronometro({ segundos: 15, tam: 70, aoTerminar: tempoFim }); const c = F.$("#cr", area); c.innerHTML = ""; c.appendChild(cron.el); cron.iniciar(); return; }
            fim("Desenhe o que quiser!");
          };
          cron = F.cronometro({ segundos: st.restante != null ? Math.max(1, Math.ceil(st.restante)) : cfg.tempoDescricao, tam: 70, aoTerminar: tempoFim });
          F.$("#cr", area).appendChild(cron.el);
          cron.iniciar();
          F.$("#ok", area).onclick = () => { const v = inp.value.trim(); if (!v) { F.toast("Escreva o que você acha que é."); return; } fim(v); };
          inp.addEventListener("keydown", (e) => { if (e.key === "Enter") F.$("#ok", area).click(); });
        },
        aoConcluir: () => passo(cor),
      });
    }

    function revelar(cor) {
      let k = -1;
      const dono = F.jog(cor.dono);
      const mostrarPasso = () => {
        if (k < 0) {
          const main = F.mostrar(`<div class="card" style="align-items:center;text-align:center;flex:1;justify-content:center">
              <span class="rotulo">Revelação</span><div class="gigante">Corrente de ${F.esc(dono.nome.toUpperCase())}</div>
              <p class="lede">${cor.passos.length} passos. Toque para ver cada um.</p><button class="btn grande" id="av">Começar ▶</button></div>`, { titulo: "Revelação", emPartida: true });
          F.som("suspense");
          F.$("#av", main).onclick = () => { k = 0; mostrarPasso(); };
          return;
        }
        if (k >= cor.passos.length) { final(cor); return; }
        const p = cor.passos[k];
        const autor = F.jog(p.autor);
        const main = F.mostrar(`<button id="av" style="flex:1; border:none; background:none; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; padding:10px; color:inherit; min-height:75vh">
            <span class="linha" style="justify-content:center">${F.pill(autor)} <span class="mudo">${p.tipo === "desenho" ? "desenhou" : k === 0 ? "escreveu" : "achou que era"}</span></span>
            ${p.tipo === "desenho" ? `<img class="tel-img" src="${p.conteudo}" style="max-height:66vh">` : `<div class="gigante" style="max-width:900px">“${F.esc(p.conteudo)}”</div>`}
            <span class="mudo">${k + 1} / ${cor.passos.length} · toque para continuar</span></button>`, { titulo: "Corrente de " + dono.nome, emPartida: true });
        F.som(k === cor.passos.length - 1 ? "revelacao" : "pop");
        F.$("#av", main).onclick = () => { k += 1; mostrarPasso(); };
      };
      mostrarPasso();
    }

    function final(cor) {
      let escolhido = null;
      const render = () => {
        const main = F.mostrar(`<div class="card">
            <div class="linha entre"><h2>A corrente inteira</h2>${cfg.melhorMomento ? '<span class="rotulo">Toque no melhor momento</span>' : ""}</div>
            <div class="tel-miniaturas">${cor.passos.map((p, i) => `<button class="tel-mini ${escolhido === i ? "ativo" : ""}" data-i="${i}">
                ${F.pill(F.jog(p.autor))}${p.tipo === "desenho" ? `<img src="${p.conteudo}">` : `<span class="t">“${F.esc(p.conteudo)}”</span>`}</button>`).join("")}</div>
            <div class="linha fim">${cfg.melhorMomento ? '<button class="btn sec" id="pular">Pular</button>' : ""}
              <button class="btn grande" id="ok" ${cfg.melhorMomento && escolhido === null ? "disabled" : ""}>${cfg.melhorMomento ? "Este é o melhor! ⭐ +2" : "Continuar ▶"}</button></div></div>`, { titulo: "Telefone sem fio", emPartida: true });
        F.$$("[data-i]", main).forEach((b) => b.onclick = () => { if (!cfg.melhorMomento) return; escolhido = +b.dataset.i; F.som("toque"); render(); });
        const pl = F.$("#pular", main);
        if (pl) pl.onclick = proxima;
        F.$("#ok", main).onclick = () => {
          if (cfg.melhorMomento && escolhido !== null) {
            const autor = cor.passos[escolhido].autor;
            P.pontos[autor] += 2;
            P.favoritos.push(autor);
            F.som("vitoria");
            F.toast(`⭐ +2 para ${F.nome(autor)}!`);
          }
          proxima();
        };
      };
      render();
    }
    function proxima() {
      P.c += 1;
      if (P.c >= cfg.correntes) terminar();
      else {
        const main = F.mostrar(`<div class="card" style="align-items:center;text-align:center"><h2 class="enorme">Próxima corrente!</h2>
          <p class="lede">Corrente ${P.c + 1} de ${cfg.correntes}. Quem começa agora é o jogador seguinte.</p><button class="btn grande" id="ok">Vamos ▶</button></div>`, { titulo: "Telefone sem fio", emPartida: true });
        F.$("#ok", main).onclick = iniciarCorrente;
      }
    }
    function terminar() {
      const destaques = [];
      const cont = {};
      P.favoritos.forEach((id) => { cont[id] = (cont[id] || 0) + 1; });
      Object.keys(cont).forEach((id) => destaques.push(`${F.nome(id)}: ${cont[id]} melhor${cont[id] > 1 ? "es momentos" : " momento"}`));
      F.finalizarPartida({ jogo: "telefone", inicio: P.inicio, resultados: F.resultadosIndividuais(P.pontos), destaques, jogarDeNovo: () => configurar(jogs.map((j) => j.id)) });
    }
    iniciarCorrente();
  }
})();
