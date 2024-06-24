import { Pool } from "pg";

const client = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  max: 20,
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 200000,
  ssl: {
    rejectUnauthorized: false, // Disable certificate validation (optional)
  },
});

export default client;
