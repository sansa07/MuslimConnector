import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import IslamicBorder from "@/components/shared/IslamicBorder";
import { 
  IconHeart, IconComment, IconShare, IconBookmark, IconElipsisH 
} from "@/lib/icons";

interface HadithPost {
  id: string;
  userId: string;
  arabicText: string;
  translation: string;
  source: string;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  userLiked?: boolean;
  userSaved?: boolean;
}

interface HadithPostCardProps {
  post: HadithPost;
}

const HadithPostCard = ({ post }: HadithPostCardProps) => {
  const [isLiked, setIsLiked] = useState(post.userLiked || false);
  const [isSaved, setIsSaved] = useState(post.userSaved || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  
  const { isAuthenticated } = useAuth();

  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: tr
    });
  };

  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${post.id}/like`, {});
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${post.id}/save`, {});
    },
    onSuccess: () => {
      setIsSaved(!isSaved);
      queryClient.invalidateQueries({ queryKey: ["/api/saved-posts"] });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      window.location.href = "/auth";
      return;
    }
    likeMutation.mutate();
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      window.location.href = "/auth";
      return;
    }
    saveMutation.mutate();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Hadis - ${post.source}`,
        text: post.translation,
        url: window.location.href,
      });
    }
  };

  const getUserFullName = (user: { firstName?: string; lastName?: string }) => {
    return [user.firstName, user.lastName].filter(Boolean).join(" ") || "Anonim";
  };

  return (
    <IslamicBorder>
      <div className="p-4">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <img 
              src={post.user.profileImageUrl || "https://via.placeholder.com/100"} 
              alt="Profil Fotoğrafı" 
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <div>
              <h3 className="font-medium">{getUserFullName(post.user)}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimestamp(post.timestamp)}
              </p>
            </div>
          </div>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <IconElipsisH />
          </button>
        </div>
        
        {/* Post Content */}
        <div className="mb-4">
          <div className="bg-gray-50 dark:bg-navy-light rounded-lg p-4 text-center mb-3">
            <p className="font-amiri text-lg leading-relaxed mb-3 arabic-text text-navy-dark dark:text-gray-200">
              {post.arabicText}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              {post.translation}
            </p>
            <p className="text-sm text-primary dark:text-primary-light">
              {post.source}
            </p>
          </div>
          {post.content && (
            <p className="text-gray-800 dark:text-gray-200">
              {post.content}
            </p>
          )}
        </div>
        
        {/* Post Actions */}
        <div className="flex flex-wrap justify-between items-center pb-2">
          <div className="flex space-x-2">
            <button 
              className={`reaction-btn ${isLiked ? 'reaction-heart' : 'reaction-comment'}`}
              onClick={handleLike}
            >
              <IconHeart className="mr-1" />
              <span>{likesCount}</span>
            </button>
            <button className="reaction-btn reaction-comment">
              <IconComment className="mr-1" />
              <span>{post.comments}</span>
            </button>
          </div>
          
          <div className="flex space-x-2 mt-2 sm:mt-0">
            <button 
              className="reaction-btn reaction-share"
              onClick={handleShare}
            >
              <IconShare className="mr-1" />
              <span>Paylaş</span>
            </button>
            <button 
              className={`reaction-btn ${isSaved ? 'reaction-save' : 'reaction-comment'}`}
              onClick={handleSave}
            >
              <IconBookmark className="mr-1" />
              <span>Kaydet</span>
            </button>
          </div>
        </div>
      </div>
    </IslamicBorder>
  );
};

export default HadithPostCard;
