/** Business limits used by the Zod schemas, the server services and the UI. */
export const LIMITS = {
  NAME_MAX: 100,
  DESCRIPTION_MAX: 500,
  NOTES_MAX: 500,

  DAYS_PER_ROUTINE_MAX: 14,
  EXERCISES_PER_DAY_MAX: 30,
  SETS_PER_EXERCISE_MAX: 20,

  REPS_MAX: 100,
  /** In the user's unit (kg or lb): 2000 leaves room for e.g. a heavy leg press in lb. */
  WEIGHT_MAX: 2000,
  RIR_MAX: 10,

  /** Body weight (profile), in the user's unit. */
  BODY_WEIGHT_MIN: 20,
  BODY_WEIGHT_MAX: 500,
  /** Height in cm (Mi progreso). */
  HEIGHT_MIN_CM: 50,
  HEIGHT_MAX_CM: 280,
  /** Oldest accepted birth date. */
  BIRTH_DATE_MIN: '1900-01-01',
  /** Weight log entries returned for the chart / list (newest kept if there are more). */
  WEIGHT_LOGS_MAX: 1000,

  /** Planned sets + extra sets added on the fly during a workout. */
  LOGGED_SET_NUMBER_MAX: 30,
  /** Keeps a full session payload under the 10 KB JSON limit of the API. */
  SESSION_SETS_MAX: 60,
  /** 10 h: anything longer is a forgotten, never-finished workout. */
  SESSION_DURATION_MAX_SECONDS: 36_000,
  HISTORY_SESSIONS_MAX: 50,

  /** RFC 5321 practical maximum for an email address. */
  EMAIL_MAX: 254,
  PASSWORD_MIN: 8,
  /** bcrypt only uses the first 72 bytes: longer passwords are rejected, not silently cut. */
  PASSWORD_MAX_BYTES: 72,
  /** Usernames: 3-20 letters, digits or "_" (stored in lowercase). */
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  /** Email confirmation links stay valid for 24 h. */
  VERIFICATION_TTL_HOURS: 24,
} as const;
