// import TopNavigation from "@/components/layout/TopNavigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import api from "@/lib/api";
// import { Lock, Mail, User, UserPlus } from "lucide-react";
// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";

// const Signup = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (
//       !formData.name ||
//       !formData.email ||
//       !formData.password ||
//       !formData.confirmPassword
//     ) {
//       toast.error("Please fill in all fields");
//       return;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     if (formData.password.length < 6) {
//       toast.error("Password must be at least 6 characters long");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await api.post("/auth/signup", {
//         name: formData.name,
//         email: formData.email,
//         password: formData.password,
//       });

//       localStorage.setItem("authToken", response.data.token);
//       localStorage.setItem("user", JSON.stringify(response.data.user));
//       toast.success("Account created successfully!");
//       navigate("/dashboard/user");
//     } catch (error) {
//       console.error("Signup error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   return (
//     <div className="auth-layout">
//       <div className="auth-overlay" />
//       <TopNavigation title="Sign Up" />
//       <div className="auth-content pt-20">
//         <div className="form-container">
//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-4">
//               <UserPlus className="h-8 w-8 text-white" />
//             </div>
//             <h1 className="text-2xl font-bold text-white mb-2">
//               Create Account
//             </h1>
//             <p className="text-gray-300">
//               Join us to manage your Facebook bots
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="space-y-2">
//               <Label htmlFor="name" className="text-white">
//                 Full Name
//               </Label>
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <Input
//                   id="name"
//                   name="name"
//                   type="text"
//                   value={formData.name}
//                   onChange={handleChange}
//                   className="glass-input pl-10 text-white placeholder:text-gray-400"
//                   placeholder="Enter your full name"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="email" className="text-white">
//                 Email
//               </Label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <Input
//                   id="email"
//                   name="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="glass-input pl-10 text-white placeholder:text-gray-400"
//                   placeholder="Enter your email"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password" className="text-white">
//                 Password
//               </Label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <Input
//                   id="password"
//                   name="password"
//                   type="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="glass-input pl-10 text-white placeholder:text-gray-400"
//                   placeholder="Create a password"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="confirmPassword" className="text-white">
//                 Confirm Password
//               </Label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <Input
//                   id="confirmPassword"
//                   name="confirmPassword"
//                   type="password"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   className="glass-input pl-10 text-white placeholder:text-gray-400"
//                   placeholder="Confirm your password"
//                   required
//                 />
//               </div>
//             </div>

//             <Button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-3 transition-smooth"
//             >
//               {loading ? "Creating account..." : "Create Account"}
//             </Button>
//           </form>

//           <div className="mt-6 text-center">
//             <div className="flex items-center justify-center space-x-2 text-sm">
//               <span className="text-gray-300">Already have an account?</span>
//               <Link
//                 to="/login"
//                 className="text-purple-400 hover:text-purple-300 font-medium transition-smooth"
//               >
//                 Sign in
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Signup;
