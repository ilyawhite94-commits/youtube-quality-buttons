# YouTube Quality Buttons

**English** | [Русский](README.ru.md)

A userscript that adds video quality buttons right on the YouTube player: 144p, 240p, 360p, 480p, 720p, 1080p, 1440p, 4K, 8K and Auto. No more opening the settings menu every time.

## Features

- Buttons in the top-left corner of the player, shown together with the player controls.
- Only the qualities available for the current video are shown.
- The selected quality is highlighted.
- Works in both normal and fullscreen modes.
- If the player's internal API doesn't respond, the quality is switched through the settings menu (the menu itself doesn't flash on screen).

## Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) or Violentmonkey extension.
2. Open `youtube-quality-buttons.user.js` in this repository and click **Raw**. The extension will offer to install the script.
3. Click "Install" and refresh the YouTube page.

If the script doesn't run in Chrome, open `chrome://extensions`, find Tampermonkey, click "Details" and turn on **"Allow user scripts"**.

## Customizing the look

Button size, color and position are set in the CSS block at the top of the script (`.yq-bar` and `.yq-bar button`).

## Limitations

- The script relies on YouTube's internal player behavior, so it may need a fix after site updates.
- The selected quality is not remembered between videos.
- Buttons are not shown on YouTube Shorts.

## License

MIT
