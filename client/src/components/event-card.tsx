import { formatDistanceToNow, format } from 'date-fns';
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
import { CalendarDays, Clock, MapPin, MoreHorizontal, Users } from "lucide-react";
import type { Event } from '@shared/schema';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch event author
  const { data: author, isLoading: isLoadingAuthor } = useQuery({
    queryKey: [`/api/users/${event.userId}`],
    retry: false,
    enabled: !!event.userId
  });

  // Fetch participant count
  const { data: participantCount, isLoading: isLoadingParticipantCount } = useQuery({
    queryKey: [`/api/events/${event.id}/participants/count`],
  });

  // Check if user is participating
  const { data: isParticipating, isLoading: isLoadingParticipation } = useQuery({
    queryKey: [`/api/events/${event.id}/is-participating`],
    enabled: isAuthenticated
  });

  // Participate mutation
  const { mutate: participateInEvent } = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/events/${event.id}/participate`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${event.id}/participants/count`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${event.id}/is-participating`] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Etkinliğe katılım sırasında bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleParticipate = () => {
    if (!isAuthenticated) {
      toast({
        title: "Giriş gerekli",
        description: "Etkinliğe katılmak için giriş yapmalısınız.",
      });
      return;
    }
    participateInEvent();
  };

  // Format date
  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return {
        day: format(date, 'dd', { locale: tr }),
        month: format(date, 'MMM', { locale: tr }).toUpperCase(),
        formattedDate: format(date, 'PPP', { locale: tr }),
        formattedTime: format(date, 'HH:mm', { locale: tr }),
        relativeTime: formatDistanceToNow(date, { addSuffix: true, locale: tr })
      };
    } catch (error) {
      return {
        day: '01',
        month: 'OCA',
        formattedDate: 'Bilinmeyen tarih',
        formattedTime: '00:00',
        relativeTime: 'Bilinmeyen zaman'
      };
    }
  };

  const date = formatDate(event.dateTime);

  return (
    <Card className="islamic-border mb-6 overflow-hidden">
      <CardContent className="p-4">
        {/* Event Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="bg-primary text-white dark:bg-primary-light dark:text-navy-dark rounded-lg p-2 mr-3 text-center min-w-[4rem]">
              <div className="text-xs font-medium">{date.month}</div>
              <div className="text-xl font-bold">{date.day}</div>
            </div>
            <div>
              <h3 className="font-medium text-lg">{event.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <MapPin className="h-3 w-3 mr-1 text-primary" />
                {event.location}
              </p>
            </div>
          </div>
          <Button
            onClick={handleParticipate}
            className={`${isParticipating ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"} text-white`}
          >
            {isLoadingParticipation ? "Yükleniyor..." : isParticipating ? "Katılıyorsunuz" : "Katıl"}
          </Button>
        </div>
        
        {/* Event Content */}
        <div className="mb-4">
          {event.imageUrl && (
            <img 
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-auto rounded-lg mb-3"
            />
          )}
          <p className="text-gray-800 dark:text-gray-200">
            {event.description}
          </p>
          <div className="flex flex-wrap items-center mt-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="mr-4 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {date.formattedTime}
            </div>
            <div className="mr-4 flex items-center">
              <CalendarDays className="h-3 w-3 mr-1" />
              {date.formattedDate}
            </div>
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {isLoadingParticipantCount ? (
                <Skeleton className="h-4 w-12" />
              ) : (
                `${participantCount?.count || 0} kişi katılıyor`
              )}
            </div>
          </div>
        </div>
        
        {/* Event Footer */}
        {isLoadingAuthor ? (
          <div className="flex items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Skeleton className="w-8 h-8 rounded-full mr-2" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <Avatar className="w-8 h-8 mr-2">
                <AvatarImage src={author?.profileImageUrl} />
                <AvatarFallback>{author?.firstName?.[0] || 'U'}{author?.lastName?.[0] || 'K'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{author?.firstName} {author?.lastName}</p>
                <p className="text-xs text-gray-500">Etkinlik Düzenleyicisi</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-500">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
