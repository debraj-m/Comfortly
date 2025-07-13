import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../src/supabase"; // adjust path as needed

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setError(error.message);
    } else {
      const { user } = data;

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: user.email,
          name: user.user_metadata.display_name || "No name", // 👈 get from metadata
          age: "",
        })
      );

      navigate("/");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#fddcd4] to-[#6a73d9] p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel */}
        <div className="hidden md:flex w-full md:w-1/2 p-6 text-center">
          <div className="bg-gradient-to-tr from-[#fddcd4] to-[#6a73d9] rounded-xl p-8 w-full text-white shadow-inner">
            <h1 className="text-4xl font-bold mb-4 leading-snug mt-19">
              The only partner you need
            </h1>
            <p className="text-md text-white/90">
              Experience seamless access to everything you desire, curated with care.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white text-black">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Sign In</h2>
              <p className="text-sm text-gray-500">
                Welcome back! Please login to your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700">
                  Email *
                </label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="Enter your email address"
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

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800"
              >
                Sign In
              </button>
            </form>

            <p className="text-sm text-center text-gray-600">
              Don’t have an account?
              <span
                className="ml-1 text-purple-500 font-semibold cursor-pointer hover:underline"
                onClick={() => navigate("/register")}
              >
                Sign Up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
