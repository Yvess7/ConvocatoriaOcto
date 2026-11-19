import { Injectable, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { parseFechaConfig } from '../fecha-vigencia';

export type EtapaTorneo = string;

export interface DatosContador {
  fase?: string;
  etiqueta?: string;
  mensaje?: string;
  detalle?: string;
  inicio?: string;
  fecha?: string;
  titulo?: string;
  terminado?: string;
  etiquetaEvento?: string;
  subtituloEvento?: string;
  fechaTexto?: string;
  horaTexto?: string;
  modalidad?: string;
  etapaActual?: EtapaTorneo;
}

export interface DatosFaseProgramada extends DatosContador {
  id?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContadorFaseService {
  private router = inject(Router);

  // Configuración base de la fase y contexto real del evento
  readonly etiquetaEvento = signal<string>('ETAPA ACTUAL');
  readonly fase = signal<string>('CONVOCATORIA');
  readonly mensaje = signal<string>('REVISA LA');
  readonly detalle = signal<string>('');
  readonly inicio = signal<string>('');
  readonly fecha = signal<string>('');
  readonly subtituloEvento = signal<string>('');
  readonly fechaTexto = signal<string>('');
  readonly horaTexto = signal<string>('');
  readonly modalidad = signal<string>('');
  readonly etapaActual = signal<EtapaTorneo>('');
  readonly titulo = signal<string>('');
  readonly terminado = signal<string>('');

  // Valores calculados en tiempo real
  readonly tieneContador = signal<boolean>(false);
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
  // Progreso continuo (0 a 1) con el que el reloj flotante se ensambla en tiempo real
  readonly progresoEnsamblaje = signal<number>(0);

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

    // En cualquier página que no sea Inicio, el contador pequeño se acopla al 100% de inmediato
    if (!esHome) {
      this.mostrarDocked.set(true);
      this.progresoEnsamblaje.set(1);
    }
  }

  public setMostrarDockedEnHome(mostrar: boolean): void {
    if (this.esRutaHome()) {
      this.mostrarDocked.set(mostrar);
      this.progresoEnsamblaje.set(mostrar ? 1 : 0);
    }
  }

  public setProgresoEnsamblajeEnHome(progreso: number): void {
    if (this.esRutaHome()) {
      const clamped = Math.max(0, Math.min(1, progreso));
      this.progresoEnsamblaje.set(clamped);
      this.mostrarDocked.set(clamped > 0.01);
    }
  }

  private fasesProgramadas: DatosFaseProgramada[] = [];
  private faseActivaKey: string | null = null;

  /**
   * Registra la lista completa de fases programadas desde config.json
   * y activa la que corresponde al instante actual.
   */
  public configurarFases(fases: DatosFaseProgramada[]): void {
    this.fasesProgramadas = fases.filter(
      (item) =>
        parseFechaConfig(item.fecha, 'fin') !== null ||
        Boolean(item.mensaje?.trim()) ||
        Boolean(item.fase?.trim())
    );
    this.faseActivaKey = null;
    this.evaluarFaseVigente();
  }

  /**
   * Evalúa si corresponde activar una nueva fase según la hora actual.
   * Devuelve true cuando cambió a una fase distinta.
   */
  public evaluarFaseVigente(ahoraMs = Date.now()): boolean {
    if (this.fasesProgramadas.length === 0) return false;

    const ordenadas = [...this.fasesProgramadas].sort((a, b) => {
      const aIni = parseFechaConfig(a.inicio, 'inicio') ?? parseFechaConfig(a.fecha, 'fin') ?? 0;
      const bIni = parseFechaConfig(b.inicio, 'inicio') ?? parseFechaConfig(b.fecha, 'fin') ?? 0;
      return aIni - bIni;
    });

    const activa = ordenadas.find((item) => {
      const ini = parseFechaConfig(item.inicio, 'inicio');
      const fin = parseFechaConfig(item.fecha, 'fin');
      if (fin === null) {
        return (ini === null || ahoraMs >= ini) && (Boolean(item.mensaje?.trim()) || Boolean(item.fase?.trim()));
      }
      return (ini === null || ahoraMs >= ini) && ahoraMs < fin;
    });

    const proxima = !activa
      ? ordenadas.find((item) => {
          const ini = parseFechaConfig(item.inicio, 'inicio');
          const fin = parseFechaConfig(item.fecha, 'fin');
          if (fin === null) return false;
          return ini !== null ? ahoraMs < ini : ahoraMs < fin;
        })
      : undefined;

    const elegida = activa ?? proxima ?? ordenadas[ordenadas.length - 1];
    if (!elegida) return false;

    const clave = elegida.id ?? `${elegida.inicio ?? ''}|${elegida.fecha ?? ''}|${elegida.fase ?? ''}`;
    if (clave === this.faseActivaKey) return false;

    this.faseActivaKey = clave;
    this.configurarDesdeApi(elegida);
    return true;
  }

  /**
   * Método público para actualizar tiempos dinámicamente desde una API o WebSocket
   */
  public configurarDesdeApi(datos: DatosContador): void {
    if (datos.fase !== undefined) this.fase.set(datos.fase);
    if (datos.mensaje !== undefined) this.mensaje.set(datos.mensaje);
    if (datos.detalle !== undefined) this.detalle.set(datos.detalle);
    if (datos.inicio !== undefined) this.inicio.set(datos.inicio);
    if (datos.fecha !== undefined) this.fecha.set(datos.fecha);
    if (datos.titulo !== undefined) this.titulo.set(datos.titulo);
    if (datos.terminado !== undefined) this.terminado.set(datos.terminado);
    const etiqueta = datos.etiqueta ?? datos.etiquetaEvento;
    if (etiqueta !== undefined) this.etiquetaEvento.set(etiqueta);
    if (datos.subtituloEvento !== undefined) this.subtituloEvento.set(datos.subtituloEvento);
    if (datos.fechaTexto !== undefined) this.fechaTexto.set(datos.fechaTexto);
    if (datos.horaTexto !== undefined) this.horaTexto.set(datos.horaTexto);
    if (datos.modalidad !== undefined) this.modalidad.set(datos.modalidad);
    if (datos.etapaActual !== undefined) this.etapaActual.set(datos.etapaActual);

    this.actualizar();
    this.iniciarReloj();
  }

  private iniciarReloj(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    const fechaStr = this.fecha().trim();
    if (!fechaStr) return;
    const fin = parseFechaConfig(fechaStr, 'fin') ?? Date.parse(fechaStr);
    if (Number.isFinite(fin) && fin > Date.now()) {
      this.intervalId = setInterval(() => this.actualizar(), 1000);
    }
  }

  private actualizar(): void {
    const fechaStr = this.fecha().trim();
    if (!fechaStr) {
      this.tieneContador.set(false);
      this.aviso.set('');
      this.progresoOffset.set(100);
      this.finalizado.set(false);
      return;
    }

    const fin = parseFechaConfig(fechaStr, 'fin') ?? Date.parse(fechaStr);
    const inicio = parseFechaConfig(this.inicio(), 'inicio') ?? Date.parse(this.inicio());
    const ahora = Date.now();
    const valido = Number.isFinite(fin);

    if (!valido) {
      this.tieneContador.set(false);
      this.aviso.set('Configura una fecha válida.');
      return;
    }

    this.tieneContador.set(true);
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
      if (this.fasesProgramadas.length > 0 && this.evaluarFaseVigente(ahora)) {
        return;
      }
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

