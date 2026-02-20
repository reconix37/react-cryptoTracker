export const API_CONFIG = {
  BASE_URL: '/api/crypto',
  ENDPOINT: `coins/markets`,
  RATE_LIMIT_WINDOW: 60000,
  MAX_REQUESTS_PER_WINDOW: 3,
  MIN_REQUEST_DELAY: 3000,
  MAX_REQUESTS_PER_IP: 50,
} as const

export const CACHE_CONFIG = {
  MARKET_DATA_TTL: 120000,
  DEFAULT_ERROR_DELAY: 5000,
  CACHE_TIME: 180000,
  CACHE_DURATION: 90000,
  CACHE_TTL: 300000,
} as const

export const MARKET_CONFIG = {
  PER_PAGE: 50,
  DEFAULT_CURRENCY: 'usd',
} as const

export const STORAGE_KEYS = {
  ASSETS: "portfolio_assets",
  TRANSACTIONS: "assets_transactions",
  USER: "auth_user",
  USERS_LIST: "registered_users"
} as const

export const TRANSACTIONS_CONFIG = {
  PAGE_SIZE: 20,
} as const