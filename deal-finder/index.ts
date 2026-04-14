export type {
    RawBookRequest,
    NormalizedBookRequest,
    GoogleId as GoogleHotelMatch,
    DealFinderResult,
    DealFinderError,
    UnresolvedHotelRequest,
} from "./types";

export { normalizeBookRequest, isError } from "./normalizer";

export { resolveHotel } from "./hotels-database-resolver";

