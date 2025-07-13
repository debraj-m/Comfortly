// Server action to get user from Supabase
"use server";
import { createClient } from "@/lib/supabase/server";

export async function getUserFromSupabase() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export async function updateUserProfile(formData: {
    name?: string;
    age?: string;
    preferences?: string;
}) {
  console.log("Updating user profile with data:", formData);
  const supabase = await createClient();
  const user = (await getUserFromSupabase())?.user_metadata;

  if (!user) return;

  const updates = {
  
    display_name: formData.name || user.display_name,
    age: formData.age ? parseInt(formData.age, 10) : user.age,
    preferences: formData.preferences || user.preferences,
  };

 const response = await supabase.auth.updateUser({
    data: updates,
  });

  console.log("Profile updated:", response.data.user?.user_metadata);

  
}

// get Access token
export async function getAccessToken() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || "";
}