// Sorteador de dedos — todo mundo põe um dedo na tela e o app escolhe.
(function () {
  "use strict";
  const S = (F.sorteador = {});
  const CORES = ["#FF5A36", "#1C7ED6", "#37B24D", "#F59F00", "#AE3EC9", "#F06595", "#15AABF", "#E8590C", "#94D82D", "#FFFFFF"];
  const MODOS = [["um", "Escolher 1"], ["varios", "Escolher vários"], ["times", "Dividir em times"], ["ordem", "Ordem"]];
  const CSS_ID = "css-sorteador";
  const LETRAS = ["A", "B", "C", "D"];

  function css() {
    if (document.getElementById(CSS_ID)) return;
    const s = document.createElement("style");
    s.id = CSS_ID;
    s.textContent = `
      .sd-area{position:relative; flex:1; margin:12px; border-radius:28px; background:#0B1116; overflow:hidden; touch-action:none; user-select:none; -webkit-user-select:none; min-height:60vh;}
      .sd-instr{position:absolute; left:0; right:0; text-align:center; color:#6E8494; font-family:'Baloo 2'; font-weight:800; font-size:clamp(1.4rem,3.6vw,2.4rem); pointer-events:none;}
      .sd-instr.cima{top:14%; transform:rotate(180deg);} .sd-instr.baixo{bottom:14%;}
      .sd-dedo{position:absolute; width:120px; height:120px; margin:-60px 0 0 -60px; border-radius:50%; pointer-events:none;
        display:flex; align-items:center; justify-content:center; transition:transform .35s cubic-bezier(.2,.9,.3,1.4), opacity .35s, background .3s;
        box-shadow:0 0 0 6px rgba(255,255,255,.08), 0 0 40px var(--c); background:var(--c); animation:sdPulsa 1.1s ease-in-out infinite;}
      .sd-dedo svg{position:absolute; inset:-14px; width:148px; height:148px; transform:rotate(-90deg);}
      .sd-dedo svg circle{fill:none; stroke:#fff; stroke-width:6; stroke-dasharray:440; stroke-dashoffset:440;}
      .sd-dedo.contando svg circle{animation:sdAnel 2s linear forwards;}
      .sd-dedo.escolhido{transform:scale(1.7); animation:none; box-shadow:0 0 0 10px #fff, 0 0 80px var(--c);}
      .sd-dedo.fora{transform:scale(.4); opacity:.12; animation:none;}
      .sd-dedo .letra{font-family:'Baloo 2'; font-weight:800; font-size:3.2rem; color:#fff; text-shadow:0 2px 6px rgba(0,0,0,.5);}
      .sd-dedo .numero{position:absolute; bottom:135px; font-family:'Baloo 2'; font-weight:800; font-size:4.4rem; color:#fff; text-shadow:0 3px 10px rgba(0,0,0,.7); line-height:1;}
      .sd-legenda{position:absolute; left:12px; right:12px; bottom:12px; display:flex; gap:8px; justify-content:center; flex-wrap:wrap; pointer-events:none;}
      .sd-legenda span{background:rgba(255,255,255,.12); color:#fff; font-weight:800; border-radius:999px; padding:6px 14px;}
      .sd-barra{display:flex; gap:8px; flex-wrap:wrap; align-items:center; padding:0 16px;}
      @keyframes sdPulsa{50%{transform:scale(1.08);}}
      @keyframes sdAnel{to{stroke-dashoffset:0;}}
    `;
    document.head.appendChild(s);
  }

  // o: { modo, n, times, perguntar, jogadores, aoTerminar(res) }
  S.abrir = (o) => {
    css();
    o = o || {};
    const cfg = { modo: o.modo || "um", n: o.n || 2, times: o.times || 2 };
    const fixo = !!o.modo;
    const dedos = new Map(); // pointerId → { x, y, cor, el }
    let estado = "esperando"; // esperando | contando | resultado
    let contagemT = null, resetT = null, resultado = null;
    let corIdx = 0;

    const minimo = () => cfg.modo === "varios" ? cfg.n + 1 : cfg.modo === "times" ? cfg.times * 2 : 2;
    const main = F.mostrar(`
      ${fixo ? "" : `<div class="sd-barra">${MODOS.map(([v, r]) => `<button class="chip radio ${cfg.modo === v ? "ativo" : ""}" data-modo="${v}">${r}</button>`).join("")}
        <span id="sdN"></span></div>`}
      <div class="sd-area" id="area">
        <div class="sd-instr cima">Coloquem um dedo na tela</div>
        <div class="sd-instr baixo">Coloquem um dedo na tela</div>
        <div class="sd-legenda" id="leg"></div>
      </div>
      <div class="sd-barra" style="padding-bottom:12px"><span class="mudo pequeno" id="info" style="color:#6E8494"></span><span class="espaco"></span>
        <button class="btn sec" id="denovo">🔁 De novo</button>${o.aoTerminar ? '<button class="btn fantasma" id="pular">Pular</button>' : ""}</div>`,
      { titulo: "☝️ Sorteador de dedos", escura: true, classe: "cheia", voltar: !o.aoTerminar, extraTopo: o.aoTerminar ? "" : "" });
    const area = F.$("#area", main), info = F.$("#info", main), leg = F.$("#leg", main);

    function barraN() {
      const sp = F.$("#sdN", main);
      if (!sp) return;
      if (cfg.modo === "varios") sp.innerHTML = `<span class="chips">${[1, 2, 3, 4, 5].map((k) => `<button class="chip radio ${cfg.n === k ? "ativo" : ""}" data-n="${k}">${k}</button>`).join("")}</span>`;
      else if (cfg.modo === "times") sp.innerHTML = `<span class="chips">${[2, 3, 4].map((k) => `<button class="chip radio ${cfg.times === k ? "ativo" : ""}" data-t="${k}">${k} times</button>`).join("")}</span>`;
      else sp.innerHTML = "";
      F.$$("[data-n]", sp).forEach((b) => b.onclick = () => { cfg.n = +b.dataset.n; barraN(); atualizarInfo(); });
      F.$$("[data-t]", sp).forEach((b) => b.onclick = () => { cfg.times = +b.dataset.t; barraN(); atualizarInfo(); });
    }
    F.$$("[data-modo]", main).forEach((b) => b.onclick = () => {
      cfg.modo = b.dataset.modo;
      F.$$("[data-modo]", main).forEach((x) => x.classList.toggle("ativo", x === b));
      barraN(); reiniciar();
    });
    barraN();

    const maxToques = navigator.maxTouchPoints || 0;
    function atualizarInfo() {
      const n = dedos.size;
      let t = `${n} dedo${n === 1 ? "" : "s"} · mínimo ${minimo()}`;
      if (maxToques && n >= maxToques) t = `Este tablet reconhece até ${maxToques} dedos ao mesmo tempo.`;
      info.textContent = t;
    }
    atualizarInfo();

    if (!F.prefs.dicaGestos && ("ontouchstart" in window)) {
      F.prefs.dicaGestos = true; F.salvarPrefs();
      F.modal(`<h2>Dica rápida</h2><p class="lede">Alguns tablets têm gestos com vários dedos (pinçar com 4 ou 5 dedos para sair do app). Se o app fechar durante o sorteio, desative esses gestos nos ajustes do tablet. Toquem no meio da tela, longe das bordas.</p>
        <div class="linha fim"><button class="btn" data-f>Entendi</button></div>`, (el, m) => { F.$("[data-f]", el).onclick = m.fechar; });
    }

    function criarDedo(id, x, y) {
      const cor = CORES[corIdx++ % CORES.length];
      const el = document.createElement("div");
      el.className = "sd-dedo";
      el.style.setProperty("--c", cor);
      el.innerHTML = `<svg viewBox="0 0 148 148"><circle cx="74" cy="74" r="70"/></svg>`;
      el.style.left = x + "px"; el.style.top = y + "px";
      area.appendChild(el);
      dedos.set(id, { x, y, cor, el });
      F.som("toque");
    }
    function pos(e) { const r = area.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }

    function mudou() {
      atualizarInfo();
      if (estado === "resultado") return;
      F.cancelar(contagemT);
      dedos.forEach((d) => { d.el.classList.remove("contando"); void d.el.offsetWidth; });
      estado = "esperando";
      if (dedos.size >= minimo()) {
        estado = "contando";
        dedos.forEach((d) => d.el.classList.add("contando"));
        F.som("tambor");
        contagemT = F.timeout(sortear, 2000);
      }
    }

    function sortear() {
      estado = "resultado";
      const ids = F.embaralhar(Array.from(dedos.keys())); // sorteio no instante, independente da ordem de toque
      dedos.forEach((d) => d.el.classList.remove("contando"));
      resultado = { modo: cfg.modo };
      if (cfg.modo === "um" || cfg.modo === "varios") {
        const k = cfg.modo === "um" ? 1 : cfg.n;
        const escolhidos = ids.slice(0, k);
        dedos.forEach((d, id) => d.el.classList.add(escolhidos.includes(id) ? "escolhido" : "fora"));
        resultado.escolhidos = escolhidos.length;
        F.som("revelacao"); F.vibrar(200);
      } else if (cfg.modo === "times") {
        const cores = F.TIMES.map((t) => t.cor);
        ids.forEach((id, i) => {
          const t = i % cfg.times, d = dedos.get(id);
          d.el.style.setProperty("--c", cores[t]);
          d.el.innerHTML += `<span class="letra">${LETRAS[t]}</span>`;
          d.time = t;
        });
        leg.innerHTML = F.TIMES.slice(0, cfg.times).map((t, i) => `<span>${LETRAS[i]} = ${t.icone} ${t.nome}</span>`).join("");
        resultado.times = cfg.times;
        F.som("revelacao"); F.vibrar(200);
      } else {
        ids.forEach((id, i) => { dedos.get(id).el.innerHTML += `<span class="numero">${i + 1}</span>`; });
        F.som("revelacao"); F.vibrar(200);
      }
      info.textContent = "Tirem os dedos quando quiserem.";
    }

    function aoVazio() {
      if (estado !== "resultado") return;
      F.cancelar(resetT);
      if (o.perguntar && o.jogadores && o.jogadores.length) { perguntar(); return; }
      resetT = F.timeout(reiniciar, 3000);
    }

    function reiniciar() {
      F.cancelar(contagemT); F.cancelar(resetT);
      area.querySelectorAll(".sd-dedo").forEach((e) => e.remove());
      dedos.clear(); leg.innerHTML = "";
      estado = "esperando"; resultado = null; corIdx = 0;
      atualizarInfo();
    }

    // Pergunta opcional "Quem foi escolhido?" para alimentar os jogos.
    function perguntar() {
      const js = o.jogadores;
      if (resultado.modo === "times") {
        const times = [];
        let t = 0;
        const usados = new Set();
        const passo = () => {
          if (t >= resultado.times) { o.aoTerminar(times.every((x) => x.length) ? { times } : null); return; }
          const sel = new Set();
          F.modal(`<h2>Quem ficou no ${F.TIMES[t].icone} ${F.TIMES[t].nome} (${LETRAS[t]})?</h2>
            <div class="chips">${js.filter((j) => !usados.has(j.id)).map((j) => `<button class="chip" data-id="${j.id}" style="padding:4px">${F.pill(j)}</button>`).join("")}</div>
            <div class="linha fim"><button class="btn sec" data-p>Pular</button><button class="btn" data-ok>Próximo ▶</button></div>`, (el, m) => {
            F.$$("[data-id]", el).forEach((b) => b.onclick = () => { const id = b.dataset.id; sel.has(id) ? sel.delete(id) : sel.add(id); b.classList.toggle("ativo", sel.has(id)); });
            F.$("[data-p]", el).onclick = () => { m.fechar(); o.aoTerminar(null); };
            F.$("[data-ok]", el).onclick = () => { m.fechar(); sel.forEach((id) => usados.add(id)); times.push(Array.from(sel)); t += 1; passo(); };
          });
        };
        passo();
        return;
      }
      if (resultado.modo === "ordem") { o.aoTerminar({ modo: "ordem" }); return; }
      const multi = resultado.escolhidos > 1;
      const sel = new Set();
      F.modal(`<h2>Quem foi escolhido?</h2>
        <div class="chips">${js.map((j) => `<button class="chip ${multi ? "" : "radio"}" data-id="${j.id}" style="padding:4px">${F.pill(j)}</button>`).join("")}</div>
        <div class="linha fim"><button class="btn sec" data-p>Pular</button>${multi ? '<button class="btn" data-ok>Pronto</button>' : ""}</div>`, (el, m) => {
        F.$$("[data-id]", el).forEach((b) => b.onclick = () => {
          if (!multi) { m.fechar(); o.aoTerminar({ escolhidos: [b.dataset.id] }); return; }
          const id = b.dataset.id; sel.has(id) ? sel.delete(id) : sel.add(id); b.classList.toggle("ativo", sel.has(id));
        });
        F.$("[data-p]", el).onclick = () => { m.fechar(); o.aoTerminar(null); };
        const ok = F.$("[data-ok]", el);
        if (ok) ok.onclick = () => { m.fechar(); o.aoTerminar({ escolhidos: Array.from(sel) }); };
      });
    }

    area.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      if (estado === "resultado") return; // dedos novos ignorados até a tela esvaziar
      F.cancelar(resetT);
      const [x, y] = pos(e);
      criarDedo(e.pointerId, x, y);
      mudou();
    });
    area.addEventListener("pointermove", (e) => {
      const d = dedos.get(e.pointerId);
      if (!d) return;
      const [x, y] = pos(e);
      d.x = x; d.y = y; d.el.style.left = x + "px"; d.el.style.top = y + "px";
    });
    const tirar = (e) => {
      const d = dedos.get(e.pointerId);
      if (!d) return;
      if (estado === "resultado") {
        dedos.delete(e.pointerId);
        if (!dedos.size) aoVazio();
        return;
      }
      d.el.remove();
      dedos.delete(e.pointerId);
      mudou();
    };
    ["pointerup", "pointercancel"].forEach((ev) => area.addEventListener(ev, tirar));
    area.addEventListener("contextmenu", (e) => e.preventDefault());
    F.$("#denovo", main).onclick = reiniciar;
    const pular = F.$("#pular", main);
    if (pular) pular.onclick = () => o.aoTerminar(null);
    F.aoPausar = reiniciar;
  };

})();
