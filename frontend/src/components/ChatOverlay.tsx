import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { sendChatMessage } from '../api/client';
import styles from './ChatOverlay.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/** Renders assistant content with newlines preserved and **bold** as <strong>. */
function FormattedAssistantContent({ content }: { content: string }) {
  const parts = content.split(/\*\*([^*]+)\*\*/g);
  return (
    <div className={styles.assistantContent}>
      {parts.map((segment, i) =>
        i % 2 === 1 ? <strong key={i}>{segment}</strong> : segment
      )}
    </div>
  );
}

export function ChatOverlay({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: ({ msg, sid }: { msg: string; sid?: string }) => sendChatMessage(msg, sid),
    onSuccess: (data) => {
      if (!sessionId) setSessionId(data.sessionId);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: data.response },
      ]);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || mutation.isPending) return;
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', content: text }]);
    setInput('');
    mutation.mutate({ msg: text, sid: sessionId });
  };

  return (
    <div className={styles.overlay} role="dialog" aria-label="AI Assistant">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>AI Assistant</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className={styles.messages}>
          {messages.length === 0 && (
            <p className={styles.placeholder}>Ask anything about margin, opportunities, or performance. This uses the same Executive Insight Agent as the prompt library.</p>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={msg.role === 'user' ? styles.userMsg : styles.assistantMsg}>
              {msg.role === 'assistant' ? (
                <FormattedAssistantContent content={msg.content} />
              ) : (
                msg.content
              )}
            </div>
          ))}
          {mutation.isPending && <div className={styles.assistantMsg}>Thinking…</div>}
          <div ref={bottomRef} />
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question…"
            className={styles.input}
            disabled={mutation.isPending}
          />
          <button type="submit" className={styles.sendBtn} disabled={!input.trim() || mutation.isPending}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
