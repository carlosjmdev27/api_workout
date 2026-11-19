/** Business limits used by the Zod schemas, the server services and the UI. */
export const LIMITS = {
  NAME_MAX: 100,
  DESCRIPTION_MAX: 500,
  NOTES_MAX: 500,

  DAYS_PER_ROUTINE_MAX: 14,
  EXERCISES_PER_DAY_MAX: 30,
  SETS_PER_EXERCISE_MAX: 20,

  REPS_MAX: 100,
  WEIGHT_MAX_KG: 1000,
  RIR_MAX: 10,

  /** Planned sets + extra sets added on the fly during a workout. */
  LOGGED_SET_NUMBER_MAX: 30,
  /** Keeps a full session payload under the 10 KB JSON limit of the API. */
  SESSION_SETS_MAX: 60,
  /** 10 h: anything longer is a forgotten, never-finished workout. */
  SESSION_DURATION_MAX_SECONDS: 36_000,
  HISTORY_SESSIONS_MAX: 50,
} as const;
