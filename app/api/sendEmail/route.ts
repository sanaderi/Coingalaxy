import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
import { EmailTemplate } from '@/app/components/email/template'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const body = await request.json();
    if (!body.subject || !body.txt) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    let receiver = process.env.BOT_OWNER_EMAIL
    if (receiver) {
      const response= await resend.emails.send({
        from: 'Support <support@coingalaxy.info>',
        to: [receiver],
        subject: body.subject,
        react: EmailTemplate({ txt: body.txt })
      })  
    }
      
    
    return NextResponse.json({message:"OK"})
}