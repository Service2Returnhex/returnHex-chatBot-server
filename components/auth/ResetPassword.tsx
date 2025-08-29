"use client";

import FormInput from "@/components/ui/FormInput";
import axios from "axios";
import { Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams?.get("id") ?? "";
  const queryToken = searchParams?.get("token") ?? "";

  const [id, setId] = useState<string>(queryId);
  const [token, setToken] = useState<string>(queryToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // keep synced if query changes
    setId(queryId);
    setToken(queryToken);
  }, [queryId, queryToken]);

  console.log("token", token);
  const validate = () => {
    if (!token) {
      toast.error("Reset token missing. Please use the link from your email.");
      return false;
    }
    if (!password || !confirmPassword) {
      toast.error("Please fill both password fields.");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 8 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Adjust URL/method/body to match your backend contract if needed
      const resp = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/auth/reset-password`,
        { id, newPassword: password }, // backend expected body: { token, password }
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
        // { withCredentials: true }
      );
      console.log("reset res", resp);
      toast.success(
        resp?.data?.message ??
          "Password has been reset. Redirecting to login..."
      );

      // redirect to login after short delay
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      console.error("Reset password error:", err);
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Unable to reset password. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // If no token found show helpful UI
  if (!token) {
    return (
      <div className="auth-layout bg-radial-aurora">
        <div className="auth-overlay" />
        <div className="auth-content pt-20">
          <div className="form-container text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Reset link invalid
            </h1>
            <p className="text-gray-300 mb-6">
              The password reset link appears to be missing or invalid.
            </p>
            <div className="space-y-4 max-w-sm mx-auto">
              <Link href="/forget-password">
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-md cursor-pointer">
                  Request new reset link
                </button>
              </Link>
              <Link href="/login">
                <button className="w-full border border-white/20 text-white py-3 rounded-md cursor-pointer">
                  Back to Login
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-layout bg-radial-aurora">
      <div className="auth-overlay" />
      <div className="auth-content pt-20">
        <div className="form-container max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Create new password
            </h1>
            <p className="text-gray-300">
              Enter a strong new password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <FormInput
                id="password"
                label="New Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                className="glass-input pl-10 text-white placeholder:text-gray-400"
                placeholder="Enter new password"
                icon={<Lock className="h-5 w-5 text-gray-400" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-7 p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-300 cursor-pointer" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-300 cursor-pointer" />
                )}
              </button>
            </div>

            <div className="relative">
              <FormInput
                id="confirmPassword"
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
                className="glass-input pl-10 text-white placeholder:text-gray-400"
                placeholder="Confirm new password"
                icon={<Lock className="h-5 w-5 text-gray-400" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-7 p-1"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOff className="h-5 w-5 text-gray-300 cursor-pointer" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-300 cursor-pointer" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium py-3 rounded-md transition-smooth cursor-pointer"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 text-sm transition-smooth cursor-pointer"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
