import type { NextApiRequest, NextApiResponse } from 'next'
import axios, { AxiosError } from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/properties/${id}`,
      {
        headers: {
          Authorization: `Bearer ${req.cookies.token || ''}`,
        },
      }
    )
    return res.status(200).json(data)
  } catch (error) {
    if (error instanceof Error) {
      const axiosError = error as AxiosError
      console.error(
        'API /properties/[id] error:',
        axiosError.response?.data || axiosError.message
      )
      return res.status(axiosError.response?.status || 500).json({ 
        error: 'Could not fetch property details' 
      })
    }
    console.error('Unknown error:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
}