import React, { useState , useContext ,useEffect } from "react"
import { motion } from "framer-motion"
import { Home, MapPin, Building, Flag, Mail, Phone, AlertCircle, FileText, ChevronDown } from "lucide-react"
import Sidebar from "../components/Sidebar"
import { AppContext } from "../context/AppContext"
import axios from "axios"

const inputVariants = {
    focus: { scale: 0.98 },
    blur: { scale: 1 },
}

export default function Address() {
  const { user: contextUser } = useContext(AppContext);
  const [formData, setFormData] = useState({
    permanentAddress: "",
    correspondenceAddress: "",
    lane: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    landmark: "",
    contactNumber: "",
    alternativeContact: "",
    email: contextUser?.email || "",
    emergencyContact: "",
    addressType: "",
    additionalNotes: "",
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [updateMessage, setUpdateMessage] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.permanentAddress) newErrors.permanentAddress = "Required"
    if (!formData.city) newErrors.city = "Required"
    if (!formData.country) newErrors.country = "Required"
    if (!formData.postalCode) newErrors.postalCode = "Required"
    if (!formData.contactNumber) newErrors.contactNumber = "Required"
    if (!formData.email) newErrors.email = "Required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      setLoading(true)
      try {
        console.log("Sending data:", formData); // Debug log
        const response = await axios.put('http://localhost:4000/api/user/update-address', {
          ...formData,
          email: contextUser?.email // Ensure email is sent
        });
        
        console.log("Response:", response.data); // Debug log
        
        if (response.data.success) {
          setUpdateMessage("Address updated successfully!");
        } else {
          setUpdateMessage(response.data.message || "Error updating address");
        }
      } catch (error) {
        console.error("Error updating address:", error)
        setUpdateMessage("Error updating address. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar />
      <div className="flex-1 p-8">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Address Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              icon={<Home />}
              name="permanentAddress"
              label="Permanent Address"
              value={formData.permanentAddress}
              onChange={handleChange}
              error={errors.permanentAddress}
            />
            <InputField
              icon={<Home />}
              name="correspondenceAddress"
              label="Correspondence Address"
              value={formData.correspondenceAddress}
              onChange={handleChange}
            />
            <InputField icon={<MapPin />} name="lane" label="Lane" value={formData.lane} onChange={handleChange} />
            <InputField
              icon={<Building />}
              name="city"
              label="City"
              value={formData.city}
              onChange={handleChange}
              error={errors.city}
            />
            <InputField icon={<Flag />} name="state" label="State" value={formData.state} onChange={handleChange} />
            <InputField
              icon={<Flag />}
              name="country"
              label="Country"
              value={formData.country}
              onChange={handleChange}
              error={errors.country}
            />
            <InputField
              icon={<MapPin />}
              name="postalCode"
              label="Postal Code"
              value={formData.postalCode}
              onChange={handleChange}
              error={errors.postalCode}
            />
            <InputField
              icon={<MapPin />}
              name="landmark"
              label="Landmark"
              value={formData.landmark}
              onChange={handleChange}
            />
            <InputField
              icon={<Phone />}
              name="contactNumber"
              label="Contact Number"
              value={formData.contactNumber}
              onChange={handleChange}
              error={errors.contactNumber}
            />
            <InputField
              icon={<Phone />}
              name="alternativeContact"
              label="Alternative Contact"
              value={formData.alternativeContact}
              onChange={handleChange}
            />
            <InputField
              icon={<Mail />}
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
            <InputField
              icon={<AlertCircle />}
              name="emergencyContact"
              label="Emergency Contact"
              value={formData.emergencyContact}
              onChange={handleChange}
            />
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
              <div className="relative">
                <select
                  name="addressType"
                  value={formData.addressType}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select Type</option>
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            <InputField
              icon={<FileText />}
              name="additionalNotes"
              label="Additional Notes"
              value={formData.additionalNotes}
              onChange={handleChange}
              textarea
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={`mt-6 w-full py-2 px-4 rounded-md transition duration-150 ease-in-out ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {loading ? 'Updating...' : 'Save Address'}
          </motion.button>
        </form>
      </div>
    </div>
  )
}

function InputField({ icon, name, label, value, onChange, error, textarea = false }) {
  return (
    <div className="relative">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {React.cloneElement(icon, { className: "h-5 w-5 text-gray-400" })}
        </div>
        <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
          {textarea ? (
            <textarea
              name={name}
              id={name}
              value={value}
              onChange={onChange}
              className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              rows={3}
            />
          ) : (
            <input
              type="text"
              name={name}
              id={name}
              value={value}
              onChange={onChange}
              className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              placeholder={label}
            />
          )}
        </motion.div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}


// #########################


// import React, { useState, useContext, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Home, MapPin, Building, Flag, Mail, Phone, AlertCircle, FileText, ChevronDown } from "lucide-react";
// import Sidebar from "../components/Sidebar";
// import { AppContext } from "../context/AppContext";
// import axios from "axios";

// const inputVariants = {
//   focus: { scale: 0.98 },
//   blur: { scale: 1 },
// };

// export default function Address() {
//   const { user: contextUser } = useContext(AppContext);
//   const [formData, setFormData] = useState({
//     permanentAddress: "",
//     correspondenceAddress: "",
//     country: "",
//     state: "",
//     city: "",
//     postalCode: "",
//     contactNumber: "",
//     emergencyContact: "",
//     alternativeContact: "",
//     email: contextUser?.email || "",
//     addressType: "",
//     additionalNotes: "",
//   });

//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [updateMessage, setUpdateMessage] = useState("");

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors((prev) => {
//         const newErrors = { ...prev };
//         delete newErrors[name];
//         return newErrors;
//       });
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const phoneRegex = /^\d{10}$/;
//     const postalCodeRegex = /^\d{6}$/; // Assuming 6-digit postal code

//     // Required fields validation
//     if (!formData.permanentAddress) newErrors.permanentAddress = "Permanent address is required";
//     if (!formData.country) newErrors.country = "Country is required";
//     if (!formData.state) newErrors.state = "State is required";
//     if (!formData.city) newErrors.city = "City is required";
//     if (!formData.postalCode) newErrors.postalCode = "Postal code is required";
//     if (!formData.contactNumber) newErrors.contactNumber = "Contact number is required";
//     if (!formData.email) newErrors.email = "Email is required";

//     // Format validation
//     if (formData.email && !emailRegex.test(formData.email)) {
//       newErrors.email = "Please enter a valid email address";
//     }
//     if (formData.contactNumber && !phoneRegex.test(formData.contactNumber)) {
//       newErrors.contactNumber = "Please enter a valid 10-digit phone number";
//     }
//     if (formData.alternativeContact && !phoneRegex.test(formData.alternativeContact)) {
//       newErrors.alternativeContact = "Please enter a valid 10-digit phone number";
//     }
//     if (formData.emergencyContact && !phoneRegex.test(formData.emergencyContact)) {
//       newErrors.emergencyContact = "Please enter a valid 10-digit phone number";
//     }
//     if (formData.postalCode && !postalCodeRegex.test(formData.postalCode)) {
//       newErrors.postalCode = "Postal code must be 6 digits";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (validateForm()) {
//       setLoading(true);
//       try {
//         console.log("Sending data:", formData);
//         const response = await axios.put('http://localhost:4000/api/user/update-address', {
//           ...formData,
//           email: contextUser?.email // Ensure email is sent
//         });
        
//         console.log("Response:", response.data);
        
//         if (response.data.success) {
//           setUpdateMessage("Address updated successfully!");
//         } else {
//           setUpdateMessage(response.data.message || "Error updating address");
//         }
//       } catch (error) {
//         console.error("Error updating address:", error);
//         setUpdateMessage("Error updating address. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen flex bg-white">
//       <Sidebar />
//       <div className="flex-1 p-8">
//         <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
//           <h2 className="text-2xl font-bold mb-6 text-gray-800">Address Details</h2>
          
//           {updateMessage && (
//             <div className={`mb-4 p-3 rounded ${updateMessage.includes("success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
//               {updateMessage}
//             </div>
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Permanent Address */}
//             <InputField
//               icon={<Home />}
//               name="permanentAddress"
//               label="Permanent Address"
//               value={formData.permanentAddress}
//               onChange={handleChange}
//               error={errors.permanentAddress}
//               textarea
//             />

//             {/* Correspondence Address */}
//             <InputField
//               icon={<Home />}
//               name="correspondenceAddress"
//               label="Correspondence Address"
//               value={formData.correspondenceAddress}
//               onChange={handleChange}
//               textarea
//             />

//             {/* Country */}
//             <InputField
//               icon={<Flag />}
//               name="country"
//               label="Country"
//               value={formData.country}
//               onChange={handleChange}
//               error={errors.country}
//             />

//             {/* State */}
//             <InputField
//               icon={<Flag />}
//               name="state"
//               label="State"
//               value={formData.state}
//               onChange={handleChange}
//               error={errors.state}
//             />

//             {/* City */}
//             <InputField
//               icon={<Building />}
//               name="city"
//               label="City"
//               value={formData.city}
//               onChange={handleChange}
//               error={errors.city}
//             />

//             {/* Postal Code */}
//             <InputField
//               icon={<MapPin />}
//               name="postalCode"
//               label="Postal Code"
//               value={formData.postalCode}
//               onChange={handleChange}
//               error={errors.postalCode}
//               type="number"
//             />

//             {/* Email */}
//             <InputField
//               icon={<Mail />}
//               name="email"
//               label="Email"
//               value={formData.email}
//               onChange={handleChange}
//               error={errors.email}
//               type="email"
//             />

//             {/* Contact Number */}
//             <InputField
//               icon={<Phone />}
//               name="contactNumber"
//               label="Contact Number"
//               value={formData.contactNumber}
//               onChange={handleChange}
//               error={errors.contactNumber}
//               type="tel"
//             />

//             {/* Emergency Contact */}
//             <InputField
//               icon={<AlertCircle />}
//               name="emergencyContact"
//               label="Emergency Contact"
//               value={formData.emergencyContact}
//               onChange={handleChange}
//               error={errors.emergencyContact}
//               type="tel"
//             />

//             {/* Alternative Contact */}
//             <InputField
//               icon={<Phone />}
//               name="alternativeContact"
//               label="Alternative Contact"
//               value={formData.alternativeContact}
//               onChange={handleChange}
//               error={errors.alternativeContact}
//               type="tel"
//             />

//             {/* Address Type */}
//             <div className="relative">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
//               <div className="relative">
//                 <select
//                   name="addressType"
//                   value={formData.addressType}
//                   onChange={handleChange}
//                   className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
//                 >
//                   <option value="">Select Type</option>
//                   <option value="home">Home</option>
//                   <option value="work">Work</option>
//                   <option value="other">Other</option>
//                 </select>
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <ChevronDown className="h-5 w-5 text-gray-400" />
//                 </div>
//               </div>
//             </div>

//             {/* Additional Notes */}
//             <InputField
//               icon={<FileText />}
//               name="additionalNotes"
//               label="Additional Notes"
//               value={formData.additionalNotes}
//               onChange={handleChange}
//               textarea
//             />
//           </div>

//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             type="submit"
//             disabled={loading}
//             className={`mt-6 w-full py-2 px-4 rounded-md transition duration-150 ease-in-out ${
//               loading 
//                 ? 'bg-gray-400 cursor-not-allowed' 
//                 : 'bg-indigo-600 hover:bg-indigo-700 text-white'
//             }`}
//           >
//             {loading ? 'Updating...' : 'Save Address'}
//           </motion.button>
//         </form>
//       </div>
//     </div>
//   );
// }

// function InputField({ icon, name, label, value, onChange, error, textarea = false, type = "text" }) {
//   return (
//     <div className="relative">
//       <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
//         {label}
//       </label>
//       <div className="relative rounded-md shadow-sm">
//         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//           {React.cloneElement(icon, { className: "h-5 w-5 text-gray-400" })}
//         </div>
//         <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
//           {textarea ? (
//             <textarea
//               name={name}
//               id={name}
//               value={value}
//               onChange={onChange}
//               className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
//               rows={3}
//             />
//           ) : (
//             <input
//               type={type}
//               name={name}
//               id={name}
//               value={value}
//               onChange={onChange}
//               className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
//               placeholder={label}
//             />
//           )}
//         </motion.div>
//       </div>
//       {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
//     </div>
//   );
// }




// // import React, { useState, useContext, useEffect } from "react";
// // import { motion } from "framer-motion";
// // import { Home, MapPin, Building, Flag, Mail, Phone, AlertCircle, FileText, ChevronDown } from "lucide-react";
// // import Sidebar from "../components/Sidebar";
// // import { AppContext } from "../context/AppContext";
// // import axios from "axios";

// // const inputVariants = {
// //   focus: { scale: 0.98 },
// //   blur: { scale: 1 },
// // };

// // // State and district data for India
// // const indianStates = {
// //   "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
// //   "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
// //   "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
// //   "Goa": ["North Goa", "South Goa"],
// //   "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "South Delhi"]
// // };

// // export default function Address() {
// //   const { user: contextUser } = useContext(AppContext);
// //   const [formData, setFormData] = useState({
// //     permanentAddress: "",
// //     correspondenceAddress: "",
// //     country: "India",
// //     state: "",
// //     district: "",
// //     city: "",
// //     postalCode: "",
// //     contactNumber: "",
// //     emergencyContact: "",
// //     alternativeContact: "",
// //     email: contextUser?.email || "",
// //     addressType: "",
// //     additionalNotes: "",
// //   });

// //   const [errors, setErrors] = useState({});
// //   const [loading, setLoading] = useState(false);
// //   const [updateMessage, setUpdateMessage] = useState("");
// //   const [availableDistricts, setAvailableDistricts] = useState([]);

// //   // Update districts when state changes
// //   useEffect(() => {
// //     if (formData.state && indianStates[formData.state]) {
// //       setAvailableDistricts(indianStates[formData.state]);
// //       setFormData(prev => ({ ...prev, district: "" })); // Reset district when state changes
// //     } else {
// //       setAvailableDistricts([]);
// //     }
// //   }, [formData.state]);

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData((prevData) => ({
// //       ...prevData,
// //       [name]: value,
// //     }));

// //     // Clear error when user starts typing
// //     if (errors[name]) {
// //       setErrors(prev => ({ ...prev, [name]: "" }));
// //     }
// //   };

// //   const validateForm = () => {
// //     const newErrors = {};
// //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// //     const phoneRegex = /^[0-9]{10}$/;
// //     const postalCodeRegex = /^[0-9]{6}$/;

// //     if (!formData.permanentAddress) newErrors.permanentAddress = "Required";
// //     if (!formData.country) newErrors.country = "Required";
// //     if (!formData.state) newErrors.state = "Required";
// //     if (!formData.district) newErrors.district = "Required";
// //     if (!formData.city) newErrors.city = "Required";
    
// //     if (!formData.postalCode) {
// //       newErrors.postalCode = "Required";
// //     } else if (!postalCodeRegex.test(formData.postalCode)) {
// //       newErrors.postalCode = "Must be 6 digits";
// //     }
    
// //     if (!formData.contactNumber) {
// //       newErrors.contactNumber = "Required";
// //     } else if (!phoneRegex.test(formData.contactNumber)) {
// //       newErrors.contactNumber = "Must be 10 digits";
// //     }
    
// //     if (formData.alternativeContact && !phoneRegex.test(formData.alternativeContact)) {
// //       newErrors.alternativeContact = "Must be 10 digits";
// //     }
    
// //     if (formData.emergencyContact && !phoneRegex.test(formData.emergencyContact)) {
// //       newErrors.emergencyContact = "Must be 10 digits";
// //     }
    
// //     if (!formData.email) {
// //       newErrors.email = "Required";
// //     } else if (!emailRegex.test(formData.email)) {
// //       newErrors.email = "Invalid email format";
// //     }

// //     setErrors(newErrors);
// //     return Object.keys(newErrors).length === 0;
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     if (validateForm()) {
// //       setLoading(true);
// //       try {
// //         console.log("Sending data:", formData);
// //         const response = await axios.put('http://localhost:4000/api/user/update-address', {
// //           ...formData,
// //           email: contextUser?.email
// //         });
        
// //         console.log("Response:", response.data);
        
// //         if (response.data.success) {
// //           setUpdateMessage("Address updated successfully!");
// //         } else {
// //           setUpdateMessage(response.data.message || "Error updating address");
// //         }
// //       } catch (error) {
// //         console.error("Error updating address:", error);
// //         setUpdateMessage("Error updating address. Please try again.");
// //       } finally {
// //         setLoading(false);
// //       }
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen flex bg-white">
// //       <Sidebar />
// //       <div className="flex-1 p-8">
// //         <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
// //           <h2 className="text-2xl font-bold mb-6 text-gray-800">Address Details</h2>
          
// //           {updateMessage && (
// //             <div className={`mb-4 p-3 rounded ${updateMessage.includes("success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
// //               {updateMessage}
// //             </div>
// //           )}
          
// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //             <InputField
// //               icon={<Home />}
// //               name="permanentAddress"
// //               label="Permanent Address"
// //               value={formData.permanentAddress}
// //               onChange={handleChange}
// //               error={errors.permanentAddress}
// //               textarea
// //             />
            
// //             <InputField
// //               icon={<Home />}
// //               name="correspondenceAddress"
// //               label="Correspondence Address"
// //               value={formData.correspondenceAddress}
// //               onChange={handleChange}
// //               textarea
// //             />
            
// //             <div className="relative">
// //               <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
// //               <div className="relative">
// //                 <select
// //                   name="country"
// //                   value={formData.country}
// //                   onChange={handleChange}
// //                   className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
// //                   disabled
// //                 >
// //                   <option value="India">India</option>
// //                 </select>
// //                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
// //                   <Flag className="h-5 w-5 text-gray-400" />
// //                 </div>
// //               </div>
// //               {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
// //             </div>
            
// //             <div className="relative">
// //               <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
// //               <div className="relative">
// //                 <select
// //                   name="state"
// //                   value={formData.state}
// //                   onChange={handleChange}
// //                   className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
// //                 >
// //                   <option value="">Select State</option>
// //                   {Object.keys(indianStates).map(state => (
// //                     <option key={state} value={state}>{state}</option>
// //                   ))}
// //                 </select>
// //                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
// //                   <Flag className="h-5 w-5 text-gray-400" />
// //                 </div>
// //               </div>
// //               {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
// //             </div>
            
// //             <div className="relative">
// //               <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
// //               <div className="relative">
// //                 <select
// //                   name="district"
// //                   value={formData.district}
// //                   onChange={handleChange}
// //                   className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
// //                   disabled={!formData.state}
// //                 >
// //                   <option value="">Select District</option>
// //                   {availableDistricts.map(district => (
// //                     <option key={district} value={district}>{district}</option>
// //                   ))}
// //                 </select>
// //                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
// //                   <MapPin className="h-5 w-5 text-gray-400" />
// //                 </div>
// //               </div>
// //               {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
// //             </div>
            
// //             <InputField
// //               icon={<Building />}
// //               name="city"
// //               label="City"
// //               value={formData.city}
// //               onChange={handleChange}
// //               error={errors.city}
// //             />
            
// //             <InputField
// //               icon={<MapPin />}
// //               name="postalCode"
// //               label="Postal Code"
// //               value={formData.postalCode}
// //               onChange={handleChange}
// //               error={errors.postalCode}
// //               type="number"
// //             />
            
// //             <InputField
// //               icon={<Phone />}
// //               name="contactNumber"
// //               label="Contact Number"
// //               value={formData.contactNumber}
// //               onChange={handleChange}
// //               error={errors.contactNumber}
// //               type="tel"
// //             />
            
// //             <InputField
// //               icon={<AlertCircle />}
// //               name="emergencyContact"
// //               label="Emergency Contact"
// //               value={formData.emergencyContact}
// //               onChange={handleChange}
// //               error={errors.emergencyContact}
// //               type="tel"
// //             />
            
// //             <InputField
// //               icon={<Phone />}
// //               name="alternativeContact"
// //               label="Alternative Contact"
// //               value={formData.alternativeContact}
// //               onChange={handleChange}
// //               error={errors.alternativeContact}
// //               type="tel"
// //             />
            
// //             <InputField
// //               icon={<Mail />}
// //               name="email"
// //               label="Email"
// //               value={formData.email}
// //               onChange={handleChange}
// //               error={errors.email}
// //               type="email"
// //             />
            
// //             <div className="relative">
// //               <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
// //               <div className="relative">
// //                 <select
// //                   name="addressType"
// //                   value={formData.addressType}
// //                   onChange={handleChange}
// //                   className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
// //                 >
// //                   <option value="">Select Type</option>
// //                   <option value="home">Home</option>
// //                   <option value="work">Work</option>
// //                   <option value="other">Other</option>
// //                 </select>
// //                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
// //                   <ChevronDown className="h-5 w-5 text-gray-400" />
// //                 </div>
// //               </div>
// //             </div>
            
// //             <InputField
// //               icon={<FileText />}
// //               name="additionalNotes"
// //               label="Additional Notes"
// //               value={formData.additionalNotes}
// //               onChange={handleChange}
// //               textarea
// //             />
// //           </div>
          
// //           <motion.button
// //             whileHover={{ scale: 1.05 }}
// //             whileTap={{ scale: 0.95 }}
// //             type="submit"
// //             disabled={loading}
// //             className={`mt-6 w-full py-2 px-4 rounded-md transition duration-150 ease-in-out ${
// //               loading 
// //                 ? 'bg-gray-400 cursor-not-allowed' 
// //                 : 'bg-indigo-600 hover:bg-indigo-700 text-white'
// //             }`}
// //           >
// //             {loading ? 'Updating...' : 'Save Address'}
// //           </motion.button>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // }

// // function InputField({ icon, name, label, value, onChange, error, textarea = false, type = "text" }) {
// //   return (
// //     <div className="relative">
// //       <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
// //         {label}
// //       </label>
// //       <div className="relative rounded-md shadow-sm">
// //         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
// //           {React.cloneElement(icon, { className: "h-5 w-5 text-gray-400" })}
// //         </div>
// //         <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
// //           {textarea ? (
// //             <textarea
// //               name={name}
// //               id={name}
// //               value={value}
// //               onChange={onChange}
// //               className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
// //               rows={3}
// //             />
// //           ) : (
// //             <input
// //               type={type}
// //               name={name}
// //               id={name}
// //               value={value}
// //               onChange={onChange}
// //               className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
// //               placeholder={label}
// //             />
// //           )}
// //         </motion.div>
// //       </div>
// //       {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
// //     </div>
// //   );
// // }