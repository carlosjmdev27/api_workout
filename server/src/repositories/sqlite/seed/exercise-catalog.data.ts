import type { Equipment, MuscleGroup } from '@gym/shared';

type Entry = readonly [name: string, equipment: Equipment | null];

/**
 * Curated base catalog (Spanish names), grouped by muscle group.
 * Append new entries freely: the seed inserts only the ones missing (by normalized name).
 */
export const BASE_CATALOG: Readonly<Record<MuscleGroup, readonly Entry[]>> = {
  Pecho: [
    ['Press de banca con barra', 'Barra'], ['Press de banca con mancuernas', 'Mancuernas'],
    ['Press inclinado con barra', 'Barra'], ['Press inclinado con mancuernas', 'Mancuernas'],
    ['Press declinado con barra', 'Barra'], ['Press de banca en multipower', 'Máquina'],
    ['Press de pecho en máquina', 'Máquina'], ['Press inclinado en máquina', 'Máquina'],
    ['Press con mancuernas en suelo', 'Mancuernas'], ['Aperturas con mancuernas', 'Mancuernas'],
    ['Aperturas inclinadas con mancuernas', 'Mancuernas'], ['Cruce de poleas', 'Polea'],
    ['Aperturas en polea baja', 'Polea'], ['Contractor de pecho (pec deck)', 'Máquina'],
    ['Fondos en paralelas para pecho', 'Peso Corporal'], ['Flexiones', 'Peso Corporal'],
    ['Pullover con mancuerna', 'Mancuernas'],
  ],
  Espalda: [
    ['Dominadas', 'Peso Corporal'], ['Dominadas lastradas', 'Peso Corporal'],
    ['Dominadas supinas', 'Peso Corporal'], ['Jalón al pecho', 'Polea'],
    ['Jalón al pecho agarre estrecho', 'Polea'], ['Remo con barra', 'Barra'],
    ['Remo Pendlay', 'Barra'], ['Remo con mancuerna a una mano', 'Mancuernas'],
    ['Remo en polea baja', 'Polea'], ['Remo en máquina', 'Máquina'], ['Remo en barra T', 'Barra'],
    ['Remo Meadows', 'Barra'], ['Peso muerto convencional', 'Barra'], ['Rack pull', 'Barra'],
    ['Pullover en polea alta', 'Polea'], ['Remo invertido', 'Peso Corporal'],
    ['Hiperextensiones', 'Peso Corporal'], ['Encogimientos con barra', 'Barra'],
    ['Encogimientos con mancuernas', 'Mancuernas'],
  ],
  Pierna: [
    ['Sentadilla trasera con barra', 'Barra'], ['Sentadilla frontal', 'Barra'],
    ['Sentadilla goblet', 'Mancuernas'], ['Sentadilla hack', 'Máquina'],
    ['Sentadilla en multipower', 'Máquina'], ['Sentadilla búlgara', 'Mancuernas'],
    ['Sentadilla sissy', 'Peso Corporal'], ['Zancadas con mancuernas', 'Mancuernas'],
    ['Zancadas con barra', 'Barra'], ['Step-up con mancuernas', 'Mancuernas'],
    ['Prensa de piernas', 'Máquina'], ['Extensión de cuádriceps', 'Máquina'],
    ['Curl femoral tumbado', 'Máquina'], ['Curl femoral sentado', 'Máquina'],
    ['Peso muerto rumano', 'Barra'], ['Peso muerto rumano con mancuernas', 'Mancuernas'],
    ['Peso muerto sumo', 'Barra'], ['Buenos días', 'Barra'], ['Hip thrust con barra', 'Barra'],
    ['Puente de glúteo', 'Peso Corporal'], ['Patada de glúteo en polea', 'Polea'],
    ['Abducción de cadera en máquina', 'Máquina'], ['Aducción de cadera en máquina', 'Máquina'],
    ['Elevación de gemelos de pie', 'Máquina'], ['Elevación de gemelos sentado', 'Máquina'],
  ],
  Hombro: [
    ['Press militar con barra', 'Barra'], ['Press de hombros con mancuernas', 'Mancuernas'],
    ['Press Arnold', 'Mancuernas'], ['Press de hombros en máquina', 'Máquina'],
    ['Push press', 'Barra'], ['Elevaciones laterales con mancuernas', 'Mancuernas'],
    ['Elevaciones laterales en polea', 'Polea'], ['Elevaciones laterales en máquina', 'Máquina'],
    ['Elevaciones frontales con mancuernas', 'Mancuernas'], ['Elevaciones en Y en banco inclinado', 'Mancuernas'],
    ['Pájaros con mancuernas', 'Mancuernas'], ['Deltoide posterior en máquina', 'Máquina'],
    ['Cruce inverso en polea', 'Polea'], ['Face pull', 'Polea'], ['Remo al mentón', 'Barra'],
  ],
  Bíceps: [
    ['Curl con barra', 'Barra'], ['Curl con barra Z', 'Barra'], ['Curl con mancuernas', 'Mancuernas'],
    ['Curl martillo', 'Mancuernas'], ['Curl inclinado con mancuernas', 'Mancuernas'],
    ['Curl concentrado', 'Mancuernas'], ['Curl araña', 'Mancuernas'], ['Curl en banco Scott', 'Barra'],
    ['Curl en polea', 'Polea'], ['Curl bayesiano en polea', 'Polea'], ['Curl en máquina', 'Máquina'],
  ],
  Tríceps: [
    ['Press francés con barra Z', 'Barra'], ['Press de banca agarre cerrado', 'Barra'], ['Press JM', 'Barra'],
    ['Extensión de tríceps en polea alta', 'Polea'], ['Extensión de tríceps con cuerda', 'Polea'],
    ['Extensión de tríceps sobre la cabeza en polea', 'Polea'],
    ['Extensión de tríceps sobre la cabeza con mancuerna', 'Mancuernas'],
    ['Patada de tríceps', 'Mancuernas'], ['Extensión de tríceps en máquina', 'Máquina'],
    ['Fondos en paralelas', 'Peso Corporal'], ['Fondos en banco', 'Peso Corporal'],
  ],
  Core: [
    ['Plancha', 'Peso Corporal'], ['Plancha lateral', 'Peso Corporal'], ['Crunch abdominal', 'Peso Corporal'],
    ['Crunch en polea', 'Polea'], ['Crunch en máquina', 'Máquina'],
    ['Elevación de piernas colgado', 'Peso Corporal'], ['Elevación de piernas en paralelas', 'Peso Corporal'],
    ['Rueda abdominal', null], ['Giros rusos', 'Peso Corporal'], ['Pallof press', 'Polea'],
    ['Leñador en polea', 'Polea'], ['Dead bug', 'Peso Corporal'], ['Hollow body', 'Peso Corporal'],
  ],
  Cardio: [
    ['Cinta de correr', 'Máquina'], ['Bicicleta estática', 'Máquina'], ['Elíptica', 'Máquina'],
    ['Remo ergómetro', 'Máquina'], ['Escaladora', 'Máquina'], ['Bicicleta de aire', 'Máquina'],
    ['Comba', null], ['Burpees', 'Peso Corporal'], ['Sprints', 'Peso Corporal'],
  ],
};
