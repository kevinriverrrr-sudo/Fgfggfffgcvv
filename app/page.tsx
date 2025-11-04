"use client";

import { useState, useRef, useCallback } from "react";
import { FiUpload, FiDownload, FiTrash2, FiImage } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { removeBackground } from "@imgly/background-removal";

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    setError(null);
    setProcessedImage(null);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageDataUrl = e.target?.result as string;
      setOriginalImage(imageDataUrl);
      
      // Start processing
      setIsProcessing(true);
      setProgress(0);

      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 300);

        const blob = await removeBackground(imageDataUrl);
        clearInterval(progressInterval);
        setProgress(100);
        
        const url = URL.createObjectURL(blob);
        setProcessedImage(url);
      } catch (err) {
        console.error("Error removing background:", err);
        setError("Failed to remove background. Please try another image.");
      } finally {
        setIsProcessing(false);
        setProgress(0);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDownload = useCallback(() => {
    if (processedImage) {
      const link = document.createElement("a");
      link.href = processedImage;
      link.download = "background-removed.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [processedImage]);

  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setProcessedImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Header */}
      <header className="pt-8 pb-6 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Background Remover
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
            Remove backgrounds from your images instantly with AI technology
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!originalImage ? (
          // Upload Area
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 md:p-20 transition-all hover:shadow-3xl"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur-2xl opacity-30 animate-pulse-slow"></div>
                <div className="relative bg-gradient-to-r from-purple-500 to-blue-500 p-8 rounded-full">
                  <FiUpload className="w-16 h-16 text-white" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                  Drop your image here
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supports JPG, PNG, WEBP, and more formats
                </p>
              </div>
            </label>
          </div>
        ) : (
          // Image Processing Area
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                <FiTrash2 className="w-5 h-5" />
                Reset
              </button>
              {processedImage && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
                >
                  <FiDownload className="w-5 h-5" />
                  Download
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-4 mb-3">
                  <AiOutlineLoading3Quarters className="w-6 h-6 text-purple-600 animate-spin" />
                  <span className="text-lg font-semibold text-gray-800 dark:text-white">
                    Removing background...
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-600 dark:text-red-400 text-center">
                {error}
              </div>
            )}

            {/* Image Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original Image */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FiImage className="w-6 h-6" />
                    Original Image
                  </h3>
                </div>
                <div className="p-6">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {originalImage && (
                      <img
                        src={originalImage}
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Processed Image */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FiImage className="w-6 h-6" />
                    Background Removed
                  </h3>
                </div>
                <div className="p-6">
                  <div className="relative aspect-square rounded-xl overflow-hidden checkerboard">
                    {processedImage ? (
                      <img
                        src={processedImage}
                        alt="Processed"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <AiOutlineLoading3Quarters className="w-12 h-12 text-purple-600 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600 dark:text-gray-400">
        <p className="text-sm">
          Powered by AI • All processing happens in your browser • Your images stay private
        </p>
      </footer>
    </div>
  );
}
