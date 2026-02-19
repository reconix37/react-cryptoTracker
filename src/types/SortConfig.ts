export type SortKey = "name" | "price" | "change" | "marketCap"

export type SortDirection = "asc" | "desc"

export interface SortConfig {
    key: SortKey;
    direction: SortDirection;
}
