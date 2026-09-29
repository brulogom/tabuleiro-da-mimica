// Jogos de Festa — telas gerais: início, jogadores, menu de jogos e placar da noite.
(function () {
  "use strict";
  const H = (F.hub = {});
  const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

  function quando(iso) {
    const d = new Date(iso);
    return `${DIAS[d.getDay()]}, ${d.getHours()}h${d.getMinutes() ? String(d.getMinutes()).padStart(2, "0") : ""}`;
  }
  function hora(iso) { const d = new Date(iso); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; }

  // ================= início =================
  H.inicio = () => {
    F.limparSessao();
    const n = F.noite;
    const main = F.mostrar(`
      <div class="coluna" style="align-items:center; text-align:center; gap:22px; margin-top:4vh">
        <div style="font-size:4.5rem">🎉</div>
        <h1 style="font-size:clamp(2.6rem,7vw,4.4rem)">Jogos de Festa</h1>
        <p class="lede" style="font-size:1.1rem">Um tablet, a turma toda. Escolha o jogo, some os pontos da noite e descubra quem é o campeão.</p>
        ${n ? `<div class="card" style="width:min(560px,100%)">
            <h2>Continuar a noite de ${F.esc(quando(n.criadaEm))}?</h2>
            <p class="lede">${n.jogadores.filter((j) => j.ativo).length} jogadores, ${n.partidas.length} partida${n.partidas.length === 1 ? "" : "s"}</p>
            <button class="btn grande bloco" id="continuar">▶ Continuar a noite</button>
            <button class="btn sec bloco" id="nova">Começar nova noite</button>
          </div>` : `<div class="card" style="width:min(560px,100%)">
            <h2>Nova noite de jogos</h2>
            <span class="rotulo">Público</span>
            <div class="chips" style="justify-content:center">
              <button class="chip radio ativo" data-pub="livre">👨‍👩‍👧 Família</button>
              <button class="chip radio" data-pub="adulto">🍷 Adultos</button>
            </div>
            <button class="btn grande bloco" id="comecar">Começar 🎉</button>
          </div>`}
        ${F.arquivo().length ? '<button class="btn fantasma" id="antigas">📜 Noites anteriores</button>' : ""}
      </div>`, { titulo: "", voltar: false });
    let pub = "livre";
    F.$$("[data-pub]", main).forEach((b) => b.onclick = () => { pub = b.dataset.pub; F.$$("[data-pub]", main).forEach((x) => x.classList.toggle("ativo", x === b)); });
    const c = F.$("#continuar", main);
    if (c) c.onclick = () => H.menu();
    const nv = F.$("#nova", main);
    if (nv) nv.onclick = async () => {
      if (!(await F.confirmar("Começar uma nova noite?", "A noite atual será encerrada e guardada em Noites anteriores.", { sim: "Nova noite" }))) return;
      F.encerrarNoite();
      H.inicio();
    };
    const cm = F.$("#comecar", main);
    if (cm) cm.onclick = () => { F.novaNoite(pub); H.jogadores(true); };
    const an = F.$("#antigas", main);
    if (an) an.onclick = () => H.antigas();
  };

  H.antigas = () => {
    const arq = F.arquivo();
    const main = F.mostrar(`<div class="card"><h2>Noites anteriores</h2><div class="coluna">
      ${arq.map((n, i) => {
        const t = F.calc.calcularTotais(n);
        const camp = t[0] ? n.jogadores.find((j) => j.id === t[0].id) : null;
        return `<button class="hist-item" data-i="${i}"><strong>${F.esc(new Date(n.criadaEm).toLocaleDateString("pt-BR"))}</strong>
          <span class="mudo">${n.partidas.length} partidas</span><span class="espaco"></span>${camp ? "🏆 " + F.esc(camp.nome) + " — " + t[0].total + " pts" : ""}</button>`;
      }).join("")}</div></div>`, { titulo: "Noites anteriores", voltar: false, extraTopo: '<button class="icon-btn" id="volta">← Voltar</button>' });
    F.$("#volta").onclick = () => H.inicio();
    F.$$("[data-i]", main).forEach((b) => b.onclick = () => {
      const n = arq[+b.dataset.i];
      const t = F.calc.calcularTotais(n);
      F.modal(`<h2>Noite de ${F.esc(new Date(n.criadaEm).toLocaleDateString("pt-BR"))}</h2>
        <table class="tabela-simples">${t.map((x) => { const j = n.jogadores.find((y) => y.id === x.id); return `<tr><td>${x.posicao}º</td><td>${F.esc(j ? j.nome : "?")}</td><td style="text-align:right"><strong>${x.total}</strong></td></tr>`; }).join("")}</table>
        <div class="linha fim"><button class="btn" data-f>Fechar</button></div>`, (el, m) => { F.$("[data-f]", el).onclick = m.fechar; });
    });
  };

  // ================= jogadores =================
  H.jogadores = (primeiraVez) => {
    const lista = F.todos();
    const main = F.mostrar(`
      <div class="card">
        <div><h2>👥 Jogadores</h2><p class="lede">A ordem da lista é a ordem da mesa (quem está sentado ao lado de quem). Os jogos em roda seguem essa ordem.</p></div>
        <form class="linha" id="form" autocomplete="off">
          <input class="entrada" id="nome" maxlength="12" placeholder="Nome (até 12 letras)" style="flex:1; min-width:180px">
          <button class="btn" type="submit">+ Adicionar</button>
        </form>
        <div class="lista-jog">
          ${lista.map((j, i) => `<div class="item-jog ${j.ativo ? "" : "inativo"}">
              <span class="ordem">${j.ativo ? lista.filter((x) => x.ativo).indexOf(j) + 1 : "–"}</span>
              <button class="mini-btn" data-editar="${j.id}" style="padding:0;border:none;background:none">${F.pill(j)}</button>
              <span class="nome"></span>
              ${j.chegouAgora ? '<span class="selo">chegou agora</span>' : ""}
              ${!j.ativo ? '<span class="selo" style="background:var(--surface-2);color:var(--text-muted)">foi embora</span>' : ""}
              <button class="mini-btn" data-sobe="${j.id}" ${i === 0 ? "disabled" : ""} aria-label="Subir">▲</button>
              <button class="mini-btn" data-desce="${j.id}" ${i === lista.length - 1 ? "disabled" : ""} aria-label="Descer">▼</button>
              <button class="mini-btn" data-editar="${j.id}" aria-label="Editar">✏️</button>
            </div>`).join("") || '<p class="mudo">Ninguém cadastrado ainda.</p>'}
        </div>
        <div class="linha"><span class="mudo pequeno">${lista.filter((j) => j.ativo).length} jogando</span><span class="espaco"></span>
          <button class="btn grande" id="pronto" ${lista.some((j) => j.ativo) ? "" : "disabled"}>${primeiraVez ? "Ir para os jogos ▶" : "Pronto ✓"}</button></div>
      </div>`, { titulo: "Jogadores" });
    const inp = F.$("#nome", main);
    if (primeiraVez || !lista.length) inp.focus();
    F.$("#form", main).onsubmit = (e) => {
      e.preventDefault();
      const nome = inp.value.trim();
      if (!nome) return;
      if (F.todos().some((j) => j.nome.toLowerCase() === nome.toLowerCase() && j.ativo)) { F.toast("Já existe alguém com esse nome."); return; }
      const j = F.addJogador(nome, null, F.EMOJIS[F.todos().length % F.EMOJIS.length]);
      F.som("pop");
      H.jogadores(primeiraVez);
      F.$("#nome").focus();
      void j;
    };
    const mover = (id, d) => {
      const arr = F.noite.jogadores, i = arr.findIndex((j) => j.id === id), k = i + d;
      if (k < 0 || k >= arr.length) return;
      [arr[i], arr[k]] = [arr[k], arr[i]];
      F.salvar();
      H.jogadores(primeiraVez);
    };
    F.$$("[data-sobe]", main).forEach((b) => b.onclick = () => mover(b.dataset.sobe, -1));
    F.$$("[data-desce]", main).forEach((b) => b.onclick = () => mover(b.dataset.desce, 1));
    F.$$("[data-editar]", main).forEach((b) => b.onclick = () => editar(F.jog(b.dataset.editar), () => H.jogadores(primeiraVez)));
    F.$("#pronto", main).onclick = () => H.menu();
  };

  function editar(j, depois) {
    let cor = j.cor, emoji = j.emoji;
    F.modal(`<h2>Editar jogador</h2>
      <input class="entrada" id="enome" maxlength="12" value="${F.esc(j.nome)}">
      <div class="campo"><span class="rotulo">Cor</span><div class="cores">${F.CORES.map((c) => `<button class="cor-btn ${c === cor ? "ativo" : ""}" data-cor="${c}" style="background:${c}" aria-label="cor"></button>`).join("")}</div></div>
      <div class="campo"><span class="rotulo">Emoji</span><div class="emojis"><button class="emoji-btn ${!emoji ? "ativo" : ""}" data-emo="">∅</button>${F.EMOJIS.map((e) => `<button class="emoji-btn ${e === emoji ? "ativo" : ""}" data-emo="${e}">${e}</button>`).join("")}</div></div>
      <div class="linha">
        <button class="btn ${j.ativo ? "fantasma" : "ok"}" id="ativo">${j.ativo ? "🚪 Foi embora" : "↩️ Voltou"}</button>
        ${F.noite.partidas.some((p) => p.resultados.some((r) => r.jogadorId === j.id)) ? "" : '<button class="btn fantasma" id="excluir">🗑️ Excluir</button>'}
        <span class="espaco"></span><button class="btn sec" id="cancelar">Cancelar</button><button class="btn" id="salvar">Salvar</button>
      </div>`, (el, m) => {
      F.$$("[data-cor]", el).forEach((b) => b.onclick = () => { cor = b.dataset.cor; F.$$("[data-cor]", el).forEach((x) => x.classList.toggle("ativo", x === b)); });
      F.$$("[data-emo]", el).forEach((b) => b.onclick = () => { emoji = b.dataset.emo; F.$$("[data-emo]", el).forEach((x) => x.classList.toggle("ativo", x === b)); });
      F.$("#cancelar", el).onclick = m.fechar;
      F.$("#salvar", el).onclick = () => {
        const nome = F.$("#enome", el).value.trim().slice(0, 12);
        if (nome) j.nome = nome;
        j.cor = cor; j.emoji = emoji;
        F.salvar(); m.fechar(); depois();
      };
      F.$("#ativo", el).onclick = () => { j.ativo = !j.ativo; F.salvar(); m.fechar(); depois(); };
      const ex = F.$("#excluir", el);
      if (ex) ex.onclick = async () => {
        m.fechar();
        if (await F.confirmar(`Excluir ${j.nome}?`, "", { sim: "Excluir", perigo: true })) {
          F.noite.jogadores = F.noite.jogadores.filter((x) => x.id !== j.id);
          F.noite.ajustes = F.noite.ajustes.filter((a) => a.jogadorId !== j.id);
          F.salvar();
        }
        depois();
      };
    });
  }

  // ================= menu de jogos =================
  H.menu = () => {
    try { sessionStorage.setItem("festa:sessao", "1"); } catch (e) {}
    F.limparSessao();
    F.telaAcesa(false);
    if (!F.noite) { H.inicio(); return; }
    const ativos = F.ativos().length;
    const t = F.totais();
    const lider = t[0] && t[0].total > 0 ? F.jog(t[0].id) : null;
    const main = F.mostrar(`
      <div class="linha entre">
        <div><h1 style="font-size:clamp(1.8rem,4vw,2.6rem)">Qual jogo agora?</h1>
          <p class="mudo" style="font-weight:700">${ativos} jogadores · ${F.noite.partidas.length} partidas${lider ? ` · 👑 ${F.esc(lider.nome)} lidera com ${t[0].total}` : ""}</p></div>
        <div class="recursos">
          <button class="btn sec" id="jog">👥 Jogadores</button>
          <button class="btn sec" id="dedos">☝️ Sorteador</button>
          <button class="btn" id="placar">🏆 Placar</button>
        </div>
      </div>
      <div class="jogos">
        ${F.jogos.map((g) => `<button class="jogo-card" data-jogo="${g.id}" style="--cor:${g.cor}">
            <span class="ic">${g.icone}</span><h3>${F.esc(g.nome)}</h3><p>${F.esc(g.resumo)}</p>
            <span class="meta"><span>👥 ${F.esc(g.jogadores)}</span><span>⏱ ${F.esc(g.duracao)}</span>${g.externo ? "<span>abre à parte</span>" : ""}</span>
          </button>`).join("")}
      </div>
      <div class="linha" style="justify-content:center"><button class="btn fantasma" id="sair">🌙 Encerrar a noite</button></div>`,
      { titulo: "Jogos de Festa", voltar: false, extraTopo: `<span class="mudo pequeno">${F.noite.publico === "adulto" ? "🍷 Adultos" : "👨‍👩‍👧 Família"}</span>` });
    F.$$("[data-jogo]", main).forEach((b) => b.onclick = () => {
      const g = F.jogos.find((x) => x.id === b.dataset.jogo);
      F.limparSessao();
      g.abrir();
    });
    F.$("#jog", main).onclick = () => H.jogadores(false);
    F.$("#dedos", main).onclick = () => F.sorteador.abrir({});
    F.$("#placar", main).onclick = () => H.placar();
    F.$("#sair", main).onclick = () => H.encerrar();
  };

  // ================= placar da noite =================
  H.placar = () => {
    const n = F.noite;
    const t = F.totais();
    const ultima = n.partidas[n.partidas.length - 1];
    const antes = n.partidas.length >= 2 ? F.calc.calcularTotais(n, ultima.id) : null;
    const main = F.mostrar(`
      <div class="linha entre"><h1 style="font-size:clamp(1.8rem,4vw,2.6rem)">🏆 Placar da noite</h1>
        <div class="recursos"><button class="btn sec" id="hist">📜 Histórico</button><button class="btn sec" id="ajuste">± Ajuste</button><button class="btn sec" id="copiar">📋 Copiar resumo</button></div></div>
      <div class="placar" id="placar">
        ${t.map((x) => {
          const j = F.jog(x.id);
          let seta = "";
          if (antes) {
            const p0 = antes.find((y) => y.id === x.id).posicao;
            if (p0 > x.posicao) seta = `<span class="seta-sobe" title="subiu">▲${p0 - x.posicao}</span>`;
            else if (p0 < x.posicao) seta = `<span class="seta-desce" title="desceu">▼${x.posicao - p0}</span>`;
          }
          const lider = x.posicao === 1 && x.total > 0;
          return `<div class="placar-linha ${lider ? "lider" : ""} ${j.ativo ? "" : "inativo"}" data-id="${x.id}">
            <span class="pos">${lider ? "👑" : x.posicao + "º"}</span>
            <span class="bola" style="width:40px;height:40px;border-radius:50%;background:${j.cor};color:${F.contraste(j.cor)};display:flex;align-items:center;justify-content:center;font-size:1.3rem">${F.esc(j.emoji || j.nome[0])}</span>
            <span class="nome">${F.esc(j.nome)} ${seta} ${j.chegouAgora ? '<span class="selo">chegou agora</span>' : ""}</span>
            <span class="sub">${x.primeiros} vitória${x.primeiros === 1 ? "" : "s"}<br>${x.partidas} partida${x.partidas === 1 ? "" : "s"}</span>
            <span class="tot">${x.total}</span></div>`;
        }).join("")}
      </div>
      <div class="linha"><button class="btn fantasma" id="sair">🌙 Encerrar a noite</button><span class="espaco"></span><button class="btn grande" id="menu">🎮 Voltar aos jogos</button></div>`,
      { titulo: "Placar" });
    // Animação de reordenação: parte da posição anterior e desliza até a nova.
    if (antes) {
      const linhas = F.$$(".placar-linha", main);
      const alt = linhas[0] ? linhas[0].offsetHeight + 8 : 0;
      linhas.forEach((el) => {
        const id = el.dataset.id;
        const iNovo = t.findIndex((x) => x.id === id), iVelho = antes.findIndex((x) => x.id === id);
        if (iNovo !== iVelho) { el.style.transition = "none"; el.style.transform = `translateY(${(iVelho - iNovo) * alt}px)`; }
      });
      requestAnimationFrame(() => requestAnimationFrame(() => linhas.forEach((el) => { el.style.transition = ""; el.style.transform = ""; })));
    }
    F.$("#menu", main).onclick = () => H.menu();
    F.$("#hist", main).onclick = () => H.historico();
    F.$("#ajuste", main).onclick = () => ajuste();
    F.$("#copiar", main).onclick = () => copiarResumo();
    F.$("#sair", main).onclick = () => H.encerrar();
  };

  function resumoTexto() {
    const n = F.noite, t = F.totais();
    const d = new Date(n.criadaEm);
    const cont = {};
    n.partidas.forEach((p) => { cont[p.jogo] = (cont[p.jogo] || 0) + 1; });
    return [`🏆 Noite de jogos — ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`]
      .concat(t.filter((x) => x.partidas > 0 || x.total !== 0).map((x, i) => `${x.posicao}º ${F.nome(x.id)} — ${x.total} pts${i === 0 && x.total > 0 ? " 👑" : ""}`))
      .concat(["Partidas: " + (Object.keys(cont).map((k) => `${F.nomeJogo(k)} (${cont[k]})`).join(", ") || "nenhuma")])
      .join("\n");
  }
  async function copiarResumo() {
    const txt = resumoTexto();
    try { await navigator.clipboard.writeText(txt); F.toast("Resumo copiado! Cole na conversa do grupo."); }
    catch (e) {
      F.modal(`<h2>Resumo</h2><textarea class="entrada" rows="8" style="font-size:.95rem">${F.esc(txt)}</textarea><div class="linha fim"><button class="btn" data-f>Fechar</button></div>`,
        (el, m) => { F.$("textarea", el).select(); F.$("[data-f]", el).onclick = m.fechar; });
    }
  }

  function ajuste() {
    let jid = null, pts = 1;
    F.modal(`<h2>± Ajuste manual</h2>
      <div class="campo"><span class="rotulo">Jogador</span><div class="chips">${F.todos().map((j) => `<button class="chip radio" data-j="${j.id}" style="padding:4px">${F.pill(j)}</button>`).join("")}</div></div>
      <div class="campo"><span class="rotulo">Pontos</span><div class="linha"><button class="mini-btn" id="menos">−</button><strong id="pts" style="font-size:1.6rem;min-width:50px;text-align:center">+1</strong><button class="mini-btn" id="mais">+</button></div></div>
      <div class="campo"><span class="rotulo">Motivo (obrigatório)</span><input class="entrada" id="motivo" maxlength="60" placeholder="ex.: prenda cumprida"></div>
      <div class="linha fim"><button class="btn sec" id="c">Cancelar</button><button class="btn" id="ok">Salvar ajuste</button></div>`, (el, m) => {
      F.$$("[data-j]", el).forEach((b) => b.onclick = () => { jid = b.dataset.j; F.$$("[data-j]", el).forEach((x) => x.classList.toggle("ativo", x === b)); });
      const mostra = () => { F.$("#pts", el).textContent = (pts > 0 ? "+" : "") + pts; };
      F.$("#menos", el).onclick = () => { pts -= 1; if (pts === 0) pts = -1; mostra(); };
      F.$("#mais", el).onclick = () => { pts += 1; if (pts === 0) pts = 1; mostra(); };
      F.$("#c", el).onclick = m.fechar;
      F.$("#ok", el).onclick = () => {
        const motivo = F.$("#motivo", el).value.trim();
        if (!jid) { F.toast("Escolha o jogador."); return; }
        if (!motivo) { F.toast("Escreva o motivo do ajuste."); F.$("#motivo", el).focus(); return; }
        F.noite.ajustes.push({ id: F.uid("a"), jogadorId: jid, pontos: pts, motivo, criadoEm: F.agoraISO() });
        F.salvar(); m.fechar(); H.placar();
      };
    });
  }

  // ================= histórico =================
  H.historico = () => {
    const n = F.noite;
    const eventos = n.partidas.map((p) => ({ tipo: "p", quando: p.fim, p })).concat(n.ajustes.map((a) => ({ tipo: "a", quando: a.criadoEm, a })))
      .sort((x, y) => (x.quando < y.quando ? 1 : -1));
    const main = F.mostrar(`<div class="card"><div class="linha entre"><h2>📜 Histórico da noite</h2>
        ${n.partidas.length ? '<button class="btn sec" id="desfazer">↩️ Desfazer última partida</button>' : ""}</div>
      <div class="coluna">${eventos.map((e) => {
        if (e.tipo === "a") return `<div class="hist-item"><span>±</span><strong>${F.esc(F.nome(e.a.jogadorId))}</strong><span>${e.a.pontos > 0 ? "+" : ""}${e.a.pontos}</span><span class="mudo">${F.esc(e.a.motivo)}</span><span class="espaco"></span><span class="mudo">${hora(e.quando)}</span><button class="mini-btn" data-apaga-aj="${e.a.id}">🗑️</button></div>`;
        const venc = e.p.resultados.filter((r) => r.colocacao === 1).map((r) => F.nome(r.jogadorId)).join(", ");
        return `<button class="hist-item" data-p="${e.p.id}"><strong>${F.esc(F.nomeJogo(e.p.jogo))}</strong><span class="mudo">${hora(e.p.inicio || e.quando)}</span><span class="espaco"></span><span>🥇 ${F.esc(venc)}</span></button>`;
      }).join("") || '<p class="mudo">Nenhuma partida ainda.</p>'}</div></div>`, { titulo: "Histórico", extraTopo: '<button class="icon-btn" id="vplacar">🏆</button>' });
    F.$("#vplacar").onclick = () => H.placar();
    const d = F.$("#desfazer", main);
    if (d) d.onclick = async () => {
      const u = n.partidas[n.partidas.length - 1];
      if (await F.confirmar("Desfazer a última partida?", `${F.nomeJogo(u.jogo)} das ${hora(u.inicio || u.fim)} sai do placar.`, { sim: "Desfazer", perigo: true })) {
        n.partidas.pop(); F.salvar(); H.historico();
      }
    };
    F.$$("[data-p]", main).forEach((b) => b.onclick = () => detalhe(n.partidas.find((p) => p.id === b.dataset.p)));
    F.$$("[data-apaga-aj]", main).forEach((b) => b.onclick = async () => {
      if (await F.confirmar("Excluir este ajuste?", "", { sim: "Excluir", perigo: true })) { n.ajustes = n.ajustes.filter((a) => a.id !== b.dataset.apagaAj); F.salvar(); H.historico(); }
    });
  };
  function detalhe(p) {
    F.modal(`<h2>${F.esc(F.nomeJogo(p.jogo))}</h2><p class="mudo">${hora(p.inicio || p.fim)} – ${hora(p.fim)}</p>
      <table class="tabela-simples"><tr><th>Col.</th><th>Jogador</th><th>Jogo</th><th>Noite</th></tr>
      ${p.resultados.slice().sort((a, b) => a.colocacao - b.colocacao).map((r) => `<tr><td>${r.colocacao}º</td><td>${F.esc(F.nome(r.jogadorId))}</td><td>${r.pontosDeJogo == null ? "–" : r.pontosDeJogo}</td><td><strong>+${r.pontosDaNoite}</strong></td></tr>`).join("")}</table>
      ${(p.destaques || []).map((d) => `<p>⭐ ${F.esc(d)}</p>`).join("")}
      <div class="linha"><button class="btn perigo" id="exc">🗑️ Excluir partida</button><span class="espaco"></span><button class="btn" data-f>Fechar</button></div>`, (el, m) => {
      F.$("[data-f]", el).onclick = m.fechar;
      F.$("#exc", el).onclick = async () => {
        m.fechar();
        if (await F.confirmar("Excluir esta partida?", "Os pontos dela saem do placar.", { sim: "Excluir", perigo: true })) {
          F.noite.partidas = F.noite.partidas.filter((x) => x.id !== p.id); F.salvar();
        }
        H.historico();
      };
    });
  }

  // ================= encerrar noite =================
  H.encerrar = async () => {
    if (!(await F.confirmar("Encerrar a noite?", "Vamos ver o pódio! A noite fica guardada em Noites anteriores.", { sim: "Encerrar e ver o pódio" }))) return;
    const n = F.noite;
    const t = F.totais();
    const txt = resumoTexto();
    const top = t.filter((x) => x.total > 0).slice(0, 3);
    const destaques = [];
    const porJogo = {};
    n.partidas.forEach((p) => p.resultados.forEach((r) => {
      porJogo[p.jogo] = porJogo[p.jogo] || {};
      porJogo[p.jogo][r.jogadorId] = (porJogo[p.jogo][r.jogadorId] || 0) + r.pontosDaNoite;
    }));
    Object.keys(porJogo).forEach((g) => {
      const melhor = Object.entries(porJogo[g]).sort((a, b) => b[1] - a[1])[0];
      destaques.push(`Melhor em ${F.nomeJogo(g)}: ${F.nome(melhor[0])} (${melhor[1]} pts)`);
    });
    const vit = t.slice().sort((a, b) => b.primeiros - a.primeiros)[0];
    if (vit && vit.primeiros) destaques.push(`Mais vitórias: ${F.nome(vit.id)} (${vit.primeiros})`);
    const part = t.slice().sort((a, b) => b.partidas - a.partidas)[0];
    if (part && part.partidas) destaques.push(`Mais partidas jogadas: ${F.nome(part.id)} (${part.partidas})`);
    const jogs = n.jogadores.slice();
    F.encerrarNoite();
    F.som("vitoria");
    F.confete();
    setTimeout(F.confete, 1800);
    const j = (id) => jogs.find((x) => x.id === id);
    const deg = (x, cls) => x ? `<div class="degrau ${cls}"><div class="bola-grande" style="background:${j(x.id).cor};color:${F.contraste(j(x.id).cor)}">${F.esc(j(x.id).emoji || j(x.id).nome[0])}</div>
      <div class="nome">${F.esc(j(x.id).nome)}<br><span class="mudo">${x.total} pts</span></div><div class="bloco">${x.posicao}º</div></div>` : "";
    const main = F.mostrar(`<div class="card" style="text-align:center">
        <h1 style="font-size:clamp(2rem,5vw,3rem)">🏆 Campeão da noite</h1>
        ${top[0] ? `<div class="gigante">${F.esc(j(top[0].id).nome)}</div>` : '<p class="lede">Nenhum ponto registrado nesta noite.</p>'}
        <div class="podio">${deg(top[1], "p2")}${deg(top[0], "p1")}${deg(top[2], "p3")}</div>
        <div class="coluna" style="align-items:center">${destaques.map((d) => `<div>⭐ ${F.esc(d)}</div>`).join("")}</div>
        <div class="linha" style="justify-content:center"><button class="btn sec" id="copiar">📋 Copiar resumo</button><button class="btn grande" id="fim">Fim 🎉</button></div>
      </div>`, { titulo: "Fim da noite", voltar: false });
    F.$("#copiar", main).onclick = async () => {
      try { await navigator.clipboard.writeText(txt); F.toast("Resumo copiado!"); } catch (e) { F.modal(`<textarea class="entrada" rows="8">${F.esc(txt)}</textarea><div class="linha fim"><button class="btn" data-f>Fechar</button></div>`, (el, m) => { F.$("[data-f]", el).onclick = m.fechar; }); }
    };
    F.$("#fim", main).onclick = () => H.inicio();
  };
})();
