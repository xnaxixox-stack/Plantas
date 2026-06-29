"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface CameraCaptureProps {
  onCapture: (imageBase64: string, mediaType: string) => void;
  isLoading: boolean;
}

export default function CameraCapture({
  onCapture,
  isLoading,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setCameraError("No se pudo acceder a la cámara. Usa el botón de cargar imagen.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const base64 = dataUrl.split(",")[1];
    setCapturedImage(dataUrl);
    stopCamera();
    onCapture(base64, "image/jpeg");
  }, [onCapture, stopCamera]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const base64 = dataUrl.split(",")[1];
        setCapturedImage(dataUrl);
        stopCamera();
        onCapture(base64, file.type as "image/jpeg" | "image/png" | "image/webp");
      };
      reader.readAsDataURL(file);
    },
    [onCapture, stopCamera]
  );

  const resetCapture = useCallback(() => {
    setCapturedImage(null);
    setCameraError(null);
  }, []);

  if (capturedImage) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-lg border-2 border-green-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={capturedImage} alt="Planta capturada" className="w-full object-cover" />
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 border-4 border-white border-t-green-400 rounded-full animate-spin" />
              <p className="text-white font-medium text-sm">Analizando planta...</p>
            </div>
          )}
        </div>
        {!isLoading && (
          <button
            onClick={resetCapture}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-full transition-colors border border-green-200"
          >
            <span>↩</span> Tomar otra foto
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {cameraActive ? (
        <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border-2 border-green-200 bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full object-cover"
          />
          <div className="absolute bottom-0 inset-x-0 p-4 flex justify-center gap-3 bg-gradient-to-t from-black/60 to-transparent">
            <button
              onClick={capturePhoto}
              disabled={isLoading}
              className="w-16 h-16 rounded-full bg-white border-4 border-green-400 shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
              aria-label="Capturar foto"
            >
              <span className="text-2xl">📸</span>
            </button>
            <button
              onClick={stopCamera}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center text-sm hover:bg-black/70 transition-colors"
              aria-label="Cerrar cámara"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-green-300 bg-green-50 flex flex-col items-center justify-center gap-2 text-green-600">
          <span className="text-5xl">🌿</span>
          <p className="text-sm font-medium">Captura o sube foto de tu planta</p>
        </div>
      )}

      {cameraError && (
        <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
          {cameraError}
        </p>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex gap-3 w-full">
        {!cameraActive && (
          <button
            onClick={startCamera}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-md"
          >
            <span>📷</span> Usar cámara
          </button>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-green-50 text-green-700 font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-md border-2 border-green-200"
        >
          <span>🖼️</span> Subir imagen
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}
