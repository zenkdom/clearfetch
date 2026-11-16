import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class ClearFetchApi implements ICredentialType {
  name = 'clearFetchApi';
  displayName = 'ClearFetch API';
  documentationUrl = 'https://clearfetch.dev/docs';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Your ClearFetch API Key starting with cf_live_... from https://clearfetch.dev/dashboard',
    },
    {
      displayName: 'Base Gateway URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.clearfetch.dev',
      required: true,
      description: 'ClearFetch API Gateway endpoint',
    },
  ];
}
