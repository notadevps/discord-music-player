"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Track = void 0;
/**
 * @class Track
 */
class Track {
    /**
     * @param {videoDetails} data
     */
    constructor(data) {
        this.channelId = data.channelId || null;
        this.thumbnailUrl = data.thumbnailUrl || null;
        this.viewCount = data.viewCount || null;
        this.isPrivate = data.isPrivate || false;
        this.length = data.length || null;
        this.title = data.title || null;
        this.author = data.author || null;
        this.url = data.url || null;
    }
    get track() {
        return this;
    }
}
exports.Track = Track;
