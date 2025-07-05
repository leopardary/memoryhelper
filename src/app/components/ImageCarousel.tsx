'use client'
import Image from "next/image";
import React, { useState, useRef } from 'react';

interface ImageCarouselProps {
  imageSrcs: string[];
  imageAlt: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ imageSrcs }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const isFirstSlide = currentIndex == 0;
  const isLastSlide = currentIndex == imageSrcs.length - 1;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;

    const threshold = 50; // Minimum swipe distance
    if (distance > threshold) goToNext();
    else if (distance < -threshold) goToPrevious();

    // Reset
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageSrcs.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === imageSrcs.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto overflow-hidden">
      {/* Swipeable Area */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {imageSrcs.map((src, index) => (
          <Image
            key={index}
            src={src}
            alt={`Slide ${index}`}
            width={798}
            height={1000}
            className="w-full flex-shrink-0 object-cover"
          />
        ))}
      </div>

      {/* Prev/Next Buttons */}
      {!isFirstSlide && <button
        onClick={goToPrevious}
        className={`absolute top-1/2 left-4 -translate-y-1/2 bg-muted bg-opacity-50 text-muted-foreground rounded-full p-2 hover:bg-opacity-70`}
        aria-label="Previous Slide"
      >
        ◀
      </button>}

      {!isLastSlide && <button
        onClick={goToNext}
        className={`absolute top-1/2 right-4 -translate-y-1/2 bg-muted bg-opacity-50 text-muted-foreground rounded-full p-2 hover:bg-opacity-70 ${isLastSlide ? 'pointer-events-none' : ''}`}
        aria-label="Next Slide"
      >
        ▶
      </button>}

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {imageSrcs.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 w-2 rounded-full ${
              index === currentIndex ? "bg-foreground" : "bg-muted-foreground"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;