# Mesada+ Família

Mesada, hábitos, escola e educação financeira para a família. Protótipo estático publicado no GitHub Pages.

https://cairesmachado-svg.github.io/Mesada-Plus/

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

## Regras padrão

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
