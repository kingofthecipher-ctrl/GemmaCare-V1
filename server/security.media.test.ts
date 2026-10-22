import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { convertToWav } from "./_core/llm";

let hasFfmpeg = true;
try { execFileSync("ffmpeg", ["-version"], { stdio: "ignore" }); } catch { hasFfmpeg = false; }

describe.skipIf(!hasFfmpeg)("real decoder with synthetic media", () => {
  it("retains WAV, MP3, WebM and MP4 audio support", () => {
    const directory = mkdtempSync(join(tmpdir(), "gc-synthetic-test-"));
    try {
      const wav = join(directory, "tone.wav");
      execFileSync("ffmpeg", ["-loglevel", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=0.1", wav]);
      for (const extension of ["wav", "mp3", "webm", "mp4"]) {
        const file = join(directory, `tone.${extension}`);
        if (extension !== "wav") execFileSync("ffmpeg", ["-loglevel", "error", "-i", wav, file]);
        const output = Buffer.from(convertToWav(readFileSync(file).toString("base64")), "base64");
        expect(output.subarray(0, 4).toString()).toBe("RIFF");
        expect(output.length).toBeGreaterThan(44);
      }
    } finally { rmSync(directory, { recursive: true, force: true }); }
  });

  it("rejects playlist input and cleans up private temporary media after failure", () => {
    const before = readdirSync(tmpdir()).filter(name => name.startsWith("gemmacare-audio-"));
    const playlist = "#EXTM3U\n#EXT-X-TARGETDURATION:1\n#EXTINF:1,\nhttp://127.0.0.1:1/synthetic.wav\n#EXT-X-ENDLIST\n";
    expect(() => convertToWav(Buffer.from(playlist).toString("base64"))).toThrow("Audio conversion failed");
    expect(readdirSync(tmpdir()).filter(name => name.startsWith("gemmacare-audio-"))).toEqual(before);
  });
});
