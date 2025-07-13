import { useNavigate } from "react-router-dom";

export default function UserMenu({ onClose, onSelect }) {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Guest User",
    email: "guest@example.com",
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white/10 backdrop-blur-md text-white shadow-lg z-50 p-6 animate-slide-in">
 
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white text-xl"
      >
        ✕
      </button>

      <div className="mt-16">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#fddcd4] to-[#6a73d9] text-white rounded-full flex items-center justify-center font-bold shadow-lg">
            {getInitials(user.name)}
          </div>
          <div className="ml-4">
            <p className="text-sm text-white/60">User</p>
            <p className="text-lg font-semibold">{user.name}</p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <button
            onClick={() => {
              onSelect("profile");
              onClose();
            }}
            className="text-left w-full bg-white/5 hover:bg-white/10 py-2 px-4 rounded text-white/90"
          >
            My-profile
          </button>
          <button
            onClick={() => {
              onSelect("preference");
              onClose();
            }}
            className="text-left w-full bg-white/5 hover:bg-white/10 py-2 px-4 rounded text-white/90"
          >
            Preference
          </button>
        </div>

        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="text-left w-full bg-white/5 hover:bg-white/10 py-2 px-4 rounded text-white/70"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
