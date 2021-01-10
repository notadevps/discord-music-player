import discord from 'discord.js';
import { Track } from './tracks';
/**
 * util type
 */
export declare type Null<T> = T | null;
export declare class Queue {
    /**
     * array of tracks
     * @type {Track[] = []}
     */
    tracks: Track[];
    /**
     * voice connection
     * @type {discord.VoiceConnection | null = null}
     */
    voiceConnection: Null<discord.VoiceConnection>;
    /**
     * stream
     * @type {any}
     */
    stream: any;
    /**
     * discord message
     * @type {discord.Message | null = null}
     */
    message: Null<discord.Message>;
    /**
     * song url
     * @type {string | null = null}
     */
    url: Null<string>;
    /**
     * volume 0-100
     * @type {number }
     */
    volume: number;
    /**
     * music is paused
     * @type {boolean}
     */
    paused: boolean;
    /**
     * loop mode
     * @type {boolean}
     */
    loop: boolean;
    /**
     *
     * @param {discord.Message} message
     * @param {Track} track
     */
    constructor(message: discord.Message, track: Track);
    get queue(): this;
}
