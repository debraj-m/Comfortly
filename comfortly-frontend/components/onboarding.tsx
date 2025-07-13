"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { saveOnboarding } from "@/app/onboarding/actions";
import { useRouter } from "next/navigation";

const preferencesList = [
	{ label: "Feeling Stressed", icon: "😣" },
	{ label: "Feeling Sad or Low", icon: "😔" },
	{ label: "Feeling Angry or Frustrated", icon: "😡" },
	{ label: "Feeling Anxious", icon: "😰" },
	{ label: "Feeling Lonely", icon: "🥺" },
	{ label: "Feeling Happy & Energetic", icon: "😄" },
	{ label: "Just Need a Distraction", icon: "🌀" },
	{ label: "Need Motivation", icon: "🚀" },
	{ label: "Comfortly's Choice", icon: "💡" }
];

export default function Onboarding() {
	const [step, setStep] = useState(1);
	const [name, setName] = useState("");
	const [age, setAge] = useState("");
	const [gender, setGender] = useState("");
	const [preferences, setPreferences] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const router = useRouter();

	// Step 1: Name
	if (step === 1) {
		return (
			<div className="min-h-svh flex flex-col items-center justify-center bg-[#181716] text-[#F4F3EE]">
				<div className="flex flex-col items-center w-full">
					<span
						className="text-4xl mb-6"
						style={{ color: "#C15F3C" }}
					>
						★
					</span>
					<h2 className="font-poppins text-xl md:text-2xl mb-6 text-center">
						Before we get started, what should I call you?
					</h2>
					<form
						className="w-full max-w-md flex items-center justify-center"
						onSubmit={(e) => {
							e.preventDefault();
							if (name.trim()) setStep(2);
						}}
					>
						<div className="flex w-full items-center rounded-xl border border-[#B1ADA1] bg-[#222] px-4 py-2 focus-within:ring-2 focus-within:ring-[#C15F3C]">
							<div className="w-6 h-6 rounded bg-[#181716] mr-2" />
							<Input
								className="flex-1 bg-transparent border-none text-[#F4F3EE] placeholder-[#B1ADA1] focus-visible:ring-0 focus-visible:ring-offset-0 font-montserrat text-lg"
								placeholder="Enter your name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								autoFocus
							/>
							<Button
								type="submit"
								className="ml-2 bg-[#B1ADA1] text-[#222] hover:bg-[#C15F3C] hover:text-white rounded-full p-2"
								size="icon"
								disabled={!name.trim()}
								aria-label="Continue"
							>
								<svg
									width="20"
									height="20"
									fill="none"
									viewBox="0 0 20 20"
								>
									<path
										d="M5 10h10m0 0l-4-4m4 4l-4 4"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</Button>
						</div>
					</form>
				</div>
			</div>
		);
	}

	// Step 2: Age
	if (step === 2) {
		return (
			<div className="min-h-svh flex flex-col items-center justify-center bg-[#181716] text-[#F4F3EE]">
				<div className="flex flex-col items-center w-full">
					<span
						className="text-4xl mb-6"
						style={{ color: "#C15F3C" }}
					>
						★
					</span>
					<h2 className="font-poppins text-xl md:text-2xl mb-6 text-center">
						How old are you?
					</h2>
					<form
						className="w-full max-w-md flex flex-col items-center gap-4"
						onSubmit={(e) => {
							e.preventDefault();
							if (age.trim() && !isNaN(Number(age))) setStep(3);
						}}
					>
						<Input
							className="w-full rounded-xl border border-[#B1ADA1] bg-[#222] px-4 py-2 text-[#F4F3EE] placeholder-[#B1ADA1] focus:ring-2 focus:ring-[#C15F3C] font-montserrat text-lg"
							placeholder="Enter your age"
							value={age}
							onChange={(e) =>
								setAge(e.target.value.replace(/[^0-9]/g, ""))
							}
							required
							inputMode="numeric"
							min={1}
							max={120}
							autoFocus
						/>
						<Button
							type="submit"
							className="w-full bg-[#B1ADA1] text-[#222] hover:bg-[#C15F3C] hover:text-white rounded-xl py-3 font-montserrat text-base font-semibold"
							disabled={!age.trim() || isNaN(Number(age))}
						>
							Continue
						</Button>
					</form>
				</div>
			</div>
		);
	}

	// Step 3: Gender
	if (step === 3) {
		return (
			<div className="min-h-svh flex flex-col items-center justify-center bg-[#181716] text-[#F4F3EE]">
				<div className="flex flex-col items-center w-full">
					<span
						className="text-4xl mb-6"
						style={{ color: "#C15F3C" }}
					>
						★
					</span>
					<h2 className="font-poppins text-xl md:text-2xl mb-6 text-center">
						What is your gender?
					</h2>
					<form
						className="w-full max-w-md flex flex-col items-center gap-4"
						onSubmit={(e) => {
							e.preventDefault();
							if (gender) setStep(4);
						}}
					>
						<select
							value={gender}
							onChange={(e) => setGender(e.target.value)}
							className="w-full rounded-xl border border-[#B1ADA1] bg-[#222] px-4 py-2 text-[#F4F3EE] placeholder-[#B1ADA1] focus:ring-2 focus:ring-[#C15F3C] font-montserrat text-lg appearance-none"
							required
						>
							<option value="">Select Gender</option>
							<option value="male">Male</option>
							<option value="female">Female</option>
							<option value="other">Other</option>
						</select>
						<Button
							type="submit"
							className="w-full bg-[#B1ADA1] text-[#222] hover:bg-[#C15F3C] hover:text-white rounded-xl py-3 font-montserrat text-base font-semibold"
							disabled={!gender}
						>
							Continue
						</Button>
					</form>
				</div>
			</div>
		);
	}

	// Step 4: Preferences
	return (
		<div className="min-h-svh flex flex-col items-center justify-center bg-[#181716] text-[#F4F3EE]">
			<div className="flex flex-col items-center w-full">
				<span
					className="text-4xl mb-6"
					style={{ color: "#C15F3C" }}
				>
					★
				</span>
				<h2 className="font-poppins text-xl md:text-2xl mb-2 text-center">
					What are you into, {name}? Pick three topics to explore.
				</h2>
				<form
					className="w-full max-w-md flex flex-col items-center"
					onSubmit={async (e) => {
						e.preventDefault();
						if (preferences.length < 1) return;
						setLoading(true);
						setError(null);
						try {
							await saveOnboarding({
								display_name: name,
								age,
								gender,
								preferences,
							});
							setSuccess(true);
							// Optionally reload or redirect

							router.push("/chat");
						} catch (err: any) {
							setError(err.message || "Something went wrong");
						} finally {
							setLoading(false);
						}
					}}
				>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-6">
						{preferencesList.map((pref) => (
							<button
								type="button"
								key={pref.label}
								className={cn(
									"flex items-center gap-2 rounded-xl border border-[#B1ADA1] bg-[#222] px-4 py-3 font-montserrat text-base transition-colors",
									preferences.includes(pref.label)
										? "border-[#C15F3C] bg-[#181716] text-[#C15F3C]"
										: "hover:border-[#C15F3C] hover:bg-[#181716] text-[#F4F3EE]"
								)}
								onClick={() => {
									setPreferences((prev) =>
										prev.includes(pref.label)
											? prev.filter((p) => p !== pref.label)
											: prev.length < 3
												? [...prev, pref.label]
												: prev
									);
								}}
								aria-pressed={preferences.includes(pref.label)}
							>
								<span className="text-lg">{pref.icon}</span>
								{pref.label}
							</button>
						))}
					</div>
					{error && <div className="text-red-500 mb-2">{error}</div>}
					<Button
						type="submit"
						className="w-full bg-[#B1ADA1] text-[#222] hover:bg-[#C15F3C] hover:text-white rounded-xl py-3 font-montserrat text-base font-semibold"
						disabled={preferences.length < 1 || loading}
					>
						{loading ? "Saving..." : "Let's go"}
					</Button>
					{success && (
						<div className="text-green-500 mt-2">
							Onboarding complete!
						</div>
					)}
				</form>
			</div>
		</div>
	);
}
