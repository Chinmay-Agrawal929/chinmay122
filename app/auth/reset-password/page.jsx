"use client";

import React, { useState, Suspense } from "react";
import DWASFWLoader from "@/components/GDGLoader";
import { useRouter, useSearchParams } from "next/navigation";
import { Bricolage_Grotesque, Space_Grotesk } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, ArrowLeft, KeyRound, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const bricolageGrotesque = Bricolage_Grotesque({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-bricolage-grotesque" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-space-grotesk" });

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // better-auth typically passes token in URL
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email.");
    
    setSubmitting(true);
    try {
      const res = await authClient.forgetPassword({
        email,
        redirectTo: "/auth/reset-password", // tells better-auth where to redirect with the token
      });
      if (res?.error) {
        toast.error(res.error.message || "Failed to send reset link.");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password) return toast.error("Please enter a new password.");
    
    setSubmitting(true);
    try {
      const res = await authClient.resetPassword({
        newPassword: password,
        token: token,
      });
      if (res?.error) {
        toast.error(res.error.message || "Failed to reset password.");
      } else {
        toast.success("Password reset successfully! You can now sign in.");
        router.push("/auth/signin");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // If there's a token in the URL, show the "Enter New Password" form
  if (token) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 w-full max-w-[400px]">
        <div className="space-y-2 text-center">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 text-white border border-zinc-800">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bricolage font-bold tracking-tight">Set New Password</h1>
          <p className="text-zinc-400 font-space text-sm">Enter a strong new password for your account.</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-400">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-700 h-12 text-white"
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-white text-black hover:bg-zinc-200 h-12 font-medium">
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset Password"}
          </Button>
        </form>
      </motion.div>
    );
  }

  // Otherwise, show the "Request Reset Link" form
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 w-full max-w-[400px]">
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div key="request" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            <div className="space-y-2">
              <Link href="/auth/signin" className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
              </Link>
              <h1 className="text-3xl font-bricolage font-bold tracking-tight">Forgot Password?</h1>
              <p className="text-zinc-400 font-space text-sm">
                No worries! Enter your email address and we will send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleRequestReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-400">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-700 h-12 text-white"
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-white text-black hover:bg-zinc-200 h-12 font-medium">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 text-white border border-zinc-800">
              <Mail className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bricolage font-bold tracking-tight">Check your email</h1>
            <p className="text-zinc-400 font-space text-sm max-w-sm mx-auto">
              We've sent a password reset link to <span className="text-white font-medium">{email}</span>.
            </p>
            <div className="pt-6 border-t border-zinc-800">
              <Link href="/auth/signin" className="inline-flex justify-center w-full text-zinc-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" /> Return to Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className={cn("min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden", bricolageGrotesque.variable, spaceGrotesk.variable)}>
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full flex justify-center">
        <Suspense fallback={<DWASFWLoader />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
