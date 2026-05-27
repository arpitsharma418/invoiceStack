import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api.js";
import { useAuth } from "../AuthContext.js";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    business_name: "",
  });
  const { setUser } = useAuth();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/register", form);
      setUser(res?.data?.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="text-3xl font-bold mb-2 text-center">Register</h1>

        <p className="text-gray-500 text-sm text-center mb-8">
          Create your account
        </p>

        {error && (
          <p className="text-red-500 text-xs mb-4 bg-red-100 py-2 text-center rounded">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="input_theme"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="input_theme"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="input_theme"
          />

          <input
            type="text"
            name="business_name"
            placeholder="Business Name (Optional)"
            value={form.business_name}
            onChange={handleChange}
            className="input_theme"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full text-sm bg-black text-white py-3 rounded mt-5"
        >
          {loading ? "Loading..." : "Register"}
        </button>

        <p className="text-sm text-center mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
