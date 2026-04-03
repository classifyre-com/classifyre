import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  AiAssistedCard,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DetectorReferenceGrid,
  SourceCatalog,
  SourceIcon,
} from "@workspace/ui/components";
import {
  SOURCE_TYPE_CATALOG_META,
  resolveSourceCatalogMeta,
  type SourceCatalogEntry,
} from "@workspace/ui/lib/source-catalog";
import { getAllDetectorDocs } from "@workspace/schemas/detector-docs";
import { getAllSourceDocs } from "@workspace/schemas/source-docs";

import { AssistantDemoShowcase } from "@/components/assistant-demo-showcase";
import { EditionGrid } from "@/components/edition-grid";
import { getAllPosts } from "@/lib/posts";
import { normalizeSiteUrl, safeJsonLdStringify } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Detect, Classify, and Label Any Source",
  description:
    "Classifyre detects, classifies, and labels data across databases, lakehouses, collaboration tools, analytics systems, and public content with an open-source core and enterprise deployment path.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Classifyre | Detect, Classify, and Label Any Source",
    description:
      "Run Classifyre in one Docker command, explore the live demo, or deploy the platform to enterprise Kubernetes.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Classifyre | Detect, Classify, and Label Any Source",
    description:
      "Open-source core, enterprise deployment path, custom detectors, and an MCP-native assistant that can actually operate the product.",
  },
};

const sourceEntries = Object.entries(SOURCE_TYPE_CATALOG_META).map(
  ([type, meta]) => ({
    type,
    ...meta,
  }),
);

const marqueeEntries = [...sourceEntries, ...sourceEntries];

const deploymentModes = [
  {
    title: "One Command Start",
    body: "Run the full stack in one all-in-one container for demos, evaluation, and local validation.",
    marker: "RUN",
    tone: "bg-accent text-accent-foreground",
  },
  {
    title: "Live Demo",
    body: "Show the product immediately in the public release at demo.classifyre.com before touching infrastructure.",
    marker: "LIVE",
    tone: "bg-card text-foreground",
  },
  {
    title: "Enterprise Kubernetes",
    body: "Move to the production topology with the Helm chart, stateless services, and Kubernetes job execution.",
    marker: "K8S",
    tone: "bg-card text-foreground",
  },
] as const;

const assistantDemoFlow = [
  {
    kind: "user",
    speaker: "Operator",
    label: "Prompt",
    body: "Connect my Snowflake. Here is the account URL, warehouse, and the read-only credentials.",
  },
  {
    kind: "assistant",
    speaker: "Classifyre Assistant",
    label: "Plan",
    body: "Opening the Snowflake source flow now. I will validate access first, then create the source only after the connection test passes.",
  },
  {
    kind: "system",
    speaker: "MCP action",
    label: "snowflake.testConnection()",
    body: "Credentials validated. Warehouse reachable. 14 schemas discovered and ready for source creation.",
  },
  {
    kind: "assistant",
    speaker: "Classifyre Assistant",
    label: "Question",
    body: "How often should this source run?",
  },
  {
    kind: "user",
    speaker: "Operator",
    label: "Answer",
    body: "Every working day in the morning.",
  },
  {
    kind: "assistant",
    speaker: "Classifyre Assistant",
    label: "Schedule",
    body: "I can schedule weekdays at 08:00 local time. What should we detect first? I would start with PII, secrets, and regulated financial content.",
  },
  {
    kind: "user",
    speaker: "Operator",
    label: "Detector choice",
    body: "Use PII and secrets, then add a German-specific custom detector for Steuer-ID and payroll export labels because this warehouse contains HR reporting.",
  },
  {
    kind: "system",
    speaker: "MCP action",
    label: "source.create()",
    body: "Snowflake source created. Weekday morning schedule saved. Built-in detectors attached. Custom detector draft prepared for German payroll signals.",
  },
] as const;

const customDetectorMethods = [
  "RULESET for deterministic patterns and policy rules",
  "CLASSIFIER for contextual domain decisions",
  "ENTITY with GLiNER for multilingual span extraction",
  "Extractor blocks for structured fields after detection",
] as const;

function formatDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsed);
}

function Marker({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center justify-center border-2 border-border bg-background px-3 py-2">
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em]">
        {label}
      </span>
    </div>
  );
}

function LandingSectionShell({
  tone = "plain",
  children,
  className = "",
}: {
  tone?: "signal" | "plain";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[8px] border-2 border-border ${
        tone === "signal"
          ? "bg-foreground text-primary-foreground"
          : "bg-background text-foreground"
      } ${className}`}
    >
      {tone === "signal" ? (
        <div className="landing-grid absolute inset-0 opacity-30" />
      ) : null}
      <div className="relative px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        {children}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const posts = await getAllPosts();
  const featuredPosts = posts.slice(0, 3);
  const sourceDocs = getAllSourceDocs();
  const detectorDocs = getAllDetectorDocs();
  const siteUrl = normalizeSiteUrl(
    process.env.NEXT_PUBLIC_BLOG_SITE_URL ?? "https://blog.classifyre.local",
  );
  const searchableSourceEntries: SourceCatalogEntry[] = sourceDocs
    .map((source) => ({
      type: source.sourceType,
      href: `https://docs.classifyre.com/sources/${source.slug}/`,
      ...resolveSourceCatalogMeta(source.sourceType, {
        label: source.label,
      }),
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
  const activeDetectors = detectorDocs.filter(
    (detector) => detector.catalogMeta.lifecycleStatus === "active",
  );

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Classifyre",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Docker, Kubernetes, Web",
    url: siteUrl,
    description:
      "Classifyre detects, classifies, and labels data across modern source systems with an open-source core and enterprise-ready deployment model.",
    offers: [
      {
        "@type": "Offer",
        name: "Open Source Core",
        price: "0",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "Enterprise",
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "USD",
        },
      },
    ],
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify(softwareApplicationSchema),
        }}
      />

      <section>
        <LandingSectionShell tone="signal">
          <div className="space-y-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-[4px] border border-accent bg-accent px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent-foreground">
                Product Landing Page
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-[4px] border border-primary-foreground/20 bg-primary-foreground/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-primary-foreground"
              >
                Open Core + Enterprise Path
              </Badge>
            </div>

            <div className="space-y-5">
              <h1 className="font-serif text-[clamp(3.9rem,9vw,6.8rem)] font-black uppercase leading-[0.84] tracking-[0.08em] text-primary-foreground">
                <span className="block">Detect.</span>
                <span className="block">
                  <span className="inline-block bg-accent px-[0.14em] text-accent-foreground dark:text-primary">
                    Classify.
                  </span>
                </span>
                <span className="block">Label.</span>
              </h1>
              <p className="max-w-2xl text-base leading-7 text-primary-foreground/78 sm:text-lg">
                Classifyre turns messy, distributed source data into governed
                signals. Connect the systems you already run, detect what matters,
                classify content and findings, and label data for security,
                privacy, moderation, and operational workflows.
              </p>
              <p className="max-w-2xl text-sm leading-6 text-primary-foreground/62">
                Start in one Docker command, validate in the live demo, then move
                to enterprise Kubernetes when the rollout needs SLA, governance,
                authentication, authorization, and multilanguage support.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="border-2 border-accent bg-accent text-accent-foreground hover:bg-accent/90">
                <a
                  href="https://demo.classifyre.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Demo
                </a>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="border-2 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/16"
              >
                <a
                  href="https://docs.classifyre.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Read Docs
                </a>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="border-2 border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href="/blog">Engineering Journal</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border border-primary-foreground/20 bg-primary-foreground/8 p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground/54">
                  Source Types
                </p>
                <p className="mt-2 text-3xl font-black text-accent">
                  {sourceEntries.length}+
                </p>
                <p className="mt-1 text-sm text-primary-foreground/68">
                  Databases, lakehouses, collaboration tools, BI, and web content.
                </p>
              </div>
              <div className="border border-primary-foreground/20 bg-primary-foreground/8 p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground/54">
                  Detector Families
                </p>
                <p className="mt-2 text-3xl font-black text-accent">
                  {activeDetectors.length}
                </p>
                <p className="mt-1 text-sm text-primary-foreground/68">
                  From secrets and PII to moderation, quality, and governance tags.
                </p>
              </div>
              <div className="border border-primary-foreground/20 bg-primary-foreground/8 p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground/54">
                  Deployment Modes
                </p>
                <p className="mt-2 text-3xl font-black text-accent">1 → N</p>
                <p className="mt-1 text-sm text-primary-foreground/68">
                  Single-container evaluation to enterprise Kubernetes rollout.
                </p>
              </div>
            </div>
          </div>
        </LandingSectionShell>
      </section>

      <section aria-labelledby="runtime-title">
        <LandingSectionShell tone="plain">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.75fr)_minmax(360px,1.25fr)] lg:items-start">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="rounded-[4px] border-2 border-border bg-accent px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent-foreground"
              >
                Runtime
              </Badge>
              <div>
                <h2
                  id="runtime-title"
                  className="font-serif text-4xl font-black uppercase leading-[0.9] tracking-[0.06em] sm:text-5xl"
                >
                  One command runtime
                </h2>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  Start the entire evaluation stack from one container. This
                  section is about speed: bring Classifyre up fast, show it in a
                  real environment, and keep the path to enterprise deployment
                  intact.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="border border-border p-3">
                  <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/60">
                    Included
                  </div>
                  <p className="mt-2 text-sm text-foreground">
                    API, UI, database, migrations, reverse proxy, and demo-safe
                    defaults in one runtime shape.
                  </p>
                </div>
                <div className="border border-border p-3">
                  <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/60">
                    Best use
                  </div>
                  <p className="mt-2 text-sm text-foreground">
                    Fast evaluation, stakeholder walkthroughs, and local
                    validation before enterprise rollout.
                  </p>
                </div>
              </div>
            </div>

            <AiAssistedCard
              title="One Command Runtime"
              description="All-in-one Docker image"
              headerActions={<Marker label="3000" />}
            >
              <div className="space-y-5">
                <p className="text-sm leading-6 text-muted-foreground">
                  PostgreSQL, API, web UI, and reverse proxy bundled into one
                  entrypoint so an evaluation environment can start from a single
                  command and a single public port.
                </p>
                <div className="border-2 border-border bg-foreground p-4 text-primary-foreground">
                  <div className="mb-3 text-[11px] font-mono uppercase tracking-[0.14em] text-primary-foreground/55">
                    Quick start
                  </div>
                  <pre className="overflow-x-auto font-mono text-sm leading-6">
                    <code>docker run --rm -p 3000:3000 classifyre-all-in-one:local</code>
                  </pre>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                  <span className="border border-border px-3 py-1">
                    One public port
                  </span>
                  <span className="border border-border px-3 py-1">
                    Auto migrations
                  </span>
                  <span className="border border-border px-3 py-1">
                    Demo-ready
                  </span>
                </div>
              </div>
            </AiAssistedCard>
          </div>
        </LandingSectionShell>
      </section>

      <section aria-labelledby="assistant-demo-title">
        <LandingSectionShell tone="signal">
            <div className="space-y-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                <Badge
                  variant="secondary"
                  className="rounded-[4px] border-2 border-border bg-accent px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent-foreground"
                >
                  Guided Setup Demo
                </Badge>
                <div>
                  <h2
                    id="assistant-demo-title"
                    className="font-serif text-4xl font-black uppercase leading-[0.9] tracking-[0.06em] sm:text-5xl"
                  >
                    Assistant
                  </h2>
                  <p className="mt-3 max-w-3xl text-primary-foreground/72">
                    This is a static marketing walkthrough, not an interactive
                    chat. The point is the workflow: a user states intent, the
                    assistant drives real MCP-backed product steps, and setup
                    keeps moving without forcing deep technical knowledge.
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="secondary"
                className="border-2 border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <a
                  href="https://demo.classifyre.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open live demo
                </a>
              </Button>
            </div>

            <AssistantDemoShowcase steps={assistantDemoFlow} />
          </div>
        </LandingSectionShell>
      </section>

      <section aria-labelledby="sources-title">
        <LandingSectionShell tone="plain">
          <div className="space-y-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <Badge
                  variant="secondary"
                  className="rounded-[4px] border-2 border-border bg-accent px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent-foreground"
                >
                  Supported Sources
                </Badge>
                <div>
                  <h2 id="sources-title" className="font-serif text-4xl font-black uppercase leading-[0.9] tracking-[0.06em] sm:text-5xl">
                    Scan the systems you already own
                  </h2>
                  <p className="mt-3 max-w-3xl text-muted-foreground">
                    Classifyre is built for mixed estates: operational databases,
                    lakehouse and warehouse platforms, collaboration systems,
                    analytics assets, and public-facing content.
                  </p>
                </div>
              </div>
              <Button asChild variant="secondary" className="border-2 border-border">
                <a
                  href="https://docs.classifyre.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Connector docs
                </a>
              </Button>
            </div>

            <div className="edge-fade-x overflow-hidden py-3">
              <div className="marquee-track-slow flex w-max items-stretch gap-14 py-6">
                {marqueeEntries.map((entry, index) => (
                  <div
                    key={`${entry.type}-${index}`}
                    className="flex min-w-40 flex-col items-center justify-center gap-4 px-5 text-center"
                  >
                    <SourceIcon
                      source={String(entry.icon)}
                      size="lg"
                      className="[&_svg]:h-14 [&_svg]:w-14 [&_svg]:text-foreground"
                    />
                    <span className="max-w-32 text-base font-medium uppercase tracking-[0.08em]">
                      {entry.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <SourceCatalog entries={searchableSourceEntries} actionLabel="Docs" />
          </div>
        </LandingSectionShell>
      </section>

      <section aria-labelledby="detectors-title">
        <LandingSectionShell tone="signal">
          <div className="space-y-6">
            <div className="space-y-3">
              <Badge
                variant="secondary"
                className="rounded-[4px] border-2 border-border bg-accent px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent-foreground"
              >
                Detectors
              </Badge>
              <div>
                <h2 id="detectors-title" className="font-serif text-4xl font-black uppercase leading-[0.9] tracking-[0.06em] sm:text-5xl">
                  From detection to routing logic
                </h2>
                <p className="mt-3 max-w-3xl text-primary-foreground/72">
                  Built-in detectors cover the risk, moderation, and governance
                  paths teams need first. Every card below links straight to the
                  canonical docs reference at https://docs.classifyre.com.
                </p>
              </div>
            </div>

            <DetectorReferenceGrid
              detectors={activeDetectors}
              hrefPrefix="https://docs.classifyre.com/detectors/"
              external
            />

            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="panel-card rounded-[8px] bg-accent text-accent-foreground">
                <CardHeader className="gap-4">
                  <div className="flex items-center gap-3">
                    <Marker label="GLN" />
                    <div>
                      <CardTitle className="text-3xl uppercase tracking-[0.04em]">
                        Custom detectors
                      </CardTitle>
                      <CardDescription className="text-accent-foreground/80">
                        Extend Classifyre when the built-ins are not enough.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-6">
                    Build rulesets for deterministic policies, classifiers for
                    semantic decisions, or multilingual entity detectors with GLiNER.
                    When detection fires, extractor blocks can pull structured fields
                    directly into the finding.
                  </p>
                  <ul className="space-y-3 text-sm">
                    {customDetectorMethods.map((method) => (
                      <li key={method} className="flex items-start gap-3">
                        <span className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 border border-current" />
                        <span>{method}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="panel-card rounded-[8px] bg-card/80">
                <CardHeader className="gap-4">
                  <div className="flex items-center gap-3">
                    <Marker label="OUT" />
                    <div>
                      <CardTitle className="text-3xl uppercase tracking-[0.04em]">
                        Structured output
                      </CardTitle>
                      <CardDescription>
                        Detection can become routing metadata, spans, and extracted fields.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    Use extractors to capture values such as contracting parties,
                    risk clauses, dates, IDs, and regulatory amounts once a detector
                    has matched.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="border border-border bg-muted/30 p-3">
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/60">
                        Outputs
                      </p>
                      <p className="mt-2 text-foreground">
                        labels, spans, structured fields, routing metadata
                      </p>
                    </div>
                    <div className="border border-border bg-muted/30 p-3">
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/60">
                        Good fit
                      </p>
                      <p className="mt-2 text-foreground">
                        compliance reviews, moderation pipelines, semantic tagging
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </LandingSectionShell>
      </section>

      <section aria-labelledby="deploy-title">
        <LandingSectionShell tone="plain">
          <div className="space-y-6">
            <div className="space-y-3">
              <Badge
                variant="secondary"
                className="rounded-[4px] border-2 border-border bg-accent px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent-foreground"
              >
                Delivery
              </Badge>
              <div>
                <h2 id="deploy-title" className="font-serif text-4xl font-black uppercase leading-[0.9] tracking-[0.06em] sm:text-5xl">
                  From fast evaluation to enterprise rollout
                </h2>
                <p className="mt-3 max-w-3xl text-muted-foreground">
                  The product path is simple: validate quickly, show the demo, then
                  move into the production topology when the workload and governance
                  bar get real.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {deploymentModes.map((mode) => (
                <Card
                  key={mode.title}
                  className={`panel-card rounded-[8px] border-2 ${mode.tone}`}
                >
                  <CardHeader className="gap-4">
                    <div className="inline-flex w-fit border border-border bg-background px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em]">
                      {mode.marker}
                    </div>
                    <div>
                      <CardTitle className="text-2xl uppercase tracking-[0.04em]">
                        {mode.title}
                      </CardTitle>
                      <CardDescription className="mt-2 text-current/75">
                        {mode.body}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <EditionGrid />
          </div>
        </LandingSectionShell>
      </section>

      <section aria-labelledby="journal-title">
        <LandingSectionShell tone="signal">
          <div className="space-y-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <Badge
                  variant="secondary"
                  className="rounded-[4px] border-2 border-border bg-accent px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent-foreground"
                >
                  Journal
                </Badge>
                <div>
                  <h2 id="journal-title" className="font-serif text-4xl font-black uppercase leading-[0.9] tracking-[0.06em] sm:text-5xl">
                    Product notes and engineering detail
                  </h2>
                  <p className="mt-3 max-w-3xl text-primary-foreground/72">
                    The blog still matters. It now sits behind the product story:
                    deployment notes, system design tradeoffs, and engineering
                    writing for teams operating Classifyre seriously.
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="secondary"
                className="border-2 border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href="/blog">Browse all articles</Link>
              </Button>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {featuredPosts.map((post) => (
                <Card key={post.route} className="panel-card rounded-[8px] bg-card/80">
                  <CardHeader className="gap-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-block h-2.5 w-2.5 bg-accent" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                    <CardTitle className="text-2xl leading-tight">
                      {post.title}
                    </CardTitle>
                    <CardDescription>{post.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={`${post.route}-${tag}`}
                          variant="secondary"
                          className="border border-border"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      asChild
                      variant="secondary"
                      className="w-full border-2 border-border"
                    >
                      <Link href={post.route}>Read article</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </LandingSectionShell>
      </section>
    </main>
  );
}
