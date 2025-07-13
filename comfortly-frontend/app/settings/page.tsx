import { getUserFromSupabase, updateUserProfile } from "@/app/chat/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React from "react";

export default async function SettingsPage() {
  const user = await getUserFromSupabase();
  const profile = {
    name: user?.user_metadata?.display_name || "",
    age: user?.user_metadata?.age || "",
    gender: user?.user_metadata?.gender || "",
    preferences: user?.user_metadata?.preferences || "",
  };

  return (
    <div className="flex min-h-screen w-full bg-[#1a1a1a]">
      <aside className="w-64 pt-16 px-8 border-r border-[#232323]">
        <h2 className="text-2xl font-poppins font-semibold text-[#F4F3EE] mb-8">Settings</h2>
        <nav className="flex flex-col gap-2">
          <button className="px-4 py-2 rounded-lg bg-[#232323] text-[#F4F3EE] font-semibold text-left">Profile</button>
        </nav>
      </aside>
      <section className="flex-1 flex flex-col items-center pt-16">
        <form
          className="w-full max-w-2xl bg-[#181818] rounded-2xl p-8 flex flex-col gap-6 border border-[#232323] shadow-xl"
          action={async (formData) => {
            'use server';
            await updateUserProfile(Object.fromEntries(formData.entries()));
          }}
        >
          <div className="flex gap-6">
            <div className="flex-1 flex flex-col gap-2">
              <Label htmlFor="display_name" className="text-[#B1ADA1] text-base font-semibold">Full name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={profile.name}
                className="bg-[#232323] border-[#393939] text-[#F4F3EE] placeholder:text-[#B1ADA1] text-lg px-4 py-3 rounded-lg"
                autoComplete="off"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <Label htmlFor="age" className="text-[#B1ADA1] text-base font-semibold">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min="1"
                max="120"
                defaultValue={profile.age}
                className="bg-[#232323] border-[#393939] text-[#F4F3EE] placeholder:text-[#B1ADA1] text-lg px-4 py-3 rounded-lg"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="gender" className="text-[#B1ADA1] text-base font-semibold">Gender</Label>
            <select
              id="gender"
              name="gender"
              defaultValue={profile.gender}
              className="bg-[#232323] border-[#393939] text-[#F4F3EE] placeholder:text-[#B1ADA1] text-lg px-4 py-3 rounded-lg"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="preferences" className="text-[#B1ADA1] text-base font-semibold">Preferences</Label>
            <Input
              id="preferences"
              name="preferences"
              defaultValue={profile.preferences}
              className="bg-[#232323] border-[#393939] text-[#F4F3EE] placeholder:text-[#B1ADA1] text-lg px-4 py-3 rounded-lg"
              autoComplete="off"
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit" className="bg-[#C15F3C] hover:bg-[#a94e2e] text-white font-semibold px-8 py-3 rounded-lg text-base">Save</Button>
          </div>
        </form>
      </section>
    </div>
  );
}
