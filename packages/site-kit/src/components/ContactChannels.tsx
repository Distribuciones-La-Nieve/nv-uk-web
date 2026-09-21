import { Mail, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SiteConfig } from "../config/types";

const SOCIAL_NETWORKS = [
  {
    key: "linkedin",
    label: "LinkedIn",
    surfaceClass: "border-[#0A66C2] bg-[#0A66C2] text-white",
  },
  {
    key: "instagram",
    label: "Instagram",
    surfaceClass:
      "border-transparent bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white",
  },
  {
    key: "facebook",
    label: "Facebook",
    surfaceClass: "border-[#1877F2] bg-[#1877F2] text-white",
  },
] as const satisfies readonly {
  key: keyof SiteConfig["socialLinks"];
  label: string;
  surfaceClass: string;
}[];

type SocialNetwork = (typeof SOCIAL_NETWORKS)[number]["key"];

function SocialIcon({ network }: { network: SocialNetwork }) {
  if (network === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle
          cx="12"
          cy="12"
          r="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="17.3" cy="6.8" r="1" fill="currentColor" />
      </svg>
    );
  }

  if (network === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M13.6 21v-8h2.75l.4-3.15H13.6V7.82c0-.91.26-1.53 1.59-1.53H17V3.48a24 24 0 0 0-2.62-.14c-2.6 0-4.38 1.58-4.38 4.49v2.02H7.1V13H10v8h3.6Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M8 10v7M8 7.25v.01M12 17v-7M12 13.25c0-1.8 1.2-3.25 2.8-3.25 1.55 0 2.2 1.05 2.2 2.8V17" />
    </svg>
  );
}

function DirectChannel({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          {label}
        </span>
        <span className="mt-1 block whitespace-nowrap text-[0.8125rem] font-semibold tracking-tight text-card-foreground sm:text-sm">
          {value}
        </span>
      </span>
    </>
  );

  return href ? (
    <a
      href={href}
      className="flex min-h-20 flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-card motion-reduce:transform-none sm:flex-row sm:items-center sm:gap-4"
    >
      {content}
    </a>
  ) : (
    <div
      className="flex min-h-20 flex-col items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:gap-4"
      aria-disabled="true"
    >
      {content}
    </div>
  );
}

export function ContactChannels({ site }: { site: SiteConfig }) {
  const phoneHref = site.contact.phone
    ? `tel:${site.contact.phone.replace(/\s/g, "")}`
    : undefined;
  const emailHref = site.contact.email
    ? `mailto:${site.contact.email}`
    : undefined;

  return (
    <div className="mt-10 space-y-6">
      <section
        aria-labelledby="supplier-direct-channels-title"
        className="rounded-3xl border border-border bg-surface p-6 sm:p-7"
      >
        <h2
          id="supplier-direct-channels-title"
          className="text-xl font-bold text-foreground"
        >
          Canales directos
        </h2>
        <div className="mt-5 grid gap-3">
          <DirectChannel
            icon={Phone}
            label="Teléfono"
            value={site.contact.phone ?? "Pendiente de configuración"}
            href={phoneHref}
          />
          <DirectChannel
            icon={Mail}
            label="Correo"
            value={site.contact.email ?? "Pendiente de configuración"}
            href={emailHref}
          />
        </div>
      </section>

      <section
        aria-labelledby="supplier-social-title"
        className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-7"
      >
        <h2
          id="supplier-social-title"
          className="text-xl font-bold text-card-foreground"
        >
          Redes sociales
        </h2>
        <div className="mt-5 grid gap-3">
          {SOCIAL_NETWORKS.filter(({ key }) =>
            site.socialNetworks.includes(key)
          ).map(({ key, label, surfaceClass }) => {
            const href = site.socialLinks[key];
            const content = (
              <>
                <SocialIcon network={key} />
                <span className="font-semibold">{label}</span>
                <span className="ml-auto text-xs text-white/80">
                  {href ? "Visitar perfil" : "Pendiente"}
                </span>
              </>
            );

            return href ? (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visitar ${label} de ${site.name}`}
                className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 text-sm shadow-sm transition-[filter,transform] hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-white motion-reduce:transform-none ${surfaceClass}`}
              >
                {content}
              </a>
            ) : (
              <div
                key={key}
                aria-disabled="true"
                className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 text-sm opacity-60 saturate-50 ${surfaceClass}`}
              >
                {content}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
