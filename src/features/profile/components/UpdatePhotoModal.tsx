import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  X,
  Rss,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Move,
  Check,
} from "lucide-react";

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
  hideFeedOptions?: boolean;
}

type HandleType =
  | "move"
  | "nw"
  | "ne"
  | "se"
  | "sw"
  | "n"
  | "s"
  | "w"
  | "e"
  | null;

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const UpdatePhotoModal: React.FC<UpdatePhotoModalProps> = ({
  isOpen,
  onClose,
  file,
  type,
  onConfirm,
  isUploading = false,
  hideFeedOptions = false,
}) => {
  const [caption, setCaption] = useState("");
  const [shareToFeed, setShareToFeed] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Natural image dimensions
  const [naturalDimensions, setNaturalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Stage & Displayed Image bounds
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 600, height: 400 });
  const [displayedBounds, setDisplayedBounds] = useState({
    x: 0,
    y: 0,
    width: 600,
    height: 400,
  });

  // Crop Box relative to displayed image (0 to displayedBounds.width, 0 to displayedBounds.height)
  const [cropBox, setCropBox] = useState<CropRect>({
    x: 0,
    y: 0,
    width: 400,
    height: 200,
  });

  // Standard Aspect Ratio:
  // Cover is standard 2.7:1 (~ 820x312 / 1200x450 Web standard)
  // Avatar is strictly 1:1 Square
  const isAvatar = type === "avatar";
  const targetAspect = isAvatar ? 1.0 : 2.7;

  // Transform states
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Dragging state
  const [activeHandle, setActiveHandle] = useState<HandleType>(null);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    crop: CropRect;
  }>({
    pointerX: 0,
    pointerY: 0,
    crop: { x: 0, y: 0, width: 0, height: 0 },
  });

  const imageElementRef = useRef<HTMLImageElement>(null);

  // Setup preview URL when file changes
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setCaption("");
      setShareToFeed(true);
      setZoom(1);
      setRotation(0);
      setNaturalDimensions(null);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
      setNaturalDimensions(null);
    }
  }, [file, isAvatar]);

  // Measure stage size on layout / resize
  useEffect(() => {
    if (!isOpen) return;
    const updateSize = () => {
      if (stageRef.current) {
        const w = stageRef.current.clientWidth || 600;
        const h = stageRef.current.clientHeight || 400;
        setStageSize({ width: w, height: h });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [isOpen]);

  // Initialize crop box when natural dimensions or stage size or aspect changes
  const initCropBox = useCallback(
    (
      dispW: number,
      dispH: number,
      aspect: number | null
    ) => {
      const pad = 12;
      const maxW = dispW - pad * 2;
      const maxH = dispH - pad * 2;

      let w = maxW;
      let h = maxH;

      if (aspect) {
        if (maxW / maxH > aspect) {
          h = maxH * 0.92;
          w = h * aspect;
        } else {
          w = maxW * 0.92;
          h = w / aspect;
        }
      } else {
        w = maxW * 0.9;
        h = maxH * 0.85;
      }

      w = Math.max(60, Math.min(dispW, w));
      h = Math.max(40, Math.min(dispH, h));
      const x = Math.max(0, (dispW - w) / 2);
      const y = Math.max(0, (dispH - h) / 2);

      return { x, y, width: w, height: h };
    },
    []
  );

  // Compute displayed image size inside stage
  useEffect(() => {
    if (!naturalDimensions) return;

    const isRotatedSideways = rotation % 180 !== 0;
    const natW = isRotatedSideways
      ? naturalDimensions.height
      : naturalDimensions.width;
    const natH = isRotatedSideways
      ? naturalDimensions.width
      : naturalDimensions.height;

    const contW = stageSize.width;
    const contH = stageSize.height;

    const imgAspect = natW / natH;
    const contAspect = contW / contH;

    let dispW = contW;
    let dispH = contH;

    if (imgAspect > contAspect) {
      dispW = contW * 0.96;
      dispH = dispW / imgAspect;
    } else {
      dispH = contH * 0.96;
      dispW = dispH * imgAspect;
    }

    const dispX = (contW - dispW) / 2;
    const dispY = (contH - dispH) / 2;

    setDisplayedBounds({
      x: dispX,
      y: dispY,
      width: dispW,
      height: dispH,
    });

    setCropBox(initCropBox(dispW, dispH, targetAspect));
  }, [naturalDimensions, stageSize, rotation, targetAspect, initCropBox]);

  // Image load handler to get real natural dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  // Pointer Down (Mouse & Touch via unified Pointer events)
  const handlePointerDown = (handle: HandleType, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setActiveHandle(handle);
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      crop: { ...cropBox },
    };
  };

  // Pointer Move (Attached to window for smooth drag even outside handles)
  useEffect(() => {
    if (!activeHandle) return;

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();
      const dx = e.clientX - dragStartRef.current.pointerX;
      const dy = e.clientY - dragStartRef.current.pointerY;
      const initial = dragStartRef.current.crop;
      const maxW = displayedBounds.width;
      const maxH = displayedBounds.height;
      const minW = 60;
      const minH = 40;
      const aspect = targetAspect;

      if (activeHandle === "move") {
        const nextX = Math.max(0, Math.min(maxW - initial.width, initial.x + dx));
        const nextY = Math.max(
          0,
          Math.min(maxH - initial.height, initial.y + dy)
        );
        setCropBox({
          ...initial,
          x: nextX,
          y: nextY,
        });
        return;
      }

      let newX = initial.x;
      let newY = initial.y;
      let newW = initial.width;
      let newH = initial.height;

      // Handle corner and edge resizing
      if (aspect) {
        // Constrained by Aspect Ratio
        if (activeHandle === "se") {
          let candidateW = Math.max(minW, Math.min(maxW - initial.x, initial.width + dx));
          let candidateH = candidateW / aspect;
          if (initial.y + candidateH > maxH) {
            candidateH = maxH - initial.y;
            candidateW = candidateH * aspect;
          }
          newW = candidateW;
          newH = candidateH;
        } else if (activeHandle === "sw") {
          let candidateW = Math.max(
            minW,
            Math.min(initial.x + initial.width, initial.width - dx)
          );
          let candidateH = candidateW / aspect;
          if (initial.y + candidateH > maxH) {
            candidateH = maxH - initial.y;
            candidateW = candidateH * aspect;
          }
          newX = initial.x + initial.width - candidateW;
          newW = candidateW;
          newH = candidateH;
        } else if (activeHandle === "ne") {
          let candidateW = Math.max(minW, Math.min(maxW - initial.x, initial.width + dx));
          let candidateH = candidateW / aspect;
          if (initial.y + initial.height - candidateH < 0) {
            candidateH = initial.y + initial.height;
            candidateW = candidateH * aspect;
          }
          newW = candidateW;
          newY = initial.y + initial.height - candidateH;
          newH = candidateH;
        } else if (activeHandle === "nw") {
          let candidateW = Math.max(
            minW,
            Math.min(initial.x + initial.width, initial.width - dx)
          );
          let candidateH = candidateW / aspect;
          if (initial.y + initial.height - candidateH < 0) {
            candidateH = initial.y + initial.height;
            candidateW = candidateH * aspect;
          }
          newX = initial.x + initial.width - candidateW;
          newY = initial.y + initial.height - candidateH;
          newW = candidateW;
          newH = candidateH;
        } else if (activeHandle === "e" || activeHandle === "w") {
          let candidateW =
            activeHandle === "e"
              ? Math.max(minW, Math.min(maxW - initial.x, initial.width + dx))
              : Math.max(
                  minW,
                  Math.min(initial.x + initial.width, initial.width - dx)
                );
          let candidateH = candidateW / aspect;
          let candidateY = initial.y + (initial.height - candidateH) / 2;
          if (candidateY < 0) candidateY = 0;
          if (candidateY + candidateH > maxH) {
            candidateH = maxH - candidateY;
            candidateW = candidateH * aspect;
          }
          if (activeHandle === "w") {
            newX = initial.x + initial.width - candidateW;
          }
          newY = candidateY;
          newW = candidateW;
          newH = candidateH;
        } else if (activeHandle === "s" || activeHandle === "n") {
          let candidateH =
            activeHandle === "s"
              ? Math.max(minH, Math.min(maxH - initial.y, initial.height + dy))
              : Math.max(
                  minH,
                  Math.min(initial.y + initial.height, initial.height - dy)
                );
          let candidateW = candidateH * aspect;
          let candidateX = initial.x + (initial.width - candidateW) / 2;
          if (candidateX < 0) candidateX = 0;
          if (candidateX + candidateW > maxW) {
            candidateW = maxW - candidateX;
            candidateH = candidateW / aspect;
          }
          if (activeHandle === "n") {
            newY = initial.y + initial.height - candidateH;
          }
          newX = candidateX;
          newW = candidateW;
          newH = candidateH;
        }
      } else {
        // Freeform Resizing
        if (activeHandle.includes("e")) {
          newW = Math.max(minW, Math.min(maxW - initial.x, initial.width + dx));
        }
        if (activeHandle.includes("w")) {
          const maxLeftShift = initial.x + initial.width - minW;
          const candidateX = Math.max(
            0,
            Math.min(maxLeftShift, initial.x + dx)
          );
          newW = initial.width + (initial.x - candidateX);
          newX = candidateX;
        }
        if (activeHandle.includes("s")) {
          newH = Math.max(minH, Math.min(maxH - initial.y, initial.height + dy));
        }
        if (activeHandle.includes("n")) {
          const maxTopShift = initial.y + initial.height - minH;
          const candidateY = Math.max(
            0,
            Math.min(maxTopShift, initial.y + dy)
          );
          newH = initial.height + (initial.y - candidateY);
          newY = candidateY;
        }
      }

      setCropBox({
        x: Math.max(0, Math.min(maxW - newW, newX)),
        y: Math.max(0, Math.min(maxH - newH, newY)),
        width: Math.max(minW, Math.min(maxW, newW)),
        height: Math.max(minH, Math.min(maxH, newH)),
      });
    };

    const handlePointerUp = () => {
      setActiveHandle(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [activeHandle, targetAspect, displayedBounds]);

  if (!isOpen || !file || !previewUrl) {
    return null;
  }

  const modalTitle = isAvatar ? "Crop Profile Picture" : "Crop Cover";
  const cropButtonText = isAvatar ? "Crop Profile Image" : "Crop Cover Image";

  // Perform accurate Canvas Crop & Export
  const handleCropAndConfirm = () => {
    try {
      const img = imageElementRef.current;
      if (!img || !naturalDimensions) {
        onConfirm(file, { caption: caption.trim(), shareToFeed });
        onClose();
        return;
      }

      const dispW = displayedBounds.width;
      const dispH = displayedBounds.height;
      if (dispW <= 0 || dispH <= 0 || cropBox.width <= 0 || cropBox.height <= 0) {
        onConfirm(file, { caption: caption.trim(), shareToFeed });
        onClose();
        return;
      }

      // Output resolution target
      const targetW = isAvatar ? 640 : 1200;
      const targetH = isAvatar
        ? 640
        : Math.round(targetW / (cropBox.width / cropBox.height));

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Precise mapping from cropBox coordinates inside displayedBounds to canvas output
        const scaleToOutput = targetW / cropBox.width;

        ctx.save();
        ctx.scale(scaleToOutput, scaleToOutput);
        ctx.translate(-cropBox.x, -cropBox.y);

        // Center transform for zoom and rotation
        ctx.translate(dispW / 2, dispH / 2);
        if (rotation !== 0) {
          ctx.rotate((rotation * Math.PI) / 180);
        }
        if (zoom !== 1) {
          ctx.scale(zoom, zoom);
        }

        // Draw image onto displayed bounds
        const isRotatedSideways = rotation % 180 !== 0;
        const drawW = isRotatedSideways ? dispH : dispW;
        const drawH = isRotatedSideways ? dispW : dispH;

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const croppedFile = new File([blob], file.name, {
                type: mimeType,
              });
              onConfirm(croppedFile, {
                caption: caption.trim(),
                shareToFeed,
              });
            } else {
              onConfirm(file, {
                caption: caption.trim(),
                shareToFeed,
              });
            }
          },
          mimeType,
          0.95
        );

        onClose();
        return;
      }
    } catch (err) {
      console.error("Cropping failed:", err);
    }

    onConfirm(file, {
      caption: caption.trim(),
      shareToFeed,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => {
        if (!isUploading) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#242526] text-gray-900 dark:text-gray-100 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            {modalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            aria-label="Close dialog"
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Interactive Crop Stage with Dark Backdrop for contrast */}
          <div
            ref={stageRef}
            className="w-full h-[320px] sm:h-[400px] bg-[#111214] rounded-2xl relative overflow-hidden flex items-center justify-center select-none shadow-inner border border-gray-800"
          >
            {/* Centered Image Container */}
            <div
              style={{
                width: `${displayedBounds.width}px`,
                height: `${displayedBounds.height}px`,
                transform: `translate(${displayedBounds.x - (stageSize.width - displayedBounds.width) / 2}px, ${displayedBounds.y - (stageSize.height - displayedBounds.height) / 2}px)`,
              }}
              className="relative overflow-hidden shrink-0 flex items-center justify-center"
            >
              {/* Image with zoom and rotation */}
              <img
                ref={imageElementRef}
                src={previewUrl}
                alt="Source preview"
                onLoad={handleImageLoad}
                draggable={false}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                }}
                className="w-full h-full object-contain pointer-events-none transition-transform duration-75"
              />

              {/* Crop Box with 8 Resizable Handles & Shaded Outside Mask */}
              <div
                style={{
                  left: `${cropBox.x}px`,
                  top: `${cropBox.y}px`,
                  width: `${cropBox.width}px`,
                  height: `${cropBox.height}px`,
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.65)",
                }}
                onPointerDown={(e) => handlePointerDown("move", e)}
                className="absolute border border-white/95 cursor-move z-20 touch-none"
              >
                {/* Rule of Thirds Grid Lines */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-white/20" />
                  <div className="border-r border-white/20" />
                  <div />
                </div>

                {/* Avatar Circular Guide */}
                {isAvatar && (
                  <div className="absolute inset-0 rounded-full border border-white/50 border-dashed pointer-events-none" />
                )}

                {/* 8 Grab Handles: 4 corners + 4 midpoints */}
                {/* Top-Left */}
                <div
                  onPointerDown={(e) => handlePointerDown("nw", e)}
                  className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-white border border-gray-500 shadow-xs cursor-nwse-resize z-30"
                />
                {/* Top-Center */}
                <div
                  onPointerDown={(e) => handlePointerDown("n", e)}
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border border-gray-500 shadow-xs cursor-ns-resize z-30"
                />
                {/* Top-Right */}
                <div
                  onPointerDown={(e) => handlePointerDown("ne", e)}
                  className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-white border border-gray-500 shadow-xs cursor-nesw-resize z-30"
                />
                {/* Left-Center */}
                <div
                  onPointerDown={(e) => handlePointerDown("w", e)}
                  className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-gray-500 shadow-xs cursor-ew-resize z-30"
                />
                {/* Right-Center */}
                <div
                  onPointerDown={(e) => handlePointerDown("e", e)}
                  className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-gray-500 shadow-xs cursor-ew-resize z-30"
                />
                {/* Bottom-Left */}
                <div
                  onPointerDown={(e) => handlePointerDown("sw", e)}
                  className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 bg-white border border-gray-500 shadow-xs cursor-nesw-resize z-30"
                />
                {/* Bottom-Center */}
                <div
                  onPointerDown={(e) => handlePointerDown("s", e)}
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border border-gray-500 shadow-xs cursor-ns-resize z-30"
                />
                {/* Bottom-Right */}
                <div
                  onPointerDown={(e) => handlePointerDown("se", e)}
                  className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-white border border-gray-500 shadow-xs cursor-nwse-resize z-30"
                />
              </div>
            </div>
          </div>

          {/* Quick Adjustment Controls Toolbar (Platform Theme styled) */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 bg-gray-50 dark:bg-[#18191a] rounded-xl border border-gray-200/80 dark:border-gray-800 text-xs">
            <span className="text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-1.5 pl-1">
              <span>Zoom & Orientation</span>
            </span>

            {/* Zoom & Rotation Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
                className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:text-[#e02f21] dark:hover:text-[#e02f21] hover:bg-gray-200/60 dark:hover:bg-gray-800 transition cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut size={16} />
              </button>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-24 sm:w-36 accent-[#e02f21] cursor-pointer h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
                className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:text-[#e02f21] dark:hover:text-[#e02f21] hover:bg-gray-200/60 dark:hover:bg-gray-800 transition cursor-pointer"
                title="Zoom in"
              >
                <ZoomIn size={16} />
              </button>

              <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:text-[#e02f21] dark:hover:text-[#e02f21] hover:bg-gray-200/60 dark:hover:bg-gray-800 transition cursor-pointer flex items-center gap-1 font-semibold"
                title="Rotate 90 degrees"
              >
                <RotateCw size={15} />
                <span className="hidden sm:inline">Rotate</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setRotation(0);
                  if (displayedBounds.width && displayedBounds.height) {
                    setCropBox(
                      initCropBox(
                        displayedBounds.width,
                        displayedBounds.height,
                        targetAspect
                      )
                    );
                  }
                }}
                className="p-1.5 rounded-lg text-gray-500 hover:text-[#e02f21] hover:bg-gray-200/60 dark:hover:bg-gray-800 transition cursor-pointer flex items-center gap-1 font-semibold"
                title="Reset crop frame and adjustments"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Optional Caption & Share to Feed (when not hidden) */}
          {!hideFeedOptions && (
            <div className="space-y-3 pt-1">
              <div>
                <label
                  htmlFor="photo-caption"
                  className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
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

              <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-[#18191a] cursor-pointer hover:bg-gray-100/80 dark:hover:bg-[#1f2021] transition select-none">
                <input
                  type="checkbox"
                  checked={shareToFeed}
                  onChange={(e) => setShareToFeed(e.target.checked)}
                  disabled={isUploading}
                  className="mt-0.5 w-4 h-4 text-[#e02f21] accent-[#e02f21] rounded border-gray-300 focus:ring-[#e02f21] cursor-pointer"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                    <Rss size={14} className="text-[#e02f21] shrink-0" />
                    <span>Share update to Feed</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5 leading-relaxed">
                    Show this update on your profile feed and in friends' feeds.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Move size={12} />
              <span>Drag handles to resize • Drag inside box to reposition</span>
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={isUploading}
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
              {/* Roshoi Bondhu Primary Brand Action Button */}
              <button
                type="button"
                disabled={isUploading}
                onClick={handleCropAndConfirm}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#e02f21] hover:bg-[#c92518] transition-all cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <Check size={16} strokeWidth={2.5} />
                <span>{cropButtonText}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePhotoModal;
