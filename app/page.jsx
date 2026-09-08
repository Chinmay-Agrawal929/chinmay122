"use client";
import React, { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import BentoGridComp from "@/components/BentoGridComp";
import { authClient } from "@/lib/auth-client";

const Home = () => {
  const { data: session, isPending } = authClient.useSession();

  return (
    <main className="min-h-screen">
      <NavBar />
      <Hero />
      <div id="features" className="container mx-auto py-20 px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Discover Departments</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Explore the diverse teams you can join. Find your passion and collaborate on cutting-edge projects.</p>
        </div>
        <BentoGridComp />
      </div>
      <Footer />
    </main>
  );
};

export default Home;
