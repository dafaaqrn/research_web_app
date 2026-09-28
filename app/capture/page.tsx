'use client'

import { useState, useEffect, useRef } from 'react'

const INTERVAL_DETIK = 30 // ganti angka ini untuk ubah jeda antar capture

export default function CapturePage() {
  const [status, setStatus] = useState<string>('')
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [successCount, setSuccessCount] = useState(0)
  const [countdown, setCountdown] = useState(INTERVAL_DETIK)
  const [aktif, setAktif] = useState(true)
  const loadingRef = useRef(false) // cegah capture dobel

  async function handleCapture() {
    if (loadingRef.current) return // kalau masih proses, skip
    loadingRef.current = true
    setLoading(true)
    setPreview(null)
    setStatus('Meminta izin lokasi...')

    // 1. Ambil lokasi
    let latitude = null, longitude = null, accuracy = null
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      )
      latitude = pos.coords.latitude
      longitude = pos.coords.longitude
      accuracy = pos.coords.accuracy
      setStatus(`Lokasi didapat ✅ (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`)
    } catch (e) {
      setStatus('Lokasi ditolak ❌, lanjut ke kamera...')
    }

    // 2. Ambil foto
    setStatus(prev => prev + '\nMeminta izin kamera...')
    let photo = null
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      })
      const video = document.createElement('video')
      video.srcObject = stream
      video.autoplay = true
      await new Promise(r => (video.onloadedmetadata = r))
      await new Promise(r => setTimeout(r, 800))
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d')!.drawImage(video, 0, 0)
      photo = canvas.toDataURL('image/jpeg', 0.8)
      stream.getTracks().forEach(t => t.stop())
      setPreview(photo)
      setStatus(prev => prev + '\nFoto diambil ✅')
    } catch (e) {
      setStatus(prev => prev + '\nKamera ditolak ❌')
    }

    // 3. Kirim ke API
    setStatus(prev => prev + '\nMengirim data ke server...')
    try {
      const res = await fetch('/api/captures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude, longitude, accuracy, photo,
          userAgent: navigator.userAgent,
        }),
      })
      if (res.ok) {
        setStatus(prev => prev + '\nTersimpan ✅')
        setSuccessCount(prev => prev + 1)
      } else {
        setStatus(prev => prev + '\nGagal simpan ❌')
      }
    } catch (e) {
      setStatus(prev => prev + '\nError koneksi ❌')
    }

    loadingRef.current = false
    setLoading(false)
    setCountdown(INTERVAL_DETIK) // reset countdown
  }

  // Auto-start saat halaman dibuka + interval pengulangan
  useEffect(() => {
    if (!aktif) return

    // Langsung capture pertama kali
    handleCapture()

    // Interval capture berikutnya
    const captureInterval = setInterval(() => {
      handleCapture()
    }, INTERVAL_DETIK * 1000)

    // Countdown timer (update setiap 1 detik)
    const countdownInterval = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? INTERVAL_DETIK : prev - 1))
    }, 1000)

    return () => {
      clearInterval(captureInterval)
      clearInterval(countdownInterval)
    }
  }, [aktif])

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">📍 Capture</h1>
          <p className="text-gray-400 text-sm mt-1">
            {aktif ? 'Berjalan otomatis...' : 'Dihentikan'}
          </p>
          {successCount > 0 && (
            <p className="text-green-400 text-sm mt-1">
              ✅ {successCount}x berhasil dikirim
            </p>
          )}
        </div>

        {/* Countdown */}
        {aktif && !loading && (
          <div className="text-center">
            <p className="text-gray-400 text-sm">Capture berikutnya dalam</p>
            <p className="text-4xl font-bold text-blue-400">{countdown}s</p>
          </div>
        )}

        {/* Status loading */}
        {loading && (
          <div className="text-center text-blue-400 text-sm animate-pulse">
            ⏳ Sedang memproses...
          </div>
        )}

        {/* Tombol pause/resume */}
        <button
          onClick={() => setAktif(prev => !prev)}
          className={`w-full py-3 rounded-xl font-semibold text-lg transition ${
            aktif
              ? 'bg-red-700 hover:bg-red-600'
              : 'bg-green-700 hover:bg-green-600'
          }`}
        >
          {aktif ? '⏸ Pause' : '▶️ Resume'}
        </button>

        {/* Tombol manual */}
        <button
          onClick={handleCapture}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
        >
          📸 Capture Sekarang
        </button>

        {/* Status log */}
        {status !== '' && (
          <div className="bg-gray-800 rounded-xl p-4 text-sm text-gray-300 whitespace-pre-line">
            {status}
          </div>
        )}

        {/* Preview foto */}
        {preview && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Preview terakhir:</p>
            <img src={preview} alt="preview" className="w-full rounded-xl object-cover" />
          </div>
        )}
      </div>
    </main>
  )
}