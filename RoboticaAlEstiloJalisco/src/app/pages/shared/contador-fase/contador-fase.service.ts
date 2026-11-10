import { Injectable, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface DatosContador {
  fase?: string;
  inicio?: string;
  fecha?: string;
  titulo?: string;
  terminado?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContadorFaseService {
  private router = inject(Router);

  // Configuración base de la fase
  readonly fase = signal<string>('Sesión Informativa');
  readonly inicio = signal<string>('2026-11-01T00:00:00-06:00');
  readonly fecha = signal<string>('2026-12-01T09:00:00-06:00');
  readonly titulo = signal<string>('La sesión informativa inicia en:');
  readonly terminado = signal<string>('¡La sesión informativa ha comenzado!');

  // Valores calculados en tiempo real
  readonly dias = signal<string>('00');
  readonly horas = signal<string>('00');
  readonly minutos = signal<string>('00');
  readonly segundos = signal<string>('00');
  readonly etiquetaDias = signal<string>('DÍAS');
  readonly progresoOffset = signal<number>(100);
  readonly tituloActual = signal<string>('');
  readonly aviso = signal<string>('');
  readonly finalizado = signal<boolean>(false);

  // Control de visualización global y por ruta
  readonly esRutaHome = signal<boolean>(true);
  readonly mostrarDocked = signal<boolean>(false);

  private intervalId: any = null;

  constructor() {
    this.verificarRuta(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.verificarRuta(event.urlAfterRedirects || event.url);
      });

    this.actualizar();
    this.iniciarReloj();
  }

  private verificarRuta(url: string): void {
    const limpia = url.split('#')[0].split('?')[0];
    const esHome = limpia === '' || limpia === '/';
    this.esRutaHome.set(esHome);

    // En cualquier página que no sea Inicio, el contador pequeño se acopla de inmediato
    if (!esHome) {
      this.mostrarDocked.set(true);
    }
  }

  public setMostrarDockedEnHome(mostrar: boolean): void {
    if (this.esRutaHome()) {
      this.mostrarDocked.set(mostrar);
    }
  }

  /**
   * Método público para actualizar tiempos dinámicamente desde una API o WebSocket
   */
  public configurarDesdeApi(datos: DatosContador): void {
    if (datos.fase !== undefined) this.fase.set(datos.fase);
    if (datos.inicio !== undefined) this.inicio.set(datos.inicio);
    if (datos.fecha !== undefined) this.fecha.set(datos.fecha);
    if (datos.titulo !== undefined) this.titulo.set(datos.titulo);
    if (datos.terminado !== undefined) this.terminado.set(datos.terminado);

    this.actualizar();
    this.iniciarReloj();
  }

  private iniciarReloj(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    const fin = Date.parse(this.fecha());
    if (Number.isFinite(fin) && fin > Date.now()) {
      this.intervalId = setInterval(() => this.actualizar(), 1000);
    }
  }

  private actualizar(): void {
    const fin = Date.parse(this.fecha());
    const inicio = Date.parse(this.inicio());
    const ahora = Date.now();
    const valido = Number.isFinite(fin);

    if (!valido) {
      this.aviso.set('Configura una fecha válida.');
      return;
    }

    this.aviso.set('');
    const segundosRestantes = Math.max(0, Math.ceil((fin - ahora) / 1000));
    const diasNum = Math.floor(segundosRestantes / 86400);
    const pad = (n: number) => String(n).padStart(2, '0');

    this.dias.set(pad(diasNum));
    this.etiquetaDias.set(diasNum === 1 ? 'DÍA' : 'DÍAS');
    this.horas.set(pad(Math.floor((segundosRestantes % 86400) / 3600)));
    this.minutos.set(pad(Math.floor((segundosRestantes % 3600) / 60)));
    this.segundos.set(pad(segundosRestantes % 60));

    if (segundosRestantes === 0) {
      this.tituloActual.set(this.terminado());
      this.progresoOffset.set(0);
      this.finalizado.set(true);
      if (this.intervalId) clearInterval(this.intervalId);
      return;
    }

    this.finalizado.set(false);
    this.tituloActual.set(this.titulo());

    const tieneRango = Number.isFinite(inicio) && inicio < fin;
    const progreso = tieneRango
      ? Math.max(0, Math.min(1, (ahora - inicio) / (fin - inicio)))
      : 0;

    this.progresoOffset.set(Number((100 * (1 - progreso)).toFixed(2)));
  }
}

