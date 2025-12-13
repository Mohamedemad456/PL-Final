// Role: UI Developer
// Developer: Mohamed Emad
"use client"

import { useEffect, useState } from "react"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const [hasToasts, setHasToasts] = useState(false)

  useEffect(() => {
    const checkToasts = () => {
      // Wait a bit for DOM to update
      setTimeout(() => {
        const toaster = document.querySelector('[data-sonner-toaster]')
        const toasts = toaster?.querySelectorAll('[data-sonner-toast]')
        setHasToasts((toasts?.length ?? 0) > 0)
      }, 50)
    }

    // Check initially after mount
    const timeout = setTimeout(checkToasts, 100)

    // Watch for toast changes
    const observer = new MutationObserver(checkToasts)
    
    // Observe the document body for toast additions
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      clearTimeout(timeout)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      {hasToasts && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998] transition-opacity animate-in fade-in"
          onClick={() => {
            // Close all toasts when clicking backdrop
            const toasts = document.querySelectorAll('[data-sonner-toast]')
            toasts.forEach((toast) => {
              const closeButton = toast.querySelector('[data-close-button]') as HTMLElement
              closeButton?.click()
            })
          }}
        />
      )}
      <Sonner
        theme="light"
        className="toaster group"
        closeButton
        icons={{
          success: <CircleCheckIcon className="size-4" />,
          info: <InfoIcon className="size-4" />,
          warning: <TriangleAlertIcon className="size-4" />,
          error: <OctagonXIcon className="size-4" />,
          loading: <Loader2Icon className="size-4 animate-spin" />,
        }}
        style={
          {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
            "--border-radius": "var(--radius)",
          } as React.CSSProperties
        }
        {...props}
      />
    </>
  )
}

export { Toaster }
