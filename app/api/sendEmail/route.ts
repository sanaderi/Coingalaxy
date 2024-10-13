import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
import { EmailTemplate } from '@/app/components/email/template'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    // const body = await request.json();
    // let receiver = process.env.BOT_OWNER_EMAIL
    // if (receiver)
    //   await resend.emails.send({
    //     from: 'Support <support@coingalaxy.info>',
    //     to: [receiver],
    //     subject: 'Error on swap',
    //     react: EmailTemplate({ txt: `Some error on swap: ${error}` })
    //   })
    
    return NextResponse.json({message:"OK"})
}