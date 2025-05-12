import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertCircle, Loader2, Mail } from "lucide-react";

// Extract token from URL query
function useToken() {
  const [_, query] = window.location.href.split("?");
  if (!query) return null;
  
  const params = new URLSearchParams(query);
  return params.get("token");
}

export default function VerifyEmail() {
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "expired" | "invalid" | "error"
  >("loading");
  const [message, setMessage] = useState<string>("");
  const token = useToken();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // If user is already logged in and verified, redirect to home
  useEffect(() => {
    if (user && user.isVerified) {
      navigate("/");
    }
  }, [user, navigate]);

  // Verify token
  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!token) {
        setVerificationStatus("invalid");
        setMessage("Geçersiz doğrulama bağlantısı. Lütfen doğrulama e-postanızdaki bağlantıyı kontrol edin.");
        return;
      }

      try {
        const response = await apiRequest("POST", "/api/verify-email", { token });
        
        if (response.ok) {
          setVerificationStatus("success");
          setMessage("E-posta adresiniz başarıyla doğrulandı!");
        } else {
          const data = await response.json();
          
          if (data.reason === "expired") {
            setVerificationStatus("expired");
            setMessage("Bu doğrulama bağlantısının süresi dolmuş. Lütfen yeni bir doğrulama e-postası isteyin.");
          } else if (data.reason === "already_verified") {
            setVerificationStatus("success");
            setMessage("E-posta adresiniz zaten doğrulanmış!");
          } else {
            setVerificationStatus("invalid");
            setMessage("Geçersiz doğrulama bağlantısı. Lütfen doğrulama e-postanızdaki bağlantıyı kontrol edin.");
          }
        }
      } catch (error) {
        console.error("Error verifying email:", error);
        setVerificationStatus("error");
        setMessage("E-posta doğrulanırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
      }
    };

    verifyEmailToken();
  }, [token]);

  // Request new verification email
  const requestNewVerification = async () => {
    try {
      const response = await apiRequest("POST", "/api/resend-verification-email");
      
      if (response.ok) {
        setMessage("Yeni bir doğrulama e-postası gönderildi. Lütfen e-posta kutunuzu kontrol edin.");
      } else {
        setMessage("Yeni doğrulama e-postası gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
      }
    } catch (error) {
      console.error("Error requesting new verification email:", error);
      setMessage("Yeni doğrulama e-postası gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center">
            {verificationStatus === "loading" ? (
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            ) : verificationStatus === "success" ? (
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            ) : verificationStatus === "expired" ? (
              <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-2xl">E-posta Doğrulama</CardTitle>
          <CardDescription>
            {verificationStatus === "loading" 
              ? "E-posta adresiniz doğrulanıyor..."
              : verificationStatus === "success"
                ? "E-posta adresiniz başarıyla doğrulandı"
                : verificationStatus === "expired"
                  ? "Doğrulama bağlantısının süresi doldu"
                  : verificationStatus === "invalid"
                    ? "Geçersiz doğrulama bağlantısı"
                    : "Bir hata oluştu"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {verificationStatus !== "loading" && (
            <Alert className={`
              ${verificationStatus === "success" ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-900" : ""}
              ${verificationStatus === "expired" ? "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-900" : ""}
              ${(verificationStatus === "invalid" || verificationStatus === "error") ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-900" : ""}
            `}>
              {verificationStatus === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : verificationStatus === "expired" ? (
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <AlertTitle className={`
                ${verificationStatus === "success" ? "text-green-800 dark:text-green-400" : ""}
                ${verificationStatus === "expired" ? "text-yellow-800 dark:text-yellow-400" : ""}
                ${(verificationStatus === "invalid" || verificationStatus === "error") ? "text-red-800 dark:text-red-400" : ""}
              `}>
                {verificationStatus === "success" ? "Başarılı" : "Dikkat"}
              </AlertTitle>
              <AlertDescription className={`
                ${verificationStatus === "success" ? "text-green-800 dark:text-green-400" : ""}
                ${verificationStatus === "expired" ? "text-yellow-800 dark:text-yellow-400" : ""}
                ${(verificationStatus === "invalid" || verificationStatus === "error") ? "text-red-800 dark:text-red-400" : ""}
              `}>
                {message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3">
          {verificationStatus === "success" ? (
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" asChild>
              <Link href="/">Ana Sayfaya Dön</Link>
            </Button>
          ) : verificationStatus === "expired" ? (
            <Button 
              className="w-full bg-yellow-600 hover:bg-yellow-700" 
              onClick={requestNewVerification}
            >
              <Mail className="mr-2 h-4 w-4" />
              Yeni Doğrulama E-postası Gönder
            </Button>
          ) : verificationStatus !== "loading" ? (
            <>
              <Button className="w-full" onClick={requestNewVerification}>
                <Mail className="mr-2 h-4 w-4" />
                Yeni Doğrulama E-postası Gönder
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth">Giriş Sayfasına Dön</Link>
              </Button>
            </>
          ) : null}
          
          {verificationStatus !== "loading" && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Yardıma mı ihtiyacınız var?{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Bize ulaşın
              </Link>
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}