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
const tracks_1 = require("./tracks");
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
     */
    getQueue(guildId) {
        if (!this.msg) {
            return this.emit('error', 'no player found');
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
            const track = new tracks_1.Track(obj).track;
            this._createQueue(msg, track);
        });
    }
    /**
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
            return false;
        }
        return true;
    }
}
exports.Player = Player;
