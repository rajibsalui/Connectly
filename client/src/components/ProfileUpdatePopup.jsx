import React, { useState, useRef, useEffect } from "react";
import assets from "../assets/assets";
import Image from "next/image";
import '../app/globals.css';



const ProfileUpdatePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const popupRef = useRef(null);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setIsOpen(false);
      setProfileImage(null);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log("Profile updated:", { name, email, profileImage });
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="cursor-default">
      <button onClick={togglePopup} className="navbar-icon">
        <Image
          src={assets.profile_img}
          alt="Profile Update"
          width={140}
          height={140}
          className="rounded-full"
        />
      </button>
      {isOpen && (
        <div
          ref={popupRef}
          className="popup p-3 drop-shadow-xl flex absolute top-[25%] z-10 rounded-lg bg-zinc-200 left-20 w-[30rem] h-[28rem]"
        >
        
        <div className="w-1/3 p-3">
          <div className="relative bg-zinc-100 px-2 rounded-lg">
            <p className="bg-green-400 absolute h-3 w-[2.8px] left-[2px] top-2"></p>
            <h2 className=" text-lg font-medium">Profile</h2>
          </div>
          </div>
          <form
            className="w-2/3 h-full relative bg-zinc-100 flex flex-col space-x-5 space-y-6 p-3 rounded-lg"
            onSubmit={handleSubmit}
          >
            <div className="">
              <label className=" relative">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    width={140}
                    height={140}
                    className="profile-image-preview cursor-pointer rounded-full"
                  />
                ) : (
                  <Image
                    src={assets.profile_img}
                    alt="Profile Update"
                    width={140}
                    height={140}
                    className="rounded-full cursor-pointer"
                  />
                )}
                <input
                  className="absolute top-0 left-0 opacity-0 w-full h-full"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <div className="">
              <div className="mb-4">
                <label>
                  <input
                    type="text"
                    value={name}
                    placeholder="Name"
                    className="w-full p-2 bg-transparent rounded-lg"
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
              </div>
              <div className="mb-4">
                <label>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 bg-transparent rounded-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              </div>
              <div className="mb-4">
                <label>
                  <input
                    type="number"
                    placeholder="Phone Number"
                    className="w-full p-2 bg-transparent rounded-lg"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                  />
                </label>
              </div>
            </div>
            <button
              className="bg-blue-200 absolute bottom-4 right-4 px-5 rounded-2xl py-3"
              type="submit"
            >
              Save
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfileUpdatePopup;
