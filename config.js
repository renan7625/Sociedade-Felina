/* ==========================================================================
   CONFIG.JS — ÚNICO ARQUIVO QUE VOCÊ PRECISA EDITAR
   --------------------------------------------------------------------------
   Tudo o que é "dado seu" fica aqui: link da Hotmart, IDs de rastreamento,
   canais de suporte, dados do vendedor, FAQ, citação do livro etc.

   REGRA: campo vazio ('' ou []) = o item NÃO aparece no site. Nada quebra.
   ========================================================================== */
window.SITE_CONFIG = {

  /* ---------- 1. PRODUTO E CHECKOUT (HOTMART) ---------- */
  // Link de checkout da Hotmart. Usado por TODOS os botões de compra do site.
  // As UTMs (utm_source, utm_medium...) são anexadas automaticamente a ele.
  checkoutUrl: 'https://pay.hotmart.com/E106765742W?bid=1784235993918',

  produto: {
    nome: 'Sociedade Felina',
    preco: 47.00,          // usado nos eventos de rastreamento do site
    moeda: 'BRL'
  },

  // Parcelamento exibido abaixo do preço, ex.: '9,03' → "Ou 6x de R$ 9,03 no cartão".
  // Deixe '' para ocultar. Confira o valor real na simulação da Hotmart.
  parcela: '',

  /* ---------- 2. RASTREAMENTO (só carrega APÓS o consentimento de cookies) ---------- */
  tracking: {
    ga4:     '',   // ID de métricas do GA4, ex.: 'G-ABCDE12345'
    pixel:   '',   // ID do Meta Pixel (só números), ex.: '123456789012345'
    clarity: 'zjdojaupug'    // ID do projeto no Microsoft Clarity, ex.: 'abcd1efg2h'
  },
  // IMPORTANTE — COMPRA / CONVERSÃO:
  // A compra acontece no domínio da Hotmart. A CONVERSÃO (compra aprovada) deve ser
  // medida SOMENTE pela Hotmart (Hotmart > Ferramentas > Pixel de rastreamento: Meta/GA4).
  // Este site NÃO dispara evento de compra, para não duplicar. Ele só registra:
  //   • click_checkout  → clique em qualquer botão de compra (com o local do botão)
  //   • view_item       → quando a pessoa chega na oferta final
  //   • video_start     → 1ª reprodução de cada depoimento
  // As UTMs da visita seguem para a Hotmart (parâmetros utm_*, src e sck), então as
  // vendas aparecem atribuídas à origem no relatório da própria Hotmart.

  /* ---------- 3. SUPORTE (RODAPÉ) ----------
     Cada canal tem: ativo (true = aparece no site, false = oculto) e valor.
     Para ligar um canal: preencha o valor e troque ativo para true.  */
  suporte: {
    email: {
      ativo: true,
      valor: 'sociedadefelinasuporte@gmail.com'
    },
    whatsapp: {
      ativo: false,
      valor: ''            // só números com DDI+DDD, ex.: '5511999999999'
    },
    instagram: {
      ativo: false,
      valor: ''            // só o usuário, sem @, ex.: 'sociedadefelina'
    },
    horario: ''            // opcional, ex.: 'Seg a sex, 9h às 18h' (aparece no bloco Suporte)
  },

  /* ---------- 4. DADOS DO VENDEDOR E PÁGINAS LEGAIS ---------- */
  legal: {
    razao:    '',   // Razão social/nome do vendedor (vazio = oculto no rodapé)
    cnpj:     '',   // ex.: '00.000.000/0001-00' (ou CPF, se pessoa física)
    endereco: '',   // opcional
    privacidade: 'privacidade.html',
    termos:      'termos.html',
    // Aviso de "não afiliado ao Meta/Google" (recomendado se você anuncia lá)
    avisoMeta: true
  },

  /* ---------- 5. DEPOIMENTOS EM VÍDEO ---------- */
  // Ordem = ordem dos vídeos no HTML (1º = destaque no topo, 2º e 3º = galeria).
  // vtt:   caminho do arquivo de legendas (.vtt), ex.: 'assets/legendas/depoimento-1.vtt'.
  //        Use assets/legendas/_modelo.vtt como base. Vazio = sem legenda.
  // frase: frase de destaque do depoimento. Vazio = oculta.
  // nome:  identificação do leitor, ex.: 'Maria S., leitora'.
  depoimentos: [
    { vtt: '', frase: '', nome: '' },
    { vtt: '', frase: '', nome: '' },
    { vtt: '', frase: '', nome: '' }
  ],

  /* ---------- 6. SINOPSE: CITAÇÃO EM DESTAQUE ---------- */
  // Trecho curto e marcante do livro. Vazio = o bloco de citação não aparece.
  citacao: {
    texto: '',
    fonte: ''   // ex.: 'Sociedade Felina, Ato II'
  },

  /* ---------- 7. PARA QUEM É O LIVRO ---------- */
  temas: [
    'Poder absoluto',
    'Liberdade e livre-arbítrio',
    'Determinismo',
    'Segurança × opressão',
    'A verdade como processo'
  ],
  // "Se você gosta de…" — livros/autores de referência. Vazio = oculto.
  // ex.: ['1984, de George Orwell', 'O Estrangeiro, de Albert Camus']
  referencias: [],

  /* ---------- 8. FAQ (PERGUNTAS FREQUENTES) ---------- */
  faq: [
    {
      q: 'Como recebo o livro após a compra?',
      a: 'Assim que o pagamento é confirmado na Hotmart, o acesso ao livro é liberado de imediato e enviado ao e-mail usado na compra.'
    },
    {
      q: 'Em quais dispositivos posso ler?',
      a: 'No celular, no tablet, no Kindle ou em outros e-readers e no computador.'
    },
    {
      q: 'A compra é segura?',
      a: 'Sim. O pagamento é processado pela Hotmart, por Pix ou cartão (Mastercard e Visa). Os dados do seu pagamento não passam por este site.'
    },
    {
      q: 'Como funciona a garantia de 7 dias?',
      a: 'Você tem 7 dias, a partir da compra, para pedir o reembolso integral pela própria Hotmart, sem precisar justificar.'
    }
    // , { q: 'Sua nova pergunta?', a: 'Sua resposta.' }
  ]
};
