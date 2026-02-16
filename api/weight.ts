import { sql } from "@vercel/postgres";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    try {
        if (request.method === "GET") {
            const { rows } = await sql`SELECT * FROM weight_history ORDER BY date ASC;`;
            return response.status(200).json(rows);
        }

        if (request.method === "POST") {
            const { id, date, weight, image } = request.body;
            const { rows } = await sql`
        INSERT INTO weight_history (id, date, weight, image)
        VALUES (${id}, ${date}, ${weight}, ${image})
        ON CONFLICT (id) DO UPDATE SET
          date = EXCLUDED.date,
          weight = EXCLUDED.weight,
          image = EXCLUDED.image
        RETURNING *;
      `;
            return response.status(200).json(rows[0]);
        }

        if (request.method === "DELETE") {
            const { id } = request.query;
            await sql`DELETE FROM weight_history WHERE id = ${id as string};`;
            return response.status(200).json({ success: true });
        }

        return response.status(405).json({ error: "Method not allowed" });
    } catch (error) {
        console.error("API Error (weight):", error);
        return response.status(500).json({ error: (error as Error).message });
    }
}
