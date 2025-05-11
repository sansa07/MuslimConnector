import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, Clock, MapPin, Plus, User, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "@/components/event-card";
import type { Event } from "@shared/schema";

export default function Events() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    dateTime: new Date(),
    imageUrl: ""
  });

  // Fetch events
  const { 
    data: events, 
    isLoading: isLoadingEvents,
    refetch: refetchEvents
  } = useQuery({
    queryKey: ['/api/events'],
  });

  // Create event mutation
  const { mutate: createEvent, isPending } = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/events", {
        ...formData,
        dateTime: formData.dateTime.toISOString()
      });
    },
    onSuccess: () => {
      toast({
        title: "Etkinlik oluşturuldu",
        description: "Etkinliğiniz başarıyla oluşturuldu."
      });
      setIsCreateDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Etkinlik oluşturulurken bir hata oluştu.",
        variant: "destructive"
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, dateTime: date }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEvent();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      dateTime: new Date(),
      imageUrl: ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-amiri text-primary dark:text-primary-light">Etkinlikler</h1>
        {isAuthenticated && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Etkinlik Oluştur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-amiri text-xl">Yeni Etkinlik Oluştur</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Etkinlik Adı</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Etkinlik adı"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Etkinlik detayları"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Konum</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Etkinlik konumu"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Tarih ve Saat</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dateTime ? (
                          format(formData.dateTime, "PPP", { locale: tr })
                        ) : (
                          <span>Tarih seçin</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.dateTime}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Görsel URL (Opsiyonel)</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="Görsel bağlantısı"
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending ? "Oluşturuluyor..." : "Oluştur"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Upcoming Events */}
      <Card className="islamic-border overflow-hidden">
        <CardHeader>
          <h2 className="text-xl font-bold font-amiri flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
            Yaklaşan Etkinlikler
          </h2>
        </CardHeader>
        <CardContent>
          {isLoadingEvents ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="mb-6">
                <Skeleton className="h-[200px] w-full rounded-lg" />
              </div>
            ))
          ) : events && events.length > 0 ? (
            <div className="space-y-6">
              {events.map((event: Event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/20 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 mb-2">Henüz etkinlik bulunamadı.</p>
              {isAuthenticated && (
                <p className="text-primary">İlk etkinliği oluşturmak için "Etkinlik Oluştur" butonunu kullanabilirsiniz.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Featured Events */}
      <Card className="islamic-border overflow-hidden">
        <CardHeader>
          <h2 className="text-xl font-bold font-amiri flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Öne Çıkan Topluluk Etkinlikleri
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="bg-primary text-white dark:bg-primary-light dark:text-navy-dark rounded-lg p-2 mr-3 text-center min-w-[4rem]">
                      <div className="text-xs font-medium">MAYIS</div>
                      <div className="text-xl font-bold">15</div>
                    </div>
                    <div>
                      <h3 className="font-medium">Ramazan Bayramı Etkinliği</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-primary" />
                        Merkez Camii, İstanbul
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <Clock className="h-3 w-3 mr-1" />
                  <span className="mr-3">09:00 - 12:00</span>
                  <User className="h-3 w-3 mr-1" />
                  <span>57 kişi katılıyor</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="bg-primary text-white dark:bg-primary-light dark:text-navy-dark rounded-lg p-2 mr-3 text-center min-w-[4rem]">
                      <div className="text-xs font-medium">HAZ</div>
                      <div className="text-xl font-bold">5</div>
                    </div>
                    <div>
                      <h3 className="font-medium">Cuma Sohbeti</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-primary" />
                        Fatih Camii, İstanbul
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <Clock className="h-3 w-3 mr-1" />
                  <span className="mr-3">14:00 - 15:30</span>
                  <User className="h-3 w-3 mr-1" />
                  <span>32 kişi katılıyor</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
