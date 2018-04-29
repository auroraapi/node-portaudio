import bindings from "bindings";
import { Readable, Writable } from "stream";

const NodePA = bindings("node_pa.node");

///////////////////////////////////////////////////////////////////////////////
// Sample format widths                                                      //
///////////////////////////////////////////////////////////////////////////////

/** Use 8-bit samples to read/write to PortAudio */
export const SampleFormat8Bit  = 8;
/** Use 16-bit samples to read/write to PortAudio */
export const SampleFormat16Bit = 16;
/** Use 24-bit samples to read/write to PortAudio */
export const SampleFormat24Bit = 24;
/** Use 32-bit samples to read/write to PortAudio */
export const SampleFormat32Bit = 32;

///////////////////////////////////////////////////////////////////////////////

/** Get available devices from PortAudio */
export const getDevices = NodePA.getDevices;

/**
 * Available options to initialize audio input and output
 */
export interface AudioOptions {
  /**
   * The device ID to use. These correspond to device IDs returned by
   * `getDevices`. Omit or set this to -1 to use the default device
   */
  deviceId?: number;
  /**
   * Sample rate to read/write from/to the audio device (samples/sec)
   */
  sampleRate?: number;
  /**
   * Number of channels to read/write audio from/to
   */
  channelCount?: number;
  /**
   * The sample width. Use one of the exported constants (8, 16, 24, or 32)
   */
  sampleFormat?: number;
}

/**
 * The function signature of the callbacks to various `AudioInput` and
 * `AudioOutput` methods.
 */
export type AudioCallback = () => void;

/**
 * AudioInput is a readable stream that records audio from the given device
 */
export class AudioInput extends Readable {
  /** audio is an instance of the node_pa PortAudio binding (input stream) */
  private audio: any;

  /**
   * Creates the AudioInput instance by initializing the Readable stream
   * and initializing the underlying PortAudio instance with the given
   * options.
   *
   * @param options options to pass to PortAudio
   */
  constructor(options: AudioOptions) {
    super({
      highWaterMark: 16384,
      objectMode: false,
    });
    this.audio = new NodePA.AudioIn(options);
  }

  /**
   * Reads some data from PortAudio and pushes it into the stream
   *
   * @param size number of bytes to read
   */
  public _read(size: number = 1024) {
    this.audio.read(size, (err: Error, buf: Buffer) => {
      if (!err) {
        this.push(buf);
      }
    });
  }

  /**
   * Start reading data from the input device
   */
  public start() {
    this.audio.start();
  }

  /**
   * Immediately aborts recording without waiting for the buffers to flush
   */
  public abort() {
    this.audio.abort();
  }

  /**
   * Gracefully stops the recording device, flushing all buffers, and then calls
   * the given function.
   *
   * @param cb callback to call after quit has completed
   */
  public quit(cb?: AudioCallback) {
    this.audio.quit(() => {
      if (cb && typeof cb === "function") {
        cb();
      }
    });
  }
}

/**
 * AudioOutput is a writeable stream that plays audio on the given device
 */
export class AudioOutput extends Writable {
  /** audio is an instance of the node_pa PortAudio binding (output stream) */
  private audio: any;

  /**
   * Creates the AudioOutput instance by initializing the Writable stream
   * and initializing the underlying PortAudio instance with the given
   * options.
   *
   * @param options options to initialize PortAudio with
   */
  constructor(options: AudioOptions) {
    super({
      decodeStrings: false,
      highWaterMark: 16384,
      objectMode: false,
    });
    this.audio = new NodePA.AudioOut(options);
    this.on("finish", this.quit.bind(this));
  }

  /**
   * Write some data to the PortAudio output device and call the given callback
   * upon completion.
   *
   * @param chunk data to write to the device
   * @param encoding encoding of the data
   * @param cb callback to call after write is completed
   */
  public write(chunk: any, encoding?: any, cb: AudioCallback = (() => undefined)) {
    this.audio.write(chunk, cb);
    return true;
  }

  /**
   * Start writing data to the output device
   */
  public start() {
    this.audio.start();
  }

  /**
   * Immediately aborts playback without waiting for the buffers to flush
   */
  public abort() {
    this.audio.abort();
  }

  /**
   * Gracefully stops the playback device, flushing all buffers, and then calls
   * the given function.
   *
   * @param cb callback to call after quit has completed
   */
  public quit(cb?: AudioCallback) {
    this.audio.quit(() => {
      if (cb && typeof cb === "function") {
        cb();
      }
    });
  }
}
