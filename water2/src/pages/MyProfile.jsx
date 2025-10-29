import React, { useState, useEffect ,useContext} from "react";
import axios from "axios";
import sha256 from "sha256";
import { AppContext } from "../context/AppContext";
import Sidebar from "../components/Sidebar";
import { Eye, EyeOff } from "lucide-react"; // For password visibility toggle
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ethers } from "ethers";
import { contractABI } from "./constants"; // Ensure your contractABI is correctly imported
import Modal from "react-modal";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Set Modal's root element for accessibility
Modal.setAppElement("#root");

// Hardcoded values for local Hardhat (DO NOT use in production)
const PRIVATE_KEY = "0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61";
const PROVIDER_URL = "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Your deployed contract address

const MyProfile = () => {
  const { isDoctor } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(
    isDoctor ? {
      email: "",
      password: "",
      name: "",
      speciality: "",
      degree: "",
      experience: "",
      about: "",
      fees: "",
      address: "",
      available: true,
      patients: []
    } : {
      email: "",
      password: "",
      gender: "",
      dob: "",
      phone: "",
      bloodGroup: "",
      age: "",
      emergencyContact: "",
      allergies: "",
      vaccinationHistory: "",
      healthInsurancePolicy: "",
      doctorAssigned: "",
      documents: ""
    }
  );
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState("");
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfRecord, setPdfRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // For blockchain (if used later)
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showImageMenu && !event.target.closest('.profile-picture-container')) {
        setShowImageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showImageMenu]);

  // Fetch user data from backend using token from localStorage
  useEffect(() => {    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
          setError("User token not found");
          setLoading(false);
          return;
        }

        // Choose endpoint based on user type
        const endpoint = isDoctor 
          ? "http://localhost:5000/api/doctor/me"
          : "http://localhost:5000/api/user/me";

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          const userData = isDoctor ? response.data.doctor : response.data.user;
          setUser(response.data.user);
          console.log("Fetched user:", response.data.user);

          // Set form data based on user type
          if (isDoctor) {
            setFormData({
      email: userData.email || "",
      password: userData.password || "",
      name: userData.name || "",
      speciality: userData.speciality || "",
      degree: userData.degree || "",
      experience: userData.experience || "",
      about: userData.about || "",
      fees: userData.fees || "",
      address: userData.address || "",
      available: userData.available ?? true,
      patients: userData.patients || []
            });
          } else {
            // Existing user form data setting
            setFormData({
              email: response.data.user.email || "",
              password: response.data.user.password || "",
              // ...rest of your existing user fields...
            });

            // Handle PDF for patient
            if (response.data.user.documents?.pdf) {
              // Your existing PDF handling code...
            }
          }
        } else {
          setError("Failed to load user data.");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isDoctor]);

  const renderDoctorDisplayView = () => (
    <div className="space-y-4">
      {renderProfilePicture()}
      
      <p><span className="font-medium">Name:</span> {user?.name}</p>
      <p><span className="font-medium">Email:</span> {user?.email}</p>
      <p><span className="font-medium">Speciality:</span> {user?.speciality}</p>
      <p><span className="font-medium">Degree:</span> {user?.degree}</p>
      <p><span className="font-medium">Experience:</span> {user?.experience}</p>
      <p><span className="font-medium">About:</span> {user?.about}</p>
      <p><span className="font-medium">Fees:</span> ₹{user?.fees}</p>
      <p><span className="font-medium">Address:</span> {user?.address}</p>
      <p><span className="font-medium">Available:</span> {user?.available ? "Yes" : "No"}</p>
      
      {user?.patients && user.patients.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Assigned Patients:</h3>
          <ul className="list-disc pl-5">
            {user.patients.map((patient, index) => (
              <li key={index}>
                {patient.email} - Status: {patient.status}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleEditClick}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Edit Profile
      </button>
    </div>
  );

  // Render edit view for doctor
  const renderDoctorEditView = () => (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:bg-gray-50"
            required
          />
        </div>

        {/* Speciality */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Speciality</label>
          <input
            type="text"
            name="speciality"
            value={formData.speciality}
            onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:bg-gray-50"
            required
          />
        </div>

        {/* Other doctor-specific fields */}
        {/* ... Add similar input fields for degree, experience, about, fees, address */}

        {/* Available Status */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Available for New Patients
          </label>
          <input
            type="checkbox"
            name="available"
            checked={formData.available}
            onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-600">I am available for new patients</span>
        </div>
      </div>

      {/* Save and Cancel Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Updating..." : "Save"}
        </button>
        <button
          type="button"
          onClick={handleCancelEdit}
          className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
        >
          Cancel
        </button>
      </div>
    </form>
  );
  // Generate PDF from user data
  const generatePDF = (data) => {
    const doc = new jsPDF();
    doc.text("User Profile", 14, 15);

    const tableColumn = ["Field", "Value"];
    const tableRows = [];

    Object.entries(data).forEach(([key, value]) => {
      tableRows.push([key, value]);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    const pdfArrayBuffer = doc.output("arraybuffer");

    return { blobUrl, pdfArrayBuffer };
  };

  // Profile update submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPdfUrl(null);
    setPdfRecord(null);

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });
    if (prescriptionImage) {
      submitData.append("prescriptionImage", prescriptionImage);
    }

    try {
      const response = await axios.put(
        "http://localhost:5000/api/user/update",
        submitData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.data.success) {
        setUser(response.data.user);
        alert("Profile updated successfully");
        const { blobUrl, pdfArrayBuffer } = generatePDF(response.data.user);
        setPdfUrl(blobUrl);
        await handleStorePdf(pdfArrayBuffer);
        setIsEditing(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // Function to generate SHA‑256 hash and store PDF in MongoDB
  const handleStorePdf = async (pdfArrayBuffer) => {
    try {
      console.log("handleStorePdf: Started processing PDF");
      const pdfHash = sha256(pdfArrayBuffer);
      console.log("handleStorePdf: Computed PDF hash:", pdfHash);
      const pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
      const pdfFile = new File([pdfBlob], "profile.pdf", { type: "application/pdf" });
      console.log("handleStorePdf: Created PDF file:", pdfFile);
      const pdfFormData = new FormData();
      pdfFormData.append("pdf", pdfFile);
      console.log("handleStorePdf: FormData prepared. Keys:", [...pdfFormData.keys()]);
      const uploadUrl = "http://localhost:5000/api/user/upload-pdf";
      console.log("handleStorePdf: Sending PUT request to:", uploadUrl);
      const response = await axios.put(uploadUrl, pdfFormData);
      console.log("handleStorePdf: Received response:", response);
      console.log("handleStorePdf: PDF stored in MongoDB successfully!");
    } catch (err) {
      console.error("handleStorePdf: Error storing PDF in MongoDB:", err);
      if (err.response) {
        console.error("handleStorePdf: Error response data:", err.response.data);
        console.error("handleStorePdf: Error response status:", err.response.status);
      }
    }
  };

  // Profile Image Management Functions
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Upload immediately
      uploadProfileImage(file);
    }
  };

  const uploadProfileImage = async (file) => {
    setImageUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const token = localStorage.getItem("jwtToken");
      const endpoint = isDoctor 
        ? "http://localhost:5000/api/doctor/update-image"
        : "http://localhost:5000/api/user/update-image";
      
      const response = await axios.put(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      });
      
      if (response.data.success) {
        // Update user state with new image
        setUser(prev => ({
          ...prev,
          image: response.data.image
        }));
        setError('');
        toast.success('Profile picture updated successfully!');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (window.confirm('Are you sure you want to remove your profile picture?')) {
      setImageUploading(true);
      setError('');
      
      try {
        const token = localStorage.getItem("jwtToken");
        const endpoint = isDoctor 
          ? "http://localhost:5000/api/doctor/remove-image"
          : "http://localhost:5000/api/user/remove-image";
        
        const response = await axios.delete(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          },
        });
        
        if (response.data.success) {
          // Reset to default image
          setUser(prev => ({
            ...prev,
            image: response.data.image
          }));
          setProfileImage(null);
          setProfileImagePreview(null);
          toast.success('Profile picture removed successfully!');
        }
      } catch (err) {
        console.error('Error removing image:', err);
        setError(err.response?.data?.message || 'Failed to remove image');
      } finally {
        setImageUploading(false);
      }
    }
  };

  const getProfileImageSrc = () => {
    if (profileImagePreview) {
      return profileImagePreview;
    }
    if (user?.image?.base64) {
      return `data:${user.image.mimeType || 'image/png'};base64,${user.image.base64}`;
    }
    // Default placeholder image
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTA1QzExNi41NjkgMTA1IDEzMCA5MS41NjkgMTMwIDc1QzEzMCA1OC40MzEgMTE2LjU2OSA0NSAxMDAgNDVDODMuNDMxIDQ1IDcwIDU4LjQzMSA3MCA3NUM3MCA5MS41NjkgODMuNDMxIDEwNSAxMDAgMTA1WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTAwIDEyMEM5Mi4wNDM1IDEyMCA4NC4zNDc4IDEyMy4xNjEgNzguNzg2OCAxMjguNzIyQzczLjIyNTggMTM0LjI4MyA3MCA0MS45NTY1IDcwIDE1MEg3NS4yMTc0SDEyNC43ODNIMTMwQzEzMCAxNDEuOTU2NSAxMjYuNzc0IDEzNC4yODMgMTIxLjIxMyAxMjguNzIyQzExNS42NTIgMTIzLjE2MSAxMDcuOTU2IDEyMCAxMDAgMTIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
  };

  // Toggle to enter edit mode
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Cancel edit and revert formData to original user data
  const handleCancelEdit = () => {
    setFormData({
      email: user?.email || "",
      password: user?.password || "",
      gender: user?.gender || "",
      dob: user?.dob || "",
      phone: user?.phone || "",
      bloodGroup: user?.bloodGroup || "",
      age: user?.age || "",
      emergencyContact: user?.emergencyContact || "",
      allergies: user?.allergies || "",
      vaccinationHistory: user?.vaccinationHistory || "",
      healthInsurancePolicy: user?.healthInsurancePolicy || "",
      doctorAssigned: user?.doctorAssigned || "",
      documents: user?.documents || ""
    });
    setPrescriptionImage(null);
    setIsEditing(false);
  };

  // Profile Picture Component with Click Menu
  const renderProfilePicture = () => (
    <div className="text-center mb-8">
      <div className="relative inline-block profile-picture-container">
        {/* Profile Picture - Clickable */}
        <div 
          className="relative cursor-pointer group"
          onClick={() => setShowImageMenu(!showImageMenu)}
        >
          <img
            src={getProfileImageSrc()}
            alt="Profile Picture"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg transition-all duration-200 group-hover:brightness-75"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTA1QzExNi41NjkgMTA1IDEzMCA5MS41NjkgMTMwIDc1QzEzMCA1OC40MzEgMTE2LjU2OSA0NSAxMDAgNDVDODMuNDMxIDQ1IDcwIDU4LjQzMSA3MCA3NUM3MCA5MS41NjkgODMuNDMxIDEwNSAxMDAgMTA1WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTAwIDEyMEM5Mi4wNDM1IDEyMCA4NC4zNDc4IDEyMy4xNjEgNzguNzg2OCAxMjguNzIyQzczLjIyNTggMTM0LjI4MyA3MCA0MS45NTY1IDcwIDE1MEg3NS4yMTc0SDEyNC43ODNIMTMwQzEzMCAxNDEuOTU2NSAxMjYuNzc0IDEzNC4yODMgMTIxLjIxMyAxMjguNzIyQzExNS42NTIgMTIzLjE2MSAxMDcuOTU2IDEyMCAxMDAgMTIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
            }}
          />
          
          {/* Camera Icon Overlay */}
          <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
            <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          
          {/* Loading Overlay */}
          {imageUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        
        {/* Dropdown Menu */}
        {showImageMenu && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[160px]">
            <div className="py-2">
              {/* Add Image Option */}
              <label className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors duration-200">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleImageUpload(e);
                    setShowImageMenu(false);
                  }}
                  className="hidden"
                  disabled={imageUploading}
                />
              </label>
              
              {/* Remove Image Option */}
              <button
                onClick={() => {
                  handleRemoveImage();
                  setShowImageMenu(false);
                }}
                disabled={imageUploading}
                className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 disabled:opacity-50"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove Image
              </button>
              
              {/* View Full Size Option */}
              <button
                onClick={() => {
                  setShowImageModal(true);
                  setShowImageMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Full Size
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Click instruction */}
      <p className="text-gray-500 text-sm mt-2">Click on image to edit</p>
      
      {error && (
        <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );

  // Render display view (read-only)
  const renderDisplayView = () => (
    <div className="space-y-4">
      {renderProfilePicture()}
      
      <p>
        <span className="font-medium">Email:</span> {user?.email}
      </p>
      <p>
        <span className="font-medium">Password:</span> {user?.password}
      </p>
      <p>
        <span className="font-medium">Gender:</span> {user?.gender}
      </p>
      <p>
        <span className="font-medium">DOB:</span> {user?.dob}
      </p>
      <p>
        <span className="font-medium">Phone:</span> {user?.phone}
      </p>
      <p>
        <span className="font-medium">Blood Group:</span> {user?.bloodGroup}
      </p>
      <p>
        <span className="font-medium">Age:</span> {user?.age}
      </p>
      <p>
        <span className="font-medium">Emergency Contact:</span> {user?.emergencyContact}
      </p>
      <p>
        <span className="font-medium">Allergies:</span> {user?.allergies}
      </p>
      <p>
        <span className="font-medium">Vaccination History:</span> {user?.vaccinationHistory}
      </p>
      {/* Button to open PDF preview modal */}
      {pdfUrl && (
        <button
          onClick={() => setIsPdfOpen(true)}
          className="mt-4 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          Preview PDF
        </button>
      )}
      <button
        onClick={handleEditClick}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Edit Profile
      </button>
    </div>
  );

  // Render editable form view
  const renderEditView = () => (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:bg-gray-50"
            autoComplete="email"
            required
          />
        </div>
        {/* Password */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:bg-gray-50"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-500" />
              ) : (
                <Eye className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>
        {/* Gender */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:bg-gray-50"
            required
          >
            <option value="" disabled>
              Select your gender
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Others">Others</option>
          </select>
        </div>
        {/* Phone */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:bg-gray-50"
            placeholder="Enter your phone number"
            autoComplete="tel"
            required
          />
        </div>
        {/* Blood Group */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Blood Group
          </label>
          <input
            type="text"
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:bg-gray-50"
            placeholder="Enter your blood group"
            autoComplete="off"
            required
          />
        </div>
        {/* Age */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Age
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:bg-gray-50"
            placeholder="Enter your age"
            autoComplete="off"
            required
          />
        </div>
        {/* Additional Fields */}
        {Object.keys(formData)
          .filter((field) =>
            !["email", "password", "gender", "phone", "bloodGroup", "age", "doctorAssigned"].includes(field)
          )
          .map((field) => (
            <div key={field} className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 capitalize">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type={field === "dob" ? "date" : "text"}
                name={field}
                value={formData[field]}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:bg-gray-50"
                autoComplete="off"
                required
              />
            </div>
          ))}
      </div>
      {/* Prescription Image Upload */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Prescription Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPrescriptionImage(e.target.files[0])}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:bg-gray-50"
        />
      </div>
      {/* Save and Cancel Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Updating..." : "Save"}
        </button>
        <button
          type="button"
          onClick={handleCancelEdit}
          className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

return (
  <div className="min-h-screen flex bg-white">
    <Sidebar />
    <div className="flex-1 p-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isDoctor ? "Doctor Profile" : "My Profile"}
        </h2>
        
        {/* Toggle between display and edit mode based on user type */}
        {isDoctor 
          ? (isEditing ? renderDoctorEditView() : renderDoctorDisplayView())
          : (isEditing ? renderEditView() : renderDisplayView())
        }

        {/* PDF Download Link (if generated and not a doctor) */}
        {!isDoctor && pdfUrl && (
          <div className="mt-4 text-center space-y-4">
            <a
              href={pdfUrl}
              download="profile.pdf"
              className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Download PDF
            </a>
          </div>
        )}
      </div>
    </div>

    {/* Modal for PDF Preview using an iframe (only for patients) */}
    {!isDoctor && (
      <Modal
        isOpen={isPdfOpen}
        onRequestClose={() => setIsPdfOpen(false)}
        style={{
          content: { width: "80%", height: "80%", margin: "auto", overflow: "hidden" },
        }}
      >
        <div className="flex justify-end">
          <button onClick={() => setIsPdfOpen(false)} className="text-red-500 font-bold">
            Close
          </button>
        </div>
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="PDF Preview"
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        ) : (
          <p>No PDF available</p>
        )}
      </Modal>
    )}

    {/* Profile Image Modal */}
    <Modal
      isOpen={showImageModal}
      onRequestClose={() => setShowImageModal(false)}
      style={{
        content: { 
          width: "90%", 
          height: "90%", 
          margin: "auto", 
          borderRadius: "12px",
          padding: "0",
          border: "none",
          background: "rgba(0, 0, 0, 0.9)"
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.8)"
        }
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Close Button */}
        <button 
          onClick={() => setShowImageModal(false)}
          className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Full Size Image */}
        <img
          src={getProfileImageSrc()}
          alt="Profile Picture - Full Size"
          className="max-w-full max-h-full object-contain rounded-lg"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTA1QzExNi41NjkgMTA1IDEzMCA5MS41NjkgMTMwIDc1QzEzMCA1OC40MzEgMTE2LjU2OSA0NSAxMDAgNDVDODMuNDMxIDQ1IDcwIDU4LjQzMSA3MCA3NUM3MCA5MS41NjkgODMuNDMxIDEwNSAxMDAgMTA1WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTAwIDEyMEM5Mi4wNDM1IDEyMCA4NC4zNDc4IDEyMy4xNjEgNzguNzg2OCAxMjguNzIyQzczLjIyNTggMTM0LjI4MyA3MCA0MS45NTY1IDcwIDE1MEg3NS4yMTc0SDEyNC43ODNIMTMwQzEzMCAxNDEuOTU2NSAxMjYuNzc0IDEzNC4yODMgMTIxLjIxMyAxMjguNzIyQzExNS42NTIgMTIzLjE2MSAxMDcuOTU2IDEyMCAxMDAgMTIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
          }}
        />
        
        {/* Image Info */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center bg-black bg-opacity-30 rounded-lg px-4 py-2">
          <p className="text-sm">Profile Picture</p>
        </div>
      </div>
    </Modal>
    
    {/* Toast Notifications */}
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  </div>
);
};

export default MyProfile;