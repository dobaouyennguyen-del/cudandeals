// CuDanDeals.vn – Cấu hình Supabase
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://unefmcpwvwsnfncvkrhh.supabase.co";
const SUPABASE_KEY = "sb_publishable_-lsqsB6eSICxy-DwcVgyGQ_Ws1M-LsX";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);