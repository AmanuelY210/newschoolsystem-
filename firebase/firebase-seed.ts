// Firebase Seed Script - Seeds demo data to Firebase Realtime Database
// Run: bun run firebase/firebase-seed.ts

import { db, fbSet, generateId } from '../src/lib/firebase-db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Seeding Firebase Realtime Database...')
  await fbSet('', null)

  const passwordHash = await bcrypt.hash('password123', 10)

  // Users
  const users = [
    { email: 'superadmin@school.edu', name: 'Super Admin', role: 'super_admin', phone: '+251911000001' },
    { email: 'admin@school.edu', name: 'School Admin', role: 'admin', phone: '+251911000002' },
    { email: 'teacher@school.edu', name: 'Abebe Bekele', role: 'teacher', phone: '+251911000003' },
    { email: 'student@school.edu', name: 'Hanan Ali', role: 'student', phone: '+251911000004' },
    { email: 'finance@school.edu', name: 'Finance Manager', role: 'finance', phone: '+251911000005' },
    { email: 'library@school.edu', name: 'Library Manager', role: 'library', phone: '+251911000006' },
  ]

  for (const u of users) {
    await db.user.create({ data: { ...u, password: passwordHash, active: true } })
  }
  console.log('✅ 6 users created')

  // Grades
  for (let i = 1; i <= 12; i++) {
    await db.grade.create({ data: { name: `Grade ${i}`, code: `G${i}`, level: i, educationLevel: i <= 6 ? 'primary' : 'secondary', status: 'active' } })
  }
  console.log('✅ 12 grades created')

  // Settings
  const settings = [
    { key: 'school_name', value: 'Bright Future Academy' },
    { key: 'school_tagline', value: 'Excellence in Education' },
    { key: 'portal_name', value: 'School Management System' },
    { key: 'logo', value: '/logo.svg' },
    { key: 'favicon', value: '/logo.svg' },
  ]
  for (const s of settings) await db.siteSetting.create({ data: s })
  console.log('✅ Settings created')

  console.log('\n✅ Firebase seed complete!')
  console.log('Login: superadmin@school.edu / password123')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
