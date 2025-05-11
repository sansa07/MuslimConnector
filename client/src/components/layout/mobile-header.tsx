import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Link } from "wouter";
import { Search, Bell, Menu, X } from "lucide-react";
import Sidebar from "./sidebar";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../lang-switcher";
import { ThemeToggle } from "../theme-toggle";

export default function MobileHeader() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-[#121E2F] shadow-sm lg:hidden">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <i className="fas fa-mosque text-primary text-xl mr-2"></i>
            <h1 className="font-amiri text-xl font-bold text-primary dark:text-primary-light">MüslimNet</h1>
          </div>
          
          {/* Search & Icons */}
          <div className="flex items-center space-x-1">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-light">
              <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            {isAuthenticated && (
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-light">
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            )}
            <LanguageSwitcher />
            <ThemeToggle />
            <button 
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-light"
            >
              {menuOpen ? (
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-[#121E2F] lg:hidden">
          <div className="h-full overflow-y-auto pt-16 pb-24">
            <Sidebar />
          </div>
        </div>
      )}
    </>
  );
}
