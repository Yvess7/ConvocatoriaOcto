import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ContadorFaseComponent } from '../shared/contador-fase/contador-fase.component';
import { ContadorFaseService } from '../shared/contador-fase/contador-fase.service';

type ShapeKind = 'hexagon' | 'diamond' | 'triangle' | 'cross';

interface GeoParticle {
  ox: number;
  oy: number;
  zone: 'ring' | 'core' | 'sub';
  kind: ShapeKind;
  angle: number;
  spinSpeed: number;
  tStart: number;
  tDuration: number;
  curveSpread: number;
  swirlFreq: number;
  swirlAmp: number;
  phase: number;
  targetZone: 'ring' | 'capsule';
  targetAngle: number;
  targetOffsetX: number;
  targetOffsetY: number;
  size: number;
  color: string;
  strokeColor: string;
  alpha: number;
}

@Component({
  imports: [RouterLink, ContadorFaseComponent],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class HomeComponent {
  private readonly host = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  public readonly contadorService = inject(ContadorFaseService);
  private ctx?: gsap.Context;
  private overlayCanvas?: HTMLCanvasElement;
  private rafId: number | null = null;
  private resizeListener?: () => void;

  constructor() {
    afterNextRender(() => {
      this.iniciarAnimacionSpaghetti();
    });

    this.destroyRef.onDestroy(() => {
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      if (this.resizeListener) {
        window.removeEventListener('resize', this.resizeListener);
      }
      if (this.overlayCanvas && this.overlayCanvas.parentNode) {
        this.overlayCanvas.parentNode.removeChild(this.overlayCanvas);
      }
      this.ctx?.revert();
    });
  }

  private iniciarAnimacionSpaghetti(): void {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    this.ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const root = this.host.nativeElement as HTMLElement;
        const banner =
          (root.querySelector('#hero-banner') as HTMLElement) ||
          (root.querySelector('section') as HTMLElement);
        const widget =
          (root.querySelector('#contador-fase-widget') as HTMLElement) ||
          (root.querySelector('#contador-hero-container') as HTMLElement);

        if (!banner || !widget) return;

        // 1. Crear lienzo fixed de pantalla completa para las hebras de espagueti y polvo en tiempo real
        const canvas = document.createElement('canvas');
        canvas.setAttribute('aria-hidden', 'true');
        canvas.style.cssText =
          'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:45;';
        document.body.appendChild(canvas);
        this.overlayCanvas = canvas;

        const ctx2d = canvas.getContext('2d');
        let vw = window.innerWidth;
        let vh = window.innerHeight;
        let dpr = Math.min(window.devicePixelRatio || 1, 2);

        const actualizarDimensionesCanvas = () => {
          vw = window.innerWidth;
          vh = window.innerHeight;
          dpr = Math.min(window.devicePixelRatio || 1, 2);
          canvas.width = Math.floor(vw * dpr);
          canvas.height = Math.floor(vh * dpr);
          if (ctx2d) {
            ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
          }
        };
        actualizarDimensionesCanvas();
        this.resizeListener = actualizarDimensionesCanvas;
        window.addEventListener('resize', actualizarDimensionesCanvas, { passive: true });

        // 2. Generar únicamente partículas geométricas nítidas del sitio (sin cintas ni filtros pesados)
        const palette = [
          '#f6842b', // brand-orange
          '#e81a4f', // brand-red
          '#b8143d', // brand-red-dark
          '#f6842b',
          '#e81a4f',
          '#3a3a3a', // ink
          '#ffffff',
        ];
        const shapeKinds: ShapeKind[] = ['hexagon', 'diamond', 'triangle', 'cross'];

        const particles: GeoParticle[] = [];
        const numParticles = 100;
        for (let i = 0; i < numParticles; i++) {
          const rand = Math.random();
          const zone: 'ring' | 'core' | 'sub' =
            rand < 0.45 ? 'ring' : rand < 0.75 ? 'core' : 'sub';
          const angle = Math.random() * Math.PI * 2;

          let ox = 0;
          let oy = 0;
          if (zone === 'ring') {
            const r = 0.34 + (Math.random() - 0.5) * 0.08;
            ox = Math.cos(angle) * r;
            oy = Math.sin(angle) * r - 0.05;
          } else if (zone === 'core') {
            ox = (Math.random() - 0.5) * 0.38;
            oy = (Math.random() - 0.5) * 0.32 - 0.05;
          } else {
            ox = (Math.random() - 0.5) * 0.88;
            oy = 0.32 + (Math.random() - 0.5) * 0.22;
          }

          const spatialOrder = Math.max(0, Math.min(1, (ox + oy + 1) * 0.45));
          const tStart = 0.01 + (1 - spatialOrder) * 0.22 + Math.random() * 0.14;
          const tDuration = 0.48 + Math.random() * 0.2;
          const color =
            zone === 'ring' && Math.random() < 0.6
              ? '#f6842b'
              : palette[Math.floor(Math.random() * palette.length)];

          particles.push({
            ox,
            oy,
            zone,
            kind: shapeKinds[i % shapeKinds.length],
            angle,
            spinSpeed: (Math.random() - 0.5) * 5.5,
            tStart,
            tDuration: Math.min(0.96 - tStart, tDuration),
            curveSpread: (Math.random() - 0.4) * 260,
            swirlFreq: 2.2 + Math.random() * 3.4,
            swirlAmp: 12 + Math.random() * 28,
            phase: Math.random() * Math.PI * 2,
            targetZone: zone === 'ring' || Math.random() < 0.5 ? 'ring' : 'capsule',
            targetAngle: Math.random() * Math.PI * 2,
            targetOffsetX: Math.random() * 170,
            targetOffsetY: (Math.random() - 0.5) * 34,
            size: 4.8 + Math.random() * 6.8,
            color,
            strokeColor: color === '#ffffff' ? '#e81a4f' : '#ffffff',
            alpha: 0.85 + Math.random() * 0.15,
          });
        }

        // Elementos DOM individuales del contador
        const desktopBadge = widget.querySelector(
          '[data-spaghetti-part="desktop-badge"]'
        ) as HTMLElement | null;
        const desktopRing = widget.querySelector(
          '[data-spaghetti-part="desktop-ring"]'
        ) as HTMLElement | null;
        const desktopDigits = widget.querySelector(
          '[data-spaghetti-part="desktop-digits"]'
        ) as HTMLElement | null;
        const desktopHms = widget.querySelector(
          '[data-spaghetti-part="desktop-hms"]'
        ) as HTMLElement | null;

        const mobileBadge = widget.querySelector(
          '[data-spaghetti-part="mobile-badge"]'
        ) as HTMLElement | null;
        const mobileCards = [0, 1, 2, 3]
          .map(
            (idx) =>
              widget.querySelector(
                `[data-spaghetti-part="mobile-card-${idx}"]`
              ) as HTMLElement | null
          )
          .filter((el): el is HTMLElement => !!el);

        // Coordenadas cacheadas de origen y destino para evitar lecturas de layout en cada frame
        const heroContainer =
          (root.querySelector('#contador-hero-container') as HTMLElement) || widget;
        let baseHeroRect = heroContainer.getBoundingClientRect();
        let currentProgress = 0;

        const calcularGeometriaDestino = () => {
          const isSmUp = vw >= 640;
          const margin = isSmUp ? 24 : 16;
          const capsuleEl = document.querySelector(
            '[data-docked-target="capsule"]'
          ) as HTMLElement | null;
          const dstW =
            capsuleEl && capsuleEl.offsetWidth > 40 ? capsuleEl.offsetWidth : 356;
          const dstH =
            capsuleEl && capsuleEl.offsetHeight > 30 ? capsuleEl.offsetHeight : 102;
          const dstLeft = vw - margin - dstW;
          const dstTop = vh - margin - dstH;
          const dstCx = dstLeft + dstW * 0.5;
          const dstCy = dstTop + dstH * 0.5;
          const ringTargetX = dstLeft + 52;
          const ringTargetY = dstCy;
          return { dstCx, dstCy, ringTargetX, ringTargetY };
        };

        let cachedDst = calcularGeometriaDestino();

        const actualizarRects = () => {
          baseHeroRect = heroContainer.getBoundingClientRect();
          cachedDst = calcularGeometriaDestino();
        };

        // Funciones matemáticas y helpers de dibujo en Canvas 2D
        const cubicBezier = (
          t: number,
          p0: number,
          p1: number,
          p2: number,
          p3: number
        ): number => {
          const u = 1 - t;
          return (
            u * u * u * p0 +
            3 * u * u * t * p1 +
            3 * u * t * t * p2 +
            t * t * t * p3
          );
        };

        const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
        const smoothstep = (edge0: number, edge1: number, x: number) => {
          const t = clamp01((x - edge0) / (edge1 - edge0));
          return t * t * (3 - 2 * t);
        };

        const drawPolygonPath = (
          c: CanvasRenderingContext2D,
          cx: number,
          cy: number,
          radius: number,
          sides: number,
          rotation: number
        ) => {
          c.beginPath();
          for (let i = 0; i < sides; i++) {
            const theta = rotation + (i * Math.PI * 2) / sides;
            const x = cx + Math.cos(theta) * radius;
            const y = cy + Math.sin(theta) * radius;
            if (i === 0) c.moveTo(x, y);
            else c.lineTo(x, y);
          }
          c.closePath();
        };

        const drawGeoShape = (
          c: CanvasRenderingContext2D,
          kind: ShapeKind,
          cx: number,
          cy: number,
          radius: number,
          rotation: number
        ) => {
          if (kind === 'hexagon') {
            drawPolygonPath(c, cx, cy, radius, 6, rotation);
            return;
          }
          if (kind === 'diamond') {
            drawPolygonPath(c, cx, cy, radius, 4, rotation);
            return;
          }
          if (kind === 'triangle') {
            drawPolygonPath(c, cx, cy, radius, 3, rotation - Math.PI / 2);
            return;
          }
          // Cross geométrica alineada al centro
          const arm = radius * 0.36;
          c.save();
          c.translate(cx, cy);
          c.rotate(rotation);
          c.beginPath();
          c.moveTo(-arm, -radius);
          c.lineTo(arm, -radius);
          c.lineTo(arm, -arm);
          c.lineTo(radius, -arm);
          c.lineTo(radius, arm);
          c.lineTo(arm, arm);
          c.lineTo(arm, radius);
          c.lineTo(-arm, radius);
          c.lineTo(-arm, arm);
          c.lineTo(-radius, arm);
          c.lineTo(-radius, -arm);
          c.lineTo(-arm, -arm);
          c.closePath();
          c.restore();
        };

        // 3. Renderizador ligero en tiempo real: únicamente partículas geométricas hacia la esquina
        const renderFrame = (timeMs: number) => {
          if (!ctx2d) return;
          ctx2d.clearRect(0, 0, vw, vh);

          const p = currentProgress;
          if (p <= 0.004 || p >= 0.995) {
            this.rafId = null;
            return;
          }

          const { dstCx, dstCy, ringTargetX, ringTargetY } = cachedDst;
          const srcW = Math.min(410, Math.max(240, baseHeroRect.width));
          const srcH = Math.min(410, Math.max(150, baseHeroRect.height));
          const srcCx = baseHeroRect.left + baseHeroRect.width * 0.5;
          const scrollHoldY = Math.min(180, p * 200);
          const srcCy = Math.max(96, baseHeroRect.top + baseHeroRect.height * 0.5 + scrollHoldY);
          const timeSec = timeMs * 0.001;

          ctx2d.save();
          ctx2d.globalCompositeOperation = 'source-over';

          for (let i = 0; i < particles.length; i++) {
            const pt = particles[i];
            const rawT = (p - pt.tStart) / pt.tDuration;
            if (rawT <= 0 || rawT >= 1) continue;

            const t =
              rawT < 0.5
                ? 2 * rawT * rawT
                : 1 - Math.pow(-2 * rawT + 2, 2) / 2;

            const startX = srcCx + pt.ox * srcW;
            const startY = srcCy + pt.oy * srcH;

            const spiralAngle = pt.targetAngle + (1 - t) * 7.0 + timeSec * 2.4;
            const endX =
              pt.targetZone === 'ring'
                ? ringTargetX + Math.cos(spiralAngle) * 28
                : dstCx + (pt.targetOffsetX - 85);
            const endY =
              pt.targetZone === 'ring'
                ? ringTargetY + Math.sin(spiralAngle) * 28
                : dstCy + pt.targetOffsetY;

            const cp1x = startX + pt.curveSpread * 0.6;
            const cp1y = startY + 95 + Math.abs(pt.curveSpread) * 0.3;
            const cp2x = endX - pt.curveSpread * 0.38;
            const cp2y = endY - 95;

            const bx = cubicBezier(t, startX, cp1x, cp2x, endX);
            const by = cubicBezier(t, startY, cp1y, cp2y, endY);

            const turbEnvelope = Math.sin(t * Math.PI) * (1 - t * 0.4);
            const tx =
              Math.cos(t * pt.swirlFreq + timeSec * 3.0 + pt.phase) *
              pt.swirlAmp *
              turbEnvelope;
            const ty =
              Math.sin(t * pt.swirlFreq * 1.3 + timeSec * 3.0 + pt.phase) *
              pt.swirlAmp *
              turbEnvelope;

            const px = bx + tx;
            const py = by + ty;

            const alpha =
              pt.alpha *
              smoothstep(0, 0.1, rawT) *
              (1 - smoothstep(0.84, 1.0, rawT));
            if (alpha <= 0.02) continue;

            const currentSize = pt.size * (0.7 + 0.5 * Math.sin(rawT * Math.PI));
            const rot = pt.angle + timeSec * pt.spinSpeed + rawT * 5;

            ctx2d.globalAlpha = alpha;
            ctx2d.fillStyle = pt.color;
            drawGeoShape(ctx2d, pt.kind, px, py, currentSize, rot);
            ctx2d.fill();

            if (pt.color === '#ffffff') {
              ctx2d.lineWidth = 1.25;
              ctx2d.strokeStyle = pt.strokeColor;
              ctx2d.stroke();
            }
          }

          ctx2d.restore();

          if (currentProgress > 0.005 && currentProgress < 0.99) {
            this.rafId = requestAnimationFrame(renderFrame);
          } else {
            this.rafId = null;
          }
        };

        const solicitarRender = () => {
          if (this.rafId === null) {
            this.rafId = requestAnimationFrame(renderFrame);
          }
        };

        // 4. Sincronización en tiempo real del DOM del Hero + Proyección direccional + Ensamblaje de esquina
        const aplicarEstadoProgreso = (p: number) => {
          currentProgress = p;

          const progresoForjado = clamp01((p - 0.42) / 0.54);
          this.contadorService.setProgresoEnsamblajeEnHome(progresoForjado);

          actualizarRects();
          const { dstCx, dstCy } = cachedDst;
          const srcCx = baseHeroRect.left + baseHeroRect.width * 0.5;
          const srcCy = baseHeroRect.top + baseHeroRect.height * 0.5;
          const vecX = dstCx - srcCx;
          const vecY = Math.max(120, dstCy - srcCy);

          if (p <= 0.008) {
            widget.style.opacity = '1';
            widget.style.transform = 'translate3d(0,0,0)';
          } else {
            const heroFade = 1 - smoothstep(0.14, 0.52, p);
            const holdY = Math.min(180, p * 200);
            widget.style.opacity = String(heroFade);
            widget.style.transform = `translate3d(0, ${holdY}px, 0)`;
          }

          // Proyección direccional escalonada hacia la esquina inferior derecha
          const proyectarPieza = (
            el: HTMLElement | null,
            startP: number,
            endP: number,
            factorVec: number,
            skew: number,
            rotDeg: number
          ) => {
            if (!el) return;
            if (p <= startP) {
              el.style.transform = '';
              el.style.opacity = '1';
              return;
            }
            const lp = clamp01((p - startP) / (endP - startP));
            const easeLp = lp * lp;
            const tx = easeLp * vecX * factorVec;
            const ty = easeLp * vecY * factorVec;
            const sc = 1 - easeLp * 0.42;
            const sx = sc * (1 - easeLp * 0.18);
            const sy = sc * (1 + easeLp * 0.25);
            const sk = easeLp * skew;
            const rot = easeLp * rotDeg;
            const op = 1 - smoothstep(0.22, 0.92, lp);
            el.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg) skewX(${sk}deg) scale(${sx}, ${sy})`;
            el.style.opacity = String(op);
          };

          // Deformación escalonada en Desktop proyectada hacia el vector de la esquina
          proyectarPieza(desktopHms, 0.01, 0.4, 0.34, -14, 6);
          proyectarPieza(desktopDigits, 0.03, 0.44, 0.42, -18, 8);
          proyectarPieza(desktopRing, 0.05, 0.48, 0.48, -16, 10);
          proyectarPieza(desktopBadge, 0.08, 0.5, 0.54, -20, 12);

          // Deformación escalonada en Mobile proyectada en abanico hacia la esquina inferior derecha
          mobileCards.forEach((card, idx) => {
            const reverseIdx = 3 - idx;
            const start = 0.01 + reverseIdx * 0.035;
            const end = 0.42 + reverseIdx * 0.035;
            const factor = 0.36 + (3 - idx) * 0.06;
            proyectarPieza(card, start, end, factor, -16, 8);
          });
          proyectarPieza(mobileBadge, 0.06, 0.48, 0.46, -15, 10);

          if (p <= 0.004 || p >= 0.995) {
            if (ctx2d) ctx2d.clearRect(0, 0, vw, vh);
          } else {
            solicitarRender();
          }
        };

        // Estado inicial según la posición de scroll al cargar
        if (window.scrollY < 45) {
          aplicarEstadoProgreso(0);
        }

        // 5. ScrollTrigger con recorrido amplio y scrub suave para evitar saltos al scrollear rápido
        ScrollTrigger.create({
          trigger: banner,
          start: 'top -35px',
          end: '+=950',
          scrub: 1.5,
          onUpdate: (self) => {
            aplicarEstadoProgreso(self.progress);
          },
        });

        ScrollTrigger.refresh();
      });
    }, this.host.nativeElement);
  }
}
