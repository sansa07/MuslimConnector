import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageSquare, MoreHorizontal } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Post, Comment, User } from '@shared/schema';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { user, isAuthenticated } = useAuth();
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  // Fetch post author
  const { data: author, isLoading: isLoadingAuthor } = useQuery({
    queryKey: [`/api/users/${post.userId}`],
    retry: false,
    enabled: !!post.userId
  });

  // Fetch post comments
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: [`/api/posts/${post.id}/comments`],
  });

  // Fetch post likes
  const { data: likes, isLoading: isLoadingLikes } = useQuery({
    queryKey: [`/api/posts/${post.id}/likes`],
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

  // Comment mutation
  const { mutate: addComment, isPending: isAddingComment } = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/posts/${post.id}/comments`, { content: comment });
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Yorum eklenirken bir hata oluştu.",
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

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Giriş gerekli",
        description: "Yorum yapmak için giriş yapmalısınız.",
      });
      return;
    }
    if (!comment.trim()) return;
    addComment();
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

  const renderLikeButtons = () => {
    const likesCount = likes?.like || 0;
    
    return (
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center py-1 px-2 sm:px-3 text-xs sm:text-sm rounded-full bg-red-50 dark:bg-red-900 dark:bg-opacity-30 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 dark:hover:bg-opacity-50"
          onClick={() => handleLike('like')}
        >
          <Heart className="sm:mr-1 h-4 w-4" />
          <span className="hidden xs:inline ml-1">{likesCount}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center py-1 px-2 sm:px-3 text-xs sm:text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <MessageSquare className="sm:mr-1 h-4 w-4" />
          <span className="hidden xs:inline ml-1">{comments?.length || 0}</span>
        </Button>
      </div>
    );
  };

  const renderIslamicReactions = () => {
    const aminCount = likes?.amin || 0;
    const masallahCount = likes?.masallah || 0;
    
    return (
      <div className="flex space-x-2 mt-2 sm:mt-0">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center py-1 px-2 sm:px-3 text-xs sm:text-sm rounded-full bg-green-50 dark:bg-green-900 dark:bg-opacity-30 text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900 dark:hover:bg-opacity-50"
          onClick={() => handleLike('amin')}
        >
          <span className="text-xs sm:text-sm">🤲</span>
          <span className="hidden xs:inline ml-1">Amin</span>
          <span className="hidden xs:inline ml-1">({aminCount})</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center py-1 px-2 sm:px-3 text-xs sm:text-sm rounded-full bg-amber-50 dark:bg-amber-900 dark:bg-opacity-30 text-amber-600 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 dark:hover:bg-opacity-50"
          onClick={() => handleLike('masallah')}
        >
          <span className="text-xs sm:text-sm">✨</span>
          <span className="hidden xs:inline ml-1">Maşallah</span>
          <span className="hidden xs:inline ml-1">({masallahCount})</span>
        </Button>
      </div>
    );
  };

  const renderComments = () => {
    if (isLoadingComments) {
      return (
        <div className="mb-3">
          <div className="flex items-start mb-2">
            <Skeleton className="w-8 h-8 rounded-full mr-2" />
            <div className="bg-gray-100 dark:bg-primary/10 rounded-2xl px-3 py-2 flex-grow">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        </div>
      );
    }

    if (!comments || comments.length === 0) {
      return <p className="text-sm text-gray-500 py-2">Henüz yorum yok</p>;
    }

    return comments.map((comment: Comment) => (
      <div className="mb-3" key={comment.id}>
        <div className="flex items-start mb-2">
          <Avatar className="w-8 h-8 mr-2">
            <AvatarImage src="https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" />
            <AvatarFallback>UK</AvatarFallback>
          </Avatar>
          <div className="bg-gray-100 dark:bg-navy rounded-2xl px-3 py-2 flex-grow">
            <h4 className="font-medium text-sm">Kullanıcı</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
          </div>
        </div>
      </div>
    ));
  };

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
          <p className="text-gray-800 dark:text-gray-200 mb-4">
            {post.content}
          </p>
          {post.imageUrl && (
            <img 
              src={post.imageUrl}
              alt="Post"
              className="w-full h-auto rounded-lg"
            />
          )}
        </div>
        
        {/* Post Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 pb-2">
          <div className="flex justify-center sm:justify-start">
            {isLoadingLikes ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              renderLikeButtons()
            )}
          </div>
          
          <div className="flex justify-center sm:justify-end">
            {isLoadingLikes ? (
              <Skeleton className="h-8 w-36" />
            ) : (
              renderIslamicReactions()
            )}
          </div>
        </div>
        
        {/* Comments Section */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
          {renderComments()}
          
          {/* Add Comment */}
          <form onSubmit={handleAddComment} className="flex flex-col sm:flex-row items-start sm:items-center mt-2 gap-2">
            <Avatar className="w-8 h-8 hidden sm:block">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback>{user ? getInitials(user.firstName + ' ' + user.lastName) : 'UK'}</AvatarFallback>
            </Avatar>
            <div className="flex items-center w-full">
              <Input
                type="text"
                placeholder="Yorum yap..."
                className="flex-grow p-2 bg-gray-100 dark:bg-navy text-gray-700 dark:text-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isAddingComment}
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="sm" 
                className="ml-2"
                disabled={isAddingComment || !comment.trim()}
              >
                Gönder
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
