import type { RunningSound } from "../types";

let swiftModule: {
  startSound: (id: string, path: string, volume: number) => Promise<boolean>;
  stopSound: (id: string) => Promise<boolean>;
  stopAllSounds: () => Promise<boolean>;
  setSoundVolume: (id: string, volume: number) => Promise<boolean>;
  getActiveSounds: () => Promise<string[]>;
} | null = null;

async function getSwift() {
  if (!swiftModule) {
    swiftModule = await import("swift:../../swift/looper");
  }
  return swiftModule;
}

export class AudioEngine {
  private volumeMap: Map<string, number> = new Map();

  async startSound(soundId: string, filePath: string, volume: number): Promise<boolean> {
    const swift = await getSwift();
    const looperVolume = Math.max(0, Math.min(1, volume / 100));
    const result = await swift.startSound(soundId, filePath, looperVolume);
    if (result) {
      this.volumeMap.set(soundId, volume);
    }
    return result;
  }

  async stopSound(soundId: string): Promise<void> {
    const swift = await getSwift();
    await swift.stopSound(soundId);
    this.volumeMap.delete(soundId);
  }

  async stopAll(): Promise<void> {
    const swift = await getSwift();
    await swift.stopAllSounds();
    this.volumeMap.clear();
  }

  async changeVolume(soundId: string, filePath: string, newVolume: number): Promise<void> {
    const swift = await getSwift();
    const looperVolume = Math.max(0, Math.min(1, newVolume / 100));
    const updated = await swift.setSoundVolume(soundId, looperVolume);
    if (updated) {
      this.volumeMap.set(soundId, newVolume);
    } else {
      await this.startSound(soundId, filePath, newVolume);
    }
  }

  async getRunningEntries(): Promise<RunningSound[]> {
    const swift = await getSwift();
    const activeIds = await swift.getActiveSounds();
    return activeIds.map((soundId) => ({
      soundId,
      volume: this.volumeMap.get(soundId) ?? 0,
    }));
  }

  async isAnythingPlaying(): Promise<boolean> {
    const entries = await this.getRunningEntries();
    return entries.length > 0;
  }

  async getEntryForSound(soundId: string): Promise<RunningSound | undefined> {
    const entries = await this.getRunningEntries();
    return entries.find((e) => e.soundId === soundId);
  }
}
