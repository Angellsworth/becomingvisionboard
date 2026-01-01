"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
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

export function AnnualCollage() {
  const [images, setImages] = useState<CollageImage[]>([])
  const [annualTheme, setAnnualTheme] = useState("Transformation")
  const [isDragging, setIsDragging] = useState(false)
  const [editingTheme, setEditingTheme] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
    if (files.length > 0) {
      addImages(files)
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) => file.type.startsWith("image/"))
    if (files.length > 0) {
      addImages(files)
    }
  }, [])

  const addImages = (files: File[]) => {
    files.forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage: CollageImage = {
          id: `${Date.now()}-${index}`,
          url: e.target?.result as string,
          x: Math.random() * 60 + 10,
          y: Math.random() * 60 + 10,
          width: Math.random() * 15 + 15,
          height: Math.random() * 15 + 15,
          rotation: Math.random() * 10 - 5,
          zIndex: images.length + index,
        }
        setImages((prev) => [...prev, newImage])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const updateImagePosition = (id: string, x: number, y: number) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, x: Math.max(0, Math.min(85, x)), y: Math.max(0, Math.min(85, y)) } : img,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-paper via-grape-soda/10 to-pacific-blue/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl font-light tracking-wide text-ink">
            BECOMING 2026
          </h1>
          {editingTheme ? (
            <input
              type="text"
              value={annualTheme}
              onChange={(e) => setAnnualTheme(e.target.value)}
              onBlur={() => setEditingTheme(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingTheme(false)}
              className="text-center font-serif text-2xl sm:text-3xl font-light text-dusk-blue bg-transparent border-b-2 border-silver focus:border-pacific-blue outline-none px-4 py-2 max-w-md mx-auto"
              autoFocus
            />
          ) : (
            <p
              onClick={() => setEditingTheme(true)}
              className="font-serif text-2xl sm:text-3xl font-light text-grape-soda cursor-pointer hover:text-dusk-blue transition-colors"
            >
              {annualTheme}
            </p>
          )}
        </div>

        {/* Collage Canvas */}
        <div
          ref={canvasRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative w-full aspect-[16/10] rounded-lg overflow-hidden transition-all",
            isDragging
              ? "bg-pacific-blue/20 border-2 border-dashed border-dusk-blue"
              : "bg-gradient-to-br from-grape-soda/10 via-paper to-pacific-blue/10 border border-silver/30",
          )}
        >
          {images.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-dusk-blue/70">
              <Upload className="w-16 h-16" />
              <div className="text-center space-y-2">
                <p className="font-serif text-2xl">Drag images here</p>
                <p className="text-sm">or click to upload</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-dusk-blue text-white rounded-md hover:bg-pacific-blue transition-colors font-medium"
              >
                Choose Images
              </button>
            </div>
          )}

          {/* Collage Images */}
          {images.map((image) => (
            <CollageImageComponent
              key={image.id}
              image={image}
              onRemove={removeImage}
              onUpdatePosition={updateImagePosition}
            />
          ))}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Add More Images Button */}
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

        {/* Instructions */}
        <div className="mt-12 text-center text-grape-soda text-sm space-y-2">
          <p>Create your visual vision for the year ahead</p>
          <p className="text-xs">Drag images to rearrange • Click × to remove</p>
        </div>
      </div>
    </div>
  )
}

interface CollageImageComponentProps {
  image: CollageImage
  onRemove: (id: string) => void
  onUpdatePosition: (id: string, x: number, y: number) => void
}

function CollageImageComponent({ image, onRemove, onUpdatePosition }: CollageImageComponentProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragStartPos = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLButtonElement) return
    setIsDragging(true)
    dragStartPos.current = {
      x: e.clientX - (image.x * e.currentTarget.parentElement!.offsetWidth) / 100,
      y: e.clientY - (image.y * e.currentTarget.parentElement!.offsetHeight) / 100,
    }
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return
      const parent = document.querySelector("[data-collage-canvas]")
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const x = ((e.clientX - dragStartPos.current.x) / rect.width) * 100
      const y = ((e.clientY - dragStartPos.current.y) / rect.height) * 100
      onUpdatePosition(image.id, x, y)
    },
    [isDragging, image.id, onUpdatePosition],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div
      data-collage-canvas
      className={cn("absolute group cursor-move transition-shadow", isDragging ? "z-50 shadow-2xl" : "")}
      style={{
        left: `${image.x}%`,
        top: `${image.y}%`,
        width: `${image.width}%`,
        height: `${image.height}%`,
        transform: `rotate(${image.rotation}deg)`,
        zIndex: isDragging ? 1000 : image.zIndex,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img
        src={image.url || "/placeholder.svg"}
        alt="Collage"
        className="w-full h-full object-cover rounded-sm shadow-lg"
        draggable={false}
      />
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove(image.id)
        }}
        className="absolute -top-2 -right-2 w-6 h-6 bg-vintage-berry text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-vintage-berry/80"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
