import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { VideosComponent } from './pages/videos/videos';
import { MbotComponent } from './pages/mbot/mbot';
import {
  Anexo1Component,
  Anexo2Component,
  Anexo3Component,
  Anexo4Component,
  Anexo6Component,
} from './pages/mbot/anexos/anexos';
import { OctostudioComponent } from './pages/octostudio/octostudio';
import { RegistroComponent } from './pages/registro/registro';
import { NovedadesComponent } from './pages/novedades/novedades';
import { AvisoPrivacidadComponent } from './pages/aviso-privacidad/aviso-privacidad';
import { TerminosCondicionesComponent } from './pages/terminos-condiciones/terminos-condiciones';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'torneos', redirectTo: '', pathMatch: 'full' },
  { path: 'torneos/mbot', redirectTo: 'mbot', pathMatch: 'full' },
  { path: 'torneos/octostudio', redirectTo: 'octostudio', pathMatch: 'full' },
  { path: 'mbot', component: MbotComponent },
  { path: 'mbot/anexo-1', component: Anexo1Component, title: 'Anexo 1 · mBot1 | Robótica al Estilo Jalisco' },
  { path: 'mbot/anexo-2', component: Anexo2Component, title: 'Anexo 2 · Seguidor de Línea | Robótica al Estilo Jalisco' },
  { path: 'mbot/anexo-3', component: Anexo3Component, title: 'Anexo 3 · Sumo | Robótica al Estilo Jalisco' },
  { path: 'mbot/anexo-4', component: Anexo4Component, title: 'Anexo 4 · Laberinto | Robótica al Estilo Jalisco' },
  { path: 'mbot/anexo-6', component: Anexo6Component, title: 'Anexo 6 · Bitácora | Robótica al Estilo Jalisco' },
  { path: 'octostudio', component: OctostudioComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'videos', component: VideosComponent },
  { path: 'novedades', component: NovedadesComponent, title: 'Novedades | Robótica al Estilo Jalisco' },
  { path: 'aviso-privacidad', component: AvisoPrivacidadComponent, title: 'Aviso de Privacidad | Robótica al Estilo Jalisco' },
  { path: 'terminos-condiciones', component: TerminosCondicionesComponent, title: 'Términos y Condiciones | Robótica al Estilo Jalisco' },
  { path: '**', redirectTo: '' },
];
