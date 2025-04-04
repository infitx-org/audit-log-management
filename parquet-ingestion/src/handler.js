const Utility = require('@mojaloop/central-services-shared').Util
const Kafka = require('@mojaloop/central-services-shared').Util.Kafka
const Consumer = require('@mojaloop/central-services-stream').Util.Consumer
const Config = require('./lib/config')
const { randomUUID } = require('crypto')
const { processBatch } = require('./parquetS3Upload')

const consumerCommit = true

const auditLogs = async (error, messages) => {
  let consumedMessages = []

  if (Array.isArray(messages)) {
    consumedMessages = Array.from(messages)
  } else {
    consumedMessages = [Object.assign({}, Utility.clone(messages))]
  }
 
  const firstMessageOffset = consumedMessages[0]?.offset
  const lastMessageOffset = consumedMessages[consumedMessages.length - 1]?.offset
  const binId = `${firstMessageOffset}-${lastMessageOffset}`
 
  // Iterate through consumedMessages
  const lastPerPartition = {}
  consumedMessages.forEach(message => {
    const last = lastPerPartition[message.partition]
    if (!last || message.offset > last.offset) {
      lastPerPartition[message.partition] = message
    }
  })
 
  try {
    console.log('auditLogs', { binId, firstMessageOffset, lastMessageOffset })
 
    await processBatch(consumedMessages)
    // If success, commit the offset
    // Commit the offset of last message in the array
    for (const message of Object.values(lastPerPartition)) {
      const params = { message, kafkaTopic: message.topic, consumer: Consumer }
      // We are using Kafka.proceed() to just commit the offset of the last message in the array
      await Kafka.proceed(Config.KAFKA_CONFIG, params, { consumerCommit, hubName: '' })
    }
      
   } catch (err) {
    console.log(err)
   }
 }
 

const registerHandler = async () => {
  Config.KAFKA_CONFIG.rdkafkaConf['client.id'] = `${Config.KAFKA_CONFIG.rdkafkaConf['client.id']}-${randomUUID()}`
  await Consumer.createHandler(Config.KAFKA_CONFIG.topic, Config.KAFKA_CONFIG, auditLogs)
  return true
}

 
module.exports = {
  registerHandler
}