"use client";

import React, { useRef, useEffect, useState } from "react";
import { useScroll, useTransform, useMotionValueEvent } from "framer-motion";

const FRAME_COUNT = 300;

export default function ScrollParallax() {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const { scrollYProgress } = useScroll();

  // Create a transform that maps scroll position from 0 to 1 -> frame 1 to 300
  const frameIndex = useTransform(scrollYProgress, [0, 1], [1, FRAME_COUNT]);

  useEffect(() => {
    let loadedCount = 0;
    const images = [];

    // Preload images
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      // Format number to be padded with 5 zeros: frame_00001.jpg
      const paddedIndex = i.toString().padStart(5, "0");
      img.src = `/scroll-frames/frame_${paddedIndex}.jpg`;

      const checkAllLoaded = () => {
        loadedCount++;
        // We consider it "ready to draw first frame" if at least the first frame is loaded
        // but we'll mark fully loaded when all are done or attempted.
        if (loadedCount === FRAME_COUNT) {
          imagesRef.current = images;
          setImagesLoaded(true);
        }

        // As soon as the first image loads, we can try to draw it if the canvas is ready
        if (i === 1 && canvasRef.current) {
          requestAnimationFrame(() => drawImage(images[0]));
        }
      };

      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded;

      images.push(img);
    }

    // Assign to ref immediately so if scroll happens during loading, we have partial array
    imagesRef.current = images;
  }, []);

  const drawImage = (img) => {
    if (!canvasRef.current || !img || !img.complete || img.naturalWidth === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Object-cover logic
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);

    const centerShift_x = (canvas.width - img.width * ratio) / 2;
    const centerShift_y = (canvas.height - img.height * ratio) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      0, 0, img.width, img.height,
      centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
    );
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        // Redraw current frame
        const currentFrame = Math.floor(frameIndex.get());
        const img = imagesRef.current[currentFrame - 1];
        drawImage(img);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [frameIndex]);

  useMotionValueEvent(frameIndex, "change", (latest) => {
    const index = Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(latest) - 1));
    const img = imagesRef.current[index];
    drawImage(img);
  });

  return (
    <div className="fixed inset-0 -z-50 pointer-events-none opacity-20 transition-opacity duration-1000 dark:opacity-10">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
}
