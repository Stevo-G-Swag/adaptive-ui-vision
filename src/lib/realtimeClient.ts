import { RealtimeClient } from '@openai/realtime-api-beta';

export const createRealtimeClient = (apiKey: string) => {
  const client = new RealtimeClient({
    apiKey,
    baseUrl: import.meta.env.VITE_BRICKS_BASE_URL || 'https://api.trybricks.ai/api/providers/openai',
    model: 'gpt-4o-realtime-preview'
  });

  client.updateSession({
    instructions: "You are an AI assistant capable of generating and modifying UI elements.",
    voice: "alloy",
    turn_detection: { type: 'server_vad' },
    input_audio_transcription: { model: 'whisper-1' }
  });

  return client;
};