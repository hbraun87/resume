// Downloads store art, screenshots and trailer files for Steam apps into
// media-incoming/<id>/, with a manifest, so they can be picked and committed.
// Henry approved using the Steam media for 4:LOOP and Project Octavia (Oct 18, 2026).
//
//   node scripts/fetch-steam-media.mjs 4loop=3355360 project-octavia=1941770
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'media-incoming';
const MAX_SCREENSHOTS = 8;

async function get(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response;
}

async function save(url, file) {
  try {
    const bytes = Buffer.from(await (await get(url)).arrayBuffer());
    writeFileSync(file, bytes);
    return { url, file, bytes: bytes.length };
  } catch (error) {
    return { url, file, error: String(error) };
  }
}

for (const pair of process.argv.slice(2)) {
  const [id, appid] = pair.split('=');
  const dir = join(OUT, id);
  mkdirSync(dir, { recursive: true });
  const json = await (
    await get(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=english`)
  ).json();
  const data = json[appid]?.data ?? {};
  writeFileSync(join(dir, 'appdetails.json'), JSON.stringify(data, null, 2));
  const files = [];
  const base = data.header_image?.replace(/header\.jpg.*$/, '');
  if (base) {
    for (const art of [
      'header.jpg',
      'capsule_616x353.jpg',
      'library_hero.jpg',
      'library_600x900.jpg',
    ]) {
      files.push(await save(base + art, join(dir, `store-${art}`)));
    }
  }
  for (const [i, shot] of (data.screenshots ?? []).slice(0, MAX_SCREENSHOTS).entries()) {
    const url = shot.path_full.replace(/\?.*$/, '');
    files.push(await save(url, join(dir, `shot-${String(i + 1).padStart(2, '0')}.jpg`)));
  }
  for (const [i, movie] of (data.movies ?? []).entries()) {
    const mp4 = movie.mp4?.['480'] ?? movie.mp4?.max;
    if (mp4) files.push(await save(mp4.replace(/\?.*$/, ''), join(dir, `movie-${i + 1}.mp4`)));
    if (movie.thumbnail)
      files.push(await save(movie.thumbnail, join(dir, `movie-${i + 1}-thumb.jpg`)));
  }
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify({ appid, files }, null, 2));
  console.log(id, files.map((f) => `${f.file} ${f.bytes ?? f.error}`).join('\n'));
}
