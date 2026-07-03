// Firebase Realtime Database integration for the School Management System
// Database URL: https://newschool-15515-default-rtdb.firebaseio.com/

const FIREBASE_DB_URL = 'https://newschool-15515-default-rtdb.firebaseio.com'

/**
 * Write data to a Firebase path (replaces all data at that path)
 */
export async function firebaseSet(path: string, data: any): Promise<any> {
  const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Firebase set failed: ${res.status}`)
  return res.json()
}

/**
 * Push data to a Firebase path (creates a new unique key)
 */
export async function firebasePush(path: string, data: any): Promise<{ key: string }> {
  const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Firebase push failed: ${res.status}`)
  const result = await res.json()
  return { key: result.name }
}

/**
 * Update specific fields at a Firebase path (merges with existing data)
 */
export async function firebaseUpdate(path: string, data: any): Promise<any> {
  const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Firebase update failed: ${res.status}`)
  return res.json()
}

/**
 * Read data from a Firebase path
 */
export async function firebaseGet<T = any>(path: string): Promise<T | null> {
  const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`)
  if (!res.ok) throw new Error(`Firebase get failed: ${res.status}`)
  const data = await res.json()
  return data as T
}

/**
 * Delete data at a Firebase path
 */
export async function firebaseRemove(path: string): Promise<boolean> {
  const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
    method: 'DELETE',
  })
  return res.ok
}

/**
 * Sync a record to Firebase (upsert by key)
 * Stores under: {collection}/{id}
 */
export async function firebaseSync(collection: string, id: string, data: any): Promise<void> {
  await firebaseSet(`${collection}/${id}`, {
    ...data,
    syncedAt: new Date().toISOString(),
  })
}

/**
 * Remove a record from Firebase
 */
export async function firebaseUnsync(collection: string, id: string): Promise<void> {
  await firebaseRemove(`${collection}/${id}`)
}

/**
 * Get all records from a collection
 */
export async function firebaseGetCollection<T = any>(collection: string): Promise<Record<string, T>> {
  return (await firebaseGet<Record<string, T>>(collection)) || {}
}

/**
 * Broadcast a real-time notification to all connected clients
 * Listeners on /notifications will receive this instantly
 */
export async function firebaseBroadcast(channel: string, data: any): Promise<void> {
  await firebasePush(`broadcasts/${channel}`, {
    ...data,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Write system status (online users, server status, etc.)
 */
export async function firebaseSetStatus(key: string, data: any): Promise<void> {
  await firebaseSet(`status/${key}`, {
    ...data,
    updatedAt: new Date().toISOString(),
  })
}
