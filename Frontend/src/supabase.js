// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynyatndehtvknyaewbif.supabase.co/';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueWF0bmRlaHR2a255YWV3YmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzA2NzIsImV4cCI6MjA2NzkwNjY3Mn0.Pe9-FzkhuANpUNkQY96RIcCz6dnNzjkzWwQRCkJgrek';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
