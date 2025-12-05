// src/supabase/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qwoevhpgxutqgbilayww.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3b2V2aHBneHV0cWdiaWxheXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MDAwNDYsImV4cCI6MjA1MzM3NjA0Nn0.eYWrnFdVN2gHjNEXIr2A55VP04dSvmSbEL255xaKYUo";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
