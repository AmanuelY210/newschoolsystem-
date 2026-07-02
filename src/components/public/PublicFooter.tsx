'use client'

import { useEffect, useState } from 'react'
import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Send,
  ArrowRight,
} from 'lucide-react'
import { useAppStore, type PublicPage } from '@/lib/store'

interface SocialLink {
  id: string
  platform: string
  url: string
  icon?: string | null
  active?: boolean
}

const SOCIAL_ICONS: Record<string, any> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  telegram: Send,
}

const QUICK_LINKS: { label: string; page: PublicPage }[] = [
  { label: 'About Us', page: 'about' },
  { label: 'Academy', page: 'academy' },
  { label: 'Apply Online', page: 'admission-portal' },
  { label: 'Track Application', page: 'track' },
  { label: 'Teachers', page: 'teachers' },
  { label: 'Photo Gallery', page: 'media-photos' },
  { label: 'Video Gallery', page: 'media-videos' },
  { label: 'Contact Us', page: 'contact' },
]

export function PublicFooter() {
  const { navigateToPublic } = useAppStore()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [socials, setSocials] = useState<SocialLink[]>([])

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setSettings(data.settings || {}))
      .catch(() => {})
    fetch('/api/social')
      .then((r) => r.json())
      .then((data) => setSocials(data.links || []))
      .catch(() => {})
  }, [])

  const schoolName = settings.school_name || 'Bright Future Academy'
  const address = settings.school_address || 'Bole Road, Addis Ababa, Ethiopia'
  const phone = settings.school_phone || '+251 11 234 5678'
  const email = settings.school_email || 'info@brightfuture.edu'
  const footerText = settings.footer_text || `© ${new Date().getFullYear()} ${schoolName}. All rights reserved.`

  const go = (page: PublicPage) => {
    navigateToPublic(page)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="mt-auto bg-gray-950 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* School Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-md">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-bold text-white">{schoolName}</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Nurturing minds, building character, and shaping tomorrow&apos;s leaders through
              quality education rooted in values.
            </p>
            <div className="flex flex-wrap gap-2">
              {socials.length === 0 ? (
                <>
                  {[Facebook, Twitter, Instagram, Youtube, Linkedin].map((Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-300 hover:bg-teal-600 hover:text-white transition-colors"
                      aria-label="social"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </>
              ) : (
                socials.map((s) => {
                  const Icon = SOCIAL_ICONS[s.platform.toLowerCase()] || Send
                  return (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-300 hover:bg-teal-600 hover:text-white transition-colors"
                      aria-label={s.platform}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  )
                })
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => go(link.page)}
                    className="group inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-teal-400 transition-colors"
                  >
                    <ArrowRight className="h-3 w-3 text-teal-500 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Programs
            </h3>
            <ul className="space-y-2.5">
              {['Primary School', 'Junior School', 'Secondary School', 'Extra Curricular', 'Sports & Arts', 'STEM Lab'].map(
                (item) => (
                  <li key={item}>
                    <button
                      onClick={() => go('academy')}
                      className="group inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-teal-400 transition-colors"
                    >
                      <ArrowRight className="h-3 w-3 text-teal-500 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {item}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Get in Touch
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                <span className="text-gray-400">{address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                <a href={`tel:${phone}`} className="text-gray-400 hover:text-teal-400 transition-colors">
                  {phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                <a href={`mailto:${email}`} className="text-gray-400 hover:text-teal-400 transition-colors break-all">
                  {email}
                </a>
              </li>
            </ul>
            <button
              onClick={() => go('admissions')}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              Apply Now
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-gray-800 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-gray-500">{footerText}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <button onClick={() => go('about')} className="hover:text-teal-400 transition-colors">
                Privacy Policy
              </button>
              <span className="text-gray-700">·</span>
              <button onClick={() => go('about')} className="hover:text-teal-400 transition-colors">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
