
import ytdl from 'discord-ytdl-core';
import discord from 'discord.js';
import { Queue }  from './Queue';
import { EventEmitter } from 'events';
import { Track } from './tracks';
import ytr  from 'yt-search';
/**
 * util type
 */
export type Null<T> = T | null

export class Player extends EventEmitter { 
    /**
     * client 
     * @type {discord.Client}
     */
    playerClient: discord.Client;
    /**
     * queue
     * @type {Map<string, Queue>} 
     */ 
    playerQueue: Map<string, Queue>; 
    /**
     * discord message 
     * @type {discord.Message | null = null}
     */
    msg: Null<discord.Message> = null;

    /**
     * 
     * @param {discord.Client} client  discord client
     * @example
     *```
     * const { Player } = require('discord-music-player');
     * const discord = require('discord.js')
     * const client = new discord.Client(); 
     * const player = new Player(client);
     * ```
     */
    constructor(client: discord.Client ) { 
        super();
        this.playerClient = client;
        this.playerQueue = new Map();
    }
    /**
     * @param {discord.Message} message discord message event 
     * @param {string} track  a url
     */
    protected _createQueue(message: discord.Message, track: Track) { 
        if (!message.guild)  return this.emit('error', 'no guild found');
        if (!message.member?.voice.channel) { 
            return this.emit('error', 'should be in vc');
        } 
        let q = this.playerQueue.get(message.guild.id);
        if (!q) {  
            const queue = new Queue(message, track);
            this.playerQueue.set(message.guild.id, queue);  
            message.member.voice.channel.join().then(connection => {
                queue.voiceConnection = connection; 
                this._playTrack(queue);
                this.emit('queueCreated', queue, message);
            });
        } else {
            q.tracks.push(track);
            this.emit('trackAdded', q, message);
        }
    }
    /**
     * @param {string} guildId guild id 
     * @return queue for provided guild id 
     */
    getQueue(guildId: string) { 
        if (!this.msg) { 
            return this.emit('error' , 'no player found');
        }
        let q = this.playerQueue.get(guildId);
        if (!q) { 
            return this.emit('error', 'No Queue Found In This Guild', this.msg); 
        }
        return q;
    }
    /**
     * @param {discord.Message} msg messge event 
     * @param  {string} argument string
     */
    async play(msg: discord.Message, argument: string) {
        this.msg = msg;
        let arg; 
        if (argument.includes('https://') && argument.includes('youtube.com')) { 
            arg = argument;
        } else {
            let video = await ytr(argument); 
            if (!video) { 
                this.emit('error', 'no video found');
            }
            arg = video.videos[0].url;
        }
        let c =  await ytdl.getBasicInfo(arg);
        const obj = { 
            title: c.videoDetails.title,
            length: c.videoDetails.lengthSeconds, 
            isPrivate: c.videoDetails.isPrivate,
            channelId: c.videoDetails.channelId, 
            thumbnailUrl: c.videoDetails.thumbnail.thumbnails[0].url,
            viewCount: c.videoDetails.viewCount,
            author: c.videoDetails.author.name, 
            url: c.videoDetails.video_url
        }
        const track = new Track(obj).track;
        this._createQueue(msg, track);
    }
    /**
     * @param {Queue} queue plays a track from queue 
     */
    protected _playTrack(queue: Queue){ 
        if (!this.msg) { 
            return this.emit('error', 'no player found');
        }
        if (!queue.message?.member?.voice.channel){ 
            this.msg = null; 
            return this.emit('error', 'should be in vc', queue , this.msg);
        }
        if (!queue.voiceConnection) {
            this.msg = null; 
            return this.emit('error', 'no connection found', queue, this.msg);
        }
        if (queue.tracks.length <= 0 ) { 
            queue.message.member.voice.channel.leave();
            this.emit('queueEnded', queue , this.msg); 
            this.msg = null;
            return;
        }
        if (queue.tracks[0].url){
        let stream = ytdl(queue.tracks[0].url, {
            filter: 'audioonly', 
            opusEncoded: true,
        }); 
        if (queue.stream) { 
            queue.stream.destroy();
        } 
        queue.stream = stream;
        queue.voiceConnection.play(queue.stream , {
            type: 'opus'
        }).on('finish' , () => { 
            queue.tracks.splice(0, 1);
            this.emit('trackEnded', queue, this.msg);
            return this._playTrack(queue);
        });
    }
}
/**
 * checks if music is playing
 * @return  true if music is playing else false
 */
isPlaying() { 
    if (!this.msg) { 
        return false
    }
    return true 
}

}
