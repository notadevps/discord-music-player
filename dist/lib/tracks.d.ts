export interface videoDetails {
    thumbnailUrl: string;
    title: string;
    length: string;
    channelId: string;
    viewCount: string;
    isPrivate: boolean;
    author: Object;
    url: string;
}
/**
 * @class Track
 */
export declare type Null<T> = T | null;
export declare class Track {
    /**
     * thumbnail url
     * @type {string | null}
     */
    thumbnailUrl: Null<string>;
    /**
     * title of track
     * @type {string | null}
     */
    title: Null<string>;
    /**
     * length of track
     * @type {string | null}
     */
    length: Null<string>;
    /**
     * channel id on which track was uploaded
     * @type { string | null}
     */
    channelId: Null<string>;
    /**
     * view count
     * @type { string | null}
     */
    viewCount: Null<string>;
    /**
     * true if track video is private
     * @type {boolean | null}
     */
    isPrivate: Null<boolean>;
    /**
     * author
     * @type { object | null}
     */
    author: Null<object>;
    /**
     * url of  track
     * @type {string | null}
     */
    url: Null<string>;
    /**
     * @param {videoDetails} data
     */
    constructor(data: videoDetails);
    get track(): this;
}
