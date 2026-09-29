# Sorteador de dedos

> Todo mundo coloca um dedo na tela e o app escolhe: quem começa, quem paga a prenda, quem fica em qual time.

| Jogadores | Uso | Base usada |
|---|---|---|
| 2 até o limite de toques do tablet (em geral, 10) | ferramenta avulsa e chamada pelos jogos | mesa (multitoque) |

## Modos

| Modo | O que faz |
|---|---|
| Escolher 1 (padrão) | Sorteia um dedo. |
| Escolher vários | Sorteia N dedos (N definido antes). |
| Dividir em times | Divide os dedos em 2 a 4 times do tamanho mais parecido possível. |
| Ordem | Numera os dedos de 1 a N em ordem sorteada. |

## Como funciona

1. Tela escura com "Coloquem um dedo na tela", escrito nos dois sentidos para quem está do outro lado da mesa.
2. Cada dedo que toca a tela ganha um círculo colorido e pulsante embaixo dele, com uma cor diferente para cada dedo.
3. Quando o número de dedos fica estável por **2 segundos**, acontece o sorteio. Durante esses 2 s, um anel de contagem regressiva aparece em volta de cada círculo, com som de tambor.
4. Resultado:
   - **Escolher 1 ou vários:** os círculos escolhidos crescem e ganham destaque; os outros somem. Som de revelação.
   - **Times:** cada círculo assume a cor e a letra do seu time (A, B, C, D), e aparece a legenda.
   - **Ordem:** cada círculo mostra seu número em tamanho grande, **acima** do dedo, para o dedo não cobri-lo.
5. O resultado fica na tela até todos tirarem os dedos. Três segundos depois, volta ao início (ou antes, com o botão De novo).

## Regras detalhadas

- **Mínimos:** 2 dedos para Escolher 1 e Ordem; N + 1 para Escolher vários; 2 por time para Dividir em times.
- Se um dedo entra ou sai durante a contagem, ela recomeça.
- Depois do resultado, dedos novos são ignorados até a tela ficar vazia.
- O sorteio usa um gerador aleatório criptográfico e acontece **no instante do sorteio**, nunca no momento do toque. A ordem em que as pessoas encostaram na tela não pode influenciar nada.
- **Times:** embaralhar os dedos e distribuí-los em rodízio, com diferença máxima de 1 entre os times.
- Toques cancelados pelo sistema contam como dedo que saiu.
- O escolhido se destaca pelo tamanho e pela animação, não só pela cor.

## Integração com os jogos

- Os jogos podem abrir o sorteador em "Quem começa?" e "Sortear times".
- Depois do resultado, aparece a pergunta opcional "Quem foi escolhido?", com a lista de jogadores e a opção Pular. Em Dividir em times, a pergunta se repete para cada time, montando os times do jogo.
- Sem jogadores cadastrados, funciona sozinho, sem a pergunta.

## Visual e som

- Círculos com cerca de 120 px de diâmetro, maiores que a ponta do dedo, em cores bem contrastantes entre si.
- Som curto a cada dedo que entra, tambor durante a contagem e som de revelação no resultado.

## Casos especiais

- **Mais dedos do que o tablet aceita:** aviso "Este tablet reconhece até X dedos ao mesmo tempo" (o limite pode ser lido do sistema).
- **Gestos do sistema com vários dedos** (comuns no iPad e em alguns Android, como pinçar com quatro ou cinco dedos para sair do app): na primeira vez, uma dica sugere desativar esses gestos nos ajustes do tablet.
- **Dedos muito na borda** podem acionar gestos do sistema: a área útil tem margem, e a instrução pede para tocar no meio da tela.
- **Palma encostando:** conta como mais um dedo; a contagem recomeça quando ela sai.

## Critérios de aceite

- [ ] Reconhece de 2 até o máximo de toques do tablet, com um círculo por dedo, sem atraso.
- [ ] A contagem de 2 s recomeça sempre que o número de dedos muda.
- [ ] Os quatro modos funcionam.
- [ ] Sorteio justo: num teste automático com 10 mil sorteios, cada posição sai perto de 1/N das vezes.
- [ ] Resultado legível com os dedos ainda na tela.
- [ ] "Quem foi escolhido?" é opcional e alimenta os jogos.

## Ideias para depois

- **Eliminação:** os dedos vão sendo eliminados um a um, com suspense, até sobrar um.
- **Prenda:** o escolhido recebe um desafio sorteado.
