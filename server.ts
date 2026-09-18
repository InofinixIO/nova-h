import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

dotenv.config();

interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
}

async function startServer() {
  const app = express();
  const PORT = 3005;

  // Capture raw body for webhook HMAC signature verification
  app.use(express.json({
    verify: (req: RequestWithRawBody, _res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: true }));

  // 1. Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'NOVA-H Procurement & Membership Server',
      timestamp: new Date().toISOString()
    });
  });

  const adapter = new PrismaLibSql({ url: 'file:./dev.db' });
  const prisma = new PrismaClient({ adapter });

  // API Endpoints for Users
  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const users = await prisma.authUser.findMany();
      res.json(users);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const user = req.body;
      const savedUser = await prisma.authUser.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          role: user.role,
          phone: user.phone,
          company: user.company,
          isSubscribed: user.isSubscribed,
          plan: user.plan,
          status: user.status
        },
        create: {
          id: user.id || undefined,
          name: user.name,
          role: user.role,
          email: user.email,
          phone: user.phone,
          company: user.company,
          isSubscribed: user.isSubscribed,
          plan: user.plan,
          status: user.status
        }
      });
      res.json(savedUser);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API Endpoints for Directory Items
  app.get('/api/directory', async (req: Request, res: Response) => {
    try {
      const items = await prisma.directoryItem.findMany();
      // Parse JSON strings back to arrays
      const formattedItems = items.map((item: any) => ({
        ...item,
        serviceLocations: JSON.parse(item.serviceLocations || '[]'),
        projectStages: JSON.parse(item.projectStages || '[]'),
        productsAndServices: JSON.parse(item.productsAndServices || '[]'),
        clientPortfolio: JSON.parse(item.clientPortfolio || '[]'),
        certifications: JSON.parse(item.certifications || '[]'),
        complianceBadges: JSON.parse(item.complianceBadges || '[]')
      }));
      res.json(formattedItems);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/directory', async (req: Request, res: Response) => {
    try {
      const items = Array.isArray(req.body) ? req.body : [req.body];
      // Basic implementation for bulk save or single item
      for (const item of items) {
        await prisma.directoryItem.upsert({
          where: { id: item.id },
          update: {
            name: item.name,
            role: item.role,
            category: item.category,
            rating: item.rating,
            reviewsCount: item.reviewsCount,
            location: item.location,
            serviceLocations: JSON.stringify(item.serviceLocations || []),
            projectStages: JSON.stringify(item.projectStages || []),
            productsAndServices: JSON.stringify(item.productsAndServices || []),
            description: item.description,
            verified: item.verified,
            yearsOfExperience: item.yearsOfExperience,
            contactEmail: item.contactEmail,
            phone: item.phone,
            website: item.website,
            featuredProject: item.featuredProject,
            clientPortfolio: JSON.stringify(item.clientPortfolio || []),
            gstin: item.gstin,
            priceRange: item.priceRange,
            turnaroundTime: item.turnaroundTime,
            certifications: JSON.stringify(item.certifications || []),
            headquartersAddress: item.headquartersAddress,
            complianceBadges: JSON.stringify(item.complianceBadges || [])
          },
          create: {
            id: item.id,
            name: item.name,
            role: item.role,
            category: item.category,
            rating: item.rating,
            reviewsCount: item.reviewsCount,
            location: item.location,
            serviceLocations: JSON.stringify(item.serviceLocations || []),
            projectStages: JSON.stringify(item.projectStages || []),
            productsAndServices: JSON.stringify(item.productsAndServices || []),
            description: item.description,
            verified: item.verified,
            yearsOfExperience: item.yearsOfExperience,
            contactEmail: item.contactEmail,
            phone: item.phone,
            website: item.website,
            featuredProject: item.featuredProject,
            clientPortfolio: JSON.stringify(item.clientPortfolio || []),
            gstin: item.gstin,
            priceRange: item.priceRange,
            turnaroundTime: item.turnaroundTime,
            certifications: JSON.stringify(item.certifications || []),
            headquartersAddress: item.headquartersAddress,
            complianceBadges: JSON.stringify(item.complianceBadges || [])
          }
        });
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API Endpoints for Facilities
  app.get('/api/facilities', async (req: Request, res: Response) => {
    try {
      const facilities = await prisma.facilityType.findMany();
      res.json(facilities);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/facilities', async (req: Request, res: Response) => {
    try {
      const { id, name, description } = req.body;
      const facility = await prisma.facilityType.create({
        data: { id, name, description }
      });
      res.json(facility);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API Endpoints for Toolkit Stages
  app.get('/api/toolkit/:facilityId', async (req: Request, res: Response) => {
    try {
      const { facilityId } = req.params;
      const stages = await prisma.stageItem.findMany({
        where: { facilityTypeId: facilityId },
        orderBy: { stageNumber: 'asc' }
      });
      const formattedStages = stages.map((stage: any) => ({
        ...stage,
        keyDeliverables: JSON.parse(stage.keyDeliverables || '[]'),
        checklist: JSON.parse(stage.checklist || '[]'),
        keyStakeholders: JSON.parse(stage.keyStakeholders || '[]')
      }));
      res.json(formattedStages);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/toolkit/:facilityId', async (req: Request, res: Response) => {
    try {
      const { facilityId } = req.params;
      const stages = req.body.stages; // Array of stages
      
      // Delete old stages
      await prisma.stageItem.deleteMany({
        where: { facilityTypeId: facilityId }
      });

      // Insert new stages
      for (const stage of stages) {
        await prisma.stageItem.create({
          data: {
            stageNumber: stage.stageNumber,
            title: stage.title,
            category: stage.category,
            summary: stage.summary,
            keyDeliverables: JSON.stringify(stage.keyDeliverables),
            checklist: JSON.stringify(stage.checklist),
            typicalTimeline: stage.typicalTimeline,
            keyStakeholders: JSON.stringify(stage.keyStakeholders),
            facilityTypeId: facilityId
          }
        });
      }

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
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
