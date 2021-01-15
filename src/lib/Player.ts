
import ytdl from 'discord-ytdl-core';
import discord from 'discord.js';
import { Queue }  from './Queue';
import { EventEmitter } from 'events';
import { Track } from './Tracks';
import ytr  from 'yt-search';
import error, { filters, options, Null } from './Utils';

const defaultOption: options = {};

/**
 * @typedef  filter 
 * @property {boolean} [bassboost=false]
 * @property {boolean} [8D=false]
 * @property {boolean} [vaporwave=false]
 * @property {boolean} [nightcore=false]
 * @property {boolean} [phaser=false]
 * @property {boolean} [termolo=false]
 * @property {boolean} [treble=false]
 * @property {boolean} [normalizer=false]
 * @property {boolean} [surrounding=false]
 * @property {boolean} [pulsator=false]
 * @property {boolean} [subboost=false]
 * @property {boolean} [karaoke=false]
 * @property {boolean} [flanger=false]
 * @property {boolean} [gate=false]
 * @property {boolean} [haas=false]
 * @property {boolean} [mcompand=false]
 * @property {boolean} [mono=false]
 */

const filter: any = {
    bassboost: 'bass=g=20',
    '8D': 'apulsator=hz=0.09',
    vaporwave: 'aresample=48000,asetrate=48000*0.8',
    nightcore: 'aresample=48000,asetrate=48000*1.25',
    phaser: 'aphaser=in_gain=0.4',
    tremolo: 'tremolo',
    vibrato: 'vibrato=f=6.5',
    reverse: 'areverse',
    treble: 'treble=g=5',
    normalizer: 'dynaudnorm=g=101',
    surrounding: 'surround',
    pulsator: 'apulsator=hz=1',
    subboost: 'asubboost',
    karaoke: 'stereotools=mlev=0.03',
    flanger: 'flanger',
    gate: 'agate',
    haas: 'haas',
    mcompand: 'mcompand',
    mono: 'pan=mono|c0=.5*c0+.5*c1'
}


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
     * @type {options}
     */
    options: Null<options> = null; 
    /**
     * 
     * @param {discord.Client} client  discord client
     * @example
     *```
     * const { Player } = require('discord-music-player');
     * const discord = require('discord.js')
     * const client = new discord.Client(); 
     * const player = new Player(client, {  autoSelfDeaf: false });
     * ```
     */
    constructor(client: discord.Client, options?: options ) { 
        super();
        this.playerClient = client;
        this.playerQueue = new Map();
        defaultOption.autoSelfDeaf = options?.autoSelfDeaf == false ||  true;
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
                if (defaultOption) {
                    connection.voice?.setSelfDeaf(defaultOption.autoSelfDeaf!);
                }
                this._playTrack(queue);
                this.emit('queueCreated', queue, message);
            });
        } else {
            q.tracks.push(track);
            this.emit('trackAdded', q, q.message, track);
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
            return this.emit('queueEnded', queue, queue.message); 
        }
        const encoderArgsFilters: any = []
        Object.keys(queue?.filters).forEach((name) => {
            if (queue?.filters[name]) {
                encoderArgsFilters.push(filter[name])
            }
        })
        let encoderArgs: any;
        if (encoderArgsFilters.length < 1) {
            encoderArgs = []
        } else {
            encoderArgs = ['-af', encoderArgsFilters.join(',')]
        }
        if (queue.tracks[0].url){
            let stream = ytdl(queue.tracks[0].url, {
                filter: 'audioonly', 
                opusEncoded: true,
                highWaterMark: 1 << 25, 
                encoderArgs,
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
        if (!q) return this.emit('error', 'no player found');
        if (q.message?.channel.id  !== message.channel.id ) { 
            q.message!.channel.id = message.channel.id;
        }
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
        if (q.message?.channel.id  !== message.channel.id ) { 
            q.message!.channel.id = message.channel.id;
        }
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
        if (!q) return this.emit('error', 'no player found');
        if (q.message?.channel.id  !== message.channel.id ) { 
            q.message!.channel.id = message.channel.id;
        }  
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
        if (!q) return this.emit('error', 'no player found');
        if (q.message?.channel.id  !== message.channel.id ) { 
            q.message!.channel.id = message.channel.id;
        }
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
        if (!q) return this.emit('error', 'no player found');
        if (q.message?.channel.id  !== message.channel.id ) { 
            q.message!.channel.id = message.channel.id;
        }
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
        if (q.message?.channel.id  !== message.channel.id ) { 
            q.message!.channel.id = message.channel.id;
        }
        q.voiceConnection?.dispatcher.end();;
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
        if (!q) return this.emit('error', 'no player found');
        if (q.message?.channel.id  !== message.channel.id ) { 
            q.message!.channel.id = message.channel.id;
        }
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
        if (q.message?.channel.id  !== message.channel.id ) { 
            q.message!.channel.id = message.channel.id;
        }
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
        if (q.message?.channel.id  !== message.channel.id ) { 
            q.message!.channel.id = message.channel.id;
        }
        if (q.loop == false ) { 
            q.loop = true
            return true;  
        } else {
            q.loop = false;
            return false;
        }
    }

    /**
     * @param  {discord.Message } msg
     * @param {filters} data filter to be added in your bot 
     */
    setFilter(msg: discord.Message, data: filters ) { 
        const q = this.playerQueue.get(msg.guild!.id);
        if (!q)  { 
            this.emit('error', 'no player found', msg);
        }
        if (q?.filters)  {
            Object.keys(data).map(key =>  { 
                if (filter[key])  { 
                    q.filters[key] = filter[key];  
                }
            });
        }
        return q?.filters;
    }
}

/**
 * Emitted when a track starts
 *  @event Player#queueCreated
 * @param {Queue} queue
 * @param {Discord.Message} message
 */

/**
 * Emitted when a track starts
 * @event Player#queueCreated
 * @param {Queue} queue
 * @param {Discord.Message} message
 */

/**
 * Emitted when a  new track is ended
 * @event Player#trackAdded
 * @param {Queue} queue
 * @param {Discord.Message} message
 * @param {Track}  track
 */

/**
 * Emitted when a track ended
 * @event Player#trackEnded
 * @param {Queue} queue
 * @param {Discord.Message} message
 */

 /**
 * Emitted when a queue ended
 * @event Player#queueEnded
 * @param {Queue} queue
 * @param {Discord.Message} message
 */

/**
 * Emitted when a error
 * @event Player#error
 * @param {string} error
 */

 /**
 * Emitted when a queue ended
 * @event Player#queueEnded
 * @param {Queue} queue
 * @param {Discord.Message} message
 */

