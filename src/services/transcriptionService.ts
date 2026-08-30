export const transcribeAudio = async (audioBlob: Blob): Promise<string | null> => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');

  try {
    const res = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || `Transcription failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data.text?.trim() || null;
  } catch (e) {
    console.error('Transcription error:', e);
    throw e;
  }
};
