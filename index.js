const {Gpt} = importModule('gpt')

const _args = args.plainTexts

if (_args.length < 1) {
  throw new Error('Missing arg "apiKey"')
}
const client = new Gpt(_args[0])

while (true) {
  const userInput = await Dictation.start("en")
  const response = await client.newMessage(userInput)
  Speech.speak(response)
}
