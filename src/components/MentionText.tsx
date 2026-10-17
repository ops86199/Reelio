import React from 'react';

interface MentionTextProps {
  text: string;
  onMentionClick?: (username: string) => void;
  className?: string;
  mentionClassName?: string;
  hashtagClassName?: string;
}

interface TextSegment {
  type: 'text' | 'mention' | 'hashtag';
  value: string;
  username?: string;
}

/**
 * Parses a string into text, @mention, and #hashtag segments.
 * Only treats @... as a mention when it is preceded by start-of-string or non-word character
 * (preventing email addresses like test@example.com from false-matching).
 */
export function parseMentionsAndHashtags(text: string): TextSegment[] {
  if (!text) return [];

  // Match @mentions and #hashtags, ensuring @ is preceded by start or non-word character
  const regex = /(^|[^\w])(@[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*)|(#[a-zA-Z0-9_]+)/g;
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    const prefix = match[1] || '';
    const mentionToken = match[2];
    const hashtagToken = match[3];

    // Leading text before match
    if (matchIndex > lastIndex) {
      segments.push({
        type: 'text',
        value: text.slice(lastIndex, matchIndex),
      });
    }

    // Prefix character (e.g., whitespace or punctuation before '@')
    if (prefix) {
      segments.push({
        type: 'text',
        value: prefix,
      });
    }

    if (mentionToken) {
      const username = mentionToken.slice(1);
      segments.push({
        type: 'mention',
        value: mentionToken,
        username,
      });
    } else if (hashtagToken) {
      segments.push({
        type: 'hashtag',
        value: hashtagToken,
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      value: text.slice(lastIndex),
    });
  }

  return segments;
}

export const MentionText: React.FC<MentionTextProps> = ({
  text,
  onMentionClick,
  className = '',
  mentionClassName = 'font-semibold text-violet-400 hover:text-violet-300 dark:text-violet-400 dark:hover:text-violet-300 hover:underline cursor-pointer transition-colors inline-block',
  hashtagClassName = 'font-medium text-pink-500 hover:text-pink-400 dark:text-pink-400 dark:hover:text-pink-300 hover:underline cursor-pointer transition-colors inline-block',
}) => {
  const segments = parseMentionsAndHashtags(text);

  return (
    <span className={className}>
      {segments.map((seg, idx) => {
        if (seg.type === 'mention' && seg.username) {
          const username = seg.username;
          return (
            <span
              key={idx}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                if (onMentionClick) {
                  onMentionClick(username);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onMentionClick) {
                    onMentionClick(username);
                  }
                }
              }}
              className={mentionClassName}
              title={`View @${username}'s profile`}
            >
              {seg.value}
            </span>
          );
        }

        if (seg.type === 'hashtag') {
          return (
            <span key={idx} className={hashtagClassName}>
              {seg.value}
            </span>
          );
        }

        return <span key={idx}>{seg.value}</span>;
      })}
    </span>
  );
};
