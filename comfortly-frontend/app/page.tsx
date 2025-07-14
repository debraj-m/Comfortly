'use client';

import { useEffect, useState } from "react";
import { getUserFromSupabase, getAccessToken } from "@/app/chat/actions";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/logout-button";
import Visualizer from "@/components/Visualizer";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { access } from "fs";
export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const fetchedUser = await getUserFromSupabase();
      setUser(fetchedUser);

      if (fetchedUser) {
        const token = await getAccessToken();
        setAuthToken(token);
      }
    }

    fetchUser();
  }, []);

  // Misspell the name a little for fun
  const userName = user?.user_metadata?.display_name || user?.email || "User";
  let displayName = userName;
  if (userName.length > 2) {
    displayName = userName.slice(0, -1) + (userName.slice(-1) === 'e' ? 'a' : 'e');
  }
  // Get initials from server-side user data
  let initials = "U";
  if (user?.user_metadata?.display_name) {
    const parts = user.user_metadata.display_name.split(/\s|@/).filter(Boolean);
    if (parts.length === 1) initials = parts[0].slice(0, 2).toUpperCase();
    else initials = (parts[0][0] + (parts[1][0] || "")).toUpperCase();
  } else if (user?.email) {
    const parts = user.email.split(/\s|@/).filter(Boolean);
    if (parts.length === 1) initials = parts[0].slice(0, 2).toUpperCase();
    else initials = (parts[0][0] + (parts[1][0] || "")).toUpperCase();
  }

  return (
    <div className="flex min-h-screen w-full bg-[#1a1a1a]">
      {/* Collapsed Sidebar */}
      <aside className="h-full w-16 flex flex-col items-center py-4 bg-transparent border-r border-[#232323]">
        <button className="w-10 h-10 flex items-center justify-center rounded-md bg-[#C15F3C] hover:bg-[#a94e2e] transition-colors mb-4 mt-2" aria-label="New chat">
          <span className="text-white text-2xl font-bold">+</span>
        </button>
        <div className="flex-1 flex flex-col items-center gap-4 mt-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#232323] transition-colors" aria-label="Chats">
            <svg width="20" height="20" fill="none" stroke="#B1ADA1" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v12H5.17L4 17.17V4z"/></svg>
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#232323] transition-colors" aria-label="Search">
            <svg width="20" height="20" fill="none" stroke="#B1ADA1" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <button onClick={() => router.push("/settings")} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#232323] transition-colors" aria-label="Settings">
            <svg width="20" height="20" fill="none" stroke="#B1ADA1" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1-2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 9 3.09V3a2 2 0 0 1 4 0v.09c.31.13.59.32.82.55.23.23.42.51.55.82H15a1.65 1.65 0 0 0 1.51 1c.13.31.32.59.55.82.23.23.51.42.82.55V9a1.65 1.65 0 0 0 1 1.51c.31.13.59.32.82.55.23.23.42.51.55.82H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>
        <div className="mt-auto mb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#232323] text-xs text-[#B1ADA1] font-bold focus:outline-none focus:ring-2 focus:ring-[#C15F3C]">
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="mb-2 ml-2 min-w-[220px] bg-[#181818] border border-[#232323] rounded-xl shadow-xl p-0">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#232323] text-base text-[#B1ADA1] font-bold border border-[#393939]">
                  {initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#F4F3EE]">{user?.user_metadata?.display_name || user?.email}</span>
                  <span className="text-xs text-[#B1ADA1]">{user?.email}</span>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-[#232323]" />
              <DropdownMenuItem className="px-4 py-2 text-[#F4F3EE] hover:bg-[#232323] cursor-pointer" onClick={() => router.push("/settings")}>
                <svg className="inline-block mr-2" width="16" height="16" fill="none" stroke="#B1ADA1" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1-2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 9 3.09V3a2 2 0 0 1 4 0v.09c.31.13.59.32.82.55.23.23.42.51.55.82H15a1.65 1.65 0 0 0 1.51 1c.13.31.32.59.55.82.23.23.51.42.82.55V9a1.65 1.65 0 0 0 1 1.51c.31.13.59.32.82.55.23.23.42.51.55.82H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="px-4 py-2 text-[#F4F3EE] hover:bg-[#232323] cursor-pointer">
                <LogoutButton />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="flex flex-col items-center gap-2 mt-16">
          <span className="text-4xl font-poppins font-semibold text-[#C15F3C] tracking-tight">✴️ Good morning, {displayName}</span>
        </div>
        <div className="mt-10 flex flex-col items-center">
          <Visualizer
            width={400}
            height={400}
            circleSize={5}
            gradientStart={[193/255, 95/255, 60/255]} // Burnt Orange
            gradientEnd={[177/255, 173/255, 161/255]} // Warm Grey
            wireframe={true}
            minFrequency={20}
            auth_token={authToken}
            meshDensity={20}
          />
          <p className="mt-4 text-sm text-[#B1ADA1] max-w-md text-center">
            Click the visualizer to start your conversation with the AI. 
            <br />
            Speak naturally and the AI will respond through your speakers.
          </p>
        </div>
      </div>
    </div>
  );
}