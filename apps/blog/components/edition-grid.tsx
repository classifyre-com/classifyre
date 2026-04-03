import Link from "next/link";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components";

const editionCards = [
  {
    name: "Open Source Core",
    eyebrow: "Self-hosted by default",
    description:
      "Connect real sources, run built-in detectors, build custom detectors, and ship a full working Classifyre instance with the open core.",
    highlights: [
      "All-in-one Docker runtime for demos and local evaluation",
      "Source connectors, detector families, and custom detector workflows",
      "Open docs, public repo, and no locked-down starter tier",
    ],
    ctaLabel: "Explore on GitHub",
    ctaHref: "https://github.com/classifyre-com/classifyre",
    ctaExternal: true,
    marker: "OS",
    accentClassName: "bg-card text-foreground",
  },
  {
    name: "Enterprise",
    eyebrow: "Operate at scale",
    description:
      "Keep the same product core and add the operating model enterprises actually need around it: rollout support, governance, access control, and multilingual programs.",
    highlights: [
      "Enterprise-grade Kubernetes deployment and rollout support",
      "SLA-backed support, governance controls, authentication and authorization",
      "Multilanguage operations for global compliance and content programs",
    ],
    ctaLabel: "Read deployment docs",
    ctaHref: "https://docs.classifyre.com/",
    ctaExternal: true,
    marker: "ENT",
    accentClassName: "bg-accent text-accent-foreground",
  },
] as const;

export function EditionGrid() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {editionCards.map((edition) => (
          <Card
            key={edition.name}
            className={`panel-card rounded-[20px] border-2 ${edition.accentClassName}`}
          >
            <CardHeader className="gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <Badge
                    variant="secondary"
                    className="w-fit rounded-[4px] border border-border bg-background/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground"
                  >
                    {edition.eyebrow}
                  </Badge>
                  <div className="space-y-2">
                    <CardTitle className="text-3xl uppercase tracking-[0.06em]">
                      {edition.name}
                    </CardTitle>
                    <p className="max-w-xl text-sm text-current/80">
                      {edition.description}
                    </p>
                  </div>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background/80">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em]">
                    {edition.marker}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <ul className="space-y-3 text-sm">
                {edition.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <span className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 border border-current" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  className="border-2 border-border bg-background text-foreground hover:bg-background/90"
                >
                  {edition.ctaExternal ? (
                    <a
                      href={edition.ctaHref}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {edition.ctaLabel}
                    </a>
                  ) : (
                    <Link href={edition.ctaHref}>{edition.ctaLabel}</Link>
                  )}
                </Button>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.14em] text-foreground/70">
                  Open core, enterprise path
                </div>
              </div>
            </CardContent>
          </Card>
      ))}
    </div>
  );
}
