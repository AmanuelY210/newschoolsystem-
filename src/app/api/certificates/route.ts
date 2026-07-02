import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/certificates - list certificates
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    const certificateType = searchParams.get('certificateType')

    const where: any = {}
    if (studentId) where.studentId = studentId
    if (certificateType) where.certificateType = certificateType

    // Students only see their own certificates
    if (user.role === 'student') {
      const student = await db.student.findUnique({ where: { userId: user.id } })
      if (!student) return NextResponse.json({ certificates: [] })
      where.studentId = student.id
    }

    const certificates = await db.certificate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ certificates })
  } catch (error) {
    console.error('GET /api/certificates error:', error)
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 })
  }
}

// POST /api/certificates - create certificate (permission: certificate.create)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'certificate.create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { studentId, studentName, certificateType, title, description, signedBy } = body

    if (!studentName || !title) {
      return NextResponse.json(
        { error: 'Missing required fields (studentName, title)' },
        { status: 400 }
      )
    }

    // Generate certificateNumber: CERT-YYYY-XXXX
    const count = await db.certificate.count()
    const year = new Date().getFullYear()
    const certificateNumber = `CERT-${year}-${String(count + 1).padStart(4, '0')}`

    const certificate = await db.certificate.create({
      data: {
        studentId: studentId || null,
        studentName,
        certificateType: certificateType || 'completion',
        title,
        description: description || null,
        certificateNumber,
        signedBy: signedBy || null,
      },
    })

    return NextResponse.json({ certificate }, { status: 201 })
  } catch (error) {
    console.error('POST /api/certificates error:', error)
    return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 })
  }
}
