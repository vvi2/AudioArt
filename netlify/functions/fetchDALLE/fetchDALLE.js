import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

delete configuration.baseOptions.headers['User-Agent'];
  
const openai = new OpenAIApi(configuration)

const handler = async (event) => {
  try {
    const response = await openai.createImage({
      prompt: event.body,
      n: 1,
      size: '256x256',
      response_format: 'url'
    })
      // let prompt = await response.data.choices[0].text.trim();
    const subject = event.queryStringParameters.name || 'World'
    return {
      statusCode: 200,
      body: JSON.stringify({ reply: response.data }),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }