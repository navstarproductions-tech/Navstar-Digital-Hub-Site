import { useEffect, useState } from 'react';

type GalleryImage = { id: string; url: string; altText: string };

export function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    let active = true;
    fetch('/api/gallery')
      .then(async (response) => response.ok ? response.json() as Promise<{ images?: GalleryImage[] }> : null)
      .then((result) => { if (active && result?.images) setImages(result.images); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  if (!images.length) return null;

  return (
    <section className="border-t bg-white py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase text-emerald-800">NAVSTAR DIGITAL HUB / GALLERY</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">Inside the hub</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {images.map((image) => <img key={image.id} src={image.url} alt={image.altText} loading="lazy" className="aspect-[4/3] w-full border object-cover" />)}
        </div>
      </div>
    </section>
  );
}