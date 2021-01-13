
Discord Music Player
a music player based on [discord.js](https://discord.js.org/#/)\
with typescript support 

# Quickstart

make a file in an IDE of your choice
you can start with
```
const discord = require('discord.js');
const client = new discord.Client();
const { Player } = require ('discord-music-player');
const player = new Player(client);
```
you can listen on some events on Player 

# Events 
queueCreated -> when a queue is created\
trackEnded -> when a track is ended\
queueEnded -> when ther is no tracks to play\ 
trackAdded -> when a  track is added  in queue\
error -> error occured


# EXAMPLE
```
//trackEnded
player.on('trackEnded', (q, msg) => {
    return msg.channel.send('track ended');
})

//trackAdded
player.on('trackAdded' , (q, msg) => {
    return msg.channel.send('track added');
})

//error
player.on('error', (e) => {
    return msg.channel.send('error occured ' + e);
})

//queueCreated
player.on('queueCreated', (q, msg) => {
    return msg.channel.send('queueCreated');
})

//queueEnded
player.on('queueEnded' , (q, msg) => {
    return msg.channel.send('queueCreated');
})

```

# discord bot example
```
const discord = require('discord.js');
const client = new discord.Client(); 
const { Player } = require('discord-youtube-player'); 
const player = new Player(client);
client.on('message', msg => {
    //search argument
    let arg =  msg.content.slice('+play'.length);
    if (msg.content.includes('+play')){
        //play from yt 
        player.play(msg, arg)

    } else if (msg.content.includes('+q')) { 
       //get queue
        let c = player.getQueue(msg);

    } else if (msg.content.includes('+clear')) { 
        //clear queue
        let  c = player.getQueue(msg);
        c.clearQueue();

    } else if (msg.content.includes('+skip')) { 
       //skip
        player.skip(msg); 

    } else if (msg.content.includes('+loop')) { 
        //loop
        let c = player.setLoopMode(msg, true);

    } else if (msg.content.includes('+stop')) { 
       //stop
        let c = player.stop(msg); 

    } else if (msg.content.includes('+volume')) { 
        //volume
        let volume = msg.content.slice('+volume'.length);
        let c =  player.setVolume(msg, volume);

    } else if (msg.content.includes('+pause')) { 
        //paused
        player.pause(); 

    } else if (msg.content.includes('+resume')) {
        //resume
        player.resume(); 

    }
});
client.login('TOKEN');
```