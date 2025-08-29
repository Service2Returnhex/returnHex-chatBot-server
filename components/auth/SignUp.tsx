"use client";
import FormInput from "@/components/ui/FormInput";
import axios from "axios";
import { Image, Lock, Mail, MapPin, Phone, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const Signup = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
    image: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.contact ||
      !formData.address ||
      !formData.image ||
      !formData.role ||
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
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users/create-user`,
        {
          name: formData.name,
          email: formData.email,
          contact: formData.contact,
          address: formData.address,
          image: formData.image,
          role: formData.role,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }
      );
      console.log("response", response);

      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("Account created successfully!");
      router.push("/user-dashboard");
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="auth-layout bg-radial-aurora">
      <div className="auth-overlay" />
      {/* <Navigation title="Sign Up" /> */}
      <div className="auth-content pt-20">
        <div className="form-container ">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-4">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Create Account
            </h1>
            <p className="text-gray-300">
              Join us to manage your Facebook bots
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <FormInput
                label="Full Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="glass-input pl-10 text-white placeholder:text-gray-400"
                placeholder="Enter your full name"
                icon={<User className="h-5 w-5 text-gray-400" />}
                required
              />
            </div>

            <div className="space-y-2">
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                icon={<Mail className="h-5 w-5 text-gray-400" />}
                required
              />
            </div>
            <div className="space-y-2">
              <FormInput
                label="Contact"
                name="contact"
                type="phone"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Enter your phone number"
                icon={<Phone className="h-5 w-5 text-gray-400" />}
                required
              />
            </div>
            <div className="space-y-2">
              <FormInput
                label="Address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
                icon={<MapPin className="h-5 w-5 text-gray-400" />}
                required
              />
            </div>
            <div className="space-y-2">
              <FormInput
                label="Profile Image"
                name="image"
                type="file"
                onChange={handleChange}
                icon={<Image className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full glass-input pl-3 pr-10 py-2 text-white bg-transparent border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 text-sm  transition "
                required
              >
                <option value="" className="card-bg text-gray-100">
                  Select a role
                </option>
                <option value="user" className="card-bg text-gray-100">
                  User
                </option>
                <option value="admin" className="card-bg text-gray-100">
                  Admin
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <FormInput
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="glass-input pl-10 text-white placeholder:text-gray-400"
                placeholder="Enter your passowd"
                icon={<Lock className="h-5 w-5 text-gray-400" />}
                required
              />
            </div>

            {/* <div className="space-y-2">
              <FormInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="glass-input pl-10 text-white placeholder:text-gray-400"
                placeholder="Enter confirm passowd"
                icon={<Lock className="h-5 w-5 text-gray-400" />}
                required
              />
            </div> */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-3 transition-smooth"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <span className="text-gray-300">Already have an account?</span>
              <Link
                href={"/login"}
                className="text-purple-400 hover:text-purple-300 font-medium transition-smooth cursor-pointer"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
