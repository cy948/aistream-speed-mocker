import defaultConfig from './default';
import { AppConfig } from './types';
import fs from 'fs';
import path from 'path';

let config = { ...defaultConfig };

// Try to load custom config file if it exists
try {
  const customConfigPath = path.join(process.cwd(), 'config.json');
  if (fs.existsSync(customConfigPath)) {
    const customConfig = JSON.parse(fs.readFileSync(customConfigPath, 'utf-8'));
    config = { 
      ...defaultConfig,
      ...customConfig,
      models: [...(defaultConfig.models || []), ...(customConfig.models || [])],
      responses: { ...defaultConfig.responses, ...(customConfig.responses || {}) }
    };
  }
} catch (error) {
  console.error('Error loading custom config:', error);
}

export function getConfig(): AppConfig {
  return config;
}

export function getModelById(id: string) {
  // Match by prefix
  return config.models.find(model => id.startsWith(model.id));
}

export function getAllModels() {
  return config.models;
}
