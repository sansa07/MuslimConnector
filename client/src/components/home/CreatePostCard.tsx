import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import IslamicBorder from "@/components/shared/IslamicBorder";
import { IconImage, IconQuote, IconPraying, IconCalendarPlus } from "@/lib/icons";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const CreatePostCard = () => {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<"text" | "verse" | "dua" | "event">("text");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; type: string }) => {
      const response = await apiRequest("POST", "/api/posts", postData);
      return response.json();
    },
    onSuccess: () => {
      setContent("");
      setPostType("text");
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Başarılı!",
        description: "Paylaşımınız oluşturuldu.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Paylaşım oluşturulamadı: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen paylaşım içeriği girin.",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      content,
      type: postType
    });
  };

  if (!isAuthenticated) {
    return (
      <IslamicBorder>
        <div className="p-4 text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-3">Paylaşım yapmak için giriş yapın.</p>
          <a 
            href="/api/login"
            className="inline-block py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
          >
            Giriş Yap
          </a>
        </div>
      </IslamicBorder>
    );
  }

  return (
    <IslamicBorder>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <img 
            src={user?.profileImageUrl || "https://via.placeholder.com/100"} 
            alt="Profil Fotoğrafı" 
            className="w-10 h-10 rounded-full object-cover"
          />
          <Textarea
            placeholder="Bir şeyler paylaş..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[60px] resize-none"
          />
        </div>
        
        <div className="flex flex-wrap justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
          <button 
            type="button"
            className={`flex items-center p-2 ${postType === 'text' ? 'text-primary' : 'text-gray-600 dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-navy rounded-md mt-2 sm:mt-0`}
            onClick={() => setPostType("text")}
          >
            <IconImage className="mr-2" />
            <span className="text-sm">Görsel</span>
          </button>
          
          <button 
            type="button"
            className={`flex items-center p-2 ${postType === 'verse' ? 'text-primary' : 'text-gray-600 dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-navy rounded-md mt-2 sm:mt-0`}
            onClick={() => setPostType("verse")}
          >
            <IconQuote className="mr-2" />
            <span className="text-sm">Ayet/Hadis</span>
          </button>
          
          <button 
            type="button"
            className={`flex items-center p-2 ${postType === 'dua' ? 'text-primary' : 'text-gray-600 dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-navy rounded-md mt-2 sm:mt-0`}
            onClick={() => setPostType("dua")}
          >
            <IconPraying className="mr-2" />
            <span className="text-sm">Dua</span>
          </button>
          
          <button 
            type="button"
            className={`flex items-center p-2 ${postType === 'event' ? 'text-primary' : 'text-gray-600 dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-navy rounded-md mt-2 sm:mt-0`}
            onClick={() => setPostType("event")}
          >
            <IconCalendarPlus className="mr-2" />
            <span className="text-sm">Etkinlik</span>
          </button>

          <Button 
            type="submit" 
            className="mt-2 sm:mt-0"
            disabled={createPostMutation.isPending}
          >
            {createPostMutation.isPending ? "Paylaşılıyor..." : "Paylaş"}
          </Button>
        </div>
      </form>
    </IslamicBorder>
  );
};

export default CreatePostCard;
