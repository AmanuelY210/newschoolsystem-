// CMS Page Data Schema Definitions
// Defines all editable fields for each public website page

export interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'image' | 'color' | 'list' | 'object'
  placeholder?: string
  // For list type: the item schema
  itemFields?: FieldDef[]
  // For object type: the sub-fields
  fields?: FieldDef[]
  // For list items: max count
  maxItems?: number
}

export interface PageSchema {
  slug: string
  label: string
  icon: string
  description: string
  sections: FieldDef[]
}

// Helper to create text field
const text = (key: string, label: string, placeholder?: string): FieldDef => ({ key, label, type: 'text', placeholder })
const textarea = (key: string, label: string, placeholder?: string): FieldDef => ({ key, label, type: 'textarea', placeholder })
const image = (key: string, label: string): FieldDef => ({ key, label, type: 'image' })
const color = (key: string, label: string): FieldDef => ({ key, label, type: 'color' })
const list = (key: string, label: string, itemFields: FieldDef[], maxItems?: number): FieldDef => ({ key, label, type: 'list', itemFields, maxItems })
const object = (key: string, label: string, fields: FieldDef[]): FieldDef => ({ key, label, type: 'object', fields })

export const PAGE_SCHEMAS: PageSchema[] = [
  // ============ HOME PAGE ============
  {
    slug: 'home',
    label: 'Home Page',
    icon: 'home',
    description: 'Homepage hero, stats, programs, gallery, and CTA sections',
    sections: [
      object('hero', 'Hero Section', [
        text('badge', 'Badge Text', 'Admissions Open for 2025 - 2026'),
        text('title', 'Main Title', 'Welcome to Bright Future Academy'),
        textarea('subtitle', 'Subtitle'),
        image('image', 'Background Image'),
        text('primaryCta', 'Primary Button Text', 'Apply Now'),
        text('secondaryCta', 'Secondary Button Text', 'Explore Academy'),
      ]),
      list('stats', 'Statistics', [
        text('value', 'Value', '2000+'),
        text('label', 'Label', 'Students'),
        text('icon', 'Icon (users/teachers/award/calendar)'),
      ], 6),
      object('aboutPreview', 'About Preview Section', [
        text('badge', 'Badge', 'About Us'),
        text('title', 'Title', 'A tradition of academic excellence and character'),
        textarea('description', 'Description'),
        image('image', 'Image'),
        text('buttonText', 'Button Text', 'Learn More About Us'),
        list('features', 'Feature Points', [text('value', 'Feature')], 6),
      ]),
      list('programs', 'Academic Programs', [
        text('title', 'Title', 'Primary School'),
        text('grades', 'Grades', 'Grades 1 - 6'),
        textarea('description', 'Description'),
        text('icon', 'Icon (bookopen/graduation/atom)'),
      ], 4),
      object('events', 'Events Section', [
        text('title', 'Section Title', 'Upcoming events'),
        text('subtitle', 'Subtitle', 'Mark your calendar'),
        text('buttonText', 'Button Text', 'View Calendar'),
      ]),
      object('gallery', 'Gallery Section', [
        text('title', 'Section Title', 'Moments that make us proud'),
        text('buttonText', 'Button Text', 'View Full Gallery'),
      ]),
      object('cta', 'Call to Action Section', [
        text('title', 'Title', 'Begin your child\'s journey with us'),
        text('description', 'Description'),
        text('primaryButtonText', 'Primary Button', 'Apply Online'),
        text('secondaryButtonText', 'Secondary Button', 'Schedule a Visit'),
      ]),
    ],
  },

  // ============ ABOUT PAGE ============
  {
    slug: 'about',
    label: 'About Us Page',
    icon: 'info',
    description: 'About page with story, mission/vision/values, timeline, leadership',
    sections: [
      object('hero', 'Hero Section', [
        text('badge', 'Badge Text', 'About Us'),
        text('title', 'Main Title', 'About Our School'),
        textarea('subtitle', 'Subtitle'),
        image('image', 'Background Image'),
      ]),
      object('story', 'Our Story Section', [
        text('title', 'Section Title', 'Our Story'),
        textarea('content', 'Content (paragraphs separated by blank lines)'),
        image('image', 'Image'),
      ]),
      object('values', 'Mission, Vision & Values', [
        text('title', 'Section Title', 'What Drives Us'),
        text('subtitle', 'Subtitle', 'Mission, vision & values'),
        list('items', 'Value Cards', [
          text('title', 'Title', 'Our Mission'),
          textarea('description', 'Description'),
          text('icon', 'Icon (target/eye/heart)'),
        ], 4),
      ]),
      list('timeline', 'Timeline', [
        text('year', 'Year', '2005'),
        text('title', 'Title', 'Founded'),
        textarea('description', 'Description'),
      ], 8),
      object('leadership', 'Leadership Team', [
        text('title', 'Section Title', 'Meet our leadership'),
        text('subtitle', 'Subtitle'),
        list('members', 'Team Members', [
          text('name', 'Name'),
          text('role', 'Role', 'Principal'),
          textarea('bio', 'Bio'),
          image('photo', 'Photo'),
        ], 8),
      ]),
    ],
  },

  // ============ ACADEMY PAGE ============
  {
    slug: 'academy',
    label: 'Academy Page',
    icon: 'graduation',
    description: 'Academic programs, subjects, calendar, and facilities',
    sections: [
      object('hero', 'Hero Section', [
        text('badge', 'Badge Text', 'Academy'),
        text('title', 'Main Title', 'Academic Programs'),
        textarea('subtitle', 'Subtitle'),
        image('image', 'Background Image'),
      ]),
      object('intro', 'Introduction', [
        text('title', 'Section Title', 'Excellence in every classroom'),
        textarea('content', 'Content'),
      ]),
      list('programs', 'Academic Programs', [
        text('title', 'Title', 'Primary School'),
        text('level', 'Level', 'Grades 1 - 6'),
        textarea('description', 'Description'),
        list('features', 'Features', [text('value', 'Feature')], 6),
        text('icon', 'Icon'),
      ], 4),
      object('subjects', 'Subjects Section', [
        text('title', 'Section Title', 'Subjects we teach'),
        text('subtitle', 'Subtitle'),
        list('items', 'Subjects', [
          text('name', 'Subject Name', 'Mathematics'),
          text('icon', 'Icon'),
        ], 12),
      ]),
      object('calendar', 'Academic Calendar', [
        text('title', 'Section Title', 'Academic Calendar'),
        text('subtitle', 'Subtitle'),
        list('items', 'Calendar Items', [
          text('term', 'Term', 'Term 1'),
          text('dates', 'Dates', 'September - December'),
          text('color', 'Color'),
        ], 4),
      ]),
      list('facilities', 'Facilities', [
        text('title', 'Title', 'Library'),
        textarea('description', 'Description'),
        image('image', 'Image'),
        text('icon', 'Icon'),
      ], 8),
    ],
  },

  // ============ TEACHERS PAGE ============
  {
    slug: 'teachers',
    label: 'Teachers Page',
    icon: 'users',
    description: 'Teachers page hero and intro (teacher list comes from database)',
    sections: [
      object('hero', 'Hero Section', [
        text('badge', 'Badge Text', 'Our Team'),
        text('title', 'Main Title', 'Meet our dedicated teachers'),
        textarea('subtitle', 'Subtitle'),
        image('image', 'Background Image'),
      ]),
      object('intro', 'Introduction', [
        text('title', 'Section Title', 'Educators who inspire'),
        textarea('content', 'Content'),
      ]),
      object('stats', 'Teachers Stats', [
        list('items', 'Stats', [
          text('value', 'Value', '50+'),
          text('label', 'Label', 'Expert Teachers'),
        ], 4),
      ]),
    ],
  },

  // ============ STUDENTS PAGE ============
  {
    slug: 'students',
    label: 'Students Page',
    icon: 'student',
    description: 'Students page with achievements, council, and activities',
    sections: [
      object('hero', 'Hero Section', [
        text('badge', 'Badge Text', 'Student Life'),
        text('title', 'Main Title', 'Our vibrant student community'),
        textarea('subtitle', 'Subtitle'),
        image('image', 'Background Image'),
      ]),
      object('achievements', 'Achievements Section', [
        text('title', 'Section Title', 'Student Achievements'),
        text('subtitle', 'Subtitle'),
        list('items', 'Achievements', [
          text('title', 'Title'),
          text('value', 'Value/Count', '25+'),
          textarea('description', 'Description'),
          text('icon', 'Icon'),
        ], 6),
      ]),
      object('council', 'Student Council', [
        text('title', 'Section Title', 'Student Council'),
        text('subtitle', 'Subtitle'),
        list('members', 'Council Members', [
          text('name', 'Name'),
          text('role', 'Role', 'President'),
          text('grade', 'Grade', 'Grade 12'),
          image('photo', 'Photo'),
        ], 10),
      ]),
      object('activities', 'Student Activities', [
        text('title', 'Section Title', 'Clubs & Activities'),
        text('subtitle', 'Subtitle'),
        list('items', 'Activities', [
          text('title', 'Title', 'Science Club'),
          textarea('description', 'Description'),
          text('icon', 'Icon'),
        ], 8),
      ]),
    ],
  },

  // ============ CONTACT PAGE ============
  {
    slug: 'contact',
    label: 'Contact Page',
    icon: 'phone',
    description: 'Contact page with info cards and map',
    sections: [
      object('hero', 'Hero Section', [
        text('badge', 'Badge Text', 'Contact Us'),
        text('title', 'Main Title', 'Get in touch with us'),
        textarea('subtitle', 'Subtitle'),
        image('image', 'Background Image'),
      ]),
      object('infoCards', 'Contact Info Cards', [
        list('items', 'Info Cards', [
          text('title', 'Title', 'Visit Us'),
          text('value', 'Value', 'Bole Road, Addis Ababa'),
          text('icon', 'Icon (map/phone/mail/clock)'),
        ], 4),
      ]),
      object('form', 'Contact Form Section', [
        text('title', 'Section Title', 'Send a Message'),
        text('subtitle', 'Subtitle', 'We\'ll get back to you'),
      ]),
      object('map', 'Map Section', [
        text('title', 'Section Title', 'Visit our campus'),
        text('embedUrl', 'Map Embed URL (Google Maps iframe src)'),
        text('address', 'Address Display'),
      ]),
      object('cta', 'Call to Action', [
        text('title', 'Title', 'Ready to take the next step?'),
        text('primaryButtonText', 'Primary Button', 'Apply Now'),
        text('secondaryButtonText', 'Secondary Button', 'Learn More About Us'),
      ]),
    ],
  },

  // ============ MEDIA PAGE ============
  {
    slug: 'media',
    label: 'Media Gallery Page',
    icon: 'image',
    description: 'Media gallery page hero and intro (photos/videos come from Media API)',
    sections: [
      object('hero', 'Hero Section', [
        text('badge', 'Badge Text', 'Media Gallery'),
        text('title', 'Main Title', 'Moments that make us proud'),
        textarea('subtitle', 'Subtitle'),
        image('image', 'Background Image'),
      ]),
      object('photoSection', 'Photo Gallery Section', [
        text('title', 'Section Title', 'Photo Gallery'),
        text('subtitle', 'Subtitle'),
      ]),
      object('videoSection', 'Video Gallery Section', [
        text('title', 'Section Title', 'Video Gallery'),
        text('subtitle', 'Subtitle'),
      ]),
    ],
  },
]

// ============ DEFAULT DATA FOR EACH PAGE ============
export const DEFAULT_PAGE_DATA: Record<string, any> = {
  home: {
    hero: {
      badge: 'Admissions Open for 2025 - 2026',
      title: 'Welcome to Bright Future Academy',
      subtitle: 'Where excellence meets opportunity. We are committed to providing quality education that empowers students to become future leaders.',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=70',
      primaryCta: 'Apply Now',
      secondaryCta: 'Explore Academy',
    },
    stats: [
      { value: '2000+', label: 'Students', icon: 'users' },
      { value: '50+', label: 'Expert Teachers', icon: 'teachers' },
      { value: '19+', label: 'Years of Excellence', icon: 'award' },
      { value: '25+', label: 'Awards Won', icon: 'calendar' },
    ],
    aboutPreview: {
      badge: 'About Us',
      title: 'A tradition of academic excellence and character',
      description: 'For nearly two decades, Bright Future Academy has been at the forefront of quality education in Ethiopia. Our holistic approach nurtures intellectual curiosity, moral integrity, and a lifelong love of learning.',
      image: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1200&q=70',
      buttonText: 'Learn More About Us',
      features: [
        { value: 'Holistic education approach' },
        { value: 'Modern learning facilities' },
        { value: 'Experienced & caring faculty' },
        { value: 'Strong academic track record' },
      ],
    },
    programs: [
      { title: 'Primary School', grades: 'Grades 1 - 6', description: 'A nurturing foundation that builds curiosity, literacy, numeracy, and social skills.', icon: 'bookopen' },
      { title: 'Junior School', grades: 'Grades 7 - 8', description: 'Bridging foundational learning with deeper subject mastery, critical thinking, and creativity.', icon: 'graduation' },
      { title: 'Secondary School', grades: 'Grades 9 - 12', description: 'Rigorous academic preparation for university and beyond — with specialized tracks.', icon: 'atom' },
    ],
    events: {
      title: 'Upcoming events',
      subtitle: 'Mark your calendar',
      buttonText: 'View Calendar',
    },
    gallery: {
      title: 'Moments that make us proud',
      buttonText: 'View Full Gallery',
    },
    cta: {
      title: "Begin your child's journey with us",
      description: 'Join a community where every child is known, valued, and inspired to achieve their personal best.',
      primaryButtonText: 'Apply Online',
      secondaryButtonText: 'Schedule a Visit',
    },
  },

  about: {
    hero: {
      badge: 'About Us',
      title: 'About Our School',
      subtitle: 'Discover who we are, what we believe, and the people who make our school a special place to learn and grow.',
      image: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1920&q=70',
    },
    story: {
      title: 'Our Story',
      content: 'Bright Future Academy was founded in 2005 with a mission to provide world-class education in Ethiopia. Over the years, we have grown into one of the leading educational institutions in the country, serving over 2,000 students from diverse backgrounds.\n\nOur vision is to nurture responsible, knowledgeable, and skilled citizens who can contribute positively to society. We believe in holistic education that develops not just academic skills but also character, creativity, and critical thinking.',
      image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1200&q=70',
    },
    values: {
      title: 'What Drives Us',
      subtitle: 'Mission, vision & values',
      description: 'The principles that shape every decision we make and every lesson we teach.',
      items: [
        { title: 'Our Mission', description: 'To provide a transformative education that develops knowledgeable, caring, and principled young people who are prepared to lead, serve, and contribute to a better world.', icon: 'target' },
        { title: 'Our Vision', description: 'To be the leading educational institution in Ethiopia, recognized for academic excellence, innovative teaching, and graduates who shape a brighter future.', icon: 'eye' },
        { title: 'Our Values', description: 'Integrity, excellence, respect, compassion, and innovation guide everything we do — from classroom interactions to community engagement.', icon: 'heart' },
      ],
    },
    timeline: [
      { year: '2005', title: 'Founded', description: 'Bright Future Academy opens its doors with 50 students and 5 teachers.' },
      { year: '2010', title: 'Expansion', description: 'New secondary school building completed, enrollment reaches 500.' },
      { year: '2015', title: 'Excellence Award', description: 'Recognized as one of the top 10 schools in Addis Ababa.' },
      { year: '2020', title: 'Digital Transformation', description: 'Launched online learning platform and smart classrooms.' },
      { year: '2024', title: '2,000+ Students', description: 'Today we serve over 2,000 students with 50+ expert teachers.' },
    ],
    leadership: {
      title: 'Meet our leadership',
      subtitle: 'Experienced educators dedicated to student success',
      members: [
        { name: 'Dr. Tadesse Bekele', role: 'Principal', bio: 'PhD in Education, 25 years of experience in educational leadership.', photo: '' },
        { name: 'Mrs. Sara Mohammed', role: 'Vice Principal', bio: 'MA in Curriculum Development, 18 years of teaching experience.', photo: '' },
        { name: 'Mr. Dawit Haile', role: 'Academic Dean', bio: 'MSc in Educational Administration, 15 years in academic planning.', photo: '' },
      ],
    },
  },

  academy: {
    hero: {
      badge: 'Academy',
      title: 'Academic Programs',
      subtitle: 'Comprehensive education from Grade 1 to Grade 12, designed to inspire, challenge, and prepare students for a bright future.',
      image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1920&q=70',
    },
    intro: {
      title: 'Excellence in every classroom',
      content: 'Our curriculum follows the national education framework while incorporating international best practices. We offer a balanced program that develops academic knowledge, practical skills, and character. Small class sizes ensure personalized attention, and our experienced teachers use modern, student-centered teaching methods.',
    },
    programs: [
      { title: 'Primary School', level: 'Grades 1 - 6', description: 'Building strong foundations in literacy, numeracy, and social skills through engaging, play-based learning.', features: [{ value: 'Literacy & Language Arts' }, { value: 'Mathematics & Logic' }, { value: 'Science Discovery' }, { value: 'Social Studies' }, { value: 'Arts & Music' }, { value: 'Physical Education' }], icon: 'bookopen' },
      { title: 'Junior School', level: 'Grades 7 - 8', description: 'Deepening subject knowledge while developing critical thinking, creativity, and independent study skills.', features: [{ value: 'Advanced Mathematics' }, { value: 'Sciences (Physics, Chemistry, Biology)' }, { value: 'Languages & Literature' }, { value: 'ICT & Digital Skills' }, { value: 'Civics & Ethics' }, { value: 'Creative Arts' }], icon: 'graduation' },
      { title: 'Secondary School', level: 'Grades 9 - 12', description: 'University preparatory program with specialized Natural Science and Social Science tracks.', features: [{ value: 'University Preparation' }, { value: 'SAT & College Counseling' }, { value: 'Science Laboratory Work' }, { value: 'Research Projects' }, { value: 'Career Guidance' }, { value: 'Community Service' }], icon: 'atom' },
    ],
    subjects: {
      title: 'Subjects we teach',
      subtitle: 'A comprehensive curriculum',
      items: [
        { name: 'Mathematics', icon: 'calculator' },
        { name: 'English', icon: 'book' },
        { name: 'Amharic', icon: 'book' },
        { name: 'Physics', icon: 'atom' },
        { name: 'Chemistry', icon: 'flask' },
        { name: 'Biology', icon: 'leaf' },
        { name: 'History', icon: 'scroll' },
        { name: 'Geography', icon: 'globe' },
        { name: 'Civics', icon: 'scale' },
        { name: 'ICT', icon: 'monitor' },
      ],
    },
    calendar: {
      title: 'Academic Calendar',
      subtitle: 'Important dates throughout the year',
      items: [
        { term: 'Term 1', dates: 'September - December', color: '#0d9488' },
        { term: 'Term 2', dates: 'January - April', color: '#0891b2' },
        { term: 'Term 3', dates: 'May - July', color: '#059669' },
        { term: 'Summer', dates: 'August', color: '#d97706' },
      ],
    },
    facilities: [
      { title: 'Modern Library', description: 'Over 10,000 books, digital resources, and quiet study areas.', image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=70', icon: 'book' },
      { title: 'Science Laboratories', description: 'Fully-equipped physics, chemistry, and biology labs.', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=70', icon: 'flask' },
      { title: 'Sports Complex', description: 'Basketball, football, athletics, and indoor sports facilities.', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=70', icon: 'trophy' },
      { title: 'Computer Lab', description: 'Modern computers with high-speed internet and latest software.', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=70', icon: 'monitor' },
    ],
  },

  teachers: {
    hero: {
      badge: 'Our Team',
      title: 'Meet our dedicated teachers',
      subtitle: 'Our experienced and passionate educators are the heart of Bright Future Academy.',
      image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1920&q=70',
    },
    intro: {
      title: 'Educators who inspire',
      content: 'Our faculty brings together experienced educators from diverse backgrounds, all united by a shared passion for teaching and a commitment to student success. With small class sizes and a supportive environment, our teachers provide personalized attention to help every student thrive.',
    },
    stats: {
      items: [
        { value: '50+', label: 'Expert Teachers' },
        { value: '15+', label: 'Average Years Experience' },
        { value: '90%', label: 'Hold Advanced Degrees' },
        { value: '1:15', label: 'Teacher-Student Ratio' },
      ],
    },
  },

  students: {
    hero: {
      badge: 'Student Life',
      title: 'Our vibrant student community',
      subtitle: 'Beyond academics, our students engage in sports, arts, leadership, and community service.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=70',
    },
    achievements: {
      title: 'Student Achievements',
      subtitle: 'Celebrating excellence in academics, sports, and arts',
      items: [
        { title: 'Academic Awards', value: '25+', description: 'Regional and national academic competition winners', icon: 'award' },
        { title: 'Sports Championships', value: '12+', description: 'Inter-school tournament victories', icon: 'trophy' },
        { title: 'Science Fair Wins', value: '8+', description: 'Innovation and science exhibition awards', icon: 'flask' },
        { title: 'University Placements', value: '95%', description: 'Graduates admitted to universities', icon: 'graduation' },
      ],
    },
    council: {
      title: 'Student Council',
      subtitle: 'Student leaders representing their peers',
      members: [
        { name: 'Bethel Assefa', role: 'President', grade: 'Grade 12', photo: '' },
        { name: 'Nahom Solomon', role: 'Vice President', grade: 'Grade 11', photo: '' },
        { name: 'Ruth Girma', role: 'Secretary', grade: 'Grade 11', photo: '' },
      ],
    },
    activities: {
      title: 'Clubs & Activities',
      subtitle: 'Something for every passion',
      items: [
        { title: 'Science Club', description: 'Hands-on experiments and science projects.', icon: 'flask' },
        { title: 'Debate Society', description: 'Developing public speaking and critical thinking.', icon: 'message' },
        { title: 'Drama Club', description: 'Theater productions and creative expression.', icon: 'drama' },
        { title: 'Sports Teams', description: 'Football, basketball, athletics, and more.', icon: 'trophy' },
        { title: 'Art Studio', description: 'Painting, sculpture, and digital art.', icon: 'palette' },
        { title: 'Music Band', description: 'Instrumental and vocal performances.', icon: 'music' },
      ],
    },
  },

  contact: {
    hero: {
      badge: 'Contact Us',
      title: 'Get in touch with us',
      subtitle: "We'd love to hear from you. Whether you have a question about admissions, programs, or anything else, our team is ready to answer.",
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=70',
    },
    infoCards: {
      items: [
        { title: 'Visit Us', value: 'Bole Road, Addis Ababa, Ethiopia', icon: 'map' },
        { title: 'Call Us', value: '+251 11 234 5678', icon: 'phone' },
        { title: 'Email Us', value: 'info@brightfuture.edu', icon: 'mail' },
        { title: 'Office Hours', value: 'Mon - Fri: 8:00 AM - 4:00 PM', icon: 'clock' },
      ],
    },
    form: {
      title: 'Send a Message',
      subtitle: "We'll get back to you",
    },
    map: {
      title: 'Visit our campus',
      embedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=38.7%2C8.97%2C38.82%2C9.08&layer=mapnik',
      address: 'Bole Road, Addis Ababa, Ethiopia',
    },
    cta: {
      title: 'Ready to take the next step?',
      primaryButtonText: 'Apply Now',
      secondaryButtonText: 'Learn More About Us',
    },
  },

  media: {
    hero: {
      badge: 'Media Gallery',
      title: 'Moments that make us proud',
      subtitle: 'Explore photos and videos from our events, activities, and daily school life.',
      image: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1920&q=70',
    },
    photoSection: {
      title: 'Photo Gallery',
      subtitle: 'Capturing memorable moments',
    },
    videoSection: {
      title: 'Video Gallery',
      subtitle: 'Watch our stories come alive',
    },
  },
}

export function getPageSchema(slug: string): PageSchema | undefined {
  return PAGE_SCHEMAS.find((s) => s.slug === slug)
}

export function getPageData(slug: string): any {
  return DEFAULT_PAGE_DATA[slug] || {}
}
