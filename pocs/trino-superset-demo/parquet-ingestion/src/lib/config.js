const RC = require('parse-strings-in-object')(require('rc')('CLEDG', require('../../config/default.json')))

module.exports = {
  S3_CONFIG: RC.S3,
  KAFKA_CONFIG: RC.KAFKA,
}