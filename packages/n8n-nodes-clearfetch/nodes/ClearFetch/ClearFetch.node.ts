import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  JsonObject,
} from 'n8n-workflow';

export class ClearFetch implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'ClearFetch',
    name: 'clearFetch',
    icon: 'file:clearfetch.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Bypass Cloudflare Turnstile & DataDome to extract clean Markdown and structured JSON',
    defaults: {
      name: 'ClearFetch',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'clearFetchApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Web Scraper & Reader',
            value: 'read',
          },
          {
            name: 'Structured JSON Extractor',
            value: 'extract',
          },
          {
            name: 'Web Search & RAG Context',
            value: 'search',
          },
        ],
        default: 'read',
      },
      // READ URL
      {
        displayName: 'Target URL',
        name: 'url',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['read', 'extract'],
          },
        },
        default: '',
        required: true,
        placeholder: 'https://example.com/protected-page',
        description: 'The webpage URL to unblock and extract',
      },
      {
        displayName: 'Stealth Mode',
        name: 'stealth',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['read', 'extract'],
          },
        },
        options: [
          {
            name: 'Auto (Fast TLS + Turnstile Escalation)',
            value: 'auto',
          },
          {
            name: 'Force (Full Residential Browser Solver)',
            value: 'force',
          },
        ],
        default: 'auto',
        description: 'Auto attempts fast TLS first and escalates on 403; Force routes via residential solver immediately',
      },
      {
        displayName: 'Only Main Content',
        name: 'onlyMainContent',
        type: 'boolean',
        displayOptions: {
          show: {
            resource: ['read'],
          },
        },
        default: true,
        description: 'Whether to strip navigation, footers, and ad noise using Trafilatura',
      },
      // EXTRACT JSON SCHEMA
      {
        displayName: 'JSON Schema',
        name: 'jsonSchema',
        type: 'json',
        displayOptions: {
          show: {
            resource: ['extract'],
          },
        },
        default: '{\n  "type": "object",\n  "properties": {\n    "title": {"type": "string"}\n  }\n}',
        required: true,
        description: 'Strict JSON Schema to enforce extraction output',
      },
      {
        displayName: 'Prompt Instruction',
        name: 'prompt',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['extract'],
          },
        },
        default: '',
        description: 'Optional custom instruction for the LLM extraction model',
      },
      // SEARCH
      {
        displayName: 'Search Query',
        name: 'query',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['search'],
          },
        },
        default: '',
        required: true,
        description: 'Web search query to execute',
      },
      {
        displayName: 'Results Limit',
        name: 'limit',
        type: 'number',
        typeOptions: {
          minValue: 1,
          maxValue: 10,
        },
        displayOptions: {
          show: {
            resource: ['search'],
          },
        },
        default: 5,
        description: 'Number of top search results to return (1-10)',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('clearFetchApi');
    const baseUrl = ((credentials.baseUrl as string) || 'https://api.clearfetch.dev').replace(/\/$/, '');
    const apiKey = credentials.apiKey as string;

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        let endpoint = '';
        let body: JsonObject = {};

        if (resource === 'read') {
          endpoint = '/v1/read';
          body = {
            url: this.getNodeParameter('url', i) as string,
            stealth: this.getNodeParameter('stealth', i, 'auto') as string,
            only_main_content: this.getNodeParameter('onlyMainContent', i, true) as boolean,
            max_age: 3600,
          };
        } else if (resource === 'extract') {
          endpoint = '/v1/extract';
          const rawSchema = this.getNodeParameter('jsonSchema', i) as string;
          const parsedSchema = typeof rawSchema === 'string' ? JSON.parse(rawSchema) : rawSchema;
          body = {
            url: this.getNodeParameter('url', i) as string,
            json_schema: parsedSchema,
            prompt: this.getNodeParameter('prompt', i, '') as string,
            stealth: this.getNodeParameter('stealth', i, 'auto') as string,
          };
        } else if (resource === 'search') {
          endpoint = '/v1/search';
          body = {
            query: this.getNodeParameter('query', i) as string,
            limit: this.getNodeParameter('limit', i, 5) as number,
            scrape_results: true,
          };
        }

        const responseData = await this.helpers.httpRequest({
          method: 'POST',
          url: `${baseUrl}${endpoint}`,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'n8n-nodes-clearfetch/1.0.0',
          },
          body,
          json: true,
        });

        returnData.push({ json: responseData });
      } catch (error: any) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: error.message } });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
