# Validação da jornada adaptativa ENEM — 07/09/2026

## Conclusão

O quiz pode orientar a primeira semana, mas a ligação ainda não está implementada. Há motores de priorização, registro de respostas, revisões e missões, porém não constituem ainda um ciclo pedagógico único validado de ponta a ponta. Esta análise é uma revisão do código e dos testes locais, não comprovação de eficácia pedagógica ou auditoria do acervo em produção.

## Achados confirmados no código

| Prioridade | Achado | Consequência | Referência |
|---|---|---|---|
| Alta | `enem_quiz_contacts` guarda contato/resultado sem vínculo com usuário; onboarding e provider não consultam essa tabela | O quiz não influencia o plano | `app/api/quiz/contact/route.ts`, `components/providers/rota-provider.tsx` |
| Alta | Onboarding inicia em PMMG e sempre abre diagnóstico de 10 questões | Jornada de quem veio do ENEM perde contexto e repete esforço | `components/onboarding-modal.tsx`, `lib/domain/adaptive-engine.ts` |
| Alta | Cliente e servidor calculam prioridades com fórmulas diferentes | Dashboard, domínio persistido e recomendações podem divergir | `lib/domain/adaptive-engine.ts`, `app/api/candidate/answer/route.ts` |
| Alta | Agenda usa a ordem dos dias selecionados, não ordena por data; horário fixo de 9h ignora período preferido | A próxima ação pode não ser a mais próxima no calendário | `recalculatePlan`, `getViewModel` |
| Alta | Última sessão sempre é fechamento; com apenas um dia disponível não há sessão de conteúdo | Plano inviável para esse perfil | `recalculatePlan` |
| Alta | Abrir novamente onboarding reinicializa alpha/beta sem limpar contadores de evidência | A estimativa pode ficar incoerente com o histórico | `applySelfAssessment` |
| Alta | Revisões persistidas não atualizam `RotaProvider.recordAnswer`; fila local não tem alternativas/identificador da questão | Aprendizado em revisões não fecha o ciclo do plano local; filas podem divergir | `app/app/revisoes/page.tsx` |
| Média | A ação de teoria cai no banco de questões; não há ligação da tarefa com material específico | Uma recomendação de teoria não garante entrega do conteúdo | `app/app/page.tsx:startNextAction` |
| Média | Banco carrega os últimos 100 itens e usa demonstração se houver menos de 10; simulado seleciona até 10 | Cobertura por tópico e disponibilidade de conteúdo exigem auditoria | `app/api/questions/route.ts`, `app/app/questoes/page.tsx` |
| Média | Missões são três metas fixas: sessões, 10 questões e fechamento | Há gamificação, mas não desafios semanais individualizados por dificuldade | `lib/domain/gamification-engine.ts` |
| Média | Pesos são heurísticos e relevância de prova no servidor é constante | Não equivalem a pesos oficiais de curso/instituição nem a TRI | `lib/domain/onboarding.ts`, `refreshRecommendations` |

## Fluxo proposto

1. Vincular a tentativa à conta autenticada mediante comprovação de posse (token de reivindicação ou e-mail verificado). Não usar somente o e-mail digitado num formulário público. Importação idempotente, sem duplicar acertos, erros ou XP, preservando perfil anterior.
2. Mapear cada uma das 12 questões ao tópico correto. Usar o quiz como evidência inicial de baixa confiança, não como domínio definitivo de uma área inteira. Redação permanece não avaliada.
3. Pré-selecionar ENEM para quem veio dessa jornada. Perguntar somente meta, disponibilidade e limitações ainda desconhecidas. Exibir os achados importados e permitir correção da meta.
4. Completar lacunas com diagnóstico curto e direcionado, em vez de repetir outro questionário genérico obrigatório.
5. Gerar primeira semana com sessões curtas, conteúdo realmente disponível, questões sobre dificuldades observadas, revisões e espaço para redação. Respeitar horas/dias/períodos e ordenar por data; nunca reservar o único dia somente para fechamento.
6. Consolidar respostas, domínio, recomendações e revisões numa fonte persistida. A IA explica e auxilia; regras auditáveis decidem agenda e seleção.
7. Recalibrar ao fim da semana por acertos em questões novas, retenção nas revisões, atividades concluídas e carga viável. Não considerar XP ou simples clique em concluir como prova de domínio.

## Regra operacional proposta para cada sessão

Revisões vencidas e lacunas prioritárias geram uma tarefa com objetivo, duração, explicação e itens concretos. Erro leva a feedback e revisão futura; novo teste usa questão equivalente, não apenas a repetição imediata da alternativa já revelada. Acerto isolado mantém baixa confiança. Vários acertos em itens distintos e em dias diferentes permitem espaçar revisões e avançar. Erros repetidos pedem conceito ou pré-requisito. Sem conteúdo validado, mostrar a lacuna e encaminhar para curadoria, sem inventar material disponível.

## Critérios de aceite antes de afirmar que o ciclo está validado

- Quiz importado exatamente uma vez, inclusive ao recarregar e entrar em outro dispositivo; tentativa de outra pessoa não é vinculada por e-mail não verificado.
- Perfil ENEM não recebe matérias policiais.
- Dois perfis com dificuldades diferentes recebem primeiras sessões diferentes, com motivo verificável.
- Zero erro, todos os erros e ausência de evidência geram ações distintas e sem falsa certeza.
- Um único dia disponível ainda contém estudo; soma de minutos cabe no orçamento; datas e período são respeitados.
- Mudança de disponibilidade e novo onboarding não apagam aprendizagem.
- Erro cria revisão única; resposta de revisão atualiza domínio e agenda; retry não duplica evidência.
- Tarefas abrem o tópico, as questões e o material propostos; conjuntos de diagnóstico, treino e simulado têm variedade e cobertura verificadas.
- Fluxo completo validado com conta de teste: quiz → autenticação → onboarding → primeira sessão → revisão → próxima semana.

## Verificação executada

`npm test -- lib/domain/adaptive-engine.test.ts lib/domain/onboarding.test.ts lib/domain/progress-engine.test.ts`: 12 testes passaram. Esses testes verificam regras já cobertas, mas não demonstram a integração quiz–onboarding, a entrega semanal ou eficácia pedagógica.

## Ordem de execução

1. Ligação segura do quiz à conta e onboarding ENEM.
2. Motor único de evidências e correções da agenda.
3. Sessões ligadas a acervo validado e revisões consistentes.
4. Desafios personalizados e fechamento semanal com validação ponta a ponta.


## Implementação local realizada após a auditoria

- Recuperação autenticada do quiz pelo e-mail confirmado; importação idempotente e preservação do histórico. O quiz não adiciona XP de estudo.
- Onboarding contextualizado em ENEM, sem repetir diagnóstico já importado.
- Prioridade calculada por função compartilhada entre cliente e API; estados locais e tabelas de evidências ainda são representações distintas, e não uma migração completa para estado exclusivamente servidor.
- Agenda ordenada, horário por período, orçamento semanal respeitado e estudo mesmo com um dia disponível.
- Seleção de questões oficiais por área, priorização do assunto solicitado e exclusão das 500 respostas mais recentes. Não é uma garantia de ineditismo vitalício.
- Resultado do erro mostra resposta marcada, gabarito, comentário cadastrado e assunto. Mentor recebe o contexto somente quando o estudante escolhe abrir a ajuda e enviar a pergunta.
- Revisões locais respondíveis; revisões persistidas alimentam o mesmo motor local de aprendizado. Migration `20260907190000_review_progress_guard.sql` exige acerto persistido no ciclo antes de avançar e protege retries.
- Missão de reforço da prioridade semanal e encaminhamento de redação à ferramenta correta.

Acervo verificado por consultas somente leitura: 2.553 questões oficiais ENEM publicadas/validadas. Filtros de disciplina retornaram Linguagens 725, Matemática 433, Humanas 630 e Natureza 549. Os demais registros usam outras classificações e não foram reclassificados automaticamente. A amostra de comentários oficiais continha somente gabarito e aviso de curadoria pendente; não equivale a resolução comentada validada.

Validação: suíte completa de 54 testes aprovada antes da adição do teste SQL; teste adicional da proteção de revisão também aprovado (55 no total), build e TypeScript aprovados. Não houve pagamento de teste, alteração remota no acervo, aplicação remota da nova migration nem publicação nesta etapa. Validação ponta a ponta autenticada e eficácia pedagógica ainda precisam ser acompanhadas após implantação.
