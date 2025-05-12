import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ui/theme-provider";
import { 
  IconHome, 
  IconCompass, 
  IconCalendar, 
  IconPraying, 
  IconQuran, 
  IconUsers, 
  IconUser, 
  IconSettings, 
  IconLogout,
  IconPrayerTimes,
  IconWisdom
} from "@/lib/icons";

const Sidebar = () => {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const isActiveRoute = (route: string) => {
    return location === route;
  };

  const menuItems = [
    { label: "Anasayfa", path: "/", icon: <IconHome /> },
    { label: "Keşfet", path: "/explore", icon: <IconCompass /> },
    { label: "Etkinlikler", path: "/events", icon: <IconCalendar /> },
    { label: "Dua İstekleri", path: "/dua-requests", icon: <IconPraying /> },
    { label: "Namaz Vakitleri", path: "/prayer-times", icon: <IconPrayerTimes /> },
    { label: "Günün Öğüdü", path: "/daily-wisdom", icon: <IconWisdom /> },
    { label: "Kuran & Hadisler", path: "/quran-hadith", icon: <IconQuran /> },
    { label: "Topluluklar", path: "/communities", icon: <IconUsers /> },
    { label: "Hakkımızda", path: "/about", icon: <IconSettings /> },
  ];

  return (
    <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-navy-dark shadow-md z-40">
      <div className="p-4">
        <div className="flex items-center mb-8">
          <span className="text-primary text-2xl mr-2">&#xF6C0;</span> {/* Mosque icon */}
          <h1 className="font-amiri text-2xl font-bold text-primary dark:text-primary-light">MüslimNet</h1>
        </div>
        
        {isAuthenticated ? (
          <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
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
          <div className="mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
            <Link 
              href="/auth"
              className="w-full flex items-center justify-center py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
            >
              Giriş Yap
            </Link>
          </div>
        )}
        
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                isActiveRoute(item.path) 
                  ? "bg-primary bg-opacity-10 text-primary dark:text-primary-light" 
                  : "hover:bg-gray-100 dark:hover:bg-navy text-gray-700 dark:text-gray-200"
              }`}
            >
              <span className="w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy">
            <IconSettings className="text-gray-600 dark:text-gray-300" />
          </button>
          {isAuthenticated && (
            <a href="/api/logout" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy">
              <IconLogout className="text-gray-600 dark:text-gray-300" />
            </a>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
