import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, HandHelping } from "lucide-react";
import type { DuaRequest } from '@shared/schema';

interface DuaRequestCardProps {
  duaRequest: DuaRequest;
}

export default function DuaRequestCard({ duaRequest }: DuaRequestCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch dua request author
  const { data: author, isLoading: isLoadingAuthor } = useQuery({
    queryKey: [`/api/users/${duaRequest.userId}`],
    retry: false,
    enabled: !!duaRequest.userId
  });

  // Fetch supporter count
  const { data: supporterCount, isLoading: isLoadingSupporterCount } = useQuery({
    queryKey: [`/api/dua-requests/${duaRequest.id}/supporters/count`],
  });

  // Check if user is supporting
  const { data: isSupporting, isLoading: isLoadingSupporting } = useQuery({
    queryKey: [`/api/dua-requests/${duaRequest.id}/is-supporting`],
    enabled: isAuthenticated
  });

  // Support dua request mutation
  const { mutate: supportDuaRequest } = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/dua-requests/${duaRequest.id}/support`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dua-requests/${duaRequest.id}/supporters/count`] });
      queryClient.invalidateQueries({ queryKey: [`/api/dua-requests/${duaRequest.id}/is-supporting`] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Dua desteği sırasında bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSupport = () => {
    if (!isAuthenticated) {
      toast({
        title: "Giriş gerekli",
        description: "Dua etmek için giriş yapmalısınız.",
      });
      return;
    }
    supportDuaRequest();
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

  return (
    <Card className="islamic-border mb-6 overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            {isLoadingAuthor ? (
              <Skeleton className="w-10 h-10 rounded-full mr-3" />
            ) : (
              <Avatar className="w-10 h-10 mr-3">
                <AvatarImage src={author?.profileImageUrl} />
                <AvatarFallback>{author?.firstName?.[0] || 'U'}{author?.lastName?.[0] || 'K'}</AvatarFallback>
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(duaRequest.createdAt)}</p>
                </>
              )}
            </div>
          </div>
          <div className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:bg-opacity-30 dark:text-amber-300 text-xs font-medium py-1 px-2 rounded-full">
            Dua İsteği
          </div>
        </div>
        
        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-800 dark:text-gray-200 mb-3">
            {duaRequest.content}
          </p>
          <div className="flex justify-center">
            <Button
              onClick={handleSupport}
              className={`flex items-center justify-center w-full py-2 rounded-lg 
                ${isSupporting 
                  ? "bg-green-500 text-white hover:bg-green-600" 
                  : "bg-primary bg-opacity-10 hover:bg-opacity-20 text-primary dark:text-primary-light"}`}
            >
              <HandHelping className="mr-2 h-4 w-4" />
              <span>{isSupporting ? "Dua Edildi" : "Dua Et"}</span>
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          {isLoadingSupporterCount ? (
            <Skeleton className="h-4 w-32 mx-auto" />
          ) : (
            <span>{supporterCount?.count || 0} kişi dua etti</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
