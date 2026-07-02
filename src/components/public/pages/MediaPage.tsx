'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image as ImageIcon,
  Video,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface MediaItem {
  id: string
  title: string
  description?: string | null
  type: string
  url: string
  thumbnailUrl?: string | null
  category: string
  createdAt: string
}

interface MediaPageProps {
  type: 'photo' | 'video'
}

const PLACEHOLDER_PHOTOS: MediaItem[] = [
  {
    id: 'p1',
    title: 'Annual Science Fair',
    description: 'Students showcase innovative projects',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=70',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=70',
    category: 'event',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    title: 'Sports Day',
    description: 'Athletics and team spirit on display',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=70',
    thumbnailUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=70',
    category: 'sports',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    title: 'Graduation Ceremony',
    description: 'Celebrating the Class of 2024',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=70',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=70',
    category: 'graduation',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p4',
    title: 'Classroom Learning',
    description: 'Engaged and curious minds',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=70',
    thumbnailUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=70',
    category: 'classroom',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p5',
    title: 'Art Exhibition',
    description: 'Creative expressions from our students',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=70',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=70',
    category: 'event',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p6',
    title: 'Music Recital',
    description: 'Talented performances by our young musicians',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=900&q=70',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=900&q=70',
    category: 'event',
    createdAt: new Date().toISOString(),
  },
]

const PLACEHOLDER_VIDEOS: MediaItem[] = [
  {
    id: 'v1',
    title: 'School Tour',
    description: 'Take a walk through our beautiful campus',
    type: 'video',
    url: 'https://www.youtube.com/embed/1roy5aZ8t5c',
    thumbnailUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=70',
    category: 'general',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'v2',
    title: 'Annual Day Highlights',
    description: 'A celebration of talent and achievement',
    type: 'video',
    url: 'https://www.youtube.com/embed/LXb3EKWsInQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=70',
    category: 'event',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'v3',
    title: 'Sports Highlights',
    description: 'Thrilling moments from the season',
    type: 'video',
    url: 'https://www.youtube.com/embed/2Vv-BfVoq4g',
    thumbnailUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=70',
    category: 'sports',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'v4',
    title: 'Student Voices',
    description: 'What our students say about us',
    type: 'video',
    url: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=900&q=70',
    category: 'general',
    createdAt: new Date().toISOString(),
  },
]

const CATEGORY_TABS = [
  { value: 'all', label: 'All' },
  { value: 'event', label: 'Events' },
  { value: 'sports', label: 'Sports' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'classroom', label: 'Classroom' },
  { value: 'general', label: 'General' },
]

function getYouTubeId(url: string): string | null {
  // Accept embed url or watch url
  const patterns = [
    /youtube\.com\/embed\/([\w-]{6,})/,
    /youtube\.com\/watch\?v=([\w-]{6,})/,
    /youtu\.be\/([\w-]{6,})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

export function MediaPage({ type }: MediaPageProps) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    // The component remounts on type change (via `key` prop in PublicSite),
    // so initial `loading=true` already covers refetches.
    fetch(`/api/media?type=${type}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const fetched = data.media || []
        // If API returns no published items (or error), use placeholders
        setItems(fetched.length > 0 ? fetched : type === 'photo' ? PLACEHOLDER_PHOTOS : PLACEHOLDER_VIDEOS)
      })
      .catch(() => {
        if (cancelled) return
        setItems(type === 'photo' ? PLACEHOLDER_PHOTOS : PLACEHOLDER_VIDEOS)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [type])

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return items
    return items.filter((i) => i.category === activeCategory)
  }, [items, activeCategory])

  const title = type === 'photo' ? 'Photo Gallery' : 'Video Gallery'
  const subtitle =
    type === 'photo'
      ? 'Captured moments of learning, joy, and achievement'
      : 'Watch our school come alive in motion'

  const openLightbox = (i: number) => setLightboxIndex(i)
  const closeLightbox = () => setLightboxIndex(null)
  const nextPhoto = () =>
    setLightboxIndex((cur) => (cur === null ? null : (cur + 1) % filtered.length))
  const prevPhoto = () =>
    setLightboxIndex((cur) =>
      cur === null ? null : (cur - 1 + filtered.length) % filtered.length
    )

  const isPhoto = type === 'photo'
  const Icon = isPhoto ? ImageIcon : Video

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 to-emerald-700">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1920&q=70)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/60 to-emerald-900/60" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <Badge className="mb-4 border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/15">
              <Icon className="mr-1.5 h-3.5 w-3.5" />
              Media Center
            </Badge>
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-lg text-teal-50">{subtitle}</p>
          </motion.div>
        </div>
        <svg
          className="block h-12 w-full text-white sm:h-16"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0,40 C360,80 720,0 1080,32 C1260,48 1380,40 1440,28 L1440,80 L0,80 Z" />
        </svg>
      </section>

      {/* FILTERS */}
      <section className="border-b border-gray-100 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 px-4 sm:px-6 lg:px-8">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveCategory(tab.value)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                activeCategory === tab.value
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* GRID */}
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
              <p className="mt-3 text-sm">Loading {type}s...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Icon className="mb-3 h-12 w-12 text-teal-300" />
              <p className="text-base font-medium">No items found in this category.</p>
              <p className="mt-1 text-sm text-gray-400">Try a different filter.</p>
            </div>
          ) : isPhoto ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((m, i) => (
                <motion.button
                  key={m.id}
                  {...fadeIn}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  onClick={() => openLightbox(i)}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 text-left"
                >
                  <img
                    src={m.thumbnailUrl || m.url}
                    alt={m.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <Badge className="mb-1 bg-white/90 text-teal-700 text-[10px]">
                      {m.category}
                    </Badge>
                    <p className="line-clamp-1 text-sm font-semibold text-white">{m.title}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((m, i) => {
                const ytId = getYouTubeId(m.url)
                const thumb =
                  m.thumbnailUrl ||
                  (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : m.url)
                return (
                  <motion.div
                    key={m.id}
                    {...fadeIn}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                  >
                    <Card className="group h-full overflow-hidden border-gray-100 p-0 transition-all hover:-translate-y-1 hover:shadow-xl">
                      <div className="relative aspect-video overflow-hidden bg-gray-900">
                        <Dialog>
                          <button
                            onClick={() => {}}
                            className="absolute inset-0 h-full w-full cursor-pointer"
                            aria-label={`Play ${m.title}`}
                          >
                            <img
                              src={thumb}
                              alt={m.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-xl transition-all group-hover:scale-110 group-hover:bg-teal-500">
                                <Play className="ml-1 h-6 w-6 fill-teal-600 text-teal-600 transition-colors group-hover:fill-white group-hover:text-white" />
                              </div>
                            </div>
                          </button>
                          <DialogContent className="max-w-4xl border-0 bg-black/95 p-0 sm:rounded-2xl">
                            <DialogTitle className="sr-only">{m.title}</DialogTitle>
                            <div className="aspect-video w-full overflow-hidden sm:rounded-2xl">
                              <iframe
                                src={`${ytId ? `https://www.youtube.com/embed/${ytId}` : m.url}?autoplay=1&rel=0`}
                                title={m.title}
                                className="h-full w-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                            <div className="bg-black/95 p-4 text-white">
                              <h3 className="text-lg font-bold">{m.title}</h3>
                              {m.description && (
                                <p className="mt-1 text-sm text-gray-300">{m.description}</p>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="p-5">
                        <Badge className="mb-2 bg-teal-50 text-teal-700 hover:bg-teal-100">
                          {m.category}
                        </Badge>
                        <h3 className="text-base font-bold text-gray-900">{m.title}</h3>
                        {m.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                            {m.description}
                          </p>
                        )}
                        <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {new Date(m.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* PHOTO LIGHTBOX */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(o) => !o && closeLightbox()}>
        <DialogContent className="max-w-5xl border-0 bg-black/95 p-0 sm:rounded-2xl">
          {lightboxIndex !== null && filtered[lightboxIndex] && (
            <>
              <DialogTitle className="sr-only">{filtered[lightboxIndex].title}</DialogTitle>
              <div className="relative">
                <img
                  src={filtered[lightboxIndex].url}
                  alt={filtered[lightboxIndex].title}
                  className="mx-auto max-h-[75vh] w-auto object-contain"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 text-white">
                  <Badge className="mb-2 bg-white/20 text-white">{filtered[lightboxIndex].category}</Badge>
                  <h3 className="text-xl font-bold">{filtered[lightboxIndex].title}</h3>
                  {filtered[lightboxIndex].description && (
                    <p className="mt-1 text-sm text-gray-200">{filtered[lightboxIndex].description}</p>
                  )}
                </div>
                <button
                  onClick={prevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute right-3 top-3 rounded-full bg-white/10 px-3 py-1 text-xs text-white backdrop-blur-md">
                  {lightboxIndex + 1} / {filtered.length}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
