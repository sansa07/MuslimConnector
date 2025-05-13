import { useState } from "react";
import { useNavigate } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { IconMosque } from "@/lib/icons";

const loginSchema = z.object({
  username: z.string().min(1, "Kullanıcı adı gereklidir"),
  password: z.string().min(1, "Şifre gereklidir"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useNavigate();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await apiRequest("POST", "/api/admin/login", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Giriş başarısız");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Giriş başarılı",
        description: "Yönetici paneline yönlendiriliyorsunuz",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/status"] });
      navigate("/admin/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Giriş başarısız",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-navy islamic-green:bg-emerald-100 islamic-gold:bg-amber-100 islamic-navy:bg-[#152238]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <IconMosque className="h-12 w-12 text-primary dark:text-primary-light islamic-gold:text-amber-600 islamic-navy:text-blue-300" />
          </div>
          <CardTitle className="text-2xl font-bold">Yönetici Girişi</CardTitle>
          <CardDescription>
            Yönetici paneline erişmek için giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kullanıcı Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="px-4 py-2 text-center text-sm text-muted-foreground">
            Yönetici girişi sadece yetkili kişiler içindir.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLogin;