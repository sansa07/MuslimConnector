import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FlaggedPost {
  id: number;
  userId: string;
  content: string;
  type: string;
  imageUrl: string | null;
  flaggedForContent: boolean;
  flagReason: string | null;
  isModerated: boolean;
  isApproved: boolean;
  createdAt: string;
}

interface FlaggedComment {
  id: number;
  userId: string;
  postId: number;
  content: string;
  flaggedForContent: boolean;
  flagReason: string | null;
  isModerated: boolean;
  isApproved: boolean;
  createdAt: string;
}

export function ContentModeration() {
  const { toast } = useToast();
  const [selectedPost, setSelectedPost] = useState<FlaggedPost | null>(null);
  const [selectedComment, setSelectedComment] = useState<FlaggedComment | null>(null);
  const [moderationComment, setModerationComment] = useState("");
  const [moderationType, setModerationType] = useState<"posts" | "comments">("posts");

  // İşaretli gönderileri getir
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/admin/moderation/posts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/moderation/posts");
      if (!response.ok) {
        throw new Error("İşaretli gönderiler yüklenemedi");
      }
      return response.json();
    },
  });

  // İşaretli yorumları getir
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ["/api/admin/moderation/comments"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/moderation/comments");
      if (!response.ok) {
        throw new Error("İşaretli yorumlar yüklenemedi");
      }
      return response.json();
    },
  });

  // Gönderi moderasyon mutation
  const moderatePostMutation = useMutation({
    mutationFn: async ({ 
      id, 
      isApproved, 
      moderationComment 
    }: { 
      id: number; 
      isApproved: boolean; 
      moderationComment: string 
    }) => {
      const response = await apiRequest("POST", `/api/admin/moderation/posts/${id}`, {
        isApproved,
        moderationComment
      });
      if (!response.ok) {
        throw new Error("Gönderi güncellenemedi");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Gönderi başarıyla güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/moderation/posts"] });
      setSelectedPost(null);
      setModerationComment("");
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Yorum moderasyon mutation
  const moderateCommentMutation = useMutation({
    mutationFn: async ({ 
      id, 
      isApproved, 
      moderationComment 
    }: { 
      id: number; 
      isApproved: boolean; 
      moderationComment: string 
    }) => {
      const response = await apiRequest("POST", `/api/admin/moderation/comments/${id}`, {
        isApproved,
        moderationComment
      });
      if (!response.ok) {
        throw new Error("Yorum güncellenemedi");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Yorum başarıyla güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/moderation/comments"] });
      setSelectedComment(null);
      setModerationComment("");
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const flaggedPosts = postsData?.posts || [];
  const flaggedComments = commentsData?.comments || [];

  const handleApprovePost = (id: number) => {
    moderatePostMutation.mutate({ 
      id, 
      isApproved: true, 
      moderationComment: moderationComment || "İçerik onaylandı" 
    });
  };

  const handleRejectPost = (id: number) => {
    moderatePostMutation.mutate({ 
      id, 
      isApproved: false, 
      moderationComment: moderationComment || "İçerik uygunsuz bulundu" 
    });
  };

  const handleApproveComment = (id: number) => {
    moderateCommentMutation.mutate({ 
      id, 
      isApproved: true, 
      moderationComment: moderationComment || "Yorum onaylandı" 
    });
  };

  const handleRejectComment = (id: number) => {
    moderateCommentMutation.mutate({ 
      id, 
      isApproved: false, 
      moderationComment: moderationComment || "Yorum uygunsuz bulundu" 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (postsLoading || commentsLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">İçerik Moderasyonu</h2>

      <Tabs value={moderationType} onValueChange={(v) => setModerationType(v as "posts" | "comments")}>
        <TabsList className="mb-6">
          <TabsTrigger value="posts">İşaretli Gönderiler ({flaggedPosts.length})</TabsTrigger>
          <TabsTrigger value="comments">İşaretli Yorumlar ({flaggedComments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {flaggedPosts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">İşaretli gönderi bulunmuyor</p>
              </CardContent>
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Kullanıcı ID</TableHead>
                  <TableHead>İçerik</TableHead>
                  <TableHead>Şikayet Nedeni</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flaggedPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-mono text-sm">{post.id}</TableCell>
                    <TableCell className="font-mono text-sm">{post.userId}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {post.content.length > 100 
                        ? post.content.substring(0, 100) + "..." 
                        : post.content}
                    </TableCell>
                    <TableCell>{post.flagReason || "-"}</TableCell>
                    <TableCell>{formatDate(post.createdAt)}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedPost(post)}
                          >
                            İncele
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-3xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Gönderi İnceleme</AlertDialogTitle>
                            <AlertDialogDescription>
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium mb-1">Kullanıcı ID:</p>
                                    <p className="text-sm">{post.userId}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium mb-1">Tarih:</p>
                                    <p className="text-sm">{formatDate(post.createdAt)}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-sm font-medium mb-1">İçerik:</p>
                                  <Card className="p-4 bg-gray-50 dark:bg-gray-900">
                                    <p className="whitespace-pre-wrap">{post.content}</p>
                                    {post.imageUrl && (
                                      <div className="mt-4">
                                        <img 
                                          src={post.imageUrl} 
                                          alt="Gönderi görseli" 
                                          className="max-h-64 rounded"
                                        />
                                      </div>
                                    )}
                                  </Card>
                                </div>
                                
                                <div>
                                  <p className="text-sm font-medium mb-1">Şikayet nedeni:</p>
                                  <p className="text-sm p-2 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 text-red-800 dark:text-red-200 rounded">
                                    {post.flagReason || "Belirtilmemiş"}
                                  </p>
                                </div>
                                
                                <div>
                                  <p className="text-sm font-medium mb-1">Moderasyon Notu:</p>
                                  <Textarea 
                                    value={moderationComment}
                                    onChange={(e) => setModerationComment(e.target.value)}
                                    placeholder="Moderasyon notu ekleyin (opsiyonel)"
                                    className="resize-none"
                                  />
                                </div>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex items-center justify-between">
                            <div>
                              <AlertDialogCancel onClick={() => {
                                setSelectedPost(null);
                                setModerationComment("");
                              }}>
                                İptal
                              </AlertDialogCancel>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="destructive"
                                onClick={() => handleRejectPost(post.id)}
                                disabled={moderatePostMutation.isPending}
                              >
                                Reddet ve Kaldır
                              </Button>
                              <Button 
                                variant="default"
                                onClick={() => handleApprovePost(post.id)}
                                disabled={moderatePostMutation.isPending}
                              >
                                Onayla
                              </Button>
                            </div>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="comments">
          {flaggedComments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">İşaretli yorum bulunmuyor</p>
              </CardContent>
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Kullanıcı ID</TableHead>
                  <TableHead>Gönderi ID</TableHead>
                  <TableHead>İçerik</TableHead>
                  <TableHead>Şikayet Nedeni</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flaggedComments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell className="font-mono text-sm">{comment.id}</TableCell>
                    <TableCell className="font-mono text-sm">{comment.userId}</TableCell>
                    <TableCell className="font-mono text-sm">{comment.postId}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {comment.content.length > 60 
                        ? comment.content.substring(0, 60) + "..." 
                        : comment.content}
                    </TableCell>
                    <TableCell>{comment.flagReason || "-"}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedComment(comment)}
                          >
                            İncele
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Yorum İnceleme</AlertDialogTitle>
                            <AlertDialogDescription>
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium mb-1">Kullanıcı ID:</p>
                                    <p className="text-sm">{comment.userId}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium mb-1">Gönderi ID:</p>
                                    <p className="text-sm">{comment.postId}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-sm font-medium mb-1">Yorum:</p>
                                  <Card className="p-4 bg-gray-50 dark:bg-gray-900">
                                    <p className="whitespace-pre-wrap">{comment.content}</p>
                                  </Card>
                                </div>
                                
                                <div>
                                  <p className="text-sm font-medium mb-1">Şikayet nedeni:</p>
                                  <p className="text-sm p-2 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 text-red-800 dark:text-red-200 rounded">
                                    {comment.flagReason || "Belirtilmemiş"}
                                  </p>
                                </div>
                                
                                <div>
                                  <p className="text-sm font-medium mb-1">Moderasyon Notu:</p>
                                  <Textarea 
                                    value={moderationComment}
                                    onChange={(e) => setModerationComment(e.target.value)}
                                    placeholder="Moderasyon notu ekleyin (opsiyonel)"
                                    className="resize-none"
                                  />
                                </div>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex items-center justify-between">
                            <div>
                              <AlertDialogCancel onClick={() => {
                                setSelectedComment(null);
                                setModerationComment("");
                              }}>
                                İptal
                              </AlertDialogCancel>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="destructive"
                                onClick={() => handleRejectComment(comment.id)}
                                disabled={moderateCommentMutation.isPending}
                              >
                                Reddet ve Kaldır
                              </Button>
                              <Button 
                                variant="default"
                                onClick={() => handleApproveComment(comment.id)}
                                disabled={moderateCommentMutation.isPending}
                              >
                                Onayla
                              </Button>
                            </div>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}