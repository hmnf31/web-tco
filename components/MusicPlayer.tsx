"use client"

import { useState, useRef, useEffect } from "react"
import { Music, Play, Pause, SkipForward, SkipBack, ChevronDown, ExternalLink, Volume2, Volume1, VolumeX } from "lucide-react"

const PLAYLIST = [
  { title: "TCO Sang Juara", id: "mGbEFipbGIY" },
  { title: "TCO Jaya", id: "9DsfoepifYw" },
  { title: "TCO Skank Mate", id: "nEr8iAxTZJo" },
  { title: "TCO Void Checkmate", id: "LDDto59HZiI" },
]

export default function MusicPlayer() {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const [volume, setVolumeState] = useState(50)
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef(-1)
  const volumeSyncRef = useRef(false)

  useEffect(() => {
    if (playerRef.current && playerReady && !volumeSyncRef.current) {
      playerRef.current.setVolume(volume)
      volumeSyncRef.current = true
    }
  }, [playerReady, volume])

  function setVolume(v: number) {
    setVolumeState(v)
    if (playerRef.current) playerRef.current.setVolume(v)
  }

  useEffect(() => { indexRef.current = currentIndex }, [currentIndex])

  useEffect(() => {
    if (typeof window === "undefined" || (window as any).YT) return
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    document.head.appendChild(tag)
    ;(window as any).onYouTubeIframeAPIReady = () => {
      if (!containerRef.current) return
      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        height: "0",
        width: "0",
        playerVars: { autoplay: 0, controls: 0, modestbranding: 1, rel: 0 },
        events: {
          onReady: () => setPlayerReady(true),
          onStateChange: (e: any) => {
            if (e.data === 1) setIsPlaying(true)
            else if (e.data === 2) setIsPlaying(false)
            else if (e.data === 0) {
              const idx = indexRef.current
              const nextIdx = (idx + 1) % PLAYLIST.length
              if (nextIdx !== idx && playerRef.current) {
                playerRef.current.loadVideoById(PLAYLIST[nextIdx].id)
                setCurrentIndex(nextIdx)
              } else setIsPlaying(false)
            }
          },
        },
      })
    }
  }, [])

  function playSong(index: number) {
    if (index < 0 || index >= PLAYLIST.length || !playerReady || !playerRef.current) return
    setCurrentIndex(index)
    playerRef.current.loadVideoById(PLAYLIST[index].id)
    setIsPlaying(true)
  }

  function togglePlay() {
    if (!playerReady || !playerRef.current) return
    if (currentIndex < 0) { playSong(0); return }
    if (isPlaying) { playerRef.current.pauseVideo(); setIsPlaying(false) }
    else { playerRef.current.playVideo(); setIsPlaying(true) }
  }

  function next() { playSong((currentIndex + 1) % PLAYLIST.length) }
  function prev() { playSong((currentIndex - 1 + PLAYLIST.length) % PLAYLIST.length) }

  return (
    <div>
      <div className="fixed bottom-0 left-0 z-50 opacity-0 pointer-events-none h-0 w-0 overflow-hidden" aria-hidden="true">
        <div ref={containerRef} id="yt-player-container" />
      </div>

      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        {!isOpen && (
          <span className="animate-pulse whitespace-nowrap rounded-lg bg-slate-950/80 px-3 py-1.5 text-[10px] text-white/60 backdrop-blur-sm">
            Klik disini, untuk membuka musik player Playlist TCO!
          </span>
        )}
        <button onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-110"
          title={isOpen ? "Tutup Musik" : "Buka Musik"}>
          <Music className="h-4 w-4" />
        </button>
      </div>

      <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 border-t border-white/10 ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}>
        <div className="bg-slate-950/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-medium text-white/70">TCO Player</span>
                {!playerReady && <span className="text-[10px] text-white/30 italic">Loading...</span>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={prev}
                  className={`rounded-lg border p-1.5 text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400 ${currentIndex < 0 ? "pointer-events-none border-white/5 opacity-30" : "border-white/10"}`}>
                  <SkipBack className="h-3.5 w-3.5" />
                </button>
                <button onClick={togglePlay}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105">
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </button>
                <button onClick={next}
                  className={`rounded-lg border p-1.5 text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400 ${currentIndex < 0 ? "pointer-events-none border-white/5 opacity-30" : "border-white/10"}`}>
                  <SkipForward className="h-3.5 w-3.5" />
                </button>
                <div className="ml-2 flex items-center gap-1.5">
                  <button onClick={() => setVolume(volume > 0 ? 0 : 50)}
                    className="rounded-lg border border-white/10 p-1.5 text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400">
                    {volume === 0 ? <VolumeX className="h-3.5 w-3.5" /> : volume < 30 ? <Volume1 className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-20 h-1 accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
              <div className="text-right text-[10px] text-white/30 min-w-[40px]">
                {currentIndex >= 0 ? `${currentIndex + 1}/${PLAYLIST.length}` : `${PLAYLIST.length} lagu`}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {PLAYLIST.map((song, i) => (
                <button key={song.id} onClick={() => playSong(i)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                    currentIndex === i
                      ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-400"
                      : "border-white/5 text-white/50 hover:border-white/10 hover:text-white/70"
                  }`}>
                  <span className={`shrink-0 ${currentIndex === i && isPlaying ? "text-cyan-400" : "text-white/20"}`}>
                    {currentIndex === i && isPlaying ? "♪" : `#${i + 1}`}
                  </span>
                  <span className="flex-1 truncate">{song.title}</span>
                  <a href={`https://music.youtube.com/watch?v=${song.id}`} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 text-white/20 hover:text-cyan-400 transition-colors">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}