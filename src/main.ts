import getPlaylist = require("./spotifyApi.js");
import { createForms } from "./formsApi.js";

type Track = {
  name: string;
  artists: {
    name: string
  }[];
}

type Items = {
  added_by: { id: string };
  track: Track;
}

type Playlist = {
  name: string;
  tracks: {
    items: Items[];
  };
}

export type formatedTrack = {
  index: number;
  name: string;
  artists: string;
  addedBy: string | undefined;
}

export function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const playlistId = requiredEnv("PLAYLIST_ID");

const playlist: Playlist = await getPlaylist.getPlaylist(playlistId).catch(console.error); 
const userIds = Array.from(
  new Set(
    playlist?.tracks?.items
      .map(item => item.added_by.id)
      .filter((id): id is string => Boolean(id))
  )
); 
const users: Record<string, string> = {};
for (const userId of userIds) {
  const user = await getPlaylist.getUser(userId).catch(console.error);
  if (user) users[userId] = user.display_name;
}

const formatedTracks: formatedTrack[] = playlist?.tracks?.items.map(
  (item, i) => ({
    index: i + 1,
    name: item.track.name,
    artists: item.track.artists.length > 1
              ? `${item.track.artists[0]?.name} et al.`
              : item.track.artists[0]?.name || "Unknown Artist",
    addedBy: users[item.added_by.id]
  })
);

const title = `${playlist?.name}アワード`;
const description = "レギュレーション\n - 1位から5位まで5曲投票する。\n - 同じ曲に複数回投票はできない。\n - 各順位ごとに点数を設定し、その合計点でランキングを作成する。\n - 自分が追加した曲には投票できない。";

createForms(
  title,
  description,
  formatedTracks || []
).catch(console.error);

