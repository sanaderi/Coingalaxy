// app/api/generateKeys/route.ts
import { NextResponse } from 'next/server';
import { generateKeyPairSync } from 'crypto';

export async function GET() {
  try {
    // Generate RSA keys
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'der', // Binary format
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'der', // Binary format
      },
    });

    // Convert binary keys to base64 for JSON transport
    const publicKeyBase64 = publicKey.toString('base64');
    const privateKeyBase64 = privateKey.toString('base64');

    return NextResponse.json({
      success: true,
      publicKey: publicKeyBase64,
      privateKey: privateKeyBase64,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
    });
  }
}
