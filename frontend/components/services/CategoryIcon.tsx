"use client";

import React from "react";
import {
  Camera,
  Video,
  Sparkles,
  Shirt,
  Gem,
  Flower2,
  Building2,
  UtensilsCrossed,
  Palette,
  Mail,
  Music,
  Plane,
  Heart,
} from "lucide-react";

interface CategoryIconProps {
  iconName: string;
  className?: string;
}

export function CategoryIcon({ iconName, className = "h-6 w-6" }: CategoryIconProps) {
  const norm = (iconName || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  switch (norm) {
    case "camera":
    case "photography":
      return <Camera className={className} />;
    case "video":
    case "videography":
      return <Video className={className} />;
    case "sparkles":
    case "makeup":
    case "beauty":
    case "makeupbeauty":
      return <Sparkles className={className} />;
    case "shirt":
    case "wear":
    case "weddingwear":
      return <Shirt className={className} />;
    case "gem":
    case "jewellery":
    case "jewelry":
      return <Gem className={className} />;
    case "flower2":
    case "flower":
    case "decoration":
    case "decor":
      return <Flower2 className={className} />;
    case "building2":
    case "building":
    case "venue":
    case "venues":
    case "weddingvenues":
      return <Building2 className={className} />;
    case "utensilscrossed":
    case "utensils":
    case "catering":
    case "food":
      return <UtensilsCrossed className={className} />;
    case "palette":
    case "mehendi":
    case "henna":
      return <Palette className={className} />;
    case "mail":
    case "invitations":
    case "invites":
      return <Mail className={className} />;
    case "music":
    case "entertainment":
    case "musicentertainment":
      return <Music className={className} />;
    case "plane":
    case "travel":
    case "honeymoon":
    case "honeymoontravel":
      return <Plane className={className} />;
    default:
      return <Heart className={className} />;
  }
}

export function getCategoryEmoji(slug: string): string {
  switch (slug) {
    case "photography":
      return "📸";
    case "videography":
      return "🎥";
    case "makeup-beauty":
      return "💄";
    case "wedding-wear":
      return "👗";
    case "jewellery":
      return "💍";
    case "decoration":
      return "🌸";
    case "wedding-venues":
      return "🏛️";
    case "catering":
      return "🍽️";
    case "mehendi":
      return "🌿";
    case "invitations":
      return "💌";
    case "music-entertainment":
      return "🎶";
    case "honeymoon-travel":
      return "✈️";
    default:
      return "✨";
  }
}
