'use client'
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import bg1 from "../../public/icon1.jpg"; // Fixed path to match project structure

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    agreeToTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.agreeToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }
    // Handle signup logic here
    console.log(formData);
  };

  return (
    <>
      <Image
        src={bg1}
        alt="bg1"
        className="w-full -z-10 h-screen object-cover fixed top-0 left-0"
        priority
      />
      <div className="w-full -z-10 h-screen fixed bg-black/60"></div>
      <div className="w-full min-h-screen flex flex-col md:flex-row justify-center items-center p-4">
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center mb-8 md:mb-0">
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center">
            Join Us Today!
          </h1>
          <p className="text-gray-200 text-sm mt-4 text-center max-w-md">
            Create a new account and explore our platform.
          </p>
        </div>
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <form
            onSubmit={handleSubmit}
            className="backdrop-blur-md bg-white/10 p-8 rounded-xl shadow-2xl w-full max-w-md"
          >
            <h2 className="text-3xl font-bold mb-8 text-white text-center">
              Sign Up
            </h2>
            <div className="space-y-6">
              <div>
                <label
                  className="block text-gray-200 text-sm font-semibold mb-2"
                  htmlFor="username"
                >
                  Username
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label
                  className="block text-gray-200 text-sm font-semibold mb-2"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label
                  className="block text-gray-200 text-sm font-semibold mb-2"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  required
                />
                <label className="ml-2 block text-sm text-gray-200">
                  I agree to the terms and conditions
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.02]"
              >
                Sign Up
              </button>
              <p className="text-center text-gray-200 text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;