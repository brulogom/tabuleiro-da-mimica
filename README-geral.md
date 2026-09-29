# 🎉 Jogos de Festa (nome provisório)

App de jogos de festa para jogar em grupo, no mesmo lugar, com **um único tablet**. Sem internet, sem login e sem precisar do celular de ninguém: o tablet passa de mão em mão ou fica no centro da mesa.

## Primeira versão

| Jogo | Estilo | Jogadores | Especificação |
|---|---|---|---|
| Quem sou eu? | adivinhação em equipe | 2+ | [jogos/quem-sou-eu](jogos/quem-sou-eu/README.md) |
| Palavra proibida | adivinhação em equipe | 4+ | [jogos/palavra-proibida](jogos/palavra-proibida/README.md) |
| Roda das letras | rodada rápida com eliminação | 2–8 | [jogos/roda-das-letras](jogos/roda-das-letras/README.md) |
| Impostor | blefe, passa o tablet | 4–12 | [jogos/impostor](jogos/impostor/README.md) |
| Cidade Dorme | papéis secretos, app narrador | 5–16 | [jogos/cidade-dorme](jogos/cidade-dorme/README.md) |
| Telefone sem fio desenhado | desenho, passa o tablet | 4–12 | [jogos/telefone-sem-fio-desenhado](jogos/telefone-sem-fio-desenhado/README.md) |

| Recurso | Para quê | Especificação |
|---|---|---|
| Sorteador de dedos | decidir quem começa, dividir times, definir a ordem | [recursos/sorteador-de-dedos](recursos/sorteador-de-dedos/README.md) |
| Placar geral | somar os pontos da noite em todos os jogos | [recursos/placar-geral](recursos/placar-geral/README.md) |

## Estrutura do projeto

```
jogos-de-festa/
├── README.md          ← este arquivo: visão geral e componentes compartilhados
├── jogos/
│   ├── quem-sou-eu/
│   ├── palavra-proibida/
│   ├── roda-das-letras/
│   ├── impostor/
│   ├── cidade-dorme/
│   └── telefone-sem-fio-desenhado/
├── recursos/
│   ├── sorteador-de-dedos/
│   └── placar-geral/
└── conteudo/          ← baralhos, categorias e frases em JSON, uma pasta por jogo
```

## Fluxo geral

1. **Início:** Nova noite, ou Continuar noite se houver uma em andamento.
2. **Jogadores:** cadastro de quem vai jogar.
3. **Menu de jogos:** cartões grandes com nome, número de jogadores e duração.
4. **Configurar partida:** opções do jogo, todas com um padrão pronto. Dá para começar com um toque.
5. **Partida.**
6. **Resultado da partida:** pontos ganhos por cada um.
7. **Placar da noite** e volta ao menu.

O placar e o sorteador de dedos ficam sempre acessíveis por botões fixos no menu.

## Princípios de design

- **Paisagem.** As telas são pensadas para o tablet na horizontal. A Roda das letras e o sorteador de dedos, usados com o tablet deitado na mesa, funcionam em qualquer orientação.
- **Legível de longe.** A informação principal de cada tela (palavra, nome de quem joga, cronômetro) precisa ser lida a 2–3 metros.
- **Toques generosos.** Botões de jogo com pelo menos 72 px. Ações destrutivas (encerrar, excluir) pedem confirmação.
- **Um toque para começar.** Toda configuração tem um padrão sensato.
- **Som em tudo**, com botão de mudo sempre visível.
- **Nunca depender só de cor.** Cor sempre acompanhada de ícone, texto ou forma.
- **Tela sempre acesa** durante as partidas.
- **Pausa automática** quando o app vai para segundo plano.
- **Tudo salvo no aparelho.** Fechar o app sem querer não pode apagar a noite.
- **Filtro de público.** A noite tem o modo Família (só conteúdo livre) ou Adultos (tudo).

## Componentes compartilhados

### Jogadores e times
- Cadastro: nome (até 12 caracteres), cor (automática, editável) e emoji (opcional).
- **Ordem da mesa:** a lista pode ser reordenada arrastando, para refletir quem está sentado ao lado de quem. Os jogos em roda seguem essa ordem.
- Times montados à mão (arrastando), sorteados de forma equilibrada ou pelo sorteador de dedos.
- Dá para entrar e sair no meio da noite (regras no README do placar).

### Tela de privacidade (passa o tablet)
Usada no Impostor, na Cidade Dorme e no Telefone sem fio desenhado.

1. Tela neutra: "Passe o tablet para **ANA**", em letras grandes, com a cor e o emoji dela.
2. Ana toca em "Sou eu".
3. O conteúdo secreto aparece **só enquanto ela mantém o dedo** no botão "Segure para ver". Nas etapas em que é preciso interagir (votar, escrever, desenhar), fica visível até ela tocar em Pronto.
4. Ao soltar ou concluir, volta a tela neutra, já com o nome do próximo.

Regras:
- Todas as telas secretas de um mesmo jogo têm **o mesmo layout, as mesmas cores, o mesmo tamanho de texto e a mesma animação**. Ninguém pode descobrir um segredo olhando a tela de longe.
- Ao ir para segundo plano, o app esconde qualquer conteúdo secreto e volta à tela neutra.
- Botão "Ver minha carta de novo": escolhe o nome e repete a sequência acima.

### Cronômetro
- Grande, com anel ou barra de progresso e os segundos em número.
- Tique nos últimos 5 s e som de fim de tempo.
- Pausa manual e pausa automática em segundo plano.
- Usa a cor do time ou do jogador da vez.

### Conteúdo
- Arquivos JSON em `conteudo/<jogo>/`, no formato descrito no README de cada jogo.
- Todo baralho (ou item, nos jogos sem baralho) tem `"publico": "livre"` ou `"adulto"`.
- O que já saiu não se repete na mesma noite enquanto houver itens novos.
- Conteúdo 100% próprio, sem copiar cartas de jogos comerciais.

### Sons
Conjunto mínimo: toque, acerto, erro/buzina, tique-taque, fim de tempo, suspense, revelação e vitória. Volume próprio do app e botão de mudo.

### Fim de partida
Todo jogo termina do mesmo jeito: tela de **Resultado da partida** e chamada a `registrarPartida(...)`, cujo contrato está no [README do placar](recursos/placar-geral/README.md). Cada partida vale de 0 a 5 pontos da noite por jogador.

## Sugestão de tecnologia

É uma proposta, não uma exigência:

- **App web instalável (PWA)** em HTML, CSS e JavaScript ou TypeScript. Roda no navegador de qualquer tablet (iPad ou Android), pode ser adicionado à tela inicial e funciona offline com service worker.
- Recursos do navegador usados: Pointer Events (multitoque e caneta), Canvas (desenho), Web Audio (sons), sensores de orientação e movimento (Quem sou eu?), Screen Wake Lock (tela acesa) e IndexedDB ou localStorage (salvar a noite).
- No iPad, o acesso aos sensores de movimento exige permissão do usuário, pedida a partir de um toque, e o app precisa estar em HTTPS (o service worker também exige).
- Testar sempre no tablet de verdade: multitoque, sensores e teclado virtual se comportam de forma diferente no computador.
- Se um dia quiser publicar nas lojas, o mesmo código pode ser empacotado com o Capacitor.

## Ordem sugerida de construção

1. Base: jogadores, placar, cronômetro, sons e tela de privacidade.
2. Sorteador de dedos (valida o multitoque).
3. Impostor (valida a tela de privacidade).
4. Quem sou eu? e Palavra proibida (baralho + cronômetro).
5. Roda das letras.
6. Telefone sem fio desenhado (quadro de desenho).
7. Cidade Dorme, o mais complexo: narração, fases e papéis.

## Decisões em aberto

- **Público da primeira versão:** o app prevê os modos Família e Adultos; falta decidir se já nasce com conteúdo adulto.
- **Tecnologia:** a sugestão acima é uma proposta.
- **Números de jogo** (tempos, pontuações, quantidade de assassinos): são valores iniciais, para ajustar depois de testar com um grupo de verdade.
- **Nome do app.**
