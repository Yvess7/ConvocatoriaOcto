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

  @Input() set fase(val: string) {
    if (val) this.contador.configurarDesdeApi({ fase: val });
  }
  @Input() set inicio(val: string) {
    if (val) this.contador.configurarDesdeApi({ inicio: val });
  }
  @Input() set fecha(val: string) {
    if (val) this.contador.configurarDesdeApi({ fecha: val });
  }
  @Input() set titulo(val: string) {
    if (val) this.contador.configurarDesdeApi({ titulo: val });
  }
  @Input() set terminado(val: string) {
    if (val) this.contador.configurarDesdeApi({ terminado: val });
  }

  ngOnInit(): void {}

  public configurarTiempo(datos: DatosContador): void {
    this.contador.configurarDesdeApi(datos);
  }
}
