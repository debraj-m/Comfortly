import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { supabase } from "../src/supabase"; // or your correct path


export default function UserContent({ selected, onClose }) {
    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem("user")) || {
            name: "Guest User",
            email: "guest@example.com",
            age: "",
        };
    });

    const [editingAge, setEditingAge] = useState(false);
    const [newAge, setNewAge] = useState(user.age || "");
    const [preference, setPreference] = useState(user.preference || "");

    const handleAgeSave = async () => {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
            console.error("Error fetching user:", userError.message);
            return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
            data: {
                age: newAge, // 👈 add/overwrite metadata field
            },
        });

        if (updateError) {
            console.error("Error updating age:", updateError.message);
            return;
        }

        const updatedUser = {
            ...user,
            user_metadata: {
                ...user.user_metadata,
                age: newAge,
            },
        };

        localStorage.setItem(
            "user",
            JSON.stringify({
                email: user.email,
                name: user.user_metadata.display_name || "Guest",
                age: newAge,
            })
        );

        setUser({
            email: user.email,
            name: user.user_metadata.display_name || "Guest",
            age: newAge,
        });

        setEditingAge(false);
    };

    const handlePreferenceSave = async () => {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
            console.error("Error getting user:", userError.message);
            return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
            data: {
                preference, // 👈 storing preference in metadata
            },
        });

        if (updateError) {
            console.error("Error updating preference:", updateError.message);
            return;
        }

        // Update localStorage and state
        const updatedUser = {
            ...user,
            user_metadata: {
                ...user.user_metadata,
                preference,
            },
        };

        localStorage.setItem(
            "user",
            JSON.stringify({
                email: user.email,
                name: user.user_metadata.display_name || "Guest",
                age: user.user_metadata.age || "",
                preference,
            })
        );

        setUser((prev) => ({
            ...prev,
            preference,
        }));

        alert("Preference saved successfully!");
    };



    return (
        <div className="p-20 w-full h-full flex justify-center items-center overflow-hidden bg-gradient-to-tr from-[#fddcd4] to-[#6a73d9]">
            <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md text-black relative z-10 animate-slide-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-6 text-black/50 hover:text-black text-2xl"
                >
                    ✕
                </button>

                {/* Profile View */}
                {selected === "profile" && (
                    <>
                        <FaUserCircle className="text-6xl text-[#fddcd4] mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-6 text-center">My Profile</h2>
                        <div className="space-y-4 text-left text-lg">
                            <div className="bg-[#fddcd4]/20 p-4 rounded-md border border-[#fddcd4]/50">
                                <strong className="block text-black/60">Name</strong>
                                <span>{user.name}</span>
                            </div>
                            <div className="bg-[#fddcd4]/20 p-4 rounded-md border border-[#fddcd4]/50">
                                <strong className="block text-black/60">Email</strong>
                                <span>{user.email}</span>
                            </div>

                            {/* Age Field */}
                            <div className="bg-[#fddcd4]/20 p-4 rounded-md border border-[#fddcd4]/50">
                                <strong className="block text-black/60 mb-1">Age</strong>
                                {!editingAge ? (
                                    <div className="flex items-center justify-between">
                                        <span>{user.age || "Not set"}</span>
                                        <button
                                            onClick={() => setEditingAge(true)}
                                            className="text-sm text-purple-600 hover:underline"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={newAge}
                                            onChange={(e) => setNewAge(e.target.value)}
                                            className="px-2 py-1 border rounded-md w-20 text-black"
                                        />
                                        <button
                                            onClick={handleAgeSave}
                                            className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                                        >
                                            Save
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Preferences View */}
                {selected === "preference" && (
                    <>
                        <h2 className="text-2xl font-bold mb-6 text-center">Preferences</h2>
                        <div className="space-y-4 text-left text-lg">
                            <div className="bg-[#fce9e4] p-4 rounded-md border border-[#e4b9b0]">
                                <strong className="block text-black/60 mb-2">Set your preference</strong>
                                <textarea
                                    className="w-full p-3 rounded-md border border-[#e4b9b0] bg-white text-black resize-none"
                                    rows="4"
                                    placeholder="Your current preference..."
                                    value={preference}
                                    onChange={(e) => setPreference(e.target.value)}
                                ></textarea>

                                <button
                                    onClick={handlePreferenceSave}
                                    className="mt-2 text-sm bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                                >
                                    Save Preference
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
