import React, { useState, useEffect } from 'react';

// Reliable category-based fallback images
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  sembunyi_burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  maggie_samyang: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
  chicken_wings: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
  sembunyi_snack: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  fries_goncang: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80',
  western_grill: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  main_dish: '/images/chicken_chop_dish.jpg',
  pasta: '/images/mac_and_cheese.jpg',
  rice_set: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
  side_snack: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  croffle_pastry: '/images/chocolate_croffle_waffle.jpg',
  coffee: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
  non_coffee: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
  sparkling_refresher: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
  default: '/images/chicken_chop_dish.jpg'
};

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  category?: string;
  fallbackSrc?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = 'Hidangan Sembunyi',
  className = '',
  category,
  fallbackSrc,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src || '');
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync when src prop changes
  useEffect(() => {
    setImgSrc(src || '');
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const defaultFallback = fallbackSrc || (category && CATEGORY_FALLBACK_IMAGES[category]) || CATEGORY_FALLBACK_IMAGES.default;

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (imgSrc !== defaultFallback) {
        setImgSrc(defaultFallback);
      }
    }
  };

  return (
    <div className={`relative overflow-hidden bg-slate-900 ${className}`}>
      {/* Loading shimmer placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse" />
      )}
      <img
        {...props}
        src={imgSrc || defaultFallback}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${props.className || ''}`}
      />
    </div>
  );
};
