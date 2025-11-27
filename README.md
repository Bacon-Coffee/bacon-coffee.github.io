# Emotion Copilot

A lightweight, browser-only page that connects to the OpenAI Chat Completions API. Paste your API key, share an emotional experience from your project, and receive:

1. A detected dominant emotion (sadness, joy, anger, fear, anxiety, frustration, relief, pride, or neutral)
2. A brief, supportive response from the chatbot to help you regroup

## Running locally

No build steps are required. Open `index.html` in your browser or serve the folder locally (for example, `python -m http.server 8000`) and browse to the server URL.

## Using the chatbot

1. Enter your OpenAI API key. Check **Remember this key** if you want it stored in your browser's local storage.
2. Describe the emotional experience you want the chatbot to analyze.
3. Click **Analyze with ChatGPT** to send the request to the OpenAI API (model `gpt-4o-mini`).
4. The page will display the detected emotion and a supportive message. Recent analyses appear in the history list.

> This tool offers reflective support only and does not provide medical or clinical advice.
