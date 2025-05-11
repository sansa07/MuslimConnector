import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { IconMosque } from "@/lib/icons";

const Login = () => {
  const [_, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white dark:bg-navy-dark rounded-lg shadow-md max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <IconMosque className="text-primary text-5xl" />
        </div>
        
        <h1 className="text-2xl font-bold font-amiri mb-6">MüslimNet'e Hoş Geldiniz</h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          İslami sosyal ağımıza katılın, bilgi ve tecrübelerinizi paylaşın, dua isteklerinizi iletin ve etkinliklere katılın.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={handleLogin}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? "Yükleniyor..." : "Giriş Yap / Kayıt Ol"}
          </button>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Devam ederek, MüslimNet'in <a href="#" className="text-primary hover:underline">kullanım şartlarını</a> ve <a href="#" className="text-primary hover:underline">gizlilik politikasını</a> kabul etmiş olursunuz.
          </p>
        </div>
        
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-4">
            <span className="font-amiri text-gold text-xl">
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Rahman ve Rahim olan Allah'ın adıyla
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
