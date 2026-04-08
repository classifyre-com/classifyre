import { Badge } from "./badge";
import { Card, CardDescription, CardHeader, CardTitle } from "./card";

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
      {detectors
        .filter((detector) => detector.detectorType !== "CUSTOM")
        .map((detector) => {
          const href = `${hrefPrefix}${detector.slug}${hrefPrefix.endsWith("/") ? "" : "/"}`;

          return (
            <a
              key={detector.detectorType}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer" : undefined}
              className="block h-full rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Card
                clickable
                className="h-full"
                data-testid={`detector-type-${detector.detectorType}`}
              >
                <CardHeader className="gap-4 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <CardTitle>
                        {detector.detectorType?.replaceAll("_", " ")}
                      </CardTitle>
                      <CardDescription className="max-w-xl text-sm leading-relaxed">
                        {detector.catalogMeta.notes}
                      </CardDescription>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      {detector.catalogMeta.categories.map((category) => (
                        <Badge
                          key={`${detector.detectorType}-${category}`}
                          variant="secondary"
                          className="rounded-lg border bg-background px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-foreground"
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </a>
          );
        })}
    </div>
  );
}
