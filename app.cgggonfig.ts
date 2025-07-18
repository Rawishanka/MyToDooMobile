import 'dotenv/config';
import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name || 'MyToDoo',
  slug: config.slug || 'MyToDoo', 
  extra: {
    apiUrl: process.env.API_URL,
  },
});
