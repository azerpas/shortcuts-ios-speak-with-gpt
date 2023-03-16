const BASE_URL = "https://api.openai.com/"
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
  
  async function newMessage (message) {
    this.messages.push({role: 'user', content: message})
    let req = new Request(`${BASE_URL}/v1/chat/completions`)
    req.method = 'POST'
    req.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json' 
    }
    req.body = `{"model": "${MODEL}", "messages": JSON.stringify()}`
    let res = await req.loadJSON()
    let resMsg = res.choices[0].message
    this.messages.push(resMsg)
    return resMsg.content
  }
  
  async function saveMessages () {} 
}

