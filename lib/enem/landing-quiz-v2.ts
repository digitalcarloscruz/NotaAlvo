import type { QuizQuestion } from "./landing-quiz";

// Dificuldades editoriais, não parâmetros TRI. Resoluções da Nota Alvo; gabaritos oficiais.
export const challengeQuestions: QuizQuestion[] = [
  {
    "id": "enem-2023-regular-amarelo-9",
    "area": "Linguagens",
    "topic": "Inferência e circulação de informações",
    "topicId": "LING.INTERPRETACAO",
    "difficulty": "Média",
    "text": "Na Idade Média, as notícias se propagavam com surpreendente eficácia. Segundo uma emérita professora de Sorbonne, um cavalo era capaz de percorrer 30 quilômetros por dia, mas o tempo podia se acelerar dependendo do interesse da notícia. As ordens mendicantes tinham um papel importante na disseminação de informações, assim como os jograis, os peregrinos e os vagabundos, porque todos eles percorriam grandes distâncias. As cidades também tinham correios organizados e selos para lacrar mensagens e tentar certificar a veracidade das correspondências. Graças a tudo isso, a circulação de boatos era intensa e politicamente relevante. Um exemplo clássico de fake news da era medieval é a história do rei que desaparece na batalha e reaparece muito depois, idoso e transformado. Disponível em: www.elpais.com.br. Acesso em: 18 jun. 2018 (adaptado). A propagação sistemática de informações é um fenômeno recorrente na história e no desenvolvimento das sociedades. No texto, a eficácia dessa propagação está diretamente relacionada ao(à)",
    "options": [
      "velocidade de circulação das notícias.",
      "nível de letramento da população marginalizada.",
      "poder de censura por parte dos serviços públicos.",
      "legitimidade da voz dos representantes da nobreza.",
      "diversidade dos meios disponíveis em uma época histórica."
    ],
    "answer": 4,
    "explanation": "O texto enumera diferentes agentes e recursos: ordens mendicantes, viajantes, correios e selos. É essa diversidade que explica a eficácia da circulação. A velocidade é mencionada, mas não resume o conjunto de mecanismos apresentados.",
    "source": {
      "archiveItemId": "5a7f8093-44aa-4d04-a530-0d449779817c",
      "year": 2023,
      "day": 1,
      "number": 9,
      "application": "Aplicação regular",
      "booklet": "Amarelo",
      "url": "https://riep.inep.gov.br/items/75be0df5-ba4c-42fa-9bec-347f92130afb"
    }
  },
  {
    "id": "enem-2023-reaplicacao-amarelo-170",
    "area": "Matemática",
    "topic": "Funções afins e inequações",
    "topicId": "MAT.PROBLEMAS",
    "difficulty": "Média",
    "text": "Duas empresas do mercado de pequenos reparos domésticos determinam o valor de seus serviços a partir de um valor fixo acrescido de um valor cobrado por hora. A empresa X cobra R$ 60,00 de valor fixo mais R$ 18,00 por hora de serviço prestado. A empresa Y cobra R$ 24,00 de valor fixo e está definindo um novo valor a ser cobrado por hora. Sua estratégia de mercado prevê que, em relação à empresa X, o custo total do serviço deve ser menor ou igual para trabalhos de até duas horas de duração. Qual é o valor máximo, em real, que a empresa Y poderá cobrar por hora de serviço prestado a fim de atender à sua estratégia de mercado?",
    "options": [
      "18",
      "36",
      "48",
      "54",
      "78"
    ],
    "answer": 1,
    "explanation": "Se h é o tempo e p o preço por hora da empresa Y, precisamos de 24 + ph ≤ 60 + 18h. Para h > 0, p ≤ 18 + 36/h. Entre zero e duas horas, o limite mais restritivo ocorre em h = 2: p ≤ 36. Com p = 36, a diferença entre X e Y é 36 − 18h, não negativa nesse intervalo.",
    "source": {
      "archiveItemId": "a2b98f05-c108-4f8b-9641-521491233302",
      "year": 2023,
      "day": 2,
      "number": 170,
      "application": "Reaplicação/PPL",
      "booklet": "Amarelo",
      "url": "https://riep.inep.gov.br/items/75be0df5-ba4c-42fa-9bec-347f92130afb"
    }
  },
  {
    "id": "enem-2023-regular-amarelo-68",
    "area": "Ciências Humanas",
    "topic": "Agricultura urbana e uso do espaço",
    "topicId": "HUM.GEOGRAFIA",
    "difficulty": "Média",
    "text": "Os movimentos da agricultura urbana no Rio de Janeiro vêm crescendo nos últimos vinte anos, tanto por meio de reproduções de modelos de vida antigos, vinculados ao resgate dos próprios costumes, como — e cada vez mais — são revelados hábitos inventivos nos quais moradores urbanos de diferentes classes sociais, sem nenhuma referência anterior com o campo, passam a se dedicar a essas atividades. Ao possibilitar o acesso ao plantio e, consequentemente, à alimentação, permite-se uma nova relação com o que se come, reduzindo o percurso da cadeia produtiva e aproximando produtores de consumidores, pois ambos se confundem nas experiências de agricultura urbana. PORTILHO, M.; RODRIGUES, C. G. O.; FERNANDEZ, A. C. F. Cultivando relações no arranjo local da Penha: a mobilização de mulheres a partir das práticas de agricultura urbana na favela. Cidades, Comunidades e Territórios, n. 42, jun. 2021. A prática agrícola destacada no texto apresenta como vantagem no espaço urbano a",
    "options": [
      "ocupação de lugares ociosos.",
      "densificação da área central.",
      "valorização do mercado externo.",
      "priorização de insumos químicos.",
      "mecanização de técnicas de cultivo."
    ],
    "answer": 0,
    "explanation": "A agricultura urbana aproveita espaços disponíveis na cidade para produção de alimentos. O texto destaca a aproximação entre produção e consumo. Não propõe adensar o centro, exportar a produção, priorizar químicos ou mecanizar o cultivo.",
    "source": {
      "archiveItemId": "c031347b-5b1a-4c6b-930b-0bc0c9e5ee5c",
      "year": 2023,
      "day": 1,
      "number": 68,
      "application": "Aplicação regular",
      "booklet": "Amarelo",
      "url": "https://riep.inep.gov.br/items/75be0df5-ba4c-42fa-9bec-347f92130afb"
    }
  },
  {
    "id": "enem-2023-reaplicacao-amarelo-109",
    "area": "Ciências da Natureza",
    "topic": "Adrenalina e regulação da glicemia",
    "topicId": "NAT.BIOLOGIA",
    "difficulty": "Média",
    "text": "As anfetaminas são drogas sintéticas utilizadas como moderadores de apetite no tratamento de obesidade. Essas drogas atuam sobre receptores celulares estimulando a produção de adrenalina, um hormônio catabólico responsável por várias funções fisiológicas no organismo. Entretanto, a produção exagerada desse hormônio pode gerar mudanças fisiológicas indesejáveis e até perigosas para a saúde. A alteração fisiológica observada pelo uso indevido dessas drogas é o(a)",
    "options": [
      "diminuição da pressão arterial.",
      "diminuição da frequência cardíaca.",
      "aumento da contração dos brônquios.",
      "aumento das secreções gastrointestinais.",
      "aumento da concentração de glicose sanguínea."
    ],
    "answer": 4,
    "explanation": "A adrenalina mobiliza reservas energéticas, incluindo a degradação do glicogênio hepático e a liberação de glicose no sangue. Por isso, a alteração esperada é o aumento da glicemia. As demais alternativas invertem respostas típicas da ativação simpática, como aumento da frequência cardíaca e dilatação dos brônquios.",
    "source": {
      "archiveItemId": "38ab2e39-c7c4-41ad-904e-979ba99ec65a",
      "year": 2023,
      "day": 2,
      "number": 109,
      "application": "Reaplicação/PPL",
      "booklet": "Amarelo",
      "url": "https://riep.inep.gov.br/items/75be0df5-ba4c-42fa-9bec-347f92130afb"
    }
  },
  {
    "id": "enem-2023-regular-amarelo-19",
    "area": "Linguagens",
    "topic": "Relações entre repertórios culturais",
    "topicId": "LING.INTERPRETACAO",
    "difficulty": "Difícil",
    "text": "O sol começa a descer por trás da vegetação da Ilha da Restinga, na outra margem do rio Paraíba, colorindo o céu de amarelo, laranja e lilás. Então se ouvem as primeiras notas do Bolero, do compositor francês Maurice Ravel, executadas pelo saxofonista Jurandy. É assim o pôr do sol da praia do Jacaré, em Cabedelo (Grande João Pessoa). Depois do Bolero, Jurandy toca Asa branca, de Luiz Gonzaga, e Meu sublime torrão, de Genival Macedo, espécie de hino não oficial da Paraíba. PINHEIRO, A. Sol se põe embalado pelo Bolero de Ravel. Disponível em: http://tools.folha.com.br. Acesso em: 16 set. 2012 (adaptado). A interpretação musical de Jurandy do Sax, codinome de José Jurandy Félix, apresenta um repertório caracterizado pela",
    "options": [
      "inter-relação de referenciais estéticos aparentemente distanciados.",
      "valorização de músicas que revelam mensagens de serenidade.",
      "consagração do repertório erudito como cultura dominante.",
      "iniciativa de estímulo à vocação turística da cidade.",
      "divisão hierárquica entre gêneros e estilos musicais."
    ],
    "answer": 0,
    "explanation": "O repertório aproxima o Bolero de Ravel, ligado à tradição erudita europeia, de canções brasileiras e regionais. Isso relaciona referências estéticas distintas. O texto não estabelece uma hierarquia entre elas nem apresenta a serenidade ou o turismo como critério central do repertório.",
    "source": {
      "archiveItemId": "9a0da8cf-f4a8-411c-ba9b-6d0d69be54d5",
      "year": 2023,
      "day": 1,
      "number": 19,
      "application": "Aplicação regular",
      "booklet": "Amarelo",
      "url": "https://riep.inep.gov.br/items/75be0df5-ba4c-42fa-9bec-347f92130afb"
    }
  },
  {
    "id": "enem-2023-reaplicacao-amarelo-159",
    "area": "Matemática",
    "topic": "Razões e interpretação de modelos",
    "topicId": "MAT.PROBLEMAS",
    "difficulty": "Difícil",
    "text": "Estudantes de psicologia experimental estão analisando um modelo matemático que foi desenvolvido a partir de um experimento com pombos. Nesse experimento, um alimento considerado como uma recompensa reforçadora era fornecido em quantidades (Q) para as aves, com a possibilidade de atraso no tempo de entrega. O modelo matemático que relaciona os valores reforçadores V1 e V2 de duas recompensas em função de suas respectivas quantidades Q1 e Q2 e de seus respectivos tempos de atraso T1 e T2 na disponibilização de cada uma delas é:\nV₁/V₂ = (Q₁/Q₂) × (T₂/T₁).\n\nAo analisarem o caso em que a quantidade Q1 é o dobro da quantidade Q 2, cinco estudantes fizeram as seguintes afirmações sobre em que condição o valor V1 será maior que o valor V2:\n• estudante 1: sempre, pois Q1 é o dobro de Q2;\n• estudante 2: apenas quando a razão entre T2 e T1 for maior que 0,5;\n• estudante 3: apenas quando a razão entre T2 e T1 for menor que 0,5;\n• estudante 4: apenas quando T1 for igual a T2;\n• estudante 5: apenas quando a razão entre T2 e T1 for maior que 0,5 e menor que 1. Qual estudante fez a afirmação correta?",
    "options": [
      "1",
      "2",
      "3",
      "4",
      "5"
    ],
    "answer": 1,
    "explanation": "Como Q₁/Q₂ = 2, temos V₁/V₂ = 2 × (T₂/T₁). Para V₁ ser maior que V₂, essa razão precisa superar 1: T₂/T₁ > 0,5. Essa é a afirmação do estudante 2. Ter uma quantidade maior, isoladamente, não basta, pois o atraso também entra no modelo.",
    "source": {
      "archiveItemId": "931d1d1e-a0be-4246-9d23-b8142eea8430",
      "year": 2023,
      "day": 2,
      "number": 159,
      "application": "Reaplicação/PPL",
      "booklet": "Amarelo",
      "url": "https://riep.inep.gov.br/items/75be0df5-ba4c-42fa-9bec-347f92130afb"
    }
  },
  {
    "id": "enem-2023-regular-amarelo-72",
    "area": "Ciências Humanas",
    "topic": "Declaração Balfour e conflitos territoriais",
    "topicId": "HUM.HISTORIA",
    "difficulty": "Difícil",
    "text": "Escrito durante a Primeira Guerra Mundial, o seguinte trecho faz parte da carta enviada pelo secretário do exterior britânico, Sir Arthur James Balfour, ao banqueiro Lord Rotschild, presidente da Liga Sionista, em 2 de novembro de 1917, a carta ficou conhecida como Declaração Balfour: “O governo de Sua Majestade vê com aprovação o estabelecimento na Palestina de um lar nacional para o povo judeu, e fará todos os esforços para facilitar tal objetivo. Nada será feito que possa prejudicar os direitos civis e religiosos das comunidades não judaicas na Palestina.” GATTAZ, A. A Guerra da Palestina. São Paulo: Usina do Livro, 2002 (adaptado). A análise do resultado do processo em questão revela que o governo inglês foi incapaz de garantir seu objetivo de",
    "options": [
      "promover o bem-estar social.",
      "negociar o apoio muçulmano.",
      "mediar os conflitos territoriais.",
      "estimular a cooperação regional.",
      "combater os governos autocráticos."
    ],
    "answer": 2,
    "explanation": "A declaração combinava apoio a um lar nacional judeu na Palestina com a promessa de preservar direitos das comunidades não judaicas. A persistência das disputas territoriais evidencia a incapacidade britânica de mediar esse conflito. A pergunta trata desse objetivo específico, e não de um programa genérico de bem-estar ou de combate a governos autocráticos.",
    "source": {
      "archiveItemId": "04b14333-0eed-443f-9445-300ba34a1a8a",
      "year": 2023,
      "day": 1,
      "number": 72,
      "application": "Aplicação regular",
      "booklet": "Amarelo",
      "url": "https://riep.inep.gov.br/items/75be0df5-ba4c-42fa-9bec-347f92130afb"
    }
  },
  {
    "id": "enem-2023-reaplicacao-amarelo-96",
    "area": "Ciências da Natureza",
    "topic": "Reações químicas e reaproveitamento de NO",
    "topicId": "NAT.QUIMICA",
    "difficulty": "Difícil",
    "text": "Ácido nítrico é um importante reagente usado no preparo de nitrato de amônio, NH4NO3, um fertilizante nitrogenado. Industrialmente, o ácido nítrico é obtido a partir da reação da amônia com gás oxigênio, um processo que ocorre em três etapas, todas exotérmicas. \n\nEtapa 1: 4 NH3 (g) + 5 O2 (g) → 4 NO (g) + 6 H2O (l) \n\nEtapa 2: 2 NO (g) + O2 (g) → 2 NO2 (g) \n\nEtapa 3: 3 NO2 (g) + H2O (l) → 2 HNO3 (aq) + NO (g) \n\nNa primeira etapa, forma-se NO, o qual reage com mais oxigênio formando NO2, um óxido ácido, que reage com a água formando HNO3 e NO. O composto NO é, portanto, um subproduto da reação. É importante o seu reaproveitamento, senão ele pode ser liberado para o ambiente, onde reagirá com o oxigênio, formando NO2. ATKINS, P.; JONES, L. Princípios de química: questionando a vida moderna e o meio ambiente. Porto Alegre: Bookman, 2006 (adaptado). O procedimento que permite diminuir a quantidade formada do subproduto NO é aumentar a",
    "options": [
      "pressão de oxigênio, na etapa 1.",
      "concentração de NO2, na etapa 3.",
      "quantidade de amônia, na etapa 1.",
      "quantidade de oxigênio, na etapa 2.",
      "temperatura dos reagentes, na etapa 1."
    ],
    "answer": 3,
    "explanation": "Na etapa 2, o NO é reagente: 2 NO + O₂ → 2 NO₂. Aumentar a quantidade de oxigênio nessa etapa favorece o consumo do NO e seu reaproveitamento. Aumentar a produção na etapa 1 ou alimentar a etapa 3 não resolve diretamente a remoção desse subproduto.",
    "source": {
      "archiveItemId": "a8377975-0a55-4b10-86cf-f3bc74bda191",
      "year": 2023,
      "day": 2,
      "number": 96,
      "application": "Reaplicação/PPL",
      "booklet": "Amarelo",
      "url": "https://riep.inep.gov.br/items/75be0df5-ba4c-42fa-9bec-347f92130afb"
    }
  },
  {
    "id": "enem-2023-regular-amarelo-15",
    "area": "Linguagens",
    "topic": "Metáfora e construção da narrativa",
    "topicId": "LING.INTERPRETACAO",
    "difficulty": "Muito difícil",
    "text": "Passado muito tempo, resolvi tentar falar, porque estava sozinha me embrenhando na mesma vereda que Donana costumava entrar. Ainda recordo da palavra que escolhi: arado. Me deleitava vendo meu pai conduzindo o arado velho da fazenda carregado pelo boi, rasgando a terra para depois lançar grãos de arroz em torrões marrons e vermelhos revolvidos. Gostava do som redondo, fácil e ruidoso que tinha ao ser enunciado. “Vou trabalhar no arado.” “Vou arar a terra.” “Seria bom ter um arado novo, esse arado tá troncho e velho.” O som que deixou minha boca era uma aberração, uma desordem, como se no lugar do pedaço perdido da língua tivesse um ovo quente. Era um arado torto, deformado, que penetrava a terra de tal forma a deixá-la infértil, destruída, dilacerada. VIEIRA JR., I. Torto arado. São Paulo: Todavia, 2019. Com a perda de parte da língua na infância, a narradora tenta voltar a falar. Essa tentativa revela uma experiência que",
    "options": [
      "reflete o olhar do pai sobre as etapas do plantio.",
      "metaforiza a linguagem como ferramenta de lavoura.",
      "explicita, na busca pela palavra, o medo da solidão.",
      "confirma a frustração da narradora com relação à terra.",
      "sugere, na ausência da linguagem, a estagnação do tempo."
    ],
    "answer": 1,
    "explanation": "A narradora aproxima o ato de falar do ato de arar. O arado que rasga a terra funciona como imagem da linguagem, e sua deformação representa a dificuldade de articular a palavra após a lesão. O eixo da passagem é essa metáfora, e não uma frustração literal com a terra ou a interrupção do tempo.",
    "source": {
      "archiveItemId": "1141efbf-5e88-47dd-a38c-9ec7eb302597",
      "year": 2023,
      "day": 1,
      "number": 15,
      "application": "Aplicação regular",
      "booklet": "Amarelo",
      "url": "https://riep.inep.gov.br/items/75be0df5-ba4c-42fa-9bec-347f92130afb"
    }
  },
  {
    "id": "enem-2023-reaplicacao-amarelo-177",
    "area": "Matemática",
    "topic": "Probabilidade e análise combinatória",
    "topicId": "MAT.PROBLEMAS",
    "difficulty": "Muito difícil",
    "text": "Um funcionário de uma loja de computadores misturou, por descuido, três computadores defeituosos com sete computadores perfeitos que estavam no estoque. Uma pequena empresa fez a compra de cinco computadores nessa loja, escolhendo-os aleatoriamente dentre os dez que estavam no estoque. Qual é a probabilidade de essa empresa ter levado, em sua compra, todos os três computadores defeituosos?",
    "options": [
      "1/72",
      "1/12",
      "1/4",
      "3/10",
      "3/7"
    ],
    "answer": 1,
    "explanation": "Existem C(10,5) = 252 conjuntos possíveis de cinco computadores. Para levar os três defeituosos, é preciso escolher esses três e mais dois dos sete perfeitos: C(3,3) × C(7,2) = 21 conjuntos. A probabilidade é 21/252 = 1/12. A fração 3/10 corresponde a um único sorteio, não ao evento pedido.",
    "source": {
      "archiveItemId": "cc941378-9825-4222-a83a-4f2016820e2d",
      "year": 2023,
      "day": 2,
      "number": 177,
      "application": "Reaplicação/PPL",
      "booklet": "Amarelo",
      "url": "https://riep.inep.gov.br/items/75be0df5-ba4c-42fa-9bec-347f92130afb"
    }
  },
  {
    "id": "enem-2023-regular-amarelo-75",
    "area": "Ciências Humanas",
    "topic": "Dualismo cartesiano e experiência corporal",
    "topicId": "HUM.FILOSOFIA_SOCIOLOGIA",
    "difficulty": "Muito difícil",
    "text": "Eu poderia concluir que a raiva é um pensamento, que estar com raiva é pensar que alguém é detestável, e que esse pensamento, como todos os outros — assim como Descartes o mostrou —, não poderia residir em nenhum fragmento de matéria. A raiva seria, portanto, espírito. Porém, quando me volto para minha própria experiência da raiva, devo confessar que ela não estava fora do meu corpo, mas inexplicavelmente nele. MERLEAU-PONTY, M. Quinta conversa: o homem visto de fora. São Paulo: Martins Fontes, 1948 (adaptado). No que se refere ao problema do corpo, a filosofia cartesiana apresenta-se como contraponto ao entendimento expresso no texto por",
    "options": [
      "apresentar uma visão dualista.",
      "confirmar uma tese naturalista.",
      "demonstrar uma premissa realista.",
      "sustentar um argumento idealista.",
      "defender uma posição intencionalista."
    ],
    "answer": 0,
    "explanation": "Descartes distingue a substância pensante da substância extensa: mente e corpo. Essa visão dualista contrasta com a experiência descrita por Merleau-Ponty, em que a raiva é vivida no próprio corpo. A questão pede a posição cartesiana usada como contraponto, não a posição do autor do trecho.",
    "source": {
      "archiveItemId": "3d7d9ff9-27cd-4475-bfaf-eb6f8a6373db",
      "year": 2023,
      "day": 1,
      "number": 75,
      "application": "Aplicação regular",
      "booklet": "Amarelo",
      "url": "https://riep.inep.gov.br/items/75be0df5-ba4c-42fa-9bec-347f92130afb"
    }
  },
  {
    "id": "enem-2023-reaplicacao-amarelo-130",
    "area": "Ciências da Natureza",
    "topic": "Calorimetria, potência e rendimento",
    "topicId": "NAT.FISICA",
    "difficulty": "Muito difícil",
    "text": "Um fabricante de eletrodomésticos desenvolveu um compartimento refrigerador inovador que consegue resfriar, em apenas 7 minutos, duas latas de refrigerante (350 mL cada), com densidade igual a 1,0 g/mL. A refrigeração do líquido consome 21% da potência do sistema quando o refrigerante tem sua temperatura diminuída em 15 °C. Considere o calor específico do refrigerante igual a 1,0 cal/(g °C) e 1 cal = 4,2 J. A potência total, em watt, desse dispositivo refrigerador é, aproximadamente,",
    "options": [
      "105.",
      "120.",
      "315.",
      "500.",
      "1 500."
    ],
    "answer": 3,
    "explanation": "As duas latas contêm 700 g de líquido. O calor retirado é Q = mcΔT = 700 × 1 × 15 = 10 500 cal = 44 100 J. Em 7 minutos, ou 420 s, a potência usada no líquido é 44 100/420 = 105 W. Como isso equivale a 21% do total, P = 105/0,21 = 500 W. Parar em 105 W ignora o rendimento informado.",
    "source": {
      "archiveItemId": "aa19a605-d1f8-4128-ab2c-177742adb205",
      "year": 2023,
      "day": 2,
      "number": 130,
      "application": "Reaplicação/PPL",
      "booklet": "Amarelo",
      "url": "https://riep.inep.gov.br/items/75be0df5-ba4c-42fa-9bec-347f92130afb"
    }
  }
];
