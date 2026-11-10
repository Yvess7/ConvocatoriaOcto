import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  DueloEliminatoria,
  EquipoClasificacion,
  RutaTorneoBase,
  TramoRuta,
} from '../shared/ruta-torneo';

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
      subtitulo: 'Información, capacitación y selección escolar',
      pasos: [
        {
          id: 'lanzamiento',
          etiqueta: 'Previo · 01',
          titulo: 'Lanzamiento oficial',
          resumen: 'Publicación de la convocatoria estatal e inicio de difusión institucional.',
          fecha: '03 de noviembre de 2026',
          ruta: '/octostudio',
          fragmento: 'convocatoria-octostudio',
          enlace: 'Ir a la Convocatoria',
        },
        {
          id: 'sesion-informativa',
          etiqueta: 'Previo · 02',
          titulo: 'Sesión informativa previa',
          resumen: 'Sesión virtual obligatoria para directivos, docentes y personal de escuelas interesadas.',
          fecha: '24 de noviembre de 2026',
          ruta: '/videos',
          fragmento: 'webinars',
          enlace: 'Ir a Webinars',
        },
        {
          id: 'sesion-preparacion',
          etiqueta: 'Previo · 03',
          titulo: 'Sesión de preparación',
          resumen: 'Capacitación virtual sobre el uso de OctoStudio y el eje «Jalisco Verde y Sustentable».',
          fecha: '01 de diciembre de 2026',
          ruta: '/videos',
          fragmento: 'seccion-videos',
          enlace: 'Ir a Videos',
        },
        {
          id: 'seleccion',
          etiqueta: 'Previo · 04',
          titulo: 'Selección escolar interna',
          resumen: 'Cada CCT realiza su muestra interna y elige a su equipo representativo mixto de 3 alumnos.',
          fecha: '02 dic 2026 - 25 ene 2027',
          ruta: '/octostudio',
          fragmento: 'reglamento-octostudio',
          enlace: 'Ir al Reglamento',
        },
      ],
    },
    {
      id: 'torneo',
      insignia: 'Competencia',
      titulo: 'Torneo oficial OctoStudio',
      subtitulo: 'Etapas de evaluación regional y gran final estatal',
      pasos: [
        {
          id: 'registro',
          etiqueta: 'Etapa 1',
          titulo: 'Registro de equipo y padrón MIR',
          resumen: 'Carga de expediente del equipo mixto y relación nominal oficial en la plataforma.',
          fecha: '02 dic 2026 - 25 ene 2027',
          ruta: '/registro',
          fragmento: '',
          enlace: 'Ir al Registro',
        },
        {
          id: 'eliminatoria',
          etiqueta: 'Etapa 2',
          titulo: 'Eliminatoria regional asíncrona',
          resumen: 'Carga del proyecto .octostudio, bitácora de 1 página y video de 3 minutos para doble evaluación ciega.',
          fecha: '02 feb - 05 mar 2027',
          ruta: '/octostudio',
          fragmento: 'clasificacion-octostudio',
          enlace: 'Ver Clasificación y Llaves',
        },
        {
          id: 'gran-final',
          etiqueta: 'Etapa 3',
          titulo: 'Gran final estatal presencial',
          resumen: 'Hackatón, pitch oral de 3 minutos, defensa técnica ante jurado y ceremonia de premiación.',
          fecha: '31 mar, 01 y 02 abr 2027',
          ruta: '/videos',
          fragmento: 'en-vivo',
          enlace: 'Ir a En Vivo',
          meta: true,
        },
      ],
    },
  ];

  readonly equiposPlayIn: EquipoClasificacion[] = Array.from({ length: 32 }, (_, index) => ({
    id: `eq-${index + 1}`,
    posicion: index + 1,
    nombre: 'Por definir',
    escuela: 'Por definir',
    municipio: 'Por definir',
    nivel: 'Primaria',
    puntosTotales: 0,
    metricaExtra: 'Por definir',
    estado: index < 16 ? 'Clasificado' : 'Eliminado',
    resumen: 'Resultados pendientes de evaluación oficial.',
    desglose: [
      { concepto: 'Lógica de Programación y Eventos', detalle: 'Por definir', puntos: 0, maximo: 35 },
      { concepto: 'Narrativa e Impacto Comunitario', detalle: 'Por definir', puntos: 0, maximo: 30 },
      { concepto: 'Originalidad Visual y Sonora', detalle: 'Por definir', puntos: 0, maximo: 20 },
      { concepto: 'Exposición Oral y Demostración', detalle: 'Por definir', puntos: 0, maximo: 15 },
    ],
  }));

  readonly octavosFinal: DueloEliminatoria[] = Array.from({ length: 8 }, (_, index) => ({
    id: `of-${index + 1}`,
    codigo: `Octavos ${index + 1}`,
    horario: 'Por definir',
    competidorA: {
      equipoId: `eq-${index + 1}`,
      semilla: index + 1,
      nombre: 'Por definir',
      escuela: 'Por definir',
      puntaje: '0',
    },
    competidorB: {
      equipoId: `eq-${16 - index}`,
      semilla: 16 - index,
      nombre: 'Por definir',
      escuela: 'Por definir',
      puntaje: '0',
    },
  }));

  readonly cuartosFinal: DueloEliminatoria[] = Array.from({ length: 4 }, (_, index) => ({
    id: `qf-${index + 1}`,
    codigo: `Cuartos ${index + 1}`,
    horario: 'Por definir',
    competidorA: {
      equipoId: `eq-${index * 2 + 1}`,
      semilla: index * 2 + 1,
      nombre: 'Por definir',
      escuela: 'Por definir',
      puntaje: '0',
    },
    competidorB: {
      equipoId: `eq-${index * 2 + 2}`,
      semilla: index * 2 + 2,
      nombre: 'Por definir',
      escuela: 'Por definir',
      puntaje: '0',
    },
  }));

  readonly semifinales: DueloEliminatoria[] = [
    {
      id: 'sf-1',
      codigo: 'Semifinal 1',
      horario: 'Por definir',
      competidorA: { equipoId: 'eq-1', semilla: 1, nombre: 'Por definir', escuela: 'Por definir', puntaje: '0' },
      competidorB: { equipoId: 'eq-4', semilla: 4, nombre: 'Por definir', escuela: 'Por definir', puntaje: '0' },
    },
    {
      id: 'sf-2',
      codigo: 'Semifinal 2',
      horario: 'Por definir',
      competidorA: { equipoId: 'eq-2', semilla: 2, nombre: 'Por definir', escuela: 'Por definir', puntaje: '0' },
      competidorB: { equipoId: 'eq-3', semilla: 3, nombre: 'Por definir', escuela: 'Por definir', puntaje: '0' },
    },
  ];

  readonly granFinal: DueloEliminatoria = {
    id: 'gf-1',
    codigo: 'Gran Final',
    horario: 'Por definir',
    competidorA: { equipoId: 'eq-1', semilla: 1, nombre: 'Por definir', escuela: 'Por definir', puntaje: '0' },
    competidorB: { equipoId: 'eq-2', semilla: 2, nombre: 'Por definir', escuela: 'Por definir', puntaje: '0' },
  };
}
