ELEVOR360D — THE LAST MAINTENANCE WINDOW
Version 1.0.2

WHAT IS INCLUDED
An original, approximately 10,000-word science fiction novella: 10 chapters,
50 numbered story pages, four original illustrations (one cover and three
interior scenes; one scene is reused). Complete story, not a sample.

The app includes saved reading position, multiple bookmarks, chapter and page
navigation, adjustable text size, three reading themes and offline reading.
It works without an account. Reading preferences stay in this browser/device;
clearing browser data or using another device does not transfer progress.
The cover is separate from the 50 story pages. Pages scroll on small screens
and when larger text is selected, so no story text gets cut off.

PUT IT ON GITHUB PAGES
1. Extract this ZIP on your computer.
2. Create a new public GitHub repository, for example:
   Elevor360D-The-Last-Maintenance-Window
3. Upload the CONTENTS of the extracted folder, including the assets folder.
   index.html must be at the repository root, not inside another folder.
4. In Settings > Pages, choose Deploy from a branch, then main and / (root).
5. Wait for GitHub Pages to report the published HTTPS address.
6. Open that address, wait for Available offline, and try the book.
7. Add its published URL to your Elevor360D website as a free app opening URL.
   Suggested app ID: the-last-maintenance-window

Alternatively, place all app files in a NEW subfolder of an existing HTTPS
website. Keep its files together. Do not replace your app store's index.html
or service worker. This book's service worker is scoped to its own folder.
This package does not modify your existing app store.

INSTALL ON A PHONE
Android: open the published address in Chrome. Tap Install book. If the browser
does not offer a direct prompt, use Chrome's menu > Install app / Add to Home
screen. iPhone/iPad: Safari > Share > Add to Home Screen. Desktop: Chrome/Edge
installation icon or browser menu. The install button hides in installed mode.
Installation options depend on the browser. Reading in the browser also works.

OFFLINE CHECK
Open online once. Wait for Available offline. Close and reopen the installed
app in airplane mode. All 50 pages and illustrations should remain available.
Opening index.html directly as a computer file allows reading, but is not a
valid installation/offline test; HTTPS hosting is needed for those features.

UPDATES
If editing the app, increment the version at the end of CACHE in sw.js and
upload all changed files. The next online visit installs the new cache.
Reading progress remains on the same origin and path. Moving to another
repository or domain creates separate browser storage.

WEBSITE LISTING
Title: Elevor360D — The Last Maintenance Window
Description: A forgotten lunar lander starts transmitting after forty-three
years of silence. Join engineer Mara Venn and Kestrel's crew in an illustrated
science fiction adventure with believable technology, gentle humour and a
supply ship depending on their next decision. Install for offline reading.
Image: assets/cover.webp

STORY AND ART
Original fictional story created for Elevor360D. Characters, organisations,
spacecraft and events are fictional. Illustration appearances are artistic
interpretations. No author identity has been invented or attributed.
Full editable manuscript: story.txt. Reader content: story-data.js.
Art production notes are in ART-NOTES.txt.

This is a standalone book app, without payments, licensing or analytics.
