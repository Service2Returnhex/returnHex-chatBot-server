"use client";
import FormInput from "@/components/ui/FormInput";
import Navigation from "@/components/ui/Navigation";
import { KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    // try {
    //   await api.post('/auth/forgot-password', { email });
    //   setEmailSent(true);
    //   toast.success('Password reset link sent to your email!');
    // } catch (error) {
    //   console.error('Forgot password error:', error);
    // } finally {
    //   setLoading(false);
    // }
  };

  if (emailSent) {
    return (
      <div className="auth-layout bg-radial-aurora">
        <div className="auth-overlay" />
        <Navigation title="Check Your Email" />
        <div className="auth-content pt-20">
          <div className="form-container text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-6">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Check Your Email
            </h1>
            <p className="text-gray-300 mb-8">
              We've sent a password reset link to{" "}
              <span className="text-blue-400">{email}</span>
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setEmailSent(false)}
                // variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Try Different Email
              </button>
              <Link href="/login">
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 cursor-pointer">
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
      <Navigation title="Forgot Password" />
      <div className="auth-content pt-20">
        <div className="form-container">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-4">
              <KeyRound className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Reset Password
            </h1>
            <p className="text-gray-300">
              Enter your email to receive a reset link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              {/* <Label htmlFor="email" className="text-white">Email Address</Label> */}
              <div className="relative">
                <FormInput
                  id="email"
                  label="Email Address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input pl-10 text-white placeholder:text-gray-400"
                  placeholder="Enter your email address"
                  icon={<Mail className="h-5 w-5 text-gray-400" />}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium py-3 transition-smooth cursor-pointer"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 text-sm transition-smooth"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
