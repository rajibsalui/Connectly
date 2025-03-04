"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import bg1 from "../../../public/icon1.jpg";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import {
  IoLogoGithub,
  IoLogoGoogle,
  IoMailOutline,
  IoVideocam,
  IoChatbubbles,
  IoFlask,
  IoSparkles,
  IoShield,
  IoRocket,
  IoArrowForward,
} from "react-icons/io5";
import { handleGoogleLogin } from "../(auth)/firebaseauthService";
import { useRouter } from "next/navigation";
import AuthModals from '@/components/auth/AuthModals';
import { useAuth } from "@/context/AuthContext";

const Home = () => {
    const router = useRouter();
    const {getUser} = useAuth()
  
  return (
    <main className="min-h-screen relative bg-base-100">
      {/* Animated Background with Overlay */}
      {/* <div className="absolute inset-0 overflow-hidden">
        <Image
          src={bg1}
          alt="Connectly Background"
          className="w-full h-full object-cover animate-softPulse"
          priority
          quality={95}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-base-300/90 via-base-100/50 to-base-300/90 backdrop-blur-sm"></div>
      </div> */}

      {/* Navigation */}
      <nav className="relative z-20 p-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            Connectly
          </Link>
          {/* <ThemeSwitcher isOpen={false} onClose={() => {}} /> */}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="min-h-[calc(100vh-4rem)] flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fadeIn">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                  Connect Smarter
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-12 text-base-content/80 max-w-2xl mx-auto leading-relaxed animate-fadeInUp">
                Experience the next generation of communication with AI-powered
                features, secure messaging, and crystal-clear video calls.
              </p>

              {/* Auth Options */}
              <div className="flex flex-col gap-4 max-w-md mx-auto animate-fadeInUp">
                <button
                  type="button"
                  onClick={async () => {
                    const val = await handleGoogleLogin();

                    if (val && val.success) {
                      getUser(val.user.id);
                      router.push(`/chat/${val.user.id}`);
                    }
                  }}
                  className="btn btn-outline gap-3 hover:bg-base-200/50 backdrop-blur-sm transition-all duration-300"
                >
                  <IoLogoGoogle className="w-5 h-5 text-primary" />
                  Continue with Google
                </button>

                <div className="divider text-base-content/60">OR</div>

                <Link 
                  href="/login"
                  className="btn btn-primary gap-2 group"
                >
                  Get Started
                  <IoArrowForward className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 animate-fadeInUp delay-200">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="card bg-base-200/30 hover:bg-base-200/50 backdrop-blur-sm shadow-xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="card-body items-center text-center p-6">
                      <div className="rounded-full bg-primary/10 p-4 mb-4">
                        {feature.icon}
                      </div>
                      <h2 className="card-title text-primary mb-2">
                        {feature.title}
                      </h2>
                      <p className="text-base-content/70">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer footer-center p-6 bg-base-300/30 backdrop-blur-sm text-base-content relative">
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl gap-4">
          <p className="flex items-center gap-2">
            <IoSparkles className="text-primary" />
            Built with modern technologies
          </p>
          <p>
            Copyright © {new Date().getFullYear()} Connectly - All rights
            reserved
          </p>
          <div className="flex items-center gap-2">
            <IoShield className="text-primary" />
            End-to-end encrypted
          </div>
        </div>
      </footer>
    </main>
  );
};

const features = [
  {
    title: "Smart Chat",
    description:
      "Secure messaging with AI-powered features and end-to-end encryption",
    icon: <IoChatbubbles className="w-8 h-8 text-primary" />,
  },
  {
    title: "HD Video Calls",
    description: "Crystal-clear video calls with smart background effects",
    icon: <IoVideocam className="w-8 h-8 text-primary" />,
  },
  {
    title: "AI Assistant",
    description: "Intelligent features powered by cutting-edge AI technology",
    icon: <IoFlask className="w-8 h-8 text-primary" />,
  },
];

export default Home;
