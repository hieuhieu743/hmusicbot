const client = require('../index').client
const { prefix } = require('../config.json')

client.on('messageCreate', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    let messageArrey = message.content.split(" ");
    let cmd = messageArrey[0];
    let args = messageArrey.slice(1);

    let command = args.shift()

    let commands = client.commands.get(cmd.slice(prefix.length)) || client.commands.get(client.aliases.get(cmd.slice(prefix.length)));

    if (commands) {
        if (!message.content.startsWith(prefix)) return
        commands.run(client, message, command, args, prefix)
    }
})