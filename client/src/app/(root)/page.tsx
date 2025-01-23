'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import bg1 from '../../../public/icon1.jpg'

const Home = () => {
  return (
    <>
      <Image
        src={bg1}
        alt="background"
        className="w-full -z-10 h-screen object-cover fixed top-0 left-0"
        priority
      />
      {/* <div className="w-full -z-10 h-screen fixed bg-black/60"></div> */}
      <div className="w-full min-h-screen flex flex-col justify-center items-center p-4">
        <h1 className="text-5xl md:text-7xl font-bold text-white text-center mb-8">
          CONNECTLY
        </h1>
        <p className="text-gray-200 text-lg md:text-xl text-center max-w-2xl mb-12">
          Connect with friends and colleagues through chat and video calls, enhanced with AI features
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.02]"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-8 rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.02]"
          >
            Register
          </Link>
        </div>
      </div>
    </>
  )
}

export default Home