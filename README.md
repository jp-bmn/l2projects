# Prime Video Mockup (Dark)

This is a single-file interactive mockup of a proposed Prime Video UX revamp. It demonstrates redesigned carousels, accessibility improvements, keyboard navigation, lazy-loaded posters, and a "Deep Dive" feature that generates short, tonal analyses for titles.

What's included
- `index.html` — the complete demo (open in a browser). Uses Tailwind CDN and vanilla JavaScript.

Local usage
1. Open `index.html` directly in your browser for a static preview.
2. For a more accurate local test (avoids some browser file:// restrictions), run a simple static server in the folder, for example:

   # Python 3
   python3 -m http.server 8000

   Then open `http://localhost:8000` in your browser.

Notes
- The demo includes a client-side call pattern for a generative API (Gemini) but the shipped `index.html` defaults to a demo fallback when no API key is provided. Do NOT commit API keys. If you want to enable real requests, set the `apiKey` variable in the script at the top of `index.html` or provide it via a local environment mechanism and adapt the code to read it securely.

- This is a mockup for demonstration only and is not affiliated with Amazon or Prime Video.

License
- MIT
