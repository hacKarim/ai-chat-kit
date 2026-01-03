"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, X, Pause, Play } from "lucide-react";
import { useVoiceRecorderContext } from "@/contexts/voice-recorder-context";
import { TextAnimate } from "@/components/ui/text-animate";
import * as THREE from "three";

interface VoiceModalProps {
  open: boolean;
  onClose: () => void;
  latestResponse?: string;
  ttsAnalyserRef: React.RefObject<AnalyserNode | null>;
}

export function VoiceModal({ open, onClose, latestResponse, ttsAnalyserRef }: VoiceModalProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [displayedResponse, setDisplayedResponse] = useState<string>("");
  const [hasSpokenSinceResponse, setHasSpokenSinceResponse] = useState(false);
  const lastResponseRef = useRef<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const micPointsRef = useRef<THREE.Points | null>(null);
  const ttsPointsRef = useRef<THREE.Points | null>(null);
  const micBasePositionsRef = useRef<Float32Array | null>(null);
  const ttsBasePositionsRef = useRef<Float32Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const {
    audioContextRef,
    analyserRef,
    stopListeningMode,
    pauseListening,
    resumeListening,
    recordingState,
    hasRecording
  } = useVoiceRecorderContext();

  useEffect(() => {
    if (!open || !containerRef.current) return;

    const container = containerRef.current;
    const micAnalyser = analyserRef.current;
    const ttsAnalyser = ttsAnalyserRef.current;

    // Setup Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 3;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const size = Math.min(container.clientWidth, container.clientHeight);
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create point cloud spheres
    const createPointSphere = (color: number, count: number = 3000) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const randomOffsets = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const opacityFactors = new Float32Array(count);

      // Generate points on a sphere using Fibonacci sphere algorithm
      const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const radius = Math.sqrt(1 - y * y);
        const theta = phi * i;

        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Random offsets for wave effect
        randomOffsets[i * 3] = (Math.random() - 0.5) * 2;
        randomOffsets[i * 3 + 1] = (Math.random() - 0.5) * 2;
        randomOffsets[i * 3 + 2] = (Math.random() - 0.5) * 2;

        // Random opacity factors (0.3 to 1.0)
        opacityFactors[i] = 0.3 + Math.random() * 0.7;

        // Base size
        sizes[i] = 0.02;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('randomOffset', new THREE.BufferAttribute(randomOffsets, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute('opacityFactor', new THREE.BufferAttribute(opacityFactors, 1));

      const material = new THREE.PointsMaterial({
        color,
        size: 0.02,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      return { points: new THREE.Points(geometry, material), basePositions: positions.slice() };
    };

    // Create mic and TTS spheres with custom colors
    const { points: micPoints, basePositions: micBase } = createPointSphere(0x01A5C0); // Blue for mic
    const { points: ttsPoints, basePositions: ttsBase } = createPointSphere(0xB71858); // Red for TTS
    scene.add(micPoints);
    scene.add(ttsPoints);
    micPointsRef.current = micPoints;
    ttsPointsRef.current = ttsPoints;
    micBasePositionsRef.current = micBase;
    ttsBasePositionsRef.current = ttsBase;

    const micBufferLength = micAnalyser?.frequencyBinCount || 128;
    const micDataArray = new Uint8Array(micBufferLength);
    const ttsBufferLength = ttsAnalyser?.frequencyBinCount || 128;
    const ttsDataArray = new Uint8Array(ttsBufferLength);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.025;

      // Get audio data
      let micAverage = 0;
      let ttsAverage = 0;

      if (micAnalyser) {
        micAnalyser.getByteFrequencyData(micDataArray);
        micAverage = micDataArray.reduce((a, b) => a + b) / micBufferLength / 255;
      }

      if (ttsAnalyser) {
        ttsAnalyser.getByteFrequencyData(ttsDataArray);
        ttsAverage = ttsDataArray.reduce((a, b) => a + b) / ttsBufferLength / 255;
      }

      // Each visualizer uses its own audio level
      const micAudioLevel = micAverage;
      const ttsAudioLevel = ttsAverage;

      // Opacity reacts to voice (0.2 when silent, up to 0.8 with voice)
      const micOpacity = isPaused ? 0 : 0.2 + micAudioLevel * 0.6;
      const ttsOpacity = isPaused ? 0 : 0.2 + ttsAudioLevel * 0.6;

      // Animate mic sphere
      if (micPoints && micBasePositionsRef.current) {
        const positions = micPoints.geometry.attributes.position.array as Float32Array;
        const basePositions = micBasePositionsRef.current;
        const randomOffsets = micPoints.geometry.attributes.randomOffset?.array as Float32Array;
        const sizes = micPoints.geometry.attributes.size?.array as Float32Array;
        const opacityFactors = micPoints.geometry.attributes.opacityFactor?.array as Float32Array;

        for (let i = 0; i < positions.length / 3; i++) {
          const i3 = i * 3;

          // Original sphere position
          const x = basePositions[i3];
          const y = basePositions[i3 + 1];
          const z = basePositions[i3 + 2];

          // Calculate distance from center (should be ~1.0)
          const dist = Math.sqrt(x * x + y * y + z * z);
          const nx = x / dist;
          const ny = y / dist;
          const nz = z / dist;

          // Audio-reactive scaling (0.6 = base, up to 2.1 with audio)
          const baseScale = 0.6;
          const scale = baseScale + micAudioLevel * 1.5;

          // Enhanced wave effect with multiple frequencies for more organic motion
          const wave1 = Math.sin(timeRef.current * 4 + randomOffsets[i3]) * 0.25 * micAudioLevel;
          const wave2 = Math.cos(timeRef.current * 3 + randomOffsets[i3 + 1]) * 0.2 * micAudioLevel;
          const wave3 = Math.sin(timeRef.current * 5 + randomOffsets[i3 + 2]) * 0.15 * micAudioLevel;

          // Apply scaling and wave
          const finalScale = scale + wave1 + wave2 + wave3;
          positions[i3] = nx * finalScale;
          positions[i3 + 1] = ny * finalScale;
          positions[i3 + 2] = nz * finalScale;

          // Randomized size based on audio and individual opacity factor
          const sizeWave = Math.sin(timeRef.current * 4 + randomOffsets[i3]) * 0.5 + 0.5;
          const audioSize = 0.015 + micAudioLevel * 0.025;
          sizes[i] = audioSize * opacityFactors[i] * (0.7 + sizeWave * 0.6);
        }

        micPoints.geometry.attributes.position.needsUpdate = true;
        micPoints.geometry.attributes.size.needsUpdate = true;
        (micPoints.material as THREE.PointsMaterial).opacity = micOpacity;
      }

      // Animate TTS sphere
      if (ttsPoints && ttsBasePositionsRef.current) {
        const positions = ttsPoints.geometry.attributes.position.array as Float32Array;
        const basePositions = ttsBasePositionsRef.current;
        const randomOffsets = ttsPoints.geometry.attributes.randomOffset?.array as Float32Array;
        const sizes = ttsPoints.geometry.attributes.size?.array as Float32Array;
        const opacityFactors = ttsPoints.geometry.attributes.opacityFactor?.array as Float32Array;

        for (let i = 0; i < positions.length / 3; i++) {
          const i3 = i * 3;

          const x = basePositions[i3];
          const y = basePositions[i3 + 1];
          const z = basePositions[i3 + 2];

          const dist = Math.sqrt(x * x + y * y + z * z);
          const nx = x / dist;
          const ny = y / dist;
          const nz = z / dist;

          const baseScale = 0.6;
          const scale = baseScale + ttsAudioLevel * 1.5;

          const wave1 = Math.sin(timeRef.current * 4 + randomOffsets[i3]) * 0.25 * ttsAudioLevel;
          const wave2 = Math.cos(timeRef.current * 3 + randomOffsets[i3 + 1]) * 0.2 * ttsAudioLevel;
          const wave3 = Math.sin(timeRef.current * 5 + randomOffsets[i3 + 2]) * 0.15 * ttsAudioLevel;

          const finalScale = scale + wave1 + wave2 + wave3;
          positions[i3] = nx * finalScale;
          positions[i3 + 1] = ny * finalScale;
          positions[i3 + 2] = nz * finalScale;

          // Randomized size based on audio and individual opacity factor
          const sizeWave = Math.sin(timeRef.current * 4 + randomOffsets[i3]) * 0.5 + 0.5;
          const audioSize = 0.015 + ttsAudioLevel * 0.025;
          sizes[i] = audioSize * opacityFactors[i] * (0.7 + sizeWave * 0.6);
        }

        ttsPoints.geometry.attributes.position.needsUpdate = true;
        ttsPoints.geometry.attributes.size.needsUpdate = true;
        (ttsPoints.material as THREE.PointsMaterial).opacity = ttsOpacity;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      micPoints?.geometry.dispose();
      (micPoints?.material as THREE.Material)?.dispose();
      ttsPoints?.geometry.dispose();
      (ttsPoints?.material as THREE.Material)?.dispose();
    };
  }, [open, analyserRef, ttsAnalyserRef, isPaused]);

  // Track when user speaks to clear old response
  useEffect(() => {
    if (recordingState === "recording") {
      setHasSpokenSinceResponse(true);
    }
  }, [recordingState]);

  // Update displayed response when new response arrives
  useEffect(() => {
    if (latestResponse && latestResponse !== lastResponseRef.current) {
      lastResponseRef.current = latestResponse;
      setDisplayedResponse(latestResponse);
      setHasSpokenSinceResponse(false);
    }
  }, [latestResponse]);

  // Handle pause/unpause
  const handlePauseToggle = () => {
    if (isPaused) {
      resumeListening();
      setIsPaused(false);
    } else {
      pauseListening();
      setIsPaused(true);
    }
  };

  const handleClose = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPaused(false);
    setDisplayedResponse("");
    setHasSpokenSinceResponse(false);
    lastResponseRef.current = "";
    stopListeningMode();
  };


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/30 backdrop-blur-md flex items-center justify-center">
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* 3D Point Cloud Visualization */}
        <div
          ref={containerRef}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ width: "min(95vw, 800px)", height: "min(95vw, 800px)" }}
        />

        {/* LLM Response text */}
        {displayedResponse && recordingState === "listening" && !hasSpokenSinceResponse && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 max-w-3xl px-8 text-center">
            <TextAnimate
              animation="blurIn"
              by="line"
              duration={0.8}
              className="text-2xl font-medium text-foreground"
              style={{
                opacity: 0.9,
                textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4)',
                whiteSpace: 'pre-wrap'
              }}
            >
              {displayedResponse}
            </TextAnimate>
          </div>
        )}

        {/* Control buttons */}
        <div className="absolute bottom-8 flex items-center gap-4">
          <Button
            size="icon"
            variant="secondary"
            onClick={handlePauseToggle}
            className="h-14 w-14 rounded-full bg-gray-500 hover:bg-gray-600"
          >
            {isPaused ? (
              <Play className="size-6 stroke-white" />
            ) : (
              <Pause className="size-6 stroke-white" />
            )}
          </Button>

          <Button
            size="icon"
            variant="destructive"
            onClick={handleClose}
            className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600"
          >
            <X className="size-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
