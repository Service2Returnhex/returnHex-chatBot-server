"use client";

import Image from "next/image";
import { useState } from "react";

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
}

const images: GalleryItem[] = [
  {
    id: 1,
    src: "https://i.ibb.co.com/mFG8ZzCd/IMG-20250809-WA0004.jpg",
    alt: "Bot interaction 1",
  },
  {
    id: 2,
    src: "https://i.ibb.co.com/VW3hxKW0/IMG-20250809-WA0001.jpg",
    alt: "Bot interaction 2",
  },
  {
    id: 3,
    src: "https://i.ibb.co.com/r279yTy9/IMG-20250809-WA0003.jpg",
    alt: "Bot interaction 3",
  },
  {
    id: 4,
    src: "https://i.ibb.co.com/d4qnMwbk/IMG-20250809-WA0002.jpg",
    alt: "Bot interaction 4",
  },
  {
    id: 5,
    src: "https://i.ibb.co.com/VW6Mv8yJ/IMG-20250809-WA0005.jpg",
    alt: "Bot interaction 5",
  },
  {
    id: 6,
    src: "https://i.ibb.co.com/qYPXJGnF/IMG-20250809-WA0006.jpg",
    alt: "Bot interaction 6",
  },
];

export default function GalleryGrid() {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  return (
    <section className="py-16 pb-20 ">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-fadeIn">
          Our Bot in Action
        </h2>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative cursor-pointer group overflow-hidden rounded-xl"
              onClick={() => setSelectedImage(img)}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={400}
                height={700}
                className="object-cover w-full h-[450px] transform transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition "></div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl w-full">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                width={1200}
                height={800}
                className="rounded-lg w-full h-[550px] object-contain"
              />
              <button
                className="absolute top-4 right-4 text-white text-3xl font-bold cursor-pointer"
                onClick={() => setSelectedImage(null)}
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
