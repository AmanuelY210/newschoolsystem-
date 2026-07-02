'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Loader2,
  MessageSquare,
  User,
  Calendar,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/lib/store'

interface CMSPage {
  id: string
  title: string
  content: string
  bannerImage?: string | null
  published: boolean
}

const CONTACT_INFO_FALLBACK = {
  address: 'Bole Road, Addis Ababa, Ethiopia',
  phone: '+251 11 234 5678',
  email: 'info@brightfuture.edu',
  hours: 'Mon - Fri: 8:00 AM - 5:00 PM',
}

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

export function ContactPage() {
  const { navigateToPublic } = useAppStore()
  const { toast } = useToast()
  const [page, setPage] = useState<CMSPage | null>(null)
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  useEffect(() => {
    fetch('/api/cms/contact')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setPage(d?.page || null))
      .catch(() => {})
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || {}))
      .catch(() => {})
  }, [])

  const title = page?.title || 'Contact Us'
  const address = settings.school_address || CONTACT_INFO_FALLBACK.address
  const phone = settings.school_phone || CONTACT_INFO_FALLBACK.phone
  const email = settings.school_email || CONTACT_INFO_FALLBACK.email
  const hours = settings.school_hours || CONTACT_INFO_FALLBACK.hours

  const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in your name, email, subject, and message.',
        variant: 'destructive',
      })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send message')
      toast({
        title: 'Message sent!',
        description: 'Thank you for reaching out. We will reply within 1-2 business days.',
      })
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err: any) {
      toast({
        title: 'Failed to send',
        description: err.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const INFO_CARDS = [
    {
      icon: MapPin,
      label: 'Visit Us',
      value: address,
      action: { label: 'Get Directions', href: '#map' },
      color: 'from-teal-500 to-emerald-500',
    },
    {
      icon: Phone,
      label: 'Call Us',
      value: phone,
      action: { label: 'Call now', href: `tel:${phone}` },
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Mail,
      label: 'Email Us',
      value: email,
      action: { label: 'Send email', href: `mailto:${email}` },
      color: 'from-teal-600 to-emerald-700',
    },
    {
      icon: Clock,
      label: 'Office Hours',
      value: hours,
      color: 'from-emerald-600 to-teal-700',
    },
  ]

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 to-emerald-700">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=70)',
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
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              Get in Touch
            </Badge>
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-lg text-teal-50">
              We&apos;d love to hear from you. Whether you have a question about admissions,
              programs, or just want to visit — our team is ready to help.
            </p>
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

      {/* INFO CARDS */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {INFO_CARDS.map((c, i) => {
              const Icon = c.icon
              return (
                <motion.div
                  key={c.label}
                  {...fadeIn}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Card className="group h-full border-gray-100 p-6 transition-all hover:-translate-y-1 hover:shadow-md">
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-md`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {c.label}
                    </p>
                    <p className="mt-1 break-words text-sm font-medium text-gray-800">
                      {c.value}
                    </p>
                    {c.action && (
                      <a
                        href={c.action.href}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:gap-2 transition-all"
                      >
                        {c.action.label}
                        <ArrowRight className="h-3 w-3" />
                      </a>
                    )}
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FORM + MAP */}
      <section className="bg-gradient-to-b from-teal-50/40 to-white py-16 lg:py-24" id="map">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
            {/* FORM */}
            <motion.div {...fadeIn}>
              <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
                Send a Message
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900">We&apos;ll get back to you</h2>
              <p className="mt-3 text-base text-gray-600">
                Fill in the form and our team will respond within 1-2 business days. Fields
                marked with <span className="text-rose-500">*</span> are required.
              </p>

              <Card className="mt-6 border-gray-100 p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">
                        Your Name <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="name"
                          className="pl-9"
                          placeholder="Full name"
                          value={form.name}
                          onChange={(e) => update('name', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">
                        Email <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-9"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => update('email', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="phone"
                          className="pl-9"
                          placeholder="+251 91 234 5678"
                          value={form.phone}
                          onChange={(e) => update('phone', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="subject">
                        Subject <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="subject"
                          className="pl-9"
                          placeholder="How can we help?"
                          value={form.subject}
                          onChange={(e) => update('subject', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message">
                      Message <span className="text-rose-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      rows={5}
                      placeholder="Write your message here..."
                      value={form.message}
                      onChange={(e) => update('message', e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => navigateToPublic('home')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-teal-600 text-white hover:bg-teal-700"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>

            {/* MAP */}
            <motion.div {...fadeIn} transition={{ duration: 0.5, delay: 0.1 }}>
              <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
                Find Us
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900">Visit our campus</h2>
              <p className="mt-3 text-base text-gray-600">
                We&apos;re conveniently located in the heart of the city. Stop by for a tour
                — we&apos;d be delighted to show you around.
              </p>
              <Card className="mt-6 overflow-hidden border-gray-100 p-0">
                <div className="aspect-[4/3] w-full bg-gray-100">
                  <iframe
                    title="School Location"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=38.7408%2C8.9806%2C38.7608%2C9.0006&layer=mapnik&marker=9.0006%2C38.7508"
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{address}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Free parking available. Please check in at the main reception on arrival.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5 text-teal-500" />
                    Schedule a guided tour: <span className="font-semibold text-gray-700">{phone}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white pb-16 lg:pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn}>
            <div className="rounded-3xl bg-gradient-to-r from-teal-600 to-emerald-700 px-6 py-10 text-center shadow-lg sm:px-12">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Ready to take the next step?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-teal-50">
                Apply online today or schedule a personal campus tour with our admissions team.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => navigateToPublic('admission-portal')}
                  className="bg-white text-teal-700 hover:bg-teal-50"
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigateToPublic('about')}
                  className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Learn More About Us
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
