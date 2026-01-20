import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find all active elections where end_time has passed
    const now = new Date().toISOString();
    
    const { data: expiredElections, error: fetchError } = await supabase
      .from("elections")
      .select("id, title")
      .eq("status", "active")
      .lt("end_time", now);

    if (fetchError) {
      throw fetchError;
    }

    if (!expiredElections || expiredElections.length === 0) {
      return new Response(
        JSON.stringify({ message: "No expired elections to close", closed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update all expired elections to completed
    const { error: updateError } = await supabase
      .from("elections")
      .update({ status: "completed" })
      .in("id", expiredElections.map((e) => e.id));

    if (updateError) {
      throw updateError;
    }

    console.log(`Closed ${expiredElections.length} expired elections:`, expiredElections.map(e => e.title));

    return new Response(
      JSON.stringify({ 
        message: "Elections closed successfully", 
        closed: expiredElections.length,
        elections: expiredElections.map(e => e.title)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error closing elections:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});