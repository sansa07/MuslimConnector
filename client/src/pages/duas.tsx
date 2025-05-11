import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HandHelping, Plus, Heart, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import DuaRequestCard from "@/components/dua-request-card";
import type { DuaRequest } from "@shared/schema";

export default function Duas() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [content, setContent] = useState("");

  // Fetch dua requests
  const { 
    data: duaRequests, 
    isLoading: isLoadingDuaRequests,
    isError: isErrorDuaRequests,
    refetch: refetchDuaRequests
  } = useQuery({
    queryKey: ['/api/dua-requests'],
  });

  // Create dua request mutation
  const { mutate: createDuaRequest, isPending } = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/dua-requests", { content });
    },
    onSuccess: () => {
      toast({
        title: "Dua isteği gönderildi",
        description: "Dua isteğiniz başarıyla oluşturuldu."
      });
      setIsCreateDialogOpen(false);
      setContent("");
      queryClient.invalidateQueries({ queryKey: ['/api/dua-requests'] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Dua isteği oluşturulurken bir hata oluştu.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen dua isteğinizi yazın.",
        variant: "destructive"
      });
      return;
    }
    createDuaRequest();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-amiri text-primary dark:text-primary-light">Dua İstekleri</h1>
        {isAuthenticated && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Dua İsteği Oluştur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-amiri text-xl">Dua İsteği Oluştur</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Dua İsteğiniz</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Dua isteğinizi buraya yazabilirsiniz..."
                    rows={4}
                    required
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
                    {isPending ? "Gönderiliyor..." : "Gönder"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Dua Quotes */}
      <Card className="islamic-border overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center">
            <HandHelping className="h-8 w-8 mx-auto mb-4 text-primary" />
            <p className="font-amiri text-xl italic mb-2">
              "Dua, ibadetin özüdür."
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              - Hadis-i Şerif
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dua Requests */}
      <Card className="islamic-border overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-bold font-amiri flex items-center">
            <Heart className="mr-2 h-5 w-5 text-primary" />
            Dua İstekleri
          </h2>
          {isErrorDuaRequests && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchDuaRequests()}
              className="flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Yenile
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingDuaRequests ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="mb-6">
                <Skeleton className="h-[150px] w-full rounded-lg" />
              </div>
            ))
          ) : isErrorDuaRequests ? (
            <div className="text-center py-8 bg-red-50 dark:bg-red-900/20 rounded-lg mb-6">
              <p className="text-red-600 dark:text-red-400 mb-2">Dua istekleri yüklenirken bir hata oluştu.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchDuaRequests()}
                className="flex items-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tekrar Dene
              </Button>
            </div>
          ) : duaRequests && duaRequests.length > 0 ? (
            <div className="space-y-6">
              {duaRequests.map((duaRequest: DuaRequest) => (
                <DuaRequestCard key={duaRequest.id} duaRequest={duaRequest} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/20 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 mb-2">Henüz dua isteği bulunamadı.</p>
              {isAuthenticated && (
                <p className="text-primary">İlk dua isteğini oluşturmak için "Dua İsteği Oluştur" butonunu kullanabilirsiniz.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collective Duas */}
      <Card className="islamic-border overflow-hidden">
        <CardHeader>
          <h2 className="text-xl font-bold font-amiri flex items-center">
            <HandHelping className="mr-2 h-5 w-5 text-primary" />
            Toplu Dualar
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="mb-2">
                  <h3 className="font-medium">Sabah Duası</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  "Allahım! Senin rahmetinle sabahladım, senin rahmetinle akşamladım, senin rahmetinle yaşar ve ölürüm. Dönüş sanadır."
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">Her gün 08:00</span>
                  <Button variant="outline" size="sm">Hatırlat</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="mb-2">
                  <h3 className="font-medium">Akşam Duası</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  "Allahım! Senden hayırlı bir gün, hayırlı bir gece, hayırlı bir akşam, hayırlı bir sabah, hayırlı bir gelecek ve hayırlı bir sonuç niyaz ediyorum."
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">Her gün 20:00</span>
                  <Button variant="outline" size="sm">Hatırlat</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
