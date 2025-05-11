import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { Home, Compass, Calendar, HandHelping, Book, Users, User, Settings, LogOut } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation-with-defaults";
import LanguageSwitcher from "../lang-switcher";

export default function Sidebar() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [location] = useLocation();

  return (
    <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#121E2F] shadow-md z-40">
      <div className="p-4">
        <div className="flex items-center mb-8">
          <i className="fas fa-mosque text-primary text-2xl mr-2"></i>
          <h1 className="font-amiri text-2xl font-bold text-primary dark:text-primary-light">MüslimNet</h1>
        </div>
        
        {/* User Profile Summary */}
        {isAuthenticated ? (
          <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
            <img 
              src={user?.profileImageUrl || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"} 
              alt="Profil Fotoğrafı" 
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium">{user?.firstName || "Müslüman"} {user?.lastName || "Kullanıcı"}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{user?.username || user?.email?.split('@')[0]}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
            <Link href="/api/login">
              <a className="bg-primary text-white rounded-full px-6 py-2 hover:bg-primary/90 transition-colors">
                {t('auth.login')}
              </a>
            </Link>
          </div>
        )}
        
        {/* Navigation Menu */}
        <nav className="space-y-1">
          <Link href="/">
            <a className={`flex items-center space-x-3 p-3 rounded-lg ${location === "/" ? "bg-primary bg-opacity-10 text-primary dark:text-primary-light" : "hover:bg-gray-100 dark:hover:bg-navy text-gray-700 dark:text-gray-200"}`}>
              <Home className="w-5 h-5" />
              <span>{t('nav.home')}</span>
            </a>
          </Link>
          <Link href="/explore">
            <a className={`flex items-center space-x-3 p-3 rounded-lg ${location === "/explore" ? "bg-primary bg-opacity-10 text-primary dark:text-primary-light" : "hover:bg-gray-100 dark:hover:bg-navy text-gray-700 dark:text-gray-200"}`}>
              <Compass className="w-5 h-5" />
              <span>{t('nav.explore')}</span>
            </a>
          </Link>
          <Link href="/events">
            <a className={`flex items-center space-x-3 p-3 rounded-lg ${location === "/events" ? "bg-primary bg-opacity-10 text-primary dark:text-primary-light" : "hover:bg-gray-100 dark:hover:bg-navy text-gray-700 dark:text-gray-200"}`}>
              <Calendar className="w-5 h-5" />
              <span>{t('nav.events')}</span>
            </a>
          </Link>
          <Link href="/duas">
            <a className={`flex items-center space-x-3 p-3 rounded-lg ${location === "/duas" ? "bg-primary bg-opacity-10 text-primary dark:text-primary-light" : "hover:bg-gray-100 dark:hover:bg-navy text-gray-700 dark:text-gray-200"}`}>
              <HandHelping className="w-5 h-5" />
              <span>{t('nav.duas')}</span>
            </a>
          </Link>
          <Link href="/quran">
            <a className={`flex items-center space-x-3 p-3 rounded-lg ${location === "/quran" ? "bg-primary bg-opacity-10 text-primary dark:text-primary-light" : "hover:bg-gray-100 dark:hover:bg-navy text-gray-700 dark:text-gray-200"}`}>
              <Book className="w-5 h-5" />
              <span>{t('nav.quran')}</span>
            </a>
          </Link>
          <Link href="/communities">
            <a className={`flex items-center space-x-3 p-3 rounded-lg ${location === "/communities" ? "bg-primary bg-opacity-10 text-primary dark:text-primary-light" : "hover:bg-gray-100 dark:hover:bg-navy text-gray-700 dark:text-gray-200"}`}>
              <Users className="w-5 h-5" />
              <span>{t('nav.communities')}</span>
            </a>
          </Link>
          <Link href="/profile">
            <a className={`flex items-center space-x-3 p-3 rounded-lg ${location === "/profile" ? "bg-primary bg-opacity-10 text-primary dark:text-primary-light" : "hover:bg-gray-100 dark:hover:bg-navy text-gray-700 dark:text-gray-200"}`}>
              <User className="w-5 h-5" />
              <span>{t('nav.profile')}</span>
            </a>
          </Link>
        </nav>
      </div>
      
      {/* Theme Toggle, Language & Settings */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          <div className="flex items-center space-x-1">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy">
              <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            {isAuthenticated && (
              <a href="/api/logout" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy">
                <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </a>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
