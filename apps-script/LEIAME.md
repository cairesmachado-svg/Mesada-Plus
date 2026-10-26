# Rotina do ClassApp no Gmail

O script `classapp.gs` roda na sua conta Google. Todo dia, às 19h, ele procura e-mails do ClassApp, anota notas e ocorrências numa planilha privada e manda um resumo para você. Nada vira ponto sem a sua aprovação.

## Como funciona

1. O script lê os e-mails do ClassApp dos últimos 7 dias.
2. Cada aviso vira uma linha na planilha com status `PENDENTE`.
3. Você recebe um e-mail com o resumo.
4. Você confere e marca `APROVADO` ou `DESCARTADO`.
5. No app, em **Escola › ClassApp**, toque em **Importar aprovados**.

Notas entram confirmadas. Ocorrências negativas entram pendentes para você escolher o nível.

## Instalação (uns 10 minutos)

1. Abra [script.google.com](https://script.google.com) com a conta que recebe os e-mails da escola.
2. Clique em **Novo projeto**. Dê o nome `Mesada+ ClassApp`.
3. Apague o conteúdo de `Código.gs` e cole todo o `classapp.gs`.
4. Salve. No menu de funções, escolha `diagnosticar` e clique em **Executar**. Autorize o acesso ao Gmail e às Planilhas.
5. Abra o **Registro de execução**. Confira o remetente dos e-mails da escola. Se não terminar em `classapp.com.br`, troque o valor de `remetente` no início do script.
6. Escolha `instalar` e clique em **Executar**. O registro mostra o link da planilha e o **token**. Guarde o token.
7. Vá em **Configurações do projeto › Propriedades do script** e edite `ALIASES`. Use o primeiro nome de cada filha como aparece nos e-mails e o apelido do app:

   ```json
   {"Nome1": "F14", "Nome2": "F12", "Nome3": "F09"}
   ```

8. Clique em **Implantar › Nova implantação › Tipo: App da Web**.
   - Executar como: **Eu**.
   - Quem pode acessar: **Qualquer pessoa**.
   - Copie a URL que termina em `/exec`.
9. No app, em **Escola › ClassApp**, cole a URL e o token e toque em **Salvar**.
10. Em **Regras › Perfis**, confira se cada filha tem o mesmo apelido usado em `ALIASES`.

## Segurança

- A URL do App da Web só devolve dados com o token correto.
- O endpoint entrega apenas linhas `APROVADO`, sem o texto dos e-mails.
- A planilha fica no seu Drive e não é compartilhada.
- Nomes reais ficam nas Propriedades do Script. Nunca coloque nomes no GitHub.
- A URL e o token ficam só no navegador do app. Não vão para o backup.
- Para trocar o token, apague `API_TOKEN` nas Propriedades e rode `instalar` de novo.

## Quando a nota não vem no e-mail

Muitos avisos do ClassApp só dizem "você tem uma nova mensagem". Nesses casos a linha aparece como `nota_sem_valor`. Abra o ClassApp, preencha `nota_pct` (de 0 a 100) e troque o tipo para `nota`. Depois marque `APROVADO`.

## Ajuste fino

- `testarExtracao` mostra como o script lê frases de exemplo.
- Rode `diagnosticar` depois de duas semanas. Se algum aviso cair no tipo errado, ajuste as listas `POSITIVAS`, `NEGATIVAS` ou `NOTAS` no início do script.
- Limites do Google para contas pessoais sobram para uso diário. Uma execução leva poucos segundos.
