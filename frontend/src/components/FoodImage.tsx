import React, { useState, useEffect, useRef } from 'react';

interface FoodImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackSrc?: string;
  containerClassName?: string;
}

const DEFAULT_FALLBACK = '/images/fallback-food.jpg';

export const FoodImage: React.FC<FoodImageProps> = ({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const initialSrc = src || fallbackSrc;
  const [imgSrc, setImgSrc] = useState<string>(initialSrc);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const prevSrcRef = useRef<string | undefined>(src);

  // Sync if src prop changes to a different URL
  useEffect(() => {
    if (src !== prevSrcRef.current) {
      prevSrcRef.current = src;
      const target = src || fallbackSrc;
      setImgSrc(target);
      setHasError(false);
      setIsLoaded(false);
    }
  }, [src, fallbackSrc]);

  // Check if image is already cached/completed by browser
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [imgSrc]);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
    setIsLoaded(true);
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden w-full h-full bg-stone-900 ${containerClassName}`}>
      {/* Subtle background placeholder (only visible while image bytes load) */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-stone-800/80 animate-pulse pointer-events-none" />
      )}

      {/* Food Image: Always rendered directly with smooth transition */}
      <img
        ref={imgRef}
        {...props}
        src={imgSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          isLoaded ? 'opacity-100' : 'opacity-90'
        } ${className}`}
      />
    </div>
  );
};

export default FoodImage;
