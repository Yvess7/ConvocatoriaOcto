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

interface DustParticle {
  // Posición normalizada de origen dentro del widget del banner (-0.5 a 0.5)
  ox: number;
  oy: number;
  // Tipo de origen: 'ring' (anillo), 'core' (dígitos centrales), 'sub' (barra inferior / tarjetas)
  zone: 'ring' | 'core' | 'sub';
  angle: number;
  // Ventana de tiempo dentro del progreso (0..1)
  tStart: number;
  tDuration: number;
  // Curvatura y turbulencia individual
  curveSpread: number;
  swirlFreq: number;
  swirlAmp: number;
  phase: number;
  // Destino en el reloj flotante ('ring' o 'digits')
  targetZone: 'ring' | 'digits';
  targetAngle: number;
  targetOffsetX: number;
  targetOffsetY: number;
  // Apariencia
  size: number;
  color: string;
  alpha: number;
}

interface SpaghettiStrand {
  ox: number;
  oy: number;
  tStart: number;
  tDuration: number;
  curveBendX: number;
  curveBendY: number;
  targetAngle: number;
  targetZone: 'ring' | 'digits';
  width: number;
  color: string;
  stretchFactor: number;
  waveFreq: number;
  waveAmp: number;
  phase: number;
}

@Component({
  imports: [RouterLink, ContadorFaseComponent],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class HomeComponent {
  private readonly host = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly contadorService = inject(ContadorFaseService);
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

        // 2. Generar banco de partículas de polvo (420 granos) y filamentos de espagueti (85 hebras)
        const palette = [
          '#ffffff',
          '#ffffff',
          '#f6842b',
          '#f6842b',
          '#ffaa55',
          '#ffe4c4',
          '#ff4d79',
        ];

        const particles: DustParticle[] = [];
        const numParticles = 420;
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

          // Las partículas inferiores/derechas se desprenden primero hacia el agujero negro
          const spatialOrder = Math.max(0, Math.min(1, (ox + oy + 1) * 0.45));
          const tStart = 0.01 + (1 - spatialOrder) * 0.24 + Math.random() * 0.16;
          const tDuration = 0.44 + Math.random() * 0.18;

          const targetZone: 'ring' | 'digits' =
            zone === 'ring' || Math.random() < 0.45 ? 'ring' : 'digits';

          particles.push({
            ox,
            oy,
            zone,
            angle,
            tStart,
            tDuration: Math.min(0.98 - tStart, tDuration),
            curveSpread: (Math.random() - 0.35) * 260,
            swirlFreq: 2.5 + Math.random() * 4.5,
            swirlAmp: 14 + Math.random() * 38,
            phase: Math.random() * Math.PI * 2,
            targetZone,
            targetAngle: Math.random() * Math.PI * 2,
            targetOffsetX: Math.random() * 115,
            targetOffsetY: (Math.random() - 0.5) * 24,
            size: 1.1 + Math.random() * 2.6,
            color:
              zone === 'ring' && Math.random() < 0.65
                ? '#f6842b'
                : palette[Math.floor(Math.random() * palette.length)],
            alpha: 0.65 + Math.random() * 0.35,
          });
        }

        const strands: SpaghettiStrand[] = [];
        const numStrands = 85;
        for (let i = 0; i < numStrands; i++) {
          const angle = (i / numStrands) * Math.PI * 2 + Math.random() * 0.2;
          const r = 0.15 + Math.random() * 0.35;
          const ox = Math.cos(angle) * r;
          const oy = Math.sin(angle) * r;
          const tStart = 0.02 + Math.random() * 0.32;
          const tDuration = 0.46 + Math.random() * 0.18;

          strands.push({
            ox,
            oy,
            tStart,
            tDuration: Math.min(0.96 - tStart, tDuration),
            curveBendX: (Math.random() - 0.25) * 280,
            curveBendY: 80 + Math.random() * 190,
            targetAngle: angle + Math.PI * (1.5 + Math.random()),
            targetZone: i % 3 === 0 ? 'digits' : 'ring',
            width: 1.0 + Math.random() * 2.2,
            color: i % 2 === 0 ? '#f6842b' : i % 5 === 0 ? '#ffaa55' : '#ffffff',
            stretchFactor: 0.16 + Math.random() * 0.14,
            waveFreq: 3 + Math.random() * 4,
            waveAmp: 8 + Math.random() * 22,
            phase: Math.random() * Math.PI * 2,
          });
        }

        // Elementos DOM individuales del contador y filtro SVG
        const displacementEl = document.getElementById(
          'spaghetti-displacement'
        ) as SVGFEDisplacementMapElement | null;

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

        // Coordenadas cacheadas de origen para que no se pierdan al deformar los hijos
        let baseHeroRect = widget.getBoundingClientRect();
        let currentProgress = 0;

        const actualizarRectBase = () => {
          // Obtenemos el contenedor envolvente que no sufre deformaciones extremas
          const container =
            (root.querySelector('#contador-hero-container') as HTMLElement) || widget;
          baseHeroRect = container.getBoundingClientRect();
        };

        // Función matemática de Bezier cúbica
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

        // 3. Renderizador en tiempo real del flujo de espaguetización, polvo y vórtice de forjado
        const renderFrame = (timeMs: number) => {
          if (!ctx2d) return;
          ctx2d.clearRect(0, 0, vw, vh);

          const p = currentProgress;
          if (p <= 0.004 || p >= 0.995) {
            this.rafId = null;
            return;
          }

          actualizarRectBase();

          // Centro y dimensiones actuales del contador del banner en pantalla
          const srcW = Math.max(220, baseHeroRect.width);
          const srcH = Math.max(120, baseHeroRect.height);
          const srcCx = baseHeroRect.left + srcW * 0.5;
          // Compensamos ligeramente la subida del scroll para que la desintegración ocurra a la vista
          const scrollHoldY = Math.min(180, p * 210);
          const srcCy = baseHeroRect.top + srcH * 0.5 + scrollHoldY;

          // Coordenadas exactas del reloj flotante en la esquina inferior derecha
          const dockedEl = document.getElementById('contador-fase-docked');
          const dockedRect = dockedEl?.getBoundingClientRect();
          const dstRight = dockedRect && dockedRect.width > 20 ? dockedRect.left : vw - 235;
          const dstTop = dockedRect && dockedRect.height > 20 ? dockedRect.top : vh - 82;
          const ringTargetX = dstRight + 32;
          const ringTargetY = dstTop + 32;

          const timeSec = timeMs * 0.001;

          ctx2d.save();
          ctx2d.globalCompositeOperation = 'lighter';

          // A. Vórtice gravitacional / disco de acreción en la esquina inferior derecha mientras se forja el reloj
          const vortexIntensity =
            smoothstep(0.18, 0.55, p) * (1 - smoothstep(0.84, 0.99, p));
          if (vortexIntensity > 0.01) {
            const vortexRadius = 46 * (0.65 + 0.35 * Math.sin(p * Math.PI));
            const grad = ctx2d.createRadialGradient(
              ringTargetX,
              ringTargetY,
              2,
              ringTargetX,
              ringTargetY,
              vortexRadius
            );
            grad.addColorStop(0, `rgba(255, 255, 255, ${0.55 * vortexIntensity})`);
            grad.addColorStop(0.35, `rgba(246, 132, 43, ${0.48 * vortexIntensity})`);
            grad.addColorStop(0.7, `rgba(232, 26, 79, ${0.22 * vortexIntensity})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx2d.fillStyle = grad;
            ctx2d.beginPath();
            ctx2d.arc(ringTargetX, ringTargetY, vortexRadius, 0, Math.PI * 2);
            ctx2d.fill();

            // Anillos espirales de acreción girando en tiempo real alrededor del nuevo reloj
            for (let s = 0; s < 3; s++) {
              const rot = timeSec * 5.5 + s * ((Math.PI * 2) / 3) + p * 12;
              const rOrbit = 22 + s * 5 * (1 - p * 0.5);
              ctx2d.strokeStyle =
                s % 2 === 0
                  ? `rgba(246, 132, 43, ${0.65 * vortexIntensity})`
                  : `rgba(255, 255, 255, ${0.55 * vortexIntensity})`;
              ctx2d.lineWidth = 1.8;
              ctx2d.beginPath();
              ctx2d.arc(ringTargetX, ringTargetY, rOrbit, rot, rot + 1.8);
              ctx2d.stroke();
            }
          }

          // B. Hebras de espaguetización (Spaghetti Filaments) estirándose hacia el agujero negro
          for (let i = 0; i < strands.length; i++) {
            const st = strands[i];
            const localP = (p - st.tStart) / st.tDuration;
            if (localP <= 0 || localP >= 1) continue;

            // La cabeza de la hebra avanza más rápido que la cola para estirarse como espagueti
            const headT = clamp01(Math.pow(localP, 0.72));
            const tailT = clamp01(
              Math.pow(Math.max(0, localP - st.stretchFactor), 1.35)
            );

            const startX = srcCx + st.ox * srcW;
            const startY = srcCy + st.oy * srcH;

            const endX =
              st.targetZone === 'ring'
                ? ringTargetX + Math.cos(st.targetAngle + p * 8) * 20
                : ringTargetX + 42 + (i % 5) * 18;
            const endY =
              st.targetZone === 'ring'
                ? ringTargetY + Math.sin(st.targetAngle + p * 8) * 20
                : ringTargetY + ((i % 3) - 1) * 7;

            // Puntos de control que crean el embudo gravitacional en curva S
            const cp1x = startX + st.curveBendX * 0.5 + (endX - startX) * 0.25;
            const cp1y = startY + st.curveBendY + (endY - startY) * 0.15;
            const cp2x = endX - st.curveBendX * 0.35;
            const cp2y = endY - 95;

            const fade =
              smoothstep(0, 0.12, localP) * (1 - smoothstep(0.86, 1.0, localP));
            if (fade <= 0.01) continue;

            ctx2d.strokeStyle = st.color;
            ctx2d.lineWidth = st.width * (0.6 + 0.7 * Math.sin(localP * Math.PI));
            ctx2d.lineCap = 'round';
            ctx2d.globalAlpha = fade * 0.85;

            ctx2d.beginPath();
            const steps = 7;
            for (let s = 0; s <= steps; s++) {
              const segT = tailT + (headT - tailT) * (s / steps);
              const bx = cubicBezier(segT, startX, cp1x, cp2x, endX);
              const by = cubicBezier(segT, startY, cp1y, cp2y, endY);
              const waveEnv = Math.sin(segT * Math.PI);
              const wx =
                Math.cos(segT * st.waveFreq + timeSec * 4 + st.phase) *
                st.waveAmp *
                waveEnv;
              const wy =
                Math.sin(segT * st.waveFreq + timeSec * 4 + st.phase) *
                st.waveAmp *
                waveEnv;

              if (s === 0) {
                ctx2d.moveTo(bx + wx, by + wy);
              } else {
                ctx2d.lineTo(bx + wx, by + wy);
              }
            }
            ctx2d.stroke();
          }

          // C. Nube densa de polvo luminoso que se desprende del contador y construye el reloj inferior
          for (let i = 0; i < particles.length; i++) {
            const pt = particles[i];
            const rawT = (p - pt.tStart) / pt.tDuration;
            if (rawT <= 0 || rawT >= 1) continue;

            // Curva de aceleración gravitacional
            const t = rawT < 0.5
              ? 2 * rawT * rawT
              : 1 - Math.pow(-2 * rawT + 2, 2) / 2;

            const startX = srcCx + pt.ox * srcW;
            const startY = srcCy + pt.oy * srcH;

            // Espiral final al llegar al reloj de la esquina
            const spiralAngle = pt.targetAngle + (1 - t) * 7.5 + timeSec * 2.5;
            const endX =
              pt.targetZone === 'ring'
                ? ringTargetX + Math.cos(spiralAngle) * 20
                : ringTargetX + 36 + pt.targetOffsetX;
            const endY =
              pt.targetZone === 'ring'
                ? ringTargetY + Math.sin(spiralAngle) * 20
                : ringTargetY + pt.targetOffsetY;

            const cp1x = startX + pt.curveSpread * 0.65;
            const cp1y = startY + 110 + Math.abs(pt.curveSpread) * 0.35;
            const cp2x = endX - pt.curveSpread * 0.4;
            const cp2y = endY - 110;

            const bx = cubicBezier(t, startX, cp1x, cp2x, endX);
            const by = cubicBezier(t, startY, cp1y, cp2y, endY);

            // Turbulencia de polvo en el aire que converge a 0 al ensamblar la pieza final
            const turbEnvelope = Math.sin(t * Math.PI) * (1 - t * 0.45);
            const tx =
              Math.cos(t * pt.swirlFreq + timeSec * 3.2 + pt.phase) *
              pt.swirlAmp *
              turbEnvelope;
            const ty =
              Math.sin(t * pt.swirlFreq * 1.3 + timeSec * 3.2 + pt.phase) *
              pt.swirlAmp *
              turbEnvelope;

            const px = bx + tx;
            const py = by + ty;

            // Posición ligeramente anterior para estela de velocidad (spaghetti micro-streak)
            const prevT = Math.max(0, t - 0.045 * Math.sin(t * Math.PI));
            const pbx = cubicBezier(prevT, startX, cp1x, cp2x, endX);
            const pby = cubicBezier(prevT, startY, cp1y, cp2y, endY);
            const ptx =
              Math.cos(prevT * pt.swirlFreq + timeSec * 3.2 + pt.phase) *
              pt.swirlAmp *
              Math.sin(prevT * Math.PI) *
              (1 - prevT * 0.45);
            const pty =
              Math.sin(prevT * pt.swirlFreq * 1.3 + timeSec * 3.2 + pt.phase) *
              pt.swirlAmp *
              Math.sin(prevT * Math.PI) *
              (1 - prevT * 0.45);

            const alpha =
              pt.alpha *
              smoothstep(0, 0.08, rawT) *
              (1 - smoothstep(0.88, 1.0, rawT));

            ctx2d.globalAlpha = alpha;
            ctx2d.strokeStyle = pt.color;
            ctx2d.lineWidth = pt.size;
            ctx2d.lineCap = 'round';

            ctx2d.beginPath();
            ctx2d.moveTo(pbx + ptx, pby + pty);
            ctx2d.lineTo(px, py);
            ctx2d.stroke();
          }

          ctx2d.restore();

          // Mantener vivo el flujo turbulento mientras la transición está activa a mitad del scroll
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

        // 4. Sincronización en tiempo real del DOM del Hero + Filtro SVG + Ensamblaje del Docked Widget
        const aplicarEstadoProgreso = (p: number) => {
          currentProgress = p;

          // El reloj de la esquina inferior se va ensamblando en tiempo real entre p = 0.28 y p = 0.95
          const progresoForjado = clamp01((p - 0.28) / 0.67);
          this.contadorService.setProgresoEnsamblajeEnHome(progresoForjado);

          // Filtro SVG de turbulencia / desintegración en el contador principal
          if (displacementEl) {
            const dispScale = p <= 0.008 ? 0 : Math.round(Math.pow(clamp01(p / 0.55), 1.4) * 145);
            displacementEl.setAttribute('scale', String(dispScale));
          }

          if (p <= 0.008) {
            widget.style.filter = 'none';
            widget.style.opacity = '1';
            widget.style.transform = 'translate3d(0,0,0)';
          } else {
            const heroFade = 1 - smoothstep(0.18, 0.56, p);
            const holdY = Math.min(180, p * 210);
            widget.style.filter =
              heroFade > 0.01 ? 'url(#spaghetti-disintegrate)' : 'none';
            widget.style.opacity = String(heroFade);
            widget.style.transform = `translate3d(0, ${holdY}px, 0)`;
          }

          // Estiramiento individual de cada sub-pieza hacia la esquina inferior derecha (efecto espagueti)
          const deformarPieza = (
            el: HTMLElement | null,
            startP: number,
            endP: number,
            pullX: number,
            pullY: number,
            skew: number
          ) => {
            if (!el) return;
            if (p <= startP) {
              el.style.transform = '';
              el.style.opacity = '1';
              return;
            }
            const lp = clamp01((p - startP) / (endP - startP));
            const easeLp = lp * lp;
            const tx = easeLp * pullX;
            const ty = easeLp * pullY;
            const sx = 1 - easeLp * 0.55;
            const sy = 1 + easeLp * 1.35;
            const sk = easeLp * skew;
            const op = 1 - smoothstep(0.25, 0.95, lp);
            el.style.transform = `translate3d(${tx}px, ${ty}px, 0) skewX(${sk}deg) scale(${sx}, ${sy})`;
            el.style.opacity = String(op);
          };

          // Deformación escalonada en Desktop (de abajo hacia arriba hacia el vórtice)
          deformarPieza(desktopHms, 0.01, 0.42, 95, 135, -18);
          deformarPieza(desktopDigits, 0.04, 0.48, 115, 165, -24);
          deformarPieza(desktopRing, 0.06, 0.52, 130, 185, -22);
          deformarPieza(desktopBadge, 0.1, 0.55, 145, 210, -26);

          // Deformación escalonada en Mobile (las 4 tarjetas se estiran en cascada hacia la esquina inferior derecha)
          mobileCards.forEach((card, idx) => {
            const reverseIdx = 3 - idx;
            const start = 0.01 + reverseIdx * 0.04;
            const end = 0.42 + reverseIdx * 0.04;
            const pullX = (2 - idx) * 45 + 60;
            deformarPieza(card, start, end, pullX, 175, -20);
          });
          deformarPieza(mobileBadge, 0.08, 0.5, 85, 190, -18);

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

        // 5. ScrollTrigger que gobierna la física de espaguetización y ensamblaje
        ScrollTrigger.create({
          trigger: banner,
          start: 'top -35px',
          end: '+=520',
          scrub: 0.45,
          onUpdate: (self) => {
            aplicarEstadoProgreso(self.progress);
          },
          onLeave: () => {
            aplicarEstadoProgreso(1);
          },
          onEnterBack: (self) => {
            aplicarEstadoProgreso(self.progress);
          },
          onLeaveBack: () => {
            aplicarEstadoProgreso(0);
          },
        });

        ScrollTrigger.refresh();
      });
    }, this.host.nativeElement);
  }
}
