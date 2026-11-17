import { computed, Injectable, signal } from '@angular/core';
import { estaVigente } from '../shared/fecha-vigencia';
import { Novedad, novedades, novedadesDeEjemplo } from './novedades.data';

@Injectable({
  providedIn: 'root',
})
export class NovedadesService {
  private readonly catalogo = signal<readonly Novedad[]>(novedades);
  private readonly ahoraMs = signal<number>(Date.now());

  readonly esContenidoDeEjemplo = signal<boolean>(novedadesDeEjemplo);

  readonly publicaciones = computed<readonly Novedad[]>(() => {
    const ahora = this.ahoraMs();
    return this.catalogo()
      .filter((item) => {
        const desde = item.publicarDesde ?? item.fecha;
        return estaVigente(ahora, desde, item.bajaEn, item.visible);
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  });

  configurarDesdeConfig(lista?: readonly Novedad[], esEjemplo?: boolean): void {
    if (Array.isArray(lista)) {
      this.catalogo.set(lista);
    }
    if (esEjemplo !== undefined) {
      this.esContenidoDeEjemplo.set(esEjemplo);
    }
    this.refrescarVigencia();
  }

  refrescarVigencia(ahoraMs = Date.now()): void {
    this.ahoraMs.set(ahoraMs);
  }
}

