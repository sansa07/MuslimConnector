import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import IslamicBorder from "@/components/shared/IslamicBorder";
import { 
  IconHeart, IconComment, IconPraying, IconStar, IconElipsisH 
} from "@/lib/icons";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

interface Post {
  id: string;
  userId: string;
  type: string;
  content: string;
  image?: string | null;
  likes: number;
  comments: Comment[];
  timestamp: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  userLiked?: boolean;
}

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(post.userLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showAllComments, setShowAllComments] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  
  const visibleComments = showAllComments 
    ? post.comments 
    : post.comments.slice(0, 2);

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

  const commentMutation = useMutation({
    mutationFn: async (text: string) => {
      await apiRequest("POST", `/api/posts/${post.id}/comment`, { text });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    likeMutation.mutate();
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    if (newComment.trim()) {
      commentMutation.mutate(newComment);
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
          <p className="text-gray-800 dark:text-gray-200 mb-4">
            {post.content}
          </p>
          {post.image && (
            <img 
              src={post.image} 
              alt="Paylaşım Görseli" 
              className="w-full h-auto rounded-lg"
            />
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
              <span>{post.comments.length}</span>
            </button>
          </div>
          
          <div className="flex space-x-2 mt-2 sm:mt-0">
            <button className="reaction-btn reaction-amin">
              <IconPraying className="mr-1" />
              <span>Amin</span>
            </button>
            <button className="reaction-btn reaction-mashallah">
              <IconStar className="mr-1" />
              <span>Maşallah</span>
            </button>
          </div>
        </div>
        
        {/* Comments Section */}
        {post.comments.length > 0 && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            {visibleComments.map((comment) => (
              <div key={comment.id} className="mb-3">
                <div className="flex items-start mb-2">
                  <img 
                    src={comment.user.profileImageUrl || "https://via.placeholder.com/100"} 
                    alt="Profil Fotoğrafı" 
                    className="w-8 h-8 rounded-full object-cover mr-2"
                  />
                  <div className="bg-gray-100 dark:bg-navy rounded-2xl px-3 py-2 flex-grow">
                    <h4 className="font-medium text-sm">{getUserFullName(comment.user)}</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {post.comments.length > 2 && (
              <button 
                className="text-sm text-primary dark:text-primary-light hover:underline mb-3"
                onClick={() => setShowAllComments(!showAllComments)}
              >
                {showAllComments ? "Yorumları Gizle" : `${post.comments.length - 2} yorum daha göster`}
              </button>
            )}
          </div>
        )}
        
        {/* Add Comment */}
        <form onSubmit={handleComment} className="flex items-center mt-3">
          <img 
            src={user?.profileImageUrl || "https://via.placeholder.com/100"} 
            alt="Profil Fotoğrafı" 
            className="w-8 h-8 rounded-full object-cover mr-2"
          />
          <Textarea
            placeholder="Yorum yap..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[40px] resize-none text-sm py-2"
          />
          <button 
            type="submit"
            className="ml-2 p-2 bg-primary text-white rounded-full"
            disabled={commentMutation.isPending || !newComment.trim()}
          >
            <IconComment />
          </button>
        </form>
      </div>
    </IslamicBorder>
  );
};

export default PostCard;
