"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const discord_ytdl_core_1 = __importDefault(require("discord-ytdl-core"));
const Queue_1 = require("./Queue");
const events_1 = require("events");
const Tracks_1 = require("./Tracks");
const yt_search_1 = __importDefault(require("yt-search"));
class Player extends events_1.EventEmitter {
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
    constructor(client) {
        super();
        /**
         * discord message
         * @type {discord.Message | null = null}
         */
        this.msg = null;
        this.playerClient = client;
        this.playerQueue = new Map();
    }
    /**
     * @param {discord.Message} message discord message event
     * @param {string} track  a url
     */
    _createQueue(message, track) {
        var _a;
        if (!message.guild)
            return this.emit('error', 'no guild found');
        if (!((_a = message.member) === null || _a === void 0 ? void 0 : _a.voice.channel)) {
            return this.emit('error', 'should be in vc');
        }
        let q = this.playerQueue.get(message.guild.id);
        if (!q) {
            const queue = new Queue_1.Queue(message, track);
            this.playerQueue.set(message.guild.id, queue);
            message.member.voice.channel.join().then(connection => {
                queue.voiceConnection = connection;
                this._playTrack(queue);
                this.emit('queueCreated', queue, message);
            });
        }
        else {
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
    getQueue(message) {
        let q = this.playerQueue.get(message.guild.id);
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
    play(msg, argument) {
        return __awaiter(this, void 0, void 0, function* () {
            this.msg = msg;
            let arg;
            if (argument.includes('https://') && argument.includes('youtube.com')) {
                arg = argument;
            }
            else {
                let video = yield yt_search_1.default(argument);
                if (!video) {
                    this.emit('error', 'no video found');
                }
                arg = video.videos[0].url;
            }
            let c = yield discord_ytdl_core_1.default.getBasicInfo(arg);
            const obj = {
                title: c.videoDetails.title,
                length: c.videoDetails.lengthSeconds,
                isPrivate: c.videoDetails.isPrivate,
                channelId: c.videoDetails.channelId,
                thumbnailUrl: c.videoDetails.thumbnail.thumbnails[0].url,
                viewCount: c.videoDetails.viewCount,
                author: c.videoDetails.author.name,
                url: c.videoDetails.video_url
            };
            const track = new Tracks_1.Track(obj).track;
            this._createQueue(msg, track);
        });
    }
    /**
     * play track
     * @param {Queue} queue plays a track from queue
     */
    _playTrack(queue) {
        var _a, _b;
        if (!this.msg) {
            return this.emit('error', 'no player found');
        }
        if (!((_b = (_a = queue.message) === null || _a === void 0 ? void 0 : _a.member) === null || _b === void 0 ? void 0 : _b.voice.channel)) {
            this.msg = null;
            return this.emit('error', 'should be in vc', queue, this.msg);
        }
        if (!queue.voiceConnection) {
            this.msg = null;
            return this.emit('error', 'no connection found', queue, this.msg);
        }
        if (queue.tracks.length <= 0) {
            queue.message.member.voice.channel.leave();
            this.emit('queueEnded', queue, this.msg);
            this.msg = null;
            return;
        }
        if (queue.tracks[0].url) {
            let stream = discord_ytdl_core_1.default(queue.tracks[0].url, {
                filter: 'audioonly',
                opusEncoded: true,
            });
            if (queue.stream) {
                queue.stream.destroy();
            }
            queue.stream = stream;
            queue.voiceConnection.play(queue.stream, {
                type: 'opus'
            }).on('finish', () => {
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
    clear(message) {
        const q = this.playerQueue.get(message.guild.id);
        if (!q)
            return this.emit('error', 'no player found');
        q.tracks.splice(0, q.tracks.length);
    }
    /**
     * remove a track from the queue
     * @param {discord.Message} message
     * @param {number} postion index of the song to removed
     */
    remove(message, postion) {
        const q = this.playerQueue.get(message.guild.id);
        if (!q)
            return this.emit('error', 'no player found');
        q.tracks.splice(postion, 1);
    }
    /**
     * sets volume 0-100
     * @param {discord.Message} message
     * @param {number} volume number to which volume to be changed
     * @returns previous volume
     */
    setVolume(message, volume) {
        var _a;
        const q = this.playerQueue.get(message.guild.id);
        if (!q)
            return this.emit('error', 'no player found');
        const prevVolume = q.volume;
        (_a = q.voiceConnection) === null || _a === void 0 ? void 0 : _a.dispatcher.setVolumeLogarithmic(q.volume / 200);
        q.volume = volume;
        return prevVolume;
    }
    /**
     * pause the track
     * @param {discord.Message} message
     */
    pause(message) {
        var _a;
        const q = this.playerQueue.get(message.guild.id);
        if (!q)
            return this.emit('error', 'no player found');
        (_a = q.voiceConnection) === null || _a === void 0 ? void 0 : _a.dispatcher.pause();
        q.paused = true;
        return q.paused;
    }
    /**
     * resume the player
     * @param {discord.Message} message
     * @return false
     */
    resume(message) {
        var _a;
        const q = this.playerQueue.get(message.guild.id);
        if (!q)
            return this.emit('error', 'no player found');
        (_a = q.voiceConnection) === null || _a === void 0 ? void 0 : _a.dispatcher.resume();
        q.paused = false;
        return q.paused;
    }
    /**
     * stops the track and bot leaves voice channel
     * @param {discord.Message} message
     * @returns true
     */
    stop(message) {
        var _a, _b;
        const q = this.playerQueue.get(message.guild.id);
        if (!q)
            return this.emit('error', 'no player found');
        (_a = q.voiceConnection) === null || _a === void 0 ? void 0 : _a.dispatcher.end();
        (_b = q.voiceConnection) === null || _b === void 0 ? void 0 : _b.channel.leave();
        this.playerQueue.delete(message.guild.id);
        return true;
    }
    /**
     * now playing
     * @returns current playing music
     * @return track
     */
    nowPlaying(message) {
        const q = this.playerQueue.get(message.guild.id);
        if (!q)
            return this.emit('error', 'no player found');
        return q.tracks[0];
    }
    /**
     *
     * @param {discord.Message} message
     */
    skip(message) {
        var _a;
        const q = this.playerQueue.get(message.guild.id);
        if (!q)
            return this.emit('error', 'no player found');
        (_a = q.voiceConnection) === null || _a === void 0 ? void 0 : _a.dispatcher.end();
    }
    /**
     * loop mode
     * @param {discord.Message} message
     * @param {discord.Message} enabled
     * @returns true if loop is enabled else false
     */
    setLoopMode(message, enabled) {
        const q = this.playerQueue.get(message.guild.id);
        if (!q)
            return this.emit('error', 'no player found');
        if (q.loop == false) {
            q.loop = true;
            return true;
        }
        else {
            q.loop = false;
            return false;
        }
    }
}
exports.Player = Player;
//EVENTS
