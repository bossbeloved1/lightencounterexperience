// Add your Supabase project values here before using live registration/admin features.
window.LEE_SUPABASE_URL = "https://rnogelimapbtlwkaclzt.supabase.co";
window.LEE_SUPABASE_ANON_KEY = "sb_publishable_uPcN1lJdC5Ljxt5JME9efw_CnK7NBBL";
window.leeSupabase = (window.supabase && window.LEE_SUPABASE_URL.startsWith("https://") && !window.LEE_SUPABASE_URL.includes("YOUR_"))
  ? window.supabase.createClient(window.LEE_SUPABASE_URL, window.LEE_SUPABASE_ANON_KEY) : null;
