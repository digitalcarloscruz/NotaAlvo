export function quizMessage(correct: number) {
  if (!Number.isInteger(correct) || correct < 0 || correct > 12) throw new Error("Invalid quiz score");
  if (correct === 12) return {
    title: "Excelente desempenho. Qual será seu próximo desafio?",
    description: "Você acertou todos os itens desta amostra. Agora, amplie o treino: outras habilidades, questões com tempo marcado e redação também fazem parte da preparação.",
    next: "Use questões oficiais, simulados e revisões para ampliar seu repertório e acompanhar sua consistência. O plano considera suas respostas para orientar os próximos estudos.",
    cta: "Quero meu próximo desafio →",
  };
  if (correct >= 10) return {
    title: "Você foi muito bem. Agora, busque mais consistência.",
    description: "Seu desempenho nesta amostra foi alto. Revise os erros pontuais e avance para outras habilidades e situações de prova.",
    next: "Combine questões oficiais, simulados e prática de redação com revisões direcionadas ao que ainda precisa de atenção.",
    cta: "Quero avançar na minha preparação →",
  };
  if (correct >= 6) return {
    title: "Transforme seus acertos em uma preparação mais consistente.",
    description: "Você acertou parte importante deste desafio. As respostas incorretas ajudam a escolher os assuntos que merecem uma nova rodada de estudo.",
    next: "Organize a semana com questões oficiais, explicações e revisões. Seu histórico de respostas ajuda a orientar as próximas prioridades.",
    cta: "Quero estudar com mais direção →",
  };
  return {
    title: "Você tem um ponto de partida. Vamos organizar os próximos passos.",
    description: "Esta seleção é exigente. O resultado não define seu potencial: indica assuntos desta amostra que vale investigar e revisar, começando pelos fundamentos necessários.",
    next: "Use um plano de estudos, questões oficiais e revisões para trabalhar cada dificuldade e acompanhar sua evolução, uma sessão de cada vez.",
    cta: "Quero organizar minha revisão →",
  };
}
