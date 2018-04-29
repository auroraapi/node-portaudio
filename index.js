"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bindings_1 = __importDefault(require("bindings"));
const stream_1 = require("stream");
const NodePA = bindings_1.default("node_pa.node");
exports.SampleFormat8Bit = 8;
exports.SampleFormat16Bit = 16;
exports.SampleFormat24Bit = 24;
exports.SampleFormat32Bit = 32;
exports.getDevices = NodePA.getDevices;
class AudioInput extends stream_1.Readable {
    constructor(options) {
        super({
            highWaterMark: 16384,
            objectMode: false,
        });
        this.audio = new NodePA.AudioIn(options);
    }
    _read(size = 1024) {
        this.audio.read(size, (err, buf) => {
            console.log(err, buf);
            if (!err) {
                this.push(buf);
            }
        });
    }
    start() {
        this.audio.start();
    }
    abort() {
        this.audio.abort();
    }
    quit(cb) {
        this.audio.quit(() => {
            if (cb && typeof cb === "function") {
                cb();
            }
        });
    }
}
exports.AudioInput = AudioInput;
class AudioOutput extends stream_1.Writable {
    constructor(options) {
        super({
            decodeStrings: false,
            highWaterMark: 16384,
            objectMode: false,
        });
        this.audio = new NodePA.AudioOut(options);
        this.on("finish", this.quit.bind(this));
    }
    write(chunk, encoding, cb = (() => undefined)) {
        this.audio.write(chunk, cb);
        return true;
    }
    start() {
        this.audio.start();
    }
    abort() {
        this.audio.abort();
    }
    quit(cb) {
        this.audio.quit(() => {
            if (cb && typeof cb === "function") {
                cb();
            }
        });
    }
}
exports.AudioOutput = AudioOutput;
