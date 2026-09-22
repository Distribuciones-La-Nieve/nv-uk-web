"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

function TipCard({
  tip,
  character,
  index,
}: {
  tip: Tip;
  character: string;
  index: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const mediaClass = `${styles.media} ${tip.transparent ? styles.brandScene : ""}`;

  useEffect(() => {
    const video = videoRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pauseForReducedMotion = () => {
      if (motion.matches) {
        video?.pause();
        setPlaying(false);
      }
    };
    motion.addEventListener("change", pauseForReducedMotion);
    return () => {
      video?.pause();
      motion.removeEventListener("change", pauseForReducedMotion);
    };
  }, []);

  function playVideo() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    void videoRef.current?.play().catch(() => setPlaying(false));
  }

  function pauseVideo() {
    const video = videoRef.current;
    video?.pause();
    if (video) video.currentTime = 0;
    setPlaying(false);
  }

  return (
    <article
      className={`${styles.card} ${playing ? styles.playing : ""}`}
      tabIndex={0}
      aria-label={`${tip.title}. Pasa el cursor o enfoca la tarjeta para reproducir el video.`}
      onMouseEnter={() => playVideo()}
      onMouseLeave={pauseVideo}
      onFocus={() => playVideo()}
      onBlur={pauseVideo}
    >
      <div className={mediaClass}>
        <Image
          src={`/images/tips/${tip.file}.${tip.transparent ? "png" : "jpg"}`}
          alt={`${character}: ${tip.title}`}
          fill
          sizes="(min-width: 1280px) 384px, (min-width: 768px) 31vw, calc(100vw - 2rem)"
          className={styles.poster}
        />
        <video
          ref={videoRef}
          className={styles.video}
          src={`/videos/tips/${tip.file}.${tip.transparent ? "webm" : "mp4"}`}
          muted
          loop
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          preload="metadata"
          aria-label={`${character}: ${tip.title}`}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        {!playing && (
          <span className={styles.playHint} aria-hidden="true">
            Pasa el cursor para reproducir
          </span>
        )}
      </div>
      <div className={styles.copy}>
        <span className={styles.eyebrow}>
          Consejo {String(index + 1).padStart(2, "0")} · {character}
        </span>
        <h3>{tip.title}</h3>
        <p>{tip.detail}</p>
      </div>
    </article>
  );
}

export function CultureTopics({
  site = "la-nieve",
}: {
  site?: "la-nieve" | "unimarka";
}) {
  const character = site === "la-nieve" ? "Don Tulio" : "Doña Ceci";
  return (
    <RevealGroup
      className="grid items-stretch gap-6 md:grid-cols-3"
      stagger={0.1}
    >
      {tips[site].map((tip, index) => (
        <TipCard key={tip.file} tip={tip} index={index} character={character} />
      ))}
    </RevealGroup>
  );
}
