/** Data de publicação dos artigos iniciais do blog. */
export const BLOG_ARTICLE_DATE = `${new Date().getFullYear()}-06-01`;

/** Lote de artigos adicionais (SEO). */
export const BLOG_ARTICLE_DATE_BATCH2 = `${new Date().getFullYear()}-06-02`;

const BATCH2_SLUGS = new Set([
  "lei-cassinos-brasil-pl-263-regulamentacao",
  "seguranca-patrimonial-compliance-cassinos-regulados",
  "resorts-integrados-impacto-ambiental-brasilia",
  "marketing-digital-turismo-cassino-brasilia",
  "cassinos-america-latina-comparativo-brasil",
  "hospedagem-luxo-entretenimento-regulado-brasilia",
  "concessao-licitacao-cassino-municipio-brasil",
  "apostas-online-cassino-presencial-regulacao",
]);

export function getBlogArticleDate(slug: string): string {
  return BATCH2_SLUGS.has(slug) ? BLOG_ARTICLE_DATE_BATCH2 : BLOG_ARTICLE_DATE;
}
