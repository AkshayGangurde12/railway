import { useState, useContext } from "react";
import axios from "axios";
import { auth, provider } from "../config/firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactLoading from "react-loading";
import { FcGoogle } from "react-icons/fc";
import { AppContext } from "../context/AppContext";
import RoleSelectionModal from "../components/RoleSelectionModal";
import { FaUserMd, FaUserInjured } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AppContext);

  const [isDoctor, setIsDoctor] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleToggle = (role) => {
    setIsDoctor(role === "doctor");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isDoctor
        ? "http://localhost:5000/api/doctor/login"
        : "http://localhost:5000/api/user/login";

      const response = await axios.post(endpoint, {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success && response.data.token) {
        localStorage.setItem("jwtToken", response.data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

        if (isDoctor) {
          login(response.data.doctor, response.data.token, true);
        } else {
          login(response.data.user, response.data.token, false);
        }

        toast.success("Login successful!");
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInClick = () => {
    setShowRoleModal(true);
  };

  const handleRoleSelectAndGoogleSignIn = async (role) => {
    setShowRoleModal(false);
    setLoading(true);
    setSelectedRole(role);

    try {
      const result = await signInWithPopup(auth, provider);
      const { user } = result;

      if (!user || !user.email) {
        throw new Error("Failed to get user information from Google");
      }

      const userData = {
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL,
        uid: user.uid,
        role: role,
      };

      const response = await axios.post("http://localhost:5000/api/auth/google", userData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        localStorage.setItem("jwtToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

        login(response.data.user, response.data.token, role === "doctor");

        toast.success("Successfully signed in!");
        navigate("/");
      } else {
        throw new Error(response.data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      let errorMessage = "Failed to sign in with Google";

      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in popup was closed before completing the sign-in";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Sign-in popup was blocked by the browser. Please allow popups.";
      } else if (error.code === "auth/cancelled-popup-request") {
        errorMessage = "Multiple popup requests were made";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setSelectedRole(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header with Role Toggle */}
        <div className={`p-6 ${isDoctor ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'} text-white`}>
          <div className="flex items-center justify-center mb-4">
            {isDoctor ? (
              <FaUserMd className="text-4xl mr-3" />
            ) : (
              <FaUserInjured className="text-4xl mr-3" />
            )}
            <h2 className="text-2xl font-bold">
              {isDoctor ? "Doctor Login" : "Patient Login"}
            </h2>
          </div>
          
          <div className="flex justify-center space-x-2 bg-white/20 rounded-lg p-1">
          <button
            onClick={() => handleToggle("patient")}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
                !isDoctor 
                  ? "bg-white text-blue-600 shadow-md" 
                  : "text-white hover:bg-white/10"
              }`}
          >
              <div className="flex items-center justify-center">
                <FaUserInjured className="mr-2" />
            Patient
              </div>
          </button>
          <button
            onClick={() => handleToggle("doctor")}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
                isDoctor 
                  ? "bg-white text-green-600 shadow-md" 
                  : "text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-center">
                <FaUserMd className="mr-2" />
            Doctor
              </div>
          </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              placeholder="Enter your email"
              required
              disabled={loading}
              aria-label="Email"
            />
              </div>
          </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              placeholder="Enter your password"
              required
              disabled={loading}
              aria-label="Password"
            />
              </div>
          </div>

            <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </a>
          </div>

          <button
            type="submit"
            disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                isDoctor 
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" 
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
                <div className="flex items-center justify-center">
                  <ReactLoading type="spin" height={20} width={20} className="mr-2" />
                  Signing in...
                </div>
            ) : (
                "Sign In"
            )}
          </button>
        </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignInClick}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FcGoogle className="text-xl" />
            <span>Sign in with Google</span>
          </button>

          {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a 
              href="/signup" 
                className={`font-medium hover:underline ${
                  isDoctor ? "text-green-600" : "text-blue-600"
                }`}
            >
                Sign up
            </a>
          </p>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onRoleSelect={handleRoleSelectAndGoogleSignIn}
      />
    </div>
  );
};

export default Login;
