"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_ytdl_core_1 = __importDefault(require("discord-ytdl-core"));
class Player {
    constructor(client) {
        this.client = client;
        this.queue = new Map();
    }
    play(msg, argument) {
        /**
         * checks
         */
        var _a;
        const stream = discord_ytdl_core_1.default('https://www.youtube.com/watch?v=QnL5P0tFkwM', {
            filter: "audioonly",
            opusEncoded: true,
            encoderArgs: ['-af', 'bass=g=10,dynaudnorm=f=200']
        });
        if ((_a = msg.member) === null || _a === void 0 ? void 0 : _a.voice.channel) {
            msg.member.voice.channel.join()
                .then(connection => {
                let dispactcher = connection.play(stream, {
                    type: 'opus'
                })
                    .on('finish', () => {
                    var _a, _b, _c;
                    (_c = (_b = (_a = msg.guild) === null || _a === void 0 ? void 0 : _a.voice) === null || _b === void 0 ? void 0 : _b.channel) === null || _c === void 0 ? void 0 : _c.leave();
                });
            });
        }
    }
}
exports.default = Player;
