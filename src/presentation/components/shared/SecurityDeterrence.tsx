"use client";

import { useEffect } from "react";

/**
 * SecurityDeterrence Component
 * 
 * Provides "Best Effort" protection against:
 * 1. Source Code Inspection (Disables Right-Click, F12, Ctrl+Shift+I, etc.)
 * 2. Unauthorized Screenshots (Blurs content on focus loss / print attempts)
 * 3. Text Scraping (Prevents text selection across the platform)
 */
export default function SecurityDeterrence() {
  useEffect(() => {
    // 1. Disable Context Menu (Right Click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Disable Common DevTools and System Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12
      if (e.key === "F12") {
        e.preventDefault();
      }
      // Disable Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+U (View Source)
      // Disable Ctrl+S (Save), Ctrl+P (Print)
      if (
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && (e.key === "u" || e.key === "s" || e.key === "p"))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Disable Drag and Drop (Prevents saving images/content by dragging)
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // 3. Focus-Loss & Screenshot Deterrence (The "Blackout" Protocol)
    const showOverlay = () => {
      let overlay = document.getElementById("security-shield-overlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "security-shield-overlay";
        overlay.innerHTML = `
          <div style="text-align: center; color: #ef4444; font-family: monospace;">
            <h2 style="margin-bottom: 10px;">[ SECURITY INTERCEPT ]</h2>
            <p>PROTECTED CONTENT: SCREENSHOTS & EXTERNAL CAPTURE PROHIBITED</p>
            <p style="font-size: 12px; margin-top: 20px; color: #64748b;">System Node: Encrypted Handshake Active</p>
          </div>
        `;
        Object.assign(overlay.style, {
          position: "fixed",
          top: "0",
          left: "0",
          width: "100vw",
          height: "100vh",
          backgroundColor: "#020617",
          zIndex: "999999",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(20px)",
          transition: "opacity 0.2s ease-in-out",
        });
        document.body.appendChild(overlay);
      }
      overlay.style.opacity = "1";
      overlay.style.pointerEvents = "all";
      document.body.style.filter = "blur(15px)";
    };

    const hideOverlay = () => {
      const overlay = document.getElementById("security-shield-overlay");
      if (overlay) {
        overlay.style.opacity = "0";
        overlay.style.pointerEvents = "none";
      }
      document.body.style.filter = "none";
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") showOverlay();
      else hideOverlay();
    };

    // Listen for PrintScreen key (System-dependent)
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        showOverlay();
        // Clear clipboard (best effort)
        navigator.clipboard.writeText("Access Denied: Protected Content Captured");
      }
    };

    // Attach Listeners
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("dragstart", handleDragStart);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", showOverlay);
    window.addEventListener("focus", hideOverlay);

    // Add Global CSS for text selection and print protection
    const style = document.createElement("style");
    style.innerHTML = `
      /* Prevent text selection and long-press menus */
      * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
      }

      /* Re-enable selection for inputs and textareas */
      input, textarea {
        -webkit-user-select: auto;
        -moz-user-select: auto;
        -ms-user-select: auto;
        user-select: auto;
        -webkit-touch-callout: default;
      }

      /* Hide content when printing (prevents some screenshot tools) */
      @media print {
        body {
          display: none !important;
        }
      }

      /* Prevent image "Save as" ghosting on drag */
      img {
        -webkit-user-drag: none;
        pointer-events: none;
      }

      /* Block screen recording hints (Supported in some environments) */
      video {
        filter: brightness(0);
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", showOverlay);
      window.removeEventListener("focus", hideOverlay);
      document.head.removeChild(style);
      const overlay = document.getElementById("security-shield-overlay");
      if (overlay) document.body.removeChild(overlay);
    };
  }, []);

  return null; // This component doesn't render anything visible
}
