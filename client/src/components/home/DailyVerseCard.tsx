import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import IslamicBorder from "@/components/shared/IslamicBorder";
import { IconQuran } from "@/lib/icons";

interface DailyVerse {
  arabic: string;
  translation: string;
  reference: string;
}

const DailyVerseCard = () => {
  const { data: verse, isLoading } = useQuery({
    queryKey: ["/api/daily-verse"],
  });

  if (isLoading) {
    return (
      <IslamicBorder>
        <div className="p-5">
          <h2 className="font-amiri text-lg font-bold mb-3 flex items-center">
            <IconQuran className="text-gold mr-2" /> Günün Ayeti
          </h2>
          <div className="text-center py-4">
            <Skeleton className="h-8 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-16 w-full mx-auto mb-4" />
            <Skeleton className="h-5 w-40 mx-auto" />
          </div>
        </div>
      </IslamicBorder>
    );
  }

  if (!verse) {
    return (
      <IslamicBorder>
        <div className="p-5">
          <h2 className="font-amiri text-lg font-bold mb-3 flex items-center">
            <IconQuran className="text-gold mr-2" /> Günün Ayeti
          </h2>
          <div className="text-center py-4">
            <p className="text-gray-500">Günün ayeti yüklenemedi.</p>
          </div>
        </div>
      </IslamicBorder>
    );
  }

  return (
    <IslamicBorder>
      <div className="p-5">
        <h2 className="font-amiri text-lg font-bold mb-3 flex items-center">
          <IconQuran className="text-gold mr-2" /> Günün Ayeti
        </h2>
        <div className="text-center py-4">
          <p className="font-amiri text-xl leading-relaxed mb-2 arabic-text text-navy-dark dark:text-gray-200">
            {verse.arabic}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {verse.translation}
          </p>
          <p className="text-sm text-primary dark:text-primary-light">
            {verse.reference}
          </p>
        </div>
      </div>
    </IslamicBorder>
  );
};

export default DailyVerseCard;
