# Placar geral

> Soma os pontos da noite de todos os jogos e coroa o campeão da noite.

| Uso | Atualização | Dados |
|---|---|---|
| sempre acessível pelo menu | ao fim de cada partida | salvos no aparelho automaticamente |

## Conceitos

- **Noite de jogos:** a sessão. Começa com o cadastro de jogadores e termina quando alguém toca em Encerrar noite.
- **Partida:** uma jogada completa de um jogo (por exemplo, 5 rodadas de Impostor).
- **Pontos de jogo:** a pontuação interna de cada jogo (acertos, rodadas vencidas...). Cada jogo tem sua escala.
- **Pontos da noite:** o que vai para o placar geral. Cada partida vale **de 0 a 5 pontos da noite por jogador**, qualquer que seja o jogo. Assim nenhum jogo domina o placar só por dar mais pontos.

## Tabela padrão

Usada por quase todos os jogos, a partir da colocação na partida:

| Colocação | Pontos da noite |
|---|---|
| 1º | 5 |
| 2º | 3 |
| 3º | 2 |
| Demais participantes | 1 |

- **Empates:** os empatados recebem os pontos da melhor posição entre eles, e a posição seguinte é pulada. Exemplo: dois em 1º recebem 5 cada; o próximo é 3º e recebe 2.
- **Equipes:** todos os integrantes recebem os pontos da colocação do time.
- **Sem pontuar:** em jogos individuais, quem termina a partida com 0 pontos de jogo (ou menos) recebe 1, qualquer que seja a colocação. Se ninguém pontuar, todos recebem 1.
- **Exceção:** a Cidade Dorme usa regra própria por lado vencedor, descrita no README do jogo, respeitando o máximo de 5.
- Quem não jogou a partida não recebe nada dela.

## Contrato com os jogos

Ao fim de uma partida, todo jogo chama:

```js
registrarPartida({
  id: "p_2026-09-28_2114_impostor",   // único por partida
  jogo: "impostor",
  inicio: "2026-09-28T21:14:00",
  fim: "2026-09-28T21:32:00",
  resultados: [
    { jogadorId: "j1", colocacao: 1, pontosDeJogo: 7, pontosDaNoite: 5 },
    { jogadorId: "j2", colocacao: 2, pontosDeJogo: 5, pontosDaNoite: 3 },
    { jogadorId: "j3", colocacao: 3, pontosDeJogo: 3, pontosDaNoite: 2 },
    { jogadorId: "j4", colocacao: 4, pontosDeJogo: 0, pontosDaNoite: 1 }
  ],
  destaques: ["Ana escapou duas vezes como impostora"]   // opcional
})
```

Função auxiliar para os jogos que usam a tabela padrão:

```js
// recebe [{ id, pontosDeJogo }] — id de jogador ou de time
// devolve [{ id, colocacao, pontosDaNoite }], já tratando empates e a regra de quem não pontuou
calcularPontosDaNoite(ranking, { individual: true })
```

Validações do `registrarPartida`:
- Cada participante aparece exatamente uma vez nos resultados.
- `pontosDaNoite` é um inteiro de 0 a 5.
- Todo `jogadorId` existe na noite.
- O mesmo `id` de partida registrado duas vezes é ignorado (evita duplicar com toque duplo).
- Partida inválida não é registrada e gera um erro visível durante o desenvolvimento — nunca some em silêncio.

## Telas

1. **Resultado da partida** (logo depois do jogo): cada jogador com "+5", "+3"... animados, e os destaques.
2. **Placar da noite:** posição, emoji, nome, total, número de vitórias e setas ▲▼ mostrando quem subiu ou desceu desde a última partida. O líder ganha 👑. A lista se reordena com animação.
3. **Histórico:** partidas da noite (jogo, horário, vencedor). Tocar abre o detalhe. Opções Desfazer última partida e Excluir partida, ambas com confirmação.
4. **Ajuste manual:** somar ou tirar pontos de um jogador, com motivo obrigatório ("prenda cumprida"); aparece no histórico como ajuste.
5. **Encerrar noite:** pódio com os três primeiros (o 1º no centro, mais alto), confete, som e "Campeão da noite". Destaques calculados: melhor de cada jogo (mais pontos da noite naquele jogo), mais vitórias e mais partidas jogadas.
6. **Copiar resumo:** texto pronto para colar numa conversa:

```
🏆 Noite de jogos — 28/09
1º Ana — 23 pts 👑
2º Beto — 19 pts
3º Carla — 17 pts
Partidas: Impostor (2), Quem sou eu? (1), Roda das letras (2)
```

## Desempate no total

1. Mais 1º lugares.
2. Mais 2º lugares.
3. Persistindo, dividem a posição.

## Jogadores durante a noite

- **Chegou depois:** entra com 0 pontos e o selo "chegou agora".
- **Foi embora:** continua no placar, esmaecido, com o total que tinha.
- Nome, cor e emoji podem ser trocados a qualquer momento; o histórico acompanha pelo id.

## Dados

```js
Noite {
  id, criadaEm, encerradaEm,          // encerradaEm = null enquanto a noite está aberta
  jogadores: [{ id, nome, cor, emoji, ativo }],
  partidas:  [{ id, jogo, inicio, fim, resultados: [...], destaques: [...] }],
  ajustes:   [{ id, jogadorId, pontos, motivo, criadoEm }]
}
```

- O total de cada jogador é **sempre calculado** a partir das partidas e dos ajustes, nunca guardado à parte. Assim, desfazer ou excluir uma partida nunca deixa o placar inconsistente.
- A noite é salva a cada alteração. Ao abrir o app com uma noite em aberto: "Continuar a noite de sábado, 21h? (8 jogadores, 6 partidas)" ou "Começar nova".
- As últimas 10 noites encerradas ficam guardadas para consulta.
- Partida interrompida (app fechado no meio) não é registrada; só partidas concluídas entram no placar.

## Critérios de aceite

- [ ] Placar legível de longe, com o líder em destaque.
- [ ] Tabela padrão, empates e regra de quem não pontuou calculados corretamente (testes automáticos cobrindo empates).
- [ ] Desfazer e excluir partida recalculam tudo.
- [ ] Ajuste manual exige motivo e aparece no histórico.
- [ ] A noite sobrevive a fechar e reabrir o app.
- [ ] Pódio e resumo copiável no encerramento.

## Ideias para depois

- Gráfico da evolução da noite, com uma linha por jogador.
- Modo TV, para espelhar o placar numa tela grande.
- Campeonato: somar várias noites de jogos.
