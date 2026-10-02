import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import cors from 'cors';
import { apiRouter } from './src/api/routes';
import { initializeDatabase } from './src/db/init';

dotenv.config();

interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Neon database schema & automated seed
  try {
    await initializeDatabase();
  } catch (dbErr) {
    console.warn('[Server] Database initialization deferred:', dbErr);
  }

  app.use(cors());

  // Capture raw body for webhook HMAC signature verification
  app.use(express.json({
    verify: (req: RequestWithRawBody, _res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: true }));

  // Mount Database REST API Router
  app.use('/api', apiRouter);

  // 1b. AI Flow Builder Endpoint (Generates WhatsApp flows supporting all 7 message types)
  app.post('/api/ai/generate-flow', async (req: Request, res: Response) => {
    try {
      const { prompt, supportedTypes, flowName, category = 'healthcare' } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      if (!apiKey) {
        // Return signal to use client-side heuristic generator
        return res.json({
          success: false,
          fallback: true,
          message: 'GEMINI_API_KEY not set on server. Using built-in healthcare flow synthesizer.'
        });
      }

      // Lazy import & initialize Google Gen AI
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const typesList = Array.isArray(supportedTypes) && supportedTypes.length > 0
        ? supportedTypes.join(', ')
        : 'text_buttons, media_buttons, list, catalogue, single_product, multi_product, template';

      const systemPrompt = `You are an expert conversational architect and WhatsApp Business API flow designer for NOVA Healthcare Network.
You must generate a structured JSON object representing an interactive WhatsApp Flow.
The user wants: "${prompt}".
Name: "${flowName || 'AI Generated Healthcare Flow'}".

CRITICAL REQUIREMENT: You MUST support and synthesize across these WhatsApp message types:
${typesList}

Message types reference:
1. "text_buttons": text message with 1-3 buttons (e.g. quick reply, yes/no, actions).
2. "media_buttons": headerType 'image' with headerContent URL + bodyText + 1-3 buttons.
3. "list": headerType 'text', listButtonText, listSections (array of sections with title and rows {id, title, description, nextNodeId}).
4. "catalogue": catalogConfig with catalogId, thumbnailUrl, headerText, bodyText, actionButtonText 'View Catalog'.
5. "single_product": singleProduct object with retailerId, title, price (e.g. '₹4,50,000'), currency 'INR', description, imageUrl.
6. "multi_product": headerType 'text', productSections with title and array of products.
7. "template": templateConfig with templateName, category ('MARKETING'|'UTILITY'), bodyVariables, buttons.

Respond ONLY with valid JSON conforming to this TypeScript interface:
{
  "name": string,
  "description": string,
  "category": "healthcare" | "rfq" | "vendor" | "support",
  "triggerKeyword": string,
  "nodes": Array<{
    "id": string,
    "title": string,
    "type": "text_buttons" | "media_buttons" | "list" | "catalogue" | "single_product" | "multi_product" | "template",
    "headerType": "none" | "text" | "image",
    "headerContent"?: string,
    "bodyText": string,
    "footerText"?: string,
    "buttons"?: Array<{ "id": string, "title": string, "nextNodeId"?: string }>,
    "listButtonText"?: string,
    "listSections"?: Array<{ "title": string, "rows": Array<{ "id": string, "title": string, "description": string, "nextNodeId"?: string }> }>,
    "singleProduct"?: { "id": string, "retailerId": string, "title": string, "price": string, "currency": string, "description": string, "imageUrl": string, "nextNodeId"?: string },
    "productSections"?: Array<{ "title": string, "products": Array<{ "id": string, "retailerId": string, "title": string, "price": string, "currency": string, "description": string, "imageUrl": string, "nextNodeId"?: string }> }>,
    "catalogConfig"?: { "catalogId": string, "thumbnailUrl": string, "headerText": string, "bodyText": string, "actionButtonText": string, "nextNodeId"?: string },
    "templateConfig"?: { "templateName": string, "category": string, "language": string, "bodyVariables": string[], "buttons"?: Array<{ "id": string, "type": string, "text": string, "nextNodeId"?: string }> }
  }>
}
Do not include any markdown fences or commentary outside the JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemPrompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text?.trim() || '{}';
      const cleanJson = responseText.replace(/^```json\s*/, '').replace(/```$/, '');
      const parsedFlow = JSON.parse(cleanJson);

      return res.json({
        success: true,
        flow: parsedFlow
      });
    } catch (err: any) {
      console.error('Error in /api/ai/generate-flow:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to generate flow with AI',
        fallback: true
      });
    }
  });

  // 2. Razorpay Order Creation Route (Optional server-side order generation)
  app.post('/api/create-razorpay-order', async (req: Request, res: Response) => {
    try {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      const { amount, currency = 'INR', receipt, notes } = req.body;

      if (!keyId || !keySecret) {
        return res.status(400).json({
          error: 'Razorpay API keys not configured on server.',
          mock: true
        });
      }

      // Convert to paisa
      const amountInPaise = Math.round(Number(amount) * 100);

      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt: receipt || `NOVAH_${Date.now().toString(36).toUpperCase()}`,
          notes: {
            app_name: 'nova_h_procurement',
            ...notes
          }
        })
      });

      const orderData = await response.json();
      if (!response.ok) {
        return res.status(response.status).json(orderData);
      }

      return res.json(orderData);
    } catch (err: any) {
      console.error('Error creating Razorpay order:', err);
      return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });

  // 3. Razorpay Webhook Endpoint
  // Webhook URL: /api/razorpay-webhook
  app.post('/api/razorpay-webhook', (req: RequestWithRawBody, res: Response) => {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers['x-razorpay-signature'] as string;

      // If a webhook secret is configured, verify the HMAC SHA-256 signature
      if (webhookSecret) {
        if (!signature || !req.rawBody) {
          console.warn('[Webhook] Missing signature or raw payload');
          return res.status(400).json({ error: 'Signature verification failed: missing signature' });
        }

        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(req.rawBody)
          .digest('hex');

        if (signature !== expectedSignature) {
          console.warn('[Webhook] Invalid Razorpay signature mismatch');
          return res.status(400).json({ error: 'Invalid signature' });
        }
      }

      const event = req.body;
      const eventType = event.event;
      const paymentEntity = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;

      // Filter events from shared Razorpay accounts
      // Only process transactions tagged with app_name === 'nova_h_procurement'
      const appTag = paymentEntity?.notes?.app_name || orderEntity?.notes?.app_name;

      if (appTag && appTag !== 'nova_h_procurement') {
        console.log(`[Webhook] Ignored event ${eventType} meant for external application: ${appTag}`);
        return res.status(200).json({ status: 'ignored', reason: 'external_app_event' });
      }

      console.log(`[Webhook] Successfully received Razorpay event: ${eventType}`, {
        paymentId: paymentEntity?.id,
        amount: paymentEntity?.amount ? paymentEntity.amount / 100 : undefined,
        appName: appTag || 'unspecified'
      });

      // Handle specific events
      switch (eventType) {
        case 'payment.captured':
        case 'order.paid':
          // Payment successful
          console.log(`[Webhook] Payment confirmed: ${paymentEntity?.id} for ₹${(paymentEntity?.amount || 0) / 100}`);
          break;
        case 'payment.failed':
          console.log(`[Webhook] Payment failed: ${paymentEntity?.id}, Reason: ${paymentEntity?.error_description}`);
          break;
        default:
          console.log(`[Webhook] Unhandled event type: ${eventType}`);
      }

      return res.status(200).json({ status: 'success', received: true });
    } catch (err: any) {
      console.error('[Webhook] Error processing webhook:', err);
      return res.status(500).json({ error: 'Internal server error processing webhook' });
    }
  });

  // Vite middleware for dev or static fallback for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NOVA-H Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
