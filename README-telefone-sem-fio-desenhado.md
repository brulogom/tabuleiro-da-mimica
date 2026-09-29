# Telefone sem fio desenhado

> Uma frase vira desenho, que vira frase, que vira desenho... e no fim ninguém reconhece o que foi escrito no começo.

| Jogadores | Formato | Duração | Bases usadas |
|---|---|---|---|
| 4–12 (ideal 5–10) | individual, criativo (pontos opcionais) | 10–20 min | tela de privacidade, quadro de desenho, teclado |

## Como se joga

1. O primeiro jogador escreve uma frase — ou toca em "Me dá uma ideia" para o app sortear uma.
2. O tablet passa: o segundo vê **só a frase** e tem 60 s para desenhá-la.
3. O terceiro vê **só o desenho** e escreve o que acha que é.
4. O quarto vê **só a última frase** e desenha. E assim por diante, alternando frase e desenho.
5. Quando todos tiverem participado, vem a **revelação**: a corrente inteira, passo a passo, com o nome de quem fez cada um.

### Correntes
- Com um tablet só, uma corrente acontece de cada vez e passa por todos os jogadores uma vez.
- A partida tem de 1 a 3 correntes (padrão: 2). Cada corrente começa no jogador seguinte ao que começou a anterior. Com número par de jogadores, todo mundo alterna entre escrever e desenhar; com número ímpar, um jogador repete o tipo de etapa.
- Se a corrente terminar num desenho, tudo bem: a revelação funciona do mesmo jeito.

## Fluxo de telas

1. **Configuração:** correntes, tempos, melhor momento e frase inicial.
2. **Passe o tablet para ANA** → "Sou eu".
3. **Frase inicial:** campo de texto (até 80 caracteres), botão "Me dá uma ideia" e Pronto.
4. **Desenhar:** a frase anterior fixa no alto, o quadro ocupando o resto da tela, ferramentas numa barra lateral, cronômetro e Terminei.
5. **Descrever:** o desenho anterior na metade de cima e o campo de texto logo abaixo, para não ficar escondido pelo teclado virtual. Cronômetro e Pronto.
6. **Transição:** tela neutra "Passe o tablet para BETO", sem mostrar nenhum passo.
7. **Revelação:** "Corrente da ANA" → toque para avançar cada passo (frase ou desenho em tela cheia, com o nome do autor) → no fim, a corrente inteira em miniatura.
8. **Melhor momento** (opcional): o grupo escolhe junto o passo favorito da corrente.
9. Próxima corrente ou **resultado da partida**.

## Quadro de desenho

- Desenho com o dedo ou com caneta (Apple Pencil ou caneta de tablet Android).
- Ferramentas: 8 cores (preto, vermelho, azul, verde, amarelo, laranja, marrom e rosa), 3 espessuras, borracha, desfazer em vários níveis e limpar tudo (com confirmação).
- Proporção fixa do quadro (por exemplo, 4:3), para o desenho aparecer igual na revelação.
- Se uma caneta for detectada, os toques de dedo são ignorados durante o desenho (evita marcas da palma da mão).
- Os traços são salvos (lista de pontos, com cor e espessura) e, ao terminar, viram uma imagem.

## Regras detalhadas

- Cada jogador vê **apenas o passo imediatamente anterior**. Nenhuma tela pode mostrar outros passos antes da revelação.
- **Tempo esgotado ao desenhar:** o que estiver no quadro é enviado, mesmo em branco.
- **Tempo esgotado ao descrever com o campo vazio:** +15 s uma única vez. Se continuar vazio, o texto vira "Desenhe o que quiser!".
- Frases sorteadas não se repetem na mesma noite.
- Mínimo de 4 jogadores; com menos, a corrente é curta demais para a graça funcionar.

## Pontuação

- **Melhor momento** (padrão: ligado): ao fim de cada corrente, o grupo escolhe o passo favorito, por aclamação ou "no três, todo mundo aponta". O autor ganha +2 pontos de jogo.
- **Fim da partida:** ranking por pontos de jogo; empate divide a colocação.
- **Pontos da noite:** tabela padrão do [placar geral](../../recursos/placar-geral/README.md). Com o melhor momento desligado, ninguém pontua e todos recebem 1 (participação).

## Configurações

| Opção | Valores | Padrão |
|---|---|---|
| Correntes | 1 / 2 / 3 | 2 |
| Tempo para desenhar | 45 / 60 / 90 s | 60 s |
| Tempo para descrever | 30 / 45 / 60 s | 45 s |
| Melhor momento | Sim / Não | Sim |
| Frase inicial | Escrita pelo jogador / Sempre sorteada | Escrita (com botão de sortear) |

## Conteúdo

`conteudo/telefone-sem-fio-desenhado/frases.json`:

```json
{
  "frases": [
    { "texto": "Um gato pilotando um avião", "publico": "livre" },
    { "texto": "Vovó surfando uma onda gigante", "publico": "livre" },
    { "texto": "Um jacaré preso no engarrafamento", "publico": "livre" }
  ]
}
```

- Boa frase: um personagem, uma ação absurda e, se quiser, um lugar.
- Meta inicial: 150 frases.

## Casos especiais

- **Teclado virtual cobrindo a tela:** o layout da etapa Descrever já foi pensado para isso; testar no tablet real.
- **Texto digitado impróprio:** é um jogo presencial em grupo, então não há filtro do que é digitado; no modo Família, só as frases sorteadas são filtradas.
- **App em segundo plano:** pausa e volta à tela neutra.
- **Jogador sai no meio:** é pulado nas próximas etapas e correntes.

## Critérios de aceite

- [ ] Ninguém vê mais do que o passo anterior.
- [ ] Desenho fluido, sem atraso perceptível, com dedo e com caneta; desfazer funciona.
- [ ] A etapa Descrever é usável com o teclado aberto.
- [ ] A revelação mostra todos os passos na ordem, com os autores.
- [ ] Tempos esgotados seguem as regras.
- [ ] Resultado enviado ao placar geral.

## Ideias para depois

- Revelação com **replay** do desenho sendo traçado (possível porque os traços ficam salvos).
- Exportar a corrente como uma imagem única para mandar no grupo.
