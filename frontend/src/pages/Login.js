import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.js";
import API from "../api.js";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const { setUser } = useAuth();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

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
      const res = await API.post("/auth/login", form);
      setUser(res?.data?.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-2">Login</h1>

        <p className="text-sm text-gray-500 text-center mb-8">Welcome back</p>

        {error && (
          <p className="text-red-500 text-xs mb-4 bg-red-100 py-2 text-center rounded">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-5">
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 text-sm rounded mt-8"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center mt-5">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
