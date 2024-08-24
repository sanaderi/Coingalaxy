import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { Buffer } from 'buffer' // Ensure buffer is imported

interface EncryptRequestBody {
  publicKey: string // Base64-encoded DER public key
  data: {
    wallet_address: string
    url: string
    callback: string
    order_id: string
    value: string
  } // Specific object structure
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body to get the public key and data
    const body: EncryptRequestBody = await req.json()
    const { publicKey, data } = body

    // Validate that the public key and data are provided
    if (
      !publicKey ||
      !data ||
      !data.wallet_address ||
      !data.order_id ||
      !data.url ||
      !data.callback ||
      !data.value
    ) {
      return NextResponse.json({
        success: false,
        error: 'Public key and data are required'
      })
    }

    // Convert base64-encoded public key to DER format buffer
    const publicKeyBuffer = Buffer.from(publicKey, 'base64')

    // Convert DER-format public key to PEM format
    const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKeyBuffer
      .toString('base64')
      .match(/.{1,64}/g)
      ?.join('\n')}\n-----END PUBLIC KEY-----`

    // Convert the JSON data to a string if it's an object
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data)

    // Encrypt the data using the provided public key
    const encryptedData = crypto.publicEncrypt(
      {
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
      },
      Buffer.from(jsonString)
    )

    // Convert the encrypted data to base64 for safe transport
    const encryptedDataBase64 = encryptedData.toString('base64')

    // Return the encrypted data
    return NextResponse.json({
      success: true,
      encryptedData: encryptedDataBase64
    })
  } catch (error: any) {
    // Handle any errors and return the error message
    return NextResponse.json({
      success: false,
      error: error.message || 'Encryption failed'
    })
  }
}
