# Palavra proibida

> Faça seu time adivinhar a palavra sem usar as palavras mais óbvias — elas estão proibidas.

| Jogadores | Formato | Duração | Bases usadas |
|---|---|---|---|
| 4+ (ideal 6–12) | 2 a 4 equipes | 10–25 min | baralho + cronômetro, buzina |

## Como se joga

1. Os times se alternam. No turno do time, um integrante é o **explicador** e o resto do time adivinha.
2. O explicador vê a carta: a **palavra-alvo** no alto e **cinco palavras proibidas** embaixo.
3. Ele descreve a palavra-alvo falando, sem usar a palavra-alvo nem nenhuma das proibidas.
4. Um jogador de outro time é o **fiscal**: fica ao lado do explicador, vendo a mesma carta, e aperta a **buzina** se ouvir uma infração.
5. Acertou, vem a próxima carta. Travou, pode pular. O turno dura 60 s.

### O que é infração
- Dizer a palavra-alvo ou uma proibida, inclusive em outra forma (plural, diminutivo, aumentativo, palavra derivada — "praiano" conta como "praia") ou em outra língua.
- Dizer só um pedaço da palavra ("pra...").
- Fazer gestos ou mímica.
- Soletrar ou dar pistas sobre a forma da palavra: letra inicial, número de sílabas, "rima com...".

Todo o resto vale.

## Fluxo de telas

1. **Configuração:** times, tempo, duração, dificuldade e baralhos.
2. **Vez de:** "Time Azul — explica BETO". O app sugere o fiscal (um jogador do time que joga em seguida, em rodízio), mas qualquer adversário pode buzinar.
3. **Contagem 3-2-1.**
4. **Carta:** palavra-alvo numa faixa de destaque; proibidas em lista embaixo, marcadas com 🚫; cronômetro e contador.
   - **ACERTOU:** botão grande e verde, à direita.
   - **PULAR:** botão menor, à esquerda.
   - **BUZINA:** faixa vermelha em toda a borda de cima, fácil para o fiscal alcançar.
5. **Retorno:** acerto com som positivo; pulo com som neutro; buzina com som alto e tela vermelha por 0,8 s. A próxima carta aparece logo em seguida.
6. **Tempo!** A carta em jogo é descartada.
7. **Última chance** (opcional): o time adversário tem 5 s para adivinhar a carta que estava em jogo e ganhar 1 ponto.
8. **Resumo do turno:** cada carta com ✓ acertou, ↷ pulou ou 📢 buzina. Tocar troca o status. Botão Confirmar.
9. **Placar** entre turnos.
10. **Resultado da partida** e envio ao placar geral.

## Regras detalhadas

- Os turnos seguem uma ordem fixa de times; dentro de cada time, o explicador faz rodízio.
- **Duração por voltas** (padrão): cada time joga o mesmo número de turnos — o tamanho do maior time multiplicado pelo número de voltas.
- **Duração por meta:** a partida acaba quando um time chega à meta de pontos, mas a volta é completada para que todos os times tenham jogado o mesmo número de turnos.
- Mínimo de 2 jogadores por time.
- Carta vista não volta na mesma noite enquanto houver cartas novas.
- Contestações são resolvidas no resumo do turno: o grupo decide e corrige o status.
- Se ninguém buzinou uma infração, vale o que aconteceu (a responsabilidade é do fiscal), a menos que todos concordem em corrigir no resumo.

## Pontuação

- **Pontos de jogo:** +1 por acerto; −1 por buzina; pulo vale 0 (ou −1, se configurado); última chance, +1 para o time que adivinhou. O total pode ficar negativo.
- **Empate no fim:** cada time empatado joga um turno extra de 30 s. Se continuar empatado, divide a colocação.
- **Pontos da noite:** tabela padrão do [placar geral](../../recursos/placar-geral/README.md), pela colocação dos times; todos os integrantes recebem.

## Configurações

| Opção | Valores | Padrão |
|---|---|---|
| Tempo por turno | 45 / 60 / 90 s | 60 s |
| Duração | Voltas (1 / 2 / 3) ou Meta (15 / 25 / 35 pontos) | 1 volta |
| Pulo | Livre / Custa 1 ponto | Livre |
| Limite de pulos por turno | Sem limite / 3 / 5 | Sem limite |
| Última chance | Sim / Não | Não |
| Dificuldade | Fácil / Médio / Difícil / Misturado | Misturado |
| Baralhos | seleção múltipla | todos os de público livre |

## Conteúdo

Arquivos em `conteudo/palavra-proibida/`:

```json
{
  "id": "geral",
  "nome": "Geral",
  "publico": "livre",
  "cartas": [
    { "alvo": "Praia", "proibidas": ["mar", "areia", "sol", "onda", "férias"], "dificuldade": "facil" },
    { "alvo": "Aniversário", "proibidas": ["bolo", "parabéns", "vela", "festa", "idade"], "dificuldade": "facil" },
    { "alvo": "Pizza", "proibidas": ["queijo", "massa", "forno", "fatia", "italiana"], "dificuldade": "medio" }
  ]
}
```

Regras para escrever cartas:
- As proibidas são as cinco pistas mais óbvias para chegar ao alvo.
- Nenhuma proibida contém o alvo, e o alvo não se repete entre baralhos.
- Meta inicial: 300 cartas (um turno de 60 s usa de 6 a 10).

## Casos especiais

- **Buzina sem querer:** corrigida no resumo.
- **Carta ruim:** no resumo, "Não mostrar mais esta carta".
- **Time com uma pessoa só:** não é permitido; o app pede para rebalancear.
- **App em segundo plano:** pausa automática.

## Critérios de aceite

- [ ] Palavra-alvo legível a 2 m; proibidas legíveis pelo fiscal ao lado.
- [ ] Buzina reconhecida com um toque em qualquer ponto da faixa superior.
- [ ] Acerto, pulo e buzina contam pontos conforme a configuração.
- [ ] O resumo permite corrigir antes de confirmar.
- [ ] Voltas e meta terminam com todos os times tendo jogado o mesmo número de turnos.
- [ ] O desempate funciona.
- [ ] Resultado enviado ao placar geral.

## Ideias para depois

- **Modo relâmpago:** turnos de 30 s e só três proibidas.
- **Cartas da galera:** o grupo cria cartas antes de jogar.
