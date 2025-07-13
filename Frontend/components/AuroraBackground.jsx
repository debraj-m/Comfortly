// AuroraBackground.jsx
export function AuroraBackground({ children }) {
  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black">
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-aurora-bg pointer-events-none z-0">
        <div className="absolute top-[30%] left-[30%] w-[60%] h-[60%] bg-[#6a73d9] blur-[120px] opacity-50 rounded-full" />
        <div className="absolute top-[10%] right-[20%] w-[40%] h-[40%] bg-[#fddcd4] blur-[100px] opacity-40 rounded-full" />
        <div className="absolute bottom-[20%] left-[25%] w-[50%] h-[50%] bg-[#ffffff] blur-[120px] opacity-10 rounded-full" />
      </div>

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
