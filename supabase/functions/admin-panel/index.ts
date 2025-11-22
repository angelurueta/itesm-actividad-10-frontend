import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { action, ...data } = await req.json()

        // ... existing actions ...

        if (action === 'create_table') {
            const { numero_mesa, capacidad, ubicacion, activa, x, y } = data

            const { data: newTable, error } = await supabase
                .from('mesas')
                .insert([
                    { numero_mesa, capacidad, ubicacion, activa, x, y, estado: 'disponible' }
                ])
                .select()
                .single()

            if (error) throw error
            return new Response(JSON.stringify({ data: newTable }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        if (action === 'update_table') {
            const { id, ...updates } = data

            const { data: updatedTable, error } = await supabase
                .from('mesas')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return new Response(JSON.stringify({ data: updatedTable }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // ... existing actions ...

        return new Response(JSON.stringify({ error: 'Action not found' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
