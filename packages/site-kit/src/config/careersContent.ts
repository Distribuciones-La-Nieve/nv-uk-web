export const DEMO_JOBS = [
  {
    id: "commercial-demo",
    title: "Asesor/a comercial",
    area: "commercial",
    department: "Comercial",
    city: "Bogotá D.C.",
    workMode: "Presencial",
    experience: "1 a 2 años",
    salary: "A convenir",
    schedule: "Tiempo completo",
    contract: "Término indefinido",
    published: "Publicada hoy",
    summary:
      "Perfil orientado a la atención de clientes, el seguimiento de pedidos y el desarrollo de relaciones comerciales.",
    description: [
      "Acompañar a los clientes asignados, identificar oportunidades comerciales y brindar una atención clara durante todo el proceso de venta.",
      "Realizar seguimiento a pedidos y novedades, manteniendo actualizada la información necesaria para una experiencia de servicio consistente.",
    ],
    responsibilities: [
      "Visitar y acompañar clientes de la zona asignada.",
      "Realizar seguimiento comercial a pedidos y novedades.",
      "Cumplir los protocolos de atención y servicio.",
    ],
    requirements: [
      "Experiencia demostrable en ventas o servicio al cliente.",
      "Comunicación efectiva y orientación al cumplimiento.",
      "Disponibilidad para trabajo presencial y desplazamientos locales.",
    ],
  },
  {
    id: "logistics-demo",
    title: "Auxiliar de logística",
    area: "logistics",
    department: "Logística y distribución",
    city: "Cundinamarca",
    workMode: "Presencial",
    experience: "Sin experiencia",
    salary: "$1.600.000 mensual",
    schedule: "Tiempo completo",
    contract: "Término fijo",
    published: "Publicada ayer",
    summary:
      "Perfil de apoyo a la recepción de mercancía, la organización de inventarios y la preparación de despachos.",
    description: [
      "Apoyar la operación del centro de distribución en actividades de recepción, ubicación, alistamiento y despacho de mercancía.",
      "Contribuir al orden de las áreas de almacenamiento y al cumplimiento de los controles definidos para inventario y despacho.",
    ],
    responsibilities: [
      "Recibir, verificar y ubicar mercancía.",
      "Preparar pedidos conforme a las instrucciones de despacho.",
      "Reportar diferencias o novedades de inventario.",
    ],
    requirements: [
      "Bachiller académico.",
      "Disposición para labores operativas y trabajo en equipo.",
      "Disponibilidad para turnos de operación.",
    ],
  },
  {
    id: "administrative-demo",
    title: "Asistente administrativo/a",
    area: "administrative",
    department: "Administrativa",
    city: "Bogotá D.C.",
    workMode: "Híbrido",
    experience: "1 a 2 años",
    salary: "$1.900.000 mensual",
    schedule: "Tiempo completo",
    contract: "Obra o labor",
    published: "Publicada hace 3 días",
    summary:
      "Perfil enfocado en la gestión documental, el registro de información y el apoyo a los equipos internos.",
    description: [
      "Apoyar las actividades administrativas del área mediante el registro oportuno de información y la organización de documentos físicos y digitales.",
      "Atender requerimientos internos y facilitar la coordinación de tareas de seguimiento con otras áreas de la compañía.",
    ],
    responsibilities: [
      "Organizar y actualizar documentación del área.",
      "Preparar reportes y hacer seguimiento a solicitudes internas.",
      "Apoyar la coordinación de reuniones y actividades administrativas.",
    ],
    requirements: [
      "Formación técnica o tecnológica en áreas administrativas.",
      "Manejo básico o intermedio de herramientas ofimáticas.",
      "Organización, atención al detalle y comunicación clara.",
    ],
  },
] as const;

export type CareerJob = (typeof DEMO_JOBS)[number];

export const CAREER_AREA_LABELS: Record<CareerJob["area"], string> = {
  commercial: "Comercial",
  logistics: "Logística y distribución",
  administrative: "Administrativa",
};

export function getCareerJob(jobId: string) {
  return DEMO_JOBS.find((job) => job.id === jobId);
}
