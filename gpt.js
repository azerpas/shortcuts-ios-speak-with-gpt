const BASE_URL = "https://api.openai.com"
const MODEL = "gpt-3.5-turbo"

class Gpt {
  constructor(apiKey) {
    this.apiKey = apiKey
    this.messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant.'
      }
    ]
  }
  
  async newMessage (message) {
    this.messages.push({role: 'user', content: message})
    let req = new Request(`${BASE_URL}/v1/chat/completions`)
    req.method = 'POST'
    req.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json' 
    }
    req.body = `{"model": "${MODEL}", "messages": ${JSON.stringify(this.messages)}}`
    let res = await req.loadJSON()
    if (res.error) {
      throw new GptError(`There was an error while processing the request to ChatGPT: ${res.error.message}`)
    }
    let resMsg = res.choices[0].message
    this.messages.push(resMsg)
    return resMsg.content
  }
  
  async saveMessages () {} 
}

class GptError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GptError';
  }
}

module.exports.Gpt = Gpt
