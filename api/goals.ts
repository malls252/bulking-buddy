import { sql } from "@vercel/postgres";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    try {
        if (request.method === "GET") {
            const { rows } = await sql`SELECT * FROM goals LIMIT 1;`;
            if (rows.length === 0) {
                return response.status(200).json(null);
            }
            return response.status(200).json(rows[0]);
        }

        if (request.method === "POST") {
            const { targetWeight, currentWeight, dailyCalories, dailyProtein, startDate } = request.body;

            // Upsert logic for a single user app
            const { rows } = await sql`
        INSERT INTO goals (id, target_weight, current_weight, daily_calories, daily_protein, start_date)
        VALUES (1, ${targetWeight}, ${currentWeight}, ${dailyCalories}, ${dailyProtein}, ${startDate})
        ON CONFLICT (id) DO UPDATE SET
          target_weight = EXCLUDED.target_weight,
          current_weight = EXCLUDED.current_weight,
          daily_calories = EXCLUDED.daily_calories,
          daily_protein = EXCLUDED.daily_protein,
          start_date = EXCLUDED.start_date,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
            return response.status(200).json(rows[0]);
        }

        return response.status(405).json({ error: "Method not allowed" });
    } catch (error) {
        console.error("API Error (goals):", error);
        return response.status(500).json({ error: (error as Error).message });
    }
}
