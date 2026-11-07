import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  categoriasNovedades,
  novedades,
  novedadesDeEjemplo,
} from './novedades.data';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-novedades',
  templateUrl: './novedades.html',
})
export class NovedadesComponent {
  readonly categorias = categoriasNovedades;
  readonly esContenidoDeEjemplo = novedadesDeEjemplo;

  readonly publicaciones = [...novedades].sort((a, b) =>
    b.fecha.localeCompare(a.fecha),
  );
}
