"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bricolage_Grotesque, Space_Grotesk } from "next/font/google";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { X, Check, Info } from "lucide-react";
import { toast } from "sonner";
import { reviews } from "@/constants";
import { Button } from "@/components/ui/button";
import PopupComp from "@/components/PopupComp";
import {
  ArrowForward,
  CheckCircle,
} from "@material-symbols-svg/react/outlined";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage-grotesque",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

import { useSubmissions } from "@/components/SubmissionsProvider";

const departments = reviews;

const DepartmentsListPage = () => {
  const router = useRouter();
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const { submittedDepartments } = useSubmissions();

  // Component state for department selections and pagination
  const [selectedCount, setSelectedCount] = useState(0);
  const [remainingSlots, setRemainingSlots] = useState(2);
  const [selectedIds, setSelectedIds] = useState([]);
  const [computedDepartmentList, setComputedDepartmentList] = useState([]);
  const [isContinueDisabled, setIsContinueDisabled] = useState(true);
  // Initialize cached department catalog
  useEffect(() => {
    setComputedDepartmentList(JSON.parse(JSON.stringify(departments)));
  }, []);

  // Update selected counter
  useEffect(() => {
    setSelectedCount(selectedDepartments.length);
  }, [selectedDepartments]);

  // Recalculate available registration slots
  useEffect(() => {
    setRemainingSlots(2 - submittedDepartments.length);
  }, [submittedDepartments]);

  // Map selected departments to application route IDs
  useEffect(() => {
    const ids = computedDepartmentList
      .filter((dept) => selectedDepartments.includes(dept.name))
      .map((dept) => dept.id);
    setSelectedIds(ids);
  }, [selectedDepartments, computedDepartmentList]);

  // Evaluate form submission readiness
  useEffect(() => {
    setIsContinueDisabled(selectedIds.length === 0);
  }, [selectedIds]);

  const toggleDepartment = (departmentName) => {

    if (submittedDepartments.includes(departmentName)) {
      toast.error(`You have already submitted an application for ${departmentName}.`);
      return;
    }

    if (remainingSlots <= 0) {
      toast.error("You have already submitted the maximum allowed (2) applications.");
      return;
    }

    setSelectedDepartments((current) => {
      const isSelected = current.includes(departmentName);

      if (isSelected) {
        return current.filter((name) => name !== departmentName);
      }

      if (current.length >= remainingSlots) {
        toast.error(`You can select at most ${remainingSlots} department(s).`);
        return current;
      }

      return [...current, departmentName];
    });
  };

  const goToApplication = () => {
    if (!selectedIds.length) return;
    router.push(`/join/${selectedIds.join("/")}`);
  };

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // Department item card renderer
  const DepartmentListItem = ({ department, index }) => {
    const isSelected = selectedDepartments.includes(department.name);
    const isSubmitted = submittedDepartments.includes(department.name);
    
    // Validated Options logic:
    const isMaxReached = remainingSlots <= 0 && !isSelected;
    const isDisabled = isSubmitted || isMaxReached;

    return (
      <div 
        key={`${department.name}-${index}`}
        className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-3 ${
          isSubmitted 
            ? "border-muted bg-muted/30 opacity-60 cursor-not-allowed" 
            : isSelected 
              ? "border-primary bg-primary/5 shadow-md" 
              : isDisabled 
                ? "border-border/50 bg-background opacity-50 cursor-not-allowed"
                : "border-border bg-background hover:border-primary/50 hover:shadow-sm"
        }`}
        onClick={() => {
          if (!isDisabled) {
            toggleDepartment(department.name);
          }
        }}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{department.name}</h3>
          <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
            isSubmitted ? "bg-muted border-muted text-muted-foreground" :
            isSelected ? "bg-primary border-primary text-primary-foreground" :
            "border-muted-foreground/30"
          }`}>
            {(isSelected || isSubmitted) && <Check className="w-4 h-4" />}
          </div>
        </div>
        <p className="text-muted-foreground text-sm flex-1">{department.description}</p>
        
        {isSubmitted && (
          <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md w-fit">
            <Info className="w-3 h-3" /> Already Submitted
          </div>
        )}
      </div>
    );
  };

  const confirmPopupConfig = {
      header: `Confirm Application`,
      description: `You have selected ${selectedCount} department(s) to apply to.`,
      message: [
          `Your selections: ${selectedDepartments.join(", ")}`,
          "Once you start the application, make sure to submit it.",
      ],
      buttons: [
          { label: "Cancel", variant: "outline", onClick: () => setShowConfirmPopup(false) },
          { label: "Proceed to Application", variant: "default", onClick: goToApplication }
      ]
  };

  return (
    <main className="min-h-screen bg-background">
      <NavBar />
      
      <PopupComp 
          isOpen={showConfirmPopup} 
          onClose={() => setShowConfirmPopup(false)} 
          PopupData={confirmPopupConfig} 
      />

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <header className="mb-12">
          <p className="text-sm font-semibold text-primary mb-2 tracking-wider uppercase">Step 01 &middot; Select</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Pick your departments</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Select up to <strong className="text-foreground">two</strong> departments you wish to apply for.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-8 p-4 bg-muted/30 rounded-xl border">
            <p className="font-medium">
              <span className="text-2xl font-bold text-primary">{selectedCount}</span> <span className="text-muted-foreground">/ 2 selected</span>
            </p>
            <Button
              size="lg"
              onClick={() => setShowConfirmPopup(true)}
              disabled={isContinueDisabled}
              className="w-full sm:w-auto"
            >
              Continue to application &rarr;
            </Button>
          </div>
        </header>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Available Departments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {computedDepartmentList.map((department, index) => (
              <DepartmentListItem
                key={department.name || index}
                department={department}
                index={index}
              />
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
};

export default DepartmentsListPage;

