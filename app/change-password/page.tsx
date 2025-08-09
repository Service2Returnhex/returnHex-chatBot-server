"use client";
import FormInput from "@/components/ui/FormInput";
import Navigation from "@/components/ui/Navigation";
import { Lock, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const ChangePassword = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.oldPassword ||
      !formData.newPassword ||
      !formData.confirmNewPassword
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      toast.error("New password must be different from old password");
      return;
    }

    setLoading(true);
    // try {
    //   await api.patch("/auth/change-password", {
    //     oldPassword: formData.oldPassword,
    //     newPassword: formData.newPassword,
    //     confirmNewPassword: formData.confirmNewPassword,
    //   });

    //   toast.success("Password changed successfully!");
    //   router.push("/dashboard/user");
    // } catch (error) {
    //   console.error("Change password error:", error);
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="auth-layout  bg-radial-aurora">
      <div className="auth-overlay" />
      <Navigation title="Change Password" />
      <div className="auth-content pt-20">
        <div className="form-container">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Change Password
            </h1>
            <p className="text-gray-300">
              Update your password for better security
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <FormInput
                  id="oldPassword"
                  label=" Current Password"
                  name="oldPassword"
                  type="password"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  icon={<Lock className="h-5 w-5 text-gray-400" />}
                  className="glass-input pl-10 text-white placeholder:text-gray-400"
                  placeholder="Enter current password"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <FormInput
                  id="newPassword"
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  icon={<Lock className="h-5 w-5 text-gray-400" />}
                  className="glass-input pl-10 text-white placeholder:text-gray-400"
                  placeholder="Enter new password"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <FormInput
                  id="confirmNewPassword"
                  label="Confirm New Password"
                  name="confirmNewPassword"
                  type="password"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  icon={<Lock className="h-5 w-5 text-gray-400" />}
                  className="glass-input pl-10 text-white placeholder:text-gray-400"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 transition-smooth cursor-pointer"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Make sure your new password is strong and unique
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
