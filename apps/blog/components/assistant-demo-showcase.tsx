"use client";

import * as React from "react";

import { AssistantAskOverlay } from "@workspace/ui/components";

type AssistantDemoStep = {
  kind: "user" | "assistant" | "system";
  speaker: string;
  label: string;
  body: string;
};

type AssistantDemoShowcaseProps = {
  steps: readonly AssistantDemoStep[];
};

const PRIMARY_PROMPT =
  "Connect my Snowflake. Here is the account URL, warehouse, and the read-only credentials.";

export function AssistantDemoShowcase({
  steps,
}: AssistantDemoShowcaseProps) {
  const demoMessages = React.useMemo(
    () =>
      steps.map((step) => ({
        role: step.kind,
        content: step.body,
      })),
    [steps],
  );

  return (
    <AssistantAskOverlay
      inline
      title="Ask Classifyre"
      summary="Static marketing demo using the same assistant surface as the product. It stages onboarding, scheduling, detector choice, and custom detector drafting in one place."
      promptContext="You are rendering a static marketing demo for the Classifyre landing page."
      initialInput={PRIMARY_PROMPT}
      demoMessages={demoMessages}
      autoPlayDemo
      hideComposer
      contentClassName="bg-card text-card-foreground"
      scrollAreaClassName="h-[24rem]"
      translations={{
        thinking: "Running demo",
      }}
    />
  );
}
