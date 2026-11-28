import React, { useState } from "react";
import { Plus, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import Button from "../../../../../components/ui/Button";
import { useToast } from "../../../../../context/ToastContext";
import AddGroupRuleModal from "./AddGroupRuleModal";

interface LocalRule {
  id: string;
  title: string;
  body: string;
}

interface GroupRulesPanelProps {
  group: any;
  isAdmin: boolean;
}

export const GroupRulesPanel: React.FC<GroupRulesPanelProps> = ({
  group,
  isAdmin,
}) => {
  const { notify } = useToast();
  const [rules, setRules] = useState<LocalRule[]>(
    Array.isArray(group.rules) && group.rules.length > 0
      ? group.rules
      : [
          {
            id: "rule-1",
            title: "Be kind and respectful",
            body: "Treat every home cook with respect. Constructive kitchen tips are welcome; harassment is not.",
          },
          {
            id: "rule-2",
            title: "Credit original recipes",
            body: "If a dish is inspired by another chef or family member, give them credit in your caption.",
          },
        ]
  );
  const [isAddOpen, setIsAddOpen] = useState(false);

  const moveRule = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= rules.length) return;
    setRules((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item);
      return copy;
    });
  };

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">
            Community guidelines ({rules.length})
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Displayed on the group About section and when reporting posts.
          </p>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            icon={Plus}
            onClick={() => setIsAddOpen(true)}
            className="cursor-pointer"
          >
            Add rule
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {rules.map((rule, idx) => (
          <div
            key={rule.id}
            className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-[#18191a]/60 flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3 min-w-0">
              <span className="w-7 h-7 rounded-full bg-red-50 dark:bg-red-950/40 text-[#e02f21] text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  {rule.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                  {rule.body}
                </p>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveRule(idx, -1)}
                  aria-label="Move rule up"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/70 dark:hover:bg-gray-800 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  type="button"
                  disabled={idx === rules.length - 1}
                  onClick={() => moveRule(idx, 1)}
                  aria-label="Move rule down"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/70 dark:hover:bg-gray-800 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRules((prev) => prev.filter((r) => r.id !== rule.id));
                    notify.info("Rule removed");
                  }}
                  aria-label="Delete rule"
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <AddGroupRuleModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={(title, body) => {
          setRules((prev) => [
            ...prev,
            { id: `rule-${Date.now()}`, title, body },
          ]);
          notify.success("Rule added.");
        }}
      />
    </div>
  );
};

export default GroupRulesPanel;

