import { afterNextRender, Component, DestroyRef, inject, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  imports: [RouterLink, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private observer?: IntersectionObserver;

  readonly isMenuOpen = signal(false);
  readonly isNavigating = signal(false);
  readonly pageAnimating = signal(true);

  constructor() {
    afterNextRender(() => {
      this.setupScrollAnimations();

      this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.isNavigating.set(true);
          this.pageAnimating.set(false);
        } else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          requestAnimationFrame(() => {
            this.pageAnimating.set(true);
            this.setupScrollAnimations();
          });
          setTimeout(() => {
            this.isNavigating.set(false);
          }, 420);
        }
      });
    });

    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
    });
  }

  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  private setupScrollAnimations(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const selector = '.reveal, .reveal-left, .reveal-right, .apple-reveal, .apple-zoom';

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll(selector).forEach((el) => el.classList.add('is-visible'));
      return;
    }

    this.observer?.disconnect();

    // Cada elemento se revela una sola vez y nunca se vuelve a ocultar (evita parpadeos).
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -5% 0px',
      }
    );

    // El DOM de la nueva ruta puede tardar en renderizarse: se observa varias veces
    // (los elementos ya observados se ignoran) para no dejar contenido invisible.
    const observeAll = () => {
      document.querySelectorAll(selector).forEach((el) => {
        if (!el.classList.contains('is-visible')) {
          this.observer?.observe(el);
        }
      });
    };
    [40, 250, 700].forEach((ms) => setTimeout(observeAll, ms));
  }
}
