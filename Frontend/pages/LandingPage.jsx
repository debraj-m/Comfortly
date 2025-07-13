import { useState, useEffect } from "react";
import MicButton from "../components/MicButton";
import CircularAIVisualizer from "../components/CircularAIVisualizer";
import { AuroraBackground } from "../components/AuroraBackground";


export default function LandingPage() {
    const [listening, setListening] = useState(false);

    const handleMicClick = () => {
        setListening(true);
        setTimeout(() => setListening(false), 5000);
    };

    return (
        <AuroraBackground>

            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-[#fddcd4] to-[#6a73d9] text-white text-center relative overflow-hidden">
            
                <div className="absolute -z-10 w-[500px] h-[500px] bg-[#fddcd4] opacity-30 blur-[120px] rounded-full top-[-100px] left-[-150px]" />
                <div className="absolute -z-10 w-[400px] h-[400px] bg-[#6a73d9] opacity-30 blur-[100px] rounded-full bottom-[-100px] right-[-100px]" />

                <h1
                    className={`text-5xl font-extrabold drop-shadow mb-4 transition-opacity duration-500 ${listening ? "opacity-0" : "opacity-100"
                        }`}
                >
                    Your Voice AI
                </h1>
                <p
                    className={`text-white/70 max-w-md mb-10 transition-opacity duration-500 ${listening ? "opacity-0" : "opacity-100"
                        }`}
                >
                    Tap the mic and start speaking.
                </p>

                <div
                    className={`relative transition-all duration-700 ${listening ? "animate-slide-down-shrink" : "animate-slide-up-grow"
                        }`}
                >
                    <MicButton onClick={handleMicClick} />
                </div>

                {listening && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 animate-fade-in">
                        <CircularAIVisualizer />
                    </div>
                )}
            </div>
        </AuroraBackground>
    );
}
