export const transcribeAudio = async (audioBlob: Blob, apiKey: string): Promise<string | null> => {
  if (!apiKey) return null;

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-large-v3');

  try {
    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!res.ok) {
      throw new Error(`Transcription failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data.text?.trim() || null;
  } catch (e) {
    console.error('Transcription error:', e);
    throw e;
  }
};
