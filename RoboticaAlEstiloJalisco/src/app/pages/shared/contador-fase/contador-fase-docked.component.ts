import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContadorFaseService } from './contador-fase.service';

@Component({
  selector: 'app-contador-fase-docked',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contador-fase-docked.component.html',
})
export class ContadorFaseDockedComponent {
  public contador = inject(ContadorFaseService);

  readonly colapsado = signal<boolean>(false);

  readonly visible = computed(() => this.contador.mostrarDocked());
  readonly progreso = computed(() => this.contador.progresoEnsamblaje());

  // Progreso por etapas para que el reloj se forme pieza por pieza al recibir el polvo/espagueti
  private etapa(inicio: number, fin: number): number {
    const p = this.progreso();
    if (p <= inicio) return 0;
    if (p >= fin) return 1;
    return (p - inicio) / (fin - inicio);
  }

  readonly shellProgress = computed(() => this.etapa(0.02, 0.65));
  readonly ringProgress = computed(() => this.etapa(0.15, 0.82));
  readonly daysProgress = computed(() => this.etapa(0.28, 0.85));
  readonly phaseProgress = computed(() => this.etapa(0.42, 0.88));
  readonly hProgress = computed(() => this.etapa(0.52, 0.92));
  readonly mProgress = computed(() => this.etapa(0.64, 0.96));
  readonly sProgress = computed(() => this.etapa(0.74, 1.0));

  // El arco naranja se dibuja en tiempo real mientras las hebras naranjas se enrollan en la esquina
  readonly ringOffsetDinamico = computed(() => {
    const rp = this.ringProgress();
    const targetOffset = this.contador.progresoOffset();
    return 100 - (100 - targetOffset) * rp;
  });

  // Resplandor y marco activo mientras las piezas geométricas forjan el reloj
  readonly forjandoActivo = computed(() => {
    const p = this.progreso();
    return p > 0.02 && p < 0.98;
  });

  // Desplazamiento elástico y rotación de entrada hasta acoplarse en la esquina inferior derecha
  readonly capsuleTransform = computed(() => {
    const p = this.progreso();
    if (p <= 0.01) {
      return 'translate3d(-36px, -54px, 0) scale(0.72) rotate(-6deg)';
    }
    if (p >= 0.99) {
      return 'translate3d(0, 0, 0) scale(1) rotate(0deg)';
    }
    const inv = 1 - p;
    const easeOut = 1 - inv * inv * inv;
    const wave = Math.sin(p * Math.PI);
    const tx = -36 * (1 - easeOut);
    const ty = -54 * (1 - easeOut) + wave * 6;
    const scale = 0.72 + 0.28 * easeOut + wave * 0.05;
    const rot = -6 * (1 - easeOut);
    return `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${scale.toFixed(3)}) rotate(${rot.toFixed(2)}deg)`;
  });

  alternarColapso(): void {
    this.colapsado.update((v) => !v);
  }
}
