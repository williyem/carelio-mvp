'use client';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type AiSummaryPanelProps = {
  title?: string;
  description?: string;
  summary: string | null;
  generatedAt?: string | null;
  isPending: boolean;
  canGenerate: boolean;
  emptyMessage: string;
  onGenerate: () => void;
  className?: string;
};

type SummaryBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

function stripMarkdownInline(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/, '')
    .trim();
}

function parseSummary(summary: string): SummaryBlock[] {
  const lines = summary
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd());

  const blocks: SummaryBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = stripMarkdownInline(paragraph.join(' ').trim());
    if (text) blocks.push({ type: 'paragraph', text });
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    blocks.push({
      type: 'list',
      items: listItems.map(stripMarkdownInline).filter(Boolean),
    });
    listItems = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const bullet = line.match(/^[-*•]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      listItems.push(bullet[1] ?? '');
      continue;
    }

    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (numbered) {
      flushParagraph();
      listItems.push(numbered[1] ?? '');
      continue;
    }

    // Section heading: short line ending with ":" or known plain headings
    const looksLikeHeading =
      (/^[A-Za-z][A-Za-z\s/-]{0,40}:$/.test(line) ||
        /^(Themes|Findings|Open plans|Flags|Documented|Vitals|Follow-up|Follow ups|SOAP|Key vitals|Documentation Status)$/i.test(
          line.replace(/:$/, '')
        )) &&
      line.length < 48;

    if (looksLikeHeading) {
      flushParagraph();
      flushList();
      blocks.push({
        type: 'heading',
        text: stripMarkdownInline(line.replace(/:$/, '')),
      });
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

function AiSummaryContent({ summary }: { summary: string }) {
  const blocks = parseSummary(summary);

  if (!blocks.length) {
    return (
      <p className="text-sm text-(--text-secondary)">No summary content.</p>
    );
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h4
              key={`h-${index}`}
              className="text-sm font-semibold text-(--text-primary) pt-1 first:pt-0"
            >
              {block.text}
            </h4>
          );
        }
        if (block.type === 'list') {
          return (
            <ul
              key={`l-${index}`}
              className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-(--text-primary)"
            >
              {block.items.map((item, itemIndex) => (
                <li key={`li-${index}-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p
            key={`p-${index}`}
            className="text-sm leading-relaxed text-(--text-primary)"
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

export default function AiSummaryPanel({
  title = 'AI summary',
  description = 'AI-assisted draft for clinician review. Not a diagnosis.',
  summary,
  generatedAt,
  isPending,
  canGenerate,
  emptyMessage,
  onGenerate,
  className,
}: AiSummaryPanelProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-(--border-stroke) bg-(--bg-white) p-5 space-y-4',
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-brand-blue" />
            <h3 className="text-base font-semibold text-(--text-primary)">
              {title}
            </h3>
          </div>
          <p className="text-sm text-(--text-secondary)">{description}</p>
        </div>
        <Button
          type="button"
          variant="brand"
          className="rounded-full shrink-0"
          disabled={!canGenerate || isPending}
          onClick={onGenerate}
        >
          {isPending ? <Spinner /> : summary ? 'Regenerate' : 'Generate'}
        </Button>
      </div>

      {!canGenerate ? (
        <p className="text-sm text-(--text-secondary) rounded-[12px] bg-(--bg-primary) px-4 py-3">
          {emptyMessage}
        </p>
      ) : null}

      {summary ? (
        <div className="space-y-2">
          <div className="rounded-[12px] bg-(--bg-primary) px-4 py-3">
            <AiSummaryContent summary={summary} />
          </div>
          {generatedAt ? (
            <p className="text-xs text-(--text-muted)">
              Generated {new Date(generatedAt).toLocaleString()}
            </p>
          ) : null}
        </div>
      ) : canGenerate && !isPending ? (
        <p className="text-sm text-(--text-secondary)">
          Click Generate to create a summary from available clinical notes.
        </p>
      ) : null}
    </div>
  );
}
