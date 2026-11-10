import React, { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import ImageViewer from "../../../components/ui/ImageViewer";

export default function ProfilePhotosCard({ posts = [] }: { posts?: any[] }) {
  const [tab, setTab] = useState("UPLOADS");
  const [selected, setSelected] = useState<number | null>(null);
  const images = [
    ...new Set<string>(
      posts.filter((post) => post.image).map((post) => post.image),
    ),
  ];
  return (
    <section className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold">Photos</h2>
        <p className="text-sm text-gray-500 mt-1">
          {images.length} kitchen moments shared
        </p>
      </div>
      <div
        className="flex gap-2 overflow-x-auto pb-2"
        role="tablist"
        aria-label="Photo collections"
      >
        {[
          { id: "UPLOADS", label: "Uploads" },
          { id: "TAGGED", label: "Tagged photos" },
          { id: "ALBUMS", label: "Albums" },
        ].map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={tab === item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap ${tab === item.id ? "bg-red-50 dark:bg-red-950/40 text-[#e02f21] dark:text-red-300" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab === "ALBUMS" && images.length > 0 ? (
        <button
          type="button"
          onClick={() => setTab("UPLOADS")}
          className="text-left max-w-xs w-full"
        >
          <img
            src={images[0]}
            alt="Recipe collection cover"
            className="aspect-square w-full rounded-xl object-cover"
          />
          <h3 className="font-semibold mt-3">Recipes & kitchen stories</h3>
          <p className="text-sm text-gray-500">{images.length} photos</p>
        </button>
      ) : tab === "TAGGED" || !images.length ? (
        <div className="py-12 text-center text-gray-500">
          <ImageIcon size={30} className="mx-auto mb-3 text-gray-400" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">
            {tab === "TAGGED"
              ? "No tagged photos yet"
              : "Your kitchen gallery starts here"}
          </h3>
          <p className="text-sm mt-2">
            {tab === "TAGGED"
              ? "Photos you are tagged in will appear here."
              : "Photos shared in posts and recipes will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((src, index) => (
            <button
              type="button"
              key={src}
              aria-label={`Open photo ${index + 1}`}
              onClick={() => setSelected(index)}
              className="aspect-square overflow-hidden rounded-xl group"
            >
              <img
                src={src}
                alt={`Kitchen photo ${index + 1}`}
                loading="lazy"
                className="w-full h-full object-cover transition group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}
      {selected !== null && (
        <ImageViewer
          images={images}
          initialIndex={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
