"use client";
import { SignUpForm } from "@/components/sign-up-form";
import { useEffect, useState } from "react";
import { BsThreeDots } from "react-icons/bs";

const mockMessages = [
  { sender: "user", text: "Hi Comfortly! I'm feeling kinda off today." },
  { sender: "bot", text: "I'm here for you. Would you like to reflect or relax?" },
  { sender: "user", text: "Maybe a bit of both." },
  { sender: "bot", text: "Let’s start with something calming. Here’s a breathing guide 💨" },
];

function LiveChatPreview() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [index, setIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let loopTimer: NodeJS.Timeout;

    if (index < mockMessages.length) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setMessages((prev) => [...prev, mockMessages[index]]);
        setIndex(index + 1);
        setIsTyping(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      // Restart chat loop after a short pause
      loopTimer = setTimeout(() => {
        setMessages([]);
        setIndex(0);
      }, 4000);
    }

    return () => clearTimeout(loopTimer);
  }, [index]);

  return (
    <div className="w-[420px] max-w-full p-0 rounded-2xl bg-[#ECE9E1] shadow-lg h-[520px] mt-4 overflow-y-auto border border-[#B1ADA1] flex flex-col">
  {/* Chat Header */}
  <div className="flex items-center justify-between px-4 py-3 border-b border-[#B1ADA1] bg-[#F4F3EE] rounded-t-2xl">
    <div className="flex items-center space-x-2">
      <span className="text-xl text-[#C15F3C]">★</span>
      <span className="font-semibold text-[#222] text-lg font-poppins">Comfortly</span>
    </div>
    {/* Optional: Status dot */}
    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" title="Online" />
  </div>

  {/* Chat Messages */}
  <div className="flex flex-col gap-3 flex-grow px-4 py-3">
    {messages.map((msg, idx) => (
      <div
        key={idx}
        className={`px-4 py-3 rounded-xl text-base w-fit max-w-[80%] ${
          msg.sender === "user"
            ? "bg-[#FFF0E6] self-end border border-[#C15F3C] text-[#222]"
            : "bg-white self-start border border-[#B1ADA1] text-[#222]"
        }`}
      >
        {msg.text}
      </div>
    ))}

    {isTyping && (
      <div className="px-4 py-2 bg-white border border-[#B1ADA1] rounded-xl w-fit flex items-center gap-1">
        <BsThreeDots className="text-[#B1ADA1] text-xl animate-bounce" />
        <BsThreeDots className="text-[#B1ADA1] text-xl animate-bounce delay-150" />
        <BsThreeDots className="text-[#B1ADA1] text-xl animate-bounce delay-300" />
      </div>
    )}
  </div>
</div>

  );
}

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
      {/* Right: Live Chat Preview */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#F4F3EE] relative px-4">
        <h1 className="text-2xl font-bold text-[#222] mb-3 mt-6 text-center">
          Feeling low? We're here for you 💛
        </h1>
        <LiveChatPreview />
      </div>
    </div>
  );
}
