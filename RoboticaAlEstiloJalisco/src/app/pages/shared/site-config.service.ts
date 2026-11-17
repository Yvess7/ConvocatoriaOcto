import { inject, Injectable } from '@angular/core';
import { Novedad } from '../novedades/novedades.data';
import { NovedadesService } from '../novedades/novedades.service';
import { ContadorFaseService, DatosContador, DatosFaseProgramada } from './contador-fase/contador-fase.service';
import {
  DatosDestacadoInicio,
  DestacadoInicioService,
  DestacadoProgramado,
} from './destacado-inicio.service';

export interface SiteConfig {
  fases?: DatosFaseProgramada[];
  contador?: DatosContador;
  destacadoInicio?: DatosDestacadoInicio;
  destacadosInicio?: DestacadoProgramado[];
  novedadesDeEjemplo?: boolean;
  novedades?: Novedad[];
}

@Injectable({
  providedIn: 'root',
})
export class SiteConfigService {
  private readonly contadorService = inject(ContadorFaseService);
  private readonly destacadoService = inject(DestacadoInicioService);
  private readonly novedadesService = inject(NovedadesService);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  /**
   * Carga /config.json al iniciar la aplicación sin bloquear el arranque si no existe o falla.
   */
  async cargar(): Promise<void> {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') {
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
      const respuesta = await fetch(`/config.json?v=${Date.now()}`, {
        cache: 'no-store',
        signal: controller.signal,
      });

      if (!respuesta.ok) {
        return;
      }

      const config = (await respuesta.json()) as SiteConfig;
      this.aplicarConfiguracion(config);
    } catch {
      // Mantiene los valores integrados por defecto si /config.json no está disponible.
    } finally {
      clearTimeout(timeoutId);
      this.iniciarReevaluacionPeriodica();
    }
  }

  private aplicarConfiguracion(config: SiteConfig): void {
    if (Array.isArray(config.fases) && config.fases.length > 0) {
      this.contadorService.configurarFases(config.fases);
    } else if (config.contador) {
      this.contadorService.configurarDesdeApi(config.contador);
    }

    if (config.destacadosInicio || config.destacadoInicio) {
      this.destacadoService.configurarProgramados(config.destacadosInicio, config.destacadoInicio);
    }

    if (config.novedades || config.novedadesDeEjemplo !== undefined) {
      this.novedadesService.configurarDesdeConfig(config.novedades, config.novedadesDeEjemplo);
    }
  }

  private iniciarReevaluacionPeriodica(): void {
    if (typeof window === 'undefined' || this.intervalId) return;

    this.intervalId = setInterval(() => {
      const ahora = Date.now();
      this.contadorService.evaluarFaseVigente(ahora);
      this.destacadoService.evaluarVigencia(ahora);
      this.novedadesService.refrescarVigencia(ahora);
    }, 60_000);
  }
}

