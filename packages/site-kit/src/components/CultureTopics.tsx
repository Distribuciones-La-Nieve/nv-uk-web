"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { RevealGroup } from "./RevealGroup";
import styles from "./CultureFlipCard.module.css";

type Tip = {
  title: string;
  detail: string;
  file: string;
  transparent?: boolean;
};
const tips: Record<"la-nieve" | "unimarka", readonly Tip[]> = {
  "la-nieve": [
    {
      file: "rotacion",
      title: "Dale protagonismo a los productos de mayor rotación",
      detail:
        "Identifica lo que más compran tus clientes y asegúrate de tener siempre existencias. ¡Evita perder ventas por falta de inventario!",
    },
    {
      file: "fechas",
      title: "Revisa constantemente las fechas de vencimiento",
      detail:
        "Aplica la regla PEPS: primero en entrar, primero en salir. Coloca adelante los productos con fecha de vencimiento más próxima.",
    },
    {
      file: "inventario",
      title: "Controla tu inventario",
      detail:
        "Haz revisiones periódicas para conocer qué tienes, qué se vende más y qué necesitas pedir. Esto te ayuda a reducir faltantes y productos de baja rotación.",
    },
  ],
  unimarka: [
    {
      file: "promociones",
      title: "Mantén precios y promociones visibles",
      detail:
        "Comunica de manera clara las promociones y ofertas. Un cliente que conoce el beneficio tiene más razones para comprar.",
    },
    {
      file: "limpieza",
      title: "Cuida la limpieza y la seguridad",
      detail:
        "Un espacio limpio, iluminado y organizado genera confianza y hace que tus clientes quieran regresar.",
    },
    {
      file: "clientes",
      transparent: true,
      title: "Conoce a tus clientes",
      detail:
        "Escucha sus necesidades, identifica sus productos favoritos y adapta tu surtido a lo que realmente buscan.",
    },
  ],
};

function TipVideo({ tip, character }: { tip: Tip; character: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!motion.matches) void video?.play().catch(() => {});
    const pause = () => {
      if (motion.matches) video?.pause();
    };
    motion.addEventListener("change", pause);
    return () => {
      video?.pause();
      motion.removeEventListener("change", pause);
    };
  }, []);
  return (
    <video
      ref={ref}
      className={styles.video}
      src={`/videos/tips/${tip.file}.${tip.transparent ? "webm" : "mp4"}`}
      poster={`/images/tips/${tip.file}.${tip.transparent ? "png" : "jpg"}`}
      controls={false}
      muted
      loop
      playsInline
      disablePictureInPicture
      disableRemotePlayback
      preload="none"
      aria-label={`${character}: ${tip.title}`}
    />
  );
}

function TipCard({
  tip,
  character,
  selected,
  onToggle,
  index,
}: {
  tip: Tip;
  character: string;
  selected: boolean;
  onToggle: () => void;
  index: number;
}) {
  const id = useId();
  const mediaClass = `${styles.media} ${tip.transparent ? styles.brandScene : ""}`;
  return (
    <article
      className={styles.card}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("button, a, input"))
          return;
        onToggle();
      }}
    >
      <div className={styles.perspective}>
        <div className={`${styles.rotator} ${selected ? styles.flipped : ""}`}>
          <div
            className={`${styles.face} ${styles.front}`}
            inert={selected}
            aria-hidden={selected}
          >
            <div className={mediaClass}>
              <Image
                src={`/images/tips/${tip.file}.${tip.transparent ? "png" : "jpg"}`}
                alt={`${character}: ${tip.title}`}
                fill
                sizes="(min-width: 1280px) 384px, (min-width: 768px) 31vw, calc(100vw - 2rem)"
                className={styles.poster}
              />
            </div>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                Consejo {String(index + 1).padStart(2, "0")} · {character}
              </span>
              <h3>{tip.title}</h3>
              <p className={styles.invitation}>
                Un consejo para poner en práctica en tu negocio.
              </p>
            </div>
          </div>
          <div
            id={id}
            className={`${styles.face} ${styles.back}`}
            inert={!selected}
            aria-hidden={!selected}
          >
            <div className={mediaClass}>
              {selected && <TipVideo tip={tip} character={character} />}
            </div>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>{character} te recomienda</span>
              <h3>{tip.title}</h3>
              <p>{tip.detail}</p>
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={selected}
        aria-controls={id}
        aria-label={`${selected ? "Volver a la portada" : "Girar y para ver consejo"}: ${tip.title}`}
        onClick={onToggle}
      >
        {selected ? "Volver a la portada" : "Girar y para ver consejo"}
        <span aria-hidden="true">↻</span>
      </button>
    </article>
  );
}

export function CultureTopics({
  site = "la-nieve",
}: {
  site?: "la-nieve" | "unimarka";
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const character = site === "la-nieve" ? "Don Tulio" : "Doña Ceci";
  return (
    <RevealGroup
      className="grid items-stretch gap-6 md:grid-cols-3"
      stagger={0.1}
    >
      {tips[site].map((tip, index) => (
        <TipCard
          key={tip.file}
          tip={tip}
          index={index}
          character={character}
          selected={selected === index}
          onToggle={() =>
            setSelected((current) => (current === index ? null : index))
          }
        />
      ))}
    </RevealGroup>
  );
}
