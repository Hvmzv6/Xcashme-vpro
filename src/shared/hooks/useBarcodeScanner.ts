/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Hardware Keyboard Wedge Barcode Scanner Hook
 */

import { useEffect, useRef } from "react";

interface BarcodeScannerOptions {
  onScan: (barcode: string) => void;
  minChars?: number;
  maxKeyIntervalMs?: number;
}

export function useBarcodeScanner({
  onScan,
  minChars = 4,
  maxKeyIntervalMs = 60
}: BarcodeScannerOptions) {
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // If time interval between keystrokes is too large, reset the scanner buffer
      if (timeDiff > maxKeyIntervalMs && bufferRef.current.length > 0) {
        bufferRef.current = "";
      }

      // Ignore modifiers and non-character keys (except Enter)
      if (e.key === "Enter") {
        if (bufferRef.current.length >= minChars) {
          const scannedCode = bufferRef.current.trim();
          bufferRef.current = "";
          
          // Prevent Enter from triggering random buttons if we detected a rapid scan
          if (timeDiff <= maxKeyIntervalMs) {
            e.preventDefault();
            e.stopPropagation();
          }

          onScan(scannedCode);
          return;
        }
        bufferRef.current = "";
        return;
      }

      // Buffer printable single characters (digits, letters, dashes)
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // If focused inside a text input or textarea, only treat as hardware scan if keystroke interval is extremely rapid (< 35ms)
        const target = e.target as HTMLElement;
        const isInputFocused = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");

        if (isInputFocused && timeDiff > 35 && bufferRef.current.length === 0) {
          // Normal human typing inside an input box -> let standard input handle it
          return;
        }

        bufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [onScan, minChars, maxKeyIntervalMs]);
}
