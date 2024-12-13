import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

config({ path: ".env" });

export const db = drizzle(process.env.NEXT_PUBLIC_DATABASE_URL!);
