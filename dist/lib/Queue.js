"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
class Queue {
    /**
     *
     * @param {discord.Message} message
     * @param {Track} track
     */
    constructor(message, track) {
        /**
         * array of tracks
         * @type {Track[] = []}
         */
        this.tracks = [];
        /**
         * voice connection
         * @type {discord.VoiceConnection | null = null}
         */
        this.voiceConnection = null;
        /**
         * discord message
         * @type {discord.Message | null = null}
         */
        this.message = null;
        /**
         * song url
         * @type {string | null = null}
         */
        this.url = null;
        /**
         * volume 0-100
         * @type {number }
         */
        this.volume = 100;
        /**
         * music is paused
         * @type {boolean}
         */
        this.paused = false;
        /**
         * loop mode
         * @type {boolean}
         */
        this.loop = false;
        /**
         * filters
         * @type {filters}
         */
        this.filters = {};
        this.message = message;
        this.tracks.push(track);
    }
    get queue() {
        return this;
    }
}
exports.Queue = Queue;
