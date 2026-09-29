# Quem sou eu?

> Com o tablet na testa, você tenta adivinhar a palavra que todo mundo está vendo — e o grupo dá as dicas.

| Jogadores | Formato | Duração | Bases usadas |
|---|---|---|---|
| 2+ (ideal 4–12) | equipes ou todos contra todos | 10–20 min | baralho + cronômetro, sensor de movimento |

## Como se joga

1. Escolham um ou mais baralhos (Animais, Profissões, Comidas...).
2. O jogador da vez segura o tablet na testa, na horizontal, com a tela virada para o grupo.
3. Depois da contagem 3-2-1, aparece uma palavra. O grupo dá dicas do jeito que quiser — falando, fazendo mímica, cantando —, só não pode dizer a palavra nem parte dela.
4. Acertou: inclina o tablet para baixo (tela para o chão). Quer pular: inclina para cima (tela para o teto).
5. Quando o tempo acaba, aparece o resumo do turno e o tablet vai para o próximo.

### Modos de disputa
- **Equipes** (padrão com 4 ou mais jogadores): os times se alternam. No turno do time, um integrante adivinha e o próprio time dá as dicas; os adversários fiscalizam.
- **Todos contra todos:** cada jogador tem seu turno para adivinhar, todos os outros dão dicas e os pontos são de quem adivinhou.

### Modos de controle
- **Na testa** (padrão): acerto e pulo pela inclinação.
- **Apoiado:** o tablet fica em pé na mesa ou num suporte, virado para o grupo; quem adivinha senta de costas para a tela e um ajudante toca em ACERTOU ou PASSA. Bom para tablets pesados, crianças ou quando o sensor não estiver disponível.

## Fluxo de telas

1. **Configuração:** modo, baralhos, tempo e voltas.
2. **Vez de:** "Vez de ANA — Time Azul", botão Começar e o lembrete "Segure na testa".
3. **Contagem 3-2-1** com som. Nesse momento o app registra a posição neutra do tablet.
4. **Carta:** palavra gigante no centro, cronômetro na borda e contador de acertos.
5. **Retorno:** tela inteira verde com "✓ ACERTOU" ou laranja com "↷ PASSOU" por cerca de 0,8 s, com sons diferentes para cada um — quem está com o tablet na testa não vê a tela, só ouve.
6. **Tempo!** Apito final.
7. **Resumo do turno:** lista das palavras com ✓ ou ↷. Tocar numa palavra troca o status (para corrigir erros do sensor). Botão Confirmar.
8. **Placar da partida** entre turnos, mostrando quem joga em seguida.
9. **Resultado da partida** e envio ao placar geral.

## Regras detalhadas

### Detecção por inclinação
- Na contagem 3-2-1, o ângulo atual vira a posição **neutra**.
- **Acerto:** a tela girou mais de ~45° para baixo em relação ao neutro.
- **Passa:** a tela girou mais de ~45° para cima.
- Depois de um gesto, o próximo só é aceito quando o tablet volta para perto do neutro (±20°). Assim, um movimento nunca conta duas vezes.
- Gestos no primeiro meio segundo de cada carta são ignorados.
- Se o sensor não estiver disponível ou a permissão for negada, o app muda para o modo Apoiado e avisa.
- Tela "Testar sensor" nas configurações, com os limites ajustáveis.

### Turnos
- **Equipes:** turnos alternados entre os times (A, B, A, B...). Dentro de cada time, quem adivinha segue um rodízio. Cada time joga o mesmo número de turnos: o tamanho do maior time multiplicado pelo número de voltas (no time menor, alguém repete).
- **Todos contra todos:** cada jogador adivinha uma vez por volta, na ordem da mesa.

### Cartas
- Os baralhos escolhidos são embaralhados juntos.
- Carta que já apareceu não volta na mesma noite enquanto houver cartas novas.
- Se as cartas novas acabarem, as puladas voltam embaralhadas. Se nem isso houver, o turno termina com o aviso "Baralho esgotado".
- A carta que estava na tela quando o tempo acabou não conta.

## Pontuação

- **Pontos de jogo:** +1 por acerto. Pular não custa nada (ou −1, se ativado).
- **Fim da partida:** ranking por pontos de jogo, de times ou de jogadores. Empate divide a colocação.
- **Pontos da noite:** tabela padrão do [placar geral](../../recursos/placar-geral/README.md). No modo equipes, todos os integrantes recebem os pontos do time.

## Configurações

| Opção | Valores | Padrão |
|---|---|---|
| Modo | Equipes / Todos contra todos | Equipes (com 4+ jogadores) |
| Controle | Na testa / Apoiado | Na testa |
| Tempo por turno | 30 / 60 / 90 / 120 s | 60 s |
| Voltas | 1 / 2 / 3 | 1 |
| Pulo custa ponto | Sim / Não | Não |
| Baralhos | seleção múltipla | Animais, Comidas e Objetos |

## Conteúdo

Um arquivo por baralho em `conteudo/quem-sou-eu/`:

```json
{
  "id": "animais",
  "nome": "Animais",
  "icone": "🐘",
  "publico": "livre",
  "cartas": ["Elefante", "Pinguim", "Tamanduá", "Capivara", "Polvo"]
}
```

- Sugestões para a primeira versão: Animais, Profissões, Comidas, Objetos da casa, Lugares, Esportes, Personagens, Famosos, Filmes e séries.
- Pelo menos 60 cartas por baralho: um turno de 60 s costuma consumir de 10 a 15.
- Palavras que a maioria do grupo conheça; nada que dependa de um detalhe obscuro.

## Casos especiais

- **App em segundo plano ou tela apagada no meio do turno:** pausa. Ao voltar, tela "Pausado" com Continuar, que retoma com nova contagem 3-2-1.
- **Tela girando sozinha:** o app fica em paisagem durante o turno; se o sistema não deixar travar, a tela de ajuda orienta a travar a rotação do tablet.
- **Encerrar turno antes do tempo:** botão discreto (segurar 1 s); vale o que já foi feito.
- **Carta ruim:** é só pular. No resumo, a opção "Não mostrar mais esta carta".

## Critérios de aceite

- [ ] A palavra é legível a 3 m e a fonte se ajusta para caber em até duas linhas.
- [ ] Inclinar para baixo registra acerto; para cima, passa; um movimento nunca conta duas vezes.
- [ ] Sons de acerto e de passa são diferentes e bem audíveis.
- [ ] O modo Apoiado funciona sem sensor.
- [ ] Nenhuma carta se repete na noite enquanto houver cartas novas.
- [ ] O resumo permite corrigir cada carta antes de confirmar.
- [ ] Pausa automática ao sair do app e tela acesa durante o turno.
- [ ] Resultado enviado ao placar geral com os pontos da noite corretos.

## Ideias para depois

- **Baralho da galera:** antes da partida, cada um digita palavras que só o grupo conhece (apelidos, histórias da turma).
- Gravar a reação de quem adivinha com a câmera — só com permissão clara e salvando apenas no aparelho.
- Bônus de tempo por sequência de acertos.
