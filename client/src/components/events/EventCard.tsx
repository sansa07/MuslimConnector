import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import IslamicBorder from "@/components/shared/IslamicBorder";
import { IconMapMarker, IconClock, IconUsers } from "@/lib/icons";
import { Button } from "@/components/ui/button";

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  image?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  attendeesCount: number;
  userAttending?: boolean;
}

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const { isAuthenticated } = useAuth();
  
  // Format date for display (15 MAYIS)
  const formattedDate = format(new Date(event.date), "d MMMM", { locale: tr });
  const [day, month] = formattedDate.split(" ");
  
  const attendMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/events/${event.id}/attend`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
  });

  const handleAttend = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    attendMutation.mutate();
  };

  return (
    <IslamicBorder>
      <div className="p-4">
        {/* Event Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="bg-primary text-white dark:bg-primary-light dark:text-navy-dark rounded-lg p-2 mr-3 text-center min-w-[4rem]">
              <div className="text-xs font-medium">{month.toUpperCase()}</div>
              <div className="text-xl font-bold">{day}</div>
            </div>
            <div>
              <h3 className="font-medium text-lg">{event.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <IconMapMarker className="inline-block mr-1 text-primary" /> {event.location}
              </p>
            </div>
          </div>
          <Button
            variant={event.userAttending ? "outline" : "default"}
            onClick={handleAttend}
            disabled={attendMutation.isPending}
          >
            {event.userAttending ? "Katılıyor" : "Katıl"}
          </Button>
        </div>
        
        {/* Event Content */}
        <div className="mb-4">
          {event.image && (
            <img 
              src={event.image} 
              alt={event.title} 
              className="w-full h-auto rounded-lg mb-3"
            />
          )}
          <p className="text-gray-800 dark:text-gray-200">
            {event.description}
          </p>
          <div className="flex items-center mt-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="mr-4">
              <IconClock className="inline-block mr-1" /> {event.startTime} - {event.endTime}
            </div>
            <div>
              <IconUsers className="inline-block mr-1" /> {event.attendeesCount} kişi katılıyor
            </div>
          </div>
        </div>
      </div>
    </IslamicBorder>
  );
};

export default EventCard;
