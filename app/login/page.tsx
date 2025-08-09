"use client";
import FormInput from "@/components/ui/FormInput";
import Navigation from "@/components/ui/Navigation";
import { Lock, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const Signup = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    // try {
    //   const response = await api.post("/auth/signup", {
    //     name: formData.name,
    //     email: formData.email,
    //     password: formData.password,
    //   });

    //   localStorage.setItem("authToken", response.data.token);
    //   localStorage.setItem("user", JSON.stringify(response.data.user));
    //   toast.success("Account created successfully!");
    //   navigate("/dashboard/user");
    // } catch (error) {
    //   console.error("Signup error:", error);
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="auth-layout bg-radial-aurora">
      <div className="auth-overlay" />
      <Navigation title="Sign Up" />
      <div className="auth-content pt-20">
        <div className="form-container ">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-300">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter you email"
                icon={<Mail className="h-5 w-5 text-gray-400" />}
                required
              />
            </div>

            <div className="space-y-2">
              <FormInput
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="glass-input pl-10 text-white placeholder:text-gray-400"
                placeholder="Enter passowd"
                icon={<Lock className="h-5 w-5 text-gray-400" />}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 transition-smooth cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <Link
              href={"/forgot-password"}
              className="text-blue-400 hover:text-blue-300 text-sm transition-smooth"
            >
              Forgot your password?
            </Link>

            <div className="flex items-center justify-center space-x-2 text-sm">
              <span className="text-gray-300">Don't have an account?</span>
              <Link
                href={"/sign-up"}
                className="text-blue-400 hover:text-blue-300 font-medium transition-smooth"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
