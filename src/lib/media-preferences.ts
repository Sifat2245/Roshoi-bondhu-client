/**
 * Global Media Preferences Provider & Utilities
 * Provides synchronous access and utility functions for media behavior across Heshel.
 */

export interface MediaSettings {
  highQualityUploads: boolean;
  hdrVideo: boolean;
  autoplay: 'ALWAYS' | 'WIFI_ONLY' | 'NEVER';
  dataSaver: boolean;
  stepGalleryFullscreen: boolean;
  showNutritionOverlay: boolean;
}

export const DEFAULT_MEDIA_SETTINGS: MediaSettings = {
  highQualityUploads: true,
  hdrVideo: false,
  autoplay: 'WIFI_ONLY',
  dataSaver: false,
  stepGalleryFullscreen: true,
  showNutritionOverlay: false,
};

const STORAGE_KEY = 'heshel_media_settings';

export function getLocalMediaSettings(): MediaSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MEDIA_SETTINGS;
    return { ...DEFAULT_MEDIA_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_MEDIA_SETTINGS;
  }
}

export function saveLocalMediaSettings(settings: Partial<MediaSettings>): MediaSettings {
  try {
    const current = getLocalMediaSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Dispatch custom event so listeners update reactively
    window.dispatchEvent(new CustomEvent('heshel_media_settings_changed', { detail: updated }));
    return updated;
  } catch {
    return DEFAULT_MEDIA_SETTINGS;
  }
}

/**
 * Checks whether videos should autoplay based on user preference and active network type.
 */
export function canAutoplayMedia(): boolean {
  const settings = getLocalMediaSettings();
  if (settings.autoplay === 'NEVER') return false;
  if (settings.autoplay === 'ALWAYS') return true;

  // WIFI_ONLY mode: inspect Network Information API if available
  const nav = navigator as any;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  if (connection) {
    if (connection.type === 'cellular') return false;
    if (connection.saveData) return false;
  }
  return true;
}

/**
 * Checks whether data saver is active.
 */
export function isDataSaverActive(): boolean {
  const settings = getLocalMediaSettings();
  return Boolean(settings.dataSaver);
}

/**
 * Checks whether highest quality uploads is enabled.
 */
export function isHighQualityUploads(): boolean {
  const settings = getLocalMediaSettings();
  return Boolean(settings.highQualityUploads);
}

/**
 * Checks whether recipe gallery should open in full screen.
 */
export function isStepGalleryFullscreen(): boolean {
  const settings = getLocalMediaSettings();
  return Boolean(settings.stepGalleryFullscreen);
}

/**
 * Checks whether nutrition overlays should be shown on food photos.
 */
export function isShowNutritionOverlay(): boolean {
  const settings = getLocalMediaSettings();
  return Boolean(settings.showNutritionOverlay);
}

/**
 * Compress an image file on the client if dataSaver is ON or highQualityUploads is OFF.
 */
export async function optimizeImageForUpload(file: File): Promise<File> {
  const settings = getLocalMediaSettings();

  // If high quality is enabled and data saver is off, preserve original file
  if (settings.highQualityUploads && !settings.dataSaver) {
    return file;
  }

  // Otherwise optimize / compress
  return new Promise((resolve) => {
    // If not an image, return original
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = settings.dataSaver ? 1280 : 1920;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);

        ctx.drawImage(img, 0, 0, width, height);

        const quality = settings.dataSaver ? 0.72 : 0.85;
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              return resolve(file);
            }
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

