import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "@/components/events/EventCard";
import { IconPlus, IconCalendar } from "@/lib/icons";
import { useToast } from "@/hooks/use-toast";

const Events = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "12:00",
  });
  
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const { data: upcomingEvents, isLoading: upcomingLoading } = useQuery({
    queryKey: ["/api/events/upcoming"],
  });
  
  const { data: myEvents, isLoading: myEventsLoading } = useQuery({
    queryKey: ["/api/events/my-events"],
    enabled: isAuthenticated,
  });
  
  const { data: dateEvents, isLoading: dateEventsLoading } = useQuery({
    queryKey: ["/api/events/by-date", date ? format(date, "yyyy-MM-dd") : ""],
    enabled: !!date,
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: typeof formData) => {
      const response = await apiRequest("POST", "/api/events", eventData);
      return response.json();
    },
    onSuccess: () => {
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        location: "",
        date: format(new Date(), "yyyy-MM-dd"),
        startTime: "09:00",
        endTime: "12:00",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Etkinlik oluşturuldu",
        description: "Etkinliğiniz başarıyla oluşturuldu.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Etkinlik oluşturulamadı: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location) {
      toast({
        title: "Eksik bilgi",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive",
      });
      return;
    }
    createEventMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <div className="mb-6">
        <title>Etkinlikler - MüslimNet</title>
        <meta name="description" content="İslami etkinlikler, toplantılar, iftar programları ve sohbetlere katılın. Takvimden etkinlikleri takip edin." />
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-amiri">Etkinlikler</h1>
        {isAuthenticated && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className="mr-2" />
                Etkinlik Oluştur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Etkinlik Oluştur</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Etkinlik Adı</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="location">Konum</Label>
                  <Input 
                    id="location" 
                    name="location" 
                    value={formData.location} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="date">Tarih</Label>
                  <Input 
                    id="date" 
                    name="date" 
                    type="date" 
                    value={formData.date} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="startTime">Başlangıç Saati</Label>
                    <Input 
                      id="startTime" 
                      name="startTime" 
                      type="time" 
                      value={formData.startTime} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="endTime">Bitiş Saati</Label>
                    <Input 
                      id="endTime" 
                      name="endTime" 
                      type="time" 
                      value={formData.endTime} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createEventMutation.isPending}
                >
                  {createEventMutation.isPending ? "Oluşturuluyor..." : "Etkinlik Oluştur"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="bg-white dark:bg-navy-dark rounded-lg shadow-md p-4">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <IconCalendar className="mr-2" /> Etkinlik Takvimi
            </h2>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="border rounded-md p-3"
              locale={tr}
            />
          </div>
        </div>
        
        <div className="col-span-1 lg:col-span-2">
          <Tabs defaultValue="upcoming">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="upcoming" className="flex-1">Yaklaşan Etkinlikler</TabsTrigger>
              {isAuthenticated && (
                <TabsTrigger value="my-events" className="flex-1">Etkinliklerim</TabsTrigger>
              )}
              <TabsTrigger value="selected-date" className="flex-1">Seçili Tarih</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {upcomingLoading ? (
                [...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-64 mb-6 rounded-lg" />
                ))
              ) : upcomingEvents?.length > 0 ? (
                upcomingEvents.map((event: any) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Yaklaşan etkinlik bulunmuyor.
                </div>
              )}
            </TabsContent>
            
            {isAuthenticated && (
              <TabsContent value="my-events">
                {myEventsLoading ? (
                  [...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-64 mb-6 rounded-lg" />
                  ))
                ) : myEvents?.length > 0 ? (
                  myEvents.map((event: any) => (
                    <EventCard key={event.id} event={event} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Katıldığınız etkinlik bulunmuyor.
                  </div>
                )}
              </TabsContent>
            )}
            
            <TabsContent value="selected-date">
              {date ? (
                <>
                  <h3 className="text-lg font-medium mb-4">
                    {format(date, "d MMMM yyyy", { locale: tr })} Etkinlikleri
                  </h3>
                  
                  {dateEventsLoading ? (
                    <Skeleton className="h-64 mb-6 rounded-lg" />
                  ) : dateEvents?.length > 0 ? (
                    dateEvents.map((event: any) => (
                      <EventCard key={event.id} event={event} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Bu tarihte etkinlik bulunmuyor.
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Lütfen takvimden bir tarih seçin.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Events;
