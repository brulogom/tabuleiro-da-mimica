// Categorias da Roda das letras — amplas o bastante para ter palavras com a maioria das letras.
// Formato compacto: "Nome|f/m/d" (fácil, médio, difícil). Adultos: prefixo "A:".
window.CONTEUDO = window.CONTEUDO || {};
(function () {
  const DIF = { f: "facil", m: "medio", d: "dificil" };
  window.CONTEUDO.rodaDasLetras = [
    "Animais|f", "Comidas|f", "Frutas|f", "Nomes de pessoas|f", "Profissões|f", "Cidades|f", "Países|f", "Objetos da casa|f",
    "Cores|m", "Marcas|f", "Coisas vermelhas|m", "Partes do corpo|f", "Roupas e acessórios|f", "Bebidas|f", "Doces e sobremesas|f",
    "Esportes|f", "Brinquedos|f", "Verbos|f", "Adjetivos|m", "Coisas que se leva para a praia|m", "Coisas que tem na cozinha|f",
    "Coisas que tem no banheiro|m", "Coisas da escola|f", "Meios de transporte|m", "Instrumentos musicais|m", "Personagens de desenho|m",
    "Cantores e bandas|m", "Filmes|m", "Novelas e séries|m", "Jogadores de futebol|m", "Times de futebol|m", "Super-heróis e vilões|m",
    "Legumes e verduras|f", "Flores e plantas|m", "Insetos|m", "Aves|m", "Bichos do mar|m", "Coisas que voam|m", "Coisas redondas|m",
    "Coisas geladas|m", "Coisas quentes|m", "Coisas que fazem barulho|m", "Coisas que se compram no supermercado|f", "Coisas de festa|m",
    "Coisas que tem no quarto|f", "Coisas que tem no carro|m", "Coisas que cabem no bolso|m", "Coisas que tem em um hospital|m",
    "Coisas de acampamento|m", "Coisas de Natal|m", "Coisas do espaço|d", "Emoções e sentimentos|m", "Defeitos|m", "Qualidades|m",
    "Apelidos|m", "Nomes de cachorro|f", "Coisas que tem numa mochila|f", "Personagens de conto de fadas|m", "Capitais do mundo|d",
    "Estados e capitais do Brasil|m", "Rios, mares e oceanos|d", "Famosos brasileiros|m", "Artistas internacionais|m",
    "Palavras em inglês|d", "Palavras com acento|d", "Palavras que rimam com 'ão'|d", "Palavras com mais de 3 sílabas|d",
    "Remédios e coisas de farmácia|d", "Ferramentas|m", "Eletrodomésticos|m", "Aplicativos e sites|m", "Jogos e brincadeiras|m",
    "Danças e ritmos|d", "Materiais (madeira, vidro...)|d", "Coisas de praia|f", "Pratos típicos brasileiros|m", "Temperos e condimentos|d",
    "Lugares da cidade|f", "Móveis|m", "Coisas que se fazem no fim de semana|m", "Desculpas para chegar atrasado|d", "Coisas que dão medo|m",
    "Coisas que tem em um zoológico|f", "Coisas amarelas|m", "Coisas verdes|m", "Coisas que se leva numa viagem|m", "Doenças e sintomas|d",
    "Personagens bíblicos|d", "Planetas, estrelas e astros|d", "Coisas de salão de beleza|d", "Coisas que tem numa fazenda|m",
    "A:Bebidas alcoólicas|m", "A:Coisas de balada|m", "A:Desculpas para não ir ao trabalho|m", "A:Coisas que se fala no primeiro encontro|d",
  ].map((l) => {
    const adulto = l.startsWith("A:");
    const [nome, d] = l.replace(/^A:/, "").split("|");
    return { nome, dificuldade: DIF[d], publico: adulto ? "adulto" : "livre" };
  });
})();
