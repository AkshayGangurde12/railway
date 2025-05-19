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
        ? "http://localhost:4000/api/doctor/login"
        : "http://localhost:4000/api/user/login";

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

      console.log('Sending Google auth data to backend:', userData);

      const response = await axios.post("http://localhost:4000/api/auth/google", userData, {
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login</h2>

        {/* Role Toggle */}
        <div className="mb-4 flex justify-center">
          <button
            onClick={() => handleToggle("patient")}
            className={`px-4 py-2 border ${!isDoctor ? "bg-blue-500 text-white" : "bg-white text-blue-500"} rounded-l focus:outline-none`}
          >
            Patient
          </button>
          <button
            onClick={() => handleToggle("doctor")}
            className={`px-4 py-2 border ${isDoctor ? "bg-blue-500 text-white" : "bg-white text-blue-500"} rounded-r focus:outline-none`}
          >
            Doctor
          </button>
        </div>

        {/* Email/Password Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-600 font-medium mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
              required
              disabled={loading}
              aria-label="Email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-600 font-medium mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
              required
              disabled={loading}
              aria-label="Password"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="rememberMe" className="text-gray-600">Remember me</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <ReactLoading type="spin" height={20} width={20} className="mx-auto" />
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Google Sign In */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignInClick}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FcGoogle className="text-xl" />
            Sign in with Google
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a 
              href="/signup" 
              className="text-blue-500 hover:text-blue-600 font-medium hover:underline"
            >
              Create an account
            </a>
          </p>
        </div>
      </div>

      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onRoleSelect={handleRoleSelectAndGoogleSignIn}
      />

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Login;
