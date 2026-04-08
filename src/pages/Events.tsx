import { useState, useEffect } from "react";

const PHOTOS = [
    { src: "/fotos/bar.jpeg", alt: "Bar equipado com freezer", category: "Geral" },
    { src: "/fotos/espaco-1.jpeg", alt: "Espaço coberto", category: "Geral" },
    { src: "/fotos/espaco-2.jpeg", alt: "Espaço ao ar livre", category: "Geral" },
    { src: "/fotos/quadra-1-hr.jpeg", alt: "Vista geral Quadra 01", category: "Quadras de Areia" },
    { src: "/fotos/quadra-1.jpeg", alt: "Vista panorâmica da Quadra 01", category: "Quadras de Areia" },
    { src: "/fotos/quadra-2-hr.jpeg", alt: "Vista geral Quadra 02", category: "Quadras de Areia" },
    { src: "/fotos/quadra-3-hr.jpeg", alt: "Vista geral Quadra 03", category: "Quadras de Areia" },
    { src: "/fotos/quadra-3.jpeg", alt: "Vista panorâmica da Quadra 03", category: "Quadras de Areia" },
    { src: "/fotos/piscina-1.jpeg", alt: "Área da piscina", category: "Piscina" },
    { src: "/fotos/piscina-2.jpeg", alt: "Vista lateral da piscina", category: "Piscina" },
    { src: "/fotos/sauna.jpeg", alt: "Sauna para relaxamento", category: "Piscina" },
    { src: "/fotos/brinquedoteca.jpeg", alt: "Brinquedoteca equipada", category: "Brinquedoteca" },
] as const;

type Photo = typeof PHOTOS[number];
const CATEGORIES = ["Todos", "Quadras de Areia", "Piscina", "Brinquedoteca", "Geral"] as const;
type Category = typeof CATEGORIES[number];

// Ícones (mantidos apenas os necessários)
const IconSand = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="14" width="18" height="4" rx="1" />
        <path d="M7 14V9a5 5 0 0 1 10 0v5" />
        <path d="M12 9V6" />
    </svg>
);

const IconPool = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h20M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0M9 12V7a3 3 0 0 1 6 0v5" />
    </svg>
);

const IconKids = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="4" r="2" />
        <path d="M7 10h10l-1 7H8l-1-7z" />
        <path d="M10 17v3M14 17v3" />
    </svg>
);

const IconClose = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18M6 6l12 12" />
    </svg>
);

const IconArrowLeft = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
    </svg>
);

const IconArrowRight = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
    </svg>
);

// Lightbox
function Lightbox({ photos, index, onClose, onPrev, onNext }: {
    photos: readonly Photo[];
    index: number;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
}) {
    const photo = photos[index];

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onPrev();
            if (e.key === "ArrowRight") onNext();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose, onPrev, onNext]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                aria-label="Fechar"
                className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
                <IconClose />
            </button>

            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/50 text-sm tracking-widest">
                {index + 1} / {photos.length}
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="absolute left-6 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                aria-label="Anterior"
            >
                <IconArrowLeft />
            </button>

            <div className="max-w-5xl px-6" onClick={(e) => e.stopPropagation()}>
                <img
                    src={photo.src}
                    alt={photo.alt}
                    className="max-h-[85vh] max-w-full object-contain rounded-3xl shadow-2xl"
                />
                <p className="text-center text-white/60 text-sm mt-4 px-4">
                    {photo.alt}
                </p>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="absolute right-6 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                aria-label="Próxima"
            >
                <IconArrowRight />
            </button>
        </div>
    );
}

// Página principal
export default function EventsPage() {
    const [activeCategory, setActiveCategory] = useState<Category>("Todos");
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const filteredPhotos = activeCategory === "Todos"
        ? PHOTOS
        : PHOTOS.filter((p) => p.category === activeCategory);

    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const goToPrev = () => setLightboxIndex((prev) => (prev! - 1 + filteredPhotos.length) % filteredPhotos.length);
    const goToNext = () => setLightboxIndex((prev) => (prev! + 1) % filteredPhotos.length);

    return (
        <main className="min-h-screen font-sans">
            {/* HERO */}
            <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-20">

                <div className="max-w-5xl mx-auto px-6 sm:px-10">
                    {/* Eyebrow */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px w-8 bg-emerald-800" />
                        <span className="text-xs font-semibold uppercase tracking-[0.125em] text-emerald-800">
                            Espaço Meta Sport Center
                        </span>
                    </div>

                    {/* Título */}
                    <h1 className="font-bold text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.05] text-neutral-950 mb-6">
                        Um espaço feito para{" "}
                        <span className="text-emerald-800">toda a família</span>
                    </h1>

                    {/* Descrição */}
                    <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mb-12 leading-relaxed">
                        Bem-vindo à Meta Sport Center — um lugar pensado para reunir esporte,
                        lazer e diversão em um único ambiente. Com três quadras de areia,
                        piscina, sauna e uma brinquedoteca encantadora.
                    </p>

                    {/* Cards de facilidades */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: <IconSand />, title: "Quadras de Areia", desc: "Quadras com rede ajustável e removível para praticar diversos esportes." },
                            { icon: <IconPool />, title: "Piscina", desc: "Área com piscina e sauna ideal para se divertir e relaxar." },
                            { icon: <IconKids />, title: "Brinquedoteca", desc: "Espaço seguro, repleto de diversão para as crianças." },
                        ].map(({ icon, title, desc }) => (
                            <div
                                key={title}
                                className="group p-8 rounded-3xl border border-neutral-200 bg-white hover:border-emerald-800/30 hover:shadow-xl transition-all duration-300"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {icon}
                                </div>
                                <h3 className="font-semibold text-xl text-neutral-950 mb-3">{title}</h3>
                                <p className="text-neutral-600 text-[15px] leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* GALERIA DE FOTOS */}
            <section className="max-w-7xl mx-auto px-6 py-16">
                <h2 className="text-4xl font-bold text-center text-neutral-950 mb-4">Conheça nosso espaço</h2>
                <p className="text-neutral-600 text-center mb-10 max-w-md mx-auto">
                    Clique nas imagens para ampliar
                </p>

                {/* Filtros */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                                ? "bg-emerald-800 text-white shadow-md"
                                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid de fotos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredPhotos.map((photo, idx) => (
                        <div
                            key={idx}
                            onClick={() => openLightbox(idx)}
                            className="group relative aspect-4/3 overflow-hidden rounded-3xl cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500"
                        >
                            <img
                                src={photo.src}
                                alt={photo.alt}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-4 left-4 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                {photo.alt}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10">
                    <h3 className="text-2xl font-bold text-neutral-950 mb-4">Faça sua reserva agora mesmo</h3>
                    <p className="mb-4">Não perca mais tempo! Entre em contato conosco e garanta um final de semana divertido, relaxante e que cabe no seu bolso.</p>
                    <a
                        href="https://wa.me/5564992014270"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 w-fit bg-green-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
                    >
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                            className="w-4 h-4"
                        />
                        Falar no WhatsApp
                    </a>
                </div>
            </section>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <Lightbox
                    photos={filteredPhotos}
                    index={lightboxIndex}
                    onClose={closeLightbox}
                    onPrev={goToPrev}
                    onNext={goToNext}
                />
            )}
        </main>
    );
}