import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ArrowLeft,
  ChevronRight,
  Check,
  UserX,
  EyeOff,
  AlertTriangle,
  Loader2,
  LogOut,
} from "lucide-react";
import {
  POST_REPORT_CATEGORIES,
  USER_REPORT_CATEGORIES,
  GROUP_REPORT_CATEGORIES,
  ReportCategory,
  ReportSubOption,
} from "../model/report-reasons";
import { reportsApi } from "../api/reports.api";
import { friendsApi } from "../../friends/api/friends.api";
import { useAuth } from "../../../context/AuthContext";

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "POST" | "USER" | "GROUP";
  targetId: string;
  targetAuthorName?: string;
  targetAuthorId?: string;
  onHide?: () => void;
  onBlock?: () => void;
  onLeaveGroup?: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetAuthorName,
  targetAuthorId,
  onHide,
  onBlock,
  onLeaveGroup,
}) => {
  const { session } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [selectedSubOption, setSelectedSubOption] = useState<ReportSubOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Post-submit quick action states
  const [hasBlocked, setHasBlocked] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [hasHidden, setHasHidden] = useState(false);
  const [hasLeftGroup, setHasLeftGroup] = useState(false);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedCategory(null);
      setSelectedSubOption(null);
      setIsSubmitting(false);
      setError(null);
      setHasBlocked(false);
      setIsBlocking(false);
      setHasHidden(false);
      setHasLeftGroup(false);
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine appropriate categories based on targetType
  const categories: ReportCategory[] =
    targetType === "USER"
      ? USER_REPORT_CATEGORIES
      : targetType === "GROUP"
      ? GROUP_REPORT_CATEGORIES
      : POST_REPORT_CATEGORIES;

  const targetLabel =
    targetType === "USER"
      ? "this profile"
      : targetType === "GROUP"
      ? "this group"
      : "this post";

  const handleSelectCategory = (category: ReportCategory) => {
    setSelectedCategory(category);
    if (category.subOptions && category.subOptions.length > 0) {
      setStep(2);
    } else {
      setSelectedSubOption(null);
      setStep(3);
    }
  };

  const handleSelectSubOption = (subOption: ReportSubOption) => {
    setSelectedSubOption(subOption);
    setStep(3);
  };

  const handleBack = () => {
    if (step === 3) {
      if (selectedCategory?.subOptions && selectedCategory.subOptions.length > 0) {
        setStep(2);
      } else {
        setStep(1);
      }
    } else if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategory) return;
    setIsSubmitting(true);
    setError(null);

    const formattedReason = selectedSubOption
      ? `${selectedCategory.label} - ${selectedSubOption.label}`
      : selectedCategory.label;

    try {
      await reportsApi.submitReport({
        targetType,
        targetId,
        reason: formattedReason,
      });
      setStep(4);
    } catch (err: any) {
      setError(err?.message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlockAction = async () => {
    if (hasBlocked || isBlocking) return;
    if (onBlock) {
      onBlock();
      setHasBlocked(true);
      return;
    }
    if (targetAuthorId && session?.session?.token) {
      setIsBlocking(true);
      try {
        await friendsApi.blockUser(targetAuthorId, session.session.token);
        setHasBlocked(true);
      } catch (err) {
        console.warn("Failed to block user:", err);
      } finally {
        setIsBlocking(false);
      }
    } else {
      setHasBlocked(true);
    }
  };

  const handleHideAction = () => {
    if (hasHidden) return;
    onHide?.();
    setHasHidden(true);
  };

  const handleLeaveGroupAction = () => {
    if (hasLeftGroup) return;
    onLeaveGroup?.();
    setHasLeftGroup(true);
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Report modal"
        className="relative w-full max-w-[480px] bg-white dark:bg-[#242526] text-gray-900 dark:text-gray-100 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[92dvh] z-10 animate-in zoom-in-95 duration-200"
      >
        {/* Top Header */}
        <div className="relative h-14 px-4 sm:px-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 shrink-0">
          {(step === 2 || step === 3) ? (
            <button
              type="button"
              onClick={handleBack}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition cursor-pointer"
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <div className="w-9 h-9" />
          )}

          <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white text-center">
            {step === 4 ? "" : "Report"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain">
          {/* STEP 1: Main Reason Selection */}
          {step === 1 && (
            <div>
              <h4 className="font-bold text-base sm:text-[17px] text-gray-900 dark:text-white mb-1">
                Why are you reporting {targetLabel}?
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                If someone is in immediate danger, get help before reporting to Heshel. Don't wait.
              </p>

              <div className="divide-y divide-gray-50 dark:divide-gray-800/40">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleSelectCategory(category)}
                    className="w-full py-3.5 px-2 flex items-center justify-between text-left hover:bg-gray-100/70 dark:hover:bg-[#3a3b3c]/70 rounded-xl transition cursor-pointer group"
                  >
                    <span className="font-semibold text-sm sm:text-[15px] text-gray-900 dark:text-gray-100 group-hover:text-black dark:group-hover:text-white">
                      {category.label}
                    </span>
                    <ChevronRight
                      size={18}
                      className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 shrink-0 ml-2"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Sub-options Selection */}
          {step === 2 && selectedCategory && (
            <div>
              <h4 className="font-bold text-base sm:text-[17px] text-gray-900 dark:text-white mb-3">
                {selectedCategory.question || "What best describes the issue?"}
              </h4>

              <div className="divide-y divide-gray-50 dark:divide-gray-800/40">
                {selectedCategory.subOptions?.map((subOption) => (
                  <button
                    key={subOption.id}
                    type="button"
                    onClick={() => handleSelectSubOption(subOption)}
                    className="w-full py-3.5 px-2 flex items-center justify-between text-left hover:bg-gray-100/70 dark:hover:bg-[#3a3b3c]/70 rounded-xl transition cursor-pointer group"
                  >
                    <span className="font-semibold text-sm sm:text-[15px] text-gray-900 dark:text-gray-100 group-hover:text-black dark:group-hover:text-white">
                      {subOption.label}
                    </span>
                    <ChevronRight
                      size={18}
                      className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 shrink-0 ml-2"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Summary & Submit Confirmation */}
          {step === 3 && selectedCategory && (
            <div>
              <h4 className="font-bold text-base sm:text-[17px] text-gray-900 dark:text-white mb-1">
                You're about to submit a report
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                We only remove content that goes against our Community Standards.
              </p>

              <div className="space-y-2 mb-6">
                <p className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Report details
                </p>
                <div className="p-3.5 bg-gray-100 dark:bg-[#3a3b3c] rounded-xl text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedCategory.label}
                </div>
                {selectedSubOption && (
                  <div className="p-3.5 bg-gray-100 dark:bg-[#3a3b3c] rounded-xl text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedSubOption.label}
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-[#e02f21] hover:bg-[#c92518] disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Submitting report...</span>
                  </>
                ) : (
                  <span>Submit</span>
                )}
              </button>
            </div>
          )}

          {/* STEP 4: Completion Screen ("Thanks for letting us know") */}
          {step === 4 && (
            <div className="text-center pt-2">
              {/* Green checkmark circle */}
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/20">
                <Check size={26} className="stroke-[3]" />
              </div>

              <h4 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white mb-1">
                Thanks for letting us know
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed max-w-sm mx-auto">
                We use your feedback to help our systems learn when something's not right.
              </p>

              {/* Other steps you can take */}
              <div className="text-left mb-6">
                <p className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                  Other steps you can take
                </p>

                <div className="space-y-1">
                  {/* Step A: Block */}
                  {(targetAuthorName || targetType === "USER") && (
                    <button
                      type="button"
                      onClick={handleBlockAction}
                      disabled={hasBlocked || isBlocking}
                      className="w-full p-2.5 -mx-1 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3a3b3c] flex items-center justify-between text-left transition cursor-pointer group disabled:cursor-default"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-gray-700 dark:text-gray-200">
                          <UserX size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                            {hasBlocked
                              ? `Blocked ${targetAuthorName || "user"}`
                              : `Block ${targetAuthorName ? `${targetAuthorName}'s` : "this"} profile`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            You won't be able to see or contact each other.
                          </p>
                        </div>
                      </div>
                      {hasBlocked && (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0 ml-2">
                          <Check size={14} /> Done
                        </span>
                      )}
                    </button>
                  )}

                  {/* Step B: Hide all / hide post */}
                  {targetType === "POST" && (
                    <button
                      type="button"
                      onClick={handleHideAction}
                      disabled={hasHidden}
                      className="w-full p-2.5 -mx-1 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3a3b3c] flex items-center justify-between text-left transition cursor-pointer group disabled:cursor-default"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-gray-700 dark:text-gray-200">
                          <EyeOff size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                            {hasHidden
                              ? `Hidden posts from ${targetAuthorName || "creator"}`
                              : `Hide all from ${targetAuthorName || "this person"}`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Stop seeing posts from this person.
                          </p>
                        </div>
                      </div>
                      {hasHidden && (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0 ml-2">
                          <Check size={14} /> Done
                        </span>
                      )}
                    </button>
                  )}

                  {/* Step C: Leave Group (if group) */}
                  {targetType === "GROUP" && (
                    <button
                      type="button"
                      onClick={handleLeaveGroupAction}
                      disabled={hasLeftGroup}
                      className="w-full p-2.5 -mx-1 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3a3b3c] flex items-center justify-between text-left transition cursor-pointer group disabled:cursor-default"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-gray-700 dark:text-gray-200">
                          <LogOut size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                            {hasLeftGroup ? "Left group" : "Leave this group"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Stop seeing posts and updates from this group.
                          </p>
                        </div>
                      </div>
                      {hasLeftGroup && (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0 ml-2">
                          <Check size={14} /> Done
                        </span>
                      )}
                    </button>
                  )}

                  {/* Step D: Report to admin status */}
                  <div className="w-full p-2.5 -mx-1 rounded-xl flex items-center justify-between text-left">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-gray-700 dark:text-gray-200">
                        <AlertTriangle size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          Report to admin
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          Your report has been sent for admin review.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0 ml-2">
                      <Check size={14} /> Submitted
                    </span>
                  </div>
                </div>
              </div>

              {/* Done button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-[#e02f21] hover:bg-[#c92518] transition text-center cursor-pointer shadow-xs text-sm sm:text-base"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReportModal;

