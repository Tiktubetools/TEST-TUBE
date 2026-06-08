import React, { useState, useRef } from "react";
import { apiFetch } from "../../lib/apiClient";
import { 
  FileImage, Sliders, RefreshCw, Upload, Download, Sparkles, 
  FileText, Copy, CheckCircle, AlertCircle, Eye, RefreshCcw 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ImageToolsProps {
  lang: "ar" | "en";
  onActionTriggered: () => void;
  initialSubTool?: string;
}

export default function ImageTools({ lang, onActionTriggered, initialSubTool }: ImageToolsProps) {
  const [activeSubTool, setActiveSubTool] = useState<"compress" | "ocr" | "describe" | "remove_bg">("compress");

  React.useEffect(() => {
    if (initialSubTool) {
      if (initialSubTool === "compress" || initialSubTool === "ocr" || initialSubTool === "describe" || initialSubTool === "remove_bg") {
        setActiveSubTool(initialSubTool);
      }
    }
  }, [initialSubTool]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedText, setCopiedText] = useState(false);

  // Background Remover specific states
  const [chromaColor, setChromaColor] = useState<string>("auto");
  const [chromaTolerance, setChromaTolerance] = useState<number>(45);
  const [bgReplacementColor, setBgReplacementColor] = useState<"transparent" | "white" | "black" | "green">("transparent");
  const [removedBgImage, setRemovedBgImage] = useState<string | null>(null);

  // General uploaded image state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState("");
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compression specific states
  const [quality, setQuality] = useState(75);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);

  // Conversion states
  const [targetFormat, setTargetFormat] = useState<"png" | "jpeg" | "webp">("webp");
  const [convertedImage, setConvertedImage] = useState<string | null>(null);

  // OCR state
  const [ocrResult, setOcrResult] = useState("");

  // Description state
  const [focusArea, setFocusArea] = useState("general");
  const [descriptionResult, setDescriptionResult] = useState("");

  // AI Image generation states removed

  // Custom user states for resizing and compression controls
  const [isGenerated, setIsGenerated] = useState(false);
  const [customWidth, setCustomWidth] = useState<number>(1080);
  const [customHeight, setCustomHeight] = useState<number>(1080);
  const [aspectRatioValue, setAspectRatioValue] = useState<number>(1);
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);
  const [sizePreset, setSizePreset] = useState<string>("original");

  const handlePresetChange = (preset: string) => {
    setSizePreset(preset);
    if (!selectedImage) return;
    
    let targetW = customWidth;
    let targetH = customHeight;
    
    if (preset === "original") {
      const img = new Image();
      img.src = selectedImage;
      img.onload = () => {
        setCustomWidth(img.naturalWidth);
        setCustomHeight(img.naturalHeight);
      };
      return;
    } else if (preset === "fullhd") {
      targetW = 1920;
      targetH = keepAspectRatio ? Math.round(1920 / aspectRatioValue) : 1080;
    } else if (preset === "hd") {
      targetW = 1280;
      targetH = keepAspectRatio ? Math.round(1280 / aspectRatioValue) : 720;
    } else if (preset === "square") {
      targetW = 1080;
      targetH = 1080;
    } else if (preset === "avatar") {
      targetW = 400;
      targetH = 400;
    }
    
    setCustomWidth(targetW);
    setCustomHeight(targetH);
  };

  const handleWidthChange = (val: number) => {
    setCustomWidth(val);
    setSizePreset("custom");
    if (keepAspectRatio && aspectRatioValue) {
      setCustomHeight(Math.max(10, Math.round(val / aspectRatioValue)));
    }
  };

  const handleHeightChange = (val: number) => {
    setCustomHeight(val);
    setSizePreset("custom");
    if (keepAspectRatio && aspectRatioValue) {
      setCustomWidth(Math.max(10, Math.round(val * aspectRatioValue)));
    }
  };

  const t = {
    ar: {
      btnCompress: "تقليل الحجم وحفظ",
      btnConvert: "تحويل الصيغة وحفظ",
      btnOCR: "استخراج نصوص الصورة",
      btnDescribe: "تشخيص ووصف تفاصيل الصورة",
      btnGenerate: "توليد صورة واقعية بالذكاء الاصطناعي",
      qualityLabel: "مستوى جودة الضغط",
      formatLabel: "تحويل إلى صيغة",
      originalSize: "الحجم الأصلي",
      compressedSize: "الحجم الجديد",
      successCompress: "تم ضغط ومعالجة الصورة بنجاح!",
      successConvert: "تم تحويل صيغة الصورة بنجاح!",
      selectImgPrompt: "الرجاء رفع صورة لبدء العملية المطلوبة",
      copyText: "نسخ النص المستخرج",
      copied: "تم النسخ بنجاح!",
    },
    en: {
      btnCompress: "Compress & Download Image",
      btnConvert: "Convert Format & Download",
      btnOCR: "Transcribe Text OCR",
      btnDescribe: "Explain Image details",
      btnGenerate: "Generate Real AI Image",
      qualityLabel: "Compression Factor Quality",
      formatLabel: "Target output format",
      originalSize: "Original File Size",
      compressedSize: "Compressed File Size",
      successCompress: "Image compressed successfully!",
      successConvert: "Format converted successfully!",
      selectImgPrompt: "Please slide or drop an image first",
      copyText: "Copy Transcribed text",
      copied: "Copied!",
    }
  }[lang];

  // Reset file states when tab changes
  const handleTabChange = (tab: typeof activeSubTool) => {
    setActiveSubTool(tab);
    setSelectedImage(null);
    setImageFileName("");
    setOriginalSize(null);
    setCompressedImage(null);
    setCompressedSize(null);
    setConvertedImage(null);
    setOcrResult("");
    setDescriptionResult("");
    setRemovedBgImage(null);
    setError("");
    setSuccess("");
    setIsGenerated(false);
  };

  // Image Drag & Drop / manual select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFileName(file.name);
      setOriginalSize(file.size);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        // Clear old targets
        setCompressedImage(null);
        setConvertedImage(null);
        setOcrResult("");
        setDescriptionResult("");
        setError("");
        setSuccess("");
        setIsGenerated(false);

        // Load image to extract dimensions
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          setCustomWidth(img.naturalWidth);
          setCustomHeight(img.naturalHeight);
          setAspectRatioValue(img.naturalWidth / img.naturalHeight);
          setSizePreset("original");
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setImageFileName(file.name);
      setOriginalSize(file.size);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setCompressedImage(null);
        setConvertedImage(null);
        setOcrResult("");
        setDescriptionResult("");
        setError("");
        setSuccess("");
        setIsGenerated(false);

        // Load image to extract dimensions
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          setCustomWidth(img.naturalWidth);
          setCustomHeight(img.naturalHeight);
          setAspectRatioValue(img.naturalWidth / img.naturalHeight);
          setSizePreset("original");
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. Image Compressor (Real Client-Side implementation on Canvas!)
  const compressImage = (silent = false) => {
    if (!selectedImage) return;
    if (!silent) setLoading(true);

    const img = new Image();
    img.src = selectedImage;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Use the custom width and height requested by the user!
      canvas.width = customWidth || img.naturalWidth;
      canvas.height = customHeight || img.naturalHeight;
      
      // Draw image scaled to the new dimensions
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Compress via export
      const dataUrl = canvas.toDataURL("image/jpeg", quality / 100);
      setCompressedImage(dataUrl);

      // Estimate compressed size
      const head = "data:image/jpeg;base64,";
      const sizeBytes = Math.round((dataUrl.length - head.length)* 3 / 4);
      setCompressedSize(sizeBytes);
      
      setSuccess(t.successCompress);
      if (!silent) setLoading(false);
      onActionTriggered();
    };
  };

  // 4. Background Remover (Smart Real-Time Canvas Chroma Extractor!)
  const processRemoveBackground = () => {
    if (!selectedImage) return;
    setLoading(true);
    setError("");
    setSuccess("");

    const img = new Image();
    img.src = selectedImage;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setLoading(false);
        return;
      }
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Smart dominant color extraction if chromaColor is "auto"
      let targetR = 255;
      let targetG = 255;
      let targetB = 255;
      
      if (chromaColor === "auto") {
        // Sample corner pixel to guess background color (e.g. top-left)
        targetR = data[0];
        targetG = data[1];
        targetB = data[2];
      } else {
        // Parse hex color
        const hex = chromaColor.replace("#", "");
        targetR = parseInt(hex.substring(0, 2), 16) || 255;
        targetG = parseInt(hex.substring(2, 4), 16) || 255;
        targetB = parseInt(hex.substring(4, 6), 16) || 255;
      }

      const tolerance = chromaTolerance; 
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean distance in RGB space
        const diffR = r - targetR;
        const diffG = g - targetG;
        const diffB = b - targetB;
        const dist = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB);

        if (dist < tolerance) {
          if (bgReplacementColor === "transparent") {
            data[i + 3] = 0; // set alpha transparent
          } else if (bgReplacementColor === "green") {
            data[i] = 0; data[i+1] = 177; data[i+2] = 64; data[i+3] = 255;
          } else if (bgReplacementColor === "white") {
            data[i] = 255; data[i+1] = 255; data[i+2] = 255; data[i+3] = 255;
          } else if (bgReplacementColor === "black") {
            data[i] = 0; data[i+1] = 0; data[i+2] = 0; data[i+3] = 255;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      setRemovedBgImage(dataUrl);
      setSuccess(lang === "ar" ? "تم تفريغ وعزل خلفية الصورة بنجاح!" : "Background removed and transparent PNG file generated!");
      setLoading(false);
      onActionTriggered();
    };
    img.onerror = () => {
      setError(lang === "ar" ? "تعذر تنزيل وتعديل بكسلات الملف" : "Failed to decode image pixels");
      setLoading(false);
    };
  };

  // Run dynamic compression in real-time as user changes quality, customWidth, or customHeight
  React.useEffect(() => {
    if (selectedImage && activeSubTool === "compress" && isGenerated) {
      const img = new Image();
      img.src = selectedImage;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = customWidth || img.naturalWidth;
        canvas.height = customHeight || img.naturalHeight;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality / 100);
        setCompressedImage(dataUrl);

        const head = "data:image/jpeg;base64,";
        const sizeBytes = Math.round((dataUrl.length - head.length) * 3 / 4);
        setCompressedSize(sizeBytes);
      };
    }
  }, [customWidth, customHeight, quality, selectedImage, activeSubTool, isGenerated]);

  // 2. Format Converter (Real client-side implementation on Canvas!)
  const convertImageFormat = () => {
    if (!selectedImage) return;
    setLoading(true);

    const img = new Image();
    img.src = selectedImage;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      const mimeType = targetFormat === "png" ? "image/png" : targetFormat === "jpeg" ? "image/jpeg" : "image/webp";
      const dataUrl = canvas.toDataURL(mimeType, 0.92);
      setConvertedImage(dataUrl);

      setSuccess(t.successConvert);
      setLoading(false);
      onActionTriggered();
    };
  };

  // 3. Real OCR using Gemini 3.5-flash (Vision processing!)
  const triggerOCR = async () => {
    if (!selectedImage) {
      setError(t.selectImgPrompt);
      return;
    }
    setLoading(true);
    setError("");
    setOcrResult("");

    try {
      const data = await apiFetch("/api/images/ocr", {
        method: "POST",
        body: JSON.stringify({ imageBase64: selectedImage })
      });
      if (data) {
        setOcrResult(data.text);
        onActionTriggered();
      }
    } catch {
      setError("Failed to run OCR.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Real Image-to-Text Descriptive Reasoning
  const triggerDescription = async () => {
    if (!selectedImage) {
      setError(t.selectImgPrompt);
      return;
    }
    setLoading(true);
    setError("");
    setDescriptionResult("");

    try {
      const data = await apiFetch("/api/images/describe", {
        method: "POST",
        body: JSON.stringify({
          imageBase64: selectedImage,
          focusArea
        })
      });
      if (data) {
        setDescriptionResult(data.result);
        onActionTriggered();
      }
    } catch {
      setError("Vision descriptive analyzer error");
    } finally {
      setLoading(false);
    }
  };

  // Removed AI image generation triggers

  const handleCopyOCRText = () => {
    navigator.clipboard.writeText(ocrResult);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Helpers to calculate visual size strings
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-8" id="image-tools-hub">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 justify-end border-b border-white/5 pb-4 overflow-x-auto">
        {/* Generate options removed */}

        <button
          onClick={() => handleTabChange("describe")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "describe" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <Eye className="h-4 w-4" />
          <span>{lang === "ar" ? "وصف ومطالعة الصور" : "Image AI Describer"}</span>
        </button>

        <button
          onClick={() => handleTabChange("ocr")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "ocr" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <FileText className="h-4 w-4" />
          <span>{lang === "ar" ? "قارئ النصوص الذكي OCR" : "OCR Text Extractor"}</span>
        </button>

        <button
          onClick={() => handleTabChange("remove_bg")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "remove_bg" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <Sparkles className="h-4 w-4" />
          <span>{lang === "ar" ? "إزالة وتفريغ الخلفية" : "Remove Background"}</span>
        </button>

        <button
          onClick={() => handleTabChange("compress")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "compress" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <Sliders className="h-4 w-4" />
          <span>{lang === "ar" ? "ضغط وتقليل حجم الصور" : "Image Compressor"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-start gap-3 justify-end text-right">
          <span className="font-semibold">{error}</span>
          <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0" />
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs flex items-start gap-3 justify-end text-right">
          <span className="font-semibold">{success}</span>
          <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Input specifications side (Left) */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-white/5 bg-neutral-900/60 backdrop-blur-xl relative overflow-hidden text-right space-y-5">
          <div className="absolute top-0 right-0 h-[2px] w-1/3 bg-gradient-to-r from-transparent to-red-500" />
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center justify-end gap-2">
              <span>{lang === "ar" ? "رفع صورة للتطبيق العملي" : "Upload File Input"}</span>
              <Upload className="h-5 w-5 text-red-400" />
            </h3>

            {/* Uploader Box drag drop */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-white/10 rounded-2xl hover:border-red-500/50 p-7 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer bg-neutral-950/40"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {selectedImage ? (
                <div className="text-center font-mono text-xs text-neutral-300">
                  <FileImage className="h-10 w-10 text-red-400 mx-auto mb-2" />
                  <p className="font-bold truncate max-w-[200px]">{imageFileName}</p>
                  <p className="text-[10px] text-neutral-500 mt-1">{t.originalSize}: {originalSize ? formatSize(originalSize) : "N/A"}</p>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-neutral-500" />
                  <div className="text-center">
                    <p className="text-xs font-bold text-white">{lang === "ar" ? "اسحب وأفلت صورتك هنا" : "Drag drop or browse files"}</p>
                    <p className="text-[10px] text-neutral-500 mt-1">{lang === "ar" ? "صيغ PNG, JPG, WebP حتي 12 ميجا" : "PNG, JPG up to 12MB"}</p>
                  </div>
                </>
              )}
            </div>

            {/* CONTROLS PER SUBTOOL */}
            {selectedImage && (
              <div className="space-y-4 pt-2">
                {/* Compress control */}
                {activeSubTool === "compress" && (
                  <div className="space-y-4">
                    {!isGenerated ? (
                      <button
                        onClick={() => {
                          // Instant and local! No full-page loaders, no setTimeouts!
                          setIsGenerated(true);
                          compressImage(true);
                        }}
                        className="w-full py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/15 transition-all"
                      >
                        <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                        <span>
                          {lang === "ar" ? "توليد خيار الأحجام والتحجيم الذكي ✨" : "Generate Custom Sizing & Quality ✨"}
                        </span>
                      </button>
                    ) : (
                      <div
                        className="space-y-4 border-t border-white/5 pt-4 text-right"
                      >
                        <div>
                          <h4 className="text-xs font-extrabold text-red-400 mb-2.5 block">
                            {lang === "ar" ? "⚙️ اختر المقاس المطلوب للصورة:" : "⚙️ Choose Desired Size Target:"}
                          </h4>
                        </div>

                        {/* Quick Sizing Presets Grid */}
                        <div className="grid grid-cols-2 gap-2 text-right">
                          <button
                            type="button"
                            onClick={() => handlePresetChange("original")}
                            className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center ${sizePreset === "original" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-neutral-950 border-white/5 text-neutral-400 hover:text-white"}`}
                          >
                            {lang === "ar" ? "المقاس الأصلي" : "Original Dimension"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePresetChange("fullhd")}
                            className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center ${sizePreset === "fullhd" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-neutral-950 border-white/5 text-neutral-400 hover:text-white"}`}
                          >
                            Full HD (1920)
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePresetChange("hd")}
                            className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center ${sizePreset === "hd" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-neutral-950 border-white/5 text-neutral-400 hover:text-white"}`}
                          >
                            HD (1280)
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePresetChange("square")}
                            className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center ${sizePreset === "square" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-neutral-950 border-white/5 text-neutral-400 hover:text-white"}`}
                          >
                            {lang === "ar" ? "مربع (1080x1080)" : "Square (1080)"}
                          </button>
                        </div>

                        {/* Aspect Ratio Constraint */}
                        <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300 bg-neutral-950 p-2.5 rounded-xl border border-white/5">
                          <label className="flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={keepAspectRatio}
                              onChange={(e) => {
                                setKeepAspectRatio(e.target.checked);
                                if (e.target.checked && aspectRatioValue) {
                                  setCustomHeight(Math.max(10, Math.round(customWidth / aspectRatioValue)));
                                }
                              }}
                              className="accent-red-500 rounded cursor-pointer"
                            />
                            <span>{lang === "ar" ? "الحفاظ على نسبة الأبعاد وتناسقها" : "Lock Aspect Ratio"}</span>
                          </label>
                          <span className="text-neutral-500">
                            {lang === "ar" ? "تناسب تلقائي" : "Auto aspect"}
                          </span>
                        </div>

                        {/* Numeric precise resize controls */}
                        <div className="grid grid-cols-2 gap-3 text-right">
                          <div className="space-y-1">
                            <label className="text-[10px] text-neutral-400 block">{lang === "ar" ? "الارتفاع (بكسل)" : "Height (px)"}</label>
                            <input
                              type="number"
                              value={customHeight}
                              onChange={(e) => handleHeightChange(Math.max(10, Number(e.target.value)))}
                              className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-white text-center focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-neutral-400 block">{lang === "ar" ? "العرض (بكسل)" : "Width (px)"}</label>
                            <input
                              type="number"
                              value={customWidth}
                              onChange={(e) => handleWidthChange(Math.max(10, Number(e.target.value)))}
                              className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-white text-center focus:outline-none focus:border-red-500"
                            />
                          </div>
                        </div>

                        {/* Compression Quality slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs font-semibold text-neutral-300">
                            <span className="font-mono text-red-400">{quality}%</span>
                            <label>{t.qualityLabel}</label>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="98"
                            value={quality}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            className="w-full accent-red-500 bg-neutral-950 h-2 rounded-full cursor-pointer"
                          />
                        </div>

                        {/* Direct Instant Download Trigger */}
                        <a
                          href={compressedImage || "#"}
                          download={`resized_${customWidth}x${customHeight}_${imageFileName}`}
                          onClick={(e) => {
                            if (!compressedImage) {
                              e.preventDefault();
                              compressImage(true);
                            }
                          }}
                          className="w-full py-3.5 bg-gradient-to-r from-red-655 to-amber-655 hover:from-red-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-red-655/15 text-center select-none"
                        >
                          <Download className="h-4.5 w-4.5" />
                          <span>{lang === "ar" ? "تحميل بنفس الأحجام المطلوبة ✅" : "Download with Requested Size ✅"}</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* OCR Text Extractor control */}
                {activeSubTool === "ocr" && (
                  <button
                    onClick={triggerOCR}
                    disabled={loading}
                    className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    <span>{t.btnOCR}</span>
                  </button>
                )}

                {/* Describe control */}
                {activeSubTool === "describe" && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 block">تركيز تفاصيل الموديل</label>
                      <select
                        value={focusArea}
                        onChange={(e) => setFocusArea(e.target.value)}
                        className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-neutral-200 text-right focus:outline-none"
                      >
                        <option value="general">فحص عام وشامل للعناصر</option>
                        <option value="colors_lighting">الألوان، الظلال، ودرجة الإضاءة</option>
                        <option value="emotions_story">العواطف، الرسومات الحية والسيناريو</option>
                        <option value="text_ocr">مطابقة النصوص والشعارات بداخلها</option>
                      </select>
                    </div>
                    <button
                      onClick={triggerDescription}
                      disabled={loading}
                      className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      <span>{t.btnDescribe}</span>
                    </button>
                  </div>
                )}

                {/* Remove Background Control */}
                {activeSubTool === "remove_bg" && (
                  <div className="space-y-4">
                    <div className="space-y-1.5 text-right">
                      <label className="text-xs font-semibold text-neutral-300 block">لون الخلفية المستهدفة للإزالة</label>
                      <select
                        value={chromaColor}
                        onChange={(e) => setChromaColor(e.target.value)}
                        className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-neutral-200 text-right focus:outline-none"
                      >
                        <option value="auto">تلقائي (فحص زوايا الصورة)</option>
                        <option value="#ffffff">خلفية بيضاء / فاتحة (منتجات وشعارات)</option>
                        <option value="#000000">خلفية سوداء / داكنة</option>
                        <option value="#00ff00">خلفية كروما خضراء</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 text-right">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-red-400 font-mono font-bold">{chromaTolerance}</span>
                        <label className="font-semibold text-neutral-300">(Tolerance) قوة التسامح والتطابق</label>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="150"
                        value={chromaTolerance}
                        onChange={(e) => setChromaTolerance(Number(e.target.value))}
                        className="w-full h-1 bg-neutral-950 rounded-lg appearance-none cursor-pointer accent-red-500"
                      />
                    </div>

                    <div className="space-y-1.5 text-right">
                      <label className="text-xs font-semibold text-neutral-300 block">استبدال الخلفية المفتوحة بـ</label>
                      <div className="grid grid-cols-4 gap-2">
                        {(["transparent", "white", "black", "green"] as const).map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setBgReplacementColor(col)}
                            className={`p-1.5 rounded-lg border text-[10px] text-center font-bold transition-all ${bgReplacementColor === col ? "border-red-500 text-red-400 bg-red-500/10" : "border-white/5 text-neutral-400 bg-neutral-950 hover:text-white"}`}
                          >
                            {col === "transparent" ? "شفاف" : col === "white" ? "أبيض" : col === "black" ? "أسود" : "أخضر"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={processRemoveBackground}
                      disabled={loading}
                      className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/10"
                    >
                      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      <span>تفريغ وعزل الخلفية الآن</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Output presentation side (Right) */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-[440px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center h-full flex-grow p-8 border border-white/5 bg-neutral-900/30 rounded-2xl gap-4"
              >
                <RefreshCw className="h-10 w-10 text-red-500 animate-spin" />
                <div>
                  <h4 className="font-bold text-white">{lang === "ar" ? "يعمل الموديل والذكاء الاصطناعي الآن..." : "AI Engine operating..."}</h4>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xs">{lang === "ar" ? "جاري القيام بالعملية الصعبة وتعديل الرندر الفوري لتوليد المخرجات الصفرية." : "Synthesizing pixels and translating neural patterns..."}</p>
                </div>
              </motion.div>
            ) : compressedImage && activeSubTool === "compress" ? (
              <motion.div
                key="compress-out"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl border border-white/5 bg-neutral-900/40 text-right space-y-5 flex-grow"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="bg-red-500/10 text-red-400 font-mono text-[10px] px-2.5 py-1 rounded-lg border border-red-500/10 direction-ltr">
                    {customWidth} × {customHeight} px
                  </span>
                  <h4 className="font-bold text-white text-md">معالجة ضغط وتعديل الصورة بنجاح</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-white/5 bg-neutral-950 p-3 rounded-xl">
                    <span className="text-[10px] text-neutral-500 block">{t.originalSize}</span>
                    <span className="text-xs font-bold font-mono text-neutral-300">{formatSize(originalSize || 0)}</span>
                  </div>
                  <div className="border border-white/10 bg-red-500/5 p-3 rounded-xl">
                    <span className="text-[10px] text-neutral-500 block">{t.compressedSize}</span>
                    <span className="text-xs font-bold font-mono text-red-400">{formatSize(compressedSize || 0)}</span>
                  </div>
                </div>

                <div className="aspect-video relative rounded-xl overflow-hidden border border-white/10">
                  <img src={compressedImage} className="w-full h-full object-cover" alt="Compressed Preview" referrerPolicy="no-referrer" />
                </div>

                <a
                  href={compressedImage}
                  download={`resized_${customWidth}x${customHeight}_${imageFileName}`}
                  className="w-full py-3 bg-red-500 hover:bg-red-400 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-red-500/15"
                >
                  <Download className="h-4 w-4" />
                  <span>تنزيل الصورة بالأبعاد والضغط الجديد</span>
                </a>
              </motion.div>
            ) : ocrResult && activeSubTool === "ocr" ? (
              <motion.div
                key="ocr-code-out"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border border-white/5 bg-neutral-900/40 text-right space-y-4 flex-grow"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <button
                    onClick={handleCopyOCRText}
                    className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-white font-semibold cursor-pointer"
                  >
                    {copiedText ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedText ? t.copied : t.copyText}</span>
                  </button>
                  <h4 className="font-bold text-white">النصوص المستخرجة بالكامل</h4>
                </div>
                <textarea
                  readOnly
                  value={ocrResult}
                  className="w-full bg-neutral-950/70 border border-white/5 rounded-xl p-4 text-xs font-sans text-neutral-300 leading-relaxed focus:outline-none h-60 text-right resize-none select-all"
                />
              </motion.div>
            ) : descriptionResult && activeSubTool === "describe" ? (
              <motion.div
                key="describe-out"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border border-white/5 bg-neutral-900/40 text-right space-y-4 flex-grow"
              >
                <h4 className="font-bold text-white border-b border-white/10 pb-3 mb-2">وصف وتحليل وتكوين الصورة</h4>
                <div className="text-xs text-neutral-300 leading-relaxed space-y-3">
                  {descriptionResult.split("\n").map((line, idx) => {
                    const trimmed = line.trim();
                    if (trimmed.startsWith("###") || trimmed.startsWith("##")) {
                      return <p key={idx} className="font-bold text-red-400 text-sm mt-3">{trimmed.replace(/#/g, "")}</p>;
                    }
                    if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
                      return <p key={idx} className="pr-3 text-neutral-400">• {trimmed.substring(1).trim()}</p>;
                    }
                    return <p key={idx}>{trimmed}</p>;
                  })}
                </div>
              </motion.div>
            ) : removedBgImage && activeSubTool === "remove_bg" ? (
              <motion.div
                key="remove-bg-out"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl border border-white/5 bg-neutral-900/40 text-right space-y-5 flex-grow"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="bg-red-500/10 text-red-400 font-mono text-[10px] px-2.5 py-1 rounded-lg border border-red-500/10 direction-ltr">
                    PNG Transparency Active
                  </span>
                  <h4 className="font-bold text-white text-md">تم عزل وتفريغ الخلفية بنجاح</h4>
                </div>
                
                <div className="aspect-video relative rounded-xl overflow-hidden border border-white/10 flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjM2MzYzNjIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMzYzNjM2MiLz48L3N2Zz4=')]">
                  <img src={removedBgImage} className="max-h-full max-w-full m-auto h-auto object-contain block relative z-10" alt="Isolated Cutout Preview" referrerPolicy="no-referrer" />
                </div>

                <a
                  href={removedBgImage}
                  download={`cutout_${imageFileName || "transparent"}.png`}
                  className="w-full py-3 bg-red-500 hover:bg-red-400 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-red-500/15"
                >
                  <Download className="h-4 w-4" />
                  <span>تنزيل الصورة مفرغة بصيغة PNG الشفافة</span>
                </a>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="flex flex-col items-center justify-center text-center h-full flex-grow p-10 border border-white/5 bg-neutral-900/30 rounded-2xl text-neutral-500"
              >
                <FileImage className="h-12 w-12 text-neutral-700 mb-3" />
                <h4 className="text-sm font-semibold text-neutral-300">{lang === "ar" ? "بانتظار صورتك" : "Waiting for raw image file"}</h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
                  {lang === "ar" 
                    ? "قم برفع صورة تزيد من روعتها لتبدأ التعديلات والضغط وضغط الجودة الفوري." 
                    : "Upload an image to start resizing, compressing, and extracting text."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
