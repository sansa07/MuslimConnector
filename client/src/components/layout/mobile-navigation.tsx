import { useLocation } from "wouter";
import { Home, Compass, HandHelping, Calendar, Clock } from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#121E2F] shadow-md lg:hidden z-40">
      <div className="flex justify-around">
        <a href="/" className={`flex flex-col items-center p-3 ${location === "/" ? "text-primary dark:text-primary-light" : "text-gray-500 dark:text-gray-400"}`}>
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Anasayfa</span>
        </a>
        <a href="/explore" className={`flex flex-col items-center p-3 ${location === "/explore" ? "text-primary dark:text-primary-light" : "text-gray-500 dark:text-gray-400"}`}>
          <Compass className="h-5 w-5" />
          <span className="text-xs mt-1">Keşfet</span>
        </a>
        <a href="/duas" className={`flex flex-col items-center p-3 ${location === "/duas" ? "text-primary dark:text-primary-light" : "text-gray-500 dark:text-gray-400"}`}>
          <HandHelping className="h-5 w-5" />
          <span className="text-xs mt-1">Dua</span>
        </a>
        <a href="/events" className={`flex flex-col items-center p-3 ${location === "/events" ? "text-primary dark:text-primary-light" : "text-gray-500 dark:text-gray-400"}`}>
          <Calendar className="h-5 w-5" />
          <span className="text-xs mt-1">Etkinlik</span>
        </a>
        <a href="/prayer-times" className={`flex flex-col items-center p-3 ${location === "/prayer-times" ? "text-primary dark:text-primary-light" : "text-gray-500 dark:text-gray-400"}`}>
          <Clock className="h-5 w-5" />
          <span className="text-xs mt-1">Hakikat</span>
        </a>
      </div>
    </nav>
  );
}
