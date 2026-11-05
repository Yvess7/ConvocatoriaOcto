import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RutaTorneoBase, TramoRuta } from '../shared/ruta-torneo';

@Component({
  imports: [RouterLink],
  selector: 'app-octostudio',
  templateUrl: './octostudio.html',
})
export class OctostudioComponent extends RutaTorneoBase {
  readonly tramos: TramoRuta[] = [
    {
      id: 'previo',
      insignia: 'Fase previa',
      titulo: 'Previo al torneo',
      subtitulo: 'Información, preparación y selección',
      pasos: [
        {
          id: 'lanzamiento',
          etiqueta: 'Previo · 01',
          titulo: 'Lanzamiento',
          resumen: 'Arranca la convocatoria oficial.',
          fecha: 'Fecha por confirmar',
          ruta: '/documentacion',
          fragmento: 'convocatoria',
          enlace: 'Ir a la Convocatoria',
        },
        {
          id: 'sesion-informativa',
          etiqueta: 'Previo · 02',
          titulo: 'Sesión informativa previa',
          resumen: 'Resuelve tus dudas antes de registrarte.',
          fecha: 'Fecha por confirmar',
          ruta: '/videos',
          fragmento: 'webinars',
          enlace: 'Ir a Webinars',
        },
        {
          id: 'sesion-preparacion',
          etiqueta: 'Previo · 03',
          titulo: 'Sesión de preparación',
          resumen: 'Explora OctoStudio y define tu idea.',
          fecha: 'Fecha por confirmar',
          ruta: '/videos',
          fragmento: 'seccion-videos',
          enlace: 'Ir a Videos',
        },
        {
          id: 'seleccion',
          etiqueta: 'Previo · 04',
          titulo: 'Etapa de selección',
          resumen: 'Prepara a tus participantes: cada escuela elige a sus alumnos.',
          fecha: 'Fecha por confirmar',
          ruta: '/documentacion',
          fragmento: 'reglamento',
          enlace: 'Ir al Reglamento',
        },
      ],
    },
    {
      id: 'torneo',
      insignia: 'Competencia',
      titulo: 'Torneo oficial OctoStudio',
      subtitulo: 'Tres etapas rumbo a la gran final',
      pasos: [
        {
          id: 'registro',
          etiqueta: 'Etapa 1',
          titulo: 'Registro de equipo',
          resumen: 'Inscribe a tu equipo.',
          fecha: 'Fecha por confirmar',
          ruta: '/documentacion',
          fragmento: 'registro',
          enlace: 'Ir al Registro',
        },
        {
          id: 'eliminatoria',
          etiqueta: 'Etapa 2',
          titulo: 'Eliminatoria',
          resumen: 'Presenta tu proyecto y avanza.',
          fecha: 'Fecha por confirmar',
          ruta: '/documentacion',
          fragmento: 'anexos',
          enlace: 'Ir a Anexos',
        },
        {
          id: 'gran-final',
          etiqueta: 'Etapa 3',
          titulo: 'Gran final',
          resumen: 'La muestra estatal de creatividad.',
          fecha: 'Fecha por confirmar',
          ruta: '/videos',
          fragmento: 'en-vivo',
          enlace: 'Ir a En Vivo',
          meta: true,
        },
      ],
    },
  ];
}
