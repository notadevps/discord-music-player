
import ytdl from 'discord-ytdl-core';
import discord from 'discord.js';
import { Queue }  from './Queue';
import { EventEmitter } from 'events';
import { Track } from './Tracks';
import ytr  from 'yt-search';
import error from './Utils';
import { Null } from './Utils';

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
            this.emit('trackAdded', q, q.message);
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
        if (!message) { 
            return error('argument cannot me empty');
        }
        let q = this.playerQueue.get(message.guild!.id);
        if (!q) { 
            return this.emit('error', 'no player playing', message); 
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
        if (!msg) { 
            return error('2 arguments expected '); 
        }
        if (!argument || typeof argument !== 'string') { 
            return error('search track cannot be empty');
        }
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
        if (!queue.message?.member?.voice.channel){ 
            return this.emit('error', 'should be in vc', queue, queue.message);
        }
        if (!queue.voiceConnection) {
            return this.emit('error', 'no connection found', queue, queue.message);
        }
        if (queue.tracks.length <= 0 ) { 
            queue.message.member.voice.channel.leave();
            this.emit('queueEnded', queue, queue.message); 
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
                this.emit('trackEnded', queue, queue.message);
                return this._playTrack(queue);
            });
        }
    }

    /**
     * clear the queue
     * @param {discord.Message} message
     */
    clear(message: discord.Message): void | boolean { 
        if (!message) {
            return error('agrument expected');
        }
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
        if (!message) {
            return error('2 arguments expected');
        }
        if (!postion || typeof postion !== 'number') { 
            return error('argument position cannot be empty');
        }
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
        if (!message) { 
            return error('2 arguments expected');
        }
        if (!volume || typeof volume !== 'number') {
            return error('argument should be number');
        }
        const q = this.playerQueue.get(message.guild!.id);
        if (!q) return this.emit('error', 'no player found')  
        q.voiceConnection?.dispatcher.setVolumeLogarithmic(q.volume / 200);
        q.volume = volume;
        return q.volume
    }

    /**
     * pause the track
     * @param {discord.Message} message 
     */
    pause(message: discord.Message):  boolean{
        if (!message) { 
            return error(' argument expected');
        }
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
        if (!message) { 
            return error('argument expected');
        }
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
        if (!message) { 
            return error(' argument expected');
        }
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
        if (!message) { 
            return error('argument expected');
        }
        const q = this.playerQueue.get(message.guild!.id);
        if (!q) return this.emit('error', 'no player found')
        return q.tracks[0];
    }
    
    /**
     * 
     * @param {discord.Message} message 
     */
    skip(message: discord.Message) {
        if (!message) { 
            return error(' argument expected');
        }
        const q = this.playerQueue.get(message.guild!.id); 
        if(!q) return this.emit('error', 'no player found'); 
        q.voiceConnection?.dispatcher.end();
    }

    /**
     * enables loop mode
     * @param {discord.Message} message 
     * @returns true if loop is enabled else false 
     */
    setLoopMode(message: discord.Message): boolean {
        if (!message) { 
            return error(' argument expected');
        }
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
}



//EVENTS