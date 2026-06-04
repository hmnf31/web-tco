"use client"

import { useState, useRef } from "react"
import { Upload, Image as ImageIcon, X, Link } from "lucide-react"

interface ImageUploadProps {
  imageUrl: string
  imageCaption: string
  onImageUrlChange: (url: string) => void
  onImageCaptionChange: (caption: string) => void
}

export default function ImageUpload({ imageUrl, imageCaption, onImageUrlChange, onImageCaptionChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File terlalu besar. Maksimal 5MB.")
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      onImageUrlChange(data.url)
    } catch {
      alert("Gagal mengunggah. Gunakan URL sebagai alternatif.")
      setShowUrlInput(true)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white/70">Gambar Artikel</label>

      {imageUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/[0.03]">
          <img src={imageUrl} alt="Preview" className="w-full object-cover" style={{ aspectRatio: "16/9" }} />
          <button
            type="button"
            onClick={() => onImageUrlChange("")}
            className="absolute top-2 right-2 rounded-lg bg-black/60 p-1.5 text-white/70 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] py-12 transition-all hover:border-white/20"
          style={{ aspectRatio: "16/9", maxHeight: 300 }}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              <span className="text-xs text-white/40">Mengunggah...</span>
            </div>
          ) : (
            <>
              <Upload className="mb-2 h-8 w-8 text-white/30" />
              <p className="text-sm text-white/50">Seret gambar ke sini atau klik untuk memilih</p>
              <p className="mt-1 text-xs text-white/30">16:9 ratio, maks 5MB</p>
            </>
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={handleInputChange} className="hidden" />
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowUrlInput(!showUrlInput)}
        className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
      >
        <Link className="h-3 w-3" />
        {showUrlInput ? "Sembunyikan input URL" : "Atau masukkan URL gambar"}
      </button>

      {showUrlInput && (
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => onImageUrlChange(e.target.value)}
          placeholder="https://contoh.com/gambar.jpg"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/70 outline-none transition-all placeholder:text-white/20 focus:border-cyan-400/50"
        />
      )}

      <input
        type="text"
        value={imageCaption}
        onChange={(e) => onImageCaptionChange(e.target.value)}
        placeholder="Salin/rekat bila perlu → ©"
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/70 outline-none transition-all placeholder:text-white/20 focus:border-cyan-400/50"
      />
    </div>
  )
}
