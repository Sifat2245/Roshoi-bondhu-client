import React from "react";
import { useUpload } from "../../../context/UploadContext";
import Avatar from "../../../components/ui/Avatar";
import { Loader2, CheckCircle2, AlertCircle, X, Image as ImageIcon } from "lucide-react";

export const UploadProgressFeedCard: React.FC = () => {
  const { activeUploads, dismissUpload } = useUpload();

  if (!activeUploads || activeUploads.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 w-full">
      {activeUploads.map((item) => {
        const isSuccess = item.status === "success";
        const isError = item.status === "error";
        const isFinishing = item.status === "finishing";

        return (
          <div
            key={item.id}
            className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-4.5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {/* Top row: Avatar + Info + Preview Thumbnail */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                {/* Author Avatar with dynamic spinner indicator */}
                <div className="relative shrink-0">
                  <Avatar
                    src={item.userImage}
                    alt={item.userName || "Author"}
                    size="md"
                  />
                  {!isSuccess && !isError && (
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-[#242526] shadow-xs">
                      <Loader2
                        size={14}
                        className="animate-spin text-[#e02f21]"
                      />
                    </div>
                  )}
                  {isSuccess && (
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                      <CheckCircle2 size={13} />
                    </div>
                  )}
                  {isError && (
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-rose-500 text-white shadow-xs">
                      <AlertCircle size={13} />
                    </div>
                  )}
                </div>

                {/* Text details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                      {item.userName || "You"}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-semibold">
                      {item.title}
                    </span>
                  </div>

                  {item.caption && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1 mt-0.5 font-medium">
                      "{item.caption}"
                    </p>
                  )}

                  {/* Status text */}
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    {isSuccess ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        <span>Finished & published!</span>
                      </span>
                    ) : isError ? (
                      <span className="text-rose-600 dark:text-rose-400 font-bold">
                        {item.error || "Upload failed."}
                      </span>
                    ) : isFinishing ? (
                      <span className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">
                        Finishing up post...
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        Uploading • {item.progress}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side: Thumbnail preview & Dismiss button */}
              <div className="flex items-center gap-2 shrink-0">
                {item.previewUrl ? (
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shadow-xs">
                    <img
                      src={item.previewUrl}
                      alt="Upload preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                    <ImageIcon size={18} />
                  </div>
                )}

                {isError && (
                  <button
                    type="button"
                    onClick={() => dismissUpload(item.id)}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition cursor-pointer"
                    title="Dismiss"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ease-out ${
                  isSuccess
                    ? "bg-emerald-500"
                    : isError
                    ? "bg-rose-500"
                    : "bg-[#e02f21]"
                }`}
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UploadProgressFeedCard;

