import { AngularAppEngine } from '@angular/ssr';
import { writeResponseToNodeResponse, createNodeRequestHandler } from '@angular/ssr/node';
import express from 'express';

const app = express();
const port = process.env['PORT'] || 3000;

// Middleware for parsing JSON
app.use(express.json({ limit: '10mb' }));

// Helper to call Mistral AI Chat Completions
async function generateWithMistral(prompt: string, apiKey: string, temperature = 0.2): Promise<string> {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: temperature
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
  }

  const data: any = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Config Endpoint to safely expose available providers to client
app.get('/api/config', (req, res) => {
  const hasMistral = !!process.env['MISTRAL_API_KEY'] && process.env['MISTRAL_API_KEY'] !== 'PLACEHOLDER_API_KEY';
  return res.json({ hasMistral });
});

// 1. API: Generate SVG Icon using Mistral AI
app.post('/api/generate-svg', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env['MISTRAL_API_KEY'];

  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    return res.status(512).json({ error: 'MISTRAL_API_KEY is not configured on the server. Please check your Settings.' });
  }

  try {
    const text = await generateWithMistral(prompt, apiKey, 0.2);
    return res.json({ svgCode: text });
  } catch (error: any) {
    console.error('Error generating SVG via Mistral:', error);
    return res.status(500).json({ error: error.message || 'Error generating SVG icon' });
  }
});

// 2. API: Enhance Preset Description using Mistral AI
app.post('/api/enhance-preset', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env['MISTRAL_API_KEY'];

  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    return res.status(512).json({ error: 'MISTRAL_API_KEY is not configured on the server. Please check your Settings.' });
  }

  try {
    const text = await generateWithMistral(prompt, apiKey, 0.7);
    return res.json({ enhancedDescription: text });
  } catch (error: any) {
    console.error('Error enhancing preset via Mistral:', error);
    return res.status(500).json({ error: error.message || 'Error enhancing preset' });
  }
});

// Disable Angular SSR host validation check to avoid "Bad Request" error on localhost / behind proxy
(AngularAppEngine as any).ɵdisableAllowedHostsCheck = true;

// Serving static files from dist
const angularApp = new AngularAppEngine({
  allowedHosts: ['localhost', '127.0.0.1', 'localhost:3000']
});

// Serve static assets from standard folder
app.use(express.static('dist', {
  maxAge: '1y',
  index: false,
}));

// SSR Catch-all must be LAST
app.use((req, res, next) => {
  try {
    const protocol = req.protocol || 'http';
    const host = req.get('host') || req.headers.host || 'localhost:3000';
    const url = `${protocol}://${host}${req.originalUrl}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value === undefined) continue;
      
      const lowerKey = key.toLowerCase();
      // Skip forbidden or connection-specific headers that should not be set manually on a Request
      if (lowerKey === 'host' || lowerKey === 'connection' || lowerKey === 'keep-alive') {
        continue;
      }
      
      // Skip certain headers for GET/HEAD requests to prevent fetch/undici errors
      const isGetOrHead = req.method === 'GET' || req.method === 'HEAD';
      const isContentLengthOrTransferEncoding = lowerKey === 'content-length' || lowerKey === 'transfer-encoding';
      if (isGetOrHead && isContentLengthOrTransferEncoding) {
        continue;
      }

      if (Array.isArray(value)) {
        for (const val of value) {
          headers.append(key, val);
        }
      } else if (value !== null) {
        headers.set(key, value as string);
      }
    }

    const options: RequestInit = {
      method: req.method,
      headers: headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      if (typeof req.body === 'object') {
        options.body = JSON.stringify(req.body);
      } else {
        options.body = req.body;
      }
    }

    const webRequest = new Request(url, options);

    angularApp
      .handle(webRequest)
      .then((response) => {
        if (response) {
          writeResponseToNodeResponse(response, res);
        } else {
          next();
        }
      })
      .catch((err) => {
        console.error('Error handling SSR request in AngularAppEngine:', err);
        next(err);
      });
  } catch (err) {
    console.error('Error constructing Request object for Angular SSR:', err);
    next(err);
  }
});

// Listen on designated port if run directly
if (process.env['NODE_ENV'] !== 'test') {
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export { app };
export const reqHandler = createNodeRequestHandler(app);
export default app;
