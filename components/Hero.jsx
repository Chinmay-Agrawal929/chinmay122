"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Inter, Space_Grotesk } from "next/font/google";
import { motion, useScroll, useTransform } from "framer-motion";

const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <main className="relative flex flex-col items-center justify-center min-h-[90vh] overflow-hidden bg-background/50">
      {/* Background Image */}
      <div className="absolute inset-0 -z-20 w-full h-full opacity-30 dark:opacity-20 pointer-events-none">
        <img src="/hero_image.jpg" alt="Hero Background" className="object-cover w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90" />
      </div>

      {/* Background Parallax Elements */}
      <motion.div 
        style={{ y: y1, opacity }}
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] -z-10"
      />
      <motion.div 
        style={{ y: y2, opacity }}
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px] -z-10"
      />

      <div className="z-10 container flex flex-col items-center text-center max-w-4xl px-4 py-32 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border backdrop-blur-sm text-sm font-medium"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Recruitment 2026 is now live!</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`${inter.className} text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70`}
        >
          Ready to make your mark?
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`${spaceGrotesk.className} text-lg md:text-xl text-muted-foreground max-w-2xl`}
        >
          Join our departments and work on real-world projects. Experience hands-on learning, collaborative problem-solving, and jumpstart your career journey right here.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 pt-4"
        >
          <Link href="/departments">
            <button className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-primary-foreground bg-primary rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(var(--primary),0.3)]">
              <span className="relative z-10">Join Us Now</span>
              <ArrowRight className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            </button>
          </Link>
          <Link href="#features">
            <button className="px-8 py-3.5 text-sm font-semibold rounded-full border border-border bg-background/50 backdrop-blur hover:bg-secondary/80 transition-all">
              Explore Departments
            </button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}


