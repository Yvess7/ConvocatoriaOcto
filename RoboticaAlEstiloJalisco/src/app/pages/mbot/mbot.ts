import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  DueloEliminatoria,
  EquipoClasificacion,
  RutaTorneoBase,
  TramoRuta,
} from '../shared/ruta-torneo';
import { FondoDetalle } from '../shared/camino-base';

@Component({
  imports: [RouterLink],
  selector: 'app-mbot',
  templateUrl: './mbot.html',
})
export class MbotComponent extends RutaTorneoBase {
  readonly acento = 'sky' as const;
  readonly semilla = 3;

  /** Colores de las bandas de cada etapa del camino. */
  readonly colores = ['#e81a4f', '#0284c7', '#f6842b', '#0284c7', '#e81a4f', '#f6842b', '#e81a4f'];

  /** Etapas con contenido propio y el color de fondo con el que empiezan y terminan. */
  readonly fondos: Record<string, FondoDetalle> = {
    lanzamiento: { inicio: '#f6842b', fin: '#ffffff' },
    eliminatoria: { inicio: '#f0f9ff', fin: '#f0f9ff' },
  };

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
          titulo: 'Convocatoria',
          resumen: 'Arranca la convocatoria oficial.',
          fecha: 'Fecha por confirmar',
          ruta: '/mbot',
          fragmento: 'convocatoria-mbot',
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
          resumen: 'Practica con los retos del torneo.',
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
          ruta: '/mbot',
          fragmento: 'reglamento-mbot',
          enlace: 'Ir al Reglamento',
        },
      ],
    },
    {
      id: 'torneo',
      insignia: 'Competencia',
      titulo: 'Torneo oficial mBot',
      subtitulo: 'Tres etapas rumbo a la gran final',
      pasos: [
        {
          id: 'registro',
          etiqueta: 'Etapa 1',
          titulo: 'Registro de equipo',
          resumen: 'Inscribe a tu equipo.',
          fecha: 'Fecha por confirmar',
          ruta: '/registro',
          fragmento: '',
          enlace: 'Ir al Registro',
        },
        {
          id: 'eliminatoria',
          etiqueta: 'Etapa 2',
          titulo: 'Eliminatoria',
          resumen: 'Compite en el Play-In por un lugar en las llaves finales.',
          fecha: 'Fecha por confirmar',
          ruta: '/mbot',
          fragmento: 'clasificacion-mbot',
          enlace: 'Ver Clasificación y Llaves',
        },
        {
          id: 'gran-final',
          etiqueta: 'Etapa 3',
          titulo: 'Gran final',
          resumen: 'El encuentro estatal de campeones.',
          fecha: 'Fecha por confirmar',
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
      { concepto: 'Velocidad y Tramo en Pista', detalle: 'Por definir', puntos: 0, maximo: 40 },
      { concepto: 'Librado de Obstáculos', detalle: 'Por definir', puntos: 0, maximo: 25 },
      { concepto: 'Algoritmo y Bitácora', detalle: 'Por definir', puntos: 0, maximo: 25 },
      { concepto: 'Ejecución sin Penalización', detalle: 'Por definir', puntos: 0, maximo: 10 },
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
