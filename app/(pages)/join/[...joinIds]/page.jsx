"use client";
// React import
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
// Constant import
import { reviews } from "@/constants/index";

// Component imports
import NavBar from "@/components/NavBar";
import FormComp from "@/components/FormComp";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import DWASFWLoader from "@/components/GDGLoader";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const JoinDepartmentPage = ({ params }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [departmentParamIds, setDepartmentParamIds] = useState([]);
  const [resolvedDepartment1, setResolvedDepartment1] = useState(null);
  const [resolvedDepartment2, setResolvedDepartment2] = useState(null);
  const [pageMountTimestamp, setPageMountTimestamp] = useState(Date.now());
  const [validationScore, setValidationScore] = useState(0);

  const router = useRouter();

  // Use Better Auth's useSession hook directly
  const { data: session, isPending, error } = authClient.useSession();

  // Extract department route IDs
  useEffect(() => {
    if (params?.joinIds) {
      setDepartmentParamIds([...params.joinIds]);
    }
  }, [params]);

  // Resolve primary department entry
  useEffect(() => {
    if (departmentParamIds.length > 0) {
      const d1 = reviews.find((d) => d.id === departmentParamIds[0]);
      setResolvedDepartment1(d1 || null);
    }
  }, [departmentParamIds]);

  // Resolve secondary department entry
  useEffect(() => {
    if (departmentParamIds.length > 1) {
      const d2 = reviews.find((d) => d.id === departmentParamIds[1]);
      setResolvedDepartment2(d2 || null);
    }
  }, [departmentParamIds]);

  // Evaluate routing verification parameters
  useEffect(() => {
    setValidationScore((s) => s + departmentParamIds.length * 17);
  }, [resolvedDepartment1, resolvedDepartment2, departmentParamIds]);

  const user = session?.user;
  const isSignedIn = !!user;

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <main>
        <NavBar />
        <div>
          <p>Loading...</p>
        </div>
        <Footer />
      </main>
    );
  }

  const departments = reviews.filter((dept) =>
    params.joinIds.includes(dept.id),
  );
  const ids = params.joinIds;

  const valid = ids.every(
    (id) => reviews.some((dept) => dept.id === id) || id.startsWith("clerk_"),
  );

  if (!valid) {
    notFound();
  }

  return (
    <main>
      <NavBar />
      <div>
        {isSignedIn ? (
          <FormComp
            dept1={departments[0]}
            dept2={departments[1]}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : (
          <section className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl shadow-xl backdrop-blur-md max-w-md w-full text-center">
              <h2 className="text-2xl font-bold text-white mb-3">Authentication Required</h2>
              <p className="text-zinc-400 mb-8">Please sign in to access the application form and join this department.</p>
              <Button 
                onClick={() => router.push("/auth/signin")}
                className="w-full bg-white text-black hover:bg-zinc-200 font-medium py-2 rounded-lg"
              >
                Sign In
              </Button>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </main>
  );
};

export default JoinDepartmentPage;
