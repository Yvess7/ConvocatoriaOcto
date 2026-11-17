import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContadorFaseService, DatosContador } from './contador-fase.service';

@Component({
  selector: 'app-contador-fase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contador-fase.component.html',
})
export class ContadorFaseComponent implements OnInit {
  public contador = inject(ContadorFaseService);

  @Input() set fase(val: string | undefined) {
    if (val) this.contador.configurarDesdeApi({ fase: val });
  }
  @Input() set inicio(val: string | undefined) {
    if (val) this.contador.configurarDesdeApi({ inicio: val });
  }
  @Input() set fecha(val: string | undefined) {
    if (val) this.contador.configurarDesdeApi({ fecha: val });
  }
  @Input() set titulo(val: string | undefined) {
    if (val) this.contador.configurarDesdeApi({ titulo: val });
  }
  @Input() set terminado(val: string | undefined) {
    if (val) this.contador.configurarDesdeApi({ terminado: val });
  }

  private readonly etapas: Record<string, string> = {
    inscripcion: 'Etapa de inscripción',
    preparacion: 'Etapa de preparación',
    competencia: 'Etapa de competencia',
  };

  get etapaTitulo(): string {
    const etapa = this.contador.etapaActual();
    return this.etapas[etapa] ?? etapa;
  }

  get etapaPalabras(): { letras: string[]; inicio: number }[] {
    let acumulado = 0;
    return this.etapaTitulo.split(' ').map((p) => {
      const palabra = { letras: Array.from(p), inicio: acumulado };
      acumulado += p.length + 1;
      return palabra;
    });
  }

  ngOnInit(): void {}

  public configurarTiempo(datos: DatosContador): void {
    this.contador.configurarDesdeApi(datos);
  }
}
