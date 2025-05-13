import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { IconMenu, IconSearch, IconBell, IconMosque, IconClose, IconUser, IconPrayerTimes, IconWisdom, IconLogout, IconSettings } from "@/lib/icons";
import { ThemeToggle } from "@/components/ui/theme-provider";

const MobileHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const menuItems = [
    { label: "Anasayfa", path: "/" },
    { label: "Keşfet", path: "/explore" },
    { label: "Etkinlikler", path: "/events" },
    { label: "Dua İstekleri", path: "/dua-requests" },
    { label: "Namaz Vakitleri", path: "/prayer-times" },
    { label: "Günün Öğüdü", path: "/daily-wisdom" },
    { label: "Kuran & Hadisler", path: "/quran-hadith" },
    { label: "Topluluklar", path: "/communities" },
    { label: "Profil", path: "/profile" },
    { label: "Hakkımızda", path: "/about" },
    { label: "İletişim", path: "/contact" },
    { label: "Destek", path: "/support" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-navy-dark islamic-green:bg-emerald-50 islamic-gold:bg-amber-50 islamic-navy:bg-[#1c3353] shadow-sm lg:hidden">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <IconMosque className="text-primary text-xl mr-2" />
            <h1 className="font-amiri text-xl font-bold text-primary dark:text-primary-light islamic-gold:text-amber-600 islamic-navy:text-blue-300">MüslimNet</h1>
          </div>
          
          {/* Quick Access & Icons */}
          <div className="flex items-center space-x-2">
            <Link href="/prayer-times" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-light islamic-green:hover:bg-emerald-100 islamic-gold:hover:bg-amber-100 islamic-navy:hover:bg-blue-900 text-gray-600 dark:text-gray-300">
                <IconPrayerTimes />
            </Link>
            <Link href="/daily-wisdom" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-light islamic-green:hover:bg-emerald-100 islamic-gold:hover:bg-amber-100 islamic-navy:hover:bg-blue-900 text-gray-600 dark:text-gray-300">
                <IconWisdom />
            </Link>
            {isAuthenticated ? (
              <Link href="/profile" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-light islamic-green:hover:bg-emerald-100 islamic-gold:hover:bg-amber-100 islamic-navy:hover:bg-blue-900">
                <img 
                  src={user?.profileImageUrl || "https://via.placeholder.com/32"} 
                  alt="Profil" 
                  className="w-6 h-6 rounded-full object-cover border border-primary islamic-gold:border-amber-500 islamic-navy:border-blue-400"
                />
              </Link>
            ) : (
              <Link href="/auth" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-light islamic-green:hover:bg-emerald-100 islamic-gold:hover:bg-amber-100 islamic-navy:hover:bg-blue-900 text-gray-600 dark:text-gray-300">
                <IconUser />
              </Link>
            )}
            <ThemeToggle />
            {isAuthenticated && (
              <a 
                href="/api/logout" 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-light islamic-green:hover:bg-emerald-100 islamic-gold:hover:bg-amber-100 islamic-navy:hover:bg-blue-900 text-red-600 dark:text-red-400"
              >
                <IconLogout />
              </a>
            )}
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-light islamic-green:hover:bg-emerald-100 islamic-gold:hover:bg-amber-100 islamic-navy:hover:bg-blue-900"
              onClick={toggleMenu}
            >
              {menuOpen ? (
                <IconClose className="text-gray-600 dark:text-gray-300" />
              ) : (
                <IconMenu className="text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden">
          <div className="bg-white dark:bg-navy-dark islamic-green:bg-emerald-50 islamic-gold:bg-amber-50 islamic-navy:bg-[#1c3353] w-3/4 h-full ml-auto py-4 px-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-amiri text-xl font-bold text-primary dark:text-primary-light islamic-gold:text-amber-600 islamic-navy:text-blue-300">Menu</h2>
              <button onClick={toggleMenu}>
                <IconClose className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <img 
                  src={user?.profileImageUrl || "https://via.placeholder.com/100"} 
                  alt="Profil Fotoğrafı" 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{user?.firstName || ''} {user?.lastName || ''}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>
            ) : (
              <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <Link 
                  href="/auth"
                  className="block w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white text-center rounded-lg transition-colors"
                >
                  Giriş Yap
                </Link>
              </div>
            )}

            <nav className="space-y-1 mb-6">
              {menuItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className="block py-2 px-3 text-gray-700 dark:text-gray-200 islamic-gold:text-amber-800 islamic-navy:text-blue-100 hover:bg-gray-100 dark:hover:bg-navy islamic-green:hover:bg-emerald-100 islamic-gold:hover:bg-amber-100 islamic-navy:hover:bg-blue-900 rounded-lg"
                  onClick={toggleMenu}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <ThemeToggle />
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-light islamic-green:hover:bg-emerald-100 islamic-gold:hover:bg-amber-100 islamic-navy:hover:bg-blue-900">
                  <IconSettings className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              
              {isAuthenticated && (
                <a href="/api/logout" className="flex items-center py-3 px-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 rounded-lg">
                  <IconLogout className="mr-2" />
                  <span>Çıkış Yap</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileHeader;
