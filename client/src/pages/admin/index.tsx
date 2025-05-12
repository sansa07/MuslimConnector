import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation-with-defaults";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  AlertCircle,
  User,
  MessageSquare,
  Flag,
  FileText,
  AlertTriangle,
  Users,
  Shield,
  CheckCircle,
  XCircle,
  Info,
  PlusCircle,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface UserItem {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  isBanned: boolean;
  warningCount: number;
  createdAt: string;
}

interface FlaggedContent {
  id: number;
  userId: string;
  content: string;
  flagReason?: string;
  flaggedForContent: boolean;
  createdAt: string;
}

export default function AdminPanel() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [flaggedPosts, setFlaggedPosts] = useState<FlaggedContent[]>([]);
  const [flaggedComments, setFlaggedComments] = useState<FlaggedContent[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [banReason, setBanReason] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Admin veya moderatör olmayan kullanıcıları ana sayfaya yönlendir
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role !== "admin" && user.role !== "moderator") {
        navigate("/");
      }
    } else if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  // Kullanıcıları getir
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setErrorMessage(null);
    try {
      const response = await apiRequest("GET", "/api/admin/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage("Kullanıcıları getirirken bir hata oluştu");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Bayraklanmış gönderileri getir
  const fetchFlaggedPosts = async () => {
    setIsLoadingPosts(true);
    setErrorMessage(null);
    try {
      const response = await apiRequest("GET", "/api/moderation/flagged-posts");
      const data = await response.json();
      setFlaggedPosts(data);
    } catch (error) {
      console.error("Error fetching flagged posts:", error);
      setErrorMessage("Bayraklanmış gönderileri getirirken bir hata oluştu");
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Bayraklanmış yorumları getir
  const fetchFlaggedComments = async () => {
    setIsLoadingComments(true);
    setErrorMessage(null);
    try {
      const response = await apiRequest("GET", "/api/moderation/flagged-comments");
      const data = await response.json();
      setFlaggedComments(data);
    } catch (error) {
      console.error("Error fetching flagged comments:", error);
      setErrorMessage("Bayraklanmış yorumları getirirken bir hata oluştu");
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Kullanıcıyı yasakla
  const banUser = async (userId: string) => {
    if (!banReason.trim()) {
      setErrorMessage("Yasaklama sebebi belirtilmelidir");
      return;
    }

    setActionLoading(`ban-${userId}`);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await apiRequest("POST", `/api/users/${userId}/ban`, {
        reason: banReason
      });
      if (response.ok) {
        fetchUsers();
        setSuccessMessage("Kullanıcı yasaklandı");
        setBanReason("");
      } else {
        const error = await response.json();
        setErrorMessage(error.message || "Kullanıcıyı yasaklarken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error banning user:", error);
      setErrorMessage("Kullanıcıyı yasaklarken bir hata oluştu");
    } finally {
      setActionLoading(null);
    }
  };

  // Kullanıcı yasağını kaldır
  const unbanUser = async (userId: string) => {
    setActionLoading(`unban-${userId}`);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await apiRequest("POST", `/api/users/${userId}/unban`);
      if (response.ok) {
        fetchUsers();
        setSuccessMessage("Kullanıcı yasağı kaldırıldı");
      } else {
        const error = await response.json();
        setErrorMessage(error.message || "Kullanıcı yasağını kaldırırken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error unbanning user:", error);
      setErrorMessage("Kullanıcı yasağını kaldırırken bir hata oluştu");
    } finally {
      setActionLoading(null);
    }
  };

  // Kullanıcıya uyarı ver
  const warnUser = async (userId: string) => {
    if (!banReason.trim()) {
      setErrorMessage("Uyarı sebebi belirtilmelidir");
      return;
    }

    setActionLoading(`warn-${userId}`);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await apiRequest("POST", `/api/users/${userId}/warn`, {
        reason: banReason
      });
      if (response.ok) {
        fetchUsers();
        setSuccessMessage("Kullanıcıya uyarı verildi");
        setBanReason("");
      } else {
        const error = await response.json();
        setErrorMessage(error.message || "Kullanıcıya uyarı verirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error warning user:", error);
      setErrorMessage("Kullanıcıya uyarı verirken bir hata oluştu");
    } finally {
      setActionLoading(null);
    }
  };

  // Rol değiştir
  const changeRole = async (userId: string, newRole: string) => {
    setActionLoading(`role-${userId}`);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await apiRequest("PUT", `/api/users/${userId}/role`, {
        role: newRole
      });
      if (response.ok) {
        fetchUsers();
        setSuccessMessage(`Kullanıcı rolü '${newRole}' olarak değiştirildi`);
      } else {
        const error = await response.json();
        setErrorMessage(error.message || "Kullanıcı rolünü değiştirirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error changing user role:", error);
      setErrorMessage("Kullanıcı rolünü değiştirirken bir hata oluştu");
    } finally {
      setActionLoading(null);
    }
  };

  // İçeriği onayla
  const approveContent = async (type: 'post' | 'comment', id: number) => {
    setActionLoading(`approve-${type}-${id}`);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    const endpoint = type === 'post' 
      ? `/api/posts/${id}/flag` 
      : `/api/comments/${id}/flag`;
    
    try {
      const response = await apiRequest("PUT", endpoint, {
        isApproved: true,
        isModerated: true,
        flaggedForContent: false,
        flagReason: null
      });
      
      if (response.ok) {
        if (type === 'post') {
          fetchFlaggedPosts();
        } else {
          fetchFlaggedComments();
        }
        setSuccessMessage(`İçerik onaylandı`);
      } else {
        const error = await response.json();
        setErrorMessage(error.message || "İçeriği onaylarken bir hata oluştu");
      }
    } catch (error) {
      console.error(`Error approving ${type}:`, error);
      setErrorMessage(`İçeriği onaylarken bir hata oluştu`);
    } finally {
      setActionLoading(null);
    }
  };

  // İçeriği sil
  const deleteContent = async (type: 'post' | 'comment', id: number) => {
    setActionLoading(`delete-${type}-${id}`);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    const endpoint = type === 'post' 
      ? `/api/posts/${id}` 
      : `/api/comments/${id}`;
    
    try {
      const response = await apiRequest("DELETE", endpoint);
      
      if (response.ok) {
        if (type === 'post') {
          fetchFlaggedPosts();
        } else {
          fetchFlaggedComments();
        }
        setSuccessMessage(`İçerik silindi`);
      } else {
        const error = await response.json();
        setErrorMessage(error.message || "İçeriği silerken bir hata oluştu");
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      setErrorMessage(`İçeriği silerken bir hata oluştu`);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "moderator")) {
      if (activeTab === "users") {
        fetchUsers();
      } else if (activeTab === "flagged-posts") {
        fetchFlaggedPosts();
      } else if (activeTab === "flagged-comments") {
        fetchFlaggedComments();
      }
    }
  }, [user, activeTab]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Admin veya moderatör olmayan kullanıcıları gösterme
  if (user && user.role !== "admin" && user.role !== "moderator") {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Yetkisiz Erişim</AlertTitle>
          <AlertDescription>
            Bu sayfayı görüntülemek için yönetici veya moderatör olmanız gerekmektedir.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 mb-20">
      <h1 className="text-3xl font-bold mb-6">Yönetim Paneli</h1>
      
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {successMessage && (
        <Alert variant="default" className="mb-4 bg-green-100 border-green-500">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Başarılı</AlertTitle>
          <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Kullanıcılar</span>
          </TabsTrigger>
          <TabsTrigger value="flagged-posts" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            <span>Bayraklı Gönderiler</span>
          </TabsTrigger>
          <TabsTrigger value="flagged-comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Bayraklı Yorumlar</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Kullanıcılar sekmesi */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Kullanıcı Yönetimi</span>
              </CardTitle>
              <CardDescription>
                Kullanıcıları yönet, yasakla veya rollerini değiştir
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex justify-center my-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>Toplam {users.length} kullanıcı listeleniyor</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kullanıcı</TableHead>
                        <TableHead>E-posta</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Uyarılar</TableHead>
                        <TableHead className="w-[200px]">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{user.username || user.firstName || user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === "admin" ? "destructive" : user.role === "moderator" ? "default" : "outline"}>
                              {user.role === "admin" ? "Yönetici" : user.role === "moderator" ? "Moderatör" : "Kullanıcı"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.isBanned ? (
                              <Badge variant="destructive">Yasaklı</Badge>
                            ) : !user.isActive ? (
                              <Badge variant="outline">Pasif</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">Aktif</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.warningCount > 0 ? (
                              <Badge variant={user.warningCount >= 3 ? "destructive" : "outline"} className={user.warningCount >= 3 ? "" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"}>
                                {user.warningCount}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-2">
                              {/* Rol değiştirme düğmeleri - sadece adminler için göster */}
                              {user.role !== "admin" && (
                                <div className="flex gap-1">
                                  {user.role !== "moderator" && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="text-xs"
                                      onClick={() => changeRole(user.id, "moderator")}
                                      disabled={actionLoading === `role-${user.id}`}
                                    >
                                      {actionLoading === `role-${user.id}` ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <>
                                          <Shield className="h-3 w-3 mr-1" />
                                          Moderatör Yap
                                        </>
                                      )}
                                    </Button>
                                  )}
                                  {user.role === "moderator" && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="text-xs"
                                      onClick={() => changeRole(user.id, "user")}
                                      disabled={actionLoading === `role-${user.id}`}
                                    >
                                      {actionLoading === `role-${user.id}` ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <>
                                          <User className="h-3 w-3 mr-1" />
                                          Kullanıcı Yap
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                              )}
                              
                              {/* Ban/Unban düğmeleri */}
                              {user.isBanned ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-xs bg-green-100 text-green-800 hover:bg-green-200"
                                  onClick={() => unbanUser(user.id)}
                                  disabled={actionLoading === `unban-${user.id}`}
                                >
                                  {actionLoading === `unban-${user.id}` ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Yasağı Kaldır
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                    onClick={() => warnUser(user.id)}
                                    disabled={actionLoading === `warn-${user.id}`}
                                  >
                                    {actionLoading === `warn-${user.id}` ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <>
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Uyarı Ver
                                      </>
                                    )}
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-xs bg-red-100 text-red-800 hover:bg-red-200"
                                    onClick={() => banUser(user.id)}
                                    disabled={actionLoading === `ban-${user.id}`}
                                  >
                                    {actionLoading === `ban-${user.id}` ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <>
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Yasakla
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {/* Ban/Uyarı sebebi giriş alanı */}
              <div className="mt-6">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Yasaklama veya uyarı sebebi"
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Bayraklı gönderiler sekmesi */}
        <TabsContent value="flagged-posts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                <span>Bayraklanmış Gönderiler</span>
              </CardTitle>
              <CardDescription>
                Bayraklanmış gönderileri incele, onayla veya kaldır
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPosts ? (
                <div className="flex justify-center my-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : flaggedPosts.length === 0 ? (
                <Alert className="mb-4 bg-blue-50 border-blue-500">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="text-blue-700">Bilgi</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Şu anda bayraklanmış gönderi bulunmamaktadır.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  {flaggedPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden border-l-4 border-l-red-500">
                      <CardHeader className="py-3 bg-red-50">
                        <div className="flex justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span>Gönderi #{post.id}</span>
                          </CardTitle>
                          <Badge variant="outline" className="bg-red-100 text-red-800">
                            Bayraklandı
                          </Badge>
                        </div>
                        <CardDescription className="text-red-700">
                          Bayraklama Sebebi: {post.flagReason || "Belirtilmemiş"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-sm mb-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">Kullanıcı ID: {post.userId}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            <span className="font-medium">Oluşturulma Tarihi:</span> {new Date(post.createdAt).toLocaleString("tr-TR")}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md border mb-4">
                          <h4 className="font-medium text-sm mb-1">İçerik:</h4>
                          <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 py-3 bg-gray-50">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs bg-green-100 text-green-800 hover:bg-green-200"
                          onClick={() => approveContent('post', post.id)}
                          disabled={actionLoading === `approve-post-${post.id}`}
                        >
                          {actionLoading === `approve-post-${post.id}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Onayla
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs bg-red-100 text-red-800 hover:bg-red-200"
                          onClick={() => deleteContent('post', post.id)}
                          disabled={actionLoading === `delete-post-${post.id}`}
                        >
                          {actionLoading === `delete-post-${post.id}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Kaldır
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Bayraklı yorumlar sekmesi */}
        <TabsContent value="flagged-comments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <span>Bayraklanmış Yorumlar</span>
              </CardTitle>
              <CardDescription>
                Bayraklanmış yorumları incele, onayla veya kaldır
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingComments ? (
                <div className="flex justify-center my-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : flaggedComments.length === 0 ? (
                <Alert className="mb-4 bg-blue-50 border-blue-500">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="text-blue-700">Bilgi</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Şu anda bayraklanmış yorum bulunmamaktadır.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  {flaggedComments.map((comment) => (
                    <Card key={comment.id} className="overflow-hidden border-l-4 border-l-red-500">
                      <CardHeader className="py-3 bg-red-50">
                        <div className="flex justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span>Yorum #{comment.id}</span>
                          </CardTitle>
                          <Badge variant="outline" className="bg-red-100 text-red-800">
                            Bayraklandı
                          </Badge>
                        </div>
                        <CardDescription className="text-red-700">
                          Bayraklama Sebebi: {comment.flagReason || "Belirtilmemiş"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-sm mb-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">Kullanıcı ID: {comment.userId}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            <span className="font-medium">Oluşturulma Tarihi:</span> {new Date(comment.createdAt).toLocaleString("tr-TR")}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md border mb-4">
                          <h4 className="font-medium text-sm mb-1">İçerik:</h4>
                          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 py-3 bg-gray-50">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs bg-green-100 text-green-800 hover:bg-green-200"
                          onClick={() => approveContent('comment', comment.id)}
                          disabled={actionLoading === `approve-comment-${comment.id}`}
                        >
                          {actionLoading === `approve-comment-${comment.id}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Onayla
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs bg-red-100 text-red-800 hover:bg-red-200"
                          onClick={() => deleteContent('comment', comment.id)}
                          disabled={actionLoading === `delete-comment-${comment.id}`}
                        >
                          {actionLoading === `delete-comment-${comment.id}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Kaldır
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}