import { Badge } from "./badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

export type DetectorReferenceGridItem = {
  detectorType: string;
  slug: string;
  label: string;
  examples: readonly unknown[];
  catalogMeta: {
    lifecycleStatus: string;
    categories: readonly string[];
    supportedAssetTypes: readonly string[];
    notes: string | null;
  };
};

function lifecycleBadgeStyle(status: string): string {
  if (status === "active") {
    return "border-green-500/40 text-green-600 dark:text-green-400";
  }

  if (status === "experimental") {
    return "border-yellow-500/40 text-yellow-600 dark:text-yellow-400";
  }

  if (status === "deprecated") {
    return "border-red-500/40 text-red-500";
  }

  return "";
}

export function DetectorReferenceGrid({
  detectors,
  hrefPrefix = "/detectors/",
  external = false,
}: {
  detectors: readonly DetectorReferenceGridItem[];
  hrefPrefix?: string;
  external?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {detectors.map((detector) => (
        <a
          key={detector.detectorType}
          href={`${hrefPrefix}${detector.slug}${hrefPrefix.endsWith("/") ? "" : "/"}`}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className="group"
        >
          <Card className="panel-card h-full rounded-[8px] bg-card/80 transition-colors group-hover:bg-accent/10">
            <CardHeader className="gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <CardTitle className="text-xl uppercase tracking-[0.04em]">
                    {detector.label}
                  </CardTitle>
                  <CardDescription>
                    {detector.catalogMeta.notes ??
                      "Schema-driven detector reference with examples and configuration details."}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 text-[10px] uppercase ${lifecycleBadgeStyle(detector.catalogMeta.lifecycleStatus)}`}
                >
                  {detector.catalogMeta.lifecycleStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {detector.catalogMeta.categories.map((category) => (
                  <Badge
                    key={`${detector.detectorType}-${category}`}
                    variant="secondary"
                    className="border border-border bg-background text-[10px] uppercase tracking-[0.12em]"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="border border-border px-3 py-1">
                  {detector.catalogMeta.supportedAssetTypes.join(", ")}
                </span>
                <span className="border border-border px-3 py-1">
                  {detector.examples.length} examples
                </span>
              </div>
              <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                Open detector docs
              </div>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  );
}
