"use client";

import {
  AssistantAskOverlay as SharedAssistantAskOverlay,
  type AssistantOverlayProps as SharedAssistantOverlayProps,
} from "@workspace/ui/components";

import { useAssistantModel } from "@/components/assistant-model-provider";
import { useTranslation } from "@/hooks/use-translation";

export type AssistantOverlayProps = Omit<
  SharedAssistantOverlayProps,
  "generateText" | "translations"
>;

export function AssistantAskOverlay(props: AssistantOverlayProps) {
  const { generateText } = useAssistantModel();
  const { t } = useTranslation();

  return (
    <SharedAssistantAskOverlay
      {...props}
      generateText={generateText}
      translations={{
        placeholder: t("ai.ask"),
        send: t("common.send"),
        thinking: t("ai.thinking"),
        hide: "Hide assistant",
        tooltip: "Ask the AI assistant",
      }}
    />
  );
}
