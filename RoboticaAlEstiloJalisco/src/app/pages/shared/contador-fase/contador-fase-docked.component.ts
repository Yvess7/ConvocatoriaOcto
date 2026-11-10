import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContadorFaseService } from './contador-fase.service';

@Component({
  selector: 'app-contador-fase-docked',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contador-fase-docked.component.html',
})
export class ContadorFaseDockedComponent {
  public contador = inject(ContadorFaseService);

  readonly colapsado = signal<boolean>(false);

  readonly visible = computed(() => this.contador.mostrarDocked());

  alternarColapso(): void {
    this.colapsado.update((v) => !v);
  }
}

