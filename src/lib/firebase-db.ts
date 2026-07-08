// =====================================================
// Firebase Data Layer - Replaces Prisma ORM
// Copy this file to any project to use Firebase as database
// =====================================================
// This file provides a Prisma-compatible interface using Firebase Realtime Database
// Supports: findUnique, findMany, findFirst, create, update, delete, deleteMany,
//           count, aggregate, groupBy, upsert, updateMany, $transaction
// =====================================================

const FIREBASE_DB_URL = 'https://newschool-15515-default-rtdb.firebaseio.com'

// ============ LOW-LEVEL FIREBASE OPERATIONS ============

async function fbGet(path: string): Promise<any | null> {
  const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`)
  if (!res.ok) return null
  return res.json()
}

async function fbSet(path: string, data: any): Promise<void> {
  await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

async function fbUpdate(path: string, data: any): Promise<void> {
  await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

async function fbRemove(path: string): Promise<void> {
  await fetch(`${FIREBASE_DB_URL}/${path}.json`, { method: 'DELETE' })
}

async function fbPush(path: string, data: any): Promise<string> {
  const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await res.json()
  return result.name
}

// ============ ID GENERATOR ============

function generateId(): string {
  return 'fb_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10)
}

// ============ DATE HELPERS ============

function toISO(date: any): string | null {
  if (!date) return null
  if (typeof date === 'string') return date
  if (date instanceof Date) return date.toISOString()
  if (typeof date === 'number') return new Date(date).toISOString()
  return new Date().toISOString()
}

function now(): string {
  return new Date().toISOString()
}

// ============ FIREBASE MODEL CLASS ============

class FirebaseModel {
  constructor(private collection: string) {}

  private async getAll(): Promise<Record<string, any>> {
    const data = await fbGet(this.collection)
    return data || {}
  }

  async findUnique(args: {
    where: Record<string, any>
    include?: Record<string, boolean | object>
    [key: string]: any
  }): Promise<any | null> {
    const all = await this.getAll()
    const entries = Object.entries(all)
    for (const [id, record] of entries) {
      if (this.matchesWhere(record, args.where)) {
        const result = { ...record, id }
        if (args.include) await this.applyIncludes(result, args.include)
        return result
      }
    }
    return null
  }

  async findFirst(args: {
    where?: Record<string, any>
    include?: Record<string, boolean | object>
    orderBy?: Record<string, string>
    [key: string]: any
  }): Promise<any | null> {
    const results = await this.findMany(args)
    return results[0] || null
  }

  async findMany(args?: {
    where?: Record<string, any>
    include?: Record<string, boolean | object>
    orderBy?: Record<string, string>
    take?: number
    skip?: number
    select?: Record<string, boolean>
    distinct?: string[]
    [key: string]: any
  }): Promise<any[]> {
    const all = await this.getAll()
    let records = Object.entries(all).map(([id, record]) => ({ ...record, id }))
    if (args?.where) records = records.filter(record => this.matchesWhere(record, args.where!))
    if (args?.orderBy) {
      for (const [field, direction] of Object.entries(args.orderBy)) {
        records.sort((a, b) => {
          let aVal = a[field], bVal = b[field]
          if (typeof aVal === 'string' && aVal.includes('T')) aVal = new Date(aVal).getTime()
          if (typeof bVal === 'string' && bVal.includes('T')) bVal = new Date(bVal).getTime()
          if (typeof aVal === 'number' && typeof bVal === 'number') return direction === 'desc' ? bVal - aVal : aVal - bVal
          return direction === 'desc' ? String(bVal||'').localeCompare(String(aVal||'')) : String(aVal||'').localeCompare(String(bVal||''))
        })
      }
    }
    if (args?.skip) records = records.slice(args.skip)
    if (args?.take) records = records.slice(0, args.take)
    if (args?.distinct) {
      const seen = new Set()
      records = records.filter(record => {
        const key = args.distinct!.map(f => record[f]).join('|')
        if (seen.has(key)) return false
        seen.add(key); return true
      })
    }
    if (args?.include) for (const record of records) await this.applyIncludes(record, args.include!)
    if (args?.select) {
      records = records.map(record => {
        const selected: any = { id: record.id }
        for (const [field, val] of Object.entries(args.select!)) if (val) selected[field] = record[field]
        return selected
      })
    }
    return records
  }

  async create(args: {
    data: Record<string, any>
    include?: Record<string, boolean | object>
    [key: string]: any
  }): Promise<any> {
    const id = args.data.id || generateId()
    const nowVal = now()
    const record = { ...args.data, id, createdAt: args.data.createdAt || nowVal, updatedAt: args.data.updatedAt || nowVal }
    await fbSet(`${this.collection}/${id}`, this.serialize(record))
    if (args.include) await this.applyIncludes(record, args.include)
    return record
  }

  async update(args: {
    where: Record<string, any>
    data: Record<string, any>
    include?: Record<string, boolean | object>
    [key: string]: any
  }): Promise<any> {
    const record = await this.findUnique({ where: args.where })
    if (!record) throw new Error(`Record not found in ${this.collection}`)
    const updated = { ...record, ...args.data, updatedAt: now() }
    const cleanData: any = {}
    for (const [key, value] of Object.entries(updated)) if (value !== undefined) cleanData[key] = value
    await fbSet(`${this.collection}/${record.id}`, this.serialize(cleanData))
    if (args.include) await this.applyIncludes(cleanData, args.include)
    return cleanData
  }

  async upsert(args: {
    where: Record<string, any>
    create: Record<string, any>
    update: Record<string, any>
    include?: Record<string, boolean | object>
    [key: string]: any
  }): Promise<any> {
    const existing = await this.findUnique({ where: args.where })
    if (existing) return this.update({ where: args.where, data: args.update, include: args.include })
    return this.create({ data: args.create, include: args.include })
  }

  async updateMany(args: {
    where?: Record<string, any>
    data: Record<string, any>
    [key: string]: any
  }): Promise<{ count: number }> {
    const records = await this.findMany({ where: args.where })
    for (const record of records) {
      const updated = { ...record, ...args.data, updatedAt: now() }
      const cleanData: any = {}
      for (const [key, value] of Object.entries(updated)) if (value !== undefined) cleanData[key] = value
      await fbSet(`${this.collection}/${record.id}`, this.serialize(cleanData))
    }
    return { count: records.length }
  }

  async delete(args: { where: Record<string, any>; [key: string]: any }): Promise<any> {
    const record = await this.findUnique({ where: args.where })
    if (!record) throw new Error(`Record not found in ${this.collection}`)
    await fbRemove(`${this.collection}/${record.id}`)
    return record
  }

  async deleteMany(args?: { where?: Record<string, any>; [key: string]: any }): Promise<{ count: number }> {
    if (!args?.where) { await fbRemove(this.collection); return { count: -1 } }
    const records = await this.findMany({ where: args.where })
    for (const record of records) await fbRemove(`${this.collection}/${record.id}`)
    return { count: records.length }
  }

  async count(args?: { where?: Record<string, any>; [key: string]: any }): Promise<number> {
    const records = await this.findMany({ where: args?.where })
    return records.length
  }

  async aggregate(args: {
    where?: Record<string, any>
    _sum?: Record<string, boolean>
    _count?: Record<string, boolean>
    _avg?: Record<string, boolean>
    _min?: Record<string, boolean>
    _max?: Record<string, boolean>
    [key: string]: any
  }): Promise<any> {
    const records = await this.findMany({ where: args.where })
    const result: any = {}
    if (args._sum) { result._sum = {}; for (const f of Object.keys(args._sum)) result._sum[f] = records.reduce((s, r) => s + (Number(r[f]) || 0), 0) }
    if (args._count) { result._count = {}; for (const f of Object.keys(args._count)) result._count[f] = f === '_all' ? records.length : records.filter(r => r[f] != null).length }
    if (args._avg) { result._avg = {}; for (const f of Object.keys(args._avg)) { const v = records.map(r => Number(r[f])||0); result._avg[f] = v.length > 0 ? v.reduce((a,b)=>a+b,0)/v.length : 0 } }
    if (args._min) { result._min = {}; for (const f of Object.keys(args._min)) { const v = records.map(r => Number(r[f])||0); result._min[f] = v.length > 0 ? Math.min(...v) : 0 } }
    if (args._max) { result._max = {}; for (const f of Object.keys(args._max)) { const v = records.map(r => Number(r[f])||0); result._max[f] = v.length > 0 ? Math.max(...v) : 0 } }
    return result
  }

  async groupBy(args: {
    by: string[]
    where?: Record<string, any>
    _count?: Record<string, boolean>
    _sum?: Record<string, boolean>
    _avg?: Record<string, boolean>
    _min?: Record<string, boolean>
    _max?: Record<string, boolean>
    [key: string]: any
  }): Promise<any[]> {
    const records = await this.findMany({ where: args.where })
    const groups: Record<string, any[]> = {}
    for (const record of records) {
      const key = args.by.map(f => record[f]).join('|')
      if (!groups[key]) groups[key] = []
      groups[key].push(record)
    }
    return Object.entries(groups).map(([key, groupRecords]) => {
      const values = key.split('|')
      const result: any = {}
      args.by.forEach((field, i) => result[field] = values[i])
      if (args._count) { result._count = {}; for (const f of Object.keys(args._count)) result._count[f] = f === '_all' ? groupRecords.length : groupRecords.filter(r => r[f] != null).length }
      if (args._sum) { result._sum = {}; for (const f of Object.keys(args._sum)) result._sum[f] = groupRecords.reduce((s, r) => s + (Number(r[f])||0), 0) }
      return result
    })
  }

  // ============ HELPER METHODS ============

  private matchesWhere(record: any, where: any): boolean {
    if (!where) return true
    for (const [key, value] of Object.entries(where)) {
      if (key === 'AND') { for (const c of value as any[]) if (!this.matchesWhere(record, c)) return false; continue }
      if (key === 'OR') { let m = false; for (const c of value as any[]) if (this.matchesWhere(record, c)) { m = true; break }; if (!m) return false; continue }
      if (key === 'NOT') { if (this.matchesWhere(record, value)) return false; continue }
      const rv = record[key]
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        for (const [op, ov] of Object.entries(value)) {
          switch (op) {
            case 'equals': if (rv !== ov) return false; break
            case 'not': if (rv === ov) return false; break
            case 'contains': if (!String(rv||'').toLowerCase().includes(String(ov).toLowerCase())) return false; break
            case 'startsWith': if (!String(rv||'').startsWith(String(ov))) return false; break
            case 'endsWith': if (!String(rv||'').endsWith(String(ov))) return false; break
            case 'in': if (!Array.isArray(ov) || !ov.includes(rv)) return false; break
            case 'notIn': if (Array.isArray(ov) && ov.includes(rv)) return false; break
            case 'gt': if (!(Number(rv) > Number(ov))) return false; break
            case 'gte': if (!(Number(rv) >= Number(ov))) return false; break
            case 'lt': if (!(Number(rv) < Number(ov))) return false; break
            case 'lte': if (!(Number(rv) <= Number(ov))) return false; break
            case 'gte_lte': if (typeof rv === 'string') { const d = new Date(rv).getTime(); if (d < new Date(ov[0]).getTime() || d >= new Date(ov[1]).getTime()) return false } break
          }
        }
      } else { if (rv !== value) return false }
    }
    return true
  }

  private async applyIncludes(record: any, include: Record<string, boolean | object>): Promise<void> {
    for (const [relation, config] of Object.entries(include)) {
      if (config === false) continue
      const includeConfig = typeof config === 'object' ? config : {}
      const relationModel = MODEL_REGISTRY[relation]
      if (relationModel) {
        const fkField = `${relation}Id`
        const fkFieldLower = `${relation.toLowerCase()}Id`
        if (record[fkField] || record[fkFieldLower]) {
          const fkValue = record[fkField] || record[fkFieldLower]
          const selectConfig = (includeConfig as any).select
          if (selectConfig) {
            const related = await relationModel.findUnique({ where: { id: fkValue } })
            if (related) { const filtered: any = {}; for (const f of Object.keys(selectConfig)) if (selectConfig[f]) filtered[f] = related[f]; record[relation] = filtered }
            else record[relation] = null
          } else {
            record[relation] = await relationModel.findUnique({ where: { id: fkValue } })
          }
        } else {
          const thisSingular = this.collection.endsWith('s') ? this.collection.slice(0, -1) : this.collection
          const possibleFks = [`${thisSingular}Id`, `${this.collection}Id`]
          let related: any[] = []
          for (const fk of possibleFks) { related = await relationModel.findMany({ where: { [fk]: record.id } }); if (related.length > 0) break }
          if (related.length === 0) { const tn = this.collection.toLowerCase().replace(/s$/, ''); related = await relationModel.findMany({ where: { [`${tn}Id`]: record.id } }) }
          const isOneToOne = !relation.endsWith('s') || ['attendance', 'mediaItem', 'financeTransaction'].includes(relation)
          record[relation] = isOneToOne ? (related[0] || null) : related
        }
      }
    }
  }

  private serialize(record: any): any {
    const result: any = {}
    for (const [key, value] of Object.entries(record)) {
      if (value === undefined) continue
      if (value instanceof Date) result[key] = (value as Date).toISOString()
      else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if (typeof (value as any).toISOString === 'function') result[key] = (value as any).toISOString()
        else result[key] = value
      } else result[key] = value
    }
    return result
  }

  private deserialize(record: any): any { return record }
}

// ============ MODEL REGISTRY ============

const MODEL_REGISTRY: Record<string, FirebaseModel> = {}

function createModel(name: string, collection?: string): FirebaseModel {
  const model = new FirebaseModel(collection || name)
  MODEL_REGISTRY[name] = model
  return model
}

// ============ DATABASE OBJECT ============

export const db = {
  user: createModel('user', 'users'),
  session: createModel('session', 'sessions'),
  grade: createModel('grade', 'grades'),
  section: createModel('section', 'sections'),
  subject: createModel('subject', 'subjects'),
  academicYear: createModel('academicYear', 'academicYears'),
  semester: createModel('semester', 'semesters'),
  teacherAssignment: createModel('teacherAssignment', 'teacherAssignments'),
  curriculum: createModel('curriculum', 'curricula'),
  lessonPlan: createModel('lessonPlan', 'lessonPlans'),
  timetable: createModel('timetable', 'timetables'),
  examType: createModel('examType', 'examTypes'),
  exam: createModel('exam', 'exams'),
  gradingSystem: createModel('gradingSystem', 'gradingSystems'),
  holiday: createModel('holiday', 'holidays'),
  mark: createModel('mark', 'marks'),
  attendance: createModel('attendance', 'attendance'),
  assignment: createModel('assignment', 'assignments'),
  assignmentSubmission: createModel('assignmentSubmission', 'assignmentSubmissions'),
  promotion: createModel('promotion', 'promotions'),
  reportCard: createModel('reportCard', 'reportCards'),
  rank: createModel('rank', 'ranks'),
  student: createModel('student', 'students'),
  teacher: createModel('teacher', 'teachers'),
  financeStaff: createModel('financeStaff', 'financeStaff'),
  librarian: createModel('librarian', 'librarians'),
  hrStaff: createModel('hrStaff', 'hrStaff'),
  financeTransaction: createModel('financeTransaction', 'financeTransactions'),
  feeStructure: createModel('feeStructure', 'feeStructures'),
  book: createModel('book', 'books'),
  libraryLoan: createModel('libraryLoan', 'libraryLoans'),
  cMSPage: createModel('cMSPage', 'cmsPages'),
  siteSetting: createModel('siteSetting', 'siteSettings'),
  socialLink: createModel('socialLink', 'socialLinks'),
  mediaItem: createModel('mediaItem', 'mediaItems'),
  contactMessage: createModel('contactMessage', 'contactMessages'),
  notification: createModel('notification', 'notifications'),
  event: createModel('event', 'events'),
  registrationApplication: createModel('registrationApplication', 'registrationApplications'),
  iDCard: createModel('iDCard', 'idCards'),
  certificate: createModel('certificate', 'certificates'),
  async $transaction(operations: Promise<any>[]): Promise<any[]> { return Promise.all(operations) },
  async $disconnect(): Promise<void> {},
}

export { fbGet, fbSet, fbUpdate, fbRemove, fbPush, generateId }
