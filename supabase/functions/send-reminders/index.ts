// @ts-ignore - Deno URL imports are not supported by VS Code's TypeScript server
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Ambil ID OneSignal dari data goals
    // Kita asumsikan user ID 1 untuk single user app ini
    const { data: goals } = await supabase.from('goals').select('onesignal_id').eq('id', 1).single()
    const { data: meals } = await supabase.from('meals').select('*')

    if (!goals?.onesignal_id) return new Response("No OneSignal ID found", { status: 404 })

    console.log(`Sending ${meals?.length} reminders to ${goals.onesignal_id}`)

    const results = []

    // Logika memanggil API OneSignal
    for (const meal of (meals || [])) {
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${Deno.env.get('ONESIGNAL_REST_API_KEY')}`
            },
            body: JSON.stringify({
                app_id: Deno.env.get('ONESIGNAL_APP_ID'),
                include_player_ids: [goals.onesignal_id],
                contents: { en: `Waktunya ${meal.name}! 🍽️`, id: `Ayo makan tepat waktu jam ${meal.time}. Semangat bulking!` },
                // Format waktu untuk pengiriman terjadwal (Opsional, OneSignal juga punya fitur local notifications)
                // Kita gunakan pengiriman instan untuk testing jika dipicu manual, 
                // atau gunakan 'send_after' untuk penjadwalan.
                delayed_option: "last-active" // Kirim saat user terakhir aktif
            })
        })

        const result = await response.json()
        results.push({ meal: meal.name, result })
    }

    return new Response(JSON.stringify({ message: "Reminders processed", details: results }), {
        headers: { "Content-Type": "application/json" }
    })
})
