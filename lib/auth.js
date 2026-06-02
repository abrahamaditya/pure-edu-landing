const SECRET = process.env.JWT_SECRET || 'fallback-secret-key-12345';

async function hmacSha256(message, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );

  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function createToken(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadStr = btoa(JSON.stringify({ 
    ...payload, 
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  }));
  const signature = await hmacSha256(header + '.' + payloadStr, SECRET);
  return `${header}.${payloadStr}.${signature}`;
}

export async function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payloadStr, signature] = parts;
    
    const expectedSig = await hmacSha256(header + '.' + payloadStr, SECRET);
    if (signature !== expectedSig) return null;
    
    const payload = JSON.parse(atob(payloadStr));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch (e) {
    return null;
  }
}
