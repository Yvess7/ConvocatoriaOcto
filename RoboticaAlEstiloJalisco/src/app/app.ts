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
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    this.observer?.disconnect();

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else if (entry.boundingClientRect.top > 0) {
            entry.target.classList.remove('is-visible');
          }
        }
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    setTimeout(() => {
      const elements = document.querySelectorAll(
        '.reveal, .reveal-left, .reveal-right, .apple-reveal, .apple-zoom'
      );
      elements.forEach((el) => this.observer?.observe(el));
    }, 40);
  }
}
