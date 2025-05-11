import { Link, useLocation } from "wouter";
import { IconHome, IconCompass, IconPraying, IconCalendar, IconPrayerTimes, IconWisdom } from "@/lib/icons";

const MobileNav = () => {
  const [location] = useLocation();
  
  const isActiveRoute = (route: string) => {
    return location === route;
  };

  const navItems = [
    { label: "Anasayfa", path: "/", icon: <IconHome /> },
    { label: "Keşfet", path: "/explore", icon: <IconCompass /> },
    { label: "Dua", path: "/dua-requests", icon: <IconPraying /> },
    { label: "Etkinlik", path: "/events", icon: <IconCalendar /> },
    { label: "Namaz", path: "/prayer-times", icon: <IconPrayerTimes /> },
    { label: "Günlük", path: "/daily-wisdom", icon: <IconWisdom /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-navy-dark shadow-md lg:hidden z-40">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a className={`flex flex-col items-center p-3 ${
              isActiveRoute(item.path) 
                ? "text-primary dark:text-primary-light" 
                : "text-gray-500 dark:text-gray-400"
            }`}>
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
