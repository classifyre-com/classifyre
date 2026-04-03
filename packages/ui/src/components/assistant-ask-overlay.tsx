"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

import { cn } from "../lib/utils";
import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";
import { ScrollArea } from "./scroll-area";
import { Spinner } from "./spinner";
import { Textarea } from "./textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

type AssistantOverlayText = {
  placeholder?: string;
  send?: string;
  thinking?: string;
  hide?: string;
  tooltip?: string;
};

type AssistantRequestMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type AssistantDemoMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  delayMs?: number;
};

export type AssistantOverlayProps = {
  title: string;
  summary?: string;
  promptContext: string;
  generateText?: (messages: AssistantRequestMessage[]) => Promise<string>;
  translations?: AssistantOverlayText;
  buttonLabel?: string;
  buttonClassName?: string;
  buttonContent?: React.ReactNode;
  buttonAriaLabel?: string;
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  buttonSize?: React.ComponentProps<typeof Button>["size"];
  contentSide?: "top" | "right" | "bottom" | "left";
  inline?: boolean;
  contentClassName?: string;
  scrollAreaClassName?: string;
  initialInput?: string;
  autoAskOnMount?: boolean;
  demoMessages?: readonly AssistantDemoMessage[];
  autoPlayDemo?: boolean;
  hideComposer?: boolean;
};

type ChatMessage = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
};

function chunkResponse(text: string) {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > 48) {
      if (current) {
        chunks.push(current);
      }
      current = word;
    } else {
      current = next;
    }
  });

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

export function AssistantAskOverlay({
  title,
  summary,
  promptContext,
  generateText,
  translations,
  buttonLabel = "Ask AI",
  buttonClassName,
  buttonContent,
  buttonAriaLabel,
  buttonVariant = "outline",
  buttonSize = "sm",
  contentSide = "top",
  inline = false,
  contentClassName,
  scrollAreaClassName,
  initialInput = "",
  autoAskOnMount = false,
  demoMessages,
  autoPlayDemo = false,
  hideComposer = false,
}: AssistantOverlayProps) {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState(initialInput);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [pending, setPending] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const endRef = React.useRef<HTMLDivElement | null>(null);
  const autoAskKeyRef = React.useRef<string | null>(null);
  const autoDemoKeyRef = React.useRef<string | null>(null);

  const text = React.useMemo(
    () => ({
      placeholder: "Ask the assistant",
      send: "Send",
      thinking: "Thinking",
      hide: "Hide assistant",
      tooltip: "Ask the AI assistant",
      ...translations,
    }),
    [translations],
  );

  React.useEffect(() => {
    if (inline) {
      return;
    }

    if (!open) {
      return;
    }

    setMessages([]);
    setInput(initialInput);
  }, [inline, open, title, initialInput]);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const query = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const handleAsk = React.useCallback(
    async (value?: string) => {
      const trimmed = (value ?? input).trim();
      if (!trimmed || !generateText) {
        return;
      }

      setPending(true);
      setInput("");

      const userMessage: ChatMessage = {
        id: `${Date.now()}-user`,
        role: "user",
        content: trimmed,
      };
      const assistantId = `${Date.now()}-assistant`;
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
      };

      const history = [...messages, userMessage];
      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      try {
        const answer = await generateText([
          {
            role: "system",
            content: `${promptContext}\nAnswer concisely with actionable guidance.`,
          },
          ...history.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        ]);

        const chunks = chunkResponse(answer.trim());
        if (chunks.length === 0) {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId ? { ...message, content: "" } : message,
            ),
          );
          setPending(false);
          return;
        }

        let index = 0;
        const interval = window.setInterval(() => {
          index += 1;
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, content: chunks.slice(0, index).join(" ") }
                : message,
            ),
          );

          if (index >= chunks.length) {
            window.clearInterval(interval);
            setPending(false);
          }
        }, 35);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to generate response.";

        setMessages((prev) =>
          prev.map((item) =>
            item.id === assistantId
              ? { ...item, content: `Error: ${message}` }
              : item,
          ),
        );
        setPending(false);
      }
    },
    [generateText, input, messages, promptContext],
  );

  React.useEffect(() => {
    if (!inline || autoPlayDemo || !autoAskOnMount || !initialInput.trim()) {
      return;
    }

    const autoAskKey = `${title}:${initialInput}`;
    if (autoAskKeyRef.current === autoAskKey) {
      return;
    }

    autoAskKeyRef.current = autoAskKey;
    setMessages([]);
    setInput(initialInput);

    const timer = window.setTimeout(() => {
      void handleAsk(initialInput);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [autoAskOnMount, autoPlayDemo, handleAsk, initialInput, inline, title]);

  React.useEffect(() => {
    if (!inline || !autoPlayDemo || !demoMessages || demoMessages.length === 0) {
      return;
    }

    const demoKey = `${title}:${demoMessages
      .map((message) => `${message.role}:${message.content}`)
      .join("|")}`;

    if (autoDemoKeyRef.current === demoKey) {
      return;
    }

    autoDemoKeyRef.current = demoKey;

    let cancelled = false;

    const sleep = (ms: number) =>
      new Promise((resolve) => window.setTimeout(resolve, ms));

    const runDemo = async () => {
      setMessages([]);
      setInput("");
      setPending(false);

      for (const [index, message] of demoMessages.entries()) {
        if (cancelled) {
          return;
        }

        if (message.role !== "user") {
          setPending(true);
          await sleep(index === 0 ? 300 : 700);
          if (cancelled) {
            return;
          }
        }

        setPending(false);
        setMessages((previous) => [
          ...previous,
          {
            id: `${index}-${message.role}`,
            role: message.role,
            content: message.content,
          },
        ]);

        await sleep(message.delayMs ?? (message.role === "user" ? 750 : 1150));
      }

      setPending(false);
    };

    void runDemo();

    return () => {
      cancelled = true;
    };
  }, [autoPlayDemo, demoMessages, inline, title]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleAsk();
    }
  };

  const chatBody = (
    <>
      {messages.length > 0 ? (
        <ScrollArea
          className={cn(
            "h-56 rounded-[4px] border border-border bg-muted/30 p-3",
            scrollAreaClassName,
          )}
        >
          <div className="flex flex-col gap-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user"
                    ? "justify-end"
                    : message.role === "system"
                      ? "justify-center"
                      : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] overflow-x-auto px-3 py-2 text-xs whitespace-pre-wrap",
                    message.role === "user"
                      ? "bg-foreground text-primary-foreground"
                      : message.role === "system"
                        ? "border border-border bg-accent text-accent-foreground"
                      : "border border-border bg-background text-foreground",
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {pending ? (
              <div className="flex justify-start">
                <div className="border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                  ...
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>
        </ScrollArea>
      ) : null}

      {hideComposer ? null : (
        <div className="space-y-2">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={text.placeholder}
            className="min-h-[88px] border-2 border-border bg-background"
          />
          <Button
            onClick={() => void handleAsk()}
            disabled={!input.trim() || pending || !generateText}
            className="w-full"
          >
            {pending ? (
              <Spinner size="sm" label={text.thinking} />
            ) : (
              text.send
            )}
          </Button>
        </div>
      )}
    </>
  );

  if (inline) {
    return (
      <div
        className={cn(
          "space-y-4 border-2 border-border bg-card p-5 shadow-[6px_6px_0_var(--color-border)]",
          contentClassName,
        )}
      >
        <div className="space-y-1 border-b-2 border-border pb-4">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles className="h-4 w-4 text-accent" />
            Assistant
          </div>
          <h3 className="font-serif text-2xl font-black uppercase tracking-[0.05em] text-foreground sm:text-3xl">
            {title}
          </h3>
          {summary ? (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {summary}
            </p>
          ) : null}
        </div>
        {chatBody}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={buttonVariant}
                size={buttonSize}
                className={cn("gap-2", buttonClassName)}
                aria-label={buttonAriaLabel ?? buttonLabel}
              >
                {buttonContent ?? buttonLabel}
              </Button>
            </PopoverTrigger>
            {!isMobile ? (
              <PopoverContent
                align="end"
                side={contentSide}
                className={cn("w-[360px] space-y-4", contentClassName)}
              >
                <PopoverHeader>
                  <PopoverTitle className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {title}
                  </PopoverTitle>
                  {summary ? (
                    <PopoverDescription>{summary}</PopoverDescription>
                  ) : null}
                </PopoverHeader>
                {chatBody}
              </PopoverContent>
            ) : null}
          </Popover>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={6}>
          {text.tooltip}
        </TooltipContent>
      </Tooltip>

      {isMobile ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="h-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:h-auto sm:max-w-lg">
            <DialogHeader className="gap-1">
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {title}
              </DialogTitle>
              {summary ? <DialogDescription>{summary}</DialogDescription> : null}
            </DialogHeader>

            {chatBody}
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="w-full">
                {text.hide}
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
