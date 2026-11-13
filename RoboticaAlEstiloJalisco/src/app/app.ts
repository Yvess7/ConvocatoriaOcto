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
import { HalftoneTransitionService } from './pages/shared/halftone-transition.service';

@Component({
  imports: [RouterLink, RouterOutlet, ContadorFaseDockedComponent],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly halftone = inject(HalftoneTransitionService);
  private observer?: IntersectionObserver;

  readonly navigation = navigation;
  readonly isMenuOpen = signal(false);
  readonly pageAnimating = signal(true);
  readonly activeDropdown = signal<string | null>(null);

  private readonly onGlobalLinkClick = (event: MouseEvent): void => {
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    const anchor = (event.target as HTMLElement | null)?.closest('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;

    const targetAttr = anchor.getAttribute('target');
    if (targetAttr && targetAttr !== '_self') return;
    if (anchor.hasAttribute('download')) return;

    const rawHref = anchor.getAttribute('href');
    if (!rawHref || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') || rawHref.startsWith('javascript:')) {
      return;
    }

    let url: URL;
    try {
      url = new URL(anchor.href, window.location.origin);
    } catch {
      return;
    }

    if (url.origin !== window.location.origin) return;
    if (/\.pdf($|\?)/i.test(url.pathname)) return;

    const targetPath = url.pathname;
    const targetFragment = url.hash ? url.hash.slice(1) : null;
    const currentPath = window.location.pathname;

    if (targetPath === currentPath && !targetFragment && window.scrollY <= 10) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (this.halftone.isBusy) {
      return;
    }

    this.closeAllDropdowns();
    anchor.blur?.();

    const rect = anchor.getBoundingClientRect();
    const ox = rect.width > 0 ? rect.left + rect.width / 2 : event.clientX || window.innerWidth / 2;
    const oy = rect.height > 0 ? rect.top + rect.height / 2 : event.clientY || window.innerHeight / 2;
    const color = this.halftone.colorForTarget(targetPath, targetFragment);
    const targetUrl = `${targetPath}${url.search}${targetFragment ? `#${targetFragment}` : ''}`;

    this.halftone.run(ox, oy, color, async () => {
      document.documentElement.style.scrollBehavior = 'auto';
      if (targetPath !== currentPath || url.search !== window.location.search) {
        await this.router.navigateByUrl(targetUrl);
      } else if (targetFragment) {
        await this.router.navigate([], { fragment: targetFragment });
      }
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (targetFragment) {
              document.getElementById(targetFragment)?.scrollIntoView({ behavior: 'instant', block: 'start' });
            } else {
              window.scrollTo({ top: 0, behavior: 'instant' });
            }
            document.documentElement.style.scrollBehavior = '';
            resolve();
          });
        });
      });
    });
  };

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
      document.addEventListener('click', this.onGlobalLinkClick, true);
    });

    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
      if (typeof document !== 'undefined') {
        document.removeEventListener('click', this.onGlobalLinkClick, true);
      }
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
