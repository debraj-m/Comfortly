import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ onSelect, selectedTab }) {
  const [expanded, setExpanded] = useState(selectedTab !== "landing");
  const [avatarAnimated, setAvatarAnimated] = useState(false);
  const navigate = useNavigate();

  // Simulate user from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const user = {
    name: storedUser?.name ?? "Guest User",
    email: storedUser?.email ?? "guest@example.com",
  };

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    if (selectedTab !== "landing") {
      setExpanded(true);
      setAvatarAnimated(true);
      setTimeout(() => setAvatarAnimated(false), 500);
    }
  }, [selectedTab]);

  const isActive = (tab) =>
    selectedTab === tab
      ? "bg-[#fddcd4]/60 text-black font-semibold border border-[#fddcd4]/80"
      : "bg-[#fddcd4]/30 hover:bg-[#fddcd4]/50 text-black border border-[#fddcd4]/40";

  return (
    <div
      className={`relative h-screen bg-white transition-all duration-300 flex flex-col ${
        expanded ? "w-64 p-6" : "w-12 items-center justify-between py-4"
      }`}
    >
      {expanded && (
        <button
          onClick={() => {
            setExpanded(false);
            onSelect("landing");
          }}
          className="absolute top-4 right-4 text-black/60 hover:text-black text-xl"
        >
          ✕
        </button>
      )}

      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="text-xl text-black/60 hover:text-black"
        >
          ❯
        </button>
      )}

      {expanded && (
        <>
          <div
            className={`mt-10 ${avatarAnimated ? "animate-avatar-up" : "fade-in"}`}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-tr from-[#fddcd4] to-[#6a73d9] text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                {getInitials(user.name)}
              </div>
            </div>

            <div className="mb-6 animate-slide-in-side">
              <p className="text-sm text-black/60">User</p>
              <p className="text-lg font-semibold text-black">{user.name}</p>
              <p className="text-sm text-black/40">{user.email}</p>
            </div>

            <div className="space-y-2 animate-slide-in-side">
              <button
                onClick={() => onSelect("profile")}
                className={`w-full py-2 px-4 rounded text-left transition-all ${isActive("profile")}`}
              >
                My-profile
              </button>
              <button
                onClick={() => onSelect("preference")}
                className={`w-full py-2 px-4 rounded text-left transition-all ${isActive("preference")}`}
              >
                Preference
              </button>
            </div>
          </div>

          <div className="mt-auto fade-in">
            <button
              onClick={handleLogout}
              className="w-full mt-10 py-2 px-4 rounded text-black border border-[#fddcd4]/50 bg-[#fddcd4]/30 hover:bg-[#fddcd4]/50"
            >
              Logout
            </button>
          </div>
        </>
      )}

      {!expanded && (
        <div className="flex flex-col items-center mt-auto mb-2">
          <button
            onClick={() => setExpanded(true)}
            className="w-10 h-10 bg-gradient-to-tr from-[#fddcd4] to-[#6a73d9] text-white rounded-full flex items-center justify-center font-bold hover:scale-105 transition-transform shadow-lg"
            title="Open Sidebar"
          >
            {getInitials(user.name)}
          </button>
        </div>
      )}
    </div>
  );
}
