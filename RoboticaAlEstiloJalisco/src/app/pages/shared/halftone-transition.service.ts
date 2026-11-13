import { Injectable, OnDestroy } from '@angular/core';

export interface HalftoneOptions {
  t1?: number;
  t2?: number;
}

const FRAGMENT_COLORS: Record<string, string> = {
  'convocatoria-mbot': '#f6842b',
  'codigo-conducta': '#f6842b',
  premios: '#f6842b',
  shorts: '#f6842b',
  webinars: '#f6842b',
  publicaciones: '#f6842b',
  'convocatoria-octostudio': '#e81a4f',
  'conducta-octostudio': '#e81a4f',
  'en-vivo': '#e81a4f',
  'uso-de-imagen': '#e81a4f',
  'aviso-de-privacidad': '#e81a4f',
  'reglamento-mbot': '#e81a4f',
  'reglamento-octostudio': '#e81a4f',
  'seccion-videos': '#e81a4f',
  galeria: '#e81a4f',
  documentacion: '#e81a4f',
  videos: '#e81a4f',
  'clasificacion-mbot': '#0284c7',
  mbot: '#0284c7',
  'clasificacion-octostudio': '#7a59eb',
  octostudio: '#7a59eb',
};

const PATH_COLORS: Record<string, string> = {
  '/mbot': '#0284c7',
  '/octostudio': '#7a59eb',
  '/documentacion': '#e81a4f',
  '/videos': '#e81a4f',
  '/registro': '#e81a4f',
  '/': '#f6842b',
  '/novedades': '#f6842b',
  '/aviso-privacidad': '#f6842b',
  '/terminos-condiciones': '#f6842b',
};

/**
 * Servicio global que reproduce la cortina de semitono radial (halftone)
 * entre cambios de página y saltos de sección en todo el sitio.
 */
@Injectable({ providedIn: 'root' })
export class HalftoneTransitionService implements OnDestroy {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private rafId: number | null = null;
  private busy = false;

  get isBusy(): boolean {
    return this.busy;
  }

  /** Resuelve el color sólido institucional correspondiente a una ruta y/o fragmento destino. */
  colorForTarget(path: string, fragment?: string | null): string {
    const cleanFrag = fragment?.replace(/^#/, '').trim();
    if (cleanFrag) {
      if (FRAGMENT_COLORS[cleanFrag]) {
        return FRAGMENT_COLORS[cleanFrag];
      }
      if (typeof document !== 'undefined') {
        const el = document.getElementById(cleanFrag);
        if (el) {
          if (el.classList.contains('bg-brand-orange')) return '#f6842b';
          if (el.classList.contains('bg-brand-red')) return '#e81a4f';
          if (el.classList.contains('bg-sky-50') || el.classList.contains('bg-[#0191c9]')) return '#0284c7';
          if (el.classList.contains('bg-purple-50') || el.classList.contains('bg-[#7a59eb]')) return '#7a59eb';
        }
      }
    }

    const cleanPath = path.length > 1 ? path.replace(/\/+$/, '') : '/';
    return PATH_COLORS[cleanPath] ?? '#f6842b';
  }

  /**
   * Ejecuta la transición de semitono radial desde (ox, oy) con el color destino.
   * En el punto medio (pantalla completamente cubierta) invoca onMid y luego revela.
   */
  run(
    ox: number,
    oy: number,
    color: string,
    onMid?: () => void | Promise<void>,
    onEnd?: () => void,
    opts: HalftoneOptions = {},
  ): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      void Promise.resolve(onMid?.()).finally(() => onEnd?.());
      return;
    }

    if (this.busy) {
      return;
    }

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      this.busy = true;
      Promise.resolve(onMid?.()).finally(() => {
        this.busy = false;
        onEnd?.();
      });
      return;
    }

    const canvas = this.ensureCanvas();
    const hx = this.ctx;
    if (!canvas || !hx) {
      void Promise.resolve(onMid?.()).finally(() => onEnd?.());
      return;
    }

    this.busy = true;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.display = 'block';
    hx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cell = Math.max(20, Math.min(34, W / 42));
    const rmax = cell * 0.54;
    const T1 = opts.t1 ?? 410;
    const T2 = opts.t2 ?? 490;
    const X = Number.isFinite(ox) ? ox : W / 2;
    const Y = Number.isFinite(oy) ? oy : H / 2;

    let phase = 0;
    let t0 = performance.now();

    const draw = (p: number, rev: boolean) => {
      hx.clearRect(0, 0, W, H);
      hx.fillStyle = color;
      const maxD = Math.hypot(Math.max(X, W - X), Math.max(Y, H - Y));
      const band = maxD * 0.6;
      const progress = rev ? 1 - Math.pow(1 - p, 1.6) : p;
      const front = progress * (maxD + band);
      hx.beginPath();
      for (let j = 0, y = -cell / 2; y < H + cell; j++, y += cell / 2) {
        for (let x = (j & 1) * (cell / 2) - cell; x < W + cell; x += cell) {
          let v = (front - Math.hypot(x - X, y - Y)) / band;
          v = v < 0 ? 0 : v > 1 ? 1 : v;
          if (rev) v = 1 - v;
          if (v < 0.02) continue;
          const r = rmax * v;
          hx.moveTo(x + r, y);
          hx.arc(x, y, r, 0, Math.PI * 2);
        }
      }
      hx.fill();
    };

    const finish = () => {
      canvas.style.display = 'none';
      this.rafId = null;
      this.busy = false;
      onEnd?.();
    };

    const step = (now: number) => {
      const duration = phase === 1 ? T2 : T1;
      const p = (now - t0) / duration;
      if (p >= 1) {
        if (phase === 0) {
          hx.fillStyle = color;
          hx.fillRect(0, 0, W, H);
          Promise.resolve()
            .then(() => onMid?.())
            .catch(() => undefined)
            .finally(() => {
              phase = 1;
              t0 = performance.now() - T2 * 0.05;
              draw(0.05, true);
              this.rafId = requestAnimationFrame(step);
            });
          return;
        }
        finish();
        return;
      }
      draw(p, phase === 1);
      this.rafId = requestAnimationFrame(step);
    };

    this.rafId = requestAnimationFrame(step);
  }

  private ensureCanvas(): HTMLCanvasElement | null {
    if (this.canvas) {
      return this.canvas;
    }
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText =
      'position:fixed;inset:0;width:100vw;height:100vh;z-index:9999;pointer-events:none;display:none;';
    document.body.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    return canvas;
  }

  ngOnDestroy(): void {
    if (this.rafId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.canvas?.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
    this.busy = false;
  }
}

