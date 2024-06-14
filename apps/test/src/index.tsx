import { initLogging } from '@pdfgen/logging';
import * as path from 'path';

// TODO: update fields based on environment
initLogging({
  logFilePath: path.join('logs', 'app.log'),
  dev: true,
  debug: true,
  environment: 'development'
});