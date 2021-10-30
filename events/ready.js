const client = require('../index').client

client.on('ready', () => {
    console.log('Online')
})