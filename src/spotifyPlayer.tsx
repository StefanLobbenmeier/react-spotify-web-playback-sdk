import React, { createContext, useContext, useEffect, useState } from "react";
import { MUST_BE_WRAPPED_MESSAGE } from "./constant";
import { useEffectTimeout } from "./useEffectTimeout";
import { useWebPlaybackSDKReady } from "./webPlaybackSDKReady";

const PlayerContext = createContext<Spotify.SpotifyPlayer | null | undefined>(
  undefined,
);

type ProviderProps = {
  deviceName: Spotify.PlayerInit["name"];
  getOAuthToken: Spotify.PlayerInit["getOAuthToken"];
  volume?: Spotify.PlayerInit["volume"];
  connectOnInitialized: boolean;
};

export const SpotifyPlayerProvider: React.FC<ProviderProps> = ({
  children,
  deviceName,
  getOAuthToken,
  volume,
  connectOnInitialized,
}) => {
  const [player, setPlayer] = useState<Spotify.SpotifyPlayer | null>(null);
  const webPlaybackSDKReady = useWebPlaybackSDKReady();

  // create Spotify.Player instance.
  useEffect(
    () => {
      if (webPlaybackSDKReady) {
        const player = new Spotify.Player({
          name: deviceName,
          getOAuthToken: getOAuthToken,
          volume: volume,
        });

        setPlayer(player);

        if (connectOnInitialized) {
          player.connect();
        }
      }
    },
    // `deviceName` and `volume` are intentionally not passed.
    // When they are changed, they will be applied with the following useUpdateEffect.
    [getOAuthToken, connectOnInitialized, webPlaybackSDKReady],
  );

  // The first effect is ignored.
  // Because the first `deviceName` will be passed to Spotify.Player constructor.
  useEffectTimeout(() => {
    player?.setName(deviceName);
  }, [deviceName]);

  // The first effect is ignored.
  // Because the first `volume` will be passed to Spotify.Player constructor.
  useEffect(() => {
    volume !== undefined && player?.setVolume(volume);
  }, [volume]);

  return <PlayerContext.Provider value={player} children={children} />;
};

export function useSpotifyPlayer() {
  const value = useContext(PlayerContext);

  if (value === undefined) throw new Error(MUST_BE_WRAPPED_MESSAGE);

  return value;
}
