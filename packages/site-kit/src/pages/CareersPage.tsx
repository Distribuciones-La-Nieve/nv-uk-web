"use client";

import { useDeferredValue, useRef, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  SlidersHorizontal,
  WalletCards,
  X,
} from "lucide-react";
import type { SiteConfig } from "../config/types";
import {
  CAREER_AREA_LABELS,
  DEMO_JOBS,
  type CareerJob,
} from "../config/careersContent";
import { PageIntro } from "../components/PageIntro";

const fieldClassName =
  "mt-2 min-h-12 min-w-0 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground shadow-sm transition-[border-color,box-shadow] placeholder:text-muted-foreground/75 hover:border-primary/35 focus:border-primary focus:ring-2 focus:ring-primary/20";

const actionClassName =
  "inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 py-3 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Careers route with filters, vacancy details and links to application forms.
 */
export function CareersPage({ site }: { site: SiteConfig }) {
  const [selectedJobId, setSelectedJobId] = useState<string>(DEMO_JOBS[0].id);
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [scheduleFilter, setScheduleFilter] = useState("");
  const deferredSearch = useDeferredValue(search);
  const detailRef = useRef<HTMLElement>(null);

  function selectJob(job: CareerJob) {
    setSelectedJobId(job.id);
    if (window.innerWidth < 1024) {
      requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }

  function clearFilters() {
    setSearch("");
    setAreaFilter("");
    setCityFilter("");
    setExperienceFilter("");
    setScheduleFilter("");
  }

  const normalizedSearch = normalizeSearch(deferredSearch.trim());
  const filteredJobs = DEMO_JOBS.filter((job) => {
    const matchesSearch =
      !normalizedSearch ||
      normalizeSearch(
        `${job.title} ${job.department} ${job.city} ${job.summary}`
      ).includes(normalizedSearch);
    return (
      matchesSearch &&
      (!areaFilter || job.area === areaFilter) &&
      (!cityFilter || job.city === cityFilter) &&
      (!experienceFilter || job.experience === experienceFilter) &&
      (!scheduleFilter || job.schedule === scheduleFilter)
    );
  });
  const selectedJob =
    filteredJobs.find((job) => job.id === selectedJobId) ??
    filteredJobs[0] ??
    null;
  const activeFilterCount = [
    search,
    areaFilter,
    cityFilter,
    experienceFilter,
    scheduleFilter,
  ].filter(Boolean).length;

  return (
    <>
      <PageIntro copy={site.careers} />

      <section
        aria-label="Vacantes disponibles"
        className="mx-auto max-w-[100rem] px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28"
      >
        <div className="grid items-start gap-5 lg:grid-cols-[23rem_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-lg font-bold text-card-foreground">
                <SlidersHorizontal
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
                Filtros
              </h3>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-xs font-bold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Limpiar
                </button>
              )}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <label className="text-sm font-semibold text-card-foreground">
                Buscar
                <span className="relative mt-2 block">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                    placeholder="Cargo o palabra clave"
                    className="min-h-12 w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground/75 hover:border-primary/35 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </span>
              </label>

              <label className="text-sm font-semibold text-card-foreground">
                Categoría
                <select
                  value={areaFilter}
                  onChange={(event) => setAreaFilter(event.currentTarget.value)}
                  className={fieldClassName}
                >
                  <option value="">Todas las áreas</option>
                  {Object.entries(CAREER_AREA_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold text-card-foreground">
                Lugar de trabajo
                <select
                  value={cityFilter}
                  onChange={(event) => setCityFilter(event.currentTarget.value)}
                  className={fieldClassName}
                >
                  <option value="">Todas las ciudades</option>
                  {[...new Set(DEMO_JOBS.map((job) => job.city))].map(
                    (city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="text-sm font-semibold text-card-foreground">
                Experiencia
                <select
                  value={experienceFilter}
                  onChange={(event) =>
                    setExperienceFilter(event.currentTarget.value)
                  }
                  className={fieldClassName}
                >
                  <option value="">Cualquier experiencia</option>
                  {[...new Set(DEMO_JOBS.map((job) => job.experience))].map(
                    (experience) => (
                      <option key={experience} value={experience}>
                        {experience}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="text-sm font-semibold text-card-foreground">
                Jornada
                <select
                  value={scheduleFilter}
                  onChange={(event) =>
                    setScheduleFilter(event.currentTarget.value)
                  }
                  className={fieldClassName}
                >
                  <option value="">Todas las jornadas</option>
                  {[...new Set(DEMO_JOBS.map((job) => job.schedule))].map(
                    (schedule) => (
                      <option key={schedule} value={schedule}>
                        {schedule}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>
          </aside>

          <section
            aria-labelledby="job-results-title"
            tabIndex={0}
            data-lenis-prevent
            className="min-w-0 rounded-3xl border border-border bg-surface p-3 sm:p-4 lg:h-[calc(100vh-8rem)] lg:min-h-[32rem] lg:max-h-[48rem] lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-gutter:stable]"
          >
            <div className="flex items-center justify-between gap-3 px-2 pb-4 pt-1">
              <h3
                id="job-results-title"
                className="text-xl font-bold text-foreground"
              >
                {filteredJobs.length}{" "}
                {filteredJobs.length === 1 ? "vacante" : "vacantes"}
              </h3>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {activeFilterCount}{" "}
                  {activeFilterCount === 1 ? "filtro" : "filtros"}
                </span>
              )}
            </div>

            {filteredJobs.length > 0 ? (
              <ul className="space-y-3">
                {filteredJobs.map((job) => {
                  const isSelected = selectedJob?.id === job.id;
                  return (
                    <li key={job.id}>
                      <button
                        type="button"
                        onClick={() => selectJob(job)}
                        aria-pressed={isSelected}
                        className={
                          "w-full rounded-2xl border p-5 text-left transition-[border-color,background-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none " +
                          (isSelected
                            ? "border-primary bg-card shadow-card"
                            : "border-border bg-card/80 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm")
                        }
                      >
                        <h4 className="text-lg font-bold text-card-foreground">
                          {job.title}
                        </h4>
                        <p className="mt-1 text-sm font-semibold text-primary">
                          {job.department}
                        </p>
                        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin
                            className="h-4 w-4 shrink-0"
                            aria-hidden="true"
                          />
                          {job.city} · {job.workMode}
                        </p>
                        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <WalletCards
                            className="h-4 w-4 shrink-0"
                            aria-hidden="true"
                          />
                          {job.salary}
                        </p>
                        <p className="mt-4 text-xs font-medium text-muted-foreground">
                          {job.published}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <Search
                  className="mx-auto h-7 w-7 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="mt-4 font-bold text-card-foreground">
                  No encontramos vacantes
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Prueba con otros criterios o limpia los filtros aplicados.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 min-h-11 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </section>

          <article
            ref={detailRef}
            aria-live="polite"
            aria-label="Detalle de la vacante seleccionada"
            tabIndex={0}
            data-lenis-prevent
            className="min-w-0 scroll-mt-28 rounded-3xl border border-border bg-card shadow-card lg:h-[calc(100vh-8rem)] lg:min-h-[32rem] lg:max-h-[48rem] lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-gutter:stable]"
          >
            {selectedJob ? (
              <>
                <header className="border-b border-border p-6 sm:p-8">
                  <h3 className="text-2xl font-black tracking-tight text-card-foreground sm:text-3xl">
                    {selectedJob.title}
                  </h3>
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Building2
                      className="h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
                    {site.legalName} · {selectedJob.department}
                  </p>

                  <Link
                    href={`/trabaja-con-nosotros/${selectedJob.id}/postulacion`}
                    className={actionClassName + " mt-6 w-full sm:w-auto"}
                  >
                    Postularme
                  </Link>
                </header>

                <div className="p-6 sm:p-8">
                  <h4 className="text-lg font-bold text-card-foreground">
                    Resumen
                  </h4>
                  <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                    {[
                      {
                        icon: WalletCards,
                        label: "Salario",
                        value: selectedJob.salary,
                      },
                      {
                        icon: BriefcaseBusiness,
                        label: "Contrato",
                        value: selectedJob.contract,
                      },
                      {
                        icon: Clock3,
                        label: "Jornada",
                        value: selectedJob.schedule,
                      },
                      {
                        icon: MapPin,
                        label: "Modalidad",
                        value: selectedJob.workMode,
                      },
                      {
                        icon: CalendarDays,
                        label: "Experiencia",
                        value: selectedJob.experience,
                      },
                      {
                        icon: Building2,
                        label: "Ubicación",
                        value: selectedJob.city,
                      },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                            {label}
                          </dt>
                          <dd className="mt-1 text-sm font-semibold text-card-foreground">
                            {value}
                          </dd>
                        </div>
                      </div>
                    ))}
                  </dl>

                  <section className="mt-8 border-t border-border pt-7">
                    <h4 className="text-lg font-bold text-card-foreground">
                      Descripción de la oferta
                    </h4>
                    <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
                      {selectedJob.description.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </section>

                  <section className="mt-8">
                    <h4 className="text-lg font-bold text-card-foreground">
                      Responsabilidades
                    </h4>
                    <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {selectedJob.responsibilities.map((responsibility) => (
                        <li key={responsibility} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="mt-8">
                    <h4 className="text-lg font-bold text-card-foreground">
                      Requisitos
                    </h4>
                    <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {selectedJob.requirements.map((requirement) => (
                        <li key={requirement} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </>
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
                <BriefcaseBusiness
                  className="h-9 w-9 text-muted-foreground"
                  aria-hidden="true"
                />
                <h3 className="mt-4 text-xl font-bold text-card-foreground">
                  Selecciona una vacante
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Cuando existan resultados, el detalle completo aparecerá en
                  este espacio.
                </p>
              </div>
            )}
          </article>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-6 rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold">
              Tu talento también tiene espacio aquí
            </h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Compártenos tu experiencia para tenerte en cuenta en futuras
              oportunidades.
            </p>
          </div>
          <Link
            href="/trabaja-con-nosotros/envia-tu-curriculum"
            className={actionClassName + " w-full shrink-0 lg:w-auto"}
          >
            Danos tu currículum
          </Link>
        </div>
      </section>
    </>
  );
}
