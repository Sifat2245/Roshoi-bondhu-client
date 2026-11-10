import React, { useRef, useState } from "react";
import { ImagePlus, Smile, Send, ThumbsUp } from "lucide-react";
import { useChatDock } from "../../../context/ChatDockContext";

export default function ChatComposer({
  conversationId,
  compact = false,
}: {
  conversationId: string;
  compact?: boolean;
}) {
  const { sendMessage, sendImage } = useChatDock();
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) return;
        sendMessage(conversationId, text.trim());
        setText("");
        setEmojiOpen(false);
      }}
      className={`relative border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#242526] flex items-center gap-1.5 shrink-0 ${compact ? "p-2" : "p-3"}`}
    >
      <input
        ref={imageRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Choose a chat photo"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) sendImage(conversationId, file);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        aria-label="Attach photo"
        title="Attach photo"
        onClick={() => imageRef.current?.click()}
        className="w-9 h-9 flex items-center justify-center shrink-0 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <ImagePlus size={19} />
      </button>
      <button
        type="button"
        aria-label="Choose emoji"
        aria-expanded={emojiOpen}
        onClick={() => setEmojiOpen((value) => !value)}
        className="w-9 h-9 flex items-center justify-center shrink-0 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Smile size={19} />
      </button>
      {emojiOpen && (
        <div
          className="absolute bottom-full left-2 mb-2 flex gap-1 rounded-2xl bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 shadow-lg p-2"
          role="group"
          aria-label="Emoji picker"
        >
          {["😊", "❤️", "😋", "🍜", "👏", "🔥"].map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={`Add ${emoji}`}
              onClick={() => {
                setText((value) => value + emoji);
                setEmojiOpen(false);
                inputRef.current?.focus();
              }}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-xl"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        aria-label="Message"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type a message…"
        className="min-w-0 flex-1 w-0 rounded-full bg-[#f0f2f5] dark:bg-[#3a3b3c] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
      />
      <button
        type={text.trim() ? "submit" : "button"}
        aria-label={text.trim() ? "Send message" : "Send thumbs up"}
        onClick={
          text.trim() ? undefined : () => sendMessage(conversationId, "👍")
        }
        className="w-10 h-10 rounded-full flex items-center justify-center text-[#e02f21] shrink-0 hover:bg-red-50 dark:hover:bg-red-950/30"
      >
        {text.trim() ? <Send size={20} /> : <ThumbsUp size={20} />}
      </button>
    </form>
  );
}
