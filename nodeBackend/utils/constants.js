module.exports = {
  MAX_TEAMS_PER_SECTION: 4,
  CACHE_TTL: 3600,
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
};
