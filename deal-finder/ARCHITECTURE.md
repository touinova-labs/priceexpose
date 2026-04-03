# Architecture - Deal Finder

## Vue d'ensemble

Le **Deal Finder** est un système modulaire qui orchestre la recherche de deals hôtels. Il est conçu pour être:

- **Modulaire**: Chaque étape est indépendante et réutilisable
- **Robuste**: Gestion d'erreurs structurée et validations strictes
- **Résilience**: Support de multiples sources et stratégies de fallback
- **Performant**: Caching et optimisations de scraping

## Flux de données

```
┌─────────────────────────────────────────────────────────────┐
│                 CLIENT (Web/App/API)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼ (RawBookRequest)
        ┌──────────────────────────────┐
        │     API Route Handler        │
        │   (validation + logging)     │
        └──────────────┬───────────────┘
                       │
                       ▼ (RawBookRequest)
        ┌──────────────────────────────┐
        │   searchDeals() ou          │
        │   searchDealsWithToken()    │
        │                            │
        │      ORCHESTRATOR.TS        │
        └──────────────┬───────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
    ┌─────────────┐ ┌───────────┐ ┌──────────────┐
    │NORMALIZER.TS│ │RESOLVER.TS│ │GOOGLE_DETAIL │
    │             │ │           │ │ (public-data)│
    │ Validation  │ │ Property  │ │              │
    │ Parsing     │ │ Token ID  │ │ Scraping     │
    │ Normalization│ │ Matching │ │ offers       │
    └─────────────┘ └───────────┘ └──────────────┘
         │             │             │
         └─────────────┼─────────────┘
                       │
              ▼ (DealFinderResult)
        ┌──────────────────────────────┐
        │     Consolidated Deals       │
        │     (normalized + filtered)  │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │       RESPONSE (JSON)        │
        │   Hotel info + Offers        │
        └──────────────────────────────┘
```

## Composants

### 1. **types.ts** - Définition des interfaces
Tous les types TypeScript utilisés dans le système:
- `RawBookRequest` - Données brutes reçues
- `NormalizedBookRequest` - Données normalisées
- `GoogleHotelMatch` - Résultat de la résolution hôtel
- `DealFinderResult` - Résultat final
- `DealFinderError` - Erreur structurée

### 2. **normalizer.ts** - Normalisation des données

**Responsabilités**:
- ✅ Validation des champs obligatoires
- ✅ Parsing d'occupancy ("2 adults, 1 child" → {adults, children, rooms})
- ✅ Validation des dates (format, logique YYYY-MM-DD)
- ✅ Détection de devise (€, $, £, ¥)
- ✅ Normalisation des prix (extraction valeur numérique)
- ✅ Détection de refondabilité, petit-déj, deadlines

**Stratégies de parsing**:
```
"2 adults, 1 child" → {adults: 2, children: 1, rooms: 2}
"2 adults"          → {adults: 2, children: 0, rooms: 1}
"2a, 1c"            → {adults: 2, children: 1, rooms: 2}
"1 adult"           → {adults: 1, children: 0, rooms: 1}
""                  → {adults: 1, children: 0, rooms: 1} (défaut)
```

**Devise**:
```
"€ 100"     → EUR
"$ 100"     → USD
"£ 100"     → GBP
"¥ 100"     → JPY
Rien trouvé → EUR (défaut)
```

### 3. **google-hotel-resolver.ts** - Résolution du property_token

**Responsabilités**:
- ✅ Recherche de l'hôtel sur Google Hotels (via google_list)
- ✅ Extraction du property_token de l'URL
- ✅ Matching par nom et adresse
- ✅ Support pour utiliser un token fourni directement

**Deux stratégies**:
1. **Résolution auto** - Pouoit fuzzy matching pour trouver l'ID exact
2. **Token fourni** - Utiliser directement l'ID fourni (plus rapide)

#### ⚠️ À implémenter:
- Paramétrer `google_list()` pour accepter `destination` et `hotelName`
- Ajouter fuzzy matching pour correspondance approximative
- Implémenter un système de cache des property_tokens

### 4. **orchestrator.ts** - Orchestration du flux complet

**Deux entrées principales**:

#### `searchDeals(rawRequest)`
Flux complet avec résolution automatique:
```
RawRequest → Normalize → Resolve GoogleHotel → Scrape → Result
```

#### `searchDealsWithToken(rawRequest, token, name, address)`
Flux optimisé quand le token est connu:
```
RawRequest → Normalize → Use Token → Scrape → Result
```

**Étapes internes**:
1. Normalisation (via normalizer.ts)
2. Résolution d'hôtel (via google-hotel-resolver.ts)
3. Scraping Google (via google_detail de public-data)
4. Normalisation des offres (pricing, breakfast, refund, etc.)
5. Retour du résultat consolidé

### 5. **index.ts** - Exports publics

Expose l'API principale du deal-finder:
```typescript
export { searchDeals, searchDealsWithToken }
export { normalizeBookRequest, isError }
export { resolveGoogleHotel, resolveGoogleHotelWithToken }
export types...
```

## Gestion d'erreurs

Chaque étape peut retourner une `DealFinderError` avec:
- `code` - Code d'erreur structuré
- `message` - Message lisible
- `details` - Contexte additionnel (optionnel)

**Exemple**:
```json
{
  "code": "HOTEL_NOT_FOUND",
  "message": "Hotel 'Hotel XYZ' not found on Google Hotels"
}
```

**Codes d'erreur**:
| Code | Cause |
|------|-------|
| `INVALID_HOTEL_NAME` | Pas de nom d'hôtel |
| `INVALID_DATES` | Dates manquantes |
| `INVALID_DATE_FORMAT` | Format de date incorrect |
| `INVALID_DATE_RANGE` | checkout ≤ checkin |
| `HOTEL_NOT_FOUND` | Hôtel non trouvé sur Google |
| `PROPERTY_TOKEN_NOT_FOUND` | Impossible d'extraire l'ID |
| `NO_OFFERS_FOUND` | Aucune offre pour les dates |
| `HOTEL_RESOLUTION_ERROR` | Erreur lors de la résolution |
| `SEARCH_ERROR` | Erreur générique + détails |
| `LEAD_OFFER_NOT_FOUND` | lead offer not found

## Intégration API

### Route Exemple: `POST /api/deals/search`

```typescript
POST /api/deals/search
Content-Type: application/json

{
  "hotelName": "Hotel Monge",
  "address": "5 Rue Monge, 75005 Paris",
  "checkIn": "2026-04-13",
  "checkOut": "2026-04-16",
  "destination": "Paris",
  "travelers": "2 adults",
  "bookingOffers": [],
  "gl": "fr",
  "hl": "fr"
}
```

**Réponse (succès - 200)**:
```json
{
  "hotelName": "Hotel Monge",
  "address": "5 Rue Monge, 75005 Paris",
  "checkIn": "2026-04-13",
  "checkOut": "2026-04-16",
  "currency": "EUR",
  "totalNights": 3,
  "deals": [
    {
      "provider": "booking.com",
      "room": "Double Room",
      "link": "https://...",
      "total": 450,
      "nightly": 150,
      "currency": "EUR",
      "is_refundable": true,
      "deadline": "2026-04-10",
      "breakfast": true,
      "breakfast_value": 15
    }
  ],
  "source": "google",
  "timestamp": "2026-04-01T10:00:00Z"
}
```

**Réponse (erreur - 400)**:
```json
{
  "code": "HOTEL_NOT_FOUND",
  "message": "Hotel 'Hotel XYZ' not found on Google Hotels"
}
```

## Points de performance

1. **Caching des property_tokens** - Éviter searches redondantes
2. **Timeout sur le scraping** - 60s max pour google_detail
3. **Lazy loading** - Imports dynamiques des modules lourds
4. **Filtering d'offres** - Ne garder que les offres valides
5. **Proxy caching** - Réutiliser la même connexion proxy

## Évolutions futures

### Phase 1 - MVP (Actuel)
- [x] Normalisation de requête
- [x] Résolution d'hôtel Google (statique)
- [x] Scraping Google Hotels
- [x] Normalisation d'offres
- [x] API route exemple

### Phase 2 - Améliorations
- [ ] Paramétrer `google_list()` (property_token search)
- [ ] Système de cache Redis
- [ ] Fuzzy matching pour noms d'hôtels
- [ ] Support Booking.com / Expedia
- [ ] Tests unitaires
- [ ] Retry + timeout strategy
- [ ] Rate limiting + queue

### Phase 3 - Intelligence
- [ ] Machine learning pour meilleurs deals
- [ ] Alertes de prix (cuando bajar)
- [ ] Comparaison multilingue
- [ ] Conversion de devise de temps réel
- [ ] Historique de prix

## Stack Technique

- **TypeScript** - Type-safe, meilleur DX
- **Puppeteer** - Web scraping Google
- **Proxy Chain** - Anonymisation + reliability
- **Next.js API Routes** - Serveur sans serveur
- **Async/Await** - Async orchestration

## Dépendances externes

- `google_detail()` - public-data/google_detail.ts
- `google_list()` - public-data/google_list.ts (à paramétrer)
- Proxy (config.ts) - Réseau requis

## Limitations actuelles

1. ❌ `google_list()` est codée en dur avec "hotels paris"
2. ❌ Pas de cache des property_tokens
3. ❌ Une source (Google) uniquement
4. ❌ Pas de tests automatisés
5. ❌ Temps de scraping: 30-60s par hôtel
