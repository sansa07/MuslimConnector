import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share, Bookmark, MoreHorizontal } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Post } from '@shared/schema';

interface HadithPostCardProps {
  post: Post;
}

export default function HadithPostCard({ post }: HadithPostCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch post author
  const { data: author, isLoading: isLoadingAuthor } = useQuery({
    queryKey: [`/api/users/${post.userId}`],
    retry: false,
    enabled: !!post.userId
  });

  // Fetch post likes
  const { data: likes, isLoading: isLoadingLikes } = useQuery({
    queryKey: [`/api/posts/${post.id}/likes`],
  });

  // Fetch post comments count
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: [`/api/posts/${post.id}/comments`],
  });

  // Like mutation
  const { mutate: likePost } = useMutation({
    mutationFn: async (type: string) => {
      return await apiRequest("POST", `/api/posts/${post.id}/likes`, { type });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/likes`] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Beğeni işlemi sırasında bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleLike = (type: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Giriş gerekli",
        description: "Bu işlemi gerçekleştirmek için giriş yapmalısınız.",
      });
      return;
    }
    likePost(type);
  };

  // Format date
  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: tr });
    } catch (error) {
      return 'Bilinmeyen tarih';
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return 'UK';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Parse content to extract Arabic text, translation, and source
  const parseHadithContent = () => {
    try {
      const contentObj = JSON.parse(post.content);
      return {
        arabicText: contentObj.arabicText || "",
        translation: contentObj.translation || "",
        source: contentObj.source || ""
      };
    } catch (e) {
      // If not JSON, try to use simple content
      return {
        arabicText: "",
        translation: post.content,
        source: ""
      };
    }
  };

  const hadithContent = parseHadithContent();

  return (
    <Card className="islamic-border mb-6 overflow-hidden">
      <CardContent className="p-4">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            {isLoadingAuthor ? (
              <Skeleton className="w-10 h-10 rounded-full mr-3" />
            ) : (
              <Avatar className="w-10 h-10 mr-3">
                <AvatarImage src={author?.profileImageUrl} />
                <AvatarFallback>{getInitials(author?.firstName + ' ' + author?.lastName)}</AvatarFallback>
              </Avatar>
            )}
            <div>
              {isLoadingAuthor ? (
                <>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </>
              ) : (
                <>
                  <h3 className="font-medium">{author?.firstName} {author?.lastName}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(post.createdAt)}</p>
                </>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Post Content */}
        <div className="mb-4">
          <div className="bg-gray-50 dark:bg-[#121E2F] rounded-lg p-4 text-center mb-3">
            {hadithContent.arabicText && (
              <p className="font-amiri text-lg leading-relaxed mb-3 rtl text-navy-dark dark:text-gray-200" dir="rtl">
                "{hadithContent.arabicText}"
              </p>
            )}
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              "{hadithContent.translation}"
            </p>
            <p className="text-sm text-primary dark:text-primary-light">
              {hadithContent.source || "Hadis kaynağı"}
            </p>
          </div>
          <p className="text-gray-800 dark:text-gray-200">
            {post.type === "hadith" ? post.content.split('---')[1] || "" : post.content}
          </p>
        </div>
        
        {/* Post Actions */}
        <div className="flex flex-wrap justify-between items-center pb-2">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center py-1 px-3 text-sm rounded-full bg-red-50 dark:bg-red-900 dark:bg-opacity-30 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 dark:hover:bg-opacity-50"
              onClick={() => handleLike('like')}
            >
              <Heart className="mr-1 h-4 w-4" />
              <span>{likes?.like || 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center py-1 px-3 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <MessageSquare className="mr-1 h-4 w-4" />
              <span>{comments?.length || 0}</span>
            </Button>
          </div>
          
          <div className="flex space-x-2 mt-2 sm:mt-0">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center py-1 px-3 text-sm rounded-full bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 dark:hover:bg-opacity-50"
            >
              <Share className="mr-1 h-4 w-4" />
              <span>Paylaş</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center py-1 px-3 text-sm rounded-full bg-primary bg-opacity-10 text-primary dark:text-primary-light hover:bg-primary hover:bg-opacity-20"
            >
              <Bookmark className="mr-1 h-4 w-4" />
              <span>Kaydet</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
