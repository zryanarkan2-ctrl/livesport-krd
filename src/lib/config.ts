/**
 * ڕێکخستنی Supabase (بۆ لینکەکانی بینین و پەڕەی ئەدمین).
 * ئەم دوو نرخە گشتین (anon key نهێنی نییە) و دەتوانیت لێرە دایانبنێیت.
 * ئەگەر لێرە دانەنرابن، سایتەکە وەک پێشوو کار دەکات و تەنها بەشی «بینین» نادیارە.
 */
export const SUPABASE_URL: string =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || 'https://acjiwnkvnsptfqeqxzbk.supabase.co';

export const SUPABASE_ANON_KEY: string =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || 'sb_publishable_FpHs9PFk69xUttciSQLksg_hUFoSt14';

export const supabaseReady = (): boolean =>
  SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 40;
