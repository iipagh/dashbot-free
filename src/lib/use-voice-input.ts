import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function encodeWav(chunks: Float32Array[], sampleRate: number): Blob {
  const target = 16000;
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Float32Array(total);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.length;
  }

  const ratio = sampleRate / target;
  const outLength = Math.floor(merged.length / ratio);
  const samples = new Int16Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const s = Math.max(-1, Math.min(1, merged[Math.floor(i * ratio)] ?? 0));
    samples[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (pos: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(pos + i, str.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, target, true);
  view.setUint32(28, target * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  new Int16Array(buffer, 44).set(samples);

  return new Blob([buffer], { type: "audio/wav" });
}

type Options = {
  onTranscript: (text: string) => void;
  onError: (message: string) => void;
};

export function useVoiceInput({ onTranscript, onError }: Options) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nodeRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);

  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    nodeRef.current?.disconnect();
    sourceRef.current?.disconnect();
    ctxRef.current?.close().catch(() => {});
    streamRef.current = null;
    nodeRef.current = null;
    sourceRef.current = null;
    ctxRef.current = null;
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const node = ctx.createScriptProcessor(4096, 1, 1);
      chunksRef.current = [];
      node.onaudioprocess = (e) => {
        chunksRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)));
      };
      source.connect(node);
      node.connect(ctx.destination);
      streamRef.current = stream;
      ctxRef.current = ctx;
      sourceRef.current = source;
      nodeRef.current = node;
      setRecording(true);
    } catch {
      onError("Microphone access is needed to record.");
    }
  }, [onError]);

  const cancel = useCallback(() => {
    cleanup();
    chunksRef.current = [];
    setRecording(false);
  }, [cleanup]);

  const stop = useCallback(async () => {
    const sampleRate = ctxRef.current?.sampleRate ?? 44100;
    const chunks = chunksRef.current;
    cleanup();
    chunksRef.current = [];
    setRecording(false);

    const blob = encodeWav(chunks, sampleRate);
    if (blob.size < 4096) {
      onError("That recording was empty — please try again.");
      return;
    }

    setTranscribing(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      const body = new FormData();
      body.append("audio", blob, "recording.wav");
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body,
      });
      if (!res.ok) {
        onError((await res.text().catch(() => "")) || "Transcription failed");
        return;
      }
      const data = (await res.json()) as { text?: string };
      if (data.text?.trim()) onTranscript(data.text.trim());
      else onError("Couldn't hear anything — please try again.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Transcription failed");
    } finally {
      setTranscribing(false);
    }
  }, [cleanup, onError, onTranscript]);

  return { recording, transcribing, start, stop, cancel };
}
