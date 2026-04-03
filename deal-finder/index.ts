export type {
    RawBookRequest,
    NormalizedBookRequest,
    GoogleHotelMatch,
    DealFinderResult,
    DealFinderError,
    UnresolvedHotelRequest,
} from "./types";

export { normalizeBookRequest, isError } from "./normalizer";

export { resolveHotel } from "./hotels-database-resolver";

