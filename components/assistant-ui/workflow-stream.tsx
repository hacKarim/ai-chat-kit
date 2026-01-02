"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { connectors, webrtc, streams } from "@roboflow/inference-sdk";
import { Video, VideoOff, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface WorkflowStreamData {
  count_objects?: number;
  predictions?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
    class: string;
  }>;
}

interface WorkflowStreamProps {
  confidence: number;
  onClose: () => void;
}

export function WorkflowStream({ confidence, onClose }: WorkflowStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isInitializingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const initialConfidenceRef = useRef(confidence);
  const [streaming, setStreaming] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectionData, setDetectionData] = useState<WorkflowStreamData | null>(
    null
  );

  const start = useCallback(async (confidenceValue: number) => {
    // Prevent multiple simultaneous initializations
    if (isInitializingRef.current) {
      return;
    }

    try {
      isInitializingRef.current = true;
      setConnecting(true);
      setError(null);

      // Use backend proxy for security
      const connector = connectors.withProxyUrl("/api/init-webrtc");

      // Request camera access
      const stream = await streams.useCamera({
        video: { facingMode: "environment" },
      });

      // Store media stream reference for cleanup
      mediaStreamRef.current = stream;

      const params = {
        workspaceName: process.env.NEXT_PUBLIC_ROBOFLOW_WORKSPACE || "",
        workflowId:
          process.env.NEXT_PUBLIC_ROBOFLOW_WORKFLOW_ID ||
          "detect-count-and-visualize",
        streamOutputNames: ["output_image"],
        dataOutputNames: ["count_objects", "predictions"],
        processingTimeout: 600,
        requestedPlan: "webrtc-gpu-medium",
        requestedRegion: process.env.NEXT_PUBLIC_ROBOFLOW_REGION || "us",
        workflowsParameters: {
          confidence: confidenceValue,
        },
      };

      // Initialize WebRTC connection with workflow parameters
      connectionRef.current = await webrtc.useStream({
        source: stream,
        connector,
        wrtcParams: params,
        onData: (data: any) => {
          setDetectionData(data);
        },
      });

      // Set video source from remote stream
      if (videoRef.current) {
        videoRef.current.srcObject =
          await connectionRef.current.remoteStream();
      }

      hasInitializedRef.current = true;
      setStreaming(true);
      setConnecting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start stream");
      setConnecting(false);
    } finally {
      isInitializingRef.current = false;
    }
  }, []);

  const stop = useCallback(() => {
    // Clean up WebRTC connection
    if (connectionRef.current) {
      connectionRef.current.cleanup();
      connectionRef.current = null;
    }

    // Stop all media stream tracks (camera)
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }

    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Reset state
    isInitializingRef.current = false;
    hasInitializedRef.current = false;
    setStreaming(false);
    setDetectionData(null);
    setError(null);
  }, []);

  const restart = useCallback(async (confidenceValue: number) => {
    stop();
    // Small delay to ensure cleanup completes
    await new Promise(resolve => setTimeout(resolve, 500));
    await start(confidenceValue);
  }, [start, stop]);

  // Auto-start stream when component mounts with initial confidence
  useEffect(() => {
    start(initialConfidenceRef.current);

    // Cleanup on unmount
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle confidence changes with debouncing
  useEffect(() => {
    // Skip if this is the initial value or stream hasn't started yet
    if (confidence === initialConfidenceRef.current || !hasInitializedRef.current) {
      return;
    }

    // Debounce confidence changes - restart after 1.5 seconds of no changes
    const timeoutId = setTimeout(() => {
      restart(confidence);
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [confidence, restart]);

  const handleClose = useCallback(() => {
    stop();
    onClose();
  }, [stop, onClose]);

  return (
    <div className="relative w-full h-full bg-black">
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Confidence Display */}
      <div className="absolute top-4 left-4 z-50 px-4 py-2 bg-black/50 text-white rounded-lg text-sm font-medium">
        Confidence: {(confidence * 100).toFixed(0)}%
      </div>

      {/* Video Display */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Loading States */}
      {!streaming && !connecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center text-white">
            <VideoOff className="w-16 h-16 mx-auto mb-2" />
            <p>Camera stream not active</p>
          </div>
        </div>
      )}
      {connecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center text-white">
            <Loader2 className="w-12 h-12 mx-auto mb-2 animate-spin" />
            <p>Connecting to stream...</p>
          </div>
        </div>
      )}

      {/* Detection Info Overlay */}
      {detectionData && streaming && (
        <div className="absolute bottom-4 left-4 z-50 flex gap-4">
          {detectionData.count_objects !== undefined && (
            <div className="px-4 py-2 bg-black/70 text-white rounded-lg">
              <div className="text-xs opacity-80">Objects</div>
              <div className="text-xl font-bold">{detectionData.count_objects}</div>
            </div>
          )}
          {detectionData.predictions && (
            <div className="px-4 py-2 bg-black/70 text-white rounded-lg">
              <div className="text-xs opacity-80">Predictions</div>
              <div className="text-xl font-bold">
                {detectionData.predictions.length}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute top-20 left-4 right-4 z-50 p-4 bg-destructive/90 text-destructive-foreground rounded-lg border border-destructive">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

export function WorkflowStreamButton() {
  const [confidence, setConfidence] = useState(0.5);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <TooltipIconButton
          tooltip="Start Live View"
          side="bottom"
          variant="ghost"
          size="icon"
          className="aui-composer-live-view size-[34px] rounded-full p-1 text-xs font-semibold hover:bg-muted-foreground/15 dark:border-muted-foreground/15 dark:hover:bg-muted-foreground/30"
          aria-label="Start Live View"
        >
          <Video className="aui-live-view-icon size-5 stroke-[1.5px]" />
        </TooltipIconButton>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="!max-w-none !w-screen !h-screen !max-h-screen !p-0 !border-0 !bg-black !top-0 !left-0 !translate-x-0 !translate-y-0 !rounded-none"
      >
        <DialogTitle className="sr-only">Live Workflow Stream</DialogTitle>

        {/* Confidence Slider - Positioned in top center */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 bg-black/50 text-white rounded-lg">
          <Label className="text-sm whitespace-nowrap">
            Confidence: {(confidence * 100).toFixed(0)}%
          </Label>
          <Slider
            value={[confidence]}
            onValueChange={([value]) => setConfidence(value)}
            min={0}
            max={1}
            step={0.05}
            className="w-32"
          />
        </div>

        {isOpen && (
          <WorkflowStream confidence={confidence} onClose={() => setIsOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
