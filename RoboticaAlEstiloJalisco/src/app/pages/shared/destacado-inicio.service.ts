import { Injectable, signal } from '@angular/core';
import { estaVigente } from './fecha-vigencia';

export type VarianteAccionDestacado = 'rojo' | 'naranja' | 'blanco';

export interface AccionDestacadoInicio {
  etiqueta: string;
  ruta: string;
  fragmento?: string;
  externo?: boolean;
  variante?: VarianteAccionDestacado;
}

export interface DatosDestacadoInicio {
  etiqueta?: string;
  titulo?: string;
  descripcion?: string;
  destaque?: string;
  imagen?: string;
  imagenAlt?: string;
  acciones?: AccionDestacadoInicio[];
}

export interface DestacadoProgramado extends DatosDestacadoInicio {
  id?: string;
  publicarDesde?: string;
  bajaEn?: string;
  visible?: boolean;
}

const DESTACADO_POR_DEFECTO: Required<DatosDestacadoInicio> = {
  etiqueta: 'Convocatoria 2026',
  titulo: 'Convocatoria Oficial',
  descripcion:
    'Participa en el encuentro estatal de robótica y programación creativa dirigido a estudiantes de primaria y secundaria de Jalisco. Consulta las bases de esta edición y elige tu categoría para comenzar el camino hacia la Gran Final.',
  destaque:
    'Dos modalidades diseñadas para impulsar la creatividad digital, la robótica móvil autónoma y el trabajo en equipo.',
  imagen: '/images/torneos.webp',
  imagenAlt: 'Vista previa de la Convocatoria Robótica al Estilo Jalisco',
  acciones: [
    {
      etiqueta: 'mBot',
      ruta: '/mbot',
      variante: 'rojo',
    },
    {
      etiqueta: 'OctoStudio',
      ruta: '/octostudio',
      variante: 'naranja',
    },
  ],
};

@Injectable({
  providedIn: 'root',
})
export class DestacadoInicioService {
  readonly etiqueta = signal<string>(DESTACADO_POR_DEFECTO.etiqueta);
  readonly titulo = signal<string>(DESTACADO_POR_DEFECTO.titulo);
  readonly descripcion = signal<string>(DESTACADO_POR_DEFECTO.descripcion);
  readonly destaque = signal<string>(DESTACADO_POR_DEFECTO.destaque);
  readonly imagen = signal<string>(DESTACADO_POR_DEFECTO.imagen);
  readonly imagenAlt = signal<string>(DESTACADO_POR_DEFECTO.imagenAlt);
  readonly acciones = signal<AccionDestacadoInicio[]>(DESTACADO_POR_DEFECTO.acciones);

  private destacadosProgramados: DestacadoProgramado[] = [];
  private respaldoUnico?: DatosDestacadoInicio;

  /**
   * Permite actualizar dinámicamente el contenido de la primera sección
   * del inicio desde una respuesta de API o archivo config.json.
   */
  configurarDesdeApi(datos: DatosDestacadoInicio): void {
    if (datos.etiqueta !== undefined) this.etiqueta.set(datos.etiqueta);
    if (datos.titulo !== undefined) this.titulo.set(datos.titulo);
    if (datos.descripcion !== undefined) this.descripcion.set(datos.descripcion);
    if (datos.destaque !== undefined) this.destaque.set(datos.destaque);
    if (datos.imagen !== undefined) this.imagen.set(datos.imagen);
    if (datos.imagenAlt !== undefined) this.imagenAlt.set(datos.imagenAlt);
    if (datos.acciones !== undefined) this.acciones.set(datos.acciones);
  }

  /**
   * Registra bloques programados por fecha (publicarDesde / bajaEn) y un respaldo opcional.
   */
  configurarProgramados(lista?: DestacadoProgramado[], respaldo?: DatosDestacadoInicio): void {
    this.destacadosProgramados = lista ? [...lista] : [];
    this.respaldoUnico = respaldo;
    this.evaluarVigencia();
  }

  evaluarVigencia(ahoraMs = Date.now()): void {
    if (this.destacadosProgramados.length > 0) {
      const activo = this.destacadosProgramados.find((item) =>
        estaVigente(ahoraMs, item.publicarDesde, item.bajaEn, item.visible)
      );
      if (activo) {
        this.aplicarConDefecto(activo);
        return;
      }
    }

    if (this.respaldoUnico) {
      this.aplicarConDefecto(this.respaldoUnico);
    } else if (this.destacadosProgramados.length > 0) {
      this.restablecer();
    }
  }

  restablecer(): void {
    this.aplicarConDefecto(DESTACADO_POR_DEFECTO);
  }

  private aplicarConDefecto(datos: DatosDestacadoInicio): void {
    this.etiqueta.set(datos.etiqueta ?? DESTACADO_POR_DEFECTO.etiqueta);
    this.titulo.set(datos.titulo ?? DESTACADO_POR_DEFECTO.titulo);
    this.descripcion.set(datos.descripcion ?? DESTACADO_POR_DEFECTO.descripcion);
    this.destaque.set(datos.destaque ?? '');
    this.imagen.set(datos.imagen ?? '');
    this.imagenAlt.set(datos.imagenAlt ?? '');
    this.acciones.set(datos.acciones ?? DESTACADO_POR_DEFECTO.acciones);
  }
}
