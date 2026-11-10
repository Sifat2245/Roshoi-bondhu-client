import { Plus, X } from "lucide-react";

import type { PollDraft } from "../model/community-domain";

export default function PollEditor({
  value,
  onChange,
}: {
  value: PollDraft;
  onChange: (value: PollDraft) => void;
}) {
  return (
    <fieldset className="space-y-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <legend className="px-2 font-bold text-base">Create a poll</legend>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        Polls in this preview are saved on this device.
      </p>
      <label className="block text-sm font-semibold">
        Your question
        <textarea
          aria-label="Poll question"
          required
          minLength={8}
          maxLength={200}
          value={value.question}
          onChange={(e) => onChange({ ...value, question: e.target.value })}
          rows={2}
          placeholder="Ask your food people a question…"
          className="kitchen-input mt-2 block w-full resize-y"
        />
      </label>
      <div className="space-y-2">
        {value.options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <input
              aria-label={`Poll answer ${index + 1}`}
              required
              maxLength={100}
              value={option}
              onChange={(e) =>
                onChange({
                  ...value,
                  options: value.options.map((text, i) =>
                    i === index ? e.target.value : text,
                  ),
                })
              }
              placeholder={`Answer ${index + 1}`}
              className="kitchen-input min-w-0 flex-1 w-full"
            />
            {value.options.length > 2 && (
              <button
                type="button"
                aria-label={`Remove answer ${index + 1}`}
                onClick={() =>
                  onChange({
                    ...value,
                    options: value.options.filter((_, i) => i !== index),
                  })
                }
                className="p-2 text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
      {value.options.length < 6 && (
        <button
          type="button"
          onClick={() =>
            onChange({ ...value, options: [...value.options, ""] })
          }
          className="flex items-center gap-1.5 text-sm font-semibold text-[#e02f21]"
        >
          <Plus size={16} />
          Add an answer
        </button>
      )}
      <label className="flex items-start gap-3 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={value.multiple}
          onChange={(e) => onChange({ ...value, multiple: e.target.checked })}
          className="mt-1 h-4 w-4 accent-[#e02f21] shrink-0"
        />
        Allow people to choose more than one answer
      </label>
      <label className="block text-sm font-semibold">
        Voting closes{" "}
        <span className="font-normal text-gray-500 dark:text-gray-400">
          (optional)
        </span>
        <input
          aria-label="Poll closing time"
          type="datetime-local"
          value={
            value.expiresAt
              ? new Date(
                  new Date(value.expiresAt).getTime() -
                    new Date(value.expiresAt).getTimezoneOffset() * 60000,
                )
                  .toISOString()
                  .slice(0, 16)
              : ""
          }
          onChange={(e) =>
            onChange({
              ...value,
              expiresAt: e.target.value
                ? new Date(e.target.value).toISOString()
                : undefined,
            })
          }
          className="kitchen-input mt-2 w-full"
        />
      </label>
    </fieldset>
  );
}
