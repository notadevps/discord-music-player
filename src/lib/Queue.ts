
import discord from 'discord.js';
import { Track } from './Tracks';
import { Null, filters} from './Utils';

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
     * music is paused 
     * @type {boolean}
     */
    paused: boolean = false
    /**
     * loop mode 
     * @type {boolean}
     */
    loop: boolean = false
    /**
     * filters 
     * @type {filters}
     */
    filters: filters = {} ;
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
   
}