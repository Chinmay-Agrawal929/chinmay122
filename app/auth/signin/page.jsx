"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bricolage_Grotesque, Space_Grotesk } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import DWASFWLoader from "@/components/GDGLoader";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { Loader2, ArrowLeft, ShieldCheck, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage-grotesque",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
});

export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  
  const [step, setStep] = useState("auth"); // "auth" | "2fa" | "verify-email"
  const [mode, setMode] = useState("signin"); 
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [githubSubmitting, setGithubSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user && !isPending && step !== "2fa") {
      router.push("/dashboard");
    }
  }, [session, isPending, router, step]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <DWASFWLoader />
      </div>
    );
  }

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill all required fields.");
    if (mode === "signup" && !name) return toast.error("Please enter your name.");

    setSubmitting(true);
    try {
      if (mode === "signup") {
        const res = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/dashboard",
        });
        if (res?.error) {
          toast.error(res.error.message || "Failed to create account.");
        } else {
          setStep("verify-email");
        }
      } else {
        const res = await authClient.signIn.email({
          email,
          password,
        });
        
        // Handle Better Auth responses for advanced features
        if (res?.error) {
           if (res.error.message?.toLowerCase().includes("two factor") || res.error.status === 403) {
             setStep("2fa");
           } else {
             toast.error(res.error.message || "Invalid credentials.");
           }
        } else {
           if (res?.twoFactorRedirect || res?.twoFactorRequired) {
              setStep("2fa");
           } else {
              toast.success("Signed in successfully!");
              router.push("/dashboard");
           }
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      // Fallback check if error string contains 2fa hint
      if (err.toString().toLowerCase().includes("two factor")) {
         setStep("2fa");
      } else {
         toast.error("Authentication failed. Please check your credentials.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    if (!totpCode) return toast.error("Please enter the 6-digit code.");
    
    setSubmitting(true);
    try {
      const res = await authClient.twoFactor.verifyTotp({
         code: totpCode,
         password: password, // Depending on the implementation, might need password or just session/cookie
      });
      if (res?.error) {
        toast.error("Invalid 2FA code.");
      } else {
        toast.success("Authentication successful!");
        router.push("/dashboard");
      }
    } catch(err) {
       toast.error("Verification failed.");
    } finally {
       setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleSubmitting(true);
    try {
      await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
    } catch (error) {
      toast.error("Google sign in failed.");
      setGoogleSubmitting(false);
    }
  };

  const handleGithubSignIn = async () => {
    setGithubSubmitting(true);
    try {
      await authClient.signIn.social({ provider: "github", callbackURL: "/dashboard" });
    } catch (error) {
      toast.error("GitHub sign in failed.");
      setGithubSubmitting(false);
    }
  };

  return (
    <div className={cn("min-h-screen bg-[#09090b] text-zinc-100 flex overflow-hidden", bricolageGrotesque.variable, spaceGrotesk.variable)}>
      
      {/* Left Panel: Abstract Animated Background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 flex-col justify-between p-12 overflow-hidden border-r border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent" />
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[20%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2], y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px]"
        />

        <div className="relative z-10">
          <Link href="/" className="text-2xl font-bricolage font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white to-zinc-400 flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-sm" />
            </div>
            Recruitment 2026
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bricolage font-medium mb-6">Join the next generation of engineers and designers.</h2>
          <p className="text-zinc-400 font-space text-lg">
            Manage your applications, track your progress, and securely update your profile.
          </p>
        </div>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-[400px]">
          <AnimatePresence mode="wait">
            
            {step === "auth" && (
              <motion.div 
                key="auth"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h1 className="text-3xl font-bricolage font-bold tracking-tight">
                    {mode === "signin" ? "Welcome back" : "Create account"}
                  </h1>
                  <p className="text-zinc-400 font-space text-sm">
                    {mode === "signin" ? "Enter your credentials to access your dashboard" : "Enter your details to get started"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={handleGoogleSignIn}
                    disabled={googleSubmitting || githubSubmitting || submitting}
                    className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"
                  >
                    {googleSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FaGoogle className="mr-2 h-4 w-4" />} Google
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={handleGithubSignIn}
                    disabled={googleSubmitting || githubSubmitting || submitting}
                    className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"
                  >
                    {githubSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FaGithub className="mr-2 h-4 w-4" />} GitHub
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-800" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#09090b] px-2 text-zinc-500">Or continue with</span></div>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-zinc-400">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-700 h-12 text-white"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-400">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-700 h-12 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-zinc-400">Password</Label>
                      {mode === "signin" && (
                        <Link href="/auth/reset-password" className="text-sm text-zinc-400 hover:text-white transition-colors">
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-700 h-12 text-white"
                    />
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full bg-white text-black hover:bg-zinc-200 h-12 font-medium mt-2">
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (mode === "signin" ? "Sign In" : "Create Account")}
                  </Button>
                </form>

                <p className="text-center text-sm text-zinc-400">
                  {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
                  <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-white hover:underline font-medium">
                    {mode === "signin" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </motion.div>
            )}

            {step === "2fa" && (
              <motion.div 
                key="2fa"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2 text-center">
                  <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 text-white border border-zinc-800">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h1 className="text-3xl font-bricolage font-bold tracking-tight">Two-Step Verification</h1>
                  <p className="text-zinc-400 font-space text-sm max-w-xs mx-auto">
                    Enter the 6-digit code from your authenticator app to continue.
                  </p>
                </div>

                <form onSubmit={handle2FA} className="space-y-6">
                  <div className="space-y-2">
                    <Input
                      id="totp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="000000"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      required
                      className="bg-zinc-900/50 border-zinc-800 text-center text-2xl tracking-[0.5em] font-mono h-16 focus-visible:ring-zinc-700 text-white"
                    />
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full bg-white text-black hover:bg-zinc-200 h-12 font-medium">
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Continue"}
                  </Button>
                  
                  <Button type="button" variant="ghost" onClick={() => setStep("auth")} className="w-full text-zinc-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                  </Button>
                </form>
              </motion.div>
            )}
            
            {step === "verify-email" && (
              <motion.div 
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 text-center"
              >
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 text-white border border-zinc-800">
                  <Mail className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bricolage font-bold tracking-tight">Check your email</h1>
                <p className="text-zinc-400 font-space text-sm max-w-sm mx-auto">
                  We've sent a verification link to <span className="text-white font-medium">{email}</span>. Please click the link to activate your account.
                </p>
                
                <div className="pt-6 border-t border-zinc-800">
                  <Button type="button" variant="ghost" onClick={() => { setStep("auth"); setMode("signin"); }} className="w-full text-zinc-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Return to Sign In
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
