import {
  CareerApplicationPage,
  createNoIndexPageMetadata,
  DEMO_JOBS,
  getCareerJob,
} from "@corporativo/site-kit";
import { notFound } from "next/navigation";
import { siteConfig } from "@/site.config";

type PageProps = {
  params: Promise<{ vacancyId: string }>;
};

export function generateStaticParams() {
  return DEMO_JOBS.map((job) => ({ vacancyId: job.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const { vacancyId } = await params;
  const job = getCareerJob(vacancyId);
  return createNoIndexPageMetadata(siteConfig, {
    title: job ? `Postulación a ${job.title}` : "Postulación a vacante",
    description: job
      ? `Formulario de postulación a ${job.title} en ${siteConfig.name}.`
      : `Formulario de postulación laboral en ${siteConfig.name}.`,
    href: `/trabaja-con-nosotros/${vacancyId}/postulacion`,
  });
}

export default async function Page({ params }: PageProps) {
  const { vacancyId } = await params;
  const job = getCareerJob(vacancyId);
  if (!job) notFound();

  return <CareerApplicationPage site={siteConfig} job={job} />;
}
