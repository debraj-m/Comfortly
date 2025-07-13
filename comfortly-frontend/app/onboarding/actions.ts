"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveOnboarding({ display_name, age, gender, preferences }: { display_name: string; age: string; gender: string; preferences: string[] }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.updateUser({
    data: {
      display_name,
      age,
      gender,
      preferences,
    },
  });
  if (error) {
    throw new Error(error.message);
  }
  return data.user;
}
