import styles from './FormattedMarkdown.module.css';

/** Renders markdown-like text with bold (**), headings (# ## ###), lists (-), rules (---), and blockquotes (>). */
export function FormattedMarkdown({ content }: { content: string }) {
  if (!content.trim()) return null;
  const lines = content.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  lines.forEach((line, i) => {
    const trimmed = line.trimEnd();
    if (trimmed === '') {
      blocks.push(<div key={i} className={styles.spacer} />);
      return;
    }
    if (trimmed.startsWith('---')) {
      blocks.push(<hr key={i} className={styles.hr} />);
      return;
    }
    if (trimmed.startsWith('### ')) {
      const text = trimmed.slice(4).replace(/\*\*([^*]+)\*\*/g, (_, w) => `\u0000${w}\u0001`);
      const parts = text.split(/\u0000|\u0001/).filter(Boolean);
      blocks.push(
        <h3 key={i} className={styles.h3}>
          {parts.map((p, j) => (j % 2 === 1 ? <strong key={j}>{p}</strong> : p))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3).replace(/\*\*([^*]+)\*\*/g, (_, w) => `\u0000${w}\u0001`);
      const parts = text.split(/\u0000|\u0001/).filter(Boolean);
      blocks.push(
        <h2 key={i} className={styles.h2}>
          {parts.map((p, j) => (j % 2 === 1 ? <strong key={j}>{p}</strong> : p))}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      const text = trimmed.slice(2).replace(/\*\*([^*]+)\*\*/g, (_, w) => `\u0000${w}\u0001`);
      const parts = text.split(/\u0000|\u0001/).filter(Boolean);
      blocks.push(
        <h1 key={i} className={styles.h1}>
          {parts.map((p, j) => (j % 2 === 1 ? <strong key={j}>{p}</strong> : p))}
        </h1>
      );
      return;
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const text = trimmed.slice(2).replace(/\*\*([^*]+)\*\*/g, (_, w) => `\u0000${w}\u0001`);
      const parts = text.split(/\u0000|\u0001/).filter(Boolean);
      blocks.push(
        <div key={i} className={styles.li}>
          {parts.map((p, j) => (j % 2 === 1 ? <strong key={j}>{p}</strong> : p))}
        </div>
      );
      return;
    }
    if (trimmed.startsWith('> ')) {
      const text = trimmed.slice(2).replace(/\*\*([^*]+)\*\*/g, (_, w) => `\u0000${w}\u0001`);
      const parts = text.split(/\u0000|\u0001/).filter(Boolean);
      blocks.push(
        <blockquote key={i} className={styles.blockquote}>
          {parts.map((p, j) => (j % 2 === 1 ? <strong key={j}>{p}</strong> : p))}
        </blockquote>
      );
      return;
    }
    const text = trimmed.replace(/\*\*([^*]+)\*\*/g, (_, w) => `\u0000${w}\u0001`);
    const parts = text.split(/\u0000|\u0001/).filter(Boolean);
    blocks.push(
      <p key={i} className={styles.p}>
        {parts.map((p, j) => (j % 2 === 1 ? <strong key={j}>{p}</strong> : p))}
      </p>
    );
  });
  return <div className={styles.root}>{blocks}</div>;
}
