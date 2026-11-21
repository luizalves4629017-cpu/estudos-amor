# Estudos UECE

App de estudos (matérias, exercícios com nível, simulado, revisão, redação ENEM/UESB). Tudo roda em uma página estática (`index.html`). Os recursos de IA (gerar questões, ilustrar, corrigir redação) usam a função `api/ia.js`.

## Publicar com link único e atualização automática (Vercel)

1. **Subir para o GitHub** (no terminal, dentro desta pasta):
   ```bash
   git init
   git add .
   git commit -m "Primeira versão"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/estudos-uece.git
   git push -u origin main
   ```
   (crie antes o repositório vazio `estudos-uece` em github.com/new)
2. **Ligar na Vercel:** em vercel.com, *Add New > Project*, importe o repositório e clique em *Deploy* (Framework: **Other**, sem build).
3. **Variáveis de ambiente** (Vercel > Settings > Environment Variables), depois faça *Redeploy*:
   - `ANTHROPIC_API_KEY`: sua chave da API da Anthropic
   - `ACCESS_CODE`: um código que você escolhe (recomendado; o app pede uma vez no aparelho)
   - `ANTHROPIC_MODEL`: opcional
4. **Pronto:** o link `https://SEU-PROJETO.vercel.app` é único. A cada `git push` na branch `main`, a Vercel publica a nova versão sozinha. Outras branches geram links de teste.

## Atualizar o app
Troque o `index.html` pela versão nova, depois: `git add . && git commit -m "Atualização" && git push`.

## Cuidados
- **Nunca** coloque a chave da API no código nem no GitHub. O `.gitignore` já bloqueia `.env*` e `*.key`.
- Sem `ACCESS_CODE`, qualquer pessoa com o link pode gastar a sua cota de IA.
- O progresso do aluno fica salvo no navegador de cada aparelho (não sincroniza entre aparelhos).
- Sem a API configurada, o app funciona normalmente, mas os botões de IA avisam que não conseguiram gerar.

## Instalar como aplicativo (PWA)
O projeto já é um PWA: depois de publicado, abra o link no celular.
- **Android (Chrome):** menu ⋮ > *Instalar app* (ou o botão "📲 Instalar como app" no Perfil).
- **iPhone (Safari):** botão Compartilhar > *Adicionar à Tela de Início*.
O app abre em tela cheia, com ícone próprio, funciona sem internet (depois da primeira abertura) e se atualiza sozinho a cada `git push`.

## Loja de aplicativos (opcional)
Para publicar na Google Play, dá para empacotar este mesmo site com o PWABuilder (pwabuilder.com) ou com o Capacitor. Exige conta de desenvolvedor (Google Play: taxa única; Apple: anual, e precisa de Mac).
