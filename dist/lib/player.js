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
const Utils_1 = __importDefault(require("./Utils"));
const defaultOption = {};
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
const filter = {
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
};
class Player extends events_1.EventEmitter {
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
    constructor(client, options) {
        super();
        /**
         * @type {options}
         */
        this.options = null;
        this.playerClient = client;
        this.playerQueue = new Map();
        defaultOption.autoSelfDeaf = (options === null || options === void 0 ? void 0 : options.autoSelfDeaf) == false || true;
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
                var _a;
                queue.voiceConnection = connection;
                if (defaultOption) {
                    (_a = connection.voice) === null || _a === void 0 ? void 0 : _a.setSelfDeaf(defaultOption.autoSelfDeaf);
                }
                this._playTrack(queue);
                this.emit('queueCreated', queue, message);
            });
        }
        else {
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
    getQueue(message) {
        if (!message) {
            return Utils_1.default('argument cannot me empty');
        }
        let q = this.playerQueue.get(message.guild.id);
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
    play(msg, argument) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!msg) {
                return Utils_1.default('2 arguments expected ');
            }
            if (!argument || typeof argument !== 'string') {
                return Utils_1.default('search track cannot be empty');
            }
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
        if (!((_b = (_a = queue.message) === null || _a === void 0 ? void 0 : _a.member) === null || _b === void 0 ? void 0 : _b.voice.channel)) {
            return this.emit('error', 'should be in vc', queue, queue.message);
        }
        if (!queue.voiceConnection) {
            return this.emit('error', 'no connection found', queue, queue.message);
        }
        if (queue.tracks.length <= 0) {
            queue.message.member.voice.channel.leave();
            return this.emit('queueEnded', queue, queue.message);
        }
        const encoderArgsFilters = [];
        Object.keys(queue === null || queue === void 0 ? void 0 : queue.filters).forEach((name) => {
            if (queue === null || queue === void 0 ? void 0 : queue.filters[name]) {
                encoderArgsFilters.push(filter[name]);
            }
        });
        let encoderArgs;
        if (encoderArgsFilters.length < 1) {
            encoderArgs = [];
        }
        else {
            encoderArgs = ['-af', encoderArgsFilters.join(',')];
        }
        if (queue.tracks[0].url) {
            let stream = discord_ytdl_core_1.default(queue.tracks[0].url, {
                filter: 'audioonly',
                opusEncoded: true,
                highWaterMark: 1 << 25,
                encoderArgs,
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
                this.emit('trackEnded', queue, queue.message);
                return this._playTrack(queue);
            });
        }
    }
    /**
     * clear the queue
     * @param {discord.Message} message
     */
    clear(message) {
        var _a;
        if (!message) {
            return Utils_1.default('agrument expected');
        }
        const q = this.playerQueue.get(message.guild.id);
        if (!q)
            return this.emit('error', 'no player found');
        if (((_a = q.message) === null || _a === void 0 ? void 0 : _a.channel.id) !== message.channel.id) {
            q.message.channel.id = message.channel.id;
        }
        q.tracks.splice(0, q.tracks.length);
    }
    /**
     * remove a track from the queue
     * @param {discord.Message} message
     * @param {number} postion index of the song to removed
     */
    remove(message, postion) {
        var _a;
        if (!message) {
            return Utils_1.default('2 arguments expected');
        }
        if (!postion || typeof postion !== 'number') {
            return Utils_1.default('argument position cannot be empty');
        }
        const q = this.playerQueue.get(message.guild.id);
        if (!q)
            return this.emit('error', 'no player found');
        if (((_a = q.message) === null || _a === void 0 ? void 0 : _a.channel.id) !== message.channel.id) {
            q.message.channel.id = message.channel.id;
        }
        q.tracks.splice(postion, 1);
    }
    /**
     * sets volume 0-100
     * @param {discord.Message} message
     * @param {number} volume number to which volume to be changed
     * @returns previous volume
     */
    setVolume(message, volume) {
        var _a, _b;
        if (!message) {
            return Utils_1.default('2 arguments expected');
        }
        if (!volume || typeof volume !== 'number') {
            return Utils_1.default('argument should be number');
        }
        const q = this.playerQueue.get(message.guild.id);
        if (!q)
            return this.emit('error', 'no player found');
        if (((_a = q.message) === null || _a === void 0 ? void 0 : _a.channel.id) !== message.channel.id) {
            q.message.channel.id = message.channel.id;
        }
        (_b = q.voiceConnection) === null || _b === void 0 ? void 0 : _b.dispatcher.setVolumeLogarithmic(q.volume / 200);
        q.volume = volume;
        return q.volume;
    }
    /**
     * pause the track
     * @param {discord.Message} message
     */
    pause(message) {
        var _a, _b;
        if (!message) {
            return Utils_1.default(' argument expected');
        }
        const q = this.playerQueue.get(message.guild.id);
        if (!q)
            return this.emit('error', 'no player found');
        if (((_a = q.message) === null || _a === void 0 ? void 0 : _a.channel.id) !== message.channel.id) {
            q.message.channel.id = message.channel.id;
        }
        (_b = q.voiceConnection) === null || _b === void 0 ? void 0 : _b.dispatcher.pause();
        q.paused = true;
        return q.paused;
    }
    /**
     * resume the player
     * @param {discord.Message} message
     * @return false
     */
    resume(message) {
        var _a, _b;
        if (!message) {
            return Utils_1.default('argument expected');
        }
        const q = this.playerQueue.get(message.guild.id);
        if (!q)
            return this.emit('error', 'no player found');
        if (((_a = q.message) === null || _a === void 0 ? void 0 : _a.channel.id) !== message.channel.id) {
            q.message.channel.id = message.channel.id;
        }
        (_b = q.voiceConnection) === null || _b === void 0 ? void 0 : _b.dispatcher.resume();
        q.paused = false;
        return q.paused;
    }
    /**
     * stops the track and bot leaves voice channel
     * @param {discord.Message} message
     * @returns true
     */
    stop(message) {
        var _a, _b, _c;
        if (!message) {
            return Utils_1.default(' argument expected');
        }
        const q = this.playerQueue.get(message.guild.id);
        if (!q)
            return this.emit('error', 'no player found');
        if (((_a = q.message) === null || _a === void 0 ? void 0 : _a.channel.id) !== message.channel.id) {
            q.message.channel.id = message.channel.id;
        }
        (_b = q.voiceConnection) === null || _b === void 0 ? void 0 : _b.dispatcher.end();
        ;
        (_c = q.voiceConnection) === null || _c === void 0 ? void 0 : _c.channel.leave();
        this.playerQueue.delete(message.guild.id);
        return true;
    }
    /**
     * now playing
     * @returns current playing music
     * @return track
     */
    nowPlaying(message) {
        var _a;
        if (!message) {
            return Utils_1.default('argument expected');
        }
        const q = this.playerQueue.get(message.guild.id);
        if (!q)
            return this.emit('error', 'no player found');
        if (((_a = q.message) === null || _a === void 0 ? void 0 : _a.channel.id) !== message.channel.id) {
            q.message.channel.id = message.channel.id;
        }
        return q.tracks[0];
    }
    /**
     *
     * @param {discord.Message} message
     */
    skip(message) {
        var _a, _b;
        if (!message) {
            return Utils_1.default(' argument expected');
        }
        const q = this.playerQueue.get(message.guild.id);
        if (!q)
            return this.emit('error', 'no player found');
        if (((_a = q.message) === null || _a === void 0 ? void 0 : _a.channel.id) !== message.channel.id) {
            q.message.channel.id = message.channel.id;
        }
        (_b = q.voiceConnection) === null || _b === void 0 ? void 0 : _b.dispatcher.end();
    }
    /**
     * enables loop mode
     * @param {discord.Message} message
     * @returns true if loop is enabled else false
     */
    setLoopMode(message) {
        var _a;
        if (!message) {
            return Utils_1.default(' argument expected');
        }
        const q = this.playerQueue.get(message.guild.id);
        if (!q)
            return this.emit('error', 'no player found');
        if (((_a = q.message) === null || _a === void 0 ? void 0 : _a.channel.id) !== message.channel.id) {
            q.message.channel.id = message.channel.id;
        }
        if (q.loop == false) {
            q.loop = true;
            return true;
        }
        else {
            q.loop = false;
            return false;
        }
    }
    /**
     * @param  {discord.Message } msg
     * @param {filters} data filter to be added in your bot
     */
    setFilter(msg, data) {
        const q = this.playerQueue.get(msg.guild.id);
        if (!q) {
            this.emit('error', 'no player found', msg);
        }
        if (q === null || q === void 0 ? void 0 : q.filters) {
            Object.keys(data).map(key => {
                if (filter[key]) {
                    q.filters[key] = filter[key];
                }
            });
        }
        return q === null || q === void 0 ? void 0 : q.filters;
    }
}
exports.Player = Player;
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
