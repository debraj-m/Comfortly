import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <div className="min-h-svh w-full flex flex-col md:flex-row bg-[#F4F3EE]">
      {/* Left: Branding and Sign Up */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 md:py-0 md:px-16 bg-[#F4F3EE]">
        {/* Logo */}
        <div className="flex items-center mb-8">
          <span className="mr-2 text-3xl" style={{ color: '#C15F3C' }}>★</span>
          <span className="font-poppins text-2xl font-semibold text-[#222]">Comfortly</span>
        </div>
        {/* Headline */}
        <h1 className="font-poppins text-5xl md:text-6xl font-semibold text-[#222] text-center leading-tight mb-4">
          Your ideas,<br />amplified
        </h1>
        {/* Subheading */}
        <p className="font-montserrat text-lg text-[#222] text-center mb-8">
          Privacy-first AI that helps you create in confidence.
        </p>
        {/* Sign Up Form */}
        <div className="w-full max-w-md">
          <SignUpForm />
        </div>
      </div>
      {/* Right: Chat and Chart Mockup */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#F4F3EE] relative">
        <div className="w-[420px] max-w-full p-8 rounded-2xl bg-[#F4F3EE] shadow-none">
          {/* Chat bubble */}
          <div className="mb-4 flex flex-col gap-2">
            <div className="bg-[#F4F3EE] rounded-xl px-4 py-3 shadow-sm border border-[#B1ADA1] text-[#222] font-montserrat text-base w-fit self-end">
              <span className="font-medium">Hi Comfortly! Can you visualize my mood over the week using bar graphs?</span>
            </div>
            <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-[#B1ADA1] text-[#222] font-montserrat text-base w-fit">
              Here’s your mood chart.
            </div>
          </div>
          {/* Chart mockup */}
          <div className="bg-white rounded-2xl p-6 shadow border border-[#B1ADA1] mt-2">
            <div className="font-montserrat text-base font-semibold text-[#B1ADA1] mb-2">Mood over the week</div>
            <div className="flex items-end gap-4 h-40">
              {/* Bar 1 */}
              <div className="flex flex-col items-center">
                <div className="w-8 rounded-t-lg" style={{ height: '120px', background: '#A3C1F7' }}></div>
                <span className="text-xs text-[#B1ADA1] mt-2">Mon</span>
              </div>
              {/* Bar 2 */}
              <div className="flex flex-col items-center">
                <div className="w-8 rounded-t-lg" style={{ height: '80px', background: '#C15F3C' }}></div>
                <span className="text-xs text-[#B1ADA1] mt-2">Tue</span>
              </div>
              {/* Bar 3 */}
              <div className="flex flex-col items-center">
                <div className="w-8 rounded-t-lg" style={{ height: '100px', background: '#F7D59C' }}></div>
                <span className="text-xs text-[#B1ADA1] mt-2">Wed</span>
              </div>
              {/* Bar 4 */}
              <div className="flex flex-col items-center">
                <div className="w-8 rounded-t-lg" style={{ height: '60px', background: '#B1ADA1' }}></div>
                <span className="text-xs text-[#B1ADA1] mt-2">Thu</span>
              </div>
              {/* Bar 5 */}
              <div className="flex flex-col items-center">
                <div className="w-8 rounded-t-lg" style={{ height: '40px', background: '#F4F3EE', border: '1px solid #B1ADA1' }}></div>
                <span className="text-xs text-[#B1ADA1] mt-2">Fri</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
