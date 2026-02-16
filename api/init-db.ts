import { sql } from "@vercel/postgres";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    try {
        // Only allow this in dev or with a specific secret key
        // For simplicity, we just allow it here.

        await sql`
      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        target_weight DECIMAL(5, 2) NOT NULL,
        current_weight DECIMAL(5, 2) NOT NULL,
        daily_calories INTEGER NOT NULL,
        daily_protein INTEGER NOT NULL,
        start_date DATE NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

        await sql`
      CREATE TABLE IF NOT EXISTS weight_history (
        id TEXT PRIMARY KEY,
        date DATE NOT NULL,
        weight DECIMAL(5, 2) NOT NULL,
        image TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

        await sql`
      CREATE TABLE IF NOT EXISTS meals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        time TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

        await sql`
      CREATE TABLE IF NOT EXISTS food_items (
        id TEXT PRIMARY KEY,
        meal_id TEXT REFERENCES meals(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        calories INTEGER NOT NULL,
        protein INTEGER NOT NULL,
        carbs INTEGER NOT NULL,
        fat INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

        return response.status(200).json({ success: true, message: "Tables initialized successfully" });
    } catch (error) {
        console.error("Setup Error:", error);
        return response.status(500).json({ error: (error as Error).message });
    }
}
