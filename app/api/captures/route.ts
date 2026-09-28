import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/captures → ambil semua data (untuk halaman admin)
export async function GET() {
  try {
    const captures = await prisma.capture.findMany({
      orderBy: { createdAt: 'desc' }, // terbaru di atas
    })
    return NextResponse.json(captures)
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengambil data' },
      { status: 500 }
    )
  }
}

// POST /api/captures → simpan data baru (dari HP)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const capture = await prisma.capture.create({
      data: {
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        accuracy: body.accuracy ?? null,
        photo: body.photo ?? null,
        userAgent: body.userAgent ?? null,
      },
    })

    return NextResponse.json(capture, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal menyimpan data' },
      { status: 500 }
    )
  }
}