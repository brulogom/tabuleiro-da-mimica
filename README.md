# Tabuleiro da Mímica

Jogo de mímica em tabuleiro, feito como um único arquivo HTML (`mimica.html`), pensado pra abrir direto no navegador de um tablet — sem instalar nada.

- **App publicado (sempre a versão mais atual):** https://claude.ai/code/artifact/c140dd17-628d-4f85-9428-f2a2d3ab12e3
- **App instalável (celular/tablet) — link pros amigos:** https://brulogom.github.io/tabuleiro-da-mimica/ (repositório: https://github.com/brulogom/tabuleiro-da-mimica — ver seção 8)
- **Arquivo fonte local:** `mimica.html` (nesta mesma pasta) — é uma cópia de segurança da última versão publicada.

> Para continuar editando numa próxima conversa com o Claude, basta abrir esta pasta e dizer o que quer mudar. Cole a URL do artifact acima se o Claude precisar reidentificar o link publicado.

---

## 1. Como jogar

### Configuração da partida
Na tela inicial você escolhe:
- **Número de equipes** (2 a 6) e o **nome** de cada uma.
- **Cor de cada equipe** — só cores primárias, branco, preto, rosa e roxo; uma cor usada por uma equipe fica bloqueada pras outras (evita duas equipes com cor parecida).
- **Tempo por rodada** (30/45/60/90s).
- **Número de etapas** (15/20/30/40/50 casas) — o tabuleiro é gerado do zero nesse tamanho a cada partida.
- **Categorias da partida** — marque/desmarque quais das 10 categorias (+ "Aleatória") entram no sorteio das casas. Pelo menos uma precisa ficar marcada.
- **Filtro de idioma/origem** (mutuamente exclusivos): "Sem filtros", "🌐 Sem inglês" (tira músicas/títulos só em inglês) ou "🇧🇷 Versão brasileira" (deixa só conteúdo brasileiro em Lugar, Pessoas Famosas, Filmes/Séries/Novelas e Música).

### Durante o jogo
- Cada casa (exceto largada/chegada) tem uma categoria sorteada; as casas especiais aparecem como **❓** (mistério).
- **Casa inicial e casas misteriosas**: antes de mimicar, a equipe é obrigada a escolher a categoria da palavra (pode escolher "Aleatória" — nesse caso, acertando, anda **2 casas** em vez de 1).
- A tela do **tabuleiro** (cheia, sem painel lateral) mostra a casa atual, o pino andando, e o botão "Próxima mímica" ou "Escolher categoria".
- Ao tocar em "Próxima mímica" (ou escolher a categoria), vai pra tela da **mímica**: palavra grande, cronômetro, e os botões "✅ Acertou" / "⏭️ Pular".
  - Se a palavra tiver uma dica cadastrada (**ⓘ Dica**), aparece um botão pra revelar uma explicação curta — só quem está mimicando vê.
  - Músicas mostram o nome da música em destaque e o artista pequeno embaixo.
- **Acerto**: o pino anda (1 casa, ou mais se for bônus de casa especial/Aleatória escolhida) e some do jogador visto o "ding" e vibração.
- **Erro/tempo esgotado**: o pino não anda; toca um tique nos últimos 5s e um alarme de 3 beeps quando o tempo acaba.
- **Casas misteriosas**: escondem uma entre 5 sortes/reveses (sorteados de novo a cada tentativa que falha):
  - ⏩ Avance 2 casas (boa)
  - ⏪ Volte 1 casa (ruim)
  - ⏭️ Perca a próxima vez (ruim)
  - 😐 Nada acontece (neutra, segue como casa comum)
  - *("Escolha a categoria" foi removida como sorte/revés — agora é padrão em toda casa misteriosa.)*
- Ao vencer, aparece um **relatório final por equipe**: total de acertos/erros e qual categoria cada equipe mais acertou/errou.
- **🏠 Menu principal**: sai da partida com confirmação (aparece no cabeçalho e em cada tela do jogo).

### Gerenciar palavras
Botão **"📋 Gerenciar palavras"** no cabeçalho (disponível fora de rodadas ativas):
- Escolha uma categoria pra ver/adicionar/remover palavras.
- Os mesmos 3 filtros de idioma/origem existem aqui — ativando um, as palavras que ficariam de fora aparecem esmaecidas, e os botões de categoria mostram "quantas restam / total".
- Mudanças são salvas no **banco de dados do próprio artifact** (ver seção 4) — valem pra todo mundo que abrir o link.

---

## 2. Estrutura do arquivo `mimica.html`

Tudo está num único arquivo: `<style>` no topo, HTML minúsculo no meio, e todo o app dentro de um único `<script>` (uma IIFE `(function(){ ... })()`).

Principais blocos de código, em ordem aproximada de aparição:

| Bloco | O que é |
|---|---|
| `CATS` | As 11 categorias (10 reais + "aleatoria"): ícone, nome, cor. |
| `DEFAULT_WORDS` | As listas de palavras de cada categoria (a lista "de fábrica"). |
| `wordBank` | Cópia **editável** de `DEFAULT_WORDS`, sincronizada com o banco de dados do artifact. É essa variável que a tela "Gerenciar palavras" lê/escreve. |
| `HINTS` | Dicas opcionais por palavra (`HINTS[categoria][palavra] = "texto"`). Ver seção 3. |
| `NON_BRAZILIAN` / `ENGLISH_ONLY` | Listas de exclusão usadas pelos filtros "Versão brasileira" / "Sem inglês" (só existem pra `lugar`, `famosos`, `filmes`, `musica`). |
| `wordsForMatch(cat, noEnglish, brazilOnly)` | Aplica os filtros de idioma/origem a uma lista de palavras. |
| `SPECIAL_TYPES` | Os 4 tipos de sorte/revés das casas misteriosas. |
| `generateBoardTemplate(steps)` | Monta o layout do tabuleiro (largada, casas comuns, especiais, chegada) pro tamanho escolhido. |
| `buildEffectiveBoard(enabledCats, template)` | Sorteia qual categoria cai em cada casa comum, evitando repetir a mesma categoria em casas seguidas. |
| `newState(...)` | Cria o estado de uma partida nova (times, tabuleiro, filtros, etc.). |
| `renderSetup()` | Tela de configuração. |
| `renderPanel()` → `renderBoardScreen()` / `renderStageScreen()` | As duas telas do jogo em si (tabuleiro cheio vs. tela da mímica) — nunca aparecem juntas. |
| `scoreSuccess()` / `handleMimicFailure()` | O que acontece ao acertar/errar (mover o pino, aplicar sorte/revés, registrar estatística). |
| `renderManage()` | Tela "Gerenciar palavras". |
| `renderWin()` | Tela de vitória com o relatório final. |
| `playCorrectDing()` / `playTimeUpAlarm()` / `playCountdownTick()` / `vibrate()` | Sons (Web Audio API, sem arquivo de áudio) e vibração. |

### Como adicionar palavras a uma categoria
1. Ache o array da categoria em `DEFAULT_WORDS` (ex: `esportes: ["Futebol", ...]`).
2. Adicione a palavra nova no fim da lista, entre aspas, separada por vírgula.
3. Se quiser sincronizar com o banco de dados sem esperar alguém abrir o app (que auto-semeia na primeira visita), veja a seção 4.

### Como adicionar uma dica (`HINTS`)
```js
var HINTS = {
  frases: { "Chutar o balde": "Desistir de tudo de uma vez, sem se importar com as consequências." },
  famosos: { "Anitta": "Cantora brasileira de funk e pop, sucesso internacional." },
  lugar: { "França": "País da Europa." }
  // ... adicione uma chave por categoria; dentro dela, uma entrada por palavra
};
```
- A dica só aparece se a palavra tiver uma entrada **idêntica** (mesma grafia/acentos) no objeto `HINTS[categoria]`.
- Categoria sem dica nenhuma = botão "ⓘ Dica" simplesmente não aparece pra nenhuma palavra dela.
- Regra usada até aqui: **no máximo 1 frase curta**, com a informação mais simples que ajuda a lembrar (não pesquisa aprofundada).

---

## 3. Status do trabalho de dicas (`HINTS`) — pra continuar de onde parou

| Categoria | Palavras | Dicas prontas | Falta |
|---|---|---|---|
| Frases Populares | 44 | ✅ 44/44 | — |
| Pessoas Famosas | 107 | ✅ 107/107 | — |
| Lugar | 355 | ✅ 306/355 (países, capitais, pontos turísticos, estados e cidades do Brasil) | Os ~43 lugares genéricos (Praia, Hospital, Vulcão…) não têm dica de propósito — são autoexplicativos. |
| Filmes/Séries/Novelas | 101 | ❌ 0/101 | Pendente — próxima categoria sugerida. |
| Animal, Música, Profissões, Esportes/Ações, Expressões/Emoções, Comidas/Bebidas | 133 / 170 / 100 / 95 / 99 / 96 | ❌ nenhuma | Ainda não iniciado — decisão de fazer ou não é sua (pouca gente vai precisar de dica pra "Pizza" ou "Cavalo"). |

Pra continuar, é só pedir "adicione dicas em [categoria]" numa próxima conversa.

---

## 4. Contagem de palavras por categoria (situação atual)

| Categoria | Total |
|---|---|
| Lugar | 355 |
| Música | 170 |
| Animal | 133 |
| Pessoas Famosas | 107 |
| Filmes/Séries/Novelas | 101 |
| Profissões | 100 |
| Expressões/Emoções | 99 |
| Comidas/Bebidas | 96 |
| Esportes/Ações | 95 |
| Frases Populares | 44 |

Frases Populares é a única categoria que ficou bem menor que as outras por decisão sua ("tá ótimo assim").

---

## 5. Banco de dados do artifact (sincronização entre dispositivos)

O app usa a capacidade **`db`** dos artifacts do Claude: um documento (`categories/words`) guarda a lista de palavras de cada categoria, e todo mundo que abre o link lê/escreve nesse mesmo documento.

- **Primeira vez que alguém abre o link**: se o documento ainda não existe, o app cria (`set`) com o conteúdo de `DEFAULT_WORDS`.
- **Quando você edita `mimica.html` e pede pra publicar de novo**: isso atualiza só o *código* do app. Se você mudou uma lista de palavras no código, o banco de dados **não muda automaticamente** — ele já foi criado antes com o conteúdo antigo. É preciso um passo extra de sincronização (`write_db`) pra igualar o banco ao novo código; isso é algo que peço pro Claude fazer manualmente a cada lista de palavras alterada (ele fez isso em toda esta conversa).
- Se um dia quiser resetar tudo pro que está em `DEFAULT_WORDS` (descartando qualquer edição feita direto no app por alguém), é só apagar o documento (`categories/words`) do banco e deixar o app recriar na próxima visita.

---

## 6. Ideias registradas mas não implementadas (pra retomar se quiser)

- Dicas (`HINTS`) nas categorias que faltam (ver seção 3).
- Categorias extras sugeridas e ainda não criadas: **Chefs de cozinha**, **Vilões de novela/filme**.
- Fechar Esportes/Ações em 100 exato (está em 95).

---

## 7. Histórico rápido de decisões importantes

- A mímica é sempre da **categoria da casa onde o pino já está** (não da próxima) — decisão tomada depois de um teste que mostrou confusão nisso.
- "Perca a vez" tinha um bug em que a equipe pulava silenciosamente sem aviso — corrigido pra mostrar a tela "perdeu a vez" de verdade.
- Retirado "Escolha a categoria" das sortes/reveses das casas misteriosas, porque a mímica acontece **antes** de saber o resultado — agora toda casa misteriosa (e a inicial) sempre deixa escolher a categoria, e a sorte/revés é sobre o que acontece depois de acertar/errar.
- Cores dos times passaram de automáticas pra escolha manual (7 opções fixas) depois que a escolha automática gerou 2 tons de verde parecidos com 6 equipes.

---

## 8. Versão app (instalável no celular/tablet)

A pasta `docs/` é uma versão **PWA** do jogo: seus amigos abrem o link no navegador do celular/tablet e instalam na tela inicial, com ícone próprio, tela cheia e funcionando **offline**.

- **Gerar/atualizar o app:** depois de mudar `mimica.html`, rode `node build-app.js` — ele recria `docs/index.html`, `docs/manifest.webmanifest` e `docs/sw.js`. Depois é só pedir pro Claude fazer commit + push (ou rodar `git add -A && git commit -m "Atualiza app" && git push`); os aparelhos pegam a versão nova sozinhos na próxima vez que abrirem com internet.
- **Palavras no app:** fora do claude.ai não existe o banco de dados do artifact, então no app as edições em "Gerenciar palavras" ficam salvas **só naquele aparelho** (localStorage). A lista padrão é a de `DEFAULT_WORDS`.
- **Como instalar:**
  - **Android (Chrome):** abrir o link → menu ⋮ → "Instalar app" (ou "Adicionar à tela inicial").
  - **iPhone/iPad (Safari):** abrir o link → botão Compartilhar → "Adicionar à Tela de Início".
