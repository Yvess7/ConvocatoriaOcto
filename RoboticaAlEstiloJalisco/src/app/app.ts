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
import { navigation } from './navigation';
import { ContadorFaseDockedComponent } from './pages/shared/contador-fase/contador-fase-docked.component';

@Component({
  imports: [RouterLink, RouterOutlet, ContadorFaseDockedComponent],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private observer?: IntersectionObserver;

  readonly navigation = navigation;
  readonly isMenuOpen = signal(false);
  readonly pageAnimating = signal(true);
  readonly activeDropdown = signal<string | null>(null);

  constructor() {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.closeAllDropdowns();
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
      }
    });

    afterNextRender(() => {
      this.setupScrollAnimations();
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

  openDropdown(path: string): void {
    this.activeDropdown.set(path);
  }

  closeDropdown(path?: string): void {
    if (!path || this.activeDropdown() === path) {
      this.activeDropdown.set(null);
    }
  }

  closeAllDropdowns(): void {
    this.activeDropdown.set(null);
    this.isMenuOpen.set(false);
  }

  onFocusOut(event: FocusEvent, path: string): void {
    const currentTarget = event.currentTarget as HTMLElement | null;
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    if (!currentTarget || !relatedTarget || !currentTarget.contains(relatedTarget)) {
      this.closeDropdown(path);
    }
  }

  private setupScrollAnimations(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const selector = '.reveal, .reveal-left, .reveal-right, .apple-zoom';

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
      },
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
