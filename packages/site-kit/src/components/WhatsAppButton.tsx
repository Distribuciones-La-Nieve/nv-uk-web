import Image from "next/image";
import type { SiteConfig } from "../config/types";
import styles from "./WhatsAppButton.module.css";

function toWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("57")) return digits;
  return digits.length === 10 ? `57${digits}` : digits;
}

/** Direct, accessible WhatsApp shortcut for the active corporate brand. */
export function WhatsAppButton({ site }: { site: SiteConfig }) {
  if (!site.contact.phone) return null;

  const phone = toWhatsAppNumber(site.contact.phone);
  const character =
    site.id === "unimarka"
      ? {
          src: "/images/whatsapp-personaje-unimarka-v2.webp",
          width: 190,
          prompt: "Charla con Doña Ceci",
        }
      : {
          src: "/images/whatsapp-personaje.webp",
          width: 176,
          prompt: "Charla con Don Tulio",
        };
  const message = encodeURIComponent(
    `Hola, quiero comunicarme con ${site.name}.`
  );

  return (
    <div className={styles.clearance}>
      <a
        href={`https://wa.me/${phone}?text=${message}`}
        target="_blank"
        rel="noreferrer"
        aria-label={`Escribir a ${site.name} por WhatsApp`}
        className={styles.button}
      >
        <span className={styles.rotator} aria-hidden="true">
          <span className={styles.iconFace}>
            <Image
              src="/images/whatsapp.webp"
              alt=""
              width={48}
              height={48}
              className={styles.icon}
            />
          </span>
          <span className={styles.characterFace}>
            <Image
              src={character.src}
              alt=""
              width={character.width}
              height={256}
              className={styles.character}
            />
          </span>
        </span>
        <span className={styles.characterPrompt} aria-hidden="true">
          {character.prompt}
        </span>
        <span className={styles.label} aria-hidden="true">
          WhatsApp
        </span>
      </a>
    </div>
  );
}
