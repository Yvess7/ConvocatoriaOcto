import { signal } from '@angular/core';

/** Paso individual del mapa (fase previa o etapa del torneo). */
export interface PasoRuta {
  id: string;
  etiqueta: string;
  titulo: string;
  resumen: string;
  /** Texto que se muestra al voltear la tarjeta. Editar aquí cuando se confirmen las fechas. */
  fecha: string;
  /** Página del sitio a la que lleva el enlace de la tarjeta. */
  ruta: string;
  /** Sección (id) dentro de esa página. */
  fragmento: string;
  /** Texto del enlace en la cara posterior de la tarjeta. */
  enlace: string;
  meta?: boolean;
}

/** Tramo del mapa: agrupa varios pasos bajo un mismo encabezado. */
export interface TramoRuta {
  id: string;
  insignia: string;
  titulo: string;
  subtitulo: string;
  pasos: PasoRuta[];
}

/** Lógica compartida por las páginas de mBot y OctoStudio. */
export abstract class RutaTorneoBase {
  abstract readonly tramos: TramoRuta[];

  private readonly volteadas = signal<ReadonlySet<string>>(new Set());
  private pasosCache?: PasoRuta[];

  get pasos(): PasoRuta[] {
    return (this.pasosCache ??= this.tramos.flatMap((tramo) => tramo.pasos));
  }

  esIzquierda(id: string): boolean {
    return this.pasos.findIndex((paso) => paso.id === id) % 2 === 0;
  }

  esVolteada(id: string): boolean {
    return this.volteadas().has(id);
  }

  alternar(id: string): void {
    this.volteadas.update((previas) => {
      const siguientes = new Set(previas);
      if (siguientes.has(id)) {
        siguientes.delete(id);
      } else {
        siguientes.add(id);
      }
      return siguientes;
    });
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
