# Mesada+ Família — protótipo demonstrativo

Portal responsivo de mesada e tarefas para testar, em família, o **Regulamento da Casa**.

## Acesso

Depois que o GitHub Pages estiver habilitado, o endereço previsto é:

https://cairesmachado-svg.github.io/Mesada-Plus/

## Funcionalidades do protótipo

- Mesada-base de R$ 100 por criança e mês.
- Ocorrências escolares em seis categorias, com descontos de R$ 2 a R$ 12, sujeitos a conferência de responsável.
- Limite de R$ 40 em descontos escolares por criança/mês.
- Possibilidade de recuperar parte de descontos leves após providência corretiva.
- Tarefas domésticas e bônus até R$ 30 por mês.
- Visão de painel, saldos projetados, fechamento mensal, gastos e cofrinhos.
- Perfis demonstrativos, com possibilidade de incluir terceiro perfil.

## Importante: não usar dados reais ainda

**Este site é somente uma demonstração.** Não há autenticação, backend, sincronização ou autorização segura. O seletor de papéis é apenas uma prévia da interface e NÃO controla acesso a dados.

Alterações são guardadas no `localStorage` do próprio navegador e podem ser perdidas. Não insira dados pessoais, nomes completos, comprovantes escolares, fotos, ocorrências reais ou valores de contas bancárias nesta versão.

O código é público no GitHub. Uma versão de uso real deverá usar autenticação de responsáveis, separação de famílias, regras de acesso, trilha de auditoria e armazenamento seguro, em conformidade com a legislação aplicável à privacidade infantil.

## Publicação via GitHub Pages

O repositório inclui o workflow `.github/workflows/deploy-pages.yml`. Ele publica automaticamente o conteúdo ao receber commits na branch `main`, após a ativação do GitHub Pages.

1. Abra **Settings → Pages** neste repositório.
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.
3. Abra **Actions** e aguarde ou execute manualmente o workflow **Deploy Mesada+ Família**.
4. Confirme a URL publicada nas configurações do Pages.

O arquivo `index.html` reúne CSS e JavaScript, sem dependências externas.

## Próximo marco

Antes de uso cotidiano por crianças: construir camada de autenticação, dados familiares isolados e backend com transações atômicas e regras versionadas.
