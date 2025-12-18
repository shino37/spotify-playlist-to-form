import "dotenv/config";

type TokenCache = {
  accessToken: string;
  expiresAtMs: number; // epoch ms
};

let cache: TokenCache | null = null;

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function fetchAccessToken(): Promise<TokenCache> {
  const clientId = requiredEnv("SPOTIFY_CLIENT_ID");
  const clientSecret = requiredEnv("SPOTIFY_CLIENT_SECRET");

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  const expiresAtMs = Date.now() + json.expires_in * 1000;

  return { accessToken: json.access_token, expiresAtMs };
}

async function getAccessToken(): Promise<string> {
  // 期限の60秒前になったら取り直す（安全マージン）
  const refreshMarginMs = 60_000;

  if (cache && Date.now() < cache.expiresAtMs - refreshMarginMs) {
    return cache.accessToken;
  }

  cache = await fetchAccessToken();
  return cache.accessToken;
}

async function spotifyGet<T>(url: string): Promise<T> {
  const token = await getAccessToken();

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // トークンが失効してた等で 401 が返る場合に一度だけリトライ
  if (res.status === 401) {
    cache = null;
    const retryToken = await getAccessToken();
    const retry = await fetch(url, {
      headers: { Authorization: `Bearer ${retryToken}` },
    });
    if (!retry.ok) throw new Error(`${retry.status} ${retry.statusText}: ${await retry.text()}`);
    return retry.json() as Promise<T>;
  }

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}

// プレイリストの曲一覧を取得
export async function getPlaylist(playlistId: string){
  const url = `https://api.spotify.com/v1/playlists/${playlistId}?fields=name%2C+tracks+.items%28added_by.id%2C+track.name%2C+track.artists.name%29`;
  return spotifyGet<any>(url);
}

// ユーザー情報を取得
export async function getUser(userId: string){
  const url = `https://api.spotify.com/v1/users/${userId}`;
  return spotifyGet<any>(url);
}
