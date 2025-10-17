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
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      console.log("Requesting camera access...");
      
      // Request camera with simpler constraints first
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment"
        },
        audio: false
      });
      
      console.log("Camera access granted, stream obtained");
      
      if (!videoRef.current) {
        console.error("Video element not available");
        mediaStream.getTracks().forEach(track => track.stop());
        throw new Error("Video element not ready");
      }
      
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      
      // Wait for video to be ready and play
      videoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded");
        if (videoRef.current) {
          videoRef.current.play()
            .then(() => {
              console.log("Video playing successfully");
              setIsCameraActive(true);
            })
            .catch(err => {
              console.error("Error playing video:", err);
              toast.error("Failed to start camera preview");
            });
        }
      };
      
    } catch (error: any) {
      console.error("Camera error:", error.name, error.message);
      
      let errorMessage = "Could not access camera. ";
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage += "Please allow camera permissions in your browser settings.";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMessage += "No camera found on this device.";
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMessage += "Camera is already in use. Please close other apps using the camera.";
      } else if (error.name === "OverconstrainedError") {
        errorMessage += "Camera doesn't support the requested settings. Trying alternative...";
        // Fallback: try again with user-facing camera
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            setStream(fallbackStream);
            await videoRef.current.play();
            setIsCameraActive(true);
            toast.success("Camera started with front camera");
            return;
          }
        } catch (fallbackError) {
          console.error("Fallback camera failed:", fallbackError);
        }
      } else {
        errorMessage += "Please try again or use the upload option.";
      }
      
      toast.error(errorMessage);
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
      <header className="p-4 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="hover:bg-primary/10">
          ← Home
        </Button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center hover:scale-110 transition-transform">
            <span className="text-sm font-bold text-primary-foreground">P</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="hover:bg-primary/10">
          Profile
        </Button>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 space-y-3 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Scan & Reveal</h1>
            <p className="text-muted-foreground text-lg">
              Discover what's really in your products with instant AI analysis
            </p>
          </div>
          
          <div className="backdrop-blur-sm bg-card/50 border-2 rounded-2xl shadow-xl p-6 md:p-8">
            {!isCameraActive ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    size="lg"
                    onClick={startCamera}
                    disabled={isScanning}
                    className="w-full h-32 flex-col space-y-3 bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-transform duration-200"
                  >
                    <Camera className="h-10 w-10" />
                    <div>
                      <div className="font-semibold text-lg">Open Camera</div>
                      <div className="text-sm opacity-90">Scan product in real-time</div>
                    </div>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning}
                    className="w-full h-32 flex-col space-y-3 hover:scale-105 transition-transform duration-200"
                  >
                    <Upload className="h-10 w-10" />
                    <div>
                      <div className="font-semibold text-lg">Upload Image</div>
                      <div className="text-sm text-muted-foreground">Choose from gallery</div>
                    </div>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                
                {isScanning && (
                  <div className="flex flex-col items-center justify-center gap-4 py-8 animate-pulse">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="text-center space-y-2">
                      <p className="text-lg font-semibold text-foreground">Analyzing Product</p>
                      <p className="text-sm text-muted-foreground">Extracting ingredients and calculating safety score...</p>
                    </div>
                  </div>
                )}
                
                {!isScanning && (
                  <div className="bg-muted/50 rounded-lg p-6 space-y-3 mt-6">
                    <h3 className="font-semibold text-foreground">Tips for Best Results:</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Ensure the ingredient list is clearly visible and well-lit</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Hold the camera steady and avoid blur</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Make sure the text is not cut off at the edges</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-0 border-4 border-primary/30 rounded-lg pointer-events-none" />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={captureImage}
                    disabled={isScanning}
                    className="flex-1 h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-5 w-5" />
                        Capture & Analyze
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={stopCamera}
                    disabled={isScanning}
                    className="h-14 px-8"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Scan;
