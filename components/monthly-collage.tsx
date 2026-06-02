"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useYear } from "@/components/year-provider"
import { keys } from "@/lib/year"

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

interface MonthlyCollageProps {
  month: string
}

export function MonthlyCollage({ month }: MonthlyCollageProps) {
  const { year, ready } = useYear()
  const storageKey = keys.monthlyCollage(month, year)

  const [images, setImages] = useState<CollageImage[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ready) return
    setHydrated(false)
    try {
      const saved = localStorage.getItem(storageKey)
      setImages(saved ? JSON.parse(saved) : [])
    } catch {
      setImages([])
    }
    setHydrated(true)
  }, [storageKey, ready])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(storageKey, JSON.stringify(images))
  }, [images, storageKey, hydrated])

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
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"))
    if (files.length > 0) addImages(files)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"))
    if (files.length > 0) addImages(files)
    e.target.value = ""
  }, [])

  const addImages = (files: File[]) => {
    files.forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage: CollageImage = {
          id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
          url: e.target?.result as string,
          x: Math.random() * 55 + 10,
          y: Math.random() * 55 + 10,
          width: Math.random() * 12 + 20,
          height: Math.random() * 12 + 20,
          rotation: Math.random() * 8 - 4,
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
        img.id === id ? { ...img, x: Math.max(0, Math.min(80, x)), y: Math.max(0, Math.min(80, y)) } : img,
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
    <div>
      <h2 className="font-serif text-2xl sm:text-3xl font-light text-ink mb-4 sm:mb-6 text-center">Monthly Vision</h2>

      <div
        ref={canvasRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative w-full aspect-[16/9] rounded-lg overflow-hidden transition-all touch-none",
          isDragOver
            ? "bg-pacific-blue/20 border-2 border-dashed border-dusk-blue"
            : "bg-gradient-to-br from-grape-soda/15 via-paper to-pacific-blue/15 border border-silver/30",
        )}
      >
        {images.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 sm:gap-6 text-dusk-blue/70 px-4">
            <Upload className="w-10 h-10 sm:w-12 sm:h-12" />
            <div className="text-center space-y-1 sm:space-y-2">
              <p className="font-serif text-lg sm:text-xl">Create your monthly vision</p>
              <p className="text-sm">Drag images or tap to upload</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-dusk-blue text-white rounded-md hover:bg-pacific-blue transition-colors font-medium"
            >
              Add Images
            </button>
          </div>
        )}

        {images.map((image) => (
          <MonthlyCollageImage
            key={image.id}
            image={image}
            canvasRef={canvasRef}
            onRemove={removeImage}
            onUpdatePosition={updateImagePosition}
            onActivate={bringToFront}
          />
        ))}

        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileInput} className="hidden" />
      </div>

      {images.length > 0 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-transparent border border-grape-soda/40 text-dusk-blue rounded-md hover:bg-grape-soda/20 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Add More Images
          </button>
        </div>
      )}
    </div>
  )
}

interface MonthlyCollageImageProps {
  image: CollageImage
  canvasRef: React.RefObject<HTMLDivElement | null>
  onRemove: (id: string) => void
  onUpdatePosition: (id: string, x: number, y: number) => void
  onActivate: (id: string) => void
}

function MonthlyCollageImage({ image, canvasRef, onRemove, onUpdatePosition, onActivate }: MonthlyCollageImageProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragOffsetRef = useRef({ offsetX: 0, offsetY: 0 })

  const startDrag = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const px = ((clientX - rect.left) / rect.width) * 100
      const py = ((clientY - rect.top) / rect.height) * 100
      dragOffsetRef.current = { offsetX: px - image.x, offsetY: py - image.y }
      setIsDragging(true)
      onActivate(image.id)
    },
    [canvasRef, image.x, image.y, image.id, onActivate],
  )

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
        alt="Monthly collage"
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
