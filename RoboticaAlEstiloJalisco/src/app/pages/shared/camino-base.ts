import {
  afterNextRender,
  computed,
  Directive,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { HalftoneTransitionService } from './halftone-transition.service';
import { TramoRuta } from './ruta-torneo';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Fondo que ocupa el contenido propio de una etapa (para enlazar las ondas con la etapa siguiente). */
export interface FondoDetalle {
  inicio: string;
  fin: string;
}

export type Acento = 'sky' | 'purple';

/** Clases por acento (literales completos para que Tailwind las detecte). */
const ACENTOS: Record<Acento, { etiqueta: string; trazo: string; barra: string; figuraA: string; figuraB: string; puntos: string }> = {
  sky: {
    etiqueta: 'bg-sky-600',
    trazo: 'stroke-sky-600',
    barra: 'bg-sky-600',
    figuraA: 'bg-sky-200/60',
    figuraB: 'bg-sky-300/50',
    puntos: 'text-sky-300/60',
  },
  purple: {
    etiqueta: 'bg-purple-600',
    trazo: 'stroke-purple-600',
    barra: 'bg-purple-600',
    figuraA: 'bg-purple-200/60',
    figuraB: 'bg-purple-300/50',
    puntos: 'text-purple-300/60',
  },
};

const ICONOS = ['megafono', 'dialogo', 'cuaderno', 'escuela', 'credencial', 'banderines', 'trofeo'];
const RUTA_IMG = '/images/camino/';
const FRAMES = 20;
const FPS = 14;
const GAP = 218;
const TOP = 110;
const ENCABEZADO = 84;
const BLANCO: FondoDetalle = { inicio: '#ffffff', fin: '#ffffff' };

interface EstadoSprite {
  raf?: number;
  lock?: boolean;
  playing?: boolean;
}

/** Trazo de onda único por semilla: nunca se repite el mismo `d` entre transiciones. */
function trazoOnda(semilla: number): string {
  let s = (Math.imul(semilla + 7, 2654435761) >>> 0) || 1;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0), s / 4294967296);
  const n = 3 + (semilla % 3);
  const xs = [0];
  for (let i = 1; i < n; i++) xs.push(Math.round((1440 * i) / n + (rnd() - 0.5) * (1440 / n) * 0.6));
  xs.push(1440);
  const ys = xs.map(() => Math.round(12 + rnd() * 48));
  let d = `M0,${ys[0]}`;
  for (let i = 0; i < n; i++) {
    const w = xs[i + 1] - xs[i];
    const k = 0.35 + rnd() * 0.3;
    d += ` C${Math.round(xs[i] + w * k)},${ys[i]} ${Math.round(xs[i + 1] - w * k)},${ys[i + 1]} ${xs[i + 1]},${ys[i + 1]}`;
  }
  return `${d} L1440,80 L0,80 Z`;
}

/**
 * Lógica del camino híbrido (mapa 3D + etapas encadenadas en una sola vista).
 * El HTML vive en cada página (mbot.html / octostudio.html); aquí solo el comportamiento.
 */
@Directive()
export abstract class CaminoBase {
  abstract readonly tramos: TramoRuta[];
  abstract readonly acento: Acento;
  /** Un color por etapa (se repiten si hay menos colores que etapas). */
  abstract readonly colores: string[];
  /** Etapas con contenido propio: color de fondo con el que empiezan y terminan. */
  abstract readonly fondos: Record<string, FondoDetalle>;
  abstract readonly semilla: number;

  readonly estilo = computed(() => ACENTOS[this.acento]);
  readonly etapas = computed(() => {
    const pasos = this.tramos.flatMap((t) => t.pasos);
    const colores = this.colores;
    const fondos = this.fondos;
    const base = this.semilla;
    return pasos.map((paso, i) => {
      const propio = fondos[paso.id];
      const fondo = propio ?? BLANCO;
      const anterior = i > 0 ? (fondos[pasos[i - 1].id] ?? BLANCO).fin : '#ffffff';
      return {
        paso,
        i,
        icono: ICONOS[i % ICONOS.length],
        color: colores[i % colores.length],
        propio: !!propio,
        invertida: i % 2 === 1,
        fondoInicio: fondo.inicio,
        fondoAnterior: anterior,
        ondaSuperior: trazoOnda(base + i * 2 + 1),
        ondaInferior: trazoOnda(base + i * 2 + 2),
        etiquetaNumero: String(i + 1).padStart(2, '0'),
        anterior: i > 0 ? pasos[i - 1].titulo : '',
        siguiente: i < pasos.length - 1 ? pasos[i + 1].titulo : '',
        ultima: i === pasos.length - 1,
        primera: i === 0,
      };
    });
  });

  /** Etapa visible (-1 = mapa). */
  readonly actual = signal(-1);
  readonly enCamino = signal(false);

  private readonly anfitrion = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly cortina = inject(HalftoneTransitionService);
  private readonly limpieza = inject(DestroyRef);
  private readonly seccionMapa = viewChild<ElementRef<HTMLElement>>('seccionMapa');
  private readonly flotantes = viewChild<ElementRef<HTMLElement>>('flotantes');
  private readonly ruta = viewChild<ElementRef<HTMLElement>>('ruta');
  private readonly personaje = viewChild<ElementRef<HTMLElement>>('personaje');
  private readonly trazoBase = viewChild<ElementRef<SVGPathElement>>('trazoBase');
  private readonly trazoProgreso = viewChild<ElementRef<SVGPathElement>>('trazoProgreso');
  private readonly trazoPunteado = viewChild<ElementRef<SVGPathElement>>('trazoPunteado');
  private readonly estaciones = viewChildren<ElementRef<HTMLElement>>('estacion');
  private readonly secciones = viewChildren<ElementRef<HTMLElement>>('seccion');
  private readonly bandas = viewChildren<ElementRef<HTMLElement>>('banda');
  private readonly grandes = viewChildren<ElementRef<HTMLElement>>('grande');

  private readonly estados = new WeakMap<HTMLElement, EstadoSprite>();
  private readonly reducido =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  private longitudes: number[] = [];
  private total = 0;
  private pos = 0;
  private meta = 0;
  private ultimoX = 0;
  private ocupado = false;
  private raf = 0;
  private ultimoT = 0;
  private moviendo = false;

  constructor() {
    afterNextRender(() => {
      const flotantes = this.flotantes()?.nativeElement;
      if (flotantes) document.body.appendChild(flotantes);
      this.distribuir();
      const onScroll = () => this.alDesplazar();
      const onResize = () => this.distribuir();
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', onResize);
      this.observarEntrada();
      this.ultimoT = performance.now();
      this.raf = requestAnimationFrame((t) => this.tick(t));
      this.alDesplazar();
      document.fonts?.ready.then(() => {
        this.distribuir();
        this.alDesplazar();
      });
      this.limpieza.onDestroy(() => {
        flotantes?.remove();
        removeEventListener('scroll', onScroll);
        removeEventListener('resize', onResize);
        cancelAnimationFrame(this.raf);
        this.io?.disconnect();
      });
      // Precarga de las hojas del efecto de clic
      setTimeout(() => this.etapas().forEach((e) => (new Image().src = `${RUTA_IMG}${e.icono}_click.webp`)), 1200);
    });
  }

  /* ---------- sprites ---------- */
  private fotograma(el: HTMLElement, f: number): void {
    el.style.backgroundPosition = `${(f % 5) * 25}% ${Math.floor(f / 5) * 33.3333}%`;
  }

  private reproducir(el: HTMLElement, hoja: 'hover' | 'click', fin?: () => void, o: { fps?: number; mantener?: boolean } = {}): boolean {
    const st = this.estados.get(el) ?? {};
    this.estados.set(el, st);
    if (st.lock) return false;
    if (st.raf) cancelAnimationFrame(st.raf);
    if (this.reducido) {
      fin?.();
      return true;
    }
    const k = el.dataset['k'];
    el.style.backgroundImage = `url(${RUTA_IMG}${k}_${hoja}.webp)`;
    st.playing = true;
    if (hoja === 'click') st.lock = true;
    const t0 = performance.now();
    const fps = o.fps ?? FPS;
    const paso = (now: number) => {
      const f = Math.floor(((now - t0) / 1000) * fps);
      if (f >= FRAMES) {
        st.playing = false;
        st.lock = false;
        if (!o.mantener) {
          el.style.backgroundImage = `url(${RUTA_IMG}${k}_hover.webp)`;
          this.fotograma(el, 0);
        }
        fin?.();
        return;
      }
      this.fotograma(el, f);
      st.raf = requestAnimationFrame(paso);
    };
    paso(t0);
    return true;
  }

  private spriteDe(el: HTMLElement): HTMLElement | null {
    return el.querySelector<HTMLElement>('[data-spr]');
  }

  /** Efecto de hover del icono (puntero, foco de teclado). */
  hover(contenedor: HTMLElement, evento?: Event): void {
    if (evento instanceof PointerEvent && evento.pointerType === 'touch') return;
    if (evento instanceof FocusEvent && !contenedor.matches(':focus-visible')) return;
    const spr = this.spriteDe(contenedor);
    if (spr && !this.estados.get(spr)?.playing) this.reproducir(spr, 'hover');
  }

  clicIconoGrande(contenedor: HTMLElement): void {
    const spr = this.spriteDe(contenedor);
    if (spr) this.reproducir(spr, 'click');
  }

  /* ---------- mapa ---------- */
  private distribuir(): void {
    const ruta = this.ruta()?.nativeElement;
    const base = this.trazoBase()?.nativeElement;
    const prog = this.trazoProgreso()?.nativeElement;
    const punt = this.trazoPunteado()?.nativeElement;
    const est = this.estaciones();
    if (!ruta || !base || !prog || !punt || !est.length) return;
    const n = est.length;
    const W = ruta.clientWidth;
    const pts = est.map((_, i): [number, number] => [(0.5 + 0.2 * Math.sin(i - 1)) * W, TOP + i * GAP]);
    ruta.style.height = `${TOP + (n - 1) * GAP + 90}px`;
    est.forEach((b, i) => {
      b.nativeElement.style.left = `${pts[i][0]}px`;
      b.nativeElement.style.top = `${pts[i][1]}px`;
      b.nativeElement.dataset['lado'] = pts[i][0] < W / 2 ? 'r' : 'l';
    });
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < n - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const h = GAP * 0.55;
      d += ` C${x0},${y0 + h} ${x1},${y1 - h} ${x1},${y1}`;
    }
    [base, prog, punt].forEach((p) => p.setAttribute('d', d));
    this.total = base.getTotalLength();
    this.longitudes = [];
    let s = 0;
    pts.forEach(([x, y]) => {
      let mejor = s;
      let dm = 1e9;
      for (let l = s; l <= Math.min(this.total, s + GAP * 2.2); l += 2) {
        const p = base.getPointAtLength(l);
        const q = (p.x - x) ** 2 + (p.y - y) ** 2;
        if (q < dm) {
          dm = q;
          mejor = l;
        }
      }
      this.longitudes.push(mejor);
      s = mejor;
    });
    prog.style.strokeDasharray = `${this.total}`;
    this.colocar();
    ScrollTrigger.refresh();
  }

  private colocar(): void {
    const base = this.trazoBase()?.nativeElement;
    const prog = this.trazoProgreso()?.nativeElement;
    const pj = this.personaje()?.nativeElement;
    if (!base || !prog || !pj || this.longitudes.length < 2) return;
    const n = this.longitudes.length;
    const i = Math.min(n - 2, Math.floor(this.pos));
    const fr = this.pos - i;
    const L = this.longitudes[i] + (this.longitudes[i + 1] - this.longitudes[i]) * fr;
    const p = base.getPointAtLength(L);
    const mueve = Math.abs(this.meta - this.pos) > 0.002;
    const salto = mueve ? Math.floor(((this.pos * 2) % 1) * FRAMES) % FRAMES : 0;
    pj.style.left = `${Math.max(62, p.x - 74)}px`;
    pj.style.top = `${p.y + 58}px`;
    if (Math.abs(p.x - this.ultimoX) > 0.3) pj.style.transform = `scaleX(${p.x < this.ultimoX ? -1 : 1})`;
    this.ultimoX = p.x;
    this.fotograma(pj, salto);
    prog.style.strokeDashoffset = `${this.total - L}`;
    this.estaciones().forEach((b, k) => b.nativeElement.toggleAttribute('data-hecha', k <= this.pos + 0.01));
  }

  private tick(ahora: number): void {
    const dt = Math.min(0.05, (ahora - this.ultimoT) / 1000);
    this.ultimoT = ahora;
    if (Math.abs(this.meta - this.pos) > 0.002) {
      const sp = Math.max(1.6, Math.abs(this.meta - this.pos) * 2.2) * dt;
      this.pos = this.reducido ? this.meta : this.pos + Math.sign(this.meta - this.pos) * Math.min(sp, Math.abs(this.meta - this.pos));
      this.colocar();
    } else if (this.moviendo) {
      this.colocar();
    }
    this.moviendo = Math.abs(this.meta - this.pos) > 0.002;
    this.raf = requestAnimationFrame((t) => this.tick(t));
  }

  /* ---------- scroll: etapa actual, riel y personaje ---------- */
  private alDesplazar(): void {
    const mapa = this.seccionMapa()?.nativeElement;
    if (!mapa) return;
    const mid = innerHeight * 0.5;
    const rm = mapa.getBoundingClientRect();
    const rh = this.anfitrion.nativeElement.getBoundingClientRect();
    this.enCamino.set(rm.top < mid && rh.bottom > mid);
    let etapa = -1;
    if (rm.bottom <= mid) {
      this.secciones().forEach((s, i) => {
        if (s.nativeElement.getBoundingClientRect().top <= mid) etapa = i;
      });
    }
    if (etapa !== this.actual()) this.actual.set(etapa);
    if (etapa >= 0) {
      this.meta = this.etapas().length - 1;
      return;
    }
    let mejor = 0;
    let dm = 1e9;
    this.estaciones().forEach((b, i) => {
      const r = b.nativeElement.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < dm) {
        dm = d;
        mejor = i;
      }
    });
    if (rm.top > -20 && scrollY < 20) mejor = 0;
    this.meta = mejor;
  }

  /* ---------- entrada animada, por orden, al llegar a cada etapa ---------- */
  private io?: IntersectionObserver;
  private observarEntrada(): void {
    this.io = new IntersectionObserver(
      (es) =>
        es.forEach((en) => {
          if (!en.isIntersecting) return;
          const banda = en.target as HTMLElement;
          const el = banda.closest('section') as HTMLElement;
          if (!el || el.dataset['in']) return;
          el.dataset['in'] = 'true';
          const i = Number(el.dataset['i']);
          const spr = this.grandes()[i] && this.spriteDe(this.grandes()[i].nativeElement);
          if (spr && !spr.dataset['espera']) setTimeout(() => this.reproducir(spr, 'hover'), 350);
          this.io?.unobserve(banda);
        }),
      { threshold: 0.3 },
    );
    this.bandas().forEach((b) => this.io?.observe(b.nativeElement));
  }

  /* ---------- navegación ---------- */
  private yDe(i: number): number {
    const el = i < 0 ? this.seccionMapa()?.nativeElement : this.bandas()[i]?.nativeElement;
    return el ? Math.max(0, el.getBoundingClientRect().top + scrollY - ENCABEZADO) : 0;
  }

  private irInstantaneo(i: number): void {
    scrollTo({ top: this.yDe(i), behavior: 'instant' });
    ScrollTrigger.refresh();
    ScrollTrigger.update();
  }

  irSuave(i: number): void {
    if (i < 0 || i >= this.etapas().length) return;
    scrollTo({ top: this.yDe(i), behavior: this.reducido ? 'instant' : 'smooth' });
  }

  private colorDe(i: number): string {
    return i < 0 ? '#f6842b' : this.etapas()[i].color;
  }

  /** Salto con cortina de semitono entre el mapa y cualquier etapa, dentro de la misma vista. */
  saltar(i: number, origen?: HTMLElement): void {
    if (this.ocupado || this.cortina.isBusy) return;
    if (this.reducido) {
      this.irInstantaneo(i);
      return;
    }
    this.ocupado = true;
    const r = origen?.getBoundingClientRect();
    const sec = i >= 0 ? this.secciones()[i]?.nativeElement : null;
    this.cortina.run(
      r ? r.left + r.width / 2 : innerWidth / 2,
      r ? r.top + r.height / 2 : innerHeight / 2,
      this.colorDe(i),
      () => {
        if (sec) {
          sec.dataset['snap'] = 'true';
          sec.dataset['in'] = 'true';
        }
        this.irInstantaneo(i);
        this.alDesplazar();
      },
      () => {
        this.ocupado = false;
        if (sec) delete sec.dataset['snap'];
      },
    );
  }

  /** El icono de la estación hace su efecto, despega del mapa y vuela hasta su etapa. */
  activar(i: number): void {
    if (this.ocupado || this.cortina.isBusy) return;
    const estacion = this.estaciones()[i].nativeElement;
    const spr = this.spriteDe(estacion)!;
    const e = this.etapas()[i];
    const sec = this.secciones()[i].nativeElement;
    const grande = this.spriteDe(this.grandes()[i].nativeElement)!;
    this.meta = i;
    if (this.reducido) {
      this.irInstantaneo(i);
      return;
    }
    this.ocupado = true;
    const r = spr.getBoundingClientRect();
    const fly = document.createElement('div');
    fly.dataset['k'] = e.icono;
    fly.setAttribute('aria-hidden', 'true');
    fly.className = 'fixed bg-no-repeat pointer-events-none drop-shadow-2xl';
    fly.style.cssText += `;z-index:10000;background-size:500% 400%;background-image:url(${RUTA_IMG}${e.icono}_hover.webp)`;
    this.fotograma(fly, 0);
    const poner = (x: number, y: number, z: number) => {
      fly.style.left = `${x}px`;
      fly.style.top = `${y}px`;
      fly.style.width = fly.style.height = `${z}px`;
      fly.style.margin = `${-z / 2}px 0 0 ${-z / 2}px`;
    };
    const x0 = r.left + r.width / 2;
    const y0 = r.top + r.height / 2;
    const s0 = r.width;
    poner(x0, y0, s0);
    document.body.appendChild(fly);
    spr.style.visibility = 'hidden';
    const suavizar = (t: number) => t * t * (3 - 2 * t);

    this.reproducir(
      fly,
      'click',
      () => {
        let x1 = innerWidth / 2;
        let y1 = Math.min(230, innerHeight * 0.3);
        let s1 = 380;
        let real: [number, number, number] | null = null;
        const D = 1200;
        const t0 = performance.now();
        const cx = (x0 + x1) / 2 + (x0 < innerWidth / 2 ? -1 : 1) * Math.min(260, innerWidth * 0.3);
        const cy = Math.min(y0, y1) - 110;
        this.cortina.run(
          x0,
          y0,
          e.color,
          () => {
            sec.dataset['snap'] = 'true';
            sec.dataset['in'] = 'true';
            grande.dataset['espera'] = 'true';
            this.irInstantaneo(i);
            this.alDesplazar();
            grande.style.visibility = 'hidden';
            const b = grande.getBoundingClientRect();
            real = [b.left + b.width / 2, b.top + b.height / 2, b.width];
          },
          undefined,
          { t1: 470, t2: 560 },
        );
        const paso = (now: number) => {
          const t = Math.min(1, (now - t0) / D);
          const ez = suavizar(t);
          const u = 1 - ez;
          if (real) {
            x1 += (real[0] - x1) * 0.2;
            y1 += (real[1] - y1) * 0.2;
            s1 += (real[2] - s1) * 0.2;
          }
          poner(u * u * x0 + 2 * u * ez * cx + ez * ez * x1, u * u * y0 + 2 * u * ez * cy + ez * ez * y1, s0 + (s1 - s0) * ez);
          this.fotograma(fly, Math.min(FRAMES - 1, Math.floor(t * FRAMES)));
          if (t < 1) {
            requestAnimationFrame(paso);
            return;
          }
          grande.style.visibility = '';
          delete grande.dataset['espera'];
          grande.style.backgroundImage = `url(${RUTA_IMG}${e.icono}_hover.webp)`;
          this.fotograma(grande, 0);
          fly.remove();
          spr.style.visibility = '';
          delete sec.dataset['snap'];
          this.ocupado = false;
        };
        requestAnimationFrame(paso);
      },
      { fps: 16, mantener: true },
    );
  }

  imagenIcono(k: string): string {
    return `url(${RUTA_IMG}${k}.png)`;
  }

  imagenHoja(k: string): string {
    return `url(${RUTA_IMG}${k}_hover.webp)`;
  }
}
