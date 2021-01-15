/// <reference types="node" />
import discord from 'discord.js';
import { Queue } from './Queue';
import { EventEmitter } from 'events';
import { Track } from './Tracks';
import { filters, options, Null } from './Utils';
export declare class Player extends EventEmitter {
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
    options: Null<options>;
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
    constructor(client: discord.Client, options?: options);
    /**
     * @param {discord.Message} message discord message event
     * @param {string} track  a url
     */
    protected _createQueue(message: discord.Message, track: Track): void | boolean;
    /**
     * @param {string} guildId guild id
     * @return queue for provided guild id
     * @example
     * ```
     * const queue = player.getQueue('guildid');
     * ```
     * @returns queue
     */
    getQueue(message: discord.Message): Queue | boolean;
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
    play(msg: discord.Message, argument: string): Promise<void | boolean>;
    /**
     * play track
     * @param {Queue} queue plays a track from queue
     */
    protected _playTrack(queue: Queue): void | boolean;
    /**
     * clear the queue
     * @param {discord.Message} message
     */
    clear(message: discord.Message): void | boolean;
    /**
     * remove a track from the queue
     * @param {discord.Message} message
     * @param {number} postion index of the song to removed
     */
    remove(message: discord.Message, postion: number): void | boolean;
    /**
     * sets volume 0-100
     * @param {discord.Message} message
     * @param {number} volume number to which volume to be changed
     * @returns previous volume
     */
    setVolume(message: discord.Message, volume: number): number | boolean;
    /**
     * pause the track
     * @param {discord.Message} message
     */
    pause(message: discord.Message): boolean;
    /**
     * resume the player
     * @param {discord.Message} message
     * @return false
     */
    resume(message: discord.Message): boolean;
    /**
     * stops the track and bot leaves voice channel
     * @param {discord.Message} message
     * @returns true
     */
    stop(message: discord.Message): boolean;
    /**
     * now playing
     * @returns current playing music
     * @return track
     */
    nowPlaying(message: discord.Message): Track | boolean;
    /**
     *
     * @param {discord.Message} message
     */
    skip(message: discord.Message): boolean | undefined;
    /**
     * enables loop mode
     * @param {discord.Message} message
     * @returns true if loop is enabled else false
     */
    setLoopMode(message: discord.Message): boolean;
    /**
     * @param  {discord.Message } msg
     * @param {string} filter filter to be added in your bot
     */
    setFilter(msg: discord.Message, data: {
        filters: filters;
    }): void;
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
