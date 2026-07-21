import crypto from 'crypto'

const IV = '@@@@&&&&####$$$$' // Standard IV used by Paytm Checksum library

export function encrypt(data: string, key: string): string {
  const cipher = crypto.createCipheriv('aes-128-cbc', key, IV)
  let encrypted = cipher.update(data, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  return encrypted
}

export function decrypt(data: string, key: string): string {
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, IV)
  let decrypted = decipher.update(data, 'base64', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export function generateSignature(params: Record<string, string>, key: string): string {
  const sortedKeys = Object.keys(params).sort()
  const data = sortedKeys.map((k) => params[k]).join('|') + '|'

  const hash = crypto.createHash('sha256').update(data + key).digest('hex')
  return encrypt(hash, key)
}

export function verifySignature(
  params: Record<string, string>,
  key: string,
  signature: string
): boolean {
  try {
    const sortedKeys = Object.keys(params).sort()
    const data = sortedKeys.map((k) => params[k]).join('|') + '|'

    const decryptedHash = decrypt(signature, key)
    const calculatedHash = crypto.createHash('sha256').update(data + key).digest('hex')

    return decryptedHash === calculatedHash
  } catch (e) {
    console.error('Paytm signature verification error:', e)
    return false
  }
}
