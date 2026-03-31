import AVFoundation
import RaycastSwiftMacros

private class AudioManager {
  static let shared = AudioManager()
  private var players: [String: AVAudioPlayer] = [:]

  func start(id: String, path: String, volume: Float) -> Bool {
    stop(id: id)
    guard let url = URL(fileURLWithPath: path) as URL?,
      let player = try? AVAudioPlayer(contentsOf: url)
    else {
      return false
    }
    player.numberOfLoops = -1
    player.volume = volume
    player.play()
    players[id] = player
    return true
  }

  @discardableResult
  func stop(id: String) -> Bool {
    if let player = players.removeValue(forKey: id) {
      player.stop()
      return true
    }
    return false
  }

  func stopAll() {
    for (_, player) in players {
      player.stop()
    }
    players.removeAll()
  }

  func setVolume(id: String, volume: Float) -> Bool {
    if let player = players[id] {
      player.volume = volume
      return true
    }
    return false
  }

  func activeSounds() -> [String] {
    return players.keys.filter { players[$0]?.isPlaying == true }.sorted()
  }
}

@raycast func startSound(id: String, path: String, volume: Float) -> Bool {
  return AudioManager.shared.start(id: id, path: path, volume: volume)
}

@raycast func stopSound(id: String) -> Bool {
  return AudioManager.shared.stop(id: id)
}

@raycast func stopAllSounds() -> Bool {
  AudioManager.shared.stopAll()
  return true
}

@raycast func setSoundVolume(id: String, volume: Float) -> Bool {
  return AudioManager.shared.setVolume(id: id, volume: volume)
}

@raycast func getActiveSounds() -> [String] {
  return AudioManager.shared.activeSounds()
}
