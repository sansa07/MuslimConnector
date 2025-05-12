import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Quote, HandHelping, Calendar } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CreatePost() {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("regular");
  const { toast } = useToast();
  
  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/posts", {
        type: postType,
        content,
      });
    },
    onSuccess: () => {
      toast({
        title: "Paylaşım başarılı",
        description: "Paylaşımınız başarıyla oluşturuldu.",
      });
      setContent("");
      setPostType("regular");
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: (error) => {
      toast({
        title: "Paylaşım başarısız",
        description: "Paylaşım oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <Card className="islamic-border mb-6 overflow-hidden">
        <CardContent className="p-4">
          <div className="text-center p-4">
            <p className="mb-3">Paylaşım yapmak için giriş yapmalısınız.</p>
            <a 
              href="/auth" 
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90"
            >
              Giriş Yap
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir içerik girin.",
        variant: "destructive",
      });
      return;
    }
    createPost();
  };

  const handleTypeChange = (type: string) => {
    setPostType(type);
  };

  return (
    <Card className="islamic-border mb-6 overflow-hidden">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-4">
            <img 
              src={user?.profileImageUrl || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"} 
              alt="Profil Fotoğrafı" 
              className="w-10 h-10 rounded-full object-cover mb-2 sm:mb-0"
            />
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={postType === "regular" 
                ? "Bir şeyler paylaş..." 
                : postType === "dua" 
                ? "Bir dua paylaş..." 
                : postType === "ayet" 
                ? "Bir ayet veya hadis paylaş..." 
                : "Bir etkinlik paylaş..."
              }
              className="resize-none focus-visible:ring-primary min-h-[80px]"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-1 mb-2 sm:mb-0">
              <Button 
                type="button"
                variant="ghost" 
                size="sm"
                className={`flex items-center justify-center ${postType === "regular" ? "text-primary dark:text-primary-light" : "text-gray-600 dark:text-gray-300"} hover:bg-gray-100 dark:hover:bg-navy rounded-md px-2 py-1`}
                onClick={() => handleTypeChange("regular")}
              >
                <Image className="h-4 w-4 sm:mr-1" />
                <span className="text-xs sm:text-sm hidden sm:inline">Görsel</span>
              </Button>
              
              <Button 
                type="button"
                variant="ghost" 
                size="sm"
                className={`flex items-center justify-center ${postType === "ayet" ? "text-primary dark:text-primary-light" : "text-gray-600 dark:text-gray-300"} hover:bg-gray-100 dark:hover:bg-navy rounded-md px-2 py-1`}
                onClick={() => handleTypeChange("ayet")}
              >
                <Quote className="h-4 w-4 sm:mr-1" />
                <span className="text-xs sm:text-sm hidden sm:inline">Ayet/Hadis</span>
              </Button>
              
              <Button 
                type="button"
                variant="ghost" 
                size="sm"
                className={`flex items-center justify-center ${postType === "dua" ? "text-primary dark:text-primary-light" : "text-gray-600 dark:text-gray-300"} hover:bg-gray-100 dark:hover:bg-navy rounded-md px-2 py-1`}
                onClick={() => handleTypeChange("dua")}
              >
                <HandHelping className="h-4 w-4 sm:mr-1" />
                <span className="text-xs sm:text-sm hidden sm:inline">Dua</span>
              </Button>
              
              <Button 
                type="button"
                variant="ghost" 
                size="sm"
                className={`flex items-center justify-center ${postType === "event" ? "text-primary dark:text-primary-light" : "text-gray-600 dark:text-gray-300"} hover:bg-gray-100 dark:hover:bg-navy rounded-md px-2 py-1`}
                onClick={() => handleTypeChange("event")}
              >
                <Calendar className="h-4 w-4 sm:mr-1" />
                <span className="text-xs sm:text-sm hidden sm:inline">Etkinlik</span>
              </Button>
            </div>
            
            <Button 
              type="submit"
              disabled={isPending || !content.trim()}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white"
            >
              {isPending ? "Paylaşılıyor..." : "Paylaş"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
