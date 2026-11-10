import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from './Modal';

export default function ImageViewer({ images, initialIndex = 0, onClose }: { images: string[]; initialIndex?: number; onClose: () => void }) {
  const [index, setIndex] = useState(initialIndex);
  const move = (amount: number) => setIndex((value) => (value + amount + images.length) % images.length);
  useEffect(() => {
    const handle = (event: KeyboardEvent) => { if (event.key === 'ArrowRight') setIndex((value) => (value + 1) % images.length); if (event.key === 'ArrowLeft') setIndex((value) => (value - 1 + images.length) % images.length); };
    document.addEventListener('keydown', handle); return () => document.removeEventListener('keydown', handle);
  }, [images.length]);
  return <Modal isOpen={true} onClose={onClose} title={`Photo ${index + 1} of ${images.length}`} maxWidth="max-w-4xl"><div className="relative bg-black flex items-center justify-center min-h-52"><img src={images[index]} alt={`Community food photo ${index + 1}`} className="w-full max-h-[72dvh] object-contain" />{images.length > 1 && <><button type="button" aria-label="Previous photo" onClick={() => move(-1)} className="absolute left-3 rounded-full bg-black/60 text-white p-3"><ChevronLeft size={22} /></button><button type="button" aria-label="Next photo" onClick={() => move(1)} className="absolute right-3 rounded-full bg-black/60 text-white p-3"><ChevronRight size={22} /></button></>}</div></Modal>;
}
