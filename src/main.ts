import getPlaylist = require("./spotifyApi.js");

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

type formatedTrack = {
  index: number;
  name: string;
  artists: string;
  addedBy: string | undefined;
}

const playlistId = 'playlist id here';

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
    artists: item.track.artists.map(artist => artist.name).join(", "),
    addedBy: users[item.added_by.id]
  })
);
