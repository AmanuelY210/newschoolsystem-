import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding teacher assignments...')

  // Get all teachers
  const teachers = await db.teacher.findMany()
  const grades = await db.grade.findMany({ include: { sections: true, subjects: true } })
  
  if (grades.length === 0) {
    console.log('No grades found. Run the main seed first.')
    return
  }

  // Assign each teacher to Grade 9, Section A, with one subject
  const grade9 = grades.find(g => g.level === 9) || grades[0]
  const sectionA = grade9.sections[0]
  
  for (let i = 0; i < teachers.length; i++) {
    const teacher = teachers[i]
    const subject = grade9.subjects[i % grade9.subjects.length]
    
    if (subject) {
      try {
        await db.teacherAssignment.create({
          data: {
            teacherId: teacher.id,
            gradeId: grade9.id,
            sectionId: sectionA?.id || null,
            subjectId: subject.id,
            academicYear: '2026-2027',
          },
        })
        console.log(`✅ Assigned ${teacher.firstName} ${teacher.lastName} → ${grade9.name} ${sectionA?.name || ''} ${subject.name}`)
      } catch (e: any) {
        // Ignore unique constraint errors
        if (!e.message.includes('Unique constraint')) {
          console.error(`Error assigning ${teacher.firstName}:`, e.message)
        }
      }
    }
  }

  console.log('✅ Teacher assignments seeded!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
