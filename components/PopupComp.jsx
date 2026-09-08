"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PiArrowRightThin } from "react-icons/pi";

const PopupComp = ({ isOpen, onClose, PopupData }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{PopupData?.header}</DialogTitle>
          <DialogDescription className="text-base mt-2">
            {PopupData?.description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            {PopupData?.message?.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end gap-3 mt-4">
            {PopupData?.buttons ? (
              PopupData.buttons.map((btn, idx) => (
                <Button key={idx} variant={btn.variant || "default"} onClick={btn.onClick || onClose}>
                  {btn.label}
                </Button>
              ))
            ) : (
              <Button onClick={onClose}>Got it</Button>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PopupComp;
