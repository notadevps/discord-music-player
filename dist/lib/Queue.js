"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
/**
 *
 * @param {boolean} value Util function for changing the the property of a method
 */
function enumarable(value) {
    return function (target, propertyKey, descriptor) {
        descriptor.enumerable = value;
    };
}
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
        this.message = message;
        this.tracks.push(track);
    }
    get queue() {
        return this;
    }
    /**
     * clear the queue
     */
    clear() {
        this.tracks.splice(0, this.tracks.length);
    }
    /**
     * @param {number} postion index of the song to removed
     */
    remove(postion) {
        this.tracks.splice(postion, 1);
    }
    /**
     *
     * @param {number} volume number to which volume to be changed
     * @returns previous volume
     */
    setVolume(volume) {
        const prevVolume = this.volume;
        this.volume = volume;
        return prevVolume;
    }
}
__decorate([
    enumarable(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Queue.prototype, "clear", null);
__decorate([
    enumarable(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], Queue.prototype, "remove", null);
__decorate([
    enumarable(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], Queue.prototype, "setVolume", null);
exports.Queue = Queue;
