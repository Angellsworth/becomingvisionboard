# Background music

Drop your background music here as a file called **`garden.mp3`**.

It loops while you're on the Memory Garden page, fades in over 3
seconds, and fades out over 1 second when you leave. Sound must be
on (speaker icon in the nav).

## Recommended: Vivaldi — *The Four Seasons*

The composition has been public domain since 1741, but recordings
are owned by the performers. The cleanest free source is **Musopen**:

> <https://musopen.org/music/2213-the-four-seasons-op-8/>

1. Open the page.
2. Find a recording labeled **"Public Domain"** or **"Creative
   Commons Zero (CC0)"** — these are free to use anywhere.
3. Click **Download** → choose **MP3**.
4. Rename the file to **`garden.mp3`**.
5. Drop it into this folder (`public/audio/`).
6. Refresh `/garden` in the browser.

The whole work is ~40 minutes. A single movement (say *Spring*,
~10 minutes) is also fine — it just loops sooner.

## Other options

- **IMSLP** also hosts Vivaldi recordings: <https://imslp.org/wiki/The_Four_Seasons,_Op.8_(Vivaldi,_Antonio)>
- Any other music you have rights to is welcome — name it `garden.mp3`.

## File size note

Static assets in `/public` ship with the build. A typical 40-min mp3
is 30–40 MB, which is fine for self-hosting but heavier for users on
slow networks. For a tighter file, pick one movement, or re-encode at
96 kbps (still sounds good for ambient listening).
