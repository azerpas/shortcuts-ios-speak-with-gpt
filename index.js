const _args = args.plainTexts

if (_args.length < 3) {
  throw new Error('Missing args, order is "id, speech, response, action"')
}

if (!_args[0]) throw new Error('Missing arg "id", canno\'t identify the chat')

const [id, speech, response, action] = _args

let messages = [
  {
    role: 'system',
    content: 'You are a helpful assistant who works with Siri, the Apple assistant, to deliver quality information. You don\'t have access to the Apple device thus you canno\'t execute actions like calling a person or sending a message, that will come in a next version. Provide your answer in JSON form. Reply with only the answer in JSON form and include no other commentary. One field should be "action" with values possibles ["message", "saveConversation", "pause"], the other one should be "message", which contains your answer. If you sense that the current message received instructs you to save the current messages/conversation, set the "action" field to "saveConversation". If you sense that the current message received instructs you to put the conversation on pause or take a break, set the "action" field to "pause".'
  }
]

let fm = FileManager.iCloud()
let path = fm.joinPath(fm.documentsDirectory(), `${id}.json`)
if(fm.fileExists(path)) {
  await fm.downloadFileFromiCloud(path)
  const output = JSON.parse(Data.fromFile(path).toRawString())
  messages = output.messages
}

async function pause() {
  // Display messages as a table
  const table = new UITable()
  table.showSeparators = true
  // Add a row for each message
  for (let i = 1; i < messages.length; i++) {
    const row = new UITableRow()
    const rawMessage = messages[i].content.includes("{") ? JSON.parse(messages[i].content).message : messages[i].content
    row.addText(messages[i].role === 'user' ? '👤' : '🤖', rawMessage)
    table.addRow(row)
  }
  await table.present()
}

async function parse(body) {
  const res = JSON.parse(body)
  if (res.error) {
    Script.setShortcutOutput(`There was an error while processing the request to ChatGPT: ${res.error.message}`)
    Script.complete()
  }
  const answer = res.choices[0].message
  messages.push(answer)
  return JSON.parse(answer.content)
}

// Check if we're receiving a ChatGPT answer or a User speech
if (response.trim() === 'undefined' && speech.trim() !== 'undefined') {
  // Push User speech
  messages.push({role: 'user', content: speech})
  Script.setShortcutOutput(JSON.stringify({messages: messages, model: 'gpt-3.5-turbo'}))
} else if (response.trim() !== 'undefined' && speech.trim() === 'undefined') {
  // Parse and push ChatGPT answer
  const parsedAnswer = await parse(response)
  switch (parsedAnswer.action.trim()) {
    case "pause":
      Script.setShortcutOutput('[PAUSE]')
      break
    default:
      try {
        Script.setShortcutOutput(parsedAnswer.message)
      } catch(e){
        throw new Error(`Could not set shortcut output '${parsedAnswer.toString()}', ${e.message}`)
      }
      break
  }
} else if (action !== undefined) {
  if (action.trim() === "pause") {
    await pause()
  }
}

fm.write(path, Data.fromString(JSON.stringify({messages: messages, model: 'gpt-3.5-turbo'})))

Script.complete()
