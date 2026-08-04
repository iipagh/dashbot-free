import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  listConversations,
  getMessages,
  saveMessages,
  createConversation,
  deleteConversation,
  renameConversation,
  decrementFreeMessages,
} from "@/lib/app.functions";
import { supabase } from "@/integrations/supabase/client";
import { useVoiceInput } from "@/lib/use-voice-input";
import {
  Copy, RefreshCw, Send, Plus, Search, Trash2, Loader2, MessageSquare, Sparkles, Pencil, Check, X, Mic, Square, Paperclip, FileText,
} from "lucide-react";
import { toast } from "sonner";


type Attachment = { name: string; mime: string; dataUrl: string };
type Msg = { id: string; role: "user" | "assistant"; content: string; attachments?: Attachment[] };

const MAX_FILE_BYTES = 8 * 1024 * 1024;

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Failed to read file"));
    r.readAsDataURL(file);
  });
}

export const Route = createFileRoute("/_authenticated/chat/$id")({
  component: ChatPage,
});

function ChatPage() {
  const { id: conversationId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const listFn = useServerFn(listConversations);
  const getMsgs = useServerFn(getMessages);
  const saveFn = useServerFn(saveMessages);
  const createFn = useServerFn(createConversation);
  const deleteFn = useServerFn(deleteConversation);
  const renameFn = useServerFn(renameConversation);
  const decFn = useServerFn(decrementFreeMessages);

  const convs = useQuery({ queryKey: ["conversations"], queryFn: () => listFn() });
  const msgsQ = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMsgs({ data: { conversationId } }),
  });

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [search, setSearch] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachTexts, setAttachTexts] = useState<Record<string, string>>({});
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);

  async function onPickFiles(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_BYTES) {
        toast.error(`${file.name} is larger than 8MB`);
        continue;
      }
      try {
        const isImage = file.type.startsWith("image/");
        const isPdf = file.type === "application/pdf";
        const dataUrl = await readAsDataUrl(file);
        if (!isImage && !isPdf) {
          const text = await file.text();
          setAttachTexts((t) => ({ ...t, [file.name]: text.slice(0, 100000) }));
        }
        setAttachments((a) => [...a, { name: file.name, mime: file.type || "text/plain", dataUrl }]);
      } catch {
        toast.error(`Could not read ${file.name}`);
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  const voice = useVoiceInput({
    onTranscript: (text) => setInput((prev) => (prev ? `${prev.trim()} ${text}` : text).slice(0, 4000)),
    onError: (message) => toast.error(message),
  });


  useEffect(() => {
    if (msgsQ.data) {
      setMessages(msgsQ.data as Msg[]);
      setPendingScrollId(null);
    }
  }, [msgsQ.data]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    if (pendingScrollId) {
      const el = container.querySelector<HTMLElement>(`[data-msg-id="${pendingScrollId}"]`);
      if (el) {
        const top =
          container.scrollTop +
          el.getBoundingClientRect().top -
          container.getBoundingClientRect().top -
          16;
        container.scrollTo({ top, behavior: "smooth" });
        return;
      }
    }
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages, streaming, pendingScrollId]);

  async function send(overrideMessages?: Msg[]) {
    const base = overrideMessages ?? messages;
    const userText = overrideMessages ? "" : input.trim();
    const sending = overrideMessages ? [] : attachments;
    if (!overrideMessages && !userText && sending.length === 0) return;
    if (streaming) return;

    const inlineText = sending
      .filter((a) => attachTexts[a.name] !== undefined)
      .map((a) => `\n\n--- File: ${a.name} ---\n${attachTexts[a.name]}`)
      .join("");
    const modelAttachments = sending.filter((a) => attachTexts[a.name] === undefined);

    const newMsgs: Msg[] = overrideMessages
      ? base
      : [
          ...base,
          {
            id: crypto.randomUUID(),
            role: "user",
            content: userText,
            attachments: sending,
          },
        ];
    setMessages(newMsgs);
    setInput("");
    setAttachments([]);
    setStreaming(true);
    setPendingScrollId(null);

    const assistantId = crypto.randomUUID();
    setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "" }]);
    setPendingScrollId(assistantId);

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      const payload = newMsgs.map((m, i) => {
        const isLastUser = !overrideMessages && i === newMsgs.length - 1;
        return {
          role: m.role,
          content: isLastUser ? `${m.content}${inlineText}` : m.content,
          ...(isLastUser && modelAttachments.length ? { attachments: modelAttachments } : {}),
        };
      });
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: payload }),
      });
      if (res.status === 402) {
        toast.error("The AI service needs attention. Please try again later.");
        setStreaming(false);
        return;
      }
      if (res.status === 429) {
        toast.error("The AI service is busy right now. Please try again in a moment.");
        setStreaming(false);
        return;
      }
      if (!res.ok || !res.body) {
        toast.error("Chat failed: " + (await res.text()));
        setStreaming(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => m.map((x) => (x.id === assistantId ? { ...x, content: acc } : x)));
      }

      // Persist both new user message (if not regen) and assistant reply.
      const savedUserText = sending.length
        ? `${userText}${userText ? "\n\n" : ""}📎 ${sending.map((a) => a.name).join(", ")}`
        : userText;
      const toSave = overrideMessages
        ? [{ role: "assistant" as const, content: acc }]
        : [
            { role: "user" as const, content: savedUserText },
            { role: "assistant" as const, content: acc },
          ];
      await saveFn({ data: { conversationId, messages: toSave } });
      await decFn();

      // Auto-title first exchange.
      if (base.length === 0 && !overrideMessages) {
        const raw = userText || sending[0]?.name || "New Chat";
        const title = raw.slice(0, 40) + (raw.length > 40 ? "…" : "");
        await renameFn({ data: { id: conversationId, title } });
        qc.invalidateQueries({ queryKey: ["conversations"] });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setStreaming(false);
    }
  }

  async function regenerate() {
    // Remove last assistant message and re-send with remaining conversation.
    const idx = [...messages].reverse().findIndex((m) => m.role === "assistant");
    if (idx === -1) return;
    const cutIndex = messages.length - 1 - idx;
    const trimmed = messages.slice(0, cutIndex);
    setMessages(trimmed);
    await send(trimmed);
  }

  const filteredConvs = (convs.data ?? []).filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  async function newChat() {
    const c = await createFn({ data: {} });
    qc.invalidateQueries({ queryKey: ["conversations"] });
    navigate({ to: "/chat/$id", params: { id: c.id } });
  }

  async function delChat(id: string) {
    await deleteFn({ data: { id } });
    qc.invalidateQueries({ queryKey: ["conversations"] });
    if (id === conversationId) {
      const remaining = (convs.data ?? []).filter((c) => c.id !== id);
      if (remaining[0]) navigate({ to: "/chat/$id", params: { id: remaining[0].id } });
      else newChat();
    }
  }

  async function commitRename(id: string) {
    const title = renameValue.trim();
    setRenamingId(null);
    if (!title) return;
    await renameFn({ data: { id, title } });
    qc.invalidateQueries({ queryKey: ["conversations"] });
  }

  return (
    <AppShell>
      <div className="flex h-screen">
        {/* Chat sidebar */}
        <aside className="hidden w-72 flex-col border-r bg-sidebar/50 p-3 lg:flex">
          <Button className="gradient-primary text-primary-foreground shadow-glow" onClick={newChat}>
            <Plus className="mr-2 h-4 w-4" /> New Chat
          </Button>
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search chats" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="mt-3 flex-1 space-y-1 overflow-y-auto">
            {convs.isLoading && <Loader2 className="mx-auto mt-6 h-4 w-4 animate-spin text-muted-foreground" />}
            {filteredConvs.map((c) => (
              <div
                key={c.id}
                className={`group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition ${
                  c.id === conversationId ? "bg-accent" : "hover:bg-accent/60"
                }`}
              >
                {renamingId === c.id ? (
                  <>
                    <Input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); commitRename(c.id); }
                        if (e.key === "Escape") { e.preventDefault(); setRenamingId(null); }
                      }}
                      onBlur={() => commitRename(c.id)}
                      className="h-7 flex-1 px-2 text-sm"
                      maxLength={80}
                    />
                    <button
                      className="text-muted-foreground hover:text-primary"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => commitRename(c.id)}
                      aria-label="Save name"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="text-muted-foreground hover:text-destructive"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setRenamingId(null)}
                      aria-label="Cancel rename"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/chat/$id" params={{ id: c.id }} className="flex-1 truncate">
                      <MessageSquare className="mr-2 inline h-3.5 w-3.5 text-muted-foreground" />
                      {c.title}
                    </Link>
                    <button
                      className="opacity-0 transition group-hover:opacity-100"
                      onClick={() => { setRenamingId(c.id); setRenameValue(c.title); }}
                      aria-label="Rename chat"
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                    </button>
                    <button
                      className="opacity-0 transition group-hover:opacity-100"
                      onClick={() => delChat(c.id)}
                      aria-label="Delete chat"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Main chat */}
        <div className="flex flex-1 flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.length === 0 && (
                <div className="mt-16 text-center animate-fade-up">
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-semibold">How can DashBot help today?</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Ask anything, write code, plan a trip, or brainstorm ideas.</p>
                </div>
              )}
              {messages.map((m) => (
                <MessageBubble key={m.id} msg={m} onRegenerate={m.role === "assistant" ? regenerate : undefined} />
              ))}
              {streaming && messages[messages.length - 1]?.content === "" && (
                <div className="flex gap-1 pl-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0.15s" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0.3s" }} />
                </div>
              )}
            </div>
          </div>

          <div className="border-t bg-background/50 p-4 backdrop-blur">
            <div className="mx-auto max-w-3xl">
              {attachments.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {attachments.map((a, i) => (
                    <span key={`${a.name}-${i}`} className="glass flex items-center gap-2 rounded-lg px-2 py-1 text-xs">
                      {a.mime.startsWith("image/") ? (
                        <img src={a.dataUrl} alt={a.name} className="h-6 w-6 rounded object-cover" />
                      ) : (
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className="max-w-[160px] truncate">{a.name}</span>
                      <button
                        onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                        aria-label={`Remove ${a.name}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                accept="image/*,application/pdf,text/*,.md,.csv,.json,.ts,.tsx,.js,.py"
                onChange={(e) => onPickFiles(e.target.files)}
              />
              <div className="glass flex items-end gap-2 rounded-2xl p-2">
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={streaming}
                  onClick={() => fileRef.current?.click()}
                  aria-label="Attach file"
                  title="Attach a file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Message DashBot… (Enter to send, Shift+Enter for newline)"
                  className="min-h-[44px] resize-none border-0 bg-transparent focus-visible:ring-0"
                  rows={1}
                  maxLength={4000}
                />
                <Button
                  size="icon"
                  variant={voice.recording ? "destructive" : "ghost"}
                  disabled={voice.transcribing || streaming}
                  onClick={() => (voice.recording ? voice.stop() : voice.start())}
                  aria-label={voice.recording ? "Stop recording" : "Start voice input"}
                  title={voice.recording ? "Stop and transcribe" : "Voice input"}
                >
                  {voice.transcribing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : voice.recording ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  className="gradient-primary text-primary-foreground shadow-glow"
                  disabled={streaming || (!input.trim() && attachments.length === 0)}
                  onClick={() => send()}
                >
                  {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                <span>
                  {voice.recording
                    ? "Recording… click the stop button when you're done"
                    : voice.transcribing
                      ? "Transcribing…"
                      : "Shift + Enter for new line"}
                </span>
                <span>{input.length} / 4000</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function MessageBubble({ msg, onRegenerate }: { msg: Msg; onRegenerate?: () => void }) {
  const isUser = msg.role === "user";
  return (
    <div data-msg-id={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-up`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${isUser ? "gradient-primary text-primary-foreground shadow-glow" : "glass"}`}>
        {!!msg.attachments?.length && (
          <div className="mb-2 flex flex-wrap gap-2">
            {msg.attachments.map((a, i) =>
              a.mime.startsWith("image/") ? (
                <img key={i} src={a.dataUrl} alt={a.name} className="h-24 w-24 rounded-lg object-cover" />
              ) : (
                <span key={i} className="flex items-center gap-1 rounded-lg bg-background/20 px-2 py-1 text-xs">
                  <FileText className="h-3.5 w-3.5" /> {a.name}
                </span>
              ),
            )}
          </div>
        )}
        {isUser ? <p className="whitespace-pre-wrap">{msg.content}</p> : <Markdown>{msg.content || "…"}</Markdown>}
        {!isUser && msg.content && (
          <div className="mt-2 flex gap-1 text-xs text-muted-foreground">
            <button
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-accent"
              onClick={() => { navigator.clipboard.writeText(msg.content); toast.success("Copied"); }}
            >
              <Copy className="h-3 w-3" /> Copy
            </button>
            {onRegenerate && (
              <button
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-accent"
                onClick={onRegenerate}
              >
                <RefreshCw className="h-3 w-3" /> Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
