import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { getPageData } from '@/lib/cms-schema'

// GET /api/cms/[slug] - get page by slug (public)
// Returns page with parsed `data` JSON (merged with defaults)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const page = await db.cMSPage.findUnique({ where: { slug } })

    // If page doesn't exist in DB, return defaults from schema
    if (!page) {
      const defaultData = getPageData(slug)
      if (Object.keys(defaultData).length > 0) {
        return NextResponse.json({
          page: {
            slug,
            title: slug.charAt(0).toUpperCase() + slug.slice(1),
            content: '',
            data: defaultData,
            bannerImage: null,
            metaDescription: null,
            published: true,
          },
        })
      }
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // If unpublished, only super_admin can view
    if (!page.published) {
      const user = await getCurrentUser()
      if (!user || user.role !== 'super_admin') {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 })
      }
    }

    // Parse data JSON and merge with defaults
    let parsedData: any = null
    if (page.data) {
      try {
        parsedData = JSON.parse(page.data)
      } catch {
        parsedData = null
      }
    }

    // Deep merge with defaults
    const defaultData = getPageData(slug)
    const mergedData = deepMerge(defaultData, parsedData || {})

    return NextResponse.json({
      page: {
        ...page,
        data: mergedData,
      },
    })
  } catch (error) {
    console.error('GET /api/cms/[slug] error:', error)
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 })
  }
}

// PUT /api/cms/[slug] - update page (super_admin only)
// Body can include: title, content, data (object), bannerImage, metaDescription, published
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { slug } = await params
    const body = await req.json()

    // Serialize data to JSON string if provided as object
    const dataString = body.data ? (typeof body.data === 'string' ? body.data : JSON.stringify(body.data)) : undefined

    // Upsert: create page if it doesn't exist
    const existing = await db.cMSPage.findUnique({ where: { slug } })

    const updateData: any = {
      title: body.title,
      content: body.content,
      bannerImage: body.bannerImage,
      metaDescription: body.metaDescription,
      published: body.published !== undefined ? Boolean(body.published) : undefined,
    }
    if (dataString !== undefined) {
      updateData.data = dataString
    }

    let page
    if (existing) {
      page = await db.cMSPage.update({
        where: { slug },
        data: updateData,
      })
    } else {
      // Create new page
      page = await db.cMSPage.create({
        data: {
          slug,
          title: body.title || slug.charAt(0).toUpperCase() + slug.slice(1),
          content: body.content || '',
          data: dataString || null,
          bannerImage: body.bannerImage || null,
          metaDescription: body.metaDescription || null,
          published: body.published !== undefined ? Boolean(body.published) : true,
        },
      })
    }

    // Return with parsed data
    let parsedData: any = null
    if (page.data) {
      try {
        parsedData = JSON.parse(page.data)
      } catch {
        parsedData = null
      }
    }

    return NextResponse.json({
      page: {
        ...page,
        data: parsedData || getPageData(slug),
      },
    })
  } catch (error) {
    console.error('PUT /api/cms/[slug] error:', error)
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
  }
}

// Deep merge two objects
function deepMerge(target: any, source: any): any {
  if (typeof target !== 'object' || target === null) return source
  if (typeof source !== 'object' || source === null) return source
  if (Array.isArray(target) || Array.isArray(source)) {
    // For arrays, use source if it exists and has items, otherwise target
    return Array.isArray(source) && source.length > 0 ? source : target
  }

  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] !== undefined && source[key] !== null) {
      if (typeof target[key] === 'object' && typeof source[key] === 'object') {
        result[key] = deepMerge(target[key], source[key])
      } else {
        result[key] = source[key]
      }
    }
  }
  return result
}
