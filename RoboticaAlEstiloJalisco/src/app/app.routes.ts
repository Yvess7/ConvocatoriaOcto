import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { TorneosComponent } from './pages/torneos/torneos';
import { DocumentacionComponent } from './pages/documentacion/documentacion';
import { VideosComponent } from './pages/videos/videos';
import { MbotComponent } from './pages/mbot/mbot';
import { OctostudioComponent } from './pages/octostudio/octostudio';
import { RegistroComponent } from './pages/registro/registro';
import { NovedadesComponent } from './pages/novedades/novedades';
import { AvisoPrivacidadComponent } from './pages/aviso-privacidad/aviso-privacidad';
import { TerminosCondicionesComponent } from './pages/terminos-condiciones/terminos-condiciones';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'torneos', component: TorneosComponent },
  { path: 'torneos/mbot', component: MbotComponent },
  { path: 'torneos/octostudio', component: OctostudioComponent },
  { path: 'mbot', component: MbotComponent },
  { path: 'octostudio', component: OctostudioComponent },
  { path: 'documentacion', component: DocumentacionComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'videos', component: VideosComponent },
  { path: 'novedades', component: NovedadesComponent, title: 'Novedades | Robótica al Estilo Jalisco' },
  { path: 'aviso-privacidad', component: AvisoPrivacidadComponent, title: 'Aviso de Privacidad | Robótica al Estilo Jalisco' },
  { path: 'terminos-condiciones', component: TerminosCondicionesComponent, title: 'Términos y Condiciones | Robótica al Estilo Jalisco' },
  { path: '**', redirectTo: '' },
];
