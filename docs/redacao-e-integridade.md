# Redação e integridade das questões

## Entrega

- Dez capítulos autorais com exemplos, exercícios, autoavaliação e mapa mental aplicado.
- Doze famílias de conectivos com exemplos de uso.
- Biblioteca com 24 referências, busca e filtro por área. Frases apresentadas como paráfrases, não citações literais.
- 49 temas históricos catalogados: todas as edições regulares entre 1998 e 2025 e aplicações especiais identificadas. Links dos cadernos regulares extraídos de `INDICE_E_FONTES.csv`; fontes complementares indicadas em cada registro. O tema de 2008 é um recorte resumido, identificado como tal.
- Doze hipóteses editoriais de treino, tema personalizado e transferência do tema para o editor.
- Radar semanal com pesquisa Perplexity, fontes dos últimos sete dias e conexão com o histórico. Ordem de relevância pedagógica, sem percentuais de previsão.
- Seleção imediata da alternativa, bloqueio de envio duplicado, indicação de envio e recuperação em caso de falha. A correção só aparece após confirmação do servidor.

## Ativação no ambiente hospedado

Aplicar, na ordem, as migrações:

1. `supabase/migrations/20260913120000_essay_radar.sql`
2. `supabase/migrations/20260913123000_question_context_guard.sql`

Configurar `PERPLEXITY_API_KEY`, opcionalmente `PERPLEXITY_MODEL` (padrão `sonar`), e `CRON_SECRET` no servidor. O radar também usa as credenciais Supabase server-side existentes. Nenhuma chave é enviada ao navegador.

O agendamento em `vercel.json` chama `/api/cron/essay-radar` às segundas-feiras, 09:00 UTC (06:00 em Brasília). A rota exige `Authorization: Bearer <CRON_SECRET>`. O botão do aluno também pode produzir a edição caso ela ainda não exista; a autenticação é obrigatória. Uma concessão atômica no banco impede gerações simultâneas, limita tentativas a três por semana e impõe cinco minutos entre novas tentativas. Edições concluídas são reutilizadas. Após três falhas, o operador pode corrigir a configuração e zerar `attempts` da semana que ainda esteja sem `payload`.

Sem configuração, migração ou fontes recentes suficientes, o radar exibe indisponibilidade e mantém os temas editoriais claramente identificados. A ausência de uma edição não é preenchida com notícias inventadas.

## Reprocessamento do acervo

O parser v2 preserva quebras de linha, remove marcadores internos de página, recupera passagens com cabeçalhos explícitos compartilhados entre questões e separa essas passagens da alternativa anterior. Conteúdo visual, sinais de texto ausente e caracteres de controle são encaminhados à revisão. Trata-se de uma triagem estrutural: não substitui conferência dos PDFs nem OCR de imagens.

Após a migração, o pipeline existente pode ser executado no ambiente autorizado:

```sh
npm run enem:prepare
npm run enem:import
npm run enem:promote
```

A importação retira da seleção validada os itens automáticos reclassificados como incompletos. A promoção identifica questões existentes pelo item de origem, evitando duplicar IDs quando o texto muda. Textos recuperados só são atualizados automaticamente se as alternativas (normalizadas por espaço) e o índice do gabarito forem iguais aos anteriores. Alterações nas alternativas exigem curadoria. Respostas dos alunos não são apagadas.

A migração também coloca em revisão itens automáticos já publicados com sinais identificáveis de perda de contexto ou de codificação. Nenhuma alteração é aplicada a registros de curadoria humana apenas por essa heurística.

## Verificação local

O reprocessamento local de 88 documentos gerou 3.182 itens: 2.201 estruturalmente prontos e 981 para revisão. Foram reconhecidos 48 itens com contexto compartilhado; os sinais de risco incluem 589 referências visuais, 364 itens com caracteres corrompidos e dez referências curtas a contexto ausente (categorias podem se sobrepor). Isso não representa uma auditoria do banco de produção e não garante cobertura de todas as questões dos PDFs: arquivos antigos podem exigir OCR ou extração por layout.

Testes automatizados cobrem o parser, a quarentena SQL, o bloqueio semanal do radar, a recência e procedência das URLs, navegação de estudo, filtros, transferência de tema, comportamento em falha de rede e largura de tela em celular/desktop. A integração paga com Perplexity não é chamada pelos testes.
