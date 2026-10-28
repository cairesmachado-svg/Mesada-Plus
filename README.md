# Mesada+ Família

Mesada, hábitos, escola e educação financeira da família.

### 👉 [Abrir o app: cairesmachado-svg.github.io/Mesada-Plus](https://cairesmachado-svg.github.io/Mesada-Plus/)

No celular, abra o link e use **Adicionar à tela inicial** para instalar como app.

## O que o app faz

- **Mesada-base garantida.** Ocorrências escolares nunca descontam da base. Só ajustam o bônus.
- **Bônus de hábitos.** Estudo ou leitura, mochila, cama, quarto e tarefa extra, em ciclos semanais. O estudo é o hábito que mais vale.
- **Bônus escolar.** Nota acima de 90% (+10 pts), de 95% (+15 pts), 100% (+20 pts), melhora de 10 pontos na mesma disciplina (+8 pts) e ocorrência positiva (+10 pts).
- **Ocorrências negativas.** A primeira do mês vira conversa. Da segunda em diante, nível × 5 pts saem só do bônus. Níveis 1 a 3 podem recuperar 50%.
- **Três cofrinhos.** Gastar, Poupar (metas com barra de progresso) e Doar. A mesada se divide sozinha no fechamento do mês.
- **Juros do pai.** Rendimento mensal configurável sobre o que está guardado nas metas.
- **Jogo.** XP, dez níveis com nomes por idade, sequência de dias com coringa semanal, doze conquistas e confete.
- **Meta da família.** Os dias de estudo de todas somam para uma recompensa coletiva. Não há ranking entre irmãs.
- **Aba Lançar.** Coisa boa, pra conversar ou nota em poucos toques. Igor e Luciana lançam valendo. Alice e Letícia mandam nota e coisa boa para aprovação.
- **Família.** Alice (14) e Letícia (12), com Igor e Luciana como responsáveis. Cada lançamento guarda quem fez.
- **E-mails da escola.** Um Google Apps Script lê o Gmail todo dia, entende os avisos do Galois e do ClassApp e prepara notas e ocorrências para aprovação. Ver `apps-script/LEIAME.md`.
- **PIN do responsável, backup em JSON e instalação na tela inicial do celular.**

## Missões com recompensa extra

A aba **Missões** oferece três desafios por período (aprender, realizar e cooperar), com doze propostas distribuídas pelos quatro ciclos do mês. Os temas incluem orçamento, comparação de preços, pensamento crítico, criatividade e colaboração. Os prazos seguem os ciclos 1–7, 8–14, 15–21 e 22–fim do mês.

- Cada filha descreve a resposta ou realização e envia para revisão dos pais no mesmo navegador.
- Os pais aprovam ou dão uma dica para uma nova tentativa dentro do prazo. Não há correção automática nem penalidade por errar.
- Recompensas padrão: R$ 2 por desafio de aprendizado; R$ 5 por realização; R$ 5 para cada filha em missão cooperativa.
- O teto inicial é R$ 20 por filha/mês e pode ser ajustado em **Regras**. Considera o mês da aprovação. Se o valor exceder o teto, a recompensa inteira fica pendente, sem crédito parcial.
- Na missão cooperativa, as duas enviam relatos. A aprovação só credita quando ambas estiverem pendentes e houver orçamento para as duas.
- O extra entra imediatamente nos cofrinhos, seguindo a divisão configurada, e aparece no extrato. Ele não aumenta o valor a pagar no fechamento da mesada; assim não é creditado de novo. Não realiza transferência bancária.
- Cada missão tem uma recompensa por filha. O histórico e o backup preservam respostas, revisões e aprovações.
- Missões são opcionais e distintas dos hábitos já remunerados; os pais verificam que a mesma realização não foi usada para pedir dois pagamentos.
- O armazenamento continua local. Não há sincronização entre celulares.

## Regras padrão

### Conquistas e liberação em quatro parcelas

- O espaço das filhas começa com **Minha semana** e **Contar coisa boa**. Também aceita ajuda em casa, combinados, cuidado com outras pessoas, iniciativas e outras conquistas.
- Os pais podem deixar uma mensagem de reconhecimento em cada boa atitude confirmada. As filhas veem a mensagem no histórico.
- A base mensal pode ser liberada em quatro parcelas, nos dias **7, 14, 21 e último dia do mês**. Não equivale a pagar a cada sete dias durante todo o ano; o último período é maior nos meses longos.
- Para R$ 200 por filha, abra **Regras**, use **Preencher base de R$ 200** e salve. O botão apenas preenche o formulário. Valores e registros existentes são preservados; bases individuais continuam tendo precedência.
- A primeira parcela fixa a base daquele mês. Alterações posteriores da base não mudam parcelas já combinadas; aplicam-se aos meses sem liberação.
- Cada liberação vai para os cofrinhos conforme a divisão da filha. O fechamento credita **somente o restante**, incluindo o bônus líquido. Não há transferência bancária.
- Meses fechados em versões anteriores continuam fechados, sem permitir parcelas extras.
- O painel diferencia valor previsto e saldo disponível. Na tela dos pais, o total mensal é identificado como soma das duas.

**Limite atual:** não há sincronização entre aparelhos. “Registrar para meus pais” salva neste navegador; a revisão precisa ocorrer aqui. Antes de ativar uso em celulares separados, é necessário configurar autenticação e armazenamento privado com permissões por integrante da família. O PIN local não substitui essa infraestrutura.

| Parâmetro | Valor |
|---|---|
| Mesada-base | R$ 100 para Alice e R$ 100 para Letícia |
| 1 ponto | R$ 0,10 |
| Teto de hábitos | 30% da base (R$ 30) |
| Teto escolar | 12% da base (R$ 12) |
| Semana completa de hábitos | 75 pts (R$ 7,50). Quatro semanas = teto de hábitos |
| Juros do pai | 2% ao mês sobre as metas |
| Divisão automática | 20% Poupar, 10% Doar, resto Gastar (ajustável por filha) |

Todos os valores são editáveis em **Regras**. As regras ficam concentradas em `js/rules.js`.

O dinheiro tem teto. O XP não tem. Depois de atingir o teto, o esforço continua rendendo nível e conquistas.

## Base de evidências

- Fryer (2011), *Quarterly Journal of Economics*: incentivos por insumos (ler, estudar) funcionaram melhor que incentivos por notas.
- Levitt, List, Neckermann e Sadoff (2016), *American Economic Journal: Economic Policy*: recompensas atrasadas perdem efeito. Por isso o bônus é aprovado na semana.
- Deci, Koestner e Ryan (1999), *Psychological Bulletin*: recompensas tangíveis esperadas podem reduzir a motivação intrínseca. Feedback verbal informativo ajuda. Por isso os bônus são pequenos e o app sugere elogio específico.
- Sailer e Homner (2020), *Educational Psychology Review*: gamificação tem efeitos pequenos e positivos. Narrativa e cooperação pesam mais que pontos soltos.

## Privacidade

- O site e o código são públicos. Não registre nomes completos, escola, turma ou fotos.
- Os dados ficam no `localStorage` de um navegador. Exporte o backup com frequência.
- O PIN evita toques acidentais num aparelho compartilhado. Não é login.
- URL e token do Apps Script ficam só no navegador e não entram no backup.

## Estrutura

```
index.html            página
css/app.css           estilos
js/rules.js           regras e cálculos (sem DOM)
js/app.js             interface
apps-script/          rotina dos e-mails da escola (Galois e ClassApp)
tests/                testes das regras
```

## Testes

```
node --test tests/*.test.js
```

## Publicação

O workflow `.github/workflows/deploy-pages.yml` publica a branch `main` no GitHub Pages a cada commit.

## Próximo marco

Para uso real por várias famílias: autenticação, dados isolados por família e backend com transações atômicas.

## Conquista especial: livro finalizado

Em **Conquistas**, cada filha pode registrar título, autor e data de conclusão de um livro. Após confirmação de Igor ou Luciana, são liberados **R$ 50 por livro**, seguindo a divisão dos cofrinhos. Esta recompensa não está sujeita ao teto de R$ 20 das missões e não é paga novamente no fechamento mensal. O mesmo título/autor só pode receber uma recompensa por filha. A conquista “Livro finalizado” é desbloqueada após a primeira confirmação.

### Evidências da leitura

O registro de livro exige três respostas livres: resumo do conteúdo, passagem ou ideia marcante e opinião/aprendizado pessoal. Cada campo exige pelo menos três linhas não vazias, separadas com Enter, independentemente da largura da tela. Os pais podem expandir “Ler evidências da leitura” antes da confirmação. Livros pendentes antigos podem ter as evidências completadas; pagamentos já confirmados são preservados. A validação verifica o preenchimento, não comprova sozinha a leitura: a confirmação continua com os responsáveis.
