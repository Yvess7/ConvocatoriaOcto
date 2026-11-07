import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

export type ModalidadTorneo = '' | 'mbot' | 'octostudio';

@Component({
  imports: [RouterLink],
  selector: 'app-registro',
  templateUrl: './registro.html',
})
export class RegistroComponent {
  modalidad = signal<ModalidadTorneo>('');

  seleccionarModalidad(valor: string): void {
    if (valor === 'mbot' || valor === 'octostudio') {
      this.modalidad.set(valor);
    } else {
      this.modalidad.set('');
    }
  }
}


