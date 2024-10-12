import WebSocket from 'ws';

export class RealtimeClient {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private baseUrl: string;
  private eventListeners: { [key: string]: ((data: any) => void)[] } = {};
  private model: string = 'gpt-4o-realtime-preview-2024-10-01';

  constructor(options: { apiKey: string; baseUrl: string }) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl;
  }

  updateSession(options: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'session.update', options }));
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  async connect() {
    return new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket(`${this.baseUrl}/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'realtime=v1',
        },
      });

      this.ws.onopen = () => {
        console.log('Connected to Realtime API');
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data.toString());
        if (this.eventListeners[data.type]) {
          this.eventListeners[data.type].forEach(callback => callback(data));
        }
      };
    });
  }

  sendUserMessageContent(content: Array<{ type: string; text: string }>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content,
        },
      }));
    }
  }

  appendInputAudio(audio: Int16Array) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_audio', audio: Array.from(audio) }],
        },
      }));
    }
  }

  createResponse() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'response.create' }));
    }
  }

  addTool(tool: any, callback: (params: any) => Promise<any>) {
    this.updateSession({ tools: [tool] });
    this.on('conversation.updated', async (event) => {
      if (event.item.type === 'function_call' && event.item.name === tool.name) {
        const result = await callback(JSON.parse(event.item.arguments));
        this.sendFunctionCallOutput(event.item.id, JSON.stringify(result));
      }
    });
  }

  sendFunctionCallOutput(callId: string, output: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output,
        },
      }));
    }
  }

  cancelResponse(id: string, sampleCount: number) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'response.cancel',
        id,
        sample_count: sampleCount,
      }));
    }
  }
}
