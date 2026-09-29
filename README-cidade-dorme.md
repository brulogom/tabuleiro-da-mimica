# Cidade Dorme

> A cidade dorme, os assassinos atacam e, de dia, todo mundo tenta descobrir quem são — com o app como narrador.

| Jogadores | Formato | Duração | Bases usadas |
|---|---|---|---|
| 5–16 (ideal 7–12) | papéis secretos, cidade × assassinos | 20–40 min | tela de privacidade, narração, tablet no centro |

Neste README, "noite" e "dia" são as fases do jogo — não confundir com a noite de jogos do placar.

## Papéis

| Papel | Lado | O que faz |
|---|---|---|
| Assassino | assassinos | À noite, escolhe com os parceiros quem atacar. Sabe quem são os outros assassinos. |
| Detetive | cidade | À noite, investiga uma pessoa e descobre se ela é assassina. |
| Médico | cidade | À noite, escolhe alguém para proteger. Pode ser ele mesmo, mas não a mesma pessoa em duas noites seguidas. |
| Cidadão | cidade | Não age à noite; de dia, discute e vota. |

Quantidade padrão de assassinos:

| Jogadores | Assassinos |
|---|---|
| 5–6 | 1 |
| 7–10 | 2 |
| 11–16 | 3 |

Por padrão há sempre 1 detetive e 1 médico (dá para desligar). O resto é cidadão. A tabela é um ponto de partida, para ajustar depois de testar com o grupo.

## Como se joga

1. **Distribuição:** o tablet passa de mão em mão (tela de privacidade) e cada um vê seu papel. Os assassinos veem também quem são os parceiros.
2. **Noite:** o tablet vai para o centro da mesa. Todos fecham os olhos e o app narra:
   - "Assassinos, acordem." Eles combinam em silêncio, um deles toca no nome da vítima e confirma.
   - "Médico, acorde." Ele toca em quem quer proteger.
   - "Detetive, acorde." Ele toca em quem quer investigar e vê, por 4 s, se a pessoa é assassina ou não.
3. **Dia:** "A cidade acorda." O app anuncia quem foi atacado — ou que ninguém morreu, se o médico protegeu a vítima. Quem morre sai do jogo.
4. **Discussão e votação:** o grupo discute e vota para eliminar um suspeito, ou decide não eliminar ninguém.
5. Noites e dias se alternam até um lado vencer.

### Fim de jogo
- **A cidade vence** quando todos os assassinos forem eliminados.
- **Os assassinos vencem** quando o número de assassinos vivos for igual ou maior que o de não-assassinos vivos.

## Fluxo de telas

1. **Configuração:** papéis, número de assassinos, tempo de discussão, revelação de papéis, votação e narração.
2. **Distribuição** na tela de privacidade, com todas as cartas de papel no mesmo layout.
3. **Preparação:** "Coloquem o tablet no centro, onde todos alcancem, e fechem os olhos" → botão Começar a noite.
4. **Noite:** tela escura, brilho baixo, sem flashes e com som ambiente de fundo para disfarçar barulhos. Para cada papel: narração → lista de vivos com nomes grandes → tocar → "Confirmar: BETO?" → narração "volte a dormir".
5. **Amanhecer:** narração e anúncio na tela. Se a revelação estiver ativa, mostra o papel de quem morreu.
6. **Discussão:** cronômetro e botão Ir para votação.
7. **Votação:** aberta (tocar no mais votado ou em "Ninguém") ou secreta (cada um vota na tela de privacidade).
   - **Empate:** 30 s de defesa para os empatados e nova votação só entre eles; novo empate, ninguém sai.
8. **Eliminação:** anúncio, checagem de vitória e nova noite.
9. **Fim:** lado vencedor, revelação de todos os papéis e a **história da partida**, noite a noite: quem foi atacado, protegido, investigado e votado.

## Regras detalhadas

- **Tempo de cada etapa da noite:** no mínimo 8 s, terminando 1 a 3 s (aleatório) depois da confirmação. A duração nunca pode denunciar nada.
- **Papel que já morreu continua sendo chamado.** O app narra "Médico, acorde" e espera um tempo aleatório parecido com o normal (8 a 15 s). Só não é chamado um papel desligado nas configurações.
- **Ordem da noite:** assassinos → médico → detetive.
- **Assassinos:** qualquer um deles pode tocar; os nomes dos próprios assassinos não aparecem na lista deles. Há ataque desde a primeira noite.
- **Médico:** o nome protegido na noite anterior aparece desabilitado. Se ele protege a vítima dos assassinos, ninguém morre.
- **Detetive:** o resultado aparece por 4 s e some. Só volta a ser mostrado na história do fim.
- **Mortos:** continuam na roda, em silêncio; não votam e saem das listas.
- **Vitória:** checada depois de cada morte, na noite e no dia.
- **Pausa:** botão que exige segurar 2 s, para não ser tocado sem querer no escuro.

### Narração
- Áudios gravados (ou voz sintética em português), sempre acompanhados de texto grande na tela.
- Frases: "A cidade dorme. Todos fechem os olhos." / "Assassinos, acordem e escolham uma vítima." / "Assassinos, voltem a dormir." / "Médico, acorde. Quem você quer proteger?" / "Médico, volte a dormir." / "Detetive, acorde. Quem você quer investigar?" / "Detetive, volte a dormir." / "A cidade acorda." / "Esta noite, ninguém morreu." / "A cidade venceu!" / "Os assassinos venceram!"
- Como os nomes dos jogadores variam, a narração gravada diz a frase ("Esta noite, alguém foi atacado...") e o nome aparece na tela — ou é falado por voz sintética, se disponível.

## Pontuação

Pontos da noite atribuídos direto, sem pontos de jogo:

| Resultado | Pontos da noite |
|---|---|
| Lado vencedor | 4 por integrante, +1 para quem estiver vivo no fim |
| Lado perdedor | 1 (participação) |

## Configurações

| Opção | Valores | Padrão |
|---|---|---|
| Assassinos | Automático (tabela) / 1 a 4 | Automático |
| Detetive | Sim / Não | Sim |
| Médico | Sim / Não | Sim |
| Tempo de discussão | 2 / 3 / 5 min / Sem limite | 3 min |
| Revelar o papel de quem sai | Sim / Não | Sim |
| Votação | Aberta / Secreta | Aberta |
| Narração | Voz e texto / Só texto | Voz e texto |

## Casos especiais

- **Menos de 5 jogadores:** o jogo não começa.
- **Jogador precisa ir embora:** "Retirar jogador" — sai como morto, com o papel revelado ou não, conforme a configuração, e a vitória é checada.
- **Toque errado à noite:** evitado pela confirmação; depois de confirmado, não há volta.
- **App em segundo plano:** pausa e retoma na mesma fase, sem mostrar segredos.
- **Alguém espiou:** o grupo decide; o app oferece Recomeçar partida com novos papéis.

## Critérios de aceite

- [ ] Distribuição secreta; os assassinos veem os parceiros.
- [ ] Noite com tela escura, sem flashes e com som ambiente.
- [ ] Papéis mortos continuam sendo chamados, com tempo aleatório.
- [ ] Nenhuma etapa revela informação pela duração ou por diferença de som.
- [ ] A proteção do médico e a regra de não repetir funcionam.
- [ ] O resultado do detetive aparece por 4 s e some.
- [ ] A vitória é checada depois de cada eliminação.
- [ ] História completa no fim e pontos enviados ao placar geral.

## Ideias para depois

- **Papéis extras:** Bobo (vence sozinho se for eliminado na votação) e Caçador (ao morrer, leva alguém junto).
- **Modo narrador humano:** o app vira roteiro e registro para quem quiser narrar.
- **Detetive da piscadinha:** o app só distribui os papéis (assassino, detetive e vítimas) e o jogo acontece fora da tela — o assassino "mata" piscando para alguém, e o detetive tenta descobri-lo.
