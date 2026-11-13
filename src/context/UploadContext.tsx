import React, { createContext, useContext, useState, useCallback, useRef } from "react";

export type UploadType =
  | "POST"
  | "CASUAL"
  | "RECIPE"
  | "AVATAR"
  | "COVER"
  | "POLL";

export interface UploadTask {
  id: string;
  type: UploadType;
  title: string;
  caption?: string;
  previewUrl?: string;
  userImage?: string;
  userName?: string;
  progress: number; // 0 to 100
  status: "uploading" | "finishing" | "success" | "error";
  error?: string;
  createdAt: number;
}

export interface UploadConfig {
  type: UploadType;
  title: string;
  caption?: string;
  previewUrl?: string;
  userImage?: string;
  userName?: string;
}

interface UploadContextType {
  activeUploads: UploadTask[];
  runUpload: (
    config: UploadConfig,
    taskFn: (onProgress: (percent: number) => void) => Promise<any>
  ) => Promise<any>;
  dismissUpload: (id: string) => void;
}

const UploadContext = createContext<UploadContextType | null>(null);

export const UploadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeUploads, setActiveUploads] = useState<UploadTask[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismissUpload = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearInterval(timer);
      timersRef.current.delete(id);
    }
    setActiveUploads((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const runUpload = useCallback(
    async (
      config: UploadConfig,
      taskFn: (onProgress: (percent: number) => void) => Promise<any>
    ) => {
      const id = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newTask: UploadTask = {
        id,
        type: config.type,
        title: config.title,
        caption: config.caption,
        previewUrl: config.previewUrl,
        userImage: config.userImage,
        userName: config.userName,
        progress: 15,
        status: "uploading",
        createdAt: Date.now(),
      };

      setActiveUploads((prev) => [newTask, ...prev]);

      // Smooth progress ticker up to 88% while network request is underway
      const progressTimer = setInterval(() => {
        setActiveUploads((prev) =>
          prev.map((item) => {
            if (item.id !== id || item.status !== "uploading") return item;
            if (item.progress >= 88) {
              return { ...item, status: "finishing" };
            }
            const increment = Math.floor(Math.random() * 7) + 3;
            const nextProgress = Math.min(88, item.progress + increment);
            return {
              ...item,
              progress: nextProgress,
              status: nextProgress >= 85 ? "finishing" : "uploading",
            };
          })
        );
      }, 180);

      timersRef.current.set(id, progressTimer);

      const manualProgress = (percent: number) => {
        setActiveUploads((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, progress: Math.min(95, Math.max(item.progress, percent)) } : item
          )
        );
      };

      try {
        const result = await taskFn(manualProgress);

        clearInterval(progressTimer);
        timersRef.current.delete(id);

        // Mark completed with 100%
        setActiveUploads((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, progress: 100, status: "success" } : item
          )
        );

        // Auto remove from feed after 2.2 seconds so user sees the completed state
        setTimeout(() => {
          setActiveUploads((prev) => prev.filter((item) => item.id !== id));
        }, 2200);

        return result;
      } catch (err: any) {
        clearInterval(progressTimer);
        timersRef.current.delete(id);

        setActiveUploads((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "error",
                  error: err?.message || "Upload failed. Please check your connection and try again.",
                }
              : item
          )
        );
        throw err;
      }
    },
    []
  );

  return (
    <UploadContext.Provider value={{ activeUploads, runUpload, dismissUpload }}>
      {children}
    </UploadContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
};

export default UploadContext;
