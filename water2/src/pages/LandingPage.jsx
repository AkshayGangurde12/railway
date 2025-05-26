import React from 'react';
import { CalendarDays, Stethoscope, HeartPulse, ShieldCheck, Users, Award } from 'lucide-react';

// Placeholder data
const specialities = [
  { name: 'General physician', icon: <Stethoscope className="w-10 h-10 text-blue-600 mx-auto" /> },
  { name: 'Gynecologist', icon: <HeartPulse className="w-10 h-10 text-pink-500 mx-auto" /> },
  { name: 'Dermatologist', icon: <ShieldCheck className="w-10 h-10 text-green-600 mx-auto" /> },
  { name: 'Pediatricians', icon: <Users className="w-10 h-10 text-yellow-600 mx-auto" /> },
  { name: 'Neurologist', icon: <Award className="w-10 h-10 text-purple-600 mx-auto" /> },
  { name: 'Gastroenterologist', icon: <CalendarDays className="w-10 h-10 text-teal-600 mx-auto" /> },
];

const doctors = [
  { name: 'Dr. Richard James', speciality: 'General physician', image: 'https://via.placeholder.com/150' },
  { name: 'Dr. Emily Larson', speciality: 'Gynecologist', image: 'https://via.placeholder.com/150' },
  { name: 'Dr. Sarah Patel', speciality: 'Dermatologist', image: 'https://via.placeholder.com/150' },
  { name: 'Dr. Christopher Lee', speciality: 'Pediatricians', image: 'https://via.placeholder.com/150' },
  { name: 'Dr. Jennifer Garcia', speciality: 'Neurologist', image: 'https://via.placeholder.com/150' },
  { name: 'Dr. Andrew Williams', speciality: 'Neurologist', image: 'https://via.placeholder.com/150' },
  { name: 'Dr. Christopher Davis', speciality: 'General physician', image: 'https://via.placeholder.com/150' },
  { name: 'Dr. Timothy White', speciality: 'Gynecologist', image: 'https://via.placeholder.com/150' },
  { name: 'Dr. Ava Mitchell', speciality: 'Dermatologist', image: 'https://via.placeholder.com/150' },
  { name: 'Dr. Jeffrey King', speciality: 'Pediatricians', image: 'https://via.placeholder.com/150' },
];

const services = [
  { name: 'Online Consultation', icon: <Stethoscope className="w-12 h-12 text-blue-600 mx-auto mb-3" /> },
  { name: 'Appointment Booking', icon: <CalendarDays className="w-12 h-12 text-green-600 mx-auto mb-3" /> },
  { name: 'Medical Records', icon: <HeartPulse className="w-12 h-12 text-red-600 mx-auto mb-3" /> },
  { name: 'Emergency Services', icon: <ShieldCheck className="w-12 h-12 text-yellow-600 mx-auto mb-3" /> },
];

const testimonials = [
  { quote: 'This medical portal made booking an appointment so easy and convenient.', author: 'Patient A' },
  { quote: 'I found a great doctor through this platform. Highly recommended!', author: 'Patient B' },
  { quote: 'The online consultation service was very helpful.', author: 'Patient C' },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Fixed Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 bg-blue-700 shadow-md z-50">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex-shrink-0 h-10">
            <img src="https://via.placeholder.com/150" alt="MediCare Logo" className="h-full object-contain" />
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#" className="text-blue-100 hover:text-white">Home</a>
            <a href="#" className="text-blue-100 hover:text-white">About</a>
            <a href="#" className="text-blue-100 hover:text-white">Contact</a>
            <a href="#" className="text-blue-100 hover:text-white">Doctor Access</a>
            <a href="#" className="text-blue-100 hover:text-white">Doctors</a>
          </div>
          <button className="hidden md:block bg-white text-blue-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-200 transition-colors">Get Started</button>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-gray-600 focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">Book Appointment With 100+ Trusted Doctors</h1>
            <p className="text-lg mb-6">Simple Browsing through doctors...</p>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-full text-lg font-semibold hover:bg-gray-200 transition-colors">Book Appointment &rarr;</button>
          </div>
          <div className="md:w-1/2">
            <img src="https://via.placeholder.com/500" alt="Doctor and Patients" className="rounded-lg shadow-xl" />
          </div>
        </div>
      </section>

      {/* Patient Login Section */}
      <section className="py-16 bg-blue-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Patient Login</h2>
          {/* Placeholder for Patient Login Form/Component */}
          <div className="bg-white p-8 rounded-lg shadow-md max-w-sm mx-auto">
            <p className="text-gray-600">[Patient Login Form goes here]</p>
            {/* Example: */}
            {/* <input type="email" placeholder="Email" className="border p-2 w-full mb-4" /> */}
            {/* <input type="password" placeholder="Password" className="border p-2 w-full mb-4" /> */}
            {/* <button className="bg-blue-600 text-white px-4 py-2 rounded">Login as Patient</button> */}
          </div>
        </div>
      </section>

      {/* Doctor Login Section */}
      <section className="py-16 bg-green-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Doctor Login</h2>
          {/* Placeholder for Doctor Login Form/Component */}
          <div className="bg-white p-8 rounded-lg shadow-md max-w-sm mx-auto">
            <p className="text-gray-600">[Doctor Login Form goes here]</p>
             {/* Example: */}
            {/* <input type="email" placeholder="Email" className="border p-2 w-full mb-4" /> */}
            {/* <input type="password" placeholder="Password" className="border p-2 w-full mb-4" /> */}
            {/* <button className="bg-green-600 text-white px-4 py-2 rounded">Login as Doctor</button> */}
          </div>
        </div>
      </section>

      {/* Search Filters (Specialities) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Find by Speciality</h2>
          <p className="text-gray-600 mb-12">Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {specialities.map((speciality, index) => (
              <div key={index} className="flex flex-col items-center p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                {speciality.icon}
                <p className="mt-4 text-gray-700 font-semibold text-center">{speciality.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctor Cards */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Top Doctors to Book</h2>
          <p className="text-gray-600 mb-12">Simply browse through our extensive list of trusted doctors.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {doctors.map((doctor, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img src={doctor.image} alt={doctor.name} className="w-full h-48 object-cover" />
                <div className="p-6 text-left">
                  <h3 className="text-xl font-semibold text-gray-800">{doctor.name}</h3>
                  <p className="text-blue-600">{doctor.speciality}</p>
                  <div className="mt-4 flex items-center text-green-600">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Available
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-12 px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-colors">More</button>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="flex flex-col items-center p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                {service.icon}
                <p className="mt-4 text-gray-700 font-semibold text-center">{service.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">What Our Patients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-8 italic text-gray-700">
                <p className="mb-4">"{testimonial.quote}"</p>
                <p className="font-bold">- {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Medicare</h3>
            <p className="text-gray-400 text-sm">Lorem ipsum simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">COMPANY</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Home</a></li>
              <li><a href="#" className="hover:text-white">About us</a></li>
              <li><a href="#" className="hover:text-white">Delivery</a></li>
              <li><a href="#" className="hover:text-white">Privacy policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">GET IN TOUCH</h3>
            <p className="text-gray-400">+1-212-456-7890</p>
            <p className="text-gray-400">greatstackdev@gmail.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;