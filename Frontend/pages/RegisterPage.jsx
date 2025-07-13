import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../src/supabase"; // adjust path as needed

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          display_name: formData.name, // ← store in metadata
        },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    // ✅ Fetch updated user to get metadata
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      alert(userError.message);
      return;
    }

    const user = userData?.user;
    const name = user?.user_metadata?.name || "Guest User";

    // ✅ Store the full user info locally
    localStorage.setItem(
      "user",
      JSON.stringify({
        name,
        email: user.email,
        age: "",
      })
    );

    navigate("/");
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#fddcd4] to-[#6a73d9] p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel with white padding */}
        <div className="hidden md:flex w-full md:w-1/2 p-6">
          <div className="bg-gradient-to-tr from-[#fddcd4] to-[#6a73d9] rounded-xl p-8 w-full text-white shadow-inner text-center">
            <h1 className="text-4xl font-bold mb-4 leading-snug mt-35">
              One Tap to Everything You Need
            </h1>
            <p className="text-md text-white/90">
              Experience seamless access to everything you desire, curated with care.
            </p>
          </div>
        </div>

        {/* Register Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white text-black">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Sign Up</h2>
              <p className="text-sm text-gray-500">
                Create your personalized account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700">
                  Email *
                </label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700">
                  Password *
                </label>
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type="password"
                  placeholder="Enter password"
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700">
                  Confirm Password *
                </label>
                <input
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  type="password"
                  placeholder="Confirm password"
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="flex items-start gap-2 text-gray-600">
                <input type="checkbox" required className="mt-1" />
                <span className="text-sm">
                  I agree to the Terms & Conditions and Privacy Policy
                </span>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 py-2 text-white rounded-lg font-semibold"
              >
                Get Started
              </button>
            </form>

            <p className="text-sm text-center text-gray-600">
              Already have an account?
              <span
                className="ml-1 text-purple-500 font-semibold cursor-pointer hover:underline"
                onClick={() => navigate("/login")}
              >
                Sign In
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
