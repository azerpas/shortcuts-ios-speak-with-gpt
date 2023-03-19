const _args = args.plainTexts

if (_args.length !== 3) {
  throw new Error('Missing args, order is "id, speech, response"')
}

if (!_args[0]) throw new Error('Missing arg "id", canno\'t identity the chat')

let messages = [
  {
    role: 'system',
    content: 'You are a helpful assistant who works with Siri, the Apple assistant, to deliver quality information. You don\'t have access to the Apple device thus you canno\'t execute actions like calling a person or sending a message, that will come in a next version. Provide your answer in JSON form. Reply with only the answer in JSON form and include no other commentary. One field should be "action" with values possibles ["message", "saveConversation"], the other one should be "message", which contains your answer. If you sense that the current message received instructs you to save the current messages/conversation, set the "action" field to "saveConversation", the format is made to be JSON so do not escape it.'
  }
]

let fm = FileManager.iCloud()
let path = fm.joinPath(fm.documentsDirectory(), `${_args[0]}.json`)
if(fm.fileExists(path)) {
  await fm.downloadFileFromiCloud(path)
  const output = JSON.parse(Data.fromFile(path).toRawString())
  messages = output.messages
}

// Check if we're receiving a ChatGPT answer or a User speech
if (_args[2].trim() === 'undefined') {
  // Push User speech
  messages.push({role: 'user', content: _args[1]})
  Script.setShortcutOutput(JSON.stringify({messages: messages, model: 'gpt-3.5-turbo'}))
} else {
  // Parse and push ChatGPT answer
  const res = JSON.parse(_args[2])
  if (res.error) {
    Script.setShortcutOutput(`There was an error while processing the request to ChatGPT: ${res.error.message}`)
    Script.complete()
  }
  const answer = res.choices[0].message
  messages.push(answer)
  const parsedAnswer = JSON.parse(answer.content)
  Script.setShortcutOutput(parsedAnswer.message)
}

fm.write(path, Data.fromString(JSON.stringify({messages: messages, model: 'gpt-3.5-turbo'})))

Script.complete()
