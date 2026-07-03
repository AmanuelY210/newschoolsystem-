import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding languages...')

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', enabled: true, isDefault: true },
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', enabled: true, isDefault: false },
    { code: 'om', name: 'Afaan Oromoo', nativeName: 'Afaan Oromoo', flag: '🇪🇹', enabled: true, isDefault: false },
    { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', flag: '🇪🇹', enabled: false, isDefault: false },
  ]

  for (const lang of languages) {
    const existing = await db.language.findUnique({ where: { code: lang.code } })
    if (!existing) {
      await db.language.create({ data: lang })
      console.log(`✅ Created language: ${lang.flag} ${lang.name} (${lang.code})`)
    } else {
      console.log(`   Already exists: ${lang.name} (${lang.code})`)
    }
  }

  // Add some default translations for English
  const en = await db.language.findUnique({ where: { code: 'en' } })
  if (en) {
    const enTranslations: Record<string, string> = {
      'common.dashboard': 'Dashboard',
      'common.students': 'Students',
      'common.teachers': 'Teachers',
      'common.marks': 'Marks',
      'common.attendance': 'Attendance',
      'common.assignments': 'Assignments',
      'common.finance': 'Finance',
      'common.library': 'Library',
      'common.reports': 'Reports',
      'common.profile': 'My Profile',
      'common.settings': 'Settings',
      'common.logout': 'Logout',
      'common.login': 'Login',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.search': 'Search',
      'common.actions': 'Actions',
      'common.status': 'Status',
      'common.name': 'Name',
      'common.email': 'Email',
      'common.phone': 'Phone',
      'common.date': 'Date',
      'common.welcome': 'Welcome back',
    }

    for (const [key, value] of Object.entries(enTranslations)) {
      await db.translation.upsert({
        where: { languageId_key: { languageId: en.id, key } },
        create: { languageId: en.id, key, value },
        update: { value },
      }).catch(() => {})
    }
    console.log(`✅ Seeded ${Object.keys(enTranslations).length} English translations`)
  }

  console.log('✅ Language seeding complete!')
}

main()
  .catch((e) => { console.error('Seed error:', e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
