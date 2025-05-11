import { Link, useLocation } from "wouter";
import { Home, Compass, HandHelping, Calendar, User } from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#121E2F] shadow-md lg:hidden z-40">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center p-3 ${location === "/" ? "text-primary dark:text-primary-light" : "text-gray-500 dark:text-gray-400"}`}>
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Anasayfa</span>
          </a>
        </Link>
        <Link href="/explore">
          <a className={`flex flex-col items-center p-3 ${location === "/explore" ? "text-primary dark:text-primary-light" : "text-gray-500 dark:text-gray-400"}`}>
            <Compass className="h-5 w-5" />
            <span className="text-xs mt-1">Keşfet</span>
          </a>
        </Link>
        <Link href="/duas">
          <a className={`flex flex-col items-center p-3 ${location === "/duas" ? "text-primary dark:text-primary-light" : "text-gray-500 dark:text-gray-400"}`}>
            <HandHelping className="h-5 w-5" />
            <span className="text-xs mt-1">Dua</span>
          </a>
        </Link>
        <Link href="/events">
          <a className={`flex flex-col items-center p-3 ${location === "/events" ? "text-primary dark:text-primary-light" : "text-gray-500 dark:text-gray-400"}`}>
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Etkinlik</span>
          </a>
        </Link>
        <Link href="/profile">
          <a className={`flex flex-col items-center p-3 ${location === "/profile" ? "text-primary dark:text-primary-light" : "text-gray-500 dark:text-gray-400"}`}>
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profil</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
