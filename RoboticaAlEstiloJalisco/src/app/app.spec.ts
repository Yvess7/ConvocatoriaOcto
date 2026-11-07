import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

const expectedMenuUrls = [
  '/torneos',
  '/mbot',
  '/octostudio',
  '/documentacion',
  '/documentacion#premios',
  '/documentacion#codigo-conducta',
  '/documentacion#uso-de-imagen',
  '/documentacion#aviso-de-privacidad',
  '/videos',
  '/videos#en-vivo',
  '/videos#shorts',
  '/videos#webinars',
  '/videos#seccion-videos',
  '/videos#galeria',
  '/novedades',
  '/registro',
];

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let element: HTMLElement;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(App);
    element = fixture.nativeElement;
    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function menuButton(): HTMLButtonElement {
    return element.querySelector('button[aria-controls="mobile-navigation"]')!;
  }

  function openMobileMenu(): HTMLElement {
    menuButton().click();
    fixture.detectChanges();
    return element.querySelector('#mobile-navigation')!;
  }

  it('renders the home page and the site name', () => {
    expect(element.querySelector('main h1')?.textContent).toContain('Robótica al Estilo Jalisco');
    expect(element.querySelector('a[aria-label="Inicio"]')?.textContent).toContain(
      'Robótica al Estilo Jalisco',
    );
  });

  it('renders the same destinations once per menu, including section fragments', () => {
    const mobile = openMobileMenu();
    const desktop = element.querySelector('[data-navigation="desktop"]')!;
    const urls = (menu: Element) =>
      Array.from(menu.querySelectorAll('a'), (link) => link.getAttribute('href'));

    expect(urls(desktop)).toEqual(expectedMenuUrls);
    expect(urls(mobile)).toEqual(expectedMenuUrls);
    expect(new Set(urls(mobile)).size).toBe(expectedMenuUrls.length);
  });

  it('opens and closes the mobile menu with its button and the Escape key', () => {
    expect(element.querySelector('#mobile-navigation')).toBeNull();
    expect(menuButton().getAttribute('aria-expanded')).toBe('false');

    openMobileMenu();
    expect(menuButton().getAttribute('aria-expanded')).toBe('true');
    expect(menuButton().getAttribute('aria-label')).toBe('Cerrar menú de navegación');

    menuButton().click();
    fixture.detectChanges();
    expect(element.querySelector('#mobile-navigation')).toBeNull();

    openMobileMenu().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(element.querySelector('#mobile-navigation')).toBeNull();
    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
  });

  it.each(['/documentacion', '/documentacion#premios', '/videos#webinars', '/novedades', '/registro'])(
    'navigates to %s and closes the mobile menu',
    async (url) => {
      const menu = openMobileMenu();
      menu.querySelector<HTMLAnchorElement>(`a[href="${url}"]`)!.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(router.url).toBe(url);
      expect(element.querySelector('#mobile-navigation')).toBeNull();
      expect(menuButton().getAttribute('aria-expanded')).toBe('false');
      const fragment = url.split('#')[1];
      if (fragment) {
        expect(element.querySelector(`#${fragment}`)).not.toBeNull();
      }
    },
  );
});
