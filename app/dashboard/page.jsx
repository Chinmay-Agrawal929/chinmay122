"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Loader2, ArrowRight } from "lucide-react";
import DWASFWLoader from "@/components/GDGLoader";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  
  // 2FA state
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [passwordFor2FA, setPasswordFor2FA] = useState("");
  const [totpURI, setTotpURI] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [loading2FA, setLoading2FA] = useState(false);

  // Determine if 2FA is currently enabled. 
  // In better-auth, session.user usually contains a flag for twoFactorEnabled if configured, 
  // or we might need to fetch it explicitly. Assuming session.user.twoFactorEnabled for now.
  const is2FAEnabled = session?.user?.twoFactorEnabled || false;

  if (isPending) {
    return <div className="flex h-[50vh] items-center justify-center"><DWASFWLoader /></div>;
  }

  if (!session) {
    // Middleware should prevent this, but just in case:
    router.push("/auth/signin");
    return null;
  }

  const handleEnable2FA = async (e) => {
    e.preventDefault();
    setLoading2FA(true);
    try {
      // First, we need the user to re-authenticate or we just generate the TOTP secret
      const res = await authClient.twoFactor.enable({
        password: passwordFor2FA,
      });
      
      if (res?.error) {
        toast.error(res.error.message || "Failed to initiate 2FA setup. Check your password.");
      } else {
        // Better auth typically returns a URI for the QR code
        setTotpURI(res.data?.totpURI || "");
        setSetupCode(res.data?.secret || "XXX-XXX-XXX");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setLoading2FA(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setLoading2FA(true);
    try {
      // Verify the code the user just scanned/entered
      const res = await authClient.twoFactor.verifyTotp({
         code: verifyCode
      });
      
      if (res?.error) {
        toast.error("Invalid code. Please try again.");
      } else {
        toast.success("2FA successfully enabled!");
        setIs2FAModalOpen(false);
        // We'd ideally reload the session here or just refresh
        window.location.reload();
      }
    } catch(err) {
      toast.error("Verification failed.");
    } finally {
      setLoading2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    // You would typically prompt for password again
    const pwd = prompt("Enter your password to disable 2FA:");
    if (!pwd) return;
    
    try {
      const res = await authClient.twoFactor.disable({ password: pwd });
      if (res?.error) {
        toast.error(res.error.message || "Failed to disable 2FA.");
      } else {
        toast.success("2FA has been disabled.");
        window.location.reload();
      }
    } catch (err) {
      toast.error("An error occurred.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bricolage font-bold">Welcome back, {session.user.name}</h1>
        <p className="text-zinc-400 mt-2">Manage your recruitment profile and track your application status.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Application Status Card */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bricolage text-white">Current Application</CardTitle>
            <CardDescription className="text-zinc-400">Your latest submission status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                <Badge variant="outline" className="border-zinc-700 text-zinc-300">Draft</Badge>
              </div>
              <div>
                <p className="font-medium text-white text-lg">Software Engineering Intern</p>
                <p className="text-sm text-zinc-400 mt-1">Started on {new Date().toLocaleDateString()}</p>
              </div>
              <Button className="w-full bg-white text-black hover:bg-zinc-200" onClick={() => router.push("/join")}>
                Continue Application <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security & 2FA Card */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bricolage text-white">Security</CardTitle>
            <CardDescription className="text-zinc-400">Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-full", is2FAEnabled ? "bg-green-500/10 text-green-500" : "bg-zinc-800 text-zinc-400")}>
                  {is2FAEnabled ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium text-white">Two-Factor Authentication</p>
                  <p className="text-sm text-zinc-400">{is2FAEnabled ? "Currently enabled" : "Not enabled"}</p>
                </div>
              </div>
              
              {is2FAEnabled ? (
                <Button variant="outline" onClick={handleDisable2FA} className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                  Disable
                </Button>
              ) : (
                <Dialog open={is2FAModalOpen} onOpenChange={setIs2FAModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                      Enable
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-bricolage">Setup Two-Factor Authentication</DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        Protect your account with an extra layer of security using an authenticator app.
                      </DialogDescription>
                    </DialogHeader>
                    
                    {!totpURI ? (
                      <form onSubmit={handleEnable2FA} className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="password">Verify Password</Label>
                          <Input 
                            id="password" 
                            type="password" 
                            value={passwordFor2FA}
                            onChange={(e) => setPasswordFor2FA(e.target.value)}
                            required
                            className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700"
                          />
                        </div>
                        <Button type="submit" disabled={loading2FA} className="w-full bg-white text-black hover:bg-zinc-200">
                          {loading2FA ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Continue"}
                        </Button>
                      </form>
                    ) : (
                      <div className="space-y-6 py-4">
                        <div className="bg-white p-4 rounded-xl mx-auto w-48 h-48 flex items-center justify-center">
                          {/* In a real app, generate a QR Code from totpURI using a library like qrcode.react */}
                          <div className="text-center text-black text-sm">
                            <p className="font-bold mb-2">Manual Entry Code:</p>
                            <code className="bg-zinc-100 p-2 rounded">{setupCode}</code>
                            <p className="mt-2 text-xs text-zinc-500">(QR Code Generation placeholder)</p>
                          </div>
                        </div>
                        
                        <form onSubmit={handleVerify2FA} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="code">Enter 6-digit code from app</Label>
                            <Input 
                              id="code" 
                              type="text" 
                              maxLength={6}
                              value={verifyCode}
                              onChange={(e) => setVerifyCode(e.target.value)}
                              required
                              className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700 text-center tracking-widest text-lg"
                            />
                          </div>
                          <Button type="submit" disabled={loading2FA} className="w-full bg-white text-black hover:bg-zinc-200">
                            {loading2FA ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Verify & Enable"}
                          </Button>
                        </form>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
