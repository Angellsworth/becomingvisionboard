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

interface MonthlyCollageProps {
  month: string
}

export function MonthlyCollage({ month }: MonthlyCollageProps) {
  const [images, setImages] = useState<CollageImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load images from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`collage-${month}`)
    if (saved) {
      setImages(JSON.parse(saved))
    }
  }, [month])

  // Save images to localStorage
  useEffect(() => {
    if (images.length > 0) {
      localStorage.setItem(`collage-${month}`, JSON.stringify(images))
    }
  }, [images, month])

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
          width: Math.random() * 12 + 18,
          height: Math.random() * 12 + 18,
          rotation: Math.random() * 8 - 4,
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
        img.id === id ? { ...img, x: Math.max(0, Math.min(80, x)), y: Math.max(0, Math.min(80, y)) } : img,
      ),
    )
  }

  return (
    <div>
      <h2 className="font-serif text-3xl font-light text-ink mb-6 text-center">Monthly Vision</h2>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative w-full aspect-[16/9] rounded-lg overflow-hidden transition-all",
          isDragging
            ? "bg-pacific-blue/20 border-2 border-dashed border-dusk-blue"
            : "bg-gradient-to-br from-grape-soda/15 via-paper to-pacific-blue/15 border border-silver/30",
        )}
      >
        {images.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-dusk-blue/70">
            <Upload className="w-12 h-12" />
            <div className="text-center space-y-2">
              <p className="font-serif text-xl">Create your monthly vision</p>
              <p className="text-sm">Drag images or click to upload</p>
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
            onRemove={removeImage}
            onUpdatePosition={updateImagePosition}
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
  onRemove: (id: string) => void
  onUpdatePosition: (id: string, x: number, y: number) => void
}

function MonthlyCollageImage({ image, onRemove, onUpdatePosition }: MonthlyCollageImageProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragStartPos = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLButtonElement) return
    setIsDragging(true)
    const parent = e.currentTarget.parentElement
    if (!parent) return
    dragStartPos.current = {
      x: e.clientX - (image.x * parent.offsetWidth) / 100,
      y: e.clientY - (image.y * parent.offsetHeight) / 100,
    }
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return
      const parent = document.querySelector("[data-monthly-collage]")
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
      data-monthly-collage
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
        alt="Monthly collage"
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
