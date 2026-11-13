export type CategoriaNovedad = 'inscripciones' | 'webinars' | 'fases' | 'avisos';

export interface Novedad {
  readonly id: string;
  readonly categoria: CategoriaNovedad;
  /** Fecha de publicación en formato YYYY-MM-DD. */
  readonly fecha: string;
  readonly titulo: string;
  readonly resumen: string;
  readonly contenido: readonly string[];
  readonly imagen: string;
  readonly imagenAlt: string;
  readonly enlace: {
    readonly texto: string;
    readonly ruta: string;
    readonly fragmento?: string;
  };
}

export const categoriasNovedades: Record<CategoriaNovedad, string> = {
  inscripciones: 'Inscripciones',
  webinars: 'Webinars',
  fases: 'Fases',
  avisos: 'Avisos',
};

/**
 * Contenido ilustrativo: sustituir los anuncios y sus fechas por comunicados
 * confirmados antes de cambiar esta bandera a false.
 * Para publicar una novedad, añadir un objeto al arreglo. La página ordena
 * por fecha para mostrar primero la publicación más reciente.
 */
export const novedadesDeEjemplo = true;

export const novedades: readonly Novedad[] = [
  {
    id: 'inscripciones-abiertas',
    categoria: 'inscripciones',
    fecha: '2026-11-06',
    titulo: 'Inscripciones abiertas',
    resumen:
      'Ya puedes dar el primer paso con tu equipo y elegir entre los torneos de mBot y OctoStudio.',
    contenido: [
      'Reúne a tu equipo, elige la modalidad en la que participarán y consulta los requisitos antes de comenzar el registro.',
      'Revisa también la documentación del torneo para preparar los formatos y autorizaciones que correspondan a tu equipo.',
    ],
    imagen: '/images/torneos.webp',
    imagenAlt: 'Ilustración de los torneos de mBot y OctoStudio',
    enlace: { texto: 'Ir al registro', ruta: '/registro' },
  },
  {
    id: 'webinar-octostudio',
    categoria: 'webinars',
    fecha: '2026-11-05',
    titulo: 'Nuevo webinar de OctoStudio',
    resumen:
      'Una sesión para explorar la programación por bloques y preparar el proyecto de tu equipo.',
    contenido: [
      'El webinar está dirigido a docentes asesores y equipos que quieren conocer las posibilidades creativas de OctoStudio.',
      'La fecha, el horario y el acceso a la sesión se publicarán cuando estén confirmados. Mientras tanto, consulta la sección de webinars del sitio.',
    ],
    imagen: '/images/octo.webp',
    imagenAlt: 'Ilustración de OctoStudio y sus proyectos creativos',
    enlace: { texto: 'Consultar webinars', ruta: '/videos', fragmento: 'webinars' },
  },
  {
    id: 'cierre-fase-regional',
    categoria: 'fases',
    fecha: '2026-11-04',
    titulo: 'Cierre de la fase regional',
    resumen:
      'Terminó una etapa del torneo. Consulta la ruta de tu modalidad para conocer lo que sigue.',
    contenido: [
      'Agradecemos el trabajo de los equipos y docentes asesores durante esta etapa de Robótica al Estilo Jalisco.',
      'Consulta el mapa de tu torneo para identificar la siguiente fase. Los resultados y las indicaciones específicas se compartirán en los comunicados correspondientes.',
    ],
    imagen: '/images/mbot.webp',
    imagenAlt: 'Ilustración del torneo de robótica mBot',
    enlace: { texto: 'Consultar torneo mBot', ruta: '/mbot' },
  },
  {
    id: 'documentacion-torneo',
    categoria: 'avisos',
    fecha: '2026-11-03',
    titulo: 'Documentación del torneo',
    resumen:
      'Ten a la mano los documentos que acompañan la participación de tu equipo.',
    contenido: [
      'En la sección de documentación puedes consultar el código de conducta, el uso de imagen y el aviso de privacidad.',
      'Comparte esta información con las personas que acompañan al equipo y revisa las bases de la modalidad en la que participarán.',
    ],
    imagen: '/images/hero-banner.webp',
    imagenAlt: 'Ilustración de Robótica al Estilo Jalisco',
    enlace: { texto: 'Ver documentación', ruta: '/documentacion' },
  },
];
