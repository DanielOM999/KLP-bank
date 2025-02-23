"use client";

// Importing core React hooks for state management and ref handling
import { useState, useRef } from "react";

// Importing Next.js navigation component for client-side transitions
import Link from "next/link";

// Importing icons for menu toggle functionality
import { Menu, X } from "lucide-react";

// Importing animation components from Framer Motion for smooth transitions
import { motion, AnimatePresence } from "framer-motion";

// Importing banking icon from React Icons library
import { RiBankLine } from "react-icons/ri";

// Main header component with responsive navigation
export default function Header() {
  // State management for mobile menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Ref for accessing mobile menu DOM element
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    // Sticky header with blur effect and border
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-top/25 backdrop-blur-md">
      <nav className="flex flex-row justify-between mx-10 my-4">
        {/* Branding section with animated logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 text-2xl font-semibold"
        >
          {/* Animated logo container with hover effect */}
          <motion.div
            whileHover={{ rotate: [-10, 10, -10] }}
            transition={{ duration: 0.5 }}
          >
            <RiBankLine className="h-10 w-10 rotate-[-10deg] text-white transition-transform group-hover:scale-110" />
          </motion.div>
          <span className="text-white text-3xl">KLP Bank</span>
        </Link>

        {/* Navigation links and mobile menu */}
        <div className="flex-col text-3xl">
          <div className="lg:flex">
            <div className="flex gap-6">
              {/* Desktop navigation links (hidden on mobile) */}
              <div className="hidden items-center gap-8 lg:flex">
                {["Home", "Register", "Login"].map((item) => (
                  <Link
                    key={item}
                    href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                    className="relative text-lg font-medium text-gray-300 transition-all hover:text-emerald-400"
                  >
                    {item}
                    {/* Animated underline effect on hover */}
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-emerald-400 transition-all duration-300 hover:w-full" />
                  </Link>
                ))}
              </div>

              {/* Mobile menu toggle button */}
              <div>
                <motion.button
                  className="p-2 rounded-lg hover:bg-gray-700/30 transition-colors"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {isMenuOpen ? (
                    <X className="h-8 w-8 text-gray-200" />
                  ) : (
                    <Menu className="h-8 w-8 text-gray-200" />
                  )}
                </motion.button>

                {/* Animated mobile menu dropdown */}
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      className="absolute right-0 top-full mt-3 w-48 rounded-xl bg-gray-800/95 border border-gray-700 shadow-2xl backdrop-blur-xl"
                      initial={{ opacity: 0, y: -15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -15, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      ref={menuRef}
                    >
                      <div className="flex flex-col gap-3 p-3">
                        {[
                          "Home",
                          "Register",
                          "Login",
                          "Deposit",
                          "Withdraw",
                          "Balance",
                        ].map((item, index) => (
                          <motion.div
                            key={item}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link
                              href={
                                item === "Home" ? "/" : `/${item.toLowerCase()}`
                              }
                              className="flex items-center px-4 py-3 rounded-lg text-gray-200 hover:bg-gray-700/50 hover:text-emerald-400 transition-colors text-lg font-medium"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {item}
                            </Link>
                            {/* Separator between menu items */}
                            {index < 5 && (
                              <div className="mx-4 my-1 h-px bg-gray-700/50" />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
