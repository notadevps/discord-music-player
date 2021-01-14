const discord = require('discord.js'); 
const client = new discord.Client();
const { Player } = require ('');
const player = new Player(client);
//events
player.on('trackAdded', (q, msg, track) => {
    return msg.channel.send('Added');
}); 
player.on('error', (e) => {
    console.log(e);
}); 
player.on('trackEnded', (q, msg) => { 
    msg.channel.send('Track Ended');
})
player.on('queueEnded' , (q, msg) => { 
    msg.channel.send('Queue Ended');
}); 
player.on('queueCreated', (q, msg) => {
    msg.channel.send('Queue Created');
})

client.on('message', msg => {
    let arg =  msg.content.slice('+play'.length);
    if (msg.content.includes('+play')){
        player.play(msg, arg); 
    } else if (msg.content.includes('+q')) { 
        let c = player.getQueue(msg);
        let x = ' ';
        if (!c.tracks) { 
            return msg.channel.send('adawdadw');
        }
        if (c.tracks && c.tracks.length <= 0 ) {
            return msg.channel.send('EMPTY');
        } else {
            c.tracks.map(el => x +=  '\n ' + el.title);
        }
        return msg.channel.send(x);
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
