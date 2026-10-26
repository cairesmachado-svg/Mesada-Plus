# Rotina dos e-mails da escola

O script `escola.gs` roda numa conta Google. Todo dia, às 19h, ele procura os avisos da escola no Gmail, anota notas e ocorrências numa planilha privada e manda um resumo. Nada vira ponto sem a sua aprovação.

Ele entende dois formatos:

- **Galois** (`administrador@galois.com.br`): "Foi registrada a seguinte ocorrência: MONITORIA para o(a) aluno(a) ... na data 20/10/2026. Disciplina: ...". O tipo da ocorrência decide o lado. Monitoria, frequência extra, elogio e destaque são positivas. Falta de material, tarefa não feita e advertência são negativas. Se a observação disser que a aluna faltou ou não compareceu, a linha fica para você classificar.
- **ClassApp** e outros avisos em texto livre, com notas como "9,5", "95%" ou "38/40 pontos".

## Antes de tudo: os e-mails precisam chegar no Gmail

O Apps Script só lê o Gmail da conta onde está instalado. Hoje os avisos do Galois chegam em um endereço Yahoo. Há dois obstáculos:

- O Yahoo gratuito não encaminha e-mails automaticamente desde 2021. O encaminhamento exige um plano pago.
- O Gmail deixou de buscar e-mails de outras contas por POP em janeiro de 2026.

Caminhos, do mais simples ao mais trabalhoso:

1. **Trocar o e-mail do responsável na escola** para o Gmail. Peça à secretaria para atualizar ou incluir o endereço no cadastro do Galois. É gratuito e definitivo.
2. **Assinar o Yahoo Mail Plus** e ativar o encaminhamento automático para o Gmail.
3. **Encaminhar à mão** cada aviso do Yahoo para o Gmail. O script reconhece e-mails encaminhados porque o texto traz o remetente original.

## Como funciona

1. O script lê os avisos dos últimos 7 dias.
2. Cada aviso vira uma linha na planilha com status `PENDENTE`. Comunicados gerais entram como `DESCARTADO`.
3. Você recebe um e-mail com o resumo.
4. Você confere e marca `APROVADO` ou `DESCARTADO`.
5. No app, em **Escola › E-mails da escola**, toque em **Importar aprovados**.

Notas e ocorrências positivas entram confirmadas. Negativas e as sem lado definido entram para você classificar o nível.

## Instalação (uns 10 minutos)

1. Abra [script.google.com](https://script.google.com) com a conta Gmail que recebe os avisos.
2. Clique em **Novo projeto**. Dê o nome `Mesada+ Escola`.
3. Apague o conteúdo de `Código.gs` e cole todo o `escola.gs`.
4. Salve. Escolha `testarExtracao` e clique em **Executar**. Autorize o acesso ao Gmail e às Planilhas. O registro mostra como o script lê os exemplos.
5. Escolha `diagnosticar` e execute. O registro lista os avisos encontrados nos últimos 60 dias. Se vier vazio, os e-mails ainda não chegam nesta conta.
6. Escolha `instalar` e execute. O registro mostra o link da planilha e o **token**. Guarde o token.
7. Vá em **Configurações do projeto › Propriedades do script** e edite `ALIASES`. Use o primeiro nome de cada filha como aparece nos e-mails e o apelido do app:

   ```json
   {"Nome1": "F14", "Nome2": "F12", "Nome3": "F09"}
   ```

8. Clique em **Implantar › Nova implantação › Tipo: App da Web**.
   - Executar como: **Eu**.
   - Quem pode acessar: **Qualquer pessoa**.
   - Copie a URL que termina em `/exec`.
9. No app, em **Escola › E-mails da escola**, cole a URL e o token e toque em **Salvar**.
10. Em **Regras › Perfis**, confira se cada filha tem o mesmo apelido usado em `ALIASES`.

Quem instalou a versão anterior (`classapp.gs`) pode colar o novo código por cima e rodar `instalar` de novo. A planilha ganha a coluna `descricao` sozinha.

## Segurança

- A URL do App da Web só devolve dados com o token correto.
- O endpoint entrega apenas linhas `APROVADO`, sem o texto dos e-mails e sem a matrícula.
- A planilha fica no seu Drive e não é compartilhada.
- Nomes reais ficam nas Propriedades do Script. Nunca coloque nomes no GitHub.
- A URL e o token ficam só no navegador do app. Não vão para o backup.
- Para trocar o token, apague `API_TOKEN` nas Propriedades e rode `instalar` de novo.

## Ajuste fino

- Se um tipo de ocorrência cair no lado errado, acrescente a palavra em `OC_POSITIVAS` ou `OC_NEGATIVAS` no início do script.
- Se a escola usar outro remetente, inclua o domínio em `CONFIG.remetentes`.
- Os limites do Google para contas pessoais sobram para uso diário. Uma execução leva poucos segundos.
