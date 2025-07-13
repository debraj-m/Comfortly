export default function CircularAIVisualizer() {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <div className="absolute w-48 h-48 rounded-full bg-gradient-to-tr from-[#d52cd2] to-[#5065ff] opacity-30 blur-2xl animate-ping"></div>

      {/* Core animated spinning gradient ball */}
      <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-[#d52cd2] to-[#5065ff] shadow-[0_10px_30px_rgba(130,80,255,0.5)] flex items-center justify-center animate-spin-slow">
        {/* Inner pulse dot */}
        <div className="w-8 h-8 bg-white rounded-full opacity-20 blur-md animate-pulse" />
      </div>
    </div>
  );
}
