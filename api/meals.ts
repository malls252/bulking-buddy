import { sql } from "@vercel/postgres";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    try {
        if (request.method === "GET") {
            const { rows: meals } = await sql`SELECT * FROM meals;`;
            const { rows: foods } = await sql`SELECT * FROM food_items;`;

            const fullMeals = meals.map(meal => ({
                ...meal,
                foods: foods.filter(food => food.meal_id === meal.id)
            }));

            return response.status(200).json(fullMeals);
        }

        if (request.method === "POST") {
            const { id, name, time, foods, completed } = request.body;

            // Transaction-like approach (simplified)
            await sql`
        INSERT INTO meals (id, name, time, completed)
        VALUES (${id}, ${name}, ${time}, ${completed})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          time = EXCLUDED.time,
          completed = EXCLUDED.completed;
      `;

            // Refresh foods for this meal
            await sql`DELETE FROM food_items WHERE meal_id = ${id};`;

            if (foods && foods.length > 0) {
                for (const food of foods) {
                    await sql`
            INSERT INTO food_items (id, meal_id, name, calories, protein, carbs, fat)
            VALUES (${food.id}, ${id}, ${food.name}, ${food.calories}, ${food.protein}, ${food.carbs}, ${food.fat});
          `;
                }
            }

            return response.status(200).json({ success: true });
        }

        if (request.method === "PATCH") {
            const { id, completed } = request.body;
            await sql`UPDATE meals SET completed = ${completed} WHERE id = ${id};`;
            return response.status(200).json({ success: true });
        }

        if (request.method === "DELETE") {
            const { id } = request.query;
            await sql`DELETE FROM meals WHERE id = ${id as string};`;
            return response.status(200).json({ success: true });
        }

        return response.status(405).json({ error: "Method not allowed" });
    } catch (error) {
        console.error("API Error (meals):", error);
        return response.status(500).json({ error: (error as Error).message });
    }
}
