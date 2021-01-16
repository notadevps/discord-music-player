
Discord Music Player
a music player based on [discord.js](https://discord.js.org/#/)\
with typescript support and all types of filters

Documentation available [link](https://discord-youtube-player.github.io/)
Npm [link](https://www.npmjs.com/package/discord-youtube-player)

# Quickstart
do install [ffmpeg](https://www.npmjs.com/package/ffmpeg) , [ffmpeg-static](https://www.npmjs.com/package/ffmpeg-static)  and [opus](https://www.npmjs.com/package/@discordjs/opus)

make a file in an IDE of your choice
you can start with
```
const discord = require('discord.js');
const client = new discord.Client();
const { Player } = require ('discord-music-player');
const player = new Player(client, { autoSelfDeaf: true });
```

# Events 
```
queueCreated -> when a queue is created
trackEnded -> when a track is ended
queueEnded -> when ther is no tracks to play 
trackAdded -> when a  track is added in queue
error -> error occured
```

# EXAMPLE
```
player.on('trackEnded', (q, msg) => {
    return msg.channel.send('track ended');
})

player.on('trackAdded' , (q, msg, track) => {
    return msg.channel.send('track added');
})

player.on('error', (e) => {
    return msg.channel.send('error occured ' + e);
})

player.on('queueCreated', (q, msg) => {
    return msg.channel.send('queueCreated');
})

player.on('queueEnded' , (q, msg) => {
    return msg.channel.send('queueCreated');
})

```

discord bot example [LINK](https://github.com/notadevps/discord-youtube-player/tree/main/example)\
for more info join our support server  [LINK](https://discord.gg/mwAXpMD)
