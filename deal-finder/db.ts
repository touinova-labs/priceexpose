// db.ts
import { Pool } from "pg";

export const pool = new Pool({
    host: "82.165.116.199",
    port: 5432,
    user: "hotels_user",
    password: "strongpassword",
    database: "hotels_db",
});