/// <reference types="node" />
import discord from 'discord.js';
import { Queue } from './Queue';
import { EventEmitter } from 'events';
import { Track } from './tracks';
/**
 * util type
 */
export declare type Null<T> = T | null;
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
     * discord message
     * @type {discord.Message | null = null}
     */
    msg: Null<discord.Message>;
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
    constructor(client: discord.Client);
    /**
     * @param {discord.Message} message discord message event
     * @param {string} track  a url
     */
    protected _createQueue(message: discord.Message, track: Track): boolean | undefined;
    /**
     * @param {string} guildId guild id
     * @return queue for provided guild id
     * @example
     * ```
     * const queue = player.getQueue('guildid');
     * ```
     */
    getQueue(message: discord.Message): boolean | Queue;
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
    play(msg: discord.Message, argument: string): Promise<void>;
    /**
     * @param {Queue} queue plays a track from queue
     */
    protected _playTrack(queue: Queue): boolean | undefined;
    /**
     * @param {discord.Message} message
     * clear the queue
     */
    clear(message: discord.Message): boolean | undefined;
    /**
     * @param {discord.Message} message
     * @param {number} postion index of the song to removed
     */
    remove(message: discord.Message, postion: number): boolean | undefined;
    /**
     * @param {discord.Message} message
     * @param {number} volume number to which volume to be changed
     * @returns previous volume
     */
    setVolume(message: discord.Message, volume: number): number | boolean;
    /**
     *
     * @param {discord.Message} message
     */
    pause(message: discord.Message): boolean | undefined;
    /**
     *
     * @param {discord.Message} message
     */
    resume(message: discord.Message): boolean | undefined;
    /**
     *
     * @param {discord.Message} message
     */
    stop(message: discord.Message): boolean | undefined;
    /**
     * @returns current playing music
     */
    nowPlaying(message: discord.Message): boolean | Track;
    /**
     *
     * @param {discord.Message} message
     */
    skip(message: discord.Message): void;
    /**
     *
     * @param {discord.Message} message
     * @param {discord.Message} enabled
     */
    setLoopMode(message: discord.Message, enabled: boolean): void;
    /**
     *
     * @param {discord.Message} message
     */
    shuffle(message: discord.Message): void;
}
