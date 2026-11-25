# Sociedade Felina — guia rápido

## O que você edita
**Só o `config.js`.** Campo vazio (ou canal com `ativo: false`) = não aparece no site.

## Suporte (rodapé)
- E-mail oficial já ativo: `sociedadefelinasuporte@gmail.com`.
- WhatsApp e Instagram: preencha `valor` e troque `ativo` para `true` quando quiser exibir.

## Rastreamento
- UTMs da visita são anexadas ao link da Hotmart (`utm_*`, `src`, `sck`).
- Eventos do site: `click_checkout` (por botão), `view_item` (chegou na oferta), `video_start`. Só disparam após o aceite de cookies.
- A **compra** é medida só pela Hotmart (Hotmart > Ferramentas > Pixel de rastreamento). O site não dispara evento de compra, para não duplicar.
- Preencha os IDs de GA4 / Meta Pixel / Clarity em `config.js > tracking`.

## Antes de publicar
1. Dados do vendedor (`legal.razao`, `legal.cnpj`): vazios ficam ocultos no rodapé.
2. Revise `privacidade.html` e `termos.html` com um(a) advogado(a): são textos-base.
3. Depoimentos: frase/nome/legenda em `depoimentos` (opcional). Citação do livro em `citacao` (opcional).
4. Vídeos: `bash otimizar-midia.sh` gera versões menores em `assets/otimizado/` (precisa de ffmpeg).
5. Se o domínio não for catabase.com.br, troque nas tags `canonical`, `og:` e `twitter:` do `index.html`.
6. Depois de publicar: developers.facebook.com/tools/debug (prévia do WhatsApp/Instagram) e PageSpeed Insights.

## Arquivos
`index.html` página · `config.js` seus dados · `tracking.js` cookies + tags + UTMs · `app.js` comportamento · `privacidade.html`, `termos.html` · `assets/`
