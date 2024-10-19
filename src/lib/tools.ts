import { RealtimeClient } from './realtime-api-beta';

export const addWeatherTool = (client: RealtimeClient) => {
  client.addTool(
    {
      name: 'get_weather',
      description: 'Get the weather at a given location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'Location to get the weather from',
          },
          scale: {
            type: 'string',
            enum: ['celsius', 'fahrenheit']
          },
        },
        required: ['location', 'scale'],
      },
    },
    async ({ location, scale }) => {
      // This is a mock implementation. Replace with actual API call.
      return { temperature: 22, scale, location };
    }
  );
};

export const addMemoryTool = (client: RealtimeClient) => {
  let memory: Record<string, string> = {};

  client.addTool(
    {
      name: 'set_memory',
      description: 'Store information in memory',
      parameters: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            description: 'Key to store the information under',
          },
          value: {
            type: 'string',
            description: 'Information to store',
          },
        },
        required: ['key', 'value'],
      },
    },
    async ({ key, value }) => {
      memory[key] = value;
      return { success: true, message: `Stored "${value}" under key "${key}"` };
    }
  );

  client.addTool(
    {
      name: 'get_memory',
      description: 'Retrieve information from memory',
      parameters: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            description: 'Key to retrieve the information from',
          },
        },
        required: ['key'],
      },
    },
    async ({ key }) => {
      const value = memory[key];
      return value ? { success: true, value } : { success: false, message: 'Key not found' };
    }
  );
};