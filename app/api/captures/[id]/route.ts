import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.capture.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Berhasil dihapus' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal menghapus data' },
      { status: 500 }
    )
  }
}