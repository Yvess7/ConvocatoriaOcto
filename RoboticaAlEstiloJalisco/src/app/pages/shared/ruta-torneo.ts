import { afterNextRender, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private ctx?: gsap.Context;

  constructor() {
    afterNextRender(() => this.animarMapa());
    inject(DestroyRef).onDestroy(() => this.ctx?.revert());
  }

  /** Animaciones del mapa con GSAP: entrada por scroll, trazo de curvas, nodos y tarjetas. */
  private animarMapa(): void {
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
    const mm = gsap.matchMedia();
    this.ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(this.host.nativeElement);
        const entrada = (el: Element) => ({ trigger: el, start: 'top 85%', once: true });

        q('[data-gsap="encabezado"]').forEach((el) =>
          gsap.from(el, { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: entrada(el) }),
        );
        q('[data-gsap="tramo"]').forEach((el) =>
          gsap.from(el, { scale: 0.8, y: 30, opacity: 0, duration: 0.7, ease: 'back.out(1.6)', scrollTrigger: entrada(el) }),
        );
        q('[data-gsap="nodo"]').forEach((el) => {
          const paso = el.parentElement!;
          const curva = paso.querySelector('[data-gsap="curva"]');
          const tarjeta = paso.querySelector('[data-gsap="tarjeta"]');
          const lado = Number(tarjeta?.getAttribute('data-lado') ?? 0);
          const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 95%', once: true } });
          tl.from(el, { scale: 0, rotate: -90, opacity: 0, duration: 0.3, ease: 'back.out(2)' });
          if (tarjeta) {
            tl.from(tarjeta, { x: lado * 40, y: 20, opacity: 0, duration: 0.35, ease: 'power3.out' }, '-=0.15');
          }
          if (curva) {
            tl.fromTo(
              curva,
              { clipPath: 'inset(0 0 100% 0)' },
              { clipPath: 'inset(0 0 0% 0)', duration: 0.5, ease: 'power2.inOut' },
              '-=0.25',
            );
          }
        });
        // Fondo: aparece con zoom, hace parallax con el scroll y flota/gira sin parar
        q('[data-gsap="fondo"]').forEach((el, i) => {
          const vel = Number(el.getAttribute('data-vel') ?? 0.3);
          gsap.from(el, {
            scale: 0,
            opacity: 0,
            rotate: gsap.utils.random(-180, 180),
            duration: 1.2,
            ease: 'back.out(1.7)',
            delay: (i % 6) * 0.1,
          });
          gsap.to(el, {
            yPercent: vel * -120,
            ease: 'none',
            scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 },
          });
          gsap.to(el, {
            x: gsap.utils.random(-25, 25),
            rotation: `+=${gsap.utils.random(-60, 60)}`,
            duration: gsap.utils.random(4, 8),
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
        });
        // Tramos: ligero parallax al desplazarse
        q('[data-gsap="tramo"]').forEach((el) =>
          gsap.to(el, {
            y: -20,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
          }),
        );
        // ---- Mapa inmersivo: robot, rastro recorrido, estado de nodos, foco de tarjetas y progreso ----
        const senderos = q('[data-gsap="sendero"]');
        const todosNodos = q('[data-gsap="nodo"]');
        const progreso = q('[data-gsap="progreso"]')[0];
        const progTexto = q('[data-gsap="progreso-texto"]')[0];
        const progBarra = q('[data-gsap="progreso-barra"]')[0];
        const esEscritorio = () => window.matchMedia('(min-width: 768px)').matches;

        const actualizarProgreso = () => {
          const total = todosNodos.length;
          const hechos = todosNodos.filter((n) => {
            const est = (n.querySelector('button') as HTMLElement | null)?.dataset['estado'];
            return est === 'pasado' || est === 'actual';
          }).length;
          if (progTexto) progTexto.textContent = `Paso ${Math.max(1, hechos)} de ${total}`;
          if (progBarra && total) {
            const p = hechos / total;
            const h = esEscritorio();
            gsap.to(progBarra, { scaleY: h ? p : 1, scaleX: h ? 1 : p, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
          }
        };

        senderos.forEach((sendero) => {
          const robot = sendero.querySelector('[data-gsap="robot"]') as HTMLElement | null;
          const img = robot?.querySelector('[data-gsap="robot-img"]') as HTMLElement | null;
          const sombra = robot?.querySelector('[data-gsap="robot-sombra"]') ?? null;
          const nodos = Array.from(sendero.querySelectorAll('[data-gsap="nodo"]'));
          if (!robot || !img || nodos.length < 2) return;
          const base = sendero.getBoundingClientRect();
          const centros = nodos.map((n) => {
            const r = n.getBoundingClientRect();
            return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 };
          });
          // Misma curva cúbica que dibuja el SVG: sale vertical y llega vertical
          const ruta: { x: number; y: number }[] = [centros[0]];
          for (let i = 0; i < centros.length - 1; i++) {
            const a = centros[i];
            const b = centros[i + 1];
            const medio = a.y + (b.y - a.y) / 2;
            ruta.push({ x: a.x, y: medio }, { x: b.x, y: medio }, b);
          }

          // Elementos por paso: botón, anillo y rastro hacia el siguiente
          const pasos = nodos.map((n) => {
            const paso = n.parentElement!;
            return {
              boton: n.querySelector('button') as HTMLElement,
              ping: n.querySelector('span') as HTMLElement | null,
              rastro: paso.querySelector('[data-gsap="rastro"]') as HTMLElement | null,
              latido: null as gsap.core.Tween | null,
            };
          });
          pasos.forEach((p) => {
            p.boton.dataset['estado'] = 'futuro';
            if (p.ping) p.ping.style.visibility = 'hidden';
            if (p.rastro) gsap.set(p.rastro, { clipPath: 'inset(-8px -8px 100% -8px)' });
            p.latido = gsap.to(p.boton, { y: -4, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });
          });

          gsap.set(robot, { xPercent: -50, yPercent: -50 });
          gsap.set(img, { transformOrigin: '50% 90%' });
          // Inclinación y giro según hacia dónde avanza (suavizados)
          const inclinar = gsap.quickTo(img, 'rotation', { duration: 0.4, ease: 'power2.out' });
          const girar = gsap.quickTo(img, 'scaleX', { duration: 0.35, ease: 'power2.out' });
          let xPrev = ruta[0].x;
          let anterior: string[] = [];

          // Estado de cada nodo, rastro recorrido según la posición del robot
          const actualizar = () => {
            const st = tween.scrollTrigger;
            const visible = robot.offsetParent !== null;
            const robotY = Number(gsap.getProperty(robot, 'y'));
            const dentro = !!st && (st.isActive || st.progress > 0);
            const alcanzado = nodos.map((n, i) => {
              if (!dentro) return false;
              return visible ? robotY >= centros[i].y - 6 : n.getBoundingClientRect().top + 32 < window.innerHeight * 0.6;
            });
            const ultimo = alcanzado.lastIndexOf(true);
            const activo = !!st && st.isActive;
            const estados = alcanzado.map((ok, i) => (!ok ? 'futuro' : i === ultimo && activo ? 'actual' : 'pasado'));
            let cambio = false;
            estados.forEach((est, i) => {
              const p = pasos[i];
              if (est === anterior[i]) return;
              cambio = true;
              p.boton.dataset['estado'] = est;
              if (p.ping) p.ping.style.visibility = est === 'actual' ? 'visible' : 'hidden';
              if (est === 'actual') {
                p.latido?.play();
              } else {
                p.latido?.pause();
                gsap.to(p.boton, { y: 0, duration: 0.3, overwrite: 'auto' });
              }
            });
            anterior = estados;
            if (visible) {
              pasos.forEach((p, i) => {
                if (!p.rastro || i >= centros.length - 1) return;
                const f = gsap.utils.clamp(0, 1, (robotY - centros[i].y) / (centros[i + 1].y - centros[i].y));
                p.rastro.style.clipPath = `inset(-8px -8px ${(1 - f) * 100}% -8px)`;
              });
            }
            if (cambio) actualizarProgreso();
          };

          const tween: gsap.core.Tween = gsap.to(robot, {
            motionPath: { path: ruta, type: 'cubic' },
            ease: 'none',
            onUpdate: () => {
              actualizar();
            },
            scrollTrigger: {
              trigger: sendero,
              start: 'top 80%',
              end: `top+=${centros[centros.length - 1].y} 40%`,
              scrub: 0.8,
              onToggle: () => actualizar(),
              onUpdate: () => {
                const x = Number(gsap.getProperty(robot, 'x'));
                const dx = x - xPrev;
                if (Math.abs(dx) > 0.3) {
                  girar(dx > 0 ? 1 : -1);
                  inclinar(gsap.utils.clamp(-10, 10, dx * 1.2));
                } else {
                  inclinar(0);
                }
                xPrev = x;
              },
            },
          });

          // Rebote constante (robot y estela) y sombra que se encoge cuando salta
          gsap.to(img, { y: -5, duration: 0.35, ease: 'sine.inOut', yoyo: true, repeat: -1 });
          if (sombra) gsap.to(sombra, { scaleX: 0.75, opacity: 0.45, duration: 0.35, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        });

        // Indicador de progreso fijo: visible solo mientras el mapa está en pantalla
        if (progreso && senderos.length) {
          if (progBarra) gsap.set(progBarra, { transformOrigin: 'top left', scaleY: 0, scaleX: 1 });
          ScrollTrigger.create({
            trigger: senderos[0],
            endTrigger: senderos[senderos.length - 1],
            start: 'top 70%',
            end: 'bottom 40%',
            onToggle: (self) => gsap.to(progreso, { autoAlpha: self.isActive ? 1 : 0, duration: 0.3, overwrite: 'auto' }),
          });
        }
        // Tarjetas: inclinación 3D siguiendo el cursor (solo con puntero fino)
        if (window.matchMedia('(hover: hover)').matches) {
          q('[data-gsap="tarjeta"]').forEach((el) => {
            const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' });
            const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' });
            gsap.set(el, { transformPerspective: 900 });
            el.addEventListener('pointermove', (e) => {
              const r = el.getBoundingClientRect();
              ry(((e as PointerEvent).clientX - r.left) / r.width * 12 - 6);
              rx(-(((e as PointerEvent).clientY - r.top) / r.height * 12 - 6));
            });
            el.addEventListener('pointerleave', () => {
              rx(0);
              ry(0);
            });
          });
        }
      });
    }, this.host.nativeElement);
  }

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
    const nodo = this.host.nativeElement.querySelector(`[data-paso="${id}"]`)
      ?.closest('[class*="flex-col"]')
      ?.querySelector('[data-gsap="nodo"]');
    if (nodo) {
      gsap.fromTo(nodo, { scale: 1.35 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    }
    const giro = this.host.nativeElement.querySelector(`[data-paso="${id}"]`);
    if (giro) {
      gsap.to(giro, {
        rotationY: this.esVolteada(id) ? 180 : 0,
        duration: 0.9,
        ease: 'back.out(1.2)',
        overwrite: true,
      });
    }
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
