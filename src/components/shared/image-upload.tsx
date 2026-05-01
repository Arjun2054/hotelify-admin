import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";

import {
  Loader2,
  Upload,
  RefreshCcw,
  X,
  Image as ImageIcon,
  AlertCircle,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  maxSize?: number; // in MB
  aspectRatio?: "square" | "landscape" | "portrait" | "free";
  quality?: number; // 1-100
  folder?: string;
  className?: string;
}

interface UploadState {
  status: "idle" | "uploading" | "processing" | "success" | "error";
  progress: number;
  error?: string;
}

/**
 * Enterprise-Grade Image Upload Component
 *
 * Features:
 * - Multiple upload methods (Cloudinary, Backend, Base64)
 * - Automatic image optimization
 * - Progress tracking
 * - Drag & drop support
 * - Paste from clipboard
 * - Image preview with zoom
 * - Client-side compression
 * - Error recovery
 * - Accessibility compliant
 * - Responsive design
 *
 * @example
 * <ImageUpload
 *   value={imageUrl}
 *   onChange={setImageUrl}
 *   maxSize={5}
 *   aspectRatio="square"
 *   quality={85}
 * />
 */
export function ImageUpload({
  value,
  onChange,
  onError,
  disabled = false,
  maxSize = 5,
  aspectRatio = "free",
  quality = 85,
  folder = "products",
  className,
}: ImageUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuration
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const uploadMethod = import.meta.env.VITE_UPLOAD_METHOD || "cloudinary"; // cloudinary | backend | base64

  /**
   * Validate file before upload
   */
  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Check file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        return {
          valid: false,
          error:
            "Invalid file type. Please upload JPG, PNG, GIF, or WebP images.",
        };
      }

      // Check file size
      const maxSizeBytes = maxSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return {
          valid: false,
          error: `File size must be less than ${maxSize}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        };
      }

      // Check image dimensions (if needed)
      // This is done asynchronously in handleUpload

      return { valid: true };
    },
    [maxSize],
  );

  /**
   * Compress image on client side before upload
   */
  const compressImage = useCallback(
    (file: File): Promise<{ blob: Blob; preview: string }> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            // Calculate max dimensions based on aspect ratio
            const maxDimension = 2048;
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = (height * maxDimension) / width;
                width = maxDimension;
              } else {
                width = (width * maxDimension) / height;
                height = maxDimension;
              }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("Failed to get canvas context"));
              return;
            }

            // Enable image smoothing for better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve({
                    blob,
                    preview: canvas.toDataURL("image/webp", quality / 100),
                  });
                } else {
                  reject(new Error("Failed to compress image"));
                }
              },
              "image/webp",
              quality / 100,
            );
          };
          img.onerror = () => reject(new Error("Failed to load image"));
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
      });
    },
    [quality],
  );

  /**
   * Upload to Cloudinary
   */
  const uploadToCloudinary = useCallback(
    async (file: File): Promise<string> => {
      if (!cloudName || !uploadPreset) {
        throw new Error(
          "Cloudinary not configured. Check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET",
        );
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", folder);

      // SAFE params for unsigned uploads
      formData.append("quality", "auto");
      formData.append("fetch_format", "auto");

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadState((prev) => ({
              ...prev,
              progress: Math.round((e.loaded / e.total) * 100),
            }));
          }
        };

        xhr.onload = () => {
          try {
            const response = JSON.parse(xhr.responseText);

            if (xhr.status === 200 && response.secure_url) {
              resolve(response.secure_url);
            } else {
              reject(
                new Error(
                  response?.error?.message ||
                    `Cloudinary upload failed (${xhr.status})`,
                ),
              );
            }
          } catch {
            reject(new Error("Invalid Cloudinary response"));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));

        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        );

        xhr.send(formData);
      });
    },
    [cloudName, uploadPreset, folder],
  );

  /**
   * Upload to backend
   */
  const uploadToBackend = useCallback(
    async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setUploadState((prev) => ({ ...prev, progress: percentComplete }));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.url);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"));
        });

        xhr.open("POST", "/api/upload/image");
        xhr.send(formData);
      });
    },
    [folder],
  );

  /**
   * Convert to Base64
   */
  const convertToBase64 = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }, []);

  /**
   * Main upload handler
   */
  const handleUpload = useCallback(
    async (file: File) => {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        setUploadState({
          status: "error",
          progress: 0,
          error: validation.error,
        });
        onError?.(new Error(validation.error!));
        return;
      }

      try {
        setUploadState({ status: "uploading", progress: 0 });

        // Compress image
        setUploadState({ status: "processing", progress: 0 });
        const { blob } = await compressImage(file);
        const compressedFile = new File([blob], file.name, {
          type: "image/webp",
        });

        // Upload based on method
        let url: string;
        setUploadState({ status: "uploading", progress: 0 });

        switch (uploadMethod) {
          case "cloudinary":
            url = await uploadToCloudinary(compressedFile);
            break;
          case "backend":
            url = await uploadToBackend(compressedFile);
            break;
          case "base64":
            url = await convertToBase64(compressedFile);
            break;
          default:
            throw new Error(`Unknown upload method: ${uploadMethod}`);
        }

        setUploadState({ status: "success", progress: 100 });
        onChange(url);
        toast.success("Image uploaded successfully");

        // Reset state after success
        setTimeout(() => {
          setUploadState({ status: "idle", progress: 0 });
        }, 2000);
      } catch (error: any) {
        console.error("Upload error:", error);
        const errorMessage = error.message || "Failed to upload image";
        setUploadState({ status: "error", progress: 0, error: errorMessage });
        toast.error(errorMessage);
        onError?.(error);
      }
    },
    [
      validateFile,
      compressImage,
      uploadMethod,
      uploadToCloudinary,
      uploadToBackend,
      convertToBase64,
      onChange,
      onError,
    ],
  );

  /**
   * Handle file input change
   */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleUpload(file);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleUpload],
  );

  /**
   * Handle drag and drop
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handleUpload(file);
      } else {
        toast.error("Please drop an image file");
      }
    },
    [handleUpload],
  );

  /**
   * Handle paste from clipboard
   */
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            handleUpload(file);
            toast.success("Image pasted from clipboard");
          }
          break;
        }
      }
    },
    [handleUpload],
  );

  /**
   * Handle remove
   */
  const handleRemove = useCallback(() => {
    onChange("");
    setUploadState({ status: "idle", progress: 0 });
    toast.success("Image removed");
  }, [onChange]);

  /**
   * Trigger file input
   */
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const isUploading =
    uploadState.status === "uploading" || uploadState.status === "processing";
  const hasError = uploadState.status === "error";
  const isSuccess = uploadState.status === "success";

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Image Preview */}
      {value && (
        <div className="relative w-full max-w-md mx-auto">
          <div
            className={cn(
              "relative rounded-lg border-2 overflow-hidden bg-muted/50 transition-all",
              "max-h-[320px] w-full", // 🔥 FIX
              aspectRatio === "square" && "aspect-square",
              aspectRatio === "landscape" && "aspect-video",
              aspectRatio === "portrait" && "aspect-[3/4]",
              aspectRatio === "free" && "h-[240px]",
            )}
          >
            <img
              src={value}
              alt="Upload preview"
              className={cn(
                "w-full h-full max-h-full object-contain cursor-pointer transition-transform",
                showPreview && "scale-125",
              )}
              onClick={() => setShowPreview(!showPreview)}
              onError={(e) => {
                e.currentTarget.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f0f0f0' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23999' font-family='Arial' font-size='16'%3EImage not found%3C/text%3E%3C/svg%3E";
              }}
            />

            {/* Overlay Controls */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={disabled || isUploading}
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileInput();
                }}
                className="shadow-lg"
              >
                <RefreshCcw className="mr-1 h-4 w-4" />
                Replace
              </Button>

              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={disabled || isUploading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="shadow-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Success Indicator */}
            {isSuccess && (
              <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>

          <p className="text-xs text-center text-muted-foreground mt-2">
            Click image to zoom • Click controls to replace or remove
          </p>
        </div>
      )}

      {/* Upload Area */}
      {!value && (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg transition-all",
            isDragging && "border-primary bg-primary/5 scale-105",
            hasError && "border-destructive bg-destructive/5",
            !isDragging &&
              !hasError &&
              "border-muted-foreground/25 hover:border-primary/50",
            aspectRatio === "square" && "aspect-square",
            aspectRatio === "landscape" && "aspect-video",
            aspectRatio === "portrait" && "aspect-3/4",
            aspectRatio === "free" && "min-h-[200px]",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          tabIndex={0}
          role="button"
          aria-label="Upload image"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-sm font-medium mb-2">
                  {uploadState.status === "processing"
                    ? "Processing image..."
                    : "Uploading image..."}
                </p>
                {/* <Progress
                  value={uploadState.progress}
                  className="w-full max-w-xs"
                /> */}
                <p className="text-xs text-muted-foreground mt-2">
                  {uploadState.progress.toFixed(0)}%
                </p>
              </>
            ) : hasError ? (
              <>
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-sm font-medium text-destructive mb-2">
                  Upload failed
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {uploadState.error}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={triggerFileInput}
                  disabled={disabled}
                >
                  Try Again
                </Button>
              </>
            ) : (
              <>
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <ImageIcon className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm font-medium mb-1">
                  {isDragging ? "Drop image here" : "Upload image"}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Drag & drop, paste, or click to browse
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                  disabled={disabled}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Max {maxSize}MB • JPG, PNG, GIF, WebP
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        className="hidden"
        disabled={disabled || isUploading}
        onChange={handleFileChange}
        aria-label="File input"
      />
    </div>
  );
}
