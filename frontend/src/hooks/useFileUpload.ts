"use client";

import type { DragEvent } from "react";
import { useCallback, useRef, useState } from "react";

import { validateResumeFile } from "@/lib/validation";

export interface DropHandlers {
  readonly onDragEnter: (event: DragEvent<HTMLElement>) => void;
  readonly onDragOver: (event: DragEvent<HTMLElement>) => void;
  readonly onDragLeave: (event: DragEvent<HTMLElement>) => void;
  readonly onDrop: (event: DragEvent<HTMLElement>) => void;
}

export interface FileUpload {
  readonly file: File | null;
  readonly error: string | null;
  readonly isDragging: boolean;
  readonly isValidating: boolean;
  readonly selectFile: (file: File | undefined) => Promise<void>;
  readonly clear: () => void;
  readonly dropHandlers: DropHandlers;
}

export function useFileUpload(): FileUpload {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  // dragenter/dragleave fire for every child element; a counter avoids flicker.
  const dragDepth = useRef(0);

  const selectFile = useCallback(async (candidate: File | undefined) => {
    if (!candidate) return;
    setIsValidating(true);
    const result = await validateResumeFile(candidate);
    setIsValidating(false);
    if (result.ok) {
      setFile(candidate);
      setError(null);
    } else {
      setFile(null);
      setError(result.message);
    }
  }, []);

  const clear = useCallback(() => {
    setFile(null);
    setError(null);
  }, []);

  const dropHandlers: DropHandlers = {
    onDragEnter: (event) => {
      event.preventDefault();
      dragDepth.current += 1;
      setIsDragging(true);
    },
    onDragOver: (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: (event) => {
      event.preventDefault();
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setIsDragging(false);
    },
    onDrop: (event) => {
      event.preventDefault();
      dragDepth.current = 0;
      setIsDragging(false);
      if (event.dataTransfer.files.length > 1) {
        setError("Drop a single resume file.");
        return;
      }
      void selectFile(event.dataTransfer.files[0]);
    },
  };

  return { file, error, isDragging, isValidating, selectFile, clear, dropHandlers };
}
