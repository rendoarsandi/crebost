import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { prisma } from '@crebost/database'
import { userRegistrationSchema } from '@crebost/shared'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Validate input
    const validatedData = userRegistrationSchema.parse(req.body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
        role: validatedData.role,
        phone: validatedData.phone,
        bio: validatedData.bio,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })

    // Log registration event
    await prisma.analyticsEvent.create({
      data: {
        userId: user.id,
        eventType: 'user_registration',
        eventData: {
          role: user.role,
          method: 'credentials',
        },
        ipAddress: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    })

    res.status(201).json({
      success: true,
      data: user,
      message: 'User registered successfully',
    })
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.message,
      })
    }

    res.status(500).json({ error: 'Internal server error' })
  }
}
