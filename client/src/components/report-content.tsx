import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Flag, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface ReportContentProps {
  contentId: number;
  contentType: "post" | "comment";
  trigger?: React.ReactNode;
}

export default function ReportContent({ 
  contentId, 
  contentType,
  trigger
}: ReportContentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReport = async () => {
    if (!reason) {
      toast({
        title: "Hata",
        description: "Lütfen bir bildirim sebebi seçin",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const endpoint = contentType === 'post' 
      ? `/api/posts/${contentId}/report` 
      : `/api/comments/${contentId}/report`;

    try {
      const response = await apiRequest("POST", endpoint, {
        reason,
        details,
      });
      
      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "İçerik bildiriminiz alındı. Moderatör ekibimiz inceleyecektir.",
        });
        setIsOpen(false);
        setReason("");
        setDetails("");
      } else {
        const error = await response.json();
        toast({
          title: "Hata",
          description: error.message || "İçerik bildirimi gönderilirken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error reporting content:", error);
      toast({
        title: "Hata",
        description: "İçerik bildirimi gönderilirken bir sorun oluştu",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Flag className="h-4 w-4 mr-1" />
            <span>Bildir</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span>İçeriği Bildir</span>
          </DialogTitle>
          <DialogDescription>
            Bu içeriğin topluluk kurallarımızı ihlal ettiğini düşünüyorsanız, lütfen bildirin.
            Bildirilen içerikler moderatörler tarafından incelenecektir.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Bildirim sebebi</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Bir sebep seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inappropriate">Uygunsuz içerik</SelectItem>
                <SelectItem value="offensive">Rahatsız edici veya saygısız içerik</SelectItem>
                <SelectItem value="harmful">Zararlı veya tehlikeli içerik</SelectItem>
                <SelectItem value="fake">Yanlış veya yanıltıcı bilgi</SelectItem>
                <SelectItem value="spam">Spam veya reklam</SelectItem>
                <SelectItem value="other">Diğer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Ek detaylar (isteğe bağlı)</label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Bildiriminizle ilgili ek detaylar ekleyin..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            İptal
          </Button>
          <Button 
            onClick={handleReport}
            disabled={isSubmitting || !reason}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? "Gönderiliyor..." : "Bildir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}