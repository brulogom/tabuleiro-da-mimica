// Jogos de Festa — núcleo compartilhado: noite, jogadores, placar, sons, cronômetro,
// tela de privacidade, modais e navegação. Tudo fica em window.F.
(function () {
  "use strict";
  const C = window.Calc;
  const F = (window.F = {});
  F.calc = C;
  F.jogos = [];
  F.MIMICA_URL = "mimica.html"; // o build troca para "mimica.html"

  // ================= utilidades =================
  F.esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  F.$ = (sel, raiz) => (raiz || document).querySelector(sel);
  F.$$ = (sel, raiz) => Array.from((raiz || document).querySelectorAll(sel));
  F.uid = (p) => (p || "id") + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  F.agoraISO = () => {
    const d = new Date(), z = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`;
  };
  F.idPartida = (jogo) => {
    const d = new Date(), z = (n) => String(n).padStart(2, "0");
    return `p_${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}_${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}_${jogo}`;
  };
  F.randInt = C.randInt;
  F.embaralhar = C.embaralhar;
  F.sortear = C.sortear;
  F.contraste = (hex) => {
    const h = hex.replace("#", "");
    const r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62 ? "#1A1A1A" : "#FFFFFF";
  };
  F.vibrar = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };

  // Timers da sessão atual: sair para o menu cancela todos de uma vez.
  const timers = new Set();
  F.timeout = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  F.cancelar = (id) => { clearTimeout(id); clearInterval(id); timers.delete(id); };
  F.intervalo = (fn, ms) => { const id = setInterval(fn, ms); timers.add(id); return id; };
  F.esperar = (ms) => new Promise((r) => F.timeout(r, ms));
  const limpadores = new Set();
  F.aoLimpar = (fn) => limpadores.add(fn);
  F.limparSessao = () => {
    timers.forEach((id) => { clearTimeout(id); clearInterval(id); });
    timers.clear();
    limpadores.forEach((fn) => { try { fn(); } catch (e) {} });
    limpadores.clear();
    F.pararAmbiente();
    try { speechSynthesis.cancel(); } catch (e) {}
  };

  // ================= armazenamento =================
  const K_NOITE = "festa:noite", K_ARQ = "festa:arquivo", K_PREFS = "festa:prefs";
  function ler(k, padrao) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; } }
  function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { F.toast("Não foi possível salvar no aparelho.", true); } }

  F.prefs = Object.assign({ mudo: false, volume: 0.8, banidas: {}, dicaGestos: false, configs: {} }, ler(K_PREFS, {}));
  F.salvarPrefs = () => gravar(K_PREFS, F.prefs);
  F.config = (jogo, padrao) => Object.assign({}, padrao, F.prefs.configs[jogo] || {});
  F.guardarConfig = (jogo, cfg) => { F.prefs.configs[jogo] = cfg; F.salvarPrefs(); };

  F.noite = ler(K_NOITE, null);
  F.salvar = () => { if (F.noite) gravar(K_NOITE, F.noite); else { try { localStorage.removeItem(K_NOITE); } catch (e) {} } };
  F.arquivo = () => ler(K_ARQ, []);

  F.novaNoite = (publico) => {
    F.noite = { id: F.uid("n"), criadaEm: F.agoraISO(), encerradaEm: null, publico: publico || "livre", jogadores: [], partidas: [], ajustes: [], usados: {} };
    F.salvar();
  };
  F.encerrarNoite = () => {
    if (!F.noite) return;
    F.noite.encerradaEm = F.agoraISO();
    const arq = F.arquivo();
    arq.unshift(F.noite);
    gravar(K_ARQ, arq.slice(0, 10));
    F.noite = null;
    F.salvar();
  };

  // ================= jogadores =================
  F.CORES = ["#E03131", "#1971C2", "#2F9E44", "#F08C00", "#7048E8", "#E64980", "#0C8599", "#8D5A2B",
    "#5C940D", "#C2255C", "#364FC7", "#D9480F", "#495057", "#9C36B5", "#087F5B", "#B08900"];
  F.EMOJIS = ["😎", "🦊", "🐸", "🐼", "🦁", "🐙", "🦄", "🐝", "🌵", "🍕", "🎸", "🚀", "⚡", "🌈", "🍉", "🎩", "👑", "🐢", "🐧", "🦖", "🍩", "🔥", "💎", "🎯", "🌻", "🐳", "🤠", "👽", "🤖", "🥑"];
  F.todos = () => (F.noite ? F.noite.jogadores : []);
  F.ativos = () => F.todos().filter((j) => j.ativo);
  F.jog = (id) => F.todos().find((j) => j.id === id);
  F.nome = (id) => { const j = F.jog(id); return j ? j.nome : "?"; };
  F.corLivre = () => {
    const usadas = F.todos().filter((j) => j.ativo).map((j) => j.cor);
    return F.CORES.find((c) => !usadas.includes(c)) || F.CORES[F.todos().length % F.CORES.length];
  };
  F.addJogador = (nome, cor, emoji) => {
    const j = { id: F.uid("j"), nome: nome.trim().slice(0, 12), cor: cor || F.corLivre(), emoji: emoji || "", ativo: true, chegouAgora: F.noite.partidas.length > 0 };
    F.noite.jogadores.push(j);
    F.salvar();
    return j;
  };
  F.pill = (j, extra) => {
    if (!j) return "";
    const txt = F.contraste(j.cor);
    return `<span class="pill${j.ativo ? "" : " inativo"}" ${extra || ""}><span class="bola" style="background:${j.cor};color:${txt}">${j.emoji ? F.esc(j.emoji) : F.esc(j.nome.charAt(0).toUpperCase())}</span>${F.esc(j.nome)}</span>`;
  };
  F.bolaGrande = (j) => `<div class="bola-grande" style="background:${j.cor};color:${F.contraste(j.cor)}">${j.emoji ? F.esc(j.emoji) : F.esc(j.nome.charAt(0).toUpperCase())}</div>`;

  // ================= conteúdo =================
  F.publicoOk = (item, deck) => {
    const p = (item && item.publico) || (deck && deck.publico) || "livre";
    return p === "livre" || (F.noite && F.noite.publico === "adulto");
  };
  F.banida = (jogo, chave) => !!(F.prefs.banidas[jogo] && F.prefs.banidas[jogo].includes(chave));
  F.banir = (jogo, chave) => {
    F.prefs.banidas[jogo] = F.prefs.banidas[jogo] || [];
    if (!F.prefs.banidas[jogo].includes(chave)) F.prefs.banidas[jogo].push(chave);
    F.salvarPrefs();
  };
  F.usado = (jogo, chave) => !!(F.noite && F.noite.usados[jogo] && F.noite.usados[jogo].includes(chave));
  F.marcarUsado = (jogo, chave) => {
    if (!F.noite) return;
    F.noite.usados[jogo] = F.noite.usados[jogo] || [];
    if (!F.noite.usados[jogo].includes(chave)) F.noite.usados[jogo].push(chave);
    F.salvar();
  };
  // Itens ainda não usados na noite (embaralhados). Se todos já saíram, libera o jogo de novo.
  F.novos = (jogo, lista, chave) => {
    const k = chave || ((x) => x);
    const validos = lista.filter((x) => !F.banida(jogo, k(x)));
    let novos = validos.filter((x) => !F.usado(jogo, k(x)));
    if (!novos.length && validos.length) {
      F.noite.usados[jogo] = (F.noite.usados[jogo] || []).filter((c) => !validos.some((x) => k(x) === c));
      F.salvar();
      novos = validos.slice();
    }
    return F.embaralhar(novos);
  };

  // ================= placar =================
  F.calcularPontosDaNoite = C.calcularPontosDaNoite;
  F.registrarPartida = (p) => {
    if (!F.noite) { F.toast("Nenhuma noite aberta — partida não registrada.", true); return false; }
    if (F.noite.partidas.some((x) => x.id === p.id)) return true; // toque duplo: ignora
    const erros = C.validarPartida(F.noite, p);
    if (erros.length) {
      console.error("[registrarPartida] partida inválida", erros, p);
      F.toast("Erro ao registrar a partida: " + erros.join("; "), true);
      return false;
    }
    F.noite.partidas.push({ id: p.id, jogo: p.jogo, inicio: p.inicio, fim: p.fim || F.agoraISO(), resultados: p.resultados, destaques: p.destaques || [] });
    p.resultados.forEach((r) => { const j = F.jog(r.jogadorId); if (j) j.chegouAgora = false; });
    F.salvar();
    return true;
  };
  F.totais = () => C.calcularTotais(F.noite);
  F.nomeJogo = (id) => (F.jogos.find((g) => g.id === id) || { nome: id }).nome;

  // ================= sons (Web Audio, sem arquivos) =================
  let ctx = null, mestre = null, ambiente = null;
  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      mestre = ctx.createGain();
      mestre.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    mestre.gain.value = F.prefs.mudo ? 0 : F.prefs.volume;
    return ctx;
  }
  document.addEventListener("pointerdown", () => audio(), { capture: true });
  function tom(freq, ini, dur, tipo, vol, freqFim) {
    const a = audio(); if (!a) return;
    const t0 = a.currentTime + ini;
    const o = a.createOscillator(), g = a.createGain();
    o.type = tipo || "sine";
    o.frequency.setValueAtTime(freq, t0);
    if (freqFim) o.frequency.exponentialRampToValueAtTime(freqFim, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(mestre);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function ruido(ini, dur, vol, filtroFreq) {
    const a = audio(); if (!a) return;
    const n = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, n, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = a.createBufferSource(); s.buffer = buf;
    const f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = filtroFreq || 900;
    const g = a.createGain(); g.gain.value = vol || 0.4;
    s.connect(f); f.connect(g); g.connect(mestre);
    s.start(a.currentTime + ini);
  }
  const SONS = {
    toque: () => tom(660, 0, 0.08, "triangle", 0.25),
    pop: () => tom(420, 0, 0.12, "sine", 0.3, 880),
    acerto: () => { tom(880, 0, 0.14, "triangle", 0.35); tom(1320, 0.1, 0.25, "triangle", 0.35); },
    passa: () => { tom(520, 0, 0.14, "sine", 0.3); tom(390, 0.12, 0.2, "sine", 0.3); },
    erro: () => tom(160, 0, 0.35, "sawtooth", 0.3, 110),
    nao: () => tom(200, 0, 0.12, "square", 0.18),
    buzina: () => { tom(220, 0, 0.7, "sawtooth", 0.5); tom(233, 0, 0.7, "square", 0.3); },
    tique: () => tom(1500, 0, 0.04, "square", 0.15),
    fim: () => { [0, 0.3, 0.6].forEach((t) => tom(988, t, 0.22, "square", 0.3)); },
    apito: () => { tom(2100, 0, 0.18, "sine", 0.4); tom(2100, 0.24, 0.6, "sine", 0.4); },
    suspense: () => { tom(110, 0, 1.8, "sawtooth", 0.18, 220); tom(165, 0.2, 1.6, "triangle", 0.15, 330); },
    revelacao: () => { [523, 659, 784, 1047].forEach((f, i) => tom(f, i * 0.09, 0.5, "triangle", 0.28)); },
    vitoria: () => { [523, 523, 523, 698, 880, 784, 1047].forEach((f, i) => tom(f, [0, .14, .28, .42, .7, .9, 1.1][i], i === 6 ? 0.8 : 0.2, "triangle", 0.32)); },
    tambor: () => { for (let i = 0; i < 18; i++) ruido(i * 0.11, 0.09, 0.35 + i * 0.015, 500); },
    contagem: () => tom(740, 0, 0.18, "triangle", 0.35),
    largada: () => tom(1180, 0, 0.35, "triangle", 0.4),
  };
  F.som = (nome) => { try { if (!F.prefs.mudo && SONS[nome]) SONS[nome](); } catch (e) {} };
  F.alternarMudo = () => { F.prefs.mudo = !F.prefs.mudo; F.salvarPrefs(); audio(); if (F.prefs.mudo) { try { speechSynthesis.cancel(); } catch (e) {} } F.atualizarTopo(); };

  // Som ambiente noturno (ruído marrom baixo + grilos), para disfarçar barulhos da noite.
  F.iniciarAmbiente = () => {
    const a = audio(); if (!a || ambiente) return;
    const n = a.sampleRate * 4, buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    let ult = 0;
    for (let i = 0; i < n; i++) { const b = Math.random() * 2 - 1; ult = (ult + 0.02 * b) / 1.02; d[i] = ult * 3.2; }
    const s = a.createBufferSource(); s.buffer = buf; s.loop = true;
    const g = a.createGain(); g.gain.value = 0.22;
    s.connect(g); g.connect(mestre); s.start();
    const grilo = setInterval(() => { if (!F.prefs.mudo) { for (let i = 0; i < 3; i++) tom(4200 + Math.random() * 300, i * 0.07, 0.05, "sine", 0.04); } }, 2300);
    ambiente = { s, grilo };
  };
  F.pararAmbiente = () => { if (ambiente) { try { ambiente.s.stop(); } catch (e) {} clearInterval(ambiente.grilo); ambiente = null; } };

  // Voz sintética em português (quando disponível). Sempre resolve, mesmo sem voz.
  F.falar = (texto, usarVoz) => new Promise((resolve) => {
    const estimado = 900 + texto.length * 70;
    if (!usarVoz || F.prefs.mudo || !("speechSynthesis" in window)) { F.timeout(resolve, Math.min(estimado, 2500)); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = "pt-BR"; u.rate = 0.95; u.volume = F.prefs.volume;
      const voz = speechSynthesis.getVoices().find((v) => /^pt(-|_)BR/i.test(v.lang)) || speechSynthesis.getVoices().find((v) => /^pt/i.test(v.lang));
      if (voz) u.voice = voz;
      let feito = false;
      const fim = () => { if (!feito) { feito = true; resolve(); } };
      u.onend = fim; u.onerror = fim;
      F.timeout(fim, estimado + 3000);
      speechSynthesis.speak(u);
    } catch (e) { F.timeout(resolve, estimado); }
  });

  // ================= tela acesa e segundo plano =================
  let wake = null, querAcesa = false;
  F.telaAcesa = async (sim) => {
    querAcesa = sim;
    try {
      if (sim && !wake && navigator.wakeLock) { wake = await navigator.wakeLock.request("screen"); wake.addEventListener("release", () => { wake = null; }); }
      if (!sim && wake) { await wake.release(); wake = null; }
    } catch (e) {}
  };
  F.aoPausar = null;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { if (typeof F.aoPausar === "function") F.aoPausar(); }
    else if (querAcesa) F.telaAcesa(true);
  });

  // ================= modais =================
  F.modal = (html, montar) => {
    const fundo = document.createElement("div");
    fundo.className = "modal-fundo";
    fundo.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
    document.body.appendChild(fundo);
    const m = { el: fundo.firstChild, fechar: () => fundo.remove() };
    if (montar) montar(m.el, m);
    return m;
  };
  F.confirmar = (titulo, texto, o) => new Promise((resolve) => {
    o = o || {};
    F.modal(`<h2>${F.esc(titulo)}</h2>${texto ? `<p class="lede">${F.esc(texto)}</p>` : ""}
      <div class="linha fim"><button class="btn sec" data-r="0">${F.esc(o.nao || "Cancelar")}</button>
      <button class="btn ${o.perigo ? "perigo" : ""}" data-r="1">${F.esc(o.sim || "Confirmar")}</button></div>`, (el, m) => {
      F.$$("[data-r]", el).forEach((b) => b.onclick = () => { m.fechar(); resolve(b.dataset.r === "1"); });
    });
  });
  F.escolherJogador = (lista, titulo, o) => new Promise((resolve) => {
    o = o || {};
    F.modal(`<h2>${F.esc(titulo)}</h2><div class="chips">${lista.map((j) => `<button class="chip radio" data-id="${j.id}" style="border-color:${j.cor}">${F.pill(j)}</button>`).join("")}</div>
      <div class="linha fim"><button class="btn sec" data-x>${F.esc(o.cancelar || "Cancelar")}</button></div>`, (el, m) => {
      F.$$("[data-id]", el).forEach((b) => b.onclick = () => { m.fechar(); resolve(F.jog(b.dataset.id)); });
      F.$("[data-x]", el).onclick = () => { m.fechar(); resolve(null); };
    });
  });
  let toastT = null;
  F.toast = (msg, erro) => {
    const velho = F.$(".toast"); if (velho) velho.remove();
    const t = document.createElement("div");
    t.className = "toast" + (erro ? " erro" : "");
    t.textContent = msg;
    document.body.appendChild(t);
    clearTimeout(toastT);
    toastT = setTimeout(() => t.remove(), erro ? 6000 : 2600);
  };
  F.flash = (cor, texto, ms) => {
    const f = document.createElement("div");
    f.className = "flash " + cor;
    f.innerHTML = texto;
    document.body.appendChild(f);
    setTimeout(() => f.remove(), ms || 800);
  };
  F.confete = () => {
    const cores = ["#FF5A36", "#F0B429", "#2F9E44", "#1971C2", "#E64980", "#7048E8"];
    for (let i = 0; i < 90; i++) {
      const c = document.createElement("div");
      c.className = "confete";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = cores[i % cores.length];
      c.style.animationDuration = 2.2 + Math.random() * 2.2 + "s";
      c.style.animationDelay = Math.random() * 0.8 + "s";
      c.style.borderRadius = i % 3 ? "2px" : "50%";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 5500);
    }
  };

  // ================= navegação e barra fixa =================
  const app = () => document.getElementById("app");
  let topoAtual = {};
  F.emPartida = false;
  F.mostrar = (html, o) => {
    o = o || {};
    topoAtual = o;
    F.aoPausar = null;
    document.body.classList.toggle("noite-escura", !!o.escura);
    const topo = o.semTopo ? "" : `<div class="topbar${o.escura ? " escura" : ""}">
        ${o.voltar !== false ? `<button class="icon-btn" data-topo="menu" aria-label="Menu">${o.emPartida ? "✕" : "🏠"}</button>` : ""}
        <div class="titulo">${F.esc(o.titulo || "")}</div>
        ${o.extraTopo || ""}
        <button class="icon-btn" data-topo="som" aria-label="Som">${F.prefs.mudo ? "🔇" : "🔊"}</button>
      </div>`;
    app().innerHTML = topo + `<main class="tela ${o.classe || ""}${o.escura ? " tela-escura" : ""}">${html}</main>`;
    const menu = F.$('[data-topo="menu"]');
    if (menu) menu.onclick = () => F.sairParaMenu();
    const som = F.$('[data-topo="som"]');
    if (som) som.onclick = () => F.alternarMudo();
    window.scrollTo(0, 0);
    return F.$("main.tela");
  };
  F.atualizarTopo = () => { const b = F.$('[data-topo="som"]'); if (b) b.textContent = F.prefs.mudo ? "🔇" : "🔊"; };
  F.sairParaMenu = async () => {
    if (topoAtual.emPartida) {
      const ok = await F.confirmar("Encerrar a partida?", "A partida em andamento não entra no placar.", { sim: "Encerrar", perigo: true });
      if (!ok) return;
    }
    F.irMenu();
  };
  F.irMenu = () => {
    F.limparSessao();
    F.telaAcesa(false);
    F.emPartida = false;
    if (F.hub && F.noite) F.hub.menu(); else if (F.hub) F.hub.inicio();
  };

  // ================= cronômetro =================
  F.cronometro = (o) => {
    const tam = o.tam || 140, raio = 44, circ = 2 * Math.PI * raio;
    const el = document.createElement("div");
    el.className = "crono";
    el.style.setProperty("--tam", tam + "px");
    if (o.cor) el.style.setProperty("--cor", o.cor);
    el.innerHTML = `<svg viewBox="0 0 100 100"><circle class="fundo" cx="50" cy="50" r="${raio}" fill="none" stroke-width="9"/>
      <circle class="arco" cx="50" cy="50" r="${raio}" fill="none" stroke-width="9" stroke-dasharray="${circ}" stroke-dashoffset="0"/></svg><div class="num"></div>`;
    const arco = el.querySelector(".arco"), num = el.querySelector(".num");
    let total = o.segundos, restanteMs = total * 1000, fimEm = 0, rodando = false, id = null, ultimoSeg = null;
    const alerta = o.alerta == null ? 5 : o.alerta;
    function desenhar() {
      const s = Math.max(0, Math.ceil(restanteMs / 1000));
      num.textContent = s;
      arco.style.strokeDashoffset = String(circ * (1 - restanteMs / (total * 1000)));
      el.classList.toggle("alerta", s <= alerta && restanteMs > 0);
      if (rodando && s !== ultimoSeg) {
        if (s <= alerta && s > 0 && ultimoSeg !== null) F.som("tique");
        ultimoSeg = s;
        o.aoSegundo && o.aoSegundo(s);
      }
    }
    function passo() {
      restanteMs = fimEm - performance.now();
      if (restanteMs <= 0) {
        restanteMs = 0; rodando = false; F.cancelar(id); desenhar();
        if (o.somFim !== false) F.som(o.somFim || "fim");
        o.aoTerminar && o.aoTerminar();
        return;
      }
      desenhar();
    }
    const api = {
      el,
      iniciar() { if (rodando || restanteMs <= 0) return api; rodando = true; el.classList.remove("pausado"); fimEm = performance.now() + restanteMs; ultimoSeg = null; id = F.intervalo(passo, 100); desenhar(); return api; },
      pausar() { if (!rodando) return api; restanteMs = Math.max(0, fimEm - performance.now()); rodando = false; F.cancelar(id); el.classList.add("pausado"); desenhar(); return api; },
      parar() { rodando = false; F.cancelar(id); return api; },
      reiniciar(seg) { api.parar(); total = seg || total; restanteMs = total * 1000; desenhar(); return api.iniciar(); },
      somar(seg) { if (rodando) fimEm += seg * 1000; else restanteMs += seg * 1000; total = Math.max(total, Math.ceil((rodando ? fimEm - performance.now() : restanteMs) / 1000)); desenhar(); return api; },
      restante: () => (rodando ? Math.max(0, fimEm - performance.now()) : restanteMs) / 1000,
      rodando: () => rodando,
    };
    desenhar();
    return api;
  };

  // Contagem 3-2-1 em tela cheia. Resolve quando termina.
  F.contagem = (o) => new Promise((resolve) => {
    o = o || {};
    const main = F.mostrar(`<div class="coluna" style="align-items:center; gap:14px">
      ${o.acima || ""}<div class="contagem" id="cnt">3</div>${o.abaixo || ""}</div>`, { titulo: o.titulo || "", classe: "centro", emPartida: true, escura: o.escura });
    let n = 3;
    F.som("contagem");
    const passo = () => {
      n -= 1;
      if (n <= 0) { F.som("largada"); resolve(); return; }
      const c = F.$("#cnt", main);
      if (!c) return;
      c.textContent = n; c.style.animation = "none"; void c.offsetWidth; c.style.animation = "";
      F.som("contagem");
      o.aoPasso && o.aoPasso(n);
      F.timeout(passo, 1000);
    };
    F.timeout(passo, 1000);
  });

  // Botão que só dispara depois de segurar por `ms` (pausar, encerrar...).
  F.segurarPara = (btn, ms, fn) => {
    let t = null;
    const txt = btn.innerHTML;
    const soltar = () => { clearTimeout(t); t = null; btn.innerHTML = txt; btn.style.opacity = ""; };
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      btn.style.opacity = ".6"; btn.innerHTML = "Segure…";
      t = setTimeout(() => { soltar(); fn(); }, ms);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => btn.addEventListener(ev, soltar));
    btn.addEventListener("contextmenu", (e) => e.preventDefault());
  };

  // ================= tela de privacidade (passa o tablet) =================
  // o.jogador; o.modo "segurar" (o.segredo(j) → {topo, grande, baixo, extra}) ou "interagir" (o.montar(main, pronto));
  // o.aoConcluir(); o.botoes [{ texto, acao }] na tela do segredo; o.titulo; o.escura; o.proximo (texto opcional)
  F.privacidade = (o) => {
    const j = o.jogador;
    const cfgTela = { titulo: o.titulo || "", emPartida: true, escura: o.escura, extraTopo: o.extraTopo };
    function neutra() {
      const main = F.mostrar(`<div class="priv">
          <p class="passe">Passe o tablet para</p>
          ${F.bolaGrande(j)}
          <div class="enorme" style="color:${o.escura ? "#fff" : "inherit"}">${F.esc(j.nome.toUpperCase())}</div>
          <button class="btn grande" id="souEu">Sou eu</button>
          ${o.rodapeNeutra || ""}
        </div>`, cfgTela);
      F.$("#souEu", main).onclick = () => (o.modo === "interagir" ? interagir() : segurar());
      o.aoNeutra && o.aoNeutra(main);
      F.aoPausar = null;
    }
    function segurar() {
      const s = o.segredo(j);
      const main = F.mostrar(`<div class="priv">
          <p class="passe">${F.esc(j.nome)}, só você pode ver</p>
          <div id="zona" style="display:flex;align-items:center;justify-content:center;min-height:260px;width:100%;position:relative">
            <button class="segure" id="segure">👆 Segure para ver</button>
            <div class="segredo oculto" id="seg" style="position:absolute;pointer-events:none"><div class="s-topo">${F.esc(s.topo || "")}</div><div class="s-grande">${F.esc(s.grande || "")}</div>
              <div class="s-baixo">${F.esc(s.baixo || "")}</div><div class="s-extra">${F.esc(s.extra || "")}</div></div>
          </div>
          <p class="mudo pequeno">Solte o dedo quando terminar de ver.</p>
          <div class="linha" style="justify-content:center">${(o.botoes || []).map((b, i) => `<button class="btn fantasma" data-b="${i}">${F.esc(b.texto)}</button>`).join("")}</div>
        </div>`, cfgTela);
      const btn = F.$("#segure", main), seg = F.$("#seg", main);
      let inicio = 0, segurando = false;
      // O botão fica por baixo (invisível) e captura o dedo; o segredo aparece por cima sem receber toques.
      const mostrarSeg = (e) => {
        e.preventDefault();
        try { btn.setPointerCapture(e.pointerId); } catch (er) {}
        segurando = true; inicio = performance.now();
        btn.style.opacity = "0"; seg.classList.remove("oculto");
      };
      const soltar = () => {
        if (!segurando) return;
        segurando = false;
        seg.classList.add("oculto"); btn.style.opacity = "";
        if (performance.now() - inicio >= 500) { F.som("toque"); o.aoConcluir && o.aoConcluir(); }
      };
      btn.addEventListener("pointerdown", mostrarSeg);
      ["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) => btn.addEventListener(ev, soltar));
      btn.addEventListener("contextmenu", (e) => e.preventDefault());
      F.$$("[data-b]", main).forEach((b) => b.onclick = () => o.botoes[+b.dataset.b].acao());
      F.aoPausar = () => neutra();
    }
    function interagir() {
      const main = F.mostrar(`<div id="privArea" class="coluna" style="flex:1"></div>`, cfgTela);
      o.montar(F.$("#privArea", main), () => { F.som("toque"); o.aoConcluir && o.aoConcluir(); });
      F.aoPausar = () => { o.aoPausarInteracao && o.aoPausarInteracao(); neutra(); };
    }
    neutra();
    return { neutra };
  };

  // Distribui um segredo para uma lista de jogadores, um por vez.
  F.distribuir = (o) => {
    let i = 0;
    const proximo = () => {
      if (i >= o.jogadores.length) { o.aoTerminar && o.aoTerminar(); return; }
      const j = o.jogadores[i];
      F.privacidade(Object.assign({}, o, { jogador: j, aoConcluir: () => { i += 1; proximo(); } }));
    };
    proximo();
  };

  // ================= times =================
  F.TIMES = [
    { nome: "Time Azul", cor: "#1971C2", icone: "🔵" },
    { nome: "Time Vermelho", cor: "#E03131", icone: "🔴" },
    { nome: "Time Verde", cor: "#2F9E44", icone: "🟢" },
    { nome: "Time Amarelo", cor: "#C98A00", icone: "🟡" },
  ];
  F.tagTime = (t) => `<span class="time-tag" style="--cor:${t.cor}">${t.icone} ${F.esc(t.nome)}</span>`;

  // Tela de montar times. o: { jogadores, min, max, minPorTime, titulo, texto, aoPronto(times) }
  F.montarTimes = (o) => {
    const nMax = Math.min(o.max || 4, Math.floor(o.jogadores.length / (o.minPorTime || 1)));
    let n = Math.max(o.min || 2, Math.min(o.n || 2, nMax));
    let grupos = C.dividirEmTimes(o.jogadores.map((j) => j.id), n);
    function render() {
      const tamanhos = grupos.map((g) => g.length);
      const invalido = tamanhos.some((t) => t < (o.minPorTime || 1));
      const main = F.mostrar(`
        <div class="card">
          <div><h2>Montar times</h2><p class="lede">Toque num jogador para passá-lo ao próximo time. ${F.esc(o.texto || "")}</p></div>
          <div class="campo"><span class="rotulo">Quantos times</span><div class="chips">
            ${[2, 3, 4].filter((k) => k <= nMax && k >= (o.min || 2)).map((k) => `<button class="chip radio ${k === n ? "ativo" : ""}" data-n="${k}">${k} times</button>`).join("")}
          </div></div>
          <div class="times">${grupos.map((g, ti) => `<div class="time-box" style="--cor:${F.TIMES[ti].cor}">
              <h3>${F.TIMES[ti].icone} ${F.TIMES[ti].nome} <span class="mudo pequeno">(${g.length})</span></h3>
              <div class="chips">${g.map((id) => `<button class="chip radio" data-mover="${id}" style="padding:4px">${F.pill(F.jog(id))}</button>`).join("") || '<span class="mudo">vazio</span>'}</div>
            </div>`).join("")}</div>
          ${invalido ? `<div class="aviso-box">Cada time precisa de pelo menos ${o.minPorTime || 1} jogador${(o.minPorTime || 1) > 1 ? "es" : ""}.</div>` : ""}
          <div class="linha">
            <button class="btn sec" id="sortear">🎲 Sortear equilibrado</button>
            <button class="btn sec" id="dedos">☝️ Sorteador de dedos</button>
            <span class="espaco"></span>
            <button class="btn grande" id="pronto" ${invalido ? "disabled" : ""}>Continuar ▶</button>
          </div>
        </div>`, { titulo: o.titulo || "Times" });
      F.$$("[data-n]", main).forEach((b) => b.onclick = () => { n = +b.dataset.n; grupos = C.dividirEmTimes(o.jogadores.map((j) => j.id), n); render(); });
      F.$$("[data-mover]", main).forEach((b) => b.onclick = () => {
        const id = b.dataset.mover;
        const de = grupos.findIndex((g) => g.includes(id));
        grupos[de] = grupos[de].filter((x) => x !== id);
        grupos[(de + 1) % n].push(id);
        render();
      });
      F.$("#sortear", main).onclick = () => { grupos = C.dividirEmTimes(o.jogadores.map((j) => j.id), n); F.som("pop"); render(); };
      F.$("#dedos", main).onclick = () => {
        F.sorteador.abrir({
          modo: "times", times: n, perguntar: true, jogadores: o.jogadores,
          aoTerminar: (res) => { if (res && res.times) { const soltos = o.jogadores.map((j) => j.id).filter((id) => !res.times.some((t) => t.includes(id))); grupos = res.times.map((t) => t.slice()); soltos.forEach((id, i) => grupos[i % n].push(id)); } render(); },
        });
      };
      F.$("#pronto", main).onclick = () => o.aoPronto(grupos.map((g, ti) => Object.assign({ id: "t" + ti, jogadores: g.slice() }, F.TIMES[ti])));
    }
    render();
  };

  // ================= seleção de participantes =================
  // Tela padrão de configuração: o.titulo, o.jogo (registro), o.corpo (html das opções), o.min, o.max,
  // o.montar(main, participantes), o.aoComecar(participantes)
  F.telaConfig = (o) => {
    const ativos = F.ativos();
    let sel = o.participantes || ativos.map((j) => j.id);
    sel = sel.filter((id) => ativos.some((j) => j.id === id));
    function render() {
      const n = sel.length;
      const ok = n >= o.min && n <= o.max;
      const main = F.mostrar(`
        <div class="card">
          <div class="linha"><span style="font-size:2.4rem">${o.jogo.icone}</span><div><h2 style="font-size:1.8rem">${F.esc(o.jogo.nome)}</h2>
            <p class="lede">${F.esc(o.jogo.descricao)}</p></div></div>
          <div class="campo"><span class="rotulo">Quem joga (${n}) — toque para tirar ou pôr</span>
            <div class="chips">${ativos.map((j) => `<button class="chip radio ${sel.includes(j.id) ? "" : "inativo"}" data-j="${j.id}" style="padding:4px; ${sel.includes(j.id) ? "" : "opacity:.35"}">${F.pill(j)}</button>`).join("")}</div>
            ${!ok ? `<div class="aviso-box">${n < o.min ? `Este jogo precisa de pelo menos ${o.min} jogadores.` : `Este jogo aceita no máximo ${o.max} jogadores.`} ${ativos.length < o.min ? "Cadastre mais gente em 👥 Jogadores." : ""}</div>` : ""}
          </div>
          ${o.corpo()}
          <div class="linha"><button class="btn fantasma" id="regras">📖 Como se joga</button><span class="espaco"></span>
            <button class="btn grande" id="comecar" ${ok ? "" : "disabled"}>Começar ▶</button></div>
        </div>`, { titulo: o.jogo.nome });
      F.$$("[data-j]", main).forEach((b) => b.onclick = () => {
        const id = b.dataset.j;
        sel = sel.includes(id) ? sel.filter((x) => x !== id) : ativos.filter((j) => j.id === id || sel.includes(j.id)).map((j) => j.id);
        render();
      });
      F.$("#regras", main).onclick = () => F.modal(`<h2>${o.jogo.icone} ${F.esc(o.jogo.nome)}</h2><div class="lede" style="max-width:none">${o.jogo.regras}</div>
        <div class="linha fim"><button class="btn" data-f>Entendi</button></div>`, (el, m) => { F.$("[data-f]", el).onclick = m.fechar; });
      o.montar && o.montar(main, render);
      F.$("#comecar", main).onclick = () => o.aoComecar(sel.map(F.jog));
    }
    render();
    return { render };
  };

  // Helpers para grupos de chips de opção. opcoes: [[valor, rótulo]]
  F.chipsOpcao = (nome, opcoes, atual) => `<div class="chips">${opcoes.map(([v, r]) =>
    `<button class="chip radio ${String(v) === String(atual) ? "ativo" : ""}" data-op="${nome}" data-v="${F.esc(String(v))}">${F.esc(r)}</button>`).join("")}</div>`;
  F.ligarChips = (main, cfg, render, tipos) => {
    F.$$("[data-op]", main).forEach((b) => b.onclick = () => {
      const k = b.dataset.op, v = b.dataset.v;
      const t = (tipos && tipos[k]) || typeof cfg[k];
      cfg[k] = t === "number" ? Number(v) : t === "boolean" ? v === "true" : v;
      render();
    });
    F.$$("[data-multi]", main).forEach((b) => b.onclick = () => {
      const k = b.dataset.multi, v = b.dataset.v;
      const lista = cfg[k];
      const i = lista.indexOf(v);
      if (i >= 0) { if (lista.length > 1) lista.splice(i, 1); } else lista.push(v);
      render();
    });
  };
  F.chipsMulti = (nome, opcoes, lista) => `<div class="chips">${opcoes.map(([v, r]) =>
    `<button class="chip ${lista.includes(v) ? "ativo" : ""}" data-multi="${nome}" data-v="${F.esc(v)}">${F.esc(r)}</button>`).join("")}</div>`;
  F.opcao = (rotulo, html) => `<div class="campo"><span class="rotulo">${F.esc(rotulo)}</span>${html}</div>`;

  // ================= fim de partida =================
  // o: { jogo, inicio, resultados: [{ jogadorId, colocacao, pontosDeJogo, pontosDaNoite }], destaques, jogarDeNovo, rotuloPJ }
  F.finalizarPartida = (o) => {
    F.telaAcesa(false);
    const partida = { id: F.idPartida(o.jogo), jogo: o.jogo, inicio: o.inicio, fim: F.agoraISO(), resultados: o.resultados, destaques: o.destaques || [] };
    const ok = F.registrarPartida(partida);
    F.limparSessao();
    F.som("vitoria");
    F.confete();
    const ord = o.resultados.slice().sort((a, b) => a.colocacao - b.colocacao);
    const main = F.mostrar(`
      <div class="card">
        <div class="linha entre"><h2 style="font-size:2rem">🏁 Resultado da partida</h2><span class="mudo">${F.esc(F.nomeJogo(o.jogo))}</span></div>
        ${ok ? "" : '<div class="aviso-box">⚠️ A partida não pôde ser registrada no placar.</div>'}
        <div class="coluna">${ord.map((r, i) => {
          const j = F.jog(r.jogadorId);
          return `<div class="res-linha" style="animation-delay:${i * 0.12}s"><span class="col">${r.colocacao}º</span>${F.pill(j)}<span class="nome"></span>
            <span class="pj">${r.pontosDeJogo != null ? F.esc(r.pontosDeJogo + " " + (o.rotuloPJ || "pts de jogo")) : ""}</span>
            <span class="pn" style="animation-delay:${0.3 + i * 0.12}s">+${r.pontosDaNoite}</span></div>`;
        }).join("")}</div>
        ${(o.destaques || []).length ? `<div class="coluna">${o.destaques.map((d) => `<div class="aviso-box" style="border-color:var(--accent);background:transparent">⭐ ${F.esc(d)}</div>`).join("")}</div>` : ""}
        <div class="linha">
          ${o.jogarDeNovo ? '<button class="btn sec" id="denovo">🔁 Jogar de novo</button>' : ""}
          <span class="espaco"></span>
          <button class="btn sec" id="menu">🏠 Menu</button>
          <button class="btn grande" id="placar">🏆 Placar da noite</button>
        </div>
      </div>`, { titulo: "Resultado" });
    F.$("#placar", main).onclick = () => F.hub.placar();
    F.$("#menu", main).onclick = () => F.irMenu();
    const dn = F.$("#denovo", main);
    if (dn) dn.onclick = () => o.jogarDeNovo();
  };

  // Ranking de times → resultados por jogador (todos do time recebem os pontos do time).
  F.resultadosDeTimes = (times, pontos) => {
    const calc = C.calcularPontosDaNoite(times.map((t) => ({ id: t.id, pontosDeJogo: pontos[t.id] || 0 })), { individual: false });
    const res = [];
    calc.forEach((c) => {
      const t = times.find((x) => x.id === c.id);
      t.jogadores.forEach((jid) => { if (!res.some((r) => r.jogadorId === jid)) res.push({ jogadorId: jid, colocacao: c.colocacao, pontosDeJogo: c.pontosDeJogo, pontosDaNoite: c.pontosDaNoite }); });
    });
    return res;
  };
  F.resultadosIndividuais = (pontos) => C.calcularPontosDaNoite(Object.keys(pontos).map((id) => ({ id, pontosDeJogo: pontos[id] })), { individual: true })
    .map((c) => ({ jogadorId: c.id, colocacao: c.colocacao, pontosDeJogo: c.pontosDeJogo, pontosDaNoite: c.pontosDaNoite }));

  // Ajusta o tamanho da fonte para caber em até `linhas` linhas.
  F.caber = (el, max, min, linhas) => {
    if (!el) return;
    let t = max;
    el.style.fontSize = t + "px";
    const lh = () => parseFloat(getComputedStyle(el).lineHeight) || t * 1.05;
    // Folga de meia linha: fontes como a Baloo desenham um pouco além da altura da linha.
    while (t > min && (el.scrollHeight > lh() * ((linhas || 2) + 0.5) || el.scrollWidth > el.clientWidth + 2)) { t -= 4; el.style.fontSize = t + "px"; }
  };

  F.registrarJogo = (g) => F.jogos.push(g);
})();
