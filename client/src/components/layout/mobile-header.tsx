import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Link } from "wouter";
import { Search, Bell, Menu, X, User, Clock, SunMoon, Settings, LogOut, HelpCircle, MessageCircle } from "lucide-react";
import Sidebar from "./sidebar";
import { useTranslation } from "@/hooks/use-translation-with-defaults";
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
          
          {/* Quick Access & Icons */}
          <div className="flex items-center space-x-1">
            <Link to="/prayer-times" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-light">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </Link>
            <Link to="/profile" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-light">
              <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </Link>
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
          <div className="h-full overflow-y-auto pt-8 pb-24 px-4">
            <div className="flex justify-end mb-4">
              <button onClick={toggleMenu} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-light">
                <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <img 
                  src={"https://via.placeholder.com/100"} 
                  alt="Profil Fotoğrafı" 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">Kullanıcı</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">kullanici@email.com</p>
                </div>
              </div>
            ) : (
              <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <Link to="/login" className="block w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white text-center rounded-lg transition-colors">
                  Giriş Yap
                </Link>
              </div>
            )}

            <div className="space-y-1 mb-6">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">ANA MENÜ</h3>
              <Link to="/profile" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-navy text-gray-700 dark:text-gray-200">
                <User className="w-5 h-5" />
                <span>Profil</span>
              </Link>
              <Link to="/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-navy text-gray-700 dark:text-gray-200">
                <Settings className="w-5 h-5" />
                <span>Ayarlar</span>
              </Link>
              <Link to="/support" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-navy text-gray-700 dark:text-gray-200">
                <HelpCircle className="w-5 h-5" />
                <span>Destek</span>
              </Link>
              <Link to="/contact" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-navy text-gray-700 dark:text-gray-200">
                <MessageCircle className="w-5 h-5" />
                <span>İletişim</span>
              </Link>
            </div>

            <Sidebar />

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              {isAuthenticated && (
                <form action="/api/logout" method="get">
                  <button type="submit" className="flex items-center space-x-3 p-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 w-full text-left">
                    <LogOut className="w-5 h-5" />
                    <span>Çıkış Yap</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
