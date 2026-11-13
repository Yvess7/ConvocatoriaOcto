interface NavigationLink {
  readonly label: string;
  readonly path?: string;
  readonly fragment?: string;
}

interface NavigationGroup {
  readonly label: string;
  readonly path: string;
  readonly compact: boolean;
  readonly scrollable?: boolean;
  readonly links: readonly NavigationLink[];
}

/** Destinos compartidos por los menús de escritorio y móvil. */
export const navigation: {
  readonly home: { readonly label: string; readonly path: string };
  readonly groups: readonly NavigationGroup[];
  readonly registration: { readonly label: string; readonly path: string };
} = {
  home: { label: 'Robótica al Estilo Jalisco', path: '/' },
  groups: [
    {
      label: 'Documentación',
      path: '/documentacion',
      compact: true,
      scrollable: true,
      links: [
        { label: 'Premios', fragment: 'premios' },
        { label: 'Código de Conducta', fragment: 'codigo-conducta' },
        { label: 'Uso de Imagen', fragment: 'uso-de-imagen' },
        { label: 'Aviso de Privacidad', fragment: 'aviso-de-privacidad' },
      ],
    },
    {
      label: 'Videos',
      path: '/videos',
      compact: true,
      links: [
        { label: 'En Vivo', fragment: 'en-vivo' },
        { label: 'Shorts', fragment: 'shorts' },
        { label: 'Webinars', fragment: 'webinars' },
        { label: 'Videos', fragment: 'seccion-videos' },
        { label: 'Galería', fragment: 'galeria' },
      ],
    },
    {
      label: 'Novedades',
      path: '/novedades',
      compact: true,
      links: [],
    },
  ],
  registration: { label: 'Registro', path: '/registro' },
};
