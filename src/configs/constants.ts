
export const API_CONFIG = {
  BASE_URL: 'https://api.coingecko.com/api/v3',
  ENDPOINT: `coins/markets`,
  RATE_LIMIT_WINDOW: 60000,
  MAX_REQUESTS_PER_WINDOW: 8,
  MIN_REQUEST_DELAY: 2000,

} as const

export const CACHE_CONFIG = {
  MARKET_DATA_TTL: 60000,
  DEFAULT_ERROR_DELAY: 5000
} as const

export const MARKET_CONFIG = {
  PER_PAGE: 10,
  DEFAULT_CURRENCY: 'usd',
} as const

export const STORAGE_KEYS = {
  ASSETS: "portfolio_assets",
  TRANSACTIONS: "assets_transactions",
  USER: "auth_user"
} as const