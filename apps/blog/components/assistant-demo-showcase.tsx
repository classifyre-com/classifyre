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

function buildDemoReply(
  prompt: string,
  steps: readonly AssistantDemoStep[],
) {
  const normalizedPrompt = prompt.toLowerCase();
  const intro = normalizedPrompt.includes("slack")
    ? "I can stage Slack onboarding, weekday scheduling, and detector selection in the same flow."
    : "I can stage Snowflake onboarding, weekday scheduling, and detector selection in the same flow.";

  const timeline = steps
    .map((step) => {
      const prefix =
        step.kind === "system"
          ? "System"
          : step.kind === "assistant"
            ? "Assistant"
            : "User";
      return `- **${prefix} · ${step.label}**: ${step.body}`;
    })
    .join("\n");

  return `${intro}

**Landing-page demo sequence**

${timeline}

**Result**

- Source connection validated.
- Schedule captured as every working day in the morning.
- Known detectors proposed before drafting a Germany-specific custom detector.
- This is a marketing replay using the product assistant surface, not a live operator session.`;
}

export function AssistantDemoShowcase({
  steps,
}: AssistantDemoShowcaseProps) {
  const generateDemoText = React.useCallback(
    async (messages: Array<{ role: string; content: string }>) => {
      const lastUserMessage =
        messages
          .filter((message) => message.role === "user")
          .at(-1)
          ?.content.trim() ?? PRIMARY_PROMPT;

      await new Promise((resolve) => {
        window.setTimeout(resolve, 900);
      });

      return buildDemoReply(lastUserMessage, steps);
    },
    [steps],
  );

  return (
    <AssistantAskOverlay
      inline
      title="Ask Classifyre"
      summary="Static marketing demo using the same assistant surface as the product. It stages onboarding, scheduling, detector choice, and custom detector drafting in one place."
      promptContext="You are rendering a static marketing demo for the Classifyre landing page."
      generateText={generateDemoText}
      initialInput={PRIMARY_PROMPT}
      autoAskOnMount
      contentClassName="bg-card text-card-foreground"
      scrollAreaClassName="h-[24rem]"
      translations={{
        placeholder: "Describe what you want Classifyre to set up",
        send: "Replay demo",
        thinking: "Running demo",
      }}
    />
  );
}
