import { useState, useRef } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


const Scan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        // Wait for video metadata to load before activating camera
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setIsCameraActive(true);
          }).catch((error) => {
            console.error("Error playing video:", error);
            toast.error("Failed to start camera preview");
          });
        };
      }
    } catch (error) {
      toast.error("Failed to access camera. Please allow camera permissions.");
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          handleImageAnalysis(blob);
        }
      }, "image/jpeg");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageAnalysis(file);
    }
  };

  const handleImageAnalysis = async (imageBlob: Blob) => {
    setIsScanning(true);
    stopCamera();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to scan products");
        navigate("/auth");
        return;
      }

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);
      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        const { data, error } = await supabase.functions.invoke("analyze-product", {
          body: { image: base64Image },
        });

        if (error) {
          throw error;
        }

        if (data.productId) {
          navigate(`/result/${data.productId}`);
        } else {
          toast.error("Failed to analyze product");
        }
      };
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze product. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center justify-between border-b border-border">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          ← Home
        </Button>
        <h1 className="text-xl font-semibold">Purelytics</h1>
        <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
          Profile
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {!isCameraActive ? (
          <div className="text-center space-y-6 max-w-md">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">
                Scan & Reveal
              </h1>
              <p className="text-lg text-muted-foreground">
                Hidden Ingredients Exposed
              </p>
            </div>

            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full"
                onClick={startCamera}
                disabled={isScanning}
              >
                <Camera className="mr-2 h-5 w-5" />
                Open Camera
              </Button>

              <Button
                size="lg"
                variant="secondary"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Image
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {isScanning && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Analyzing product...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-2xl space-y-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg shadow-lg"
            />

            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={captureImage}
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Capture & Analyze"
                )}
              </Button>
              <Button size="lg" variant="outline" onClick={stopCamera}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Scan;
