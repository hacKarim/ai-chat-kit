"use client";

import { FC } from "react";
import { cn } from "@/lib/utils";
import { Navigation, Car, PersonStanding, Train, Bike, MapPin, Clock, ArrowRight, ExternalLink } from "lucide-react";
import { ActionButtons } from "@/components/tool-ui/shared/action-buttons";
import { RATIO_CLASS_MAP, getFitClass } from "@/components/tool-ui/shared/media";
import type { SerializableMaps } from "./schema";

interface MapsProps extends SerializableMaps {
  className?: string;
  onResponseAction?: (actionId: string) => void;
}

const getModeIcon = (mode: string) => {
  switch (mode) {
    case "driving":
      return <Car className="w-4 h-4" />;
    case "walking":
      return <PersonStanding className="w-4 h-4" />;
    case "transit":
      return <Train className="w-4 h-4" />;
    case "bicycling":
      return <Bike className="w-4 h-4" />;
    default:
      return <Navigation className="w-4 h-4" />;
  }
};

const getModeLabel = (mode: string) => {
  switch (mode) {
    case "driving":
      return "Driving";
    case "walking":
      return "Walking";
    case "transit":
      return "Transit";
    case "bicycling":
      return "Bicycling";
    default:
      return "Navigation";
  }
};

// Generate Google Maps directions URL
const generateGoogleMapsUrl = (
  destination: string,
  origin?: string,
  mode: string = "driving"
): string => {
  const params = new URLSearchParams({
    api: "1",
    destination: destination,
  });

  // Add origin if provided, otherwise defaults to current location
  if (origin) {
    params.append("origin", origin);
  }

  // Map component modes to Google Maps travel modes
  const travelModeMap: Record<string, string> = {
    driving: "driving",
    walking: "walking",
    transit: "transit",
    bicycling: "bicycling",
  };

  params.append("travelmode", travelModeMap[mode] || "driving");

  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

export const Maps: FC<MapsProps> = ({
  id,
  destination,
  origin,
  mode = "driving",
  title,
  description,
  distance,
  duration,
  mapImageUrl,
  ratio = "16:9",
  responseActions,
  className,
  onResponseAction,
}) => {
  // Handle clicking the map card to open directions from Paris
  const handleMapClick = () => {
    const defaultOrigin = "Paris, France";
    const mapsUrl = generateGoogleMapsUrl(destination, origin || defaultOrigin, mode);
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };

  // Handle action clicks
  const handleAction = (actionId: string) => {
    // Check if this is a maps-related action
    const mapsActions = ["open-maps", "get-directions", "directions", "open-google-maps"];

    if (mapsActions.includes(actionId)) {
      const mapsUrl = generateGoogleMapsUrl(destination, origin || "Paris, France", mode);
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
    }

    // Call the original handler if provided
    if (onResponseAction) {
      onResponseAction(actionId);
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      data-tool-ui-id={id}
      data-slot="maps"
    >
      <div
        className="bg-secondary text-primary border  rounded-lg overflow-hidden hover:scale-[1.01] transition-transform cursor-pointer"
        onClick={handleMapClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleMapClick();
          }
        }}
      >
        {/* Map Image Preview */}
        {mapImageUrl && (
          <div className={cn("relative overflow-hidden bg-gradient-to-br from-gray-900 to-black", RATIO_CLASS_MAP[ratio])}>
            <img
              src={mapImageUrl}
              alt={title || destination}
              className="w-full h-full object-cover brightness-90 contrast-125 saturate-50"
              style={{
                filter: 'invert(0.92) hue-rotate(180deg) brightness(0.9) contrast(1.1)',
              }}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-3 space-y-2">
          {/* Header: Mode + Distance/Duration */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
              <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-800 rounded-md">
                {getModeIcon(mode)}
                <span>{getModeLabel(mode)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(distance || duration) && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">{duration}</span>
                    </div>
                  )}
                  {distance && duration && <span>•</span>}
                  {distance && (
                    <span className="font-medium">{distance}</span>
                  )}
                </div>
              )}
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            </div>
          </div>

          {/* Title */}
          {title && (
            <h3 className="font-semibold text-sm leading-tight line-clamp-1">
              {title}
            </h3>
          )}

          {/* Destination */}
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-blue-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2 leading-snug">
                {destination}
              </p>
              {origin && (
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                  from {origin}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Response Actions */}
      {responseActions && responseActions.length > 0 && (
        <ActionButtons
          actions={responseActions}
          onAction={handleAction}
        />
      )}
    </div>
  );
};
