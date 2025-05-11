import { ReactNode } from "react";

interface IslamicBorderProps {
  children: ReactNode;
  className?: string;
}

const IslamicBorder = ({ children, className = "" }: IslamicBorderProps) => {
  return (
    <div className={`relative rounded-lg overflow-hidden bg-white dark:bg-navy-dark shadow-md mb-6 ${className}`}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-primary"></div>
      {children}
    </div>
  );
};

export default IslamicBorder;
