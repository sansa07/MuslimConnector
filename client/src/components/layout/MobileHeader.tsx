import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { IconMenu, IconSearch, IconBell, IconMosque, IconClose } from "@/lib/icons";
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
    { label: "Hakkımızda", path: "/about" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-navy-dark shadow-sm lg:hidden">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <IconMosque className="text-primary text-xl mr-2" />
            <h1 className="font-amiri text-xl font-bold text-primary dark:text-primary-light">MüslimNet</h1>
          </div>
          
          {/* Search & Icons */}
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-light">
              <IconSearch className="text-gray-600 dark:text-gray-300" />
            </button>
            {isAuthenticated ? (
              <Link href="/profile">
                <a className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-light">
                  <img 
                    src={user?.profileImageUrl || "https://via.placeholder.com/32"} 
                    alt="Profil" 
                    className="w-6 h-6 rounded-full object-cover border border-primary"
                  />
                </a>
              </Link>
            ) : (
              <Link href="/api/login">
                <a className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-light text-xs font-medium text-primary">
                  Giriş
                </a>
              </Link>
            )}
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-light"
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
          <div className="bg-white dark:bg-navy-dark w-3/4 h-full ml-auto py-4 px-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-amiri text-xl font-bold text-primary dark:text-primary-light">Menu</h2>
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
                <Link href="/api/login">
                  <a className="block w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white text-center rounded-lg transition-colors">
                    Giriş Yap
                  </a>
                </Link>
              </div>
            )}

            <nav className="space-y-1 mb-6">
              {menuItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a 
                    className="block py-2 px-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-navy rounded-lg"
                    onClick={toggleMenu}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
            </nav>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
              <ThemeToggle />
              {isAuthenticated && (
                <a href="/api/logout" className="py-2 px-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 rounded-lg">
                  Çıkış Yap
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
