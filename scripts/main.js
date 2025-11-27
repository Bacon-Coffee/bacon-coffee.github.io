const apiKeyInput = document.getElementById("apiKey");
const rememberToggle = document.getElementById("rememberKey");
const experienceInput = document.getElementById("experience");
const analysisForm = document.getElementById("analysisForm");
const statusEl = document.getElementById("status");
const emotionEl = document.getElementById("emotion");
const supportEl = document.getElementById("support");
const historyEl = document.getElementById("history");

const MODEL = "gpt-4o-mini";
const STORAGE_KEY = "emotion-copilot-api-key";

function loadSavedKey() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    apiKeyInput.value = saved;
    rememberToggle.checked = true;
  }
}

function updateStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#fecdd3" : "#94a3b8";
}

function sanitizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function parseJsonContent(content) {
  const cleaned = content.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.warn("Unable to parse JSON from model response", error, cleaned);
    return null;
  }
}

function renderResult({ emotion, support, rawContent }) {
  emotionEl.textContent = emotion || "Not sure";
  supportEl.textContent = support || rawContent || "No response provided.";

  const item = document.createElement("article");
  item.className = "history__item";

  const meta = document.createElement("div");
  meta.className = "history__meta";
  meta.innerHTML = `<span>${new Date().toLocaleTimeString()}</span><span>${emotion || "Unknown"}</span>`;

  const userText = document.createElement("p");
  userText.className = "history__text";
  userText.textContent = `You shared: ${sanitizeText(experienceInput.value)}`;

  const botText = document.createElement("p");
  botText.className = "history__text";
  botText.textContent = `Chatbot: ${support || rawContent}`;

  item.append(meta, userText, botText);
  historyEl.prepend(item);
}

async function callChatGPT(prompt, apiKey) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content:
            "You are an empathetic assistant. Analyze the user's emotional experience, identify the dominant emotion (sadness, joy, anger, fear, anxiety, frustration, relief, pride, or neutral), and provide a short supportive response. Respond ONLY with valid JSON using keys emotion and support. Keep the support to two to four sentences. Avoid medical advice.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

analysisForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const apiKey = sanitizeText(apiKeyInput.value || "");
  const experience = sanitizeText(experienceInput.value || "");

  if (!apiKey) {
    updateStatus("Please add your OpenAI API key to start.", true);
    apiKeyInput.focus();
    return;
  }

  if (!experience) {
    updateStatus("Tell the chatbot about your experience first.", true);
    experienceInput.focus();
    return;
  }

  updateStatus("Contacting ChatGPT…");
  analysisForm.classList.add("is-loading");

  if (rememberToggle.checked) {
    localStorage.setItem(STORAGE_KEY, apiKey);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }

  try {
    const prompt = `Emotional experience: ${experience}`;
    const content = await callChatGPT(prompt, apiKey);
    const parsed = parseJsonContent(content ?? "");

    if (!parsed) {
      renderResult({ emotion: "Unknown", support: null, rawContent: content });
      updateStatus("The chatbot responded, but formatting was unexpected.");
      return;
    }

    renderResult({ ...parsed, rawContent: content });
    updateStatus("Analysis completed.");
  } catch (error) {
    console.error(error);
    updateStatus("Unable to reach ChatGPT. Please check your key and try again.", true);
  } finally {
    analysisForm.classList.remove("is-loading");
  }
});

loadSavedKey();
