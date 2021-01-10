const discord = require('discord.js'); 
const client = new discord.Client();
const { Player } = require ('../dist/index');
const player = new Player(client);
player.on('trackAdded', (q, msg) => {
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
        let c = player.getQueue(msg.guild.id);
        let x = ' '
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
        let  c = player.getQueue(msg.guild.id);
        c.clearQueue();
    } else if (msg.content.includes('+isPlaying')){ 
        let c = player.isPlaying();
        return msg.channel.send(c);
    }
});
client.login('NzU3ODkxMjgyNDQ5MjAzMjEw.X2m_Qg.8WcDZzvYH2Rv8xaEB0dp0eAUqwA');
