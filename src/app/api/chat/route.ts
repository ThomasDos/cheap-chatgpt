// Make sure to add OPENAI_API_KEY as a secret

import { NextRequest, NextResponse } from 'next/server'
import { ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

async function chatHandler(req: NextRequest) {
  try {
    const { messages, model, role_selected } = await req.json()

    const completion = await openai.createChatCompletion({
      model,
      messages: [
        {
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: role_selected
        }
      ].concat(messages)
    })

    return NextResponse.json({ result: completion.data.choices[0].message })
  } catch (error) {
    console.log('Error :', error)
    return NextResponse.json({ error })
  }
}

export { chatHandler as POST }
