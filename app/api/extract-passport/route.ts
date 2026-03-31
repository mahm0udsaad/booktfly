import { NextRequest, NextResponse } from 'next/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })
import { generateObject } from 'ai'
import { z } from 'zod'

const passportSchema = z.object({
  first_name: z.string().describe('First/given name in English Latin characters'),
  last_name: z.string().describe('Surname/family name in English Latin characters'),
  date_of_birth: z.string().describe('Date of birth in YYYY-MM-DD format, or empty string if unreadable'),
  id_number: z.string().describe('Passport or ID number'),
  id_expiry_date: z.string().describe('ID expiry date in YYYY-MM-DD format, or empty string if unreadable'),
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('images') as File[]

    if (!files.length) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 })
    }

    const images = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer()
        return {
          type: 'image' as const,
          image: Buffer.from(bytes),
          mimeType: file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
        }
      })
    )

    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: passportSchema,
      messages: [
        {
          role: 'user',
          content: [
            ...images,
            {
              type: 'text',
              text: 'Extract passport/ID information from this image. All names must be in English Latin characters. Dates must be in YYYY-MM-DD format. If a field cannot be read, use an empty string.',
            },
          ],
        },
      ],
      temperature: 0,
    })

    return NextResponse.json({ data: object })
  } catch (error) {
    console.error('Extract passport error:', error)
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 })
  }
}
