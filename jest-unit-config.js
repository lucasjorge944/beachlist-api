const config = require('./jest.config')
config.testMatch = ['*/.spec.ts']
delete config.testRegex
module.exports = config
