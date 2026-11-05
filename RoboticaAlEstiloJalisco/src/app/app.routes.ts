import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { TorneosComponent } from './pages/torneos/torneos';
import { DocumentacionComponent } from './pages/documentacion/documentacion';
import { VideosComponent } from './pages/videos/videos';
import { MbotComponent } from './pages/mbot/mbot';
import { OctostudioComponent } from './pages/octostudio/octostudio';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'torneos', component: TorneosComponent },
  { path: 'torneos/mbot', component: MbotComponent },
  { path: 'torneos/octostudio', component: OctostudioComponent },
  { path: 'mbot', component: MbotComponent },
  { path: 'octostudio', component: OctostudioComponent },
  { path: 'documentacion', component: DocumentacionComponent },
  { path: 'videos', component: VideosComponent },
  { path: '**', redirectTo: '' },
];
