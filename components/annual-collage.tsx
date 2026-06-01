"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CollageImage {
  id: string
  url: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
}

const STORAGE_KEY = "collage-annual-2026"
const THEME_KEY = "annual-theme-2026"

export function AnnualCollage() {
  const [images, setImages] = useState<CollageImage[]>([])
  const [annualTheme, setAnnualTheme] = useState("Transformation")
  const [isDragOver, setIsDragOver] = useState(false)
  const [editingTheme, setEditingTheme] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedImages = localStorage.getItem(STORAGE_KEY)
      const savedTheme = localStorage.getItem(THEME_KEY)
      if (savedImages) setImages(JSON.parse(savedImages))
      if (savedTheme) setAnnualTheme(savedTheme)
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true)
  }, [])

  // Persist on change (after hydration so we don't overwrite saved data with defaults)
  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images))
  }, [images, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(THEME_KEY, annualTheme)
  }, [annualTheme, hydrated])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
    if (files.length > 0) addImages(files)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) => file.type.startsWith("image/"))
    if (files.length > 0) addImages(files)
    // reset so the same file can be re-selected
    e.target.value = ""
  }, [])

  const addImages = (files: File[]) => {
    files.forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage: CollageImage = {
          id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
          url: e.target?.result as string,
          x: Math.random() * 50 + 10,
          y: Math.random() * 50 + 10,
          width: Math.random() * 15 + 18,
          height: Math.random() * 15 + 18,
          rotation: Math.random() * 10 - 5,
          zIndex: 1,
        }
        setImages((prev) => [...prev, { ...newImage, zIndex: prev.length + 1 }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (id: string) => setImages((prev) => prev.filter((img) => img.id !== id))

  const updateImagePosition = useCallback((id: string, x: number, y: number) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, x: Math.max(0, Math.min(85, x)), y: Math.max(0, Math.min(85, y)) } : img,
      ),
    )
  }, [])

  const bringToFront = useCallback((id: string) => {
    setImages((prev) => {
      const max = prev.reduce((m, i) => Math.max(m, i.zIndex), 0)
      return prev.map((img) => (img.id === id ? { ...img, zIndex: max + 1 } : img))
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-paper via-grape-soda/10 to-pacific-blue/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-light tracking-wide text-ink">
            BECOMING 2026
          </h1>
          {editingTheme ? (
            <input
              type="text"
              value={annualTheme}
              onChange={(e) => setAnnualTheme(e.target.value)}
              onBlur={() => setEditingTheme(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingTheme(false)}
              className="text-center font-serif text-xl sm:text-3xl font-light text-dusk-blue bg-transparent border-b-2 border-silver focus:border-pacific-blue outline-none px-4 py-2 max-w-md mx-auto w-full"
              autoFocus
            />
          ) : (
            <p
              onClick={() => setEditingTheme(true)}
              className="font-serif text-xl sm:text-3xl font-light text-grape-soda cursor-pointer hover:text-dusk-blue transition-colors px-4"
            >
              {annualTheme}
            </p>
          )}
        </div>

        <div
          ref={canvasRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative w-full aspect-[16/10] rounded-lg overflow-hidden transition-all touch-none",
            isDragOver
              ? "bg-pacific-blue/20 border-2 border-dashed border-dusk-blue"
              : "bg-gradient-to-br from-grape-soda/10 via-paper to-pacific-blue/10 border border-silver/30",
          )}
        >
          {images.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 sm:gap-6 text-dusk-blue/70 px-4">
              <Upload className="w-12 h-12 sm:w-16 sm:h-16" />
              <div className="text-center space-y-1 sm:space-y-2">
                <p className="font-serif text-xl sm:text-2xl">Drag images here</p>
                <p className="text-sm">or tap to upload</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-dusk-blue text-white rounded-md hover:bg-pacific-blue transition-colors font-medium"
              >
                Choose Images
              </button>
            </div>
          )}

          {images.map((image) => (
            <CollageImageItem
              key={image.id}
              image={image}
              canvasRef={canvasRef}
              onRemove={removeImage}
              onUpdatePosition={updateImagePosition}
              onActivate={bringToFront}
            />
          ))}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {images.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-6 py-3 bg-dusk-blue text-white rounded-md hover:bg-pacific-blue transition-colors font-medium"
            >
              <Upload className="w-4 h-4" />
              Add More Images
            </button>
          </div>
        )}

        <div className="mt-10 sm:mt-12 text-center text-grape-soda text-sm space-y-2 px-4">
          <p>Create your visual vision for the year ahead</p>
          <p className="text-xs">Drag images to rearrange · Tap × to remove</p>
        </div>
      </div>
    </div>
  )
}

interface CollageImageItemProps {
  image: CollageImage
  canvasRef: React.RefObject<HTMLDivElement | null>
  onRemove: (id: string) => void
  onUpdatePosition: (id: string, x: number, y: number) => void
  onActivate: (id: string) => void
}

function CollageImageItem({ image, canvasRef, onRemove, onUpdatePosition, onActivate }: CollageImageItemProps) {
  const [isDragging, setIsDragging] = useState(false)
  // Offset between the pointer and the image's top-left corner, in canvas %.
  const dragOffsetRef = useRef({ offsetX: 0, offsetY: 0 })

  const startDrag = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      // pointer position in % of canvas
      const px = ((clientX - rect.left) / rect.width) * 100
      const py = ((clientY - rect.top) / rect.height) * 100
      dragOffsetRef.current = { offsetX: px - image.x, offsetY: py - image.y }
      setIsDragging(true)
      onActivate(image.id)
    },
    [canvasRef, image.x, image.y, image.id, onActivate],
  )

  // Mouse drag
  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const px = ((e.clientX - rect.left) / rect.width) * 100
      const py = ((e.clientY - rect.top) / rect.height) * 100
      onUpdatePosition(image.id, px - dragOffsetRef.current.offsetX, py - dragOffsetRef.current.offsetY)
    }
    const handleUp = () => setIsDragging(false)

    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const px = ((t.clientX - rect.left) / rect.width) * 100
      const py = ((t.clientY - rect.top) / rect.height) * 100
      onUpdatePosition(image.id, px - dragOffsetRef.current.offsetX, py - dragOffsetRef.current.offsetY)
    }
    const handleTouchEnd = () => setIsDragging(false)

    document.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseup", handleUp)
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)
    document.addEventListener("touchcancel", handleTouchEnd)
    return () => {
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseup", handleUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
      document.removeEventListener("touchcancel", handleTouchEnd)
    }
  }, [isDragging, canvasRef, image.id, onUpdatePosition])

  return (
    <div
      className={cn(
        "absolute group cursor-grab transition-shadow select-none",
        isDragging && "cursor-grabbing shadow-2xl",
      )}
      style={{
        left: `${image.x}%`,
        top: `${image.y}%`,
        width: `${image.width}%`,
        height: `${image.height}%`,
        transform: `rotate(${image.rotation}deg)`,
        zIndex: isDragging ? 1000 : image.zIndex,
        touchAction: "none",
      }}
      onMouseDown={(e) => {
        if (e.target instanceof HTMLButtonElement) return
        startDrag(e.clientX, e.clientY)
      }}
      onTouchStart={(e) => {
        if (e.target instanceof HTMLButtonElement) return
        const t = e.touches[0]
        if (t) startDrag(t.clientX, t.clientY)
      }}
    >
      <img
        src={image.url || "/placeholder.svg"}
        alt="Collage"
        className="w-full h-full object-cover rounded-sm shadow-lg pointer-events-none"
        draggable={false}
      />
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove(image.id)
        }}
        className="absolute -top-2 -right-2 w-7 h-7 bg-vintage-berry text-white rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-vintage-berry/80"
        aria-label="Remove image"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
