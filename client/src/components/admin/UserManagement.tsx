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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  isBanned: boolean;
  role: string | null;
}

export function UserManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [userToBan, setUserToBan] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");

  // Kullanıcıları getir
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      if (!response.ok) {
        throw new Error("Kullanıcılar yüklenemedi");
      }
      return response.json();
    },
  });

  // Kullanıcı yasaklama mutation
  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/ban`, { reason });
      if (!response.ok) {
        throw new Error("Kullanıcı yasaklanamadı");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Kullanıcı başarıyla yasaklandı",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setUserToBan(null);
      setBanReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Kullanıcı yasağını kaldırma mutation
  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/unban`);
      if (!response.ok) {
        throw new Error("Kullanıcı yasağı kaldırılamadı");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Kullanıcı yasağı başarıyla kaldırıldı",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const users = usersData?.users || [];
  
  // Kullanıcı arama
  const filteredUsers = users.filter((user: User) => {
    const searchable = `${user.username || ''} ${user.email || ''} ${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    return searchable.includes(searchTerm.toLowerCase());
  });

  const handleBanConfirm = () => {
    if (userToBan && banReason) {
      banUserMutation.mutate({ userId: userToBan.id, reason: banReason });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Kullanıcı Yönetimi</h2>
        <Input
          placeholder="Kullanıcı ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Kullanıcı Adı</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Ad Soyad</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-sm">{user.id}</TableCell>
                  <TableCell>{user.username || '-'}</TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>
                    {(user.firstName || user.lastName) 
                      ? `${user.firstName || ''} ${user.lastName || ''}` 
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {user.isBanned ? (
                      <Badge variant="destructive">Yasaklı</Badge>
                    ) : user.isActive ? (
                      <Badge variant="default">Aktif</Badge>
                    ) : (
                      <Badge variant="outline">Pasif</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.isBanned ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => unbanUserMutation.mutate(user.id)}
                        disabled={unbanUserMutation.isPending}
                      >
                        Yasağı Kaldır
                      </Button>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setUserToBan(user)}
                          >
                            Yasakla
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Kullanıcıyı Yasakla</AlertDialogTitle>
                            <AlertDialogDescription>
                              <p className="mb-4">
                                <strong>{user.username}</strong> adlı kullanıcıyı yasaklamak istediğinize emin misiniz?
                                Bu işlem kullanıcının siteye erişimini engelleyecektir.
                              </p>
                              <div className="space-y-2">
                                <label htmlFor="banReason" className="block text-sm font-medium">
                                  Yasaklama Nedeni
                                </label>
                                <Input 
                                  id="banReason"
                                  value={banReason}
                                  onChange={(e) => setBanReason(e.target.value)}
                                  placeholder="Yasaklama nedenini yazın"
                                />
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => {
                              setUserToBan(null);
                              setBanReason("");
                            }}>
                              İptal
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleBanConfirm}
                              disabled={!banReason}
                              className="bg-red-500 hover:bg-red-700"
                            >
                              Yasakla
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  {searchTerm ? "Aramanızla eşleşen kullanıcı bulunamadı" : "Kullanıcı bulunamadı"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}