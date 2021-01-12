
Discord Music Player
a music player based on discord.js [link](https://discord.js.org/#/)\
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
player.on('trackEnded', (q, msg) => {
    return msg.channel.send('track ended');
});
player.on('trackAdded' , (q, msg) => {
    return msg.channel.send('track added');
});
player.on('error', (e) => {
    return msg.channel.send('error occured ' + e);
});
player.on('queueCreated', (q, msg) => {
    return msg.channel.send('queueCreated');
});
player.on('queueEnded' , (q, msg) => {
    return msg.channel.send('queueCreated');
});

```

# discord bot example
```
client.on('message', msg => {
    let arg =  msg.content.slice('+play'.length);
    if (msg.content.includes('+play')){
        player.play(msg, arg); 
    } else if (msg.content.includes('+q')) { 
        let c = player.getQueue(msg);
        console.log(c)
    } else if (msg.content.includes('+clear')) { 
        let  c = player.getQueue(msg);
        c.clearQueue();
    } else if (msg.content.includes('+isPlaying')){ 
        let c = player.isPlaying();
        return msg.channel.send(c);
    } else if (msg.content.includes('+skip')) { 
        player.skip(msg); 

    } else if (msg.content.includes('+loop')) { 
        let c = player.setLoopMode(msg, true);
        return msg.channel.send(c);
    } else if (msg.content.includes('+stop')) { 
        let c = player.stop(msg); 
        return msg.channel.send('done');
    } else if (msg.content.includes('+volume')) { 
        let volume = msg.content.slice('+volume'.length);
       let c =  player.setVolume(msg, volume);
       return msg.channel.send(c) ;
    } else if (msg.content.includes('+pause')) { 
        player.pause(); 
        return msg.channel.send('paused')
    } else if (msg.content.includes('+resume')) {
        player.resume(); 
        return msg.channel.send('resumed');
    }
});
client.login('TOKEN');
```