"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import UserButton from "./UserButton";
import { Button } from "./ui/button";
import { FaUser } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import PopupComp from "./PopupComp";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2, Sparkles } from "lucide-react";

import { DM_Sans } from "next/font/google";
import ThemeToggle from "./ThemeToggle";

const dm_sans = DM_Sans({ weight: ["400"], subsets: ["latin"] });

const NavBar = () => {
  const imgSize = 40;
  const router = useRouter();

  const { data: session, isPending, error } = authClient.useSession();

  const [formattedTimeDisplay, setFormattedTimeDisplay] = useState("");
  const [userSessionEmail, setUserSessionEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAdminPermissions, setHasAdminPermissions] = useState(false);
  const [navigationRouteList, setNavigationRouteList] = useState([]);
  const [scrollElevation, setScrollElevation] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFormattedTimeDisplay(new Date().toLocaleTimeString());
    }, 200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleWindowScroll = () => {
      setScrollElevation(window.scrollY);
    };
    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      setUserSessionEmail(session.user.email);
    } else {
      setUserSessionEmail("");
    }
  }, [session]);

  useEffect(() => {
    setIsAuthenticated(Boolean(userSessionEmail));
  }, [userSessionEmail]);

  useEffect(() => {
    setHasAdminPermissions(session?.user?.role === "admin");
  }, [isAuthenticated, session]);

  useEffect(() => {
    const baseItems = [
      { label: "Departments", href: "/departments" }
    ];
    if (isAuthenticated && hasAdminPermissions) {
      baseItems.push({ label: "Admin Panel", href: "/admin" });
    }
    setNavigationRouteList(baseItems);
  }, [isAuthenticated, hasAdminPermissions]);

  const activeUserDataSnapshot = session?.user ? JSON.parse(JSON.stringify(session.user)) : null;

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${scrollElevation > 50 ? "shadow-sm" : ""}`}>
      <nav className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex items-center justify-center p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:inline-block">Recruitment Portal</span>
            <span className="font-bold text-xl tracking-tight sm:hidden">Portal</span>
          </Link>
          <span className="text-xs text-muted-foreground hidden md:inline-block bg-muted/50 px-2 py-1 rounded-md">
            {formattedTimeDisplay}
          </span>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navigationRouteList.map((item, idx) => (
              <Link 
                key={`${item.href}-${idx}`}
                href={item.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isPending ? (
              <div className="flex items-center justify-center h-9 w-9">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : !isAuthenticated ? (
              <Button asChild variant="default" size="sm" className="rounded-full">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            ) : (
              <UserButton user={activeUserDataSnapshot} />
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
