# Roda das letras

> Tablet no meio da mesa, uma categoria e um anel de letras: diga uma palavra, toque na letra e passe a vez antes que o tempo acabe.

| Jogadores | Formato | Duração | Bases usadas |
|---|---|---|---|
| 2–8 (ideal 3–6; todos precisam alcançar o tablet) | individual, eliminação | 2–4 min por rodada | mesa (multitoque), cronômetro |

## Como se joga

1. O tablet fica deitado no centro da mesa. O app sorteia uma categoria (por exemplo, "Animais") e mostra o anel de letras.
2. Na sua vez, diga em voz alta uma palavra da categoria que comece com uma letra ainda disponível e **toque nessa letra**. Ela fica apagada e o cronômetro recomeça para o próximo.
3. Você tem **10 segundos**. Se o tempo acabar, está fora da rodada.
4. Não vale repetir uma palavra já dita na rodada.
5. A rodada acaba quando sobra um jogador. A partida tem três rodadas, cada uma com categoria nova.

## Tela

- **Anel de letras:** cada letra é um botão redondo com pelo menos 72 px, girado com a base voltada para fora da roda, para ser lida de qualquer lado da mesa.
- **Centro:** a categoria escrita duas vezes (uma de cabeça para baixo em relação à outra), o anel do cronômetro em volta e o nome de quem joga, também duplicado.
- **Letras usadas:** esmaecidas e com um ×.
- **Jogadores:** faixa discreta com os nomes; eliminados aparecem riscados.
- **Cantos:** Pausar, Desfazer e Contestar, pequenos (Pausar exige segurar 1 s).
- O layout é simétrico. Se o tablet girar a tela, nada reinicia nem perde estado.

## Regras detalhadas

- **Letras:** por padrão, 20 letras — A B C D E F G H I J L M N O P R S T U V. Ficam de fora K, Q, W, X, Y e Z, difíceis demais em português. Há opção para usar todas as 26.
- **Ordem:** a ordem da mesa, no sentido horário. Quem começa a primeira rodada é sorteado (dá para usar o sorteador de dedos); nas seguintes, começa quem saiu primeiro na rodada anterior.
- **Cronômetro:** recomeça a cada letra tocada, com tique acelerado nos últimos 3 s.
- **Tempo esgotado:** buzina, o jogador é eliminado, a vez passa ao próximo ainda ativo e o cronômetro recomeça depois de 1 s de transição.
- **Toques simultâneos:** vale o primeiro; toques nos 500 ms seguintes são ignorados.
- **Letra já usada:** toque ignorado, com um som curto de "não".
- **Desfazer** (toque errado): devolve a última letra e dá a vez de novo ao jogador anterior, com o cronômetro cheio. Disponível até alguém tocar em outra letra.
- **Contestar:** pausa e pergunta "A palavra de BETO vale?". "Vale": o jogo continua. "Não vale": mesmo efeito do Desfazer, mas o jogador contestado tem só 5 s.
- **Prorrogação:** se todas as letras forem usadas com dois ou mais jogadores ativos, sai nova categoria e todas as letras voltam, só para os sobreviventes.

## Pontuação

- **Pontos de jogo por rodada:** vencedor (último sobrevivente) +3; segundo +2; terceiro +1; os demais, 0.
- **Partida:** soma das rodadas; ranking por pontos de jogo; empate divide a colocação.
- **Pontos da noite:** tabela padrão do [placar geral](../../recursos/placar-geral/README.md).

## Configurações

| Opção | Valores | Padrão |
|---|---|---|
| Tempo por vez | 5 / 8 / 10 / 15 s | 10 s |
| Rodadas | 1 / 3 / 5 | 3 |
| Letras | 20 (sem K, Q, W, X, Y, Z) / Todas | 20 |
| Categorias | por dificuldade e público | Fácil e Médio |

## Conteúdo

`conteudo/roda-das-letras/categorias.json`:

```json
{
  "categorias": [
    { "nome": "Animais", "dificuldade": "facil", "publico": "livre" },
    { "nome": "Coisas que se leva para a praia", "dificuldade": "medio", "publico": "livre" },
    { "nome": "Palavras em inglês", "dificuldade": "dificil", "publico": "livre" }
  ]
}
```

- Boa categoria é ampla o bastante para ter palavras com a maioria das letras: Animais, Comidas, Profissões, Cidades, Nomes de pessoas, Marcas, Objetos da casa, Coisas vermelhas.
- Meta inicial: 80 categorias.
- Categorias não se repetem na mesma noite.

## Casos especiais

- **Jogador precisa sair no meio:** botão "Tirar jogador" (conta como eliminado na rodada).
- **Palma ou braço encostando na tela:** só toques sobre as letras contam; o resto da tela ignora toques.
- **App em segundo plano:** pausa automática.

## Critérios de aceite

- [ ] Letras e categoria legíveis de todos os lados da mesa.
- [ ] O cronômetro recomeça a cada letra tocada e elimina quem estoura o tempo.
- [ ] Toques duplos ou simultâneos nunca usam duas letras.
- [ ] Desfazer e Contestar devolvem a letra e a vez corretamente.
- [ ] A prorrogação acontece quando as letras acabam.
- [ ] Rodadas somadas e resultado enviado ao placar geral.

## Ideias para depois

- **Stop (adedanha):** o app sorteia a letra e as categorias, controla o tempo e ajuda a somar os pontos (10 por resposta única, 5 por repetida) enquanto cada um escreve no papel.
- Letras difíceis (K, W, Y) valendo pontos extras.
- Categorias da galera.
