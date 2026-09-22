import {
  CareerApplicationPage,
  createNoIndexPageMetadata,
} from "@corporativo/site-kit";
import { siteConfig } from "@/site.config";

export const metadata = createNoIndexPageMetadata(siteConfig, {
  title: "Danos tu currículum",
  description: "Formulario para compartir tu perfil laboral con Unimarka.",
  href: "/trabaja-con-nosotros/envia-tu-curriculum",
});

export default function Page() {
  return <CareerApplicationPage site={siteConfig} />;
}
