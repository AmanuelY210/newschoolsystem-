import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Seeding database...')

  // Hash passwords
  const passwordHash = await bcrypt.hash('password123', 10)

  // ============ CREATE USERS ============
  const superAdmin = await db.user.create({
    data: {
      email: 'superadmin@school.edu',
      password: passwordHash,
      name: 'Super Admin',
      role: 'super_admin',
      phone: '+251911000001',
    },
  })

  const admin = await db.user.create({
    data: {
      email: 'admin@school.edu',
      password: passwordHash,
      name: 'School Admin',
      role: 'admin',
      phone: '+251911000002',
    },
  })

  const teacherUser = await db.user.create({
    data: {
      email: 'teacher@school.edu',
      password: passwordHash,
      name: 'Abebe Bekele',
      role: 'teacher',
      phone: '+251911000003',
    },
  })

  const studentUser = await db.user.create({
    data: {
      email: 'student@school.edu',
      password: passwordHash,
      name: 'Hanan Ali',
      role: 'student',
      phone: '+251911000004',
    },
  })

  const financeUser = await db.user.create({
    data: {
      email: 'finance@school.edu',
      password: passwordHash,
      name: 'Finance Manager',
      role: 'finance',
      phone: '+251911000005',
    },
  })

  const libraryUser = await db.user.create({
    data: {
      email: 'library@school.edu',
      password: passwordHash,
      name: 'Library Manager',
      role: 'library',
      phone: '+251911000006',
    },
  })

  // ============ CREATE GRADES & SECTIONS ============
  const grades: any[] = []
  for (let i = 1; i <= 12; i++) {
    grades.push(await db.grade.create({
      data: { name: `Grade ${i}`, level: i },
    }))
  }

  const sectionA = await db.section.create({
    data: { name: 'A', gradeId: grades[8].id, capacity: 40 }, // Grade 9
  })

  // ============ CREATE SUBJECTS ============
  const subjects = [
    { name: 'Mathematics', code: 'MATH' },
    { name: 'English', code: 'ENG' },
    { name: 'Amharic', code: 'AMH' },
    { name: 'Physics', code: 'PHY' },
    { name: 'Chemistry', code: 'CHEM' },
    { name: 'Biology', code: 'BIO' },
    { name: 'History', code: 'HIST' },
    { name: 'Geography', code: 'GEO' },
    { name: 'Civics', code: 'CIV' },
    { name: 'ICT', code: 'ICT' },
  ]

  const subjectRecords: any[] = []
  for (const s of subjects) {
    subjectRecords.push(await db.subject.create({
      data: { name: s.name, code: s.code, gradeId: grades[8].id },
    }))
  }

  // ============ CREATE TEACHER ============
  const teacher = await db.teacher.create({
    data: {
      userId: teacherUser.id,
      teacherId: 'TCH-2024-001',
      firstName: 'Abebe',
      lastName: 'Bekele',
      gender: 'male',
      qualification: 'MSc in Mathematics',
      specialization: 'Mathematics & Physics',
      experience: 12,
      phone: '+251911000003',
      address: 'Addis Ababa, Ethiopia',
      salary: 25000,
      photoUrl: '',
    },
  })

  // Create more teachers
  const teacherNames = [
    { fn: 'Sara', ln: 'Mohamed', spec: 'English & Literature', sal: 22000 },
    { fn: 'Dawit', ln: 'Tadesse', spec: 'Biology & Chemistry', sal: 23000 },
    { fn: 'Meriem', ln: 'Hassan', spec: 'Physics & ICT', sal: 24000 },
    { fn: 'Yonas', ln: 'Girma', spec: 'History & Geography', sal: 21000 },
    { fn: 'Fatima', ln: 'Ahmed', spec: 'Amharic & Civics', sal: 20000 },
  ]

  for (let i = 0; i < teacherNames.length; i++) {
    const tn = teacherNames[i]
    const tUser = await db.user.create({
      data: {
        email: `teacher${i + 2}@school.edu`,
        password: passwordHash,
        name: `${tn.fn} ${tn.ln}`,
        role: 'teacher',
        phone: `+2519110000${3 + i + 1}`,
      },
    })
    await db.teacher.create({
      data: {
        userId: tUser.id,
        teacherId: `TCH-2024-${String(i + 2).padStart(3, '0')}`,
        firstName: tn.fn,
        lastName: tn.ln,
        gender: i % 2 === 0 ? 'female' : 'male',
        qualification: 'BA/BSc Degree',
        specialization: tn.spec,
        experience: 5 + i,
        phone: `+2519110000${3 + i + 1}`,
        address: 'Addis Ababa, Ethiopia',
        salary: tn.sal,
      },
    })
  }

  // ============ CREATE STUDENT ============
  const student = await db.student.create({
    data: {
      userId: studentUser.id,
      studentId: 'STU-2024-001',
      firstName: 'Hanan',
      lastName: 'Ali',
      gender: 'female',
      dateOfBirth: new Date('2008-05-15'),
      bloodGroup: 'O+',
      gradeId: grades[8].id,
      sectionId: sectionA.id,
      guardianName: 'Ali Mohammed',
      guardianPhone: '+251911123456',
      guardianEmail: 'ali@example.com',
      address: 'Bole, Addis Ababa',
      photoUrl: '',
    },
  })

  // Create more students
  const studentNames = [
    { fn: 'Kidist', ln: 'Tesfaye', g: 'female' },
    { fn: 'Bethel', ln: 'Assefa', g: 'female' },
    { fn: 'Nahom', ln: 'Solomon', g: 'male' },
    { fn: 'Ruth', ln: 'Girma', g: 'female' },
    { fn: 'Abel', ln: 'Mekonnen', g: 'male' },
    { fn: 'Selam', ln: 'Worku', g: 'female' },
    { fn: 'Daniel', ln: 'Bekele', g: 'male' },
    { fn: 'Hanna', ln: 'Girmay', g: 'female' },
    { fn: 'Yabets', ln: 'Haile', g: 'male' },
    { fn: 'Liya', ln: 'Tariku', g: 'female' },
    { fn: 'Noah', ln: 'Teshome', g: 'male' },
    { fn: 'Eden', ln: 'Asfaw', g: 'female' },
  ]

  for (let i = 0; i < studentNames.length; i++) {
    const sn = studentNames[i]
    const sUser = await db.user.create({
      data: {
        email: `student${i + 2}@school.edu`,
        password: passwordHash,
        name: `${sn.fn} ${sn.ln}`,
        role: 'student',
        phone: `+2519111000${i + 2}`,
      },
    })
    await db.student.create({
      data: {
        userId: sUser.id,
        studentId: `STU-2024-${String(i + 2).padStart(3, '0')}`,
        firstName: sn.fn,
        lastName: sn.ln,
        gender: sn.g,
        dateOfBirth: new Date(2008, i, 15),
        bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'O-'][i % 5],
        gradeId: grades[8].id,
        sectionId: sectionA.id,
        guardianName: `Parent of ${sn.fn}`,
        guardianPhone: `+2519112000${i + 2}`,
        address: 'Addis Ababa, Ethiopia',
      },
    })
  }

  // ============ CREATE MARKS ============
  const allStudents = await db.student.findMany()
  for (const subj of subjectRecords.slice(0, 5)) {
    for (const s of allStudents) {
      const score = Math.floor(Math.random() * 40) + 60 // 60-100
      await db.mark.create({
        data: {
          studentId: s.id,
          teacherId: teacher.id,
          subjectId: subj.id,
          term: 'Term 1',
          assessmentType: 'exam',
          score: score,
          totalScore: 100,
          grade: score >= 90 ? 'A+' : score >= 85 ? 'A' : score >= 80 ? 'B+' : score >= 75 ? 'B' : score >= 65 ? 'C+' : score >= 50 ? 'C' : 'F',
        },
      })
    }
  }

  // ============ CREATE ATTENDANCE ============
  const today = new Date()
  for (let d = 0; d < 5; d++) {
    const date = new Date(today)
    date.setDate(date.getDate() - d)
    for (const s of allStudents) {
      const rand = Math.random()
      const status = rand > 0.9 ? 'absent' : rand > 0.85 ? 'late' : 'present'
      await db.attendance.create({
        data: {
          studentId: s.id,
          teacherId: teacher.id,
          date: date,
          status: status,
        },
      })
    }
  }

  // ============ CREATE ASSIGNMENTS ============
  const assignment1 = await db.assignment.create({
    data: {
      title: 'Algebra Chapter 3 - Linear Equations',
      description: 'Solve problems 1-20 from Chapter 3. Show all working steps.',
      subjectId: subjectRecords[0].id,
      teacherId: teacher.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxScore: 100,
    },
  })

  const assignment2 = await db.assignment.create({
    data: {
      title: 'Essay: My Future Career',
      description: 'Write a 500-word essay about your future career goals.',
      subjectId: subjectRecords[1].id,
      teacherId: teacher.id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      maxScore: 50,
    },
  })

  // ============ CREATE FINANCE TRANSACTIONS ============
  const paymentMethods = ['cash', 'telebirr', 'cbe', 'dashen', 'awash']
  for (let i = 0; i < allStudents.length; i++) {
    const s = allStudents[i]
    await db.financeTransaction.create({
      data: {
        transactionId: `TXN-2024-${String(i + 1).padStart(4, '0')}`,
        studentId: s.id,
        type: 'fee_payment',
        category: 'tuition',
        amount: 8500,
        paymentMethod: paymentMethods[i % paymentMethods.length],
        bankReference: paymentMethods[i % paymentMethods.length] !== 'cash' ? `REF${1000 + i}` : null,
        description: `Term 1 Tuition Fee - ${s.firstName} ${s.lastName}`,
        status: 'completed',
      },
    })
  }

  // ============ CREATE BOOKS ============
  const books = [
    { title: 'Principles of Mathematics', author: 'John Doe', category: 'Mathematics', year: 2023, copies: 5 },
    { title: 'English Grammar in Use', author: 'Raymond Murphy', category: 'English', year: 2022, copies: 8 },
    { title: 'Introduction to Physics', author: 'David Halliday', category: 'Science', year: 2023, copies: 4 },
    { title: 'Chemistry: The Central Science', author: 'Brown, LeMay', category: 'Science', year: 2021, copies: 3 },
    { title: 'Biology Concepts', author: 'Campbell', category: 'Science', year: 2023, copies: 6 },
    { title: 'World History', author: 'Ellis Esler', category: 'History', year: 2020, copies: 4 },
    { title: 'Geography of Africa', author: 'Barry Kinsey', category: 'Geography', year: 2022, copies: 3 },
    { title: 'Amharic Literature', author: 'Bekele Megerssa', category: 'Literature', year: 2023, copies: 5 },
    { title: 'Computer Science Basics', author: 'J. Glenn Brookshear', category: 'ICT', year: 2024, copies: 7 },
    { title: 'Civics and Ethics', author: 'Ethiopian Ministry', category: 'Civics', year: 2023, copies: 10 },
  ]

  for (let i = 0; i < books.length; i++) {
    const b = books[i]
    await db.book.create({
      data: {
        bookId: `BK-${String(i + 1).padStart(3, '0')}`,
        title: b.title,
        author: b.author,
        category: b.category,
        year: b.year,
        totalCopies: b.copies,
        availableCopies: b.copies - Math.floor(Math.random() * b.copies),
        shelfLocation: `Shelf-${String.fromCharCode(65 + i)}`,
      },
    })
  }

  // ============ CREATE LIBRARY LOANS ============
  const allBooks = await db.book.findMany()
  for (let i = 0; i < 3; i++) {
    const book = allBooks[i]
    const s = allStudents[i]
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14)
    await db.libraryLoan.create({
      data: {
        bookId: book.id,
        studentId: s.id,
        borrowerName: `${s.firstName} ${s.lastName}`,
        borrowerType: 'student',
        dueDate: dueDate,
        status: 'borrowed',
      },
    })
    await db.book.update({
      where: { id: book.id },
      data: { availableCopies: { decrement: 1 } },
    })
  }

  // ============ CREATE FINANCE & LIBRARY STAFF ============
  await db.financeStaff.create({
    data: {
      userId: financeUser.id,
      staffId: 'FIN-001',
      firstName: 'Finance',
      lastName: 'Manager',
      phone: '+251911000005',
    },
  })

  await db.librarian.create({
    data: {
      userId: libraryUser.id,
      staffId: 'LIB-001',
      firstName: 'Library',
      lastName: 'Manager',
      phone: '+251911000006',
    },
  })

  // ============ CREATE CMS PAGES ============
  await db.cMSPage.create({
    data: {
      slug: 'home',
      title: 'Welcome to Bright Future Academy',
      content: 'Welcome to Bright Future Academy, where excellence meets opportunity. We are committed to providing quality education that empowers students to become future leaders. Our dedicated teachers, modern facilities, and comprehensive curriculum ensure every student reaches their full potential.',
      bannerImage: '',
    },
  })

  await db.cMSPage.create({
    data: {
      slug: 'about',
      title: 'About Our School',
      content: 'Bright Future Academy was founded in 2005 with a mission to provide world-class education in Ethiopia. Over the years, we have grown into one of the leading educational institutions in the country, serving over 2,000 students from diverse backgrounds.\n\nOur vision is to nurture responsible, knowledgeable, and skilled citizens who can contribute positively to society. We believe in holistic education that develops not just academic skills but also character, creativity, and critical thinking.',
      bannerImage: '',
    },
  })

  await db.cMSPage.create({
    data: {
      slug: 'academy',
      title: 'Academic Programs',
      content: 'We offer comprehensive academic programs from Grade 1 to Grade 12, following the national curriculum with enhanced learning opportunities.\n\n**Primary School (Grade 1-6):** Foundation in literacy, numeracy, and social skills.\n**Junior School (Grade 7-8):** Expanded curriculum with science and technology focus.\n**Secondary School (Grade 9-12):** College preparatory program with specialized tracks.\n\nOur programs include:\n- STEM Education\n- Language Arts\n- Social Studies\n- Physical Education\n- Arts & Music\n- ICT Integration',
      bannerImage: '',
    },
  })

  await db.cMSPage.create({
    data: {
      slug: 'admissions',
      title: 'Admissions',
      content: 'Admissions for the 2024-2025 academic year are now open!\n\n**Admission Process:**\n1. Submit online application form\n2. Submit required documents (birth certificate, previous school records)\n3. Entrance assessment for Grade 3 and above\n4. Parent interview\n5. Admission decision and enrollment\n\n**Required Documents:**\n- Completed application form\n- Birth certificate copy\n- 2 passport-size photos\n- Previous school report card\n- Medical record\n\n**Age Requirements:**\n- Grade 1: 6 years old by September 1\n- Transfer students: age-appropriate placement\n\nFor inquiries, contact our admissions office at +251 11 234 5678.',
      bannerImage: '',
    },
  })

  await db.cMSPage.create({
    data: {
      slug: 'contact',
      title: 'Contact Us',
      content: 'Get in touch with us!\n\n**Address:** Bole Road, Addis Ababa, Ethiopia\n**Phone:** +251 11 234 5678\n**Email:** info@brightfuture.edu\n**Hours:** Monday-Friday 8:00 AM - 4:00 PM',
      bannerImage: '',
    },
  })

  // ============ SITE SETTINGS ============
  const settings = [
    { key: 'logo', value: '/logo.svg' },
    { key: 'favicon', value: '/logo.svg' },
    { key: 'header_text', value: 'Bright Future Academy' },
    { key: 'footer_text', value: '© 2024 Bright Future Academy. All rights reserved. Empowering future leaders through quality education.' },
    { key: 'seo_title', value: 'Bright Future Academy - Quality Education in Ethiopia' },
    { key: 'seo_description', value: 'Bright Future Academy provides world-class education from Grade 1 to 12 in Addis Ababa, Ethiopia. Join us for academic excellence.' },
    { key: 'seo_keywords', value: 'school, education, Ethiopia, Addis Ababa, academy, primary, secondary, quality education' },
    { key: 'school_name', value: 'Bright Future Academy' },
    { key: 'school_address', value: 'Bole Road, Addis Ababa, Ethiopia' },
    { key: 'school_phone', value: '+251 11 234 5678' },
    { key: 'school_email', value: 'info@brightfuture.edu' },
    { key: 'primary_color', value: '#0f766e' },
  ]

  for (const s of settings) {
    await db.siteSetting.create({ data: s })
  }

  // ============ SOCIAL LINKS ============
  const socials = [
    { platform: 'facebook', url: 'https://facebook.com/brightfutureacademy' },
    { platform: 'twitter', url: 'https://twitter.com/bfacademy' },
    { platform: 'instagram', url: 'https://instagram.com/bfacademy' },
    { platform: 'youtube', url: 'https://youtube.com/@bfacademy' },
    { platform: 'telegram', url: 'https://t.me/bfacademy' },
  ]

  for (const s of socials) {
    await db.socialLink.create({ data: s })
  }

  // ============ MEDIA ITEMS ============
  const mediaItems = [
    { title: 'Annual Sports Day 2024', type: 'photo', category: 'sports', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800' },
    { title: 'Science Exhibition', type: 'photo', category: 'event', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800' },
    { title: 'Graduation Ceremony', type: 'photo', category: 'graduation', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800' },
    { title: 'Library Reading Session', type: 'photo', category: 'classroom', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800' },
    { title: 'Cultural Day Celebration', type: 'photo', category: 'event', url: 'https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?w=800' },
    { title: 'Music Performance', type: 'photo', category: 'event', url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800' },
    { title: 'School Tour Video', type: 'video', category: 'general', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { title: 'Annual Day Highlights', type: 'video', category: 'event', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  ]

  for (const m of mediaItems) {
    await db.mediaItem.create({
      data: {
        title: m.title,
        type: m.type,
        category: m.category,
        url: m.url,
        thumbnailUrl: m.type === 'photo' ? m.url : '',
      },
    })
  }

  // ============ EVENTS ============
  const events = [
    { title: 'First Term Examinations', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), type: 'exam' },
    { title: 'Parent-Teacher Meeting', date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), type: 'meeting' },
    { title: 'Sports Day', date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), type: 'event' },
    { title: 'Cultural Festival', date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), type: 'event' },
  ]

  for (const e of events) {
    await db.event.create({ data: e })
  }

  console.log('✅ Seed completed successfully!')
  console.log('Login credentials:')
  console.log('  Super Admin: superadmin@school.edu / password123')
  console.log('  Admin: admin@school.edu / password123')
  console.log('  Teacher: teacher@school.edu / password123')
  console.log('  Student: student@school.edu / password123')
  console.log('  Finance: finance@school.edu / password123')
  console.log('  Library: library@school.edu / password123')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
