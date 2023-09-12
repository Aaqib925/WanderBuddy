// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  pointsOfInterest?: any
  message?: string
}

const GPT_KEY = process.env.GPT_API_KEY

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${GPT_KEY}`,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { pointsOfInterestPrompt } = JSON.parse(req.body)
  const response2 = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: pointsOfInterestPrompt }],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  let pointsOfInterest = await response2.json()
  console.log('RESULT 2:', pointsOfInterest.choices[0].message.content)

  pointsOfInterest = pointsOfInterest.choices[0].message.content.split('\n')
  pointsOfInterest = pointsOfInterest[pointsOfInterest.length - 1]
  pointsOfInterest = pointsOfInterest.split(',')
  const pointsOfInterestArray = pointsOfInterest.map((i) => i.trim())
  console.log('RESULT 3:', pointsOfInterestArray)

  res.status(200).json({
    pointsOfInterest: JSON.stringify(pointsOfInterestArray),
  })
}
