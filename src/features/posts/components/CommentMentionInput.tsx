import React, { useEffect, useMemo, useRef, useState } from "react";
import Avatar from "../../../components/ui/Avatar";
import { searchApi } from "../../search/api/search.api";
import { Loader2 } from "lucide-react";

export interface MentionCandidate {
  id: string;
  name: string;
  image?: string | null;
  username?: string | null;
  subtitle?: string;
}

interface CommentMentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectMention: (user: MentionCandidate) => void;
  candidates: MentionCandidate[];
  currentUserId?: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  placeholder?: string;
  disabled?: boolean;
}

const getMentionMatch = (text: string, cursorPos: number) => {
  const beforeCursor = text.slice(0, cursorPos);
  const match = beforeCursor.match(/(?:^|\s)@([^@\n]{0,28})$/);
  if (!match) return null;
  const full = match[0];
  const leadingSpace = full.startsWith(" ") || full.startsWith("\t") || full.startsWith("\n") ? 1 : 0;
  const startIndex = beforeCursor.length - full.length + leadingSpace;
  return {
    query: match[1],
    startIndex,
    endIndex: cursorPos,
  };
};

export const CommentMentionInput: React.FC<CommentMentionInputProps> = ({
  value,
  onChange,
  onSelectMention,
  candidates,
  currentUserId,
  inputRef,
  placeholder = "Write a comment...",
  disabled = false,
}) => {
  const [cursorPos, setCursorPos] = useState(0);
  const [activeMention, setActiveMention] = useState<{
    query: string;
    startIndex: number;
    endIndex: number;
  } | null>(null);
  const [remoteResults, setRemoteResults] = useState<MentionCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pos = inputRef.current?.selectionStart ?? value.length;
    setCursorPos(pos);
    setActiveMention(getMentionMatch(value, pos));
  }, [value, inputRef]);

  const mentionQuery = activeMention ? activeMention.query.trim() : null;

  useEffect(() => {
    if (mentionQuery === null) {
      setRemoteResults([]);
      setSearching(false);
      return;
    }

    const q = mentionQuery;
    if (!q) {
      setRemoteResults([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchApi.getSearchSuggestions(q);
        if (!cancelled) {
          setRemoteResults(
            (res.users || []).map((u) => ({
              id: u.id,
              name: u.name,
              image: u.image,
              username: u.username,
              subtitle: u.username ? `@${u.username}` : u.city || "Chef",
            }))
          );
        }
      } catch {
        if (!cancelled) setRemoteResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [mentionQuery]);

  const suggestions = useMemo(() => {
    if (!activeMention) return [];
    const q = activeMention.query.trim().toLowerCase();
    const seen = new Set<string>();
    const combined: MentionCandidate[] = [];

    const addIfMatch = (item: MentionCandidate) => {
      if (!item?.id || item.id === currentUserId || seen.has(item.id)) return;
      if (q) {
        const nameMatch = item.name?.toLowerCase().includes(q);
        const handleMatch = item.username?.toLowerCase().includes(q);
        if (!nameMatch && !handleMatch) return;
      }
      seen.add(item.id);
      combined.push(item);
    };

    candidates.forEach(addIfMatch);
    remoteResults.forEach(addIfMatch);

    return combined.slice(0, 7);
  }, [activeMention, candidates, remoteResults, currentUserId]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [suggestions.length, activeMention?.query]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveMention(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const insertMention = (person: MentionCandidate) => {
    if (!activeMention) return;
    const before = value.slice(0, activeMention.startIndex);
    const after = value.slice(activeMention.endIndex);
    const inserted = `@${person.name} `;
    const nextValue = `${before}${inserted}${after}`;
    onSelectMention(person);
    onChange(nextValue);
    setActiveMention(null);

    const nextCaret = before.length + inserted.length;
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const syncSelection = () => {
    const pos = inputRef.current?.selectionStart ?? value.length;
    setCursorPos(pos);
    setActiveMention(getMentionMatch(value, pos));
  };

  const isDropdownOpen = Boolean(activeMention && (suggestions.length > 0 || searching));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      }
    } else if ((e.key === "Enter" || e.key === "Tab") && suggestions[highlightedIndex]) {
      e.preventDefault();
      insertMention(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setActiveMention(null);
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 flex items-center">
      {isDropdownOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 max-h-60 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span>Mention someone</span>
            {searching && <Loader2 size={12} className="animate-spin text-[#e02f21]" />}
          </div>
          {suggestions.length > 0 ? (
            suggestions.map((person, idx) => (
              <button
                key={person.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertMention(person);
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition cursor-pointer ${
                  idx === highlightedIndex
                    ? "bg-red-50/80 dark:bg-red-950/30"
                    : "hover:bg-gray-50 dark:hover:bg-[#3a3b3c]"
                }`}
              >
                <Avatar src={person.image} alt={person.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {person.name}
                  </p>
                  {person.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {person.subtitle}
                    </p>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-xs text-gray-400 text-center">
              Searching users...
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        aria-label="Write a comment"
        type="text"
        disabled={disabled}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          const pos = e.target.selectionStart ?? e.target.value.length;
          setCursorPos(pos);
          setActiveMention(getMentionMatch(e.target.value, pos));
        }}
        onClick={syncSelection}
        onKeyUp={syncSelection}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-4 pr-11 py-2.5 bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 rounded-full text-sm dark:text-white focus:outline-none focus:border-[#e02f21]"
      />
      <span className="sr-only" data-cursor={cursorPos} />
    </div>
  );
};

export default CommentMentionInput;

