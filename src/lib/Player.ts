
import ytdl from 'discord-ytdl-core';
import discord from 'discord.js';
import { Queue }  from './Queue';
import { EventEmitter } from 'events';
import { Track } from './Tracks';
import ytr  from 'yt-search';
/**
 * util type
 */

 /**
  * TODO
  * TYPE CHECKING AND PARAMS CHECKING
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
    protected _createQueue(message: discord.Message, track: Track): void |  boolean{ 
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
     * @example
     * ```
     * const queue = player.getQueue('guildid'); 
     * ```
     * @returns queue
     */
    getQueue(message: discord.Message): Queue | boolean { 
        let q = this.playerQueue.get(message.guild!.id);
        if (!q) { 
            return this.emit('error', 'no player playing', this.msg); 
        }
        return q;
    }

    /**
     * @param {discord.Message} msg messge event 
     * @param  {string} argument string
     * @example 
     * ```
     * client.on('mesage', message => {
     * let argumnet = message.content.slice('play'.length);
     * player.play(message, argument)
     * })
     * ```
     */
    async play(msg: discord.Message, argument: string): Promise<void | boolean> {
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
     * play track
     * @param {Queue} queue plays a track from queue 
     */
    protected _playTrack(queue: Queue): void | boolean{ 
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
                highWaterMark: 1 << 25
            }); 
            if (queue.stream) { 
                queue.stream.destroy();
            } 
            queue.stream = stream;
            queue.voiceConnection.play(queue.stream , {
                type: 'opus'
            }).on('finish' , () => { 
                if (queue.loop === false) { 
                    queue.tracks.splice(0, 1);
                }
                this.emit('trackEnded', queue, this.msg);
                return this._playTrack(queue);
            });
        }
    }

    /**
     * clear the queue
     * @param {discord.Message} message
     */
    clear(message: discord.Message): void | boolean { 
        const q = this.playerQueue.get(message.guild!.id);
        if (!q) return this.emit('error', 'no player found') 
        q.tracks.splice(0, q.tracks.length );
    }

    /**
     * remove a track from the queue
     * @param {discord.Message} message
     * @param {number} postion index of the song to removed  
     */
    remove(message: discord.Message, postion: number): void | boolean { 
        const q = this.playerQueue.get(message.guild!.id);
        if (!q) return this.emit('error', 'no player found')
        q.tracks.splice(postion, 1);
    }

    /**
     * sets volume 0-100
     * @param {discord.Message} message
     * @param {number} volume number to which volume to be changed 
     * @returns previous volume
     */
    setVolume(message: discord.Message, volume: number): number | boolean {
        const q = this.playerQueue.get(message.guild!.id);
        if (!q) return this.emit('error', 'no player found')
        const prevVolume = q.volume;  
        q.voiceConnection?.dispatcher.setVolumeLogarithmic(q.volume / 200);
        q.volume = volume;
        return prevVolume;
    }

    /**
     * pause the track
     * @param {discord.Message} message 
     */
    pause(message: discord.Message):  boolean{
        const q = this.playerQueue.get(message.guild!.id);
        if (!q) return this.emit('error', 'no player found')
        q.voiceConnection?.dispatcher.pause(); 
        q.paused = true;
        return q.paused
    }

    /**
     * resume the player
     * @param {discord.Message} message 
     * @return false 
     */
    resume(message: discord.Message): boolean{ 
        const q = this.playerQueue.get(message.guild!.id);
        if (!q) return this.emit('error', 'no player found')
        q.voiceConnection?.dispatcher.resume(); 
        q.paused = false;
        return q.paused
    }

    /**
     * stops the track and bot leaves voice channel
     * @param {discord.Message} message 
     * @returns true 
     */
    stop(message: discord.Message): boolean { 
        const q = this.playerQueue.get(message.guild!.id);
        if (!q) return this.emit('error', 'no player found');
        q.voiceConnection?.dispatcher.end();
        q.voiceConnection?.channel.leave();
        this.playerQueue.delete(message.guild!.id);
        return true
    }

    /**
     * now playing 
     * @returns current playing music
     * @return track
     */
    nowPlaying(message: discord.Message): Track | boolean { 
        const q = this.playerQueue.get(message.guild!.id);
        if (!q) return this.emit('error', 'no player found')
        return q.tracks[0];
    }
    
    /**
     * 
     * @param {discord.Message} message 
     */
    skip(message: discord.Message) {
        const q = this.playerQueue.get(message.guild!.id); 
        if(!q) return this.emit('error', 'no player found'); 
        q.voiceConnection?.dispatcher.end();
    }

    /**
     * loop mode  
     * @param {discord.Message} message 
     * @param {discord.Message} enabled 
     * @returns true if loop is enabled else false 
     */
    setLoopMode(message: discord.Message, enabled: boolean ): boolean {
        const q = this.playerQueue.get(message.guild!.id); 
        if(!q) return this.emit('error', 'no player found'); 
        if (q.loop == false ) { 
            q.loop = true
            return true;  
        } else {
            q.loop = false;
            return false;
        }
    }
    
    /**
     * 
     * @param {Object} filter 
     */
    setFilter(filter: Object) { 

    }

}



//EVENTS