import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { TorneosComponent } from './pages/torneos/torneos';
import { DocumentacionComponent } from './pages/documentacion/documentacion';
import { VideosComponent } from './pages/videos/videos';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'torneos', component: TorneosComponent },
  { path: 'documentacion', component: DocumentacionComponent },
  { path: 'videos', component: VideosComponent },
  { path: '**', redirectTo: '' },
];
