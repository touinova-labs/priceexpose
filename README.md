docker run -d \
  --name postgres-db \
  -e POSTGRES_USER=hotels_user \
  -e POSTGRES_PASSWORD=strongpassword \
  -e POSTGRES_DB=hotels_db \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16

  psql -h 82.165.116.199 -U hotels_user -d hotels_db


test all deploy

