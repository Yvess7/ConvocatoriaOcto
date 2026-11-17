import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { categoriasNovedades } from './novedades.data';
import { NovedadesService } from './novedades.service';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-novedades',
  templateUrl: './novedades.html',
})
export class NovedadesComponent {
  private readonly novedadesService = inject(NovedadesService);

  readonly categorias = categoriasNovedades;
  readonly esContenidoDeEjemplo = this.novedadesService.esContenidoDeEjemplo;
  readonly publicaciones = this.novedadesService.publicaciones;
}
