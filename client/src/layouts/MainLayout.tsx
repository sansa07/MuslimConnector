import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileNav from "@/components/layout/MobileNav";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <>
      <Sidebar />
      <MobileHeader />
      
      <main className="lg:ml-64 pb-20 lg:pb-10">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      
      <MobileNav />
    </>
  );
};

export default MainLayout;
