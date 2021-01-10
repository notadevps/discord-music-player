
import discord from 'discord.js';
import { Track } from './tracks';

/**
 * 
 * @param {boolean} value Util function for changing the the property of a method 
 */

function enumarable(value: boolean ) { 
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) { 
        descriptor.enumerable = value;
    }
}
/**
 * util type
 */
export type Null<T> = T | null; 
export class Queue { 
    /**
     * array of tracks
     * @type {Track[] = []}
     */
    tracks: Track[] = [];
    /** 
     * voice connection 
     * @type {discord.VoiceConnection | null = null} 
     */ 
    voiceConnection: Null<discord.VoiceConnection> = null; 
    /**
     * stream 
     * @type {any}
     */
    stream: any; 
    /**
     * discord message 
     * @type {discord.Message | null = null}
     */
    message: Null<discord.Message> = null;
    /**
     * song url 
     * @type {string | null = null}
     */
    url: Null<string> = null;
    /**
     * volume 0-100
     * @type {number }
     */
    volume: number = 100;
    /**
     * 
     * @param {discord.Message} message 
     * @param {Track} track 
     */
    constructor(message: discord.Message, track: Track) { 
        this.message = message;  
        this.tracks.push(track);
    }
    get queue() { 
        return this;
    }
    /**
     * clear the queue
     */
    @enumarable(false)
    clear() { 
        this.tracks.splice(0, this.tracks.length );
    }
    /**
     * @param {number} postion index of the song to removed  
     */
    @enumarable(false)
    remove(postion: number) { 
        this.tracks.splice(postion, 1);
    }
    /**
     * 
     * @param {number} volume number to which volume to be changed 
     * @returns previous volume
     */
    @enumarable(false)
    setVolume(volume: number) { 
        const prevVolume = this.volume;  
        this.volume = volume;
        return prevVolume
    }
}