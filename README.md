This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


docker run -d \
  --name postgres-db \
  -e POSTGRES_USER=hotels_user \
  -e POSTGRES_PASSWORD=strongpassword \
  -e POSTGRES_DB=hotels_db \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16

  psql -h 82.165.116.199 -U hotels_user -d hotels_db


  Enriching hotel data for property: ChkIg7Wsid-9hfJ0Gg0vZy8xMXM1ajV4NmdzEAE
0|extension-scraper  | 🚀 Navigation vers : https://www.google.fr/travel/hotels/entity/ChkIg7Wsid-9hfJ0Gg0vZy8xMXM1ajV4NmdzEAE/overview
0|extension-scraper  | 🔍 Extraction des données...
0|extension-scraper  | Texte brut extrait: The Lemonary Marrakech
0|extension-scraper  | Hôtel 4 étoiles
0|extension-scraper  | km15 route de sidi rahal, Centre Commune Ouled Hassoune 40000, Maroc•+212 6 61 34 36 55
0|extension-scraper  | 116 €
0|extension-scraper  | 9–10 mai

