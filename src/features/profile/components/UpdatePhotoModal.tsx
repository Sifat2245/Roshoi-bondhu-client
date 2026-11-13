import React, { useEffect, useState, useRef } from "react";
import { X, Rss, ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";
import Button from "../../../components/ui/Button";

interface UpdatePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  type: "avatar" | "cover";
  onConfirm: (
    file: File,
    options: { caption: string; shareToFeed: boolean }
  ) => void;
  isUploading?: boolean;
}

export const UpdatePhotoModal: React.FC<UpdatePhotoModalProps> = ({
  isOpen,
  onClose,
  file,
  type,
  onConfirm,
  isUploading = false,
}) => {
  const [caption, setCaption] = useState("");
  const [shareToFeed, setShareToFeed] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Resize & Adjustment States
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startOffsetX: 0, startOffsetY: 0 });

  const viewportRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setCaption("");
      setShareToFeed(true);
      setZoom(1);
      setOffset({ x: 0, y: 0 });

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  if (!isOpen || !file || !previewUrl) {
    return null;
  }

  const isAvatar = type === "avatar";
  const title = isAvatar ? "Update profile picture" : "Update cover photo";

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setOffset({
      x: dragStartRef.current.startOffsetX + deltaX,
      y: dragStartRef.current.startOffsetY + deltaY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        startOffsetX: offset.x,
        startOffsetY: offset.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStartRef.current.x;
    const deltaY = e.touches[0].clientY - dragStartRef.current.y;
    setOffset({
      x: dragStartRef.current.startOffsetX + deltaX,
      y: dragStartRef.current.startOffsetY + deltaY,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((z) => Math.min(3, Math.max(1, +(z + delta).toFixed(2))));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If no adjustments made, submit original file
    if (zoom === 1 && offset.x === 0 && offset.y === 0) {
      onConfirm(file, {
        caption: caption.trim(),
        shareToFeed,
      });
      onClose();
      return;
    }

    // Export adjusted image using offscreen canvas
    try {
      const img = imageRef.current;
      const viewport = viewportRef.current;
      if (img && viewport) {
        const outW = isAvatar ? 640 : 1200;
        const outH = isAvatar ? 640 : 480;
        const canvas = document.createElement("canvas");
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, outW, outH);

          const viewW = viewport.clientWidth;
          const viewH = viewport.clientHeight;
          const scaleRatio = outW / viewW;

          ctx.translate(outW / 2, outH / 2);
          ctx.translate(offset.x * scaleRatio, offset.y * scaleRatio);
          ctx.scale(zoom, zoom);

          const imgRatio = img.naturalWidth / img.naturalHeight;
          const boxRatio = viewW / viewH;
          let drawW = outW;
          let drawH = outH;
          if (imgRatio > boxRatio) {
            drawH = outH;
            drawW = outH * imgRatio;
          } else {
            drawW = outW;
            drawH = outW / imgRatio;
          }

          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

          canvas.toBlob((blob) => {
            if (blob) {
              const adjustedFile = new File([blob], file.name, {
                type: file.type || "image/jpeg",
              });
              onConfirm(adjustedFile, {
                caption: caption.trim(),
                shareToFeed,
              });
            } else {
              onConfirm(file, { caption: caption.trim(), shareToFeed });
            }
          }, file.type || "image/jpeg", 0.95);

          onClose();
          return;
        }
      }
    } catch (err) {
      console.error("Canvas export failed:", err);
    }

    onConfirm(file, {
      caption: caption.trim(),
      shareToFeed,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => {
        if (!isUploading) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            aria-label="Close dialog"
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Optional Caption */}
          <div>
            <label
              htmlFor="photo-caption"
              className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Description (optional)
            </label>
            <textarea
              id="photo-caption"
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Say something about this photo..."
              disabled={isUploading}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#18191a] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e02f21] transition resize-none disabled:opacity-60"
            />
          </div>

          {/* Interactive Photo Adjustment & Preview Viewport */}
          <div className="bg-gray-100 dark:bg-[#18191a] p-3 sm:p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 flex flex-col items-center justify-center space-y-3">
            {isAvatar ? (
              <div className="relative py-2 flex flex-col items-center">
                {/* Circular Viewport with drag and zoom */}
                <div
                  ref={viewportRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onWheel={handleWheel}
                  className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden ring-4 ring-white dark:ring-[#3a3b3c] shadow-2xl bg-black relative select-none ${
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                  }`}
                  title="Drag to reposition, scroll to zoom"
                >
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt="Avatar crop preview"
                    draggable={false}
                    style={{
                      transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                      transformOrigin: "center center",
                    }}
                    className="w-full h-full object-cover pointer-events-none transition-transform duration-75"
                  />
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                {/* Rectangular Cover Viewport with drag and zoom */}
                <div
                  ref={viewportRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onWheel={handleWheel}
                  className={`w-full h-44 sm:h-52 rounded-xl overflow-hidden ring-2 ring-white dark:ring-[#3a3b3c] shadow-lg bg-black relative select-none ${
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                  }`}
                  title="Drag to reposition, scroll to zoom"
                >
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt="Cover crop preview"
                    draggable={false}
                    style={{
                      transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                      transformOrigin: "center center",
                    }}
                    className="w-full h-full object-cover pointer-events-none transition-transform duration-75"
                  />
                </div>
              </div>
            )}

            {/* Resize & Adjustment Controls */}
            <div className="w-full max-w-sm flex items-center justify-between gap-2.5 pt-1 select-none">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut size={18} />
              </button>

              <input
                type="range"
                min={1}
                max={3}
                step={0.02}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-[#e02f21] cursor-pointer h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none"
              />

              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
                title="Zoom in"
              >
                <ZoomIn size={18} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setOffset({ x: 0, y: 0 });
                }}
                className="px-2 py-1 text-xs font-bold text-gray-500 hover:text-[#e02f21] hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex items-center gap-1 transition cursor-pointer"
                title="Reset adjustments"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            </div>

            <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center flex items-center justify-center gap-1">
              <Move size={12} />
              <span>Drag image to reposition • Slider to zoom</span>
            </p>
          </div>

          {/* Share to Feed Checkbox Option */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-[#18191a] cursor-pointer hover:bg-gray-100/80 dark:hover:bg-[#1f2021] transition select-none">
            <input
              type="checkbox"
              checked={shareToFeed}
              onChange={(e) => setShareToFeed(e.target.checked)}
              disabled={isUploading}
              className="mt-1 w-4 h-4 text-[#e02f21] rounded border-gray-300 focus:ring-[#e02f21] cursor-pointer"
            />
            <div className="flex-1 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                <Rss size={15} className="text-[#e02f21] shrink-0" />
                <span>Share update to Feed</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 leading-relaxed">
                Show this update on your profile feed and in friends' feeds so others see that you updated your {isAvatar ? "profile picture" : "cover photo"}.
              </p>
            </div>
          </label>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={isUploading}
              onClick={onClose}
              className="rounded-xl px-4 py-2 font-bold text-sm cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isUploading}
              className="rounded-xl px-5 py-2 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-xs"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePhotoModal;
