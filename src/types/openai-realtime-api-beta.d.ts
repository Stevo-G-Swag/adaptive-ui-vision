declare module '@openai/realtime-api-beta' {
  export class RealtimeClient {
    constructor(options: {
      apiKey: string;
      baseUrl: string;
      model: string;
    });

    updateSession(options: {
      instructions: string;
      voice: string;
      turn_detection: { type: string };
      input_audio_transcription: { model: string };
    }): void;

    connect(): Promise<void>;
    disconnect(): void;
    sendUserMessageContent(content: Array<{ type: string; text: string }>): void;
    cancelResponse(itemId: string, sampleCount: number): void;
    on(event: string, callback: (data: any) => void): void;
    addTool(tool: any, callback: (params: any) => Promise<any>): void;
  }
}