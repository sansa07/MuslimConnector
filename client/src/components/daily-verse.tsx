import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DailyVerse() {
  const { data: verse, isLoading, error } = useQuery({
    queryKey: ['/api/daily-verse'],
  });

  if (isLoading) {
    return (
      <Card className="islamic-border mb-6 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center mb-3">
            <BookOpen className="mr-2 h-5 w-5 text-accent" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="text-center py-4">
            <Skeleton className="h-6 w-3/4 mx-auto mb-3" />
            <Skeleton className="h-4 w-5/6 mx-auto mb-2" />
            <Skeleton className="h-4 w-4/6 mx-auto mb-3" />
            <Skeleton className="h-4 w-40 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="islamic-border mb-6 overflow-hidden">
        <CardContent className="p-5">
          <h2 className="font-amiri text-lg font-bold mb-3 flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-accent" /> 
            Günün Ayeti
          </h2>
          <p className="text-red-500 text-center py-4">Günün ayeti yüklenirken bir hata oluştu.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="islamic-border mb-6 overflow-hidden">
      <CardContent className="p-5">
        <h2 className="font-amiri text-lg font-bold mb-3 flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-accent" /> 
          Günün Ayeti
        </h2>
        <div className="text-center py-4">
          <p className="font-amiri text-xl leading-relaxed mb-2 rtl text-primary-foreground dark:text-gray-200" dir="rtl">
            {verse?.arabicText || "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ"}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {verse?.translation || "Ben cinleri ve insanları, ancak bana kulluk etsinler diye yarattım."}
          </p>
          <p className="text-sm text-primary dark:text-primary-light">
            {verse?.reference || "Zariyat Suresi, 56. Ayet"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
