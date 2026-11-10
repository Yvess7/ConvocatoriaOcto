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

  constructor() {
    afterNextRender(() => {
      this.iniciarAnimacionSpaghetti();
    });

    this.destroyRef.onDestroy(() => {
      this.ctx?.revert();
    });
  }

  private iniciarAnimacionSpaghetti(): void {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    this.ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const root = this.host.nativeElement as HTMLElement;
        const banner = root.querySelector('#hero-banner') || root.querySelector('section');
        const widget =
          root.querySelector('#contador-hero-container') ||
          root.querySelector('[data-contador="hero-widget"]') ||
          root.querySelector('app-contador-fase');

        if (!banner || !widget) return;

        // Aseguramos estado inicial limpio: visible, sin deformación y sin widget docked al inicio
        gsap.set(widget, {
          transformOrigin: '90% 90%',
          opacity: 1,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          x: 0,
          y: 0,
          filter: 'blur(0px)',
          willChange: 'transform, opacity, filter',
        });

        if (window.scrollY < 200) {
          this.contadorService.setMostrarDockedEnHome(false);
        }

        // Timeline de espaguetización / vórtice vinculada fluidamente al scroll
        // Inicia desde más abajo (tras haber scrolleado 220px) para no oscurecerse de inmediato al entrar
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: banner,
            start: 'top -220px',
            end: 'bottom 20%',
            scrub: 1,
            onUpdate: (self) => {
              // Solo se activa el contador en la esquina cuando el del banner prácticamente terminó su transición
              const debeMostrarDocked = self.progress >= 0.85;
              this.contadorService.setMostrarDockedEnHome(debeMostrarDocked);
            },
            onLeave: () => {
              this.contadorService.setMostrarDockedEnHome(true);
            },
            onEnterBack: () => {
              this.contadorService.setMostrarDockedEnHome(false);
            },
          },
        });

        // 1. Fase sutil de anticipación y estiramiento progresivo (sin oscurecer bruscamente)
        tl.to(widget, {
          scaleX: 0.8,
          scaleY: 1.25,
          rotation: 8,
          duration: 0.35,
          ease: 'power1.out',
        })
        // 2. Colapso hacia el vórtice gravitacional: espaguetización intensa y disolución en polvo
        .to(widget, {
          scaleX: 0.05,
          scaleY: 2.6,
          rotation: 36,
          x: 160,
          y: 190,
          opacity: 0,
          filter: 'blur(16px)',
          duration: 0.65,
          ease: 'power2.in',
        });

        ScrollTrigger.refresh();
      });
    }, this.host.nativeElement);
  }
}
