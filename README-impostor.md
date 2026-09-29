# Impostor

> Todos recebem a mesma palavra secreta — menos o impostor, que precisa fingir que sabe qual é.

| Jogadores | Formato | Duração | Bases usadas |
|---|---|---|---|
| 4–12 (ideal 5–10) | individual, blefe | 3–5 min por rodada | tela de privacidade (passa o tablet) |

## Como se joga

1. O app sorteia um tema (por exemplo, "Lugares"), uma palavra secreta desse tema ("Hospital") e um impostor.
2. O tablet passa de mão em mão. Cada um vê a palavra em segredo — menos o impostor, que vê "Você é o IMPOSTOR" e o tema.
3. **Pistas:** a partir de um jogador sorteado, cada um diz em voz alta **uma única palavra** relacionada à secreta. Vaga o bastante para não entregar ao impostor, precisa o bastante para provar que você sabe.
4. **Discussão:** conversa livre, com tempo (opcional).
5. **Votação:** no três, todos apontam para quem acham que é o impostor, e o mais votado é registrado no tablet.
6. **Revelação:** se o mais votado não for o impostor, o impostor vence. Se for, ele tem uma **última chance**: dizer a palavra secreta. Acertou, vence mesmo assim; errou, o grupo vence.

## Fluxo de telas

1. **Configuração:** temas, rodadas, voltas de pistas, discussão e tipo de votação.
2. **Distribuição** (tela de privacidade, na ordem da mesa):
   - Para os outros: "Sua palavra: **HOSPITAL**", com o tema pequeno embaixo.
   - Para o impostor: "Você é o **IMPOSTOR**", com "Tema: Lugares" embaixo.
   - As duas versões têm o mesmo layout, as mesmas cores, o mesmo tamanho de fonte e a mesma duração.
3. **Pistas:** "Começa: CARLA", a ordem de quem fala e o contador de voltas. Botão "Ver minha carta de novo".
4. **Discussão:** cronômetro, com a opção de pular direto para a votação.
5. **Votação:**
   - **Aberta** (padrão): "3, 2, 1... apontem!" → lista de nomes → tocar no mais votado → confirmar.
   - **Secreta:** cada um vota na tela de privacidade; o app apura e mostra o resultado.
   - **Empate:** cada empatado tem 20 s para se defender e há nova votação só entre eles. Se empatar de novo, o impostor escapa.
6. **Revelação:** 2 s de suspense → "BETO **era** o impostor!" ou "BETO **não era** o impostor... era a CARLA!".
7. **Última chance** (se pego): "CARLA, qual é a palavra?" → ela diz em voz alta → o app mostra a palavra → o grupo toca em Acertou ou Errou.
8. **Placar da rodada**, próxima rodada e, no fim, resultado da partida.

## Regras detalhadas

- O impostor é sorteado a cada rodada, **nunca a mesma pessoa em duas rodadas seguidas**. Quem foi impostor recentemente tem chance menor de ser sorteado de novo.
- Não garantir que todo mundo seja impostor uma vez: na última rodada, todos saberiam quem falta.
- Quem começa as pistas é sorteado e, por padrão, nunca é o impostor.
- Voltas de pistas: 1 (padrão) ou 2.
- A palavra não se repete na mesma noite.
- **"Não conheço essa palavra"** (na distribuição) e **"Refazer sorteio"** (se alguém viu a tela de outro, antes das pistas): sorteiam nova palavra **e** novo impostor, e a distribuição recomeça para todos. Assim o botão não dá pista de quem apertou.

## Pontuação

| Desfecho da rodada | Pontos de jogo |
|---|---|
| Impostor não descoberto | impostor +3 |
| Impostor descoberto, mas acerta a palavra | impostor +2 |
| Impostor descoberto e erra a palavra | cada um dos outros +1 |

- **Partida:** 5 rodadas (configurável); ranking por pontos de jogo; empate divide a colocação.
- **Pontos da noite:** tabela padrão do [placar geral](../../recursos/placar-geral/README.md).

## Configurações

| Opção | Valores | Padrão |
|---|---|---|
| Rodadas | 3 / 5 / 8 | 5 |
| Temas | seleção múltipla | todos os de público livre |
| Voltas de pistas | 1 / 2 | 1 |
| Discussão | Sem / 1 / 2 / 3 min | 2 min |
| Votação | Aberta / Secreta | Aberta |
| Impostor vê o tema | Sim / Não | Sim |
| Impostor pode começar as pistas | Sim / Não | Não |

## Conteúdo

Um arquivo por tema em `conteudo/impostor/`:

```json
{
  "id": "lugares",
  "tema": "Lugares",
  "publico": "livre",
  "palavras": ["Hospital", "Praia", "Aeroporto", "Escola", "Cinema", "Padaria", "Estádio"]
}
```

- Palavras concretas e conhecidas por todos; nada técnico ou regional demais.
- Meta inicial: 20 temas com 30 palavras cada.

## Casos especiais

- **Menos de 4 jogadores:** o jogo não começa, com aviso.
- **App em segundo plano durante a distribuição:** volta sempre à tela neutra, nunca ao segredo.
- **Alguém esqueceu a palavra:** "Ver minha carta de novo".

## Critérios de aceite

- [ ] As telas do impostor e dos outros são indistinguíveis de longe (layout, cores, tempo).
- [ ] O segredo só aparece com o dedo pressionado e nunca na tela neutra.
- [ ] A mesma pessoa nunca é impostor em duas rodadas seguidas.
- [ ] O empate na votação segue a regra.
- [ ] Os três desfechos dão os pontos corretos.
- [ ] Resultado enviado ao placar geral.

## Ideias para depois

- **Modo infiltrado:** em vez de "Você é o impostor", ele recebe uma palavra parecida (Praia × Piscina) e nem sabe que é o diferente. Exige pares de palavras no conteúdo.
- **Dois impostores** para grupos de 9 ou mais.
- Temas criados pela galera.
