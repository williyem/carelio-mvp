/**
 * Dummy data mode — enabled by default for exam/demo development.
 * Set USE_DUMMY_DATA=false in .env when connecting to the real backend.
 */
export const isDummyDataEnabled = (): boolean =>
  process.env.USE_DUMMY_DATA !== 'false';
