import { Mic } from "lucide-react";

export default function MicButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative p-6 rounded-full bg-gradient-to-tr from-fuchsia-600 to-blue-600 shadow-lg hover:scale-105 transition"
    >
      <Mic size={32} className="text-white" />
      <span className="absolute animate-ping w-full h-full rounded-full bg-fuchsia-500 opacity-30 top-0 left-0"></span>
    </button>
  );
}
