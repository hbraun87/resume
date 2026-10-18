import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkContent, scanStrings } from '../../src/lib/content-check';

const profile = JSON.parse(readFileSync('src/content/profile.json', 'utf8'));

const entry = (overrides: Record<string, unknown> = {}) => ({
  id: 'my-game',
  title: 'My Game',
  category: 'game',
  tier: 'archive',
  status: 'shipped',
  visibility: 'public',
  role: 'Programmer',
  summary: 'A short summary.',
  platformGroup: 'pc',
  ...overrides,
});

const run = (entries: unknown[], files: Record<string, string[]> = {}, prof: unknown = profile) =>
  checkContent({ experiences: entries }, prof, (id) => files[id] ?? []);

describe('checkContent', () => {
  it('passes the real content files with no warnings', () => {
    const experiences = JSON.parse(readFileSync('src/content/experiences.json', 'utf8'));
    const report = checkContent(experiences, profile, (id) =>
      readdirOrEmpty(`src/assets/projects/${id}`),
    );
    expect(report).toEqual({ errors: [], warnings: [] });
  });

  it('reports schema errors with the file and field', () => {
    const report = checkContent({ experiences: [entry({ tier: 'hero' })] }, {}, () => []);
    expect(report.errors).toContainEqual(
      expect.stringMatching(/^experiences\.json → experiences\.0\.tier/),
    );
    expect(report.errors).toContainEqual(expect.stringMatching(/^profile\.json → name/));
  });

  it('flags duplicate ids', () => {
    expect(run([entry(), entry()]).errors).toEqual(['experiences.json → my-game: duplicate id']);
  });

  it('flags placeholders and phone numbers in public and hidden entries, not drafts', () => {
    const report = run([
      entry({ summary: 'TODO: write this' }),
      entry({ id: 'call-me', summary: 'Call 412-555-0100' }),
      entry({ id: 'secret', visibility: 'draft', summary: 'TBD' }),
      entry({ id: 'shelved', visibility: 'hidden', summary: 'TBD' }),
    ]);
    expect(report.errors).toEqual([
      'experiences.json → my-game.summary: placeholder text in public content',
      'experiences.json → call-me.summary: looks like a phone number; never publish it',
      'experiences.json → shelved.summary: placeholder text in public content',
    ]);
  });

  it('scans the profile too', () => {
    const report = run([], {}, { ...profile, pitch: `${profile.pitch} lorem ipsum` });
    expect(report.errors).toEqual(['profile.json.pitch: placeholder text in public content']);
  });

  it('makes a missing file an error when public and a warning when draft', () => {
    const media = [{ type: 'image', src: '01.jpg', alt: 'A frame' }];
    const report = run([entry({ media }), entry({ id: 'draft-game', visibility: 'draft', media })]);
    expect(report.errors).toEqual([
      'experiences.json → my-game → media[0].src "01.jpg" not found in src/assets/projects/my-game/',
    ]);
    expect(report.warnings).toEqual([
      'experiences.json → draft-game → media[0].src "01.jpg" not found in src/assets/projects/draft-game/',
    ]);
  });

  it('rejects GIFs, clips and cover loops in public entries until the media pipeline exists', () => {
    const media = [
      { type: 'gif', src: 'a.gif', alt: 'Loop' },
      { type: 'video', src: 'b.mp4', alt: 'Clip' },
    ];
    const files = { 'my-game': ['a.gif', 'b.mp4', 'c.mp4'], draft: ['a.gif', 'b.mp4', 'c.mp4'] };
    const coverLoop = { src: 'c.mp4' };
    const report = run(
      [entry({ media, coverLoop }), entry({ id: 'draft', visibility: 'draft', media, coverLoop })],
      files,
    );
    expect(report.errors).toEqual([
      'experiences.json → my-game → coverLoop: needs the media pipeline (docs/decisions.md)',
      'experiences.json → my-game → media[0]: gif files need the media pipeline (docs/decisions.md); use an image or YouTube for now',
      'experiences.json → my-game → media[1]: video files need the media pipeline (docs/decisions.md); use an image or YouTube for now',
    ]);
  });

  it('checks covers, cover loops and YouTube posters, and warns on unused files', () => {
    const report = run(
      [
        entry({
          cover: { src: 'cover.jpg', alt: 'Cover' },
          coverLoop: { src: 'loop.mp4' },
          media: [
            { type: 'youtube', id: 'S1zZHy7_BFg', title: 'Trailer', poster: 'poster.jpg' },
            { type: 'youtube', id: 'BbTIdBKVmeI', title: 'Teaser' },
          ],
        }),
      ],
      { 'my-game': ['cover.jpg', 'loop.mp4', 'extra.png', '.DS_Store'] },
    );
    expect(report.errors).toEqual([
      'experiences.json → my-game → coverLoop: needs the media pipeline (docs/decisions.md)',
      'experiences.json → my-game → media[0].poster "poster.jpg" not found in src/assets/projects/my-game/',
    ]);
    expect(report.warnings).toEqual([
      'experiences.json → my-game: src/assets/projects/my-game/extra.png is not used',
    ]);
  });

  it('warns when a public featured entry has no cover', () => {
    const featured = entry({
      tier: 'featured',
      highlights: ['Built it.'],
      caseStudy: {
        challenge: 'Hard.',
        contributions: [{ heading: 'Engine', body: 'Built it.' }],
        outcome: 'Shipped.',
      },
    });
    const report = run([featured]);
    expect(report.warnings).toEqual(['experiences.json → my-game: featured entry has no cover']);
  });
});

describe('scanStrings', () => {
  it('flags working-note keys at any depth', () => {
    const errors: string[] = [];
    scanStrings({ a: [{ _note: 'ok' }], b: 3, c: null }, 'x', errors);
    expect(errors).toEqual(['x.a[0]._note: working notes must not be in content files']);
  });
});

function readdirOrEmpty(path: string): string[] {
  return existsSync(path) ? readdirSync(path) : [];
}
