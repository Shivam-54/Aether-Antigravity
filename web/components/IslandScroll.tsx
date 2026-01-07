'use client';

import { useRef, useEffect, useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

const FRAME_COUNT = 118;
const FRAME_PATH = '/frames/frame-';

interface IslandScrollProps {
  isLocked?: boolean;
  blurAmount?: number;
  onLoad?: () => void;
}

export default function IslandScroll({ isLocked = false, blurAmount = 0, onLoad }: IslandScrollProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollYProgress } = useScroll();

  // Smoothed interpolation state
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Preload images
  useEffect(() => {
    const loadImages = async () => {
      const loadedImages: HTMLImageElement[] = [];
      const imagePromises: Promise<void>[] = [];

      for (let i = 1; i <= FRAME_COUNT; i++) {
        const promise = new Promise<void>((resolve, reject) => {
          const img = new Image();
          const frameNumber = i.toString().padStart(3, '0');
          img.src = `${FRAME_PATH}${frameNumber}.webp`;
          img.onload = () => {
            loadedImages[i - 1] = img;
            resolve();
          };
          img.onerror = reject;
        });
        imagePromises.push(promise);
      }

      try {
        await Promise.all(imagePromises);
        setImages(loadedImages);
        setIsLoaded(true);
        if (onLoad) onLoad();
      } catch (error) {
        console.error("Failed to load frames", error);
      }
    };

    loadImages();
  }, []);

  // Shared render function
  const render = (frameIndex: number, scrollProgress: number) => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = images[Math.floor(frameIndex)];
    if (!img) return;

    // Check if canvas size matches window size (responsive)
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    // Contain Fit Logic
    let fitScale = Math.min(canvas.width / img.width, canvas.height / img.height);

    // Shrink at the end (last 20% of scroll) to make room for the bottom text
    // Only apply on mobile where vertical space is tight
    if (scrollProgress > 0.8 && canvas.width < 768) {
      const shrinkFactor = 1 - ((scrollProgress - 0.8) * 2.5); // 1.0 -> 0.5
      fitScale *= Math.max(0.5, shrinkFactor);
    }

    const x = (canvas.width / 2) - (img.width / 2) * fitScale;
    const y = (canvas.height / 2) - (img.height / 2) * fitScale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, img.width * fitScale, img.height * fitScale);
  };

  // requestAnimationFrame loop for smooth interpolation
  useEffect(() => {
    if (!isLoaded || images.length === 0) return;

    let lastScrollProgress = 0;

    const animate = () => {
      // When locked, freeze the interpolation to settle/pause the frame
      if (!isLocked) {
        // Lerp (linear interpolation) with smoothing factor
        const smoothingFactor = 0.12; // Lower = smoother but slower
        currentFrameRef.current += (targetFrameRef.current - currentFrameRef.current) * smoothingFactor;

        // Only render if there's a meaningful change (> 0.01 frames)
        if (Math.abs(targetFrameRef.current - currentFrameRef.current) > 0.01) {
          render(currentFrameRef.current, lastScrollProgress);
        }
      }
      // If locked, we don't update currentFrameRef, effectively pausing the animation

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(animate);

    // Update last scroll progress for shrinking calculation
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      lastScrollProgress = latest;
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      unsubscribe();
    };
  }, [isLoaded, images, isLocked, scrollYProgress]);

  // Update target frame on scroll (decoupled from rendering)
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // When locked, don't update the target frame - this pauses progression
    if (isLocked) return;

    if (!isLoaded || images.length === 0) return;

    const frameIndex = Math.min(
      FRAME_COUNT - 1,
      latest * FRAME_COUNT
    );

    targetFrameRef.current = frameIndex;
  });

  return (
    <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#050505]">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white/50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="block h-full w-full object-contain transition-all duration-1000"
        style={{
          filter: blurAmount > 0 ? `blur(${blurAmount}px) contrast(0.95)` : 'none'
        }}
      />
    </div>
  );
}
