//Sensitive API key is placed in serverless function so that key is kept on the server and only results are sent to client. Avoiding API call directly from client-side (browser) so API key isn't exposed.
//Tradeoff between security and latency
//To reduce latency issues, I could implement caching mechanisms to store and reuse requested data
import { Configuration, OpenAIApi } from "openai"

//Create new Configuration instance with OpenAI API key from Netlify environment variables
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

delete configuration.baseOptions.headers['User-Agent'];

//Create instance of OpenAIApi using the configured API key
const openai = new OpenAIApi(configuration)

//Define serverless function handler
const handler = async (event) => {
  try {
    //Make request to OpenAI's createCompletion endpoint
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: event.body,
      temperature: 0.8,
      max_tokens: 150
    })
      // let prompt = await response.data.choices[0].text.trim();
      //Extract relevant information from the response
    const subject = event.queryStringParameters.name || 'World'
    return {
      statusCode: 200,
      body: JSON.stringify({ reply: response.data }),
    }
  } catch (error) {
    console.log(error.toString());
    return { statusCode: 500, body: error.toString() }
  }
}
//Export handler function for use as Netlify serverless function
module.exports = { handler }
