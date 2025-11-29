import { useState, useRef, useEffect } from "react";
import { Camera, Upload, Loader2, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScanDemo } from "@/components/ScanDemo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SCANNING_FACTS = [
  "Did you know? Over 10,000 chemicals are used in cosmetics, but only a fraction are tested for safety.",
  "Fun fact: Reading ingredient labels can help you avoid over 80% of harmful chemicals in daily products.",
  "Health tip: Natural doesn't always mean safe - even natural ingredients can cause allergies.",
  "Did you know? The average person uses 9-15 personal care products daily with over 120 chemicals.",
  "Interesting: Some preservatives in cosmetics can mimic hormones and disrupt your endocrine system.",
  "Fact: Your skin absorbs up to 60% of what you put on it, making ingredient safety crucial.",
];


const Scan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentFact, setCurrentFact] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setCurrentFact((prev) => (prev + 1) % SCANNING_FACTS.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const startCamera = async () => {
    try {
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      console.log("Requesting camera access...");
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported on this device or browser. Please use the upload option instead.");
      }
      
      // Request camera with mobile-optimized constraints
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 }
        },
        audio: false
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Camera access granted, stream obtained");
      
      // Set camera active FIRST to ensure video element is rendered
      setIsCameraActive(true);
      
      // Small delay to ensure DOM is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!videoRef.current) {
        console.error("Video element not available after render");
        mediaStream.getTracks().forEach(track => track.stop());
        setIsCameraActive(false);
        throw new Error("Camera element initialization failed");
      }
      
      // Set the stream and configure video element
      videoRef.current.srcObject = mediaStream;
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('muted', 'true');
      setStream(mediaStream);
      
      // Attempt to play with timeout
      const playPromise = videoRef.current.play();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Camera initialization timeout')), 5000)
      );
      
      await Promise.race([playPromise, timeoutPromise]);
      console.log("Camera streaming successfully");
      toast.success("Camera ready!", { duration: 2000 });
      
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
    console.log("Starting image analysis...");
    setIsScanning(true);
    stopCamera();

    try {
      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Auth error:", authError);
        toast.error("Please sign in to scan products");
        navigate("/auth");
        setIsScanning(false);
        return;
      }

      console.log("User authenticated, converting image...");
      
      // Check image size
      if (imageBlob.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("Image is too large. Please use a smaller image (max 10MB)");
        setIsScanning(false);
        return;
      }

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);
      
      reader.onerror = () => {
        console.error("FileReader error");
        toast.error("Failed to read image. Please try again.");
        setIsScanning(false);
      };

      reader.onloadend = async () => {
        try {
          const base64Image = reader.result as string;
          console.log("Image converted, sending to AI...");

          const { data, error } = await supabase.functions.invoke("analyze-product", {
            body: { image: base64Image },
          });

          if (error) {
            console.error("Function invocation error:", error);
            throw new Error(error.message || "Failed to analyze product");
          }

          console.log("Analysis response:", data);

          if (data?.productId) {
            console.log("Success! Navigating to result:", data.productId);
            toast.success(`Analysis complete! ${data.productName || 'Product'} scored ${data.score || 0}/100`);
            navigate(`/result/${data.productId}`);
          } else if (data?.error) {
            throw new Error(data.error);
          } else {
            throw new Error("No product ID returned from analysis");
          }
        } catch (innerError: any) {
          console.error("Inner analysis error:", innerError);
          const errorMessage = innerError.message || "Failed to analyze product";
          
          if (errorMessage.includes("clearer") || errorMessage.includes("image") || errorMessage.includes("read")) {
            toast.error("📸 Unable to read product ingredients", {
              description: "Please take a photo showing the ingredients list clearly. Make sure it's well-lit and in focus.",
              duration: 6000
            });
          } else if (errorMessage.includes("sign in") || errorMessage.includes("Unauthorized")) {
            toast.error("Please sign in to scan products");
            navigate("/auth");
          } else if (errorMessage.includes("Too many requests")) {
            toast.error("Too many requests. Please wait a moment and try again.");
          } else {
            toast.error(errorMessage);
          }
          setIsScanning(false);
        }
      };
    } catch (error: any) {
      console.error("Outer analysis error:", error);
      toast.error(error.message || "An unexpected error occurred. Please try again.");
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="relative p-4 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="hover:bg-primary/10 z-10">
          ← Home
        </Button>
        <button 
          onClick={() => navigate("/")}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 cursor-pointer"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-md hover:shadow-primary/50">
            <span className="text-sm font-black text-primary-foreground tracking-wider">PLY</span>
          </div>
        </button>
        <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="hover:bg-primary/10 z-10">
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
            <div className="flex items-center justify-center gap-2 text-sm text-primary">
              <Info className="h-4 w-4" />
              <span>Photo must show the ingredients list</span>
            </div>
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
                  <div className="flex flex-col items-center justify-center gap-6 py-12 animate-fade-in">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                      <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/50">
                        <Loader2 className="h-10 w-10 animate-spin text-primary-foreground" />
                      </div>
                    </div>
                    <div className="text-center space-y-3 max-w-md">
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                        <p className="text-xl font-bold text-foreground">Analyzing Your Product</p>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">
                        Extracting ingredients and calculating safety score...
                      </p>
                      <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20 backdrop-blur-sm">
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed animate-fade-in">
                          {SCANNING_FACTS[currentFact]}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {!isScanning && (
                  <div className="mt-6">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="tips" className="border-2 border-primary/20 rounded-xl px-4 bg-gradient-to-r from-primary/5 to-accent/5">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2 text-foreground font-semibold">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <span>How to Get Perfect Results</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-2 space-y-4">
                            <ul className="space-y-3 text-sm text-muted-foreground">
                              <li className="flex items-start gap-3">
                                <span className="text-primary font-bold mt-0.5">1.</span>
                                <span><strong className="text-foreground">Find the ingredients list</strong> on the back or side of the product packaging</span>
                              </li>
                              <li className="flex items-start gap-3">
                                <span className="text-primary font-bold mt-0.5">2.</span>
                                <span><strong className="text-foreground">Ensure good lighting</strong> and hold your camera steady to avoid blur</span>
                              </li>
                              <li className="flex items-start gap-3">
                                <span className="text-primary font-bold mt-0.5">3.</span>
                                <span><strong className="text-foreground">Capture the full ingredients list</strong> - make sure all text is visible and readable</span>
                              </li>
                              <li className="flex items-start gap-3">
                                <span className="text-primary font-bold mt-0.5">4.</span>
                                <span><strong className="text-foreground">Avoid shadows and glare</strong> that might obscure the text</span>
                              </li>
                            </ul>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="demo" className="border-2 border-border rounded-xl px-4 mt-3">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2 text-foreground font-semibold">
                            <Info className="h-5 w-5 text-primary" />
                            <span>Try Demo Products & See Examples</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-2">
                            <ScanDemo />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-black shadow-2xl">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-0 border-4 border-primary/40 rounded-xl pointer-events-none animate-pulse" />
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full">
                    <p className="text-white text-sm font-medium">Position ingredients list in frame</p>
                  </div>
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
