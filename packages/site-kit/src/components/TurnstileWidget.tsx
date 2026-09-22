"use client";

import { useEffect, useRef, useState } from "react";

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback?: (token: string) => void;
      action?: string;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type TurnstileWidgetProps = {
  /** Increment this value after a submission to obtain a fresh token. */
  resetSignal?: number;
  action: "careers" | "suppliers" | "pqrs";
};

/**
 * Explicit Cloudflare Turnstile widget shared by the three public forms.
 * The site key is public by design; the secret is checked server-side.
 */
export function TurnstileWidget({
  action,
  resetSignal = 0,
}: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const [widgetError, setWidgetError] = useState(false);

  useEffect(() => {
    if (!siteKey) return;

    let disposed = false;
    const renderWidget = () => {
      if (
        disposed ||
        !window.turnstile ||
        !containerRef.current ||
        widgetIdRef.current
      ) {
        return;
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action,
        callback: (nextToken) => {
          setToken(nextToken);
          setWidgetError(false);
        },
        "expired-callback": () => setToken(""),
        "error-callback": () => {
          setToken("");
          setWidgetError(true);
        },
      });
    };

    if (window.turnstile) renderWidget();

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${TURNSTILE_SCRIPT_SRC}"]`
    );
    const script = existingScript ?? document.createElement("script");
    const onLoad = () => renderWidget();
    const onError = () => setWidgetError(true);

    if (!window.turnstile) {
      script.addEventListener("load", onLoad);
      script.addEventListener("error", onError);
      if (!existingScript) {
        script.src = TURNSTILE_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }

    return () => {
      disposed = true;
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [action, siteKey]);

  useEffect(() => {
    if (!resetSignal || !widgetIdRef.current || !window.turnstile) return;
    setToken("");
    setWidgetError(false);
    window.turnstile.reset(widgetIdRef.current);
  }, [resetSignal]);

  if (!siteKey) return null;

  return (
    <div className="mt-6" aria-label="Verificación de seguridad">
      <div ref={containerRef} />
      <input type="hidden" name="turnstileToken" value={token} readOnly />
      {widgetError ? (
        <p className="mt-2 text-xs font-semibold text-destructive" role="alert">
          No fue posible cargar la verificación. Recarga la página e inténtalo
          de nuevo.
        </p>
      ) : null}
    </div>
  );
}
