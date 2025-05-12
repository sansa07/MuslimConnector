import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import IslamicBorder from "@/components/shared/IslamicBorder";
import { IconPraying } from "@/lib/icons";
import { Button } from "@/components/ui/button";

interface DuaRequest {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  prayerCount: number;
  userPrayed?: boolean;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

interface DuaRequestCardProps {
  duaRequest: DuaRequest;
}

const DuaRequestCard = ({ duaRequest }: DuaRequestCardProps) => {
  const { isAuthenticated } = useAuth();
  
  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: tr
    });
  };

  const prayMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/dua-requests/${duaRequest.id}/pray`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dua-requests"] });
    },
  });

  const handlePray = () => {
    if (!isAuthenticated) {
      window.location.href = "/auth";
      return;
    }
    prayMutation.mutate();
  };

  const getUserFullName = (user: { firstName?: string; lastName?: string }) => {
    return [user.firstName, user.lastName].filter(Boolean).join(" ") || "Anonim";
  };

  return (
    <IslamicBorder>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <img 
              src={duaRequest.user.profileImageUrl || "https://via.placeholder.com/100"} 
              alt="Profil Fotoğrafı" 
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <div>
              <h3 className="font-medium">{getUserFullName(duaRequest.user)}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimestamp(duaRequest.timestamp)}
              </p>
            </div>
          </div>
          <div className="bg-gold bg-opacity-10 text-gold dark:text-gold-light text-xs font-medium py-1 px-2 rounded-full">
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
              variant={duaRequest.userPrayed ? "outline" : "default"}
              className="w-full"
              onClick={handlePray}
              disabled={prayMutation.isPending}
            >
              <IconPraying className="mr-2" />
              <span>Dua Et</span>
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <span>{duaRequest.prayerCount} kişi dua etti</span>
        </div>
      </div>
    </IslamicBorder>
  );
};

export default DuaRequestCard;
