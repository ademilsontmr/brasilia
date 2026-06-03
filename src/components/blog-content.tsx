import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { DomainsForSaleInline } from "@/components/domains-for-sale";
import type { ArticleFaqItem } from "@/lib/blog-article-faq";
import type { BlogPost, BlogSection } from "@/lib/blog-posts";
import { getArticleExternalRefs, resolveLinkTarget } from "@/lib/blog-external-references";
import { applyBoldPhrases } from "@/lib/blog-rich-text";
import { BLOG_SUBSECTIONS, type ArticleSubsection } from "@/lib/blog-subsections";

const MANUAL_LINK_RE = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;
const BOLD_RE = /\*\*([^*]+)\*\*/g;

const GLOBAL_PATTERNS: { pattern: RegExp; href: string; external?: boolean }[] = [
  { pattern: /cassinodebrasilia\.com\.br/gi, href: "/" },
];

const TOPIC_LINKS: Record<string, string> = {
  "jogo responsável": "/blog/moderacao-jogo-responsavel-cassinos",
  moderação: "/blog/moderacao-jogo-responsavel-cassinos",
  "emprego formal": "/blog/empregos-formais-hotelaria-lazer-brasil",
  "Las Vegas": "/blog/licoes-las-vegas-singapura-regulacao-brasil",
  Singapura: "/blog/licoes-las-vegas-singapura-regulacao-brasil",
  tributação: "/blog/tributacao-cassinos-regulados-financiamento-publico",
  "resort integrado": "/blog/resorts-integrados-brasilia",
  "resorts integrados": "/blog/resorts-integrados-brasilia",
  "Brasília": "/blog/brasilia-polo-entretenimento-regulado",
  "Distrito Federal": "/blog/resorts-integrados-brasilia",
  regulação: "/blog/cassinos-brasil-emprego-renda",
  SEO: "/blog/dominio-premium-seo-entretenimento-brasilia",
  "domínio premium": "/blog/dominio-premium-seo-entretenimento-brasilia",
};

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderManualLink(label: string, target: string, key: string): ReactNode {
  const resolved = resolveLinkTarget(target);
  if (resolved?.external) {
    return (
      <a
        key={key}
        href={resolved.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
        title="Abre em site oficial (nova aba)"
      >
        {label}
      </a>
    );
  }
  if (target === "/") {
    return (
      <Link key={key} to="/" className="text-primary hover:underline">
        {label}
      </Link>
    );
  }
  return (
    <Link key={key} to="/blog/$slug" params={{ slug: target }} className="text-primary hover:underline">
      {label}
    </Link>
  );
}

function renderLinkSegment(label: string, href: string, key: string, external: boolean): ReactNode {
  if (external) {
    return (
      <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
        {label}
      </a>
    );
  }
  if (href.startsWith("/blog/")) {
    return (
      <Link key={key} to="/blog/$slug" params={{ slug: href.replace("/blog/", "") }} className="text-primary hover:underline">
        {label}
      </Link>
    );
  }
  return (
    <Link key={key} to="/" className="text-primary hover:underline">
      {label}
    </Link>
  );
}

function findAutoLinkSegments(text: string, currentSlug: string): { start: number; end: number; href: string; label: string; external: boolean }[] {
  type Segment = { start: number; end: number; href: string; label: string; external: boolean };
  const segments: Segment[] = [];

  for (const { pattern, href, external } of GLOBAL_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      segments.push({ start: match.index, end: match.index + match[0].length, href, label: match[0], external: external ?? false });
    }
  }

  for (const [phrase, href] of Object.entries(TOPIC_LINKS)) {
    if (href.replace("/blog/", "") === currentSlug) continue;
    const re = new RegExp(`\\b(${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, "gi");
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      segments.push({ start: match.index, end: match.index + match[0].length, href, label: match[0], external: false });
    }
  }

  segments.sort((a, b) => a.start - b.start || b.end - a.end);
  const used: Segment[] = [];
  for (const seg of segments) {
    if (used.some((u) => seg.start < u.end && seg.end > u.start)) continue;
    used.push(seg);
  }
  return used.sort((a, b) => a.start - b.start);
}

function parseRichText(text: string, currentSlug: string, boldParagraph = false): ReactNode[] {
  const prepared = boldParagraph && !text.includes("**") ? applyBoldPhrases(text) : text;
  const tokenRe = /(\[\[[^\]|]+\|[^\]]+\]\]|\*\*[^*]+\*\*)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = tokenRe.exec(prepared)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(...renderPlainWithAutoLinks(prepared.slice(lastIndex, match.index), currentSlug, key));
      key += 100;
    }
    const token = match[0];
    if (token.startsWith("[[")) {
      const inner = token.slice(2, -2).split("|");
      nodes.push(renderManualLink(inner[0], inner[1], `m-${key++}`));
    } else {
      nodes.push(<strong key={`b-${key++}`} className="text-foreground font-semibold">{token.slice(2, -2)}</strong>);
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < prepared.length) {
    nodes.push(...renderPlainWithAutoLinks(prepared.slice(lastIndex), currentSlug, key));
  }

  return nodes.length > 0 ? nodes : renderPlainWithAutoLinks(prepared, currentSlug, 0);
}

function renderPlainWithAutoLinks(text: string, currentSlug: string, keyOffset: number): ReactNode[] {
  const segments = findAutoLinkSegments(text, currentSlug);
  if (segments.length === 0) return text ? [text] : [];

  const nodes: ReactNode[] = [];
  let cursor = 0;
  segments.forEach((seg, i) => {
    if (seg.start > cursor) nodes.push(text.slice(cursor, seg.start));
    nodes.push(renderLinkSegment(seg.label, seg.href, `a-${keyOffset}-${i}`, seg.external));
    cursor = seg.end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

type SectionLink =
  | { label: string; slug: string }
  | { label: string; href: string; external: true };

function SectionRelatedLinks({ links }: { links: SectionLink[] }) {
  const internal = links.filter((l): l is { label: string; slug: string } => !("external" in l));
  const external = links.filter((l): l is { label: string; href: string; external: true } => "external" in l);

  return (
    <div className="mt-6 pt-5 border-t border-border/30 space-y-5">
      {internal.length > 0 && (
        <nav aria-label="Links relacionados nesta seção">
          <h3 className="text-sm font-medium text-foreground mb-3">Links relacionados</h3>
          <ul className="space-y-2 text-sm">
            {internal.map((link) => (
              <li key={(link.slug || "/") + link.label}>
                {link.slug === "/" ? (
                  <Link to="/" className="text-primary hover:underline">
                    → {link.label}
                  </Link>
                ) : (
                  <Link to="/blog/$slug" params={{ slug: link.slug }} className="text-primary hover:underline">
                    → {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
      {external.length > 0 && (
        <nav aria-label="Referências oficiais nesta seção">
          <h3 className="text-sm font-medium text-foreground mb-3">Referências oficiais</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {external.map((link) => (
              <li key={link.href + link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  ↗ {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

export function ArticleExternalReferences({ slug }: { slug: string }) {
  const refs = getArticleExternalRefs(slug);
  if (refs.length === 0) return null;

  return (
    <section
      aria-labelledby="refs-oficiais-heading"
      className="mt-12 rounded-xl border border-border/50 bg-card/30 p-6"
    >
      <h2 id="refs-oficiais-heading" className="font-serif text-xl text-foreground mb-2">
        Referências oficiais
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Fontes governamentais e institucionais para aprofundar o tema. Links abrem em nova aba.
      </p>
      <ul className="space-y-3 text-sm">
        {refs.map((ref) => (
          <li key={ref.url} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              {ref.label}
            </a>
            <span className="text-xs text-muted-foreground">({ref.source})</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ArticleSubsectionBlock({ block, slug }: { block: ArticleSubsection; slug: string }) {
  return (
    <div className="mt-6 space-y-3">
      <h3 id={slugifyHeading(block.heading)} className="font-serif text-xl text-foreground scroll-mt-24">
        {block.heading}
      </h3>
      {block.paragraphs.map((p, j) => (
        <p key={j}>{parseRichText(p, slug)}</p>
      ))}
    </div>
  );
}

type BlogContentProps = {
  post: BlogPost;
  sections: BlogSection[];
};

export function BlogTableOfContents({ post, sections }: { post: BlogPost; sections: BlogSection[] }) {
  const headings = sections.filter((s) => s.heading).map((s) => s.heading!);
  const subsections = BLOG_SUBSECTIONS[post.slug] ?? [];
  const hasFaq = post.faq.length > 0;

  if (headings.length < 2 && subsections.length === 0 && !hasFaq) return null;

  return (
    <nav aria-label="Índice do artigo" className="mb-10 rounded-xl border border-border bg-card/40 p-6">
      <h2 className="font-serif text-lg text-foreground mb-4">Neste artigo</h2>
      <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
        {headings.map((h) => (
          <li key={h}>
            <a href={`#${slugifyHeading(h)}`} className="hover:text-primary transition">
              {h}
            </a>
          </li>
        ))}
        {subsections.map((s) => (
          <li key={s.heading}>
            <a href={`#${slugifyHeading(s.heading)}`} className="hover:text-primary transition">
              {s.heading}
            </a>
          </li>
        ))}
        {hasFaq && (
          <li>
            <a href="#perguntas-frequentes" className="hover:text-primary transition">
              Perguntas frequentes
            </a>
          </li>
        )}
      </ol>
    </nav>
  );
}

export function BlogKeywordTags({ keywords }: { keywords: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2 mb-8" aria-label="Palavras-chave">
      {keywords.map((kw) => (
        <li key={kw}>
          <span className="px-3 py-1 rounded-full border border-gold/30 bg-background/60 text-xs text-foreground">
            {kw}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function BlogContent({ post, sections }: BlogContentProps) {
  const subsections = BLOG_SUBSECTIONS[post.slug] ?? [];
  const subsectionsByIndex = subsections.reduce<Record<number, ArticleSubsection[]>>((acc, sub) => {
    (acc[sub.afterSectionIndex] ??= []).push(sub);
    return acc;
  }, {});

  return (
    <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-lg space-y-10">
      {sections.map((section, i) => (
        <div key={i}>
          <section aria-labelledby={section.heading ? slugifyHeading(section.heading) : undefined}>
            {section.heading && (
              <h2
                id={slugifyHeading(section.heading)}
                className="font-serif text-2xl text-foreground scroll-mt-24 mb-4"
              >
                {section.heading}
              </h2>
            )}

            {section.listItems && section.listItems.length > 0 && (
              <ul className="list-disc list-inside space-y-2 mb-5 text-base marker:text-primary">
                {section.listItems.map((item, j) => (
                  <li key={j}>{parseRichText(item, post.slug)}</li>
                ))}
              </ul>
            )}

            <div className="space-y-4">
              {section.paragraphs.map((p, j) => (
                <p key={j}>{parseRichText(p, post.slug, true)}</p>
              ))}
            </div>

            {section.orderedItems && section.orderedItems.length > 0 && (
              <ol className="list-decimal list-inside space-y-2 mt-5 text-base marker:text-primary">
                {section.orderedItems.map((item, j) => (
                  <li key={j}>{parseRichText(item, post.slug)}</li>
                ))}
              </ol>
            )}

            {section.highlights && section.highlights.length > 0 && (
              <aside className="mt-6 rounded-lg border border-gold/20 bg-card/30 p-5">
                <h3 className="text-sm font-medium text-foreground mb-3">Pontos-chave</h3>
                <ul className="list-disc list-inside space-y-2 text-base">
                  {section.highlights.map((item, j) => (
                    <li key={j}>{parseRichText(item, post.slug)}</li>
                  ))}
                </ul>
              </aside>
            )}

            {section.relatedLinks && section.relatedLinks.length > 0 && (
              <SectionRelatedLinks links={section.relatedLinks} />
            )}
          </section>

          {(subsectionsByIndex[i] ?? []).map((sub) => (
            <ArticleSubsectionBlock key={sub.heading} block={sub} slug={post.slug} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ArticleFaq({ faq }: { faq: ArticleFaqItem[] }) {
  if (faq.length === 0) return null;

  return (
    <section
      id="perguntas-frequentes"
      aria-labelledby="faq-artigo-heading"
      className="mt-16 pt-10 border-t border-border/40"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <h2 id="faq-artigo-heading" className="font-serif text-2xl text-foreground mb-6">
        Perguntas frequentes sobre cassino no Brasil e Brasília
      </h2>
      <dl className="space-y-6">
        {faq.map((item, i) => (
          <div key={i} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
            <dt className="font-serif text-lg text-foreground mb-2" itemProp="name">
              {item.q}
            </dt>
            <dd itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p className="text-muted-foreground leading-relaxed" itemProp="text">
                {parseRichText(item.a, "", true)}
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function RelatedPosts({ post, related }: { post: BlogPost; related: BlogPost[] }) {
  if (related.length === 0) return null;

  return (
    <aside aria-label="Artigos relacionados" className="mt-16 pt-10 border-t border-border/40">
      <h2 className="font-serif text-2xl text-foreground mb-6">Leia também</h2>
      <ul className="space-y-4">
        {related.map((r) => (
          <li key={r.slug}>
            <article className="rounded-lg border border-border bg-card/40 p-5 hover:border-gold/40 transition">
              <h3 className="font-serif text-lg mb-2">
                <Link to="/blog/$slug" params={{ slug: r.slug }} className="hover:text-primary transition">
                  {r.title}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.excerpt}</p>
            </article>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function BlogDomainMention() {
  return (
    <p className="text-sm text-muted-foreground mt-8 border-t border-border/30 pt-6">
      Sobre o domínio <DomainsForSaleInline />: ativos digitais premium à venda para projetos de{" "}
      <strong className="text-foreground">entretenimento regulado</strong> e{" "}
      <strong className="text-foreground">turismo</strong> em{" "}
      <strong className="text-foreground">Brasília</strong>.{" "}
      <Link to="/" className="text-primary hover:underline">
        Saiba mais sobre a oferta
      </Link>
      .
    </p>
  );
}

export { slugifyHeading };
