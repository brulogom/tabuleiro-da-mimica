// Cidade Dorme — papéis secretos, com o app como narrador.
(function () {
  "use strict";
  const JOGO = {
    id: "cidade-dorme", nome: "Cidade Dorme", icone: "🌙", cor: "#364FC7", jogadores: "5–16", duracao: "20–40 min", min: 5, max: 16,
    resumo: "A cidade dorme, os assassinos atacam e, de dia, todo mundo tenta descobrir quem são. O app é o narrador.",
    descricao: "A cidade dorme, os assassinos atacam e, de dia, todo mundo tenta descobrir quem são — com o app como narrador.",
    regras: `<p><b>Papéis:</b> 🔪 Assassino (escolhe com os parceiros quem atacar), 🔎 Detetive (investiga alguém por noite), 🩺 Médico (protege alguém por noite, nunca a mesma pessoa duas noites seguidas), 🏠 Cidadão.</p>
      <p>1. O tablet passa de mão em mão e cada um vê seu papel em segredo.</p>
      <p>2. <b>Noite:</b> tablet no centro, todos de olhos fechados. O app chama cada papel; quem é acorda, toca no nome escolhido e confirma.</p>
      <p>3. <b>Dia:</b> o app anuncia quem foi atacado. O grupo discute e vota para eliminar um suspeito (ou ninguém).</p>
      <p>A cidade vence quando todos os assassinos forem eliminados. Os assassinos vencem quando forem tantos quanto os outros vivos.</p>
      <p>Pontos da noite: lado vencedor 4 (+1 para quem estiver vivo no fim); lado perdedor 1.</p>`,
    abrir: () => configurar(),
  };
  F.registrarJogo(JOGO);

  const PAPEIS = {
    assassino: { nome: "Assassino", icone: "🔪", lado: "assassinos", desc: "À noite, escolha com seus parceiros quem atacar." },
    detetive: { nome: "Detetive", icone: "🔎", lado: "cidade", desc: "À noite, investigue alguém e descubra se é assassino." },
    medico: { nome: "Médico", icone: "🩺", lado: "cidade", desc: "À noite, proteja alguém (não a mesma pessoa duas noites seguidas)." },
    cidadao: { nome: "Cidadão", icone: "🏠", lado: "cidade", desc: "Não age à noite. De dia, descubra os assassinos." },
  };
  const PADRAO = { assassinos: 0, detetive: true, medico: true, discussao: 180, revelar: true, votacao: "aberta", narracao: "voz" };
  const autoAss = (n) => (n <= 6 ? 1 : n <= 10 ? 2 : 3);

  function css() {
    if (document.getElementById("css-cidade")) return;
    const s = document.createElement("style");
    s.id = "css-cidade";
    s.textContent = `
      .cd-noite{background:#03060A !important; color:#5E7180;}
      .cd-noite .topbar{color:#3E4E5A;}
      .cd-texto{font-family:'Baloo 2'; font-weight:800; font-size:clamp(1.8rem,5vw,3.2rem); line-height:1.1; text-align:center; color:#7C8E9C;}
      .cd-lista{display:grid; grid-template-columns:repeat(auto-fill, minmax(190px,1fr)); gap:10px; width:100%;}
      .cd-nome{background:#0B1118; border:2px solid #16212B; color:#8FA3B2; border-radius:16px; min-height:74px; font-size:1.35rem; font-weight:800; padding:10px;}
      .cd-nome:disabled{opacity:.25;}
      .cd-nome.sel{border-color:#51677A; background:#121C26; color:#C5D3DE;}
      .cd-confirma{display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:10px;}
      .cd-btn{background:#0E1620; color:#9FB3C2; border:2px solid #1C2A36; border-radius:16px; min-height:64px; padding:10px 24px; font-size:1.2rem; font-weight:800;}
      .cd-hist{display:flex; flex-direction:column; gap:6px;}
    `;
    document.head.appendChild(s);
  }

  function configurar(participantes) {
    const cfg = F.config("cidade-dorme", PADRAO);
    F.telaConfig({
      jogo: JOGO, min: 5, max: 16, participantes,
      corpo: () => F.opcao("Assassinos", F.chipsOpcao("assassinos", [[0, "Automático"], [1, "1"], [2, "2"], [3, "3"], [4, "4"]], cfg.assassinos) + '<p class="mudo pequeno">Automático: 5–6 jogadores = 1 · 7–10 = 2 · 11–16 = 3</p>') +
        F.opcao("Detetive", F.chipsOpcao("detetive", [[true, "Sim"], [false, "Não"]], cfg.detetive)) +
        F.opcao("Médico", F.chipsOpcao("medico", [[true, "Sim"], [false, "Não"]], cfg.medico)) +
        F.opcao("Tempo de discussão", F.chipsOpcao("discussao", [[120, "2 min"], [180, "3 min"], [300, "5 min"], [0, "Sem limite"]], cfg.discussao)) +
        F.opcao("Revelar o papel de quem sai", F.chipsOpcao("revelar", [[true, "Sim"], [false, "Não"]], cfg.revelar)) +
        F.opcao("Votação", F.chipsOpcao("votacao", [["aberta", "Aberta"], ["secreta", "Secreta"]], cfg.votacao)) +
        F.opcao("Narração", F.chipsOpcao("narracao", [["voz", "🔊 Voz e texto"], ["texto", "📝 Só texto"]], cfg.narracao)),
      montar: (main, render) => F.ligarChips(main, cfg, render, { assassinos: "number", discussao: "number", detetive: "boolean", medico: "boolean", revelar: "boolean" }),
      aoComecar: (jogs) => {
        const nAss = cfg.assassinos || autoAss(jogs.length);
        const especiais = nAss + (cfg.detetive ? 1 : 0) + (cfg.medico ? 1 : 0);
        if (nAss * 2 >= jogs.length) { F.toast(`Com ${jogs.length} jogadores, ${nAss} assassinos é demais.`, true); return; }
        if (especiais > jogs.length) { F.toast("Há mais papéis especiais do que jogadores.", true); return; }
        F.guardarConfig("cidade-dorme", cfg);
        partida(cfg, jogs);
      },
    });
  }

  function partida(cfg, jogs) {
    css();
    F.telaAcesa(true);
    const voz = cfg.narracao === "voz";
    const P = { inicio: F.agoraISO(), papel: {}, vivo: {}, noite: 0, ultimoProtegido: null, historia: [], fase: null };
    jogs.forEach((j) => { P.vivo[j.id] = true; });

    function distribuirPapeis() {
      const nAss = cfg.assassinos || autoAss(jogs.length);
      const papeis = [];
      for (let i = 0; i < nAss; i++) papeis.push("assassino");
      if (cfg.detetive) papeis.push("detetive");
      if (cfg.medico) papeis.push("medico");
      while (papeis.length < jogs.length) papeis.push("cidadao");
      F.embaralhar(papeis).forEach((p, i) => { P.papel[jogs[i].id] = p; });
    }
    const vivos = () => jogs.filter((j) => P.vivo[j.id]);
    const com = (papel) => jogs.filter((j) => P.papel[j.id] === papel);
    const assVivos = () => vivos().filter((j) => P.papel[j.id] === "assassino");
    const papelTxt = (id) => { const p = PAPEIS[P.papel[id]]; return p.icone + " " + p.nome; };

    function segredo(j) {
      const p = PAPEIS[P.papel[j.id]];
      let extra;
      if (P.papel[j.id] === "assassino") {
        const parc = com("assassino").filter((x) => x.id !== j.id).map((x) => x.nome);
        extra = parc.length ? "Parceiros: " + parc.join(", ") : "Não há outros assassinos.";
      } else extra = "Você é da cidade.";
      return { topo: "Seu papel:", grande: p.icone + " " + p.nome.toUpperCase(), baixo: p.desc, extra };
    }
    function verDeNovo(voltar) {
      F.escolherJogador(jogs, "Quem quer ver o papel de novo?").then((j) => {
        if (!j) { voltar(); return; }
        F.privacidade({ jogador: j, modo: "segurar", segredo, titulo: "Cidade Dorme", aoConcluir: voltar });
      });
    }

    function tela(html, o) {
      o = o || {};
      const main = F.mostrar(html, { titulo: o.titulo || "Cidade Dorme", emPartida: true, escura: true, classe: o.noite ? "cd-noite" : "",
        extraTopo: '<button class="icon-btn" id="cdPausa">⏸</button>' });
      document.body.classList.toggle("noite-escura", true);
      const pb = F.$("#cdPausa");
      if (pb) F.segurarPara(pb, 2000, pausar);
      F.aoPausar = pausar;
      return main;
    }
    function pausar() {
      F.pararAmbiente();
      try { speechSynthesis.cancel(); } catch (e) {}
      F.limparTimersFase && F.limparTimersFase();
      const retomar = P.fase;
      const main = F.mostrar(`<div class="card" style="align-items:center;text-align:center">
          <h2 class="enorme">⏸ Pausado</h2><p class="lede">A partida continua de onde parou (a etapa atual recomeça).</p>
          <div class="linha" style="justify-content:center"><button class="btn fantasma" id="retirar">🚪 Retirar jogador</button><button class="btn fantasma" id="recomecar">🔄 Recomeçar com novos papéis</button>
          <button class="btn sec" id="ver">👀 Ver meu papel</button></div>
          <button class="btn grande" id="cont">Continuar ▶</button></div>`, { titulo: "Cidade Dorme", emPartida: true, escura: true });
      F.aoPausar = null;
      F.$("#cont", main).onclick = () => retomar();
      F.$("#ver", main).onclick = () => verDeNovo(pausar);
      F.$("#recomecar", main).onclick = async () => {
        if (!(await F.confirmar("Recomeçar a partida?", "Todos recebem papéis novos e a história é apagada.", { sim: "Recomeçar", perigo: true }))) return;
        F.limparSessao();
        partida(cfg, jogs);
      };
      F.$("#retirar", main).onclick = async () => {
        const j = await F.escolherJogador(vivos(), "Quem precisa ir embora?");
        if (!j) return;
        P.vivo[j.id] = false;
        P.historia.push({ tipo: "saiu", texto: `${j.nome} saiu da partida (${papelTxt(j.id)})` });
        F.toast(cfg.revelar ? `${j.nome} saiu. Era ${papelTxt(j.id)}.` : `${j.nome} saiu da partida.`);
        if (checarVitoria()) return;
        pausar();
      };
    }

    // ---------- fases ----------
    function distribuicao() {
      F.distribuir({
        jogadores: jogs, modo: "segurar", titulo: "Cidade Dorme · papéis", segredo, escura: true,
        aoTerminar: preparacao,
      });
    }
    function preparacao() {
      P.fase = preparacao;
      const main = tela(`<div class="card" style="align-items:center;text-align:center; background:#0B1118; border-color:#16212B; color:#AFC0CC">
          <div style="font-size:3rem">🌙</div>
          <h2 class="enorme">Coloquem o tablet no centro, onde todos alcancem, e fechem os olhos.</h2>
          <p class="lede" style="color:#7C8E9C">Aumentem o volume: o app vai narrar a noite. Quem for chamado abre os olhos, toca no nome e confirma.</p>
          <div class="linha"><button class="btn sec" id="ver">👀 Ver meu papel de novo</button><button class="btn grande" id="noite">Começar a noite 🌙</button></div></div>`);
      F.$("#ver", main).onclick = () => verDeNovo(preparacao);
      F.$("#noite", main).onclick = () => noite();
    }

    // Pausar troca o token: qualquer fluxo assíncrono da fase antiga fica parado para sempre.
    let timersFase = [], token = 0;
    const nunca = new Promise(() => {});
    const tf = (fn, ms) => { const id = F.timeout(fn, ms); timersFase.push(id); return id; };
    F.limparTimersFase = () => { token += 1; timersFase.forEach((id) => F.cancelar(id)); timersFase = []; };
    const esperar = (ms) => { const t = token; return new Promise((r) => tf(r, ms)).then(() => (t === token ? undefined : nunca)); };
    const aleat = (a, b) => a + F.randInt(b - a + 1);
    const falar = (txt) => { const t = token; return F.falar(txt, voz).then(() => (t === token ? undefined : nunca)); };

    async function narrar(txt, main) {
      const alvo = main && F.$("#narr", main);
      if (alvo) alvo.textContent = txt;
      await falar(txt);
    }

    async function noite() {
      P.noite += 1;
      const n = P.noite;
      const registro = { noite: n, ataque: null, protegido: null, investigado: null, resultado: null, morreu: null };
      P.noiteAtual = registro;
      const protegidoAntes = P.ultimoProtegido;
      P.fase = () => { P.noite -= 1; P.ultimoProtegido = protegidoAntes; noite(); }; // se pausar, a noite recomeça do início
      F.limparTimersFase();
      const main = tela(`<div class="coluna" style="align-items:center; justify-content:center; flex:1; gap:26px; min-height:70vh">
          <div class="cd-texto" id="narr"></div><div id="acao" style="width:100%"></div></div>`, { noite: true, titulo: `Noite ${n}` });
      F.iniciarAmbiente();
      await narrar("A cidade dorme. Todos fechem os olhos.", main);
      await esperar(2500);

      const etapas = [{ papel: "assassino", acordar: "Assassinos, acordem e escolham uma vítima.", dormir: "Assassinos, voltem a dormir." }];
      if (cfg.medico) etapas.push({ papel: "medico", acordar: "Médico, acorde. Quem você quer proteger?", dormir: "Médico, volte a dormir." });
      if (cfg.detetive) etapas.push({ papel: "detetive", acordar: "Detetive, acorde. Quem você quer investigar?", dormir: "Detetive, volte a dormir." });
      for (const e of etapas) {
        if (P.noiteAtual !== registro) return; // pausou e recomeçou
        await etapaNoite(e, registro, main);
        await esperar(1500);
      }
      if (P.noiteAtual !== registro) return;
      F.pararAmbiente();
      amanhecer(registro);
    }

    // Uma etapa da noite. Dura no mínimo 8 s e termina 1–3 s depois da confirmação;
    // papel morto é chamado do mesmo jeito e espera 8–15 s. Nada revela pela duração ou pelo som.
    async function etapaNoite(e, reg, main) {
      await narrar(e.acordar, main);
      const inicio = performance.now();
      const agentes = vivos().filter((j) => P.papel[j.id] === e.papel);
      const acao = F.$("#acao", main);
      const opcoes = vivos().filter((j) => {
        if (e.papel === "assassino") return P.papel[j.id] !== "assassino";
        if (e.papel === "detetive") return !agentes.some((a) => a.id === j.id);
        return true;
      });
      const escolha = await new Promise((resolve) => {
        let sel = null;
        const render = () => {
          acao.innerHTML = `<div class="cd-lista">${opcoes.map((j) => {
              const bloqueado = e.papel === "medico" && j.id === P.ultimoProtegido;
              return `<button class="cd-nome ${sel === j.id ? "sel" : ""}" data-id="${j.id}" ${bloqueado ? "disabled" : ""}>${F.esc(j.nome)}</button>`;
            }).join("")}</div>
            ${sel ? `<div class="cd-confirma"><span class="cd-texto" style="font-size:1.6rem; width:100%">Confirmar: ${F.esc(F.nome(sel).toUpperCase())}?</span>
              <button class="cd-btn" id="nao">Voltar</button><button class="cd-btn" id="sim">Confirmar</button></div>` : ""}`;
          F.$$("[data-id]", acao).forEach((b) => b.onclick = () => { if (!agentes.length) return; sel = b.dataset.id; render(); });
          const s = F.$("#sim", acao), nn = F.$("#nao", acao);
          if (nn) nn.onclick = () => { sel = null; render(); };
          if (s) s.onclick = () => { acao.innerHTML = ""; resolve(sel); };
        };
        render();
        if (!agentes.length) tf(() => { acao.innerHTML = ""; resolve(null); }, aleat(8000, 15000));
        else if (agentes.every((a) => a.bot)) {
          // Só bots acordados: escolhem sozinhos, com um tempo parecido com o de uma pessoa.
          const validas = opcoes.filter((j) => !(e.papel === "medico" && j.id === P.ultimoProtegido));
          tf(() => { if (!validas.length) { acao.innerHTML = ""; resolve(null); return; } sel = F.sortear(validas).id; render(); }, aleat(2500, 5000));
          tf(() => { if (sel) { acao.innerHTML = ""; resolve(sel); } }, aleat(6000, 7500));
        }
      });
      if (escolha) {
        if (e.papel === "assassino") reg.ataque = escolha;
        if (e.papel === "medico") { reg.protegido = escolha; P.ultimoProtegido = escolha; }
        if (e.papel === "detetive") {
          reg.investigado = escolha;
          reg.resultado = P.papel[escolha] === "assassino";
          acao.innerHTML = `<div class="cd-texto" style="font-size:clamp(2rem,6vw,3.6rem)">${F.esc(F.nome(escolha).toUpperCase())}<br>${reg.resultado ? "É ASSASSINO" : "NÃO É ASSASSINO"}</div>`;
          await esperar(4000);
          acao.innerHTML = "";
        }
        const decorrido = performance.now() - inicio;
        await esperar(Math.max(0, 8000 - decorrido) + aleat(1000, 3000));
      } else if (e.papel === "medico") P.ultimoProtegido = null;
      await narrar(e.dormir, main);
    }

    async function amanhecer(reg) {
      P.fase = () => amanhecer(reg);
      if (!reg.apurado) {
        reg.apurado = true;
        reg.morreu = reg.ataque && reg.ataque !== reg.protegido && P.vivo[reg.ataque] ? reg.ataque : null;
      }
      const morto = reg.morreu;
      if (!P.historia.includes(reg)) P.historia.push(reg);
      const main = tela(`<div class="card" style="align-items:center;text-align:center">
          <div style="font-size:3rem">☀️</div><div class="enorme" id="narr"></div><div id="anuncio" class="coluna" style="align-items:center"></div></div>`, { titulo: `Dia ${reg.noite}` });
      await narrar("A cidade acorda.", main);
      const an = F.$("#anuncio", main);
      if (!an) return;
      if (morto) {
        P.vivo[morto] = false;
        F.som("suspense");
        await falar("Esta noite, alguém foi atacado...");
        const j = F.jog(morto);
        an.innerHTML = `<p class="medio">A vítima da noite foi</p>${F.bolaGrande(j)}<div class="gigante">${F.esc(j.nome.toUpperCase())}</div><p class="medio">que sai do jogo.</p>
          ${cfg.revelar ? `<p class="lede">Papel: <b>${papelTxt(morto)}</b></p>` : ""}`;
        await falar(`A vítima foi ${j.nome}.`);
      } else {
        an.innerHTML = `<div class="gigante">Ninguém morreu! 🙌</div>`;
        await falar("Esta noite, ninguém morreu.");
      }
      if (checarVitoria()) return;
      an.insertAdjacentHTML("beforeend", '<button class="btn grande" id="disc">Discussão ▶</button>');
      F.$("#disc", main).onclick = () => discussao(reg);
    }

    function discussao(reg) {
      P.fase = () => discussao(reg);
      const cron = cfg.discussao ? F.cronometro({ segundos: cfg.discussao, tam: 200, somFim: "apito" }) : null;
      const main = tela(`<div class="card" style="align-items:center;text-align:center">
          <span class="rotulo">Dia ${reg.noite} · ${vivos().length} vivos</span><h2 class="enorme">Discussão</h2>
          <p class="lede">Quem são os assassinos? Os mortos ficam em silêncio.</p><div id="cr"></div>
          <div class="chips" style="justify-content:center">${jogs.map((j) => F.pill(j).replace('class="pill', `class="pill${P.vivo[j.id] ? "" : " inativo"}`)).join("")}</div>
          <button class="btn grande" id="votar">Ir para a votação ▶</button></div>`);
      if (cron) { F.$("#cr", main).appendChild(cron.el); cron.iniciar(); }
      F.$("#votar", main).onclick = () => { cron && cron.parar(); votacao(reg, vivos().map((j) => j.id), false); };
      F.aoPausar = () => { cron && cron.pausar(); pausar(); };
    }

    function votacao(reg, candidatos, desempate) {
      P.fase = () => votacao(reg, candidatos, desempate);
      if (cfg.votacao === "secreta") return votacaoSecreta(reg, candidatos, desempate);
      const main = tela(`<div class="card">
          <span class="rotulo">${desempate ? "Nova votação — só entre os empatados" : `Votação do dia ${reg.noite}`}</span>
          <h2>Contem os votos e toquem em quem será eliminado</h2>
          <div class="chips">${candidatos.map((id) => `<button class="chip radio" data-v="${id}" style="padding:8px;font-size:1.15rem">${F.pill(F.jog(id))}</button>`).join("")}
            <button class="chip radio" data-v="" style="font-size:1.1rem">🙅 Ninguém</button></div>
          ${desempate ? "" : '<button class="btn sec" id="empate" style="align-self:flex-start">🤝 Deu empate</button>'}</div>`);
      F.$$("[data-v]", main).forEach((b) => b.onclick = async () => {
        const id = b.dataset.v;
        if (await F.confirmar(id ? `Eliminar ${F.nome(id)}?` : "Ninguém será eliminado?", "", { sim: "Confirmar" })) eliminar(reg, id || null);
      });
      const em = F.$("#empate", main);
      if (em) em.onclick = () => {
        const sel = new Set();
        F.modal(`<h2>Quem empatou?</h2><div class="chips">${candidatos.map((id) => `<button class="chip" data-e="${id}" style="padding:4px">${F.pill(F.jog(id))}</button>`).join("")}</div>
          <div class="linha fim"><button class="btn sec" data-c>Cancelar</button><button class="btn" data-ok>Defesas ▶</button></div>`, (el, m) => {
          F.$$("[data-e]", el).forEach((b) => b.onclick = () => { const id = b.dataset.e; sel.has(id) ? sel.delete(id) : sel.add(id); b.classList.toggle("ativo", sel.has(id)); });
          F.$("[data-c]", el).onclick = m.fechar;
          F.$("[data-ok]", el).onclick = () => { if (sel.size < 2) { F.toast("Escolha pelo menos 2."); return; } m.fechar(); defesas(reg, Array.from(sel)); };
        });
      };
    }
    function defesas(reg, empatados) {
      let i = 0;
      const prox = () => {
        if (i >= empatados.length) { votacao(reg, empatados, true); return; }
        const j = F.jog(empatados[i]);
        P.fase = () => defesas(reg, empatados);
        const cron = F.cronometro({ segundos: 30, tam: 200, cor: j.cor, aoTerminar: () => { i += 1; F.timeout(prox, 800); } });
        const main = tela(`<div class="card" style="align-items:center;text-align:center"><span class="rotulo">Empate — defesa ${i + 1} de ${empatados.length}</span>
            ${F.bolaGrande(j)}<div class="gigante">${F.esc(j.nome.toUpperCase())}</div><p class="medio">defenda-se!</p><div id="cr"></div><button class="btn sec" id="p">Terminou ▶</button></div>`);
        F.$("#cr", main).appendChild(cron.el);
        cron.iniciar();
        F.$("#p", main).onclick = () => { cron.parar(); i += 1; prox(); };
      };
      prox();
    }
    function votacaoSecreta(reg, candidatos, desempate) {
      const votos = { "": 0 };
      candidatos.forEach((id) => { votos[id] = 0; });
      const eleitores = vivos();
      let i = 0;
      const prox = () => {
        if (i >= eleitores.length) return apurar();
        const el = eleitores[i];
        F.privacidade({
          jogador: el, modo: "interagir", titulo: "Votação secreta", escura: true,
          montar: (area, pronto) => {
            area.innerHTML = `<div class="card"><h2>${F.esc(el.nome)}, quem deve sair?</h2><p class="lede">Seu voto é secreto.</p>
              <div class="chips">${candidatos.filter((id) => id !== el.id).map((id) => `<button class="chip radio" data-v="${id}" style="padding:8px;font-size:1.1rem">${F.pill(F.jog(id))}</button>`).join("")}
              <button class="chip radio" data-v="">🙅 Ninguém</button></div></div>`;
            F.$$("[data-v]", area).forEach((b) => b.onclick = async () => {
              const id = b.dataset.v;
              if (!(await F.confirmar(id ? `Votar em ${F.nome(id)}?` : "Votar em ninguém?", "", { sim: "Votar" }))) return;
              votos[id] += 1; pronto();
            });
          },
          bot: (pronto) => {
            // Bot assassino não vota em parceiro; os outros votam em qualquer um (ou em ninguém, às vezes).
            const ops = candidatos.filter((id) => id !== el.id && !(P.papel[el.id] === "assassino" && P.papel[id] === "assassino"));
            const v = !ops.length || F.randInt(6) === 0 ? "" : F.sortear(ops);
            votos[v] += 1; pronto();
          },
          aoConcluir: () => { i += 1; prox(); },
        });
      };
      const apurar = () => {
        P.fase = apurar;
        const max = Math.max(...Object.values(votos));
        const topo = Object.keys(votos).filter((k) => votos[k] === max);
        const main = tela(`<div class="card" style="align-items:center;text-align:center"><h2 class="enorme">Apuração</h2>
            <div class="coluna" style="width:min(480px,100%)">${Object.keys(votos).sort((a, b) => votos[b] - votos[a]).map((k) => `<div class="linha entre">${k ? F.pill(F.jog(k)) : "🙅 Ninguém"}<strong style="font-size:1.4rem">${votos[k]}</strong></div>`).join("")}</div>
            <button class="btn grande" id="seg">Continuar ▶</button></div>`);
        F.$("#seg", main).onclick = () => {
          if (topo.length === 1) eliminar(reg, topo[0] || null);
          else if (desempate || topo.includes("")) eliminar(reg, null);
          else defesas(reg, topo);
        };
      };
      prox();
    }

    function eliminar(reg, id) {
      reg.votado = id;
      P.fase = () => proximaNoite();
      if (!id) {
        const main = tela(`<div class="card" style="align-items:center;text-align:center"><h2 class="enorme">Ninguém sai hoje.</h2><button class="btn grande" id="seg">Anoitecer 🌙</button></div>`);
        F.$("#seg", main).onclick = () => proximaNoite();
        return;
      }
      P.vivo[id] = false;
      F.som("buzina");
      const j = F.jog(id);
      const main = tela(`<div class="card" style="align-items:center;text-align:center">${F.bolaGrande(j)}<div class="gigante">${F.esc(j.nome.toUpperCase())}</div>
          <p class="medio">sai do jogo por votação da cidade.</p>${cfg.revelar ? `<p class="lede">Papel: <b>${papelTxt(id)}</b></p>` : ""}
          <button class="btn grande" id="seg">Continuar ▶</button></div>`);
      F.$("#seg", main).onclick = () => { if (!checarVitoria()) proximaNoite(); };
    }
    function proximaNoite() {
      P.fase = proximaNoite;
      const main = tela(`<div class="card" style="align-items:center;text-align:center; background:#0B1118; border-color:#16212B; color:#AFC0CC"><div style="font-size:3rem">🌙</div>
          <h2 class="enorme">Tablet no centro. Fechem os olhos.</h2><button class="btn grande" id="n">Começar a noite ${P.noite + 1}</button></div>`);
      F.$("#n", main).onclick = () => noite();
    }

    function checarVitoria() {
      const a = assVivos().length, outros = vivos().length - a;
      if (a === 0) { fimDeJogo("cidade"); return true; }
      if (a >= outros) { fimDeJogo("assassinos"); return true; }
      return false;
    }

    async function fimDeJogo(lado) {
      F.pararAmbiente();
      F.limparTimersFase();
      P.fase = null;
      F.som("vitoria");
      F.falar(lado === "cidade" ? "A cidade venceu!" : "Os assassinos venceram!", voz);
      const hist = P.historia.map((h) => {
        if (h.tipo === "saiu") return `<div>🚪 ${F.esc(h.texto)}</div>`;
        const partes = [];
        partes.push(h.ataque ? `🔪 atacaram ${F.esc(F.nome(h.ataque))}` : "🔪 ninguém foi atacado");
        if (cfg.medico) partes.push(h.protegido ? `🩺 protegeu ${F.esc(F.nome(h.protegido))}` : "🩺 médico sem ação");
        if (cfg.detetive) partes.push(h.investigado ? `🔎 investigou ${F.esc(F.nome(h.investigado))} (${h.resultado ? "assassino" : "inocente"})` : "🔎 detetive sem ação");
        partes.push(h.morreu ? `💀 ${F.esc(F.nome(h.morreu))} morreu` : "🙌 ninguém morreu");
        if (h.votado !== undefined) partes.push(h.votado ? `<b>Dia:</b> 🗳️ a cidade tirou ${F.esc(F.nome(h.votado))}` : "<b>Dia:</b> 🗳️ ninguém saiu");
        return `<div><b>Noite ${h.noite}:</b> ${partes.join(" · ")}</div>`;
      }).join("");
      const main = F.mostrar(`<div class="card" style="align-items:center;text-align:center">
          <div style="font-size:3.4rem">${lado === "cidade" ? "🏘️" : "🔪"}</div>
          <h2 class="gigante">${lado === "cidade" ? "A cidade venceu!" : "Os assassinos venceram!"}</h2>
          <div class="chips" style="justify-content:center">${jogs.map((j) => `<span class="pill ${P.vivo[j.id] ? "" : "inativo"}">${F.pill(j)} ${papelTxt(j.id)}${P.vivo[j.id] ? "" : " 💀"}</span>`).join("")}</div></div>
        <div class="card"><h3>História da partida</h3><div class="cd-hist lede" style="max-width:none">${hist || "—"}</div>
          <div class="linha fim"><button class="btn grande" id="fim">Resultado 🏁</button></div></div>`, { titulo: "Cidade Dorme", emPartida: true });
      F.$("#fim", main).onclick = () => {
        const resultados = jogs.map((j) => {
          const venceu = PAPEIS[P.papel[j.id]].lado === lado;
          return { jogadorId: j.id, colocacao: venceu ? 1 : 2, pontosDeJogo: null, pontosDaNoite: venceu ? 4 + (P.vivo[j.id] ? 1 : 0) : 1 };
        });
        const destaques = [lado === "cidade" ? "A cidade venceu" : "Os assassinos venceram"];
        const ass = com("assassino");
        destaques.push("Assassinos: " + ass.map((j) => j.nome).join(", "));
        F.finalizarPartida({ jogo: "cidade-dorme", inicio: P.inicio, resultados, destaques, jogarDeNovo: () => configurar(jogs.map((j) => j.id)) });
      };
    }

    distribuirPapeis();
    distribuicao();
  }
})();
