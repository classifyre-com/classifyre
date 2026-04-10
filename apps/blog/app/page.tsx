import type { Metadata } from "next";
import type { ReactNode } from "react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  DetectorCatalog,
  SourceCatalog,
  SourceIcon,
  detectorCatalogGroups,
  resolveDetectorGroupId,
} from "@workspace/ui/components";
import {
  SOURCE_TYPE_CATALOG_META,
  resolveSourceCatalogMeta,
  type SourceCatalogEntry,
} from "@workspace/ui/lib/source-catalog";
import { softwareVersion } from "@workspace/ui/lib/software-version";
import { cn } from "@workspace/ui/lib/utils";
import { getAllDetectorDocs } from "@workspace/schemas/detector-docs";
import { getAllSourceDocs } from "@workspace/schemas/source-docs";

import { normalizeSiteUrl, safeJsonLdStringify } from "@/lib/seo";
import { AssistantDemo } from "@/components/assistant-demo";

export const metadata: Metadata = {
  title: "Detect, Classify, and Label Any Source",
  description:
    "Classifyre detects, classifies, and labels data across databases, lakehouses, collaboration tools, analytics systems, and public content with an open-source core from Docker evaluation to production Kubernetes.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Classifyre | Detect, Classify, and Label Any Source",
    description:
      "Run Classifyre in one Docker command, deploy the open-source core on Kubernetes, or add enterprise governance and support.",
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
const dockerRunCommand = [
  "docker run --rm -p 3000:3000 \\",
  `classifyre/all-in-one:${softwareVersion}`,
];
const helmInstallCommand = [
  "helm install classifyre \\",
  "  oci://registry-1.docker.io/classifyre/classifyre-core \\",
  `  --version ${softwareVersion}`,
];
const enterpriseContactEmail = "contact@classifyre.com";
const enterpriseCapabilities = [
  "Authorization, governance, and SLA-backed support for production programs",
  "Cloud deployment support across Kubernetes and OpenShift estates",
  "Multilanguage support for global compliance and operations teams",
  "Custom sources and detectors built around your domain and workflows",
] as const;

const customDetectorMethods = [
  {
    method: "RULESET",
    title: "Lock in exact business rules",
    description:
      "Match policy phrases, internal codes, contract clauses, campaign markers, and other deterministic patterns with regex or keyword rules.",
  },
  {
    method: "CLASSIFIER",
    title: "Tag meaning, intent, and tone",
    description:
      "Create contextual labels for things like renewal risk, promotional content, escalation language, or category intent, then improve them with reviewed examples over time.",
  },
  {
    method: "ENTITY",
    title: "Pull the entities your team tracks",
    description:
      "Extract parties, products, locations, IDs, jurisdictions, owners, and other domain-specific entities using labels written in your own language.",
  },
] as const;

const customDetectorGlossaryExamples = [
  "Strategic account",
  "Renewal risk",
  "Partner pricing language",
  "Regulated vendor",
  "Executive escalation",
  "Campaign theme",
] as const;

const customDetectorWorkflow = [
  "Define the business terms and tags your teams already use.",
  "Choose rulesets for exact patterns, classifiers for context, and entity extraction for named items.",
  "When a match lands, attach fields like owner, amount, clause, date, or routing metadata for downstream action.",
] as const;

const customDetectorFieldExamples = [
  "contract party",
  "renewal date",
  "risk clause",
  "region",
  "owner",
  "amount",
] as const;

const assistantClientExamples = [
  "Claude",
  "Codex CLI",
  "Gemini CLI",
  "Cursor",
  "VS Code",
  "Windsurf",
  "Continue",
  "Custom MCP clients",
] as const;

const assistantChecklist = [
  "Use the assistant inside the tools your team already prefers.",
  "Keep proprietary hosted models or connect your own custom MCP-capable stack.",
  "Give operators a real setup workflow instead of a generic AI chat.",
  "Create one MCP token per workspace and control access cleanly.",
] as const;

const assistantConnectionBenefits = [
  "Single HTTP MCP endpoint with bearer-token auth",
  "Works across local workspaces, cloud environments, and internal tools",
  "Lets the assistant create sources, manage custom detectors, inspect findings, and run workflows",
  "Fits teams standardizing on one vendor and teams mixing multiple model clients",
] as const;

const assistantConnectionSteps = [
  "Enable MCP in Classifyre settings.",
  "Create a token once and copy it when issued.",
  "Point your MCP-capable client at the `/mcp` endpoint.",
] as const;

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
  fullWidth = false,
  children,
  className = "",
}: {
  tone?: "signal" | "plain";
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        fullWidth
          ? "left-1/2 w-screen max-w-none -translate-x-1/2 rounded-none border-0"
          : "rounded-[8px] border-2 border-border",
        tone === "signal"
          ? "bg-foreground text-primary-foreground"
          : "bg-background text-foreground",
        className,
      )}
    >
      {tone === "signal" ? (
        <div className="landing-grid absolute inset-0 opacity-30" />
      ) : null}
      <div
        className={cn(
          "relative py-8 sm:py-10 lg:py-12",
          fullWidth ? "px-4 sm:px-6 lg:px-10" : "px-6 sm:px-8 lg:px-10",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function CommandBlock({
  label,
  lines,
  inverted = false,
}: {
  label: string;
  lines: readonly string[];
  inverted?: boolean;
}) {
  return (
    <div
      className={`border-2 border-border p-4 ${
        inverted
          ? "bg-foreground text-primary-foreground"
          : "bg-background text-foreground"
      }`}
    >
      <div
        className={`mb-3 text-[11px] font-mono uppercase tracking-[0.14em] ${
          inverted ? "text-primary-foreground/55" : "text-muted-foreground"
        }`}
      >
        {label}
      </div>
      <pre className="overflow-hidden whitespace-pre-wrap wrap-break-word font-mono text-xs leading-6 sm:text-sm">
        <code>{lines.join("\n")}</code>
      </pre>
    </div>
  );
}

export default function HomePage() {
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
  const activeDetectorItems = detectorDocs
    .filter((detector) => detector.catalogMeta.lifecycleStatus === "active")
    .map((detector) => ({
      id: detector.detectorType,
      type: detector.detectorType,
      title: detector.label,
      description: detector.catalogMeta.notes,
      categories: detector.catalogMeta.categories,
      lifecycleStatus: detector.catalogMeta.lifecycleStatus,
      priority: detector.catalogMeta.priority,
      groupId: resolveDetectorGroupId(
        detector.detectorType,
        detector.catalogMeta.categories,
      ),
      href: `https://docs.classifyre.com/detectors/${detector.slug}/`,
    }));

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
        name: "Docker Evaluation",
        price: "0",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "Open Source Core on Kubernetes",
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
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify(softwareApplicationSchema),
        }}
      />

      <section>
        <LandingSectionShell tone="signal" fullWidth>
          <div className="space-y-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-12">
              <div className="space-y-5 lg:flex-1">
                <h1 className="font-serif text-[clamp(3.9rem,9vw,6.8rem)] font-black uppercase leading-[0.84] tracking-[0.08em] text-primary-foreground">
                  <span className="block">Detect.</span>
                  <span className="block">
                    <span className="inline-block bg-accent px-[0.14em] text-accent-foreground dark:text-primary">
                      Classify.
                    </span>
                  </span>
                  <span className="block">Label.</span>
                </h1>
              </div>

              <div className="space-y-6 lg:flex-1">
                <p className="max-w-2xl text-left text-base leading-7 text-primary-foreground/78 sm:text-lg lg:text-left">
                  Classifyre turns messy, distributed source data into governed
                  signals. Connect the systems you already run, detect what
                  matters, classify content and findings, and label data for
                  security, privacy, moderation, and operational workflows.
                </p>

                <div className="flex flex-wrap gap-3 lg:justify-start">
                  <Button
                    asChild
                    className="border-2 border-accent bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <a
                      href="https://demo.classifyre.com/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Try Demo
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
                      Get Started
                    </a>
                  </Button>
                </div>
              </div>
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
                  Databases, lakehouses, collaboration tools, BI, and web
                  content.
                </p>
              </div>
              <div className="border border-primary-foreground/20 bg-primary-foreground/8 p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground/54">
                  Detector Families
                </p>
                <p className="mt-2 text-3xl font-black text-accent">
                  {activeDetectorItems.length}
                </p>
                <p className="mt-1 text-sm text-primary-foreground/68">
                  From secrets and PII to moderation, quality, and governance
                  tags.
                </p>
              </div>
              <div className="border border-primary-foreground/20 bg-primary-foreground/8 p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground/54">
                  Deployment Modes
                </p>
                <p className="mt-2 text-3xl font-black text-accent">1 → N</p>
                <p className="mt-1 text-sm text-primary-foreground/68">
                  Docker evaluation, Kubernetes core, then enterprise.
                </p>
              </div>
            </div>
          </div>
        </LandingSectionShell>
      </section>

      <section aria-labelledby="runtime-title">
        <LandingSectionShell tone="plain" fullWidth>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start pb-10">
            <h2
              id="runtime-title"
              className="font-serif text-4xl font-black uppercase leading-[0.9] sm:text-5xl tracking-wider"
            >
              From fast evaluation to enterprise rollout
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Start with the single-container runtime to test the workflow, move
              to the Helm chart when you are ready for a real cluster, and
              contact us when the rollout needs enterprise controls and
              commercial support.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card className="panel-card h-full rounded-[16px] border-2 bg-card">
              <CardHeader className="gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-2xl uppercase tracking-[0.04em]">
                    01 Evaluate
                  </CardTitle>
                  <CardDescription className="text-sm leading-6 text-muted-foreground">
                    Bring up the full product locally in one Docker command. Use
                    it for testing, demos, and first-touch evaluation.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <CommandBlock
                  label="Quick start"
                  lines={dockerRunCommand}
                  inverted
                />
                <p className="text-sm leading-6 text-muted-foreground">
                  Fastest setup, but not the production topology.
                </p>
                <div className="mt-auto pt-2">
                  <Button
                    asChild
                    variant="secondary"
                    className="w-full border-2 border-border"
                  >
                    <a
                      href="https://docs.classifyre.com/deployment/docker/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      All-in-One Docker docs
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="panel-card h-full rounded-[16px] border-2 bg-foreground text-primary-foreground">
              <CardHeader className="gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-2xl uppercase tracking-[0.04em] text-primary-foreground">
                    02 Run in production
                  </CardTitle>
                  <CardDescription className="text-sm leading-6 text-primary-foreground/72">
                    Production-ready deployment to Kubernetes using Helm on your
                    own cluster, whether self-hosted or in the cloud.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <CommandBlock label="Helm install" lines={helmInstallCommand} />
                <p className="text-sm leading-6 text-primary-foreground/72">
                  Production-ready core for Kubernetes clusters, without
                  enterprise authorization, governance, or SLA coverage.
                </p>
                <div className="mt-auto pt-2">
                  <Button
                    asChild
                    variant="secondary"
                    className="w-full border-2 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/16"
                  >
                    <a
                      href="https://docs.classifyre.com/deployment/kubernetes/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Helm chart docs
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="panel-card h-full rounded-[16px] border-2 bg-background">
              <CardHeader className="gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-2xl uppercase tracking-[0.04em]">
                    03 Add enterprise
                  </CardTitle>
                  <CardDescription className="text-sm leading-6 text-muted-foreground">
                    Turn the open-source core into a supported platform for
                    regulated, global, and heavily customized deployments.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div>
                  <div className="space-y-3">
                    {enterpriseCapabilities.map((capability) => (
                      <label
                        key={capability}
                        className="flex items-start gap-3 text-sm leading-6 text-foreground"
                      >
                        <Checkbox
                          checked
                          tabIndex={-1}
                          aria-readonly="true"
                          className="pointer-events-none mt-1"
                        />
                        <span>{capability}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mt-auto pt-2">
                  <Button
                    asChild
                    className="w-full border-2 border-accent bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <a href={`mailto:${enterpriseContactEmail}`}>Contact Us</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </LandingSectionShell>
      </section>

      <section aria-labelledby="sources-title">
        <LandingSectionShell tone="plain">
          <div className="space-y-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <div>
                  <h2
                    id="sources-title"
                    className="font-serif text-4xl font-black uppercase leading-[0.9] tracking-[0.06em] sm:text-5xl"
                  >
                    Scan the systems you already own
                  </h2>
                  <p className="mt-3 max-w-3xl text-muted-foreground">
                    Classifyre is built for mixed estates: operational
                    databases, lakehouse and warehouse platforms, collaboration
                    systems, analytics assets, and public-facing content.
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="secondary"
                className="border-2 border-border"
              >
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

            <SourceCatalog entries={searchableSourceEntries} />
          </div>
        </LandingSectionShell>
      </section>

      <section aria-labelledby="detectors-title">
        <LandingSectionShell tone="signal">
          <div className="space-y-6">
            <div className="space-y-3">
              <div>
                <h2
                  id="detectors-title"
                  className="font-serif text-4xl font-black uppercase leading-[0.9] tracking-[0.06em] sm:text-5xl"
                >
                  From built-ins to your business language
                </h2>
                <p className="mt-3 max-w-3xl text-primary-foreground/72">
                  Built-in detectors cover the risk, moderation, and governance
                  paths teams need first. Then you can layer your own glossary,
                  business tags, and operational routing on top.
                </p>
              </div>
            </div>

            <DetectorCatalog
              items={activeDetectorItems}
              groups={detectorCatalogGroups}
              external
            />

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
              <Card className="panel-card relative overflow-hidden rounded-[18px] border-2 border-accent bg-accent text-accent-foreground">
                <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_58%)] opacity-80" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.08))]" />
                <CardHeader className="relative gap-6 pb-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Marker label="TAGS" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-foreground/72">
                      Your glossary, your labels, your workflow
                    </span>
                  </div>
                  <div className="max-w-3xl space-y-4">
                    <CardTitle className="text-4xl uppercase tracking-[0.04em] sm:text-5xl">
                      Build a business glossary that actually runs
                    </CardTitle>
                    <CardDescription className="max-w-2xl text-base leading-7 text-accent-foreground/82 sm:text-lg">
                      Turn Classifyre into a tagging system built around your
                      own language. Name the concepts that matter to revenue,
                      operations, compliance, or support, then detect them
                      across documents, tickets, chats, dashboards, and public
                      content.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {customDetectorGlossaryExamples.map((example) => (
                      <span
                        key={example}
                        className="border border-accent-foreground/25 bg-accent-foreground/10 px-3 py-2 text-[11px] font-mono uppercase tracking-[0.12em] text-accent-foreground backdrop-blur"
                      >
                        {example}
                      </span>
                    ))}
                  </div>

                  <div className="grid gap-3 lg:grid-cols-3">
                    {customDetectorMethods.map((method) => (
                      <div
                        key={method.method}
                        className="border border-accent-foreground/22 bg-accent-foreground/8 p-4 backdrop-blur"
                      >
                        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-foreground/68">
                          {method.method}
                        </p>
                        <p className="mt-3 text-lg font-semibold uppercase leading-tight tracking-[0.04em]">
                          {method.title}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-accent-foreground/80">
                          {method.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)]">
                    <div className="border border-accent-foreground/22 bg-accent-foreground/8 p-4 backdrop-blur">
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-foreground/68">
                        How teams use it
                      </p>
                      <ul className="mt-4 space-y-3 text-sm leading-6">
                        {customDetectorWorkflow.map((step) => (
                          <li key={step} className="flex items-start gap-3">
                            <span className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 border border-current" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border border-accent-foreground/22 bg-foreground p-4 text-primary-foreground">
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground/58">
                        After a match
                      </p>
                      <p className="mt-3 text-sm leading-6 text-primary-foreground/78">
                        Capture the fields downstream teams need for triage,
                        routing, and reporting.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {customDetectorFieldExamples.map((field) => (
                          <span
                            key={field}
                            className="border border-primary-foreground/16 bg-primary-foreground/8 px-3 py-2 text-[11px] font-mono uppercase tracking-[0.12em] text-primary-foreground"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-5">
                <Card className="panel-card rounded-[18px] border-2 bg-card/85">
                  <CardHeader className="gap-4">
                    <div className="flex items-center gap-3">
                      <Marker label="TRAIN" />
                      <div>
                        <CardTitle className="text-3xl uppercase tracking-[0.04em]">
                          Start fast, refine over time
                        </CardTitle>
                        <CardDescription>
                          Launch with label definitions first, then harden the
                          classifier with reviewed examples from real scans.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      The custom detector flow supports immediate tagging for
                      new categories and a training path for better domain fit
                      as your team confirms findings.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="border border-border bg-muted/30 p-3">
                        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/60">
                          01
                        </p>
                        <p className="mt-2 text-foreground">
                          Define labels that match the business language.
                        </p>
                      </div>
                      <div className="border border-border bg-muted/30 p-3">
                        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/60">
                          02
                        </p>
                        <p className="mt-2 text-foreground">
                          Review findings and keep the good examples.
                        </p>
                      </div>
                      <div className="border border-border bg-muted/30 p-3">
                        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/60">
                          03
                        </p>
                        <p className="mt-2 text-foreground">
                          Train the detector so it fits your domain better.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="panel-card rounded-[18px] border-2 bg-foreground text-primary-foreground">
                  <CardHeader className="gap-4">
                    <div className="flex items-center gap-3">
                      <Marker label="OPS" />
                      <div>
                        <CardTitle className="text-3xl uppercase tracking-[0.04em] text-primary-foreground">
                          More than a flag
                        </CardTitle>
                        <CardDescription className="text-primary-foreground/72">
                          Route findings with business-ready context instead of
                          generic alerts.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-primary-foreground/78">
                    <p>
                      Matches can become tags, extracted fields, and routing
                      metadata that feed moderation queues, compliance reviews,
                      vendor workflows, support escalation, or reporting.
                    </p>
                    <Button
                      asChild
                      variant="secondary"
                      className="w-full border-2 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/16"
                    >
                      <a
                        href="https://docs.classifyre.com/detectors/custom-detectors/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Custom detector docs
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </LandingSectionShell>
      </section>
      <section aria-labelledby="assistant-demo-title">
        <LandingSectionShell tone="plain">
          <div className="space-y-6">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <Card className="panel-card relative overflow-hidden rounded-[20px] border-2 border-foreground bg-foreground text-primary-foreground">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_42%),linear-gradient(135deg,transparent,rgba(255,255,255,0.05))]" />
                <CardHeader className="relative gap-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Marker label="MCP" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary-foreground/58">
                      Assistant connectivity
                    </span>
                  </div>
                  <div className="max-w-3xl space-y-4">
                    <CardTitle
                      id="assistant-demo-title"
                      className="text-4xl uppercase tracking-[0.04em] text-primary-foreground sm:text-5xl"
                    >
                      Bring the assistant to the models you already use
                    </CardTitle>
                    <CardDescription className="max-w-2xl text-base leading-7 text-primary-foreground/78 sm:text-lg">
                      Classifyre exposes an MCP server over HTTP, so the
                      assistant can plug into the clients your team already
                      runs. That means vendor-hosted AI tools, coding agents,
                      and custom internal clients can all operate the same setup
                      flow through one connection pattern.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.72fr)]">
                  <div className="space-y-4">
                    {assistantChecklist.map((item) => (
                      <label
                        key={item}
                        className="flex items-start gap-3 text-sm leading-6 text-primary-foreground"
                      >
                        <Checkbox
                          checked
                          tabIndex={-1}
                          aria-readonly="true"
                          className="pointer-events-none mt-1 border-primary-foreground/30 data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>

                  <div className="border border-primary-foreground/16 bg-primary-foreground/8 p-4 backdrop-blur">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground/58">
                      Connection pattern
                    </p>
                    <div className="mt-4 space-y-3">
                      {assistantConnectionSteps.map((step, index) => (
                        <div
                          key={step}
                          className="border border-primary-foreground/12 bg-primary-foreground/6 p-3"
                        >
                          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground/48">
                            0{index + 1}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-primary-foreground/80">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 border border-primary-foreground/12 bg-background/95 p-3 text-foreground">
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/60">
                        Endpoint
                      </p>
                      <p className="mt-2 font-mono text-xs leading-6 sm:text-sm">
                        https://&lt;your-host&gt;/mcp
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-5">
                <Card className="panel-card rounded-[20px] border-2 bg-accent text-accent-foreground">
                  <CardHeader className="gap-4">
                    <div className="flex items-center gap-3">
                      <Marker label="USE" />
                      <div>
                        <CardTitle className="text-3xl uppercase tracking-[0.04em]">
                          Works with the stack you have
                        </CardTitle>
                        <CardDescription className="text-accent-foreground/78">
                          Documented client setups cover both off-the-shelf
                          tools and custom MCP consumers.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {assistantClientExamples.map((client) => (
                        <span
                          key={client}
                          className="border border-accent-foreground/18 bg-accent-foreground/8 px-3 py-2 text-[11px] font-mono uppercase tracking-[0.12em]"
                        >
                          {client}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm leading-6 text-accent-foreground/82">
                      The docs explicitly cover Claude, Codex CLI, Gemini CLI,
                      Cursor, Windsurf, VS Code, Continue, and custom clients.
                    </p>
                  </CardContent>
                </Card>

                <Card className="panel-card rounded-[20px] border-2 bg-card">
                  <CardHeader className="gap-4">
                    <div className="flex items-center gap-3">
                      <Marker label="WHY" />
                      <div>
                        <CardTitle className="text-3xl uppercase tracking-[0.04em]">
                          Why teams adopt it
                        </CardTitle>
                        <CardDescription>
                          The assistant becomes an operational surface, not just
                          another chatbot tab.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {assistantConnectionBenefits.map((benefit) => (
                      <label
                        key={benefit}
                        className="flex items-start gap-3 text-sm leading-6 text-foreground"
                      >
                        <Checkbox
                          checked
                          tabIndex={-1}
                          aria-readonly="true"
                          className="pointer-events-none mt-1"
                        />
                        <span>{benefit}</span>
                      </label>
                    ))}
                    <Button
                      asChild
                      className="w-full border-2 border-accent bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      <a
                        href="https://docs.classifyre.com/mcp-server/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        MCP server docs
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <AssistantDemo />
          </div>
        </LandingSectionShell>
      </section>
    </main>
  );
}
