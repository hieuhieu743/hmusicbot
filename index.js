const { Client, Intents, Permissions, MessageEmbed, Collection } = require('discord.js');
const client = new Client({
    intents: [
        'GUILDS',
        'GUILD_VOICE_STATES',
        'GUILD_MESSAGES',
    ],
})
const { SoundCloudPlugin } = require('@distube/soundcloud')
const { SpotifyPlugin } = require('@distube/spotify')
const { token, prefix } = require('./config.json')
const { DisTube } = require('distube')
const fs = require('fs')

client.commands = new Collection();
client.aliases = new Collection();
client.events = new Collection();
module.exports.client = client;

const distube = new DisTube(client, {
    searchSongs: 6,
    searchCooldown: 60,
    emptyCooldown: 10,
    leaveOnFinish: true,
    leaveOnEmpty: true,
    leaveOnStop: true,
})

module.exports.distube = distube;

client.on('messageCreate', message => {
    if (message.author.bot) return
    if (!message.content.startsWith(prefix)) return
    const args = message.content
        .slice(prefix.length)
        .trim()
        .split(/ +/g)
    const command = args.shift()

    if (command === 'info') {
        const embed = new MessageEmbed()
            .setTitle('After a few months, HMusic is back!')
            .setDescription('HMusic is now comeback with new Technology and Features!\n`#HMusic` `#ComeBack` `#NewHMusic`')
            .setColor('#6f00ff')
            .setImage("https://cdn.discordapp.com/attachments/828447863012327466/893423643219091486/newHMusic.png")
            .addFields(
                { name: 'Prefix (Optional coming soon)', value: "`H`" },
                {
                    name: 'Commands:', value: `
                    **Hplay** - Play song
                    Usage: Hplay <song>
                    **Hrepeat/loop** - Repeat the song (2 type: \`This Song\` | \`All queue\`)
                    Usage: Hrepeat/loop
                    **Hstop** - Stop song
                    Usage: Hstop
                    **Hresume** - Resume playing song
                    Usage: Hresume
                    **Hpause** - Pause song
                    Usage: Hpause
                    **Hskip** - Skip to next song
                    Usage: Hskip
                    **Hqueue** - Show queue
                    Usage: Hqueue

                    Others:
                    **Hinfo** - Show bot infomation
                    Usage: Hinfo
                    **3d/bassboost/echo/karaoke/nightcore/vaporwave** - Filter song
                    Usage: H3d/bassboost/echo/karaoke/nightcore/vaporwave`
                }
            )

        message.channel.send({ embeds: [embed] })
    }

    if (command === 'play') distube.play(message, args.join(' '))

    if (['repeat', 'loop'].includes(command)) {
        const mode = distube.setRepeatMode(message)

        const embed = new MessageEmbed()
            .setTitle(`Set repeat mode to \`${mode ? mode === 2 ? 'All Queue' : 'This Song' : 'Off'}\``)
            .setColor('#6f00ff')

        message.channel.send({ embeds: [embed] })
    }

    if (command === 'stop') {
        const embed = new MessageEmbed()
            .setTitle('<:HCancel:838388742439436309> Stopped the music!')
            .setColor('#6f00ff')

        distube.stop(message)
        message.channel.send({ embeds: [embed] })
    }

    if (command === 'resume') {
        distube.resume(message)
        const embed = new MessageEmbed()
            .setTitle('<:HPlay:838388742749683723> Resume the music!')
            .setColor('#6f00ff')

        message.channel.send({ embeds: [embed] })
    }

    if (command === 'pause') {
        distube.pause(message)
        const embed = new MessageEmbed()
            .setTitle('<:HStop:838388742447300639> Pause the music!')
            .setColor('#6f00ff')

        message.channel.send({ embeds: [embed] })
    }

    if (command === 'skip') {
        distube.skip(message)
        const embed = new MessageEmbed()
            .setTitle('<:HSkip:893417498060398602> Skip to next music!')
            .setColor('#6f00ff')

        message.channel.send({ embeds: [embed] })
    }

    if (command === 'queue') {
        const queue = distube.getQueue(message)
        if (!queue) {
            const embed = new MessageEmbed()
                .setTitle('No song was found in queue!')
                .setColor('#6f00ff')

            message.channel.send({ embeds: [embed] })
        } else {
            const embed = new MessageEmbed()
                .setTitle(`Current queue:`)
                .setDescription(`${queue.songs
                    .map(
                        (song, id) =>
                            `**${id ? id : 'Playing'}**. ${song.name} - \`${song.formattedDuration
                            }\``,
                    )
                    .slice(0, 10)
                    .join('\n')}`)
                .setColor('#6f00ff')

            message.channel.send({ embeds: [embed] })
        }
    }

    if (
        [
            `3d`,
            `bassboost`,
            `echo`,
            `karaoke`,
            `nightcore`,
            `vaporwave`,
        ].includes(command)
    ) {
        const filter = distube.setFilter(message, command)
        message.channel.send(
            `Current queue filter: ${filter.join(', ') || 'Off'}`,
        )
    }
})

const status = queue =>
    `Volume: \`${queue.volume}%\` | Filter: \`${queue.filters.join(', ')
    || 'Off'}\` | Loop: \`${queue.repeatMode
        ? queue.repeatMode === 2
            ? 'All Queue'
            : 'This Song'
        : 'Off'
    }\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``


//Events
distube.on('playSong', (queue, song) => {
    const embed = new MessageEmbed()
        .setTitle(`<:HPlay:838388742749683723> Now Playing: \`${song.name}\` - \`${song.formattedDuration}\``)
        .setDescription(`Requested by: ${song.user}\n${status(queue)}`)
        .setColor('#6f00ff')
        .setURL(song.url)
        .setImage(song.thumbnail).video

    queue.textChannel.send({ embeds: [embed] })
})

distube.on('addSong', (queue, song) => {
    const embed = new MessageEmbed()
        .setTitle(`<:HAdd:838388743492337715> Added: \`${song.name}\` - \`${song.formattedDuration}\` to queue`)
        .setDescription(`Added by: ${song.user}`)
        .setColor('#6f00ff')

    queue.textChannel.send({ embeds: [embed] })
})

distube.on('addList', (queue, playlist) => {
    const embed = new MessageEmbed()
        .setTitle(`<:HAdd:838388743492337715> Added: \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue`)
        .setDescription(`${status(queue)}`)
        .setColor('#6f00ff')

    queue.textChannel.send({ embeds: [embed] })
})

distube.on('searchDone', (message, query) => {
    message.channel.send('Search Done')
})

distube.on('searchResult', (message, result) => {
    let i = 0
    message.channel.send(
        `**Choose an option from below <:HOption:838388742619660340>**\n${result
            .map(
                song =>
                    `**${++i}**. ${song.name} - \`${song.formattedDuration
                    }\``,
            )
            .join(
                '\n',
            )}\n*Enter anything else or wait ⏲ 60 seconds to cancel <:HCancel:838388742439436309>*`,
    )
})

distube.on('searchCancel', message => message.channel.send(`Searching canceled <:HCancel:838388742439436309>`))

distube.on('searchInvalidAnswer', message => message.channel.send(`<:HError:838388742888751164> searchInvalidAnswer`))

distube.on('searchNoResult', message => message.channel.send(`<:HError:838388742888751164> No result found!`))

distube.on('error', (textChannel, e) => {
    console.error(e)
    textChannel.send(`<:HError:838388742888751164> An error encountered: ${e.slice(0, 2000)}`)
})

distube.on('finish', queue => {
    const embed = new MessageEmbed()
        .setTitle(`<:HMusic:838388742594756619> Finish all songs`)
        .setColor('#6f00ff')

    queue.textChannel.send({ embeds: [embed] })
})

client.login(token)