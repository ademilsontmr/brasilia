/** Fontes oficiais — URLs de páginas reais (tramitação, leis, órgãos). */
export type GovReference = {
  label: string;
  url: string;
  source: string;
};

export const GOV_REFERENCES = {
  /** PL 2234/2022 (ex-PL 442/1991 na Câmara) — cassinos e jogos no Senado */
  senado: {
    label: "PL 2234/2022 — tramitação no Senado Federal",
    url: "https://www25.senado.leg.br/web/atividade/materias/-/materia/154401",
    source: "Senado Federal",
  },
  /** Mesma matéria na origem: PL 442/1991, aprovado na Câmara */
  camara: {
    label: "PL 442/1991 — tramitação na Câmara dos Deputados",
    url: "https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=15460",
    source: "Câmara dos Deputados",
  },
  senadoNoticiaCassinos: {
    label: "Senado Notícias — projeto que autoriza cassinos e bingos",
    url: "https://www12.senado.leg.br/noticias/materias/2024/12/04/senado-adia-projeto-que-autoriza-cassinos-e-bingos-no-pais-proposta-fica-para-2025",
    source: "Agência Senado",
  },
  camaraNoticiaJogos: {
    label: "Câmara Notícias — marco regulatório dos jogos",
    url: "https://www.camara.leg.br/noticias/492032-comissao-vota-parecer-sobre-marco-regulatorio-dos-jogos-na-proxima-terca/",
    source: "Câmara dos Deputados",
  },
  planalto: {
    label: "Planalto — busca de legislação federal",
    url: "https://www.planalto.gov.br/ccivil_03/leis/LEIS-Atuais.htm",
    source: "Presidência da República",
  },
  leiApostas: {
    label: "Lei nº 14.790/2023 (apostas de quota fixa e jogos online)",
    url: "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2023/lei/l14790.htm",
    source: "Planalto",
  },
  turismo: {
    label: "Ministério do Turismo — indicadores e estatísticas",
    url: "https://www.gov.br/turismo/pt-br/atuacao/indicadores-e-estatisticas",
    source: "Gov.br — Turismo",
  },
  ibgeTurismo: {
    label: "IBGE — estatísticas de turismo",
    url: "https://www.ibge.gov.br/estatisticas/economicas/turismo.html",
    source: "IBGE",
  },
  ibgePnadTurismo: {
    label: "IBGE — PNAD Contínua Turismo (demanda doméstica)",
    url: "https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/41306-apos-fim-da-pandemia-numero-de-viagens-cresce-71-5-entre-2021-e-2023",
    source: "IBGE Agência de Notícias",
  },
  receita: {
    label: "Receita Federal — combate à lavagem de dinheiro",
    url: "https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/legislacao-e-convenios/combate-a-lavagem-de-dinheiro",
    source: "Gov.br — Receita Federal",
  },
  coaf: {
    label: "COAF — Conselho de Controle de Atividades Financeiras",
    url: "https://www.gov.br/coaf/pt-br",
    source: "Gov.br — COAF",
  },
  trabalho: {
    label: "Ministério do Trabalho — estatísticas de trabalho",
    url: "https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/estatisticas-trabalho-e-previdencia",
    source: "Gov.br — Trabalho",
  },
  saude: {
    label: "Ministério da Saúde — guia sobre apostas e saúde (SUS)",
    url: "https://www.gov.br/saude/pt-br/assuntos/noticias/2026/janeiro/ministerio-da-saude-lanca-guia-nacional-para-enfrentar-impactos-das-apostas-online-na-saude",
    source: "Gov.br — Saúde",
  },
  spa: {
    label: "Secretaria de Prêmios e Apostas (SPA)",
    url: "https://www.gov.br/fazenda/pt-br/composicao/orgaos/secretaria-de-premios-e-apostas",
    source: "Gov.br — Fazenda / SPA",
  },
  spaApostas: {
    label: "SPA — apostas de quota fixa (regulamentação)",
    url: "https://www.gov.br/fazenda/pt-br/composicao/orgaos/secretaria-de-premios-e-apostas/apostas-de-quota-fixa",
    source: "Gov.br — SPA",
  },
  jogoResponsavel: {
    label: "SPA — jogo responsável (Portaria 1.231/2024)",
    url: "https://www.gov.br/fazenda/pt-br/composicao/orgaos/secretaria-de-premios-e-apostas/jogo-responsavel",
    source: "Gov.br — SPA",
  },
  brasiliaPrefeitura: {
    label: "Governo do Distrito Federal — Brasília",
    url: "https://www.bsb.br/",
    source: "Governo do Distrito Federal",
  },
  dfGoverno: {
    label: "Governo do Distrito Federal",
    url: "https://www.df.gov.br/",
    source: "Governo do DF",
  },
  dfTurismo: {
    label: "Secretaria de Turismo do Distrito Federal",
    url: "https://www.df.gov.br/turismo",
    source: "Turismo DF",
  },
} as const satisfies Record<string, GovReference>;

export type GovRefKey = keyof typeof GOV_REFERENCES;

/** Referências oficiais por artigo — páginas específicas, não genéricas. */
export const BLOG_ARTICLE_EXTERNAL_REFS: Record<string, GovRefKey[]> = {
  "investimento-estrangeiro-turismo-entretenimento-brasil": ["senado", "turismo", "ibgePnadTurismo"],
  "empregos-formais-hotelaria-lazer-brasil": ["trabalho", "senado", "turismo"],
  "dominio-premium-seo-entretenimento-brasilia": ["turismo", "ibgeTurismo", "brasiliaPrefeitura"],
  "tributacao-cassinos-regulados-financiamento-publico": ["receita", "coaf", "spaApostas"],
  "turismo-corporativo-brasilia-entretenimento": ["turismo", "ibgePnadTurismo", "brasiliaPrefeitura"],
  "licoes-las-vegas-singapura-regulacao-brasil": ["senado", "camara", "senadoNoticiaCassinos"],
  "brasilia-polo-entretenimento-regulado": ["brasiliaPrefeitura", "dfTurismo", "senado"],
  "moderacao-jogo-responsavel-cassinos": ["jogoResponsavel", "saude", "leiApostas"],
  "resorts-integrados-brasilia": ["turismo", "brasiliaPrefeitura", "senado"],
  "cassinos-brasil-emprego-renda": ["senado", "trabalho", "ibgePnadTurismo"],
  "cassino-brasilia-potencial-economico": ["brasiliaPrefeitura", "ibgeTurismo", "turismo"],
  "lei-cassinos-brasil-pl-263-regulamentacao": ["senado", "camara", "senadoNoticiaCassinos"],
  "seguranca-patrimonial-compliance-cassinos-regulados": ["coaf", "receita", "spa"],
  "resorts-integrados-impacto-ambiental-brasilia": ["brasiliaPrefeitura", "dfGoverno", "turismo"],
  "marketing-digital-turismo-cassino-brasilia": ["turismo", "ibgeTurismo", "brasiliaPrefeitura"],
  "cassinos-america-latina-comparativo-brasil": ["turismo", "senado", "camaraNoticiaJogos"],
  "hospedagem-luxo-entretenimento-regulado-brasilia": ["turismo", "brasiliaPrefeitura", "ibgePnadTurismo"],
  "concessao-licitacao-cassino-municipio-brasil": ["brasiliaPrefeitura", "senado", "camara"],
  "apostas-online-cassino-presencial-regulacao": ["leiApostas", "spaApostas", "jogoResponsavel"],
};

export function resolveGovRef(key: string): GovReference | undefined {
  if (key in GOV_REFERENCES) return GOV_REFERENCES[key as GovRefKey];
  return undefined;
}

export function getArticleExternalRefs(slug: string): GovReference[] {
  const keys = BLOG_ARTICLE_EXTERNAL_REFS[slug] ?? [];
  return keys.map((k) => GOV_REFERENCES[k]);
}

export function isExternalLinkTarget(target: string): boolean {
  return /^https?:\/\//i.test(target) || target.startsWith("gov:");
}

export function resolveLinkTarget(target: string): { href: string; external: boolean } | null {
  if (target.startsWith("gov:")) {
    const ref = resolveGovRef(target.slice(4));
    if (!ref) return null;
    return { href: ref.url, external: true };
  }
  if (/^https?:\/\//i.test(target)) return { href: target, external: true };
  return { href: target, external: false };
}
