/**
 * Crebost Webhooks Worker
 * Handles webhook events from external services (Midtrans, etc.)
 */

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Signature',
  'Access-Control-Max-Age': '86400',
};

// Handle CORS preflight requests
function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }
  return null;
}

// Webhook routes
const webhookRoutes = {
  '/webhooks/midtrans': handleMidtransWebhook,
  '/webhooks/payment': handlePaymentWebhook,
  '/webhooks/user': handleUserWebhook,
  '/webhooks/content': handleContentWebhook,
  '/webhooks/health': handleHealthCheck,
};

// Health check for webhooks
async function handleHealthCheck(request, env) {
  return new Response(JSON.stringify({
    status: 'healthy',
    service: 'webhooks',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// Midtrans payment webhook handler
async function handleMidtransWebhook(request, env) {
  try {
    // Verify request method
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    // Get request body
    const body = await request.text();
    const signature = request.headers.get('X-Signature');
    
    // Verify webhook signature
    if (!verifyMidtransSignature(body, signature, env.MIDTRANS_SERVER_KEY)) {
      return new Response('Invalid signature', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    // Parse webhook data
    const webhookData = JSON.parse(body);
    
    // Process payment notification
    const result = await processMidtransNotification(webhookData, env);
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
    
  } catch (error) {
    console.error('Midtrans webhook error:', error);
    return new Response(JSON.stringify({ 
      error: 'Webhook processing failed',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// Verify Midtrans webhook signature
function verifyMidtransSignature(body, signature, serverKey) {
  if (!signature || !serverKey) {
    return false;
  }
  
  // Midtrans signature verification logic
  // This is a simplified version - implement proper SHA512 verification
  const expectedSignature = generateMidtransSignature(body, serverKey);
  return signature === expectedSignature;
}

// Generate Midtrans signature (simplified)
function generateMidtransSignature(body, serverKey) {
  // Implement proper SHA512 signature generation
  // This is a placeholder
  return 'signature_placeholder';
}

// Process Midtrans payment notification
async function processMidtransNotification(data, env) {
  const { transaction_status, order_id, payment_type, gross_amount } = data;
  
  try {
    // Update payment status in database
    const query = `
      UPDATE payments 
      SET status = ?, updated_at = datetime('now')
      WHERE order_id = ?
    `;
    
    let status = 'pending';
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      status = 'completed';
    } else if (transaction_status === 'cancel' || transaction_status === 'expire') {
      status = 'failed';
    }
    
    await env.DB.prepare(query).bind(status, order_id).run();
    
    // If payment completed, process content access
    if (status === 'completed') {
      await grantContentAccess(order_id, env);
    }
    
    // Cache the result
    await env.CACHE.put(`payment_${order_id}`, JSON.stringify({
      status,
      processed_at: new Date().toISOString(),
      transaction_status,
      payment_type,
      gross_amount
    }), { expirationTtl: 3600 }); // 1 hour cache
    
    return {
      success: true,
      order_id,
      status,
      message: 'Payment notification processed successfully'
    };
    
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to update payment status');
  }
}

// Grant content access after successful payment
async function grantContentAccess(orderId, env) {
  try {
    // Get payment details
    const paymentQuery = `
      SELECT user_id, content_id, amount 
      FROM payments 
      WHERE order_id = ?
    `;
    
    const payment = await env.DB.prepare(paymentQuery).bind(orderId).first();
    
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    // Grant access to content
    const accessQuery = `
      INSERT INTO content_access (user_id, content_id, granted_at, expires_at)
      VALUES (?, ?, datetime('now'), datetime('now', '+30 days'))
    `;
    
    await env.DB.prepare(accessQuery)
      .bind(payment.user_id, payment.content_id)
      .run();
    
    // Update creator earnings
    const earningsQuery = `
      UPDATE users 
      SET total_earnings = total_earnings + ?
      WHERE id = (SELECT creator_id FROM content WHERE id = ?)
    `;
    
    const creatorEarning = payment.amount * 0.8; // 80% to creator
    await env.DB.prepare(earningsQuery)
      .bind(creatorEarning, payment.content_id)
      .run();
    
    console.log(`Content access granted for order ${orderId}`);
    
  } catch (error) {
    console.error('Error granting content access:', error);
    throw error;
  }
}

// Generic payment webhook handler
async function handlePaymentWebhook(request, env) {
  return new Response(JSON.stringify({ 
    message: 'Generic payment webhook handler' 
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// User webhook handler
async function handleUserWebhook(request, env) {
  return new Response(JSON.stringify({ 
    message: 'User webhook handler' 
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// Content webhook handler
async function handleContentWebhook(request, env) {
  return new Response(JSON.stringify({ 
    message: 'Content webhook handler' 
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// Log webhook event for debugging
async function logWebhookEvent(event, data, env) {
  try {
    const logEntry = {
      event,
      data,
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID()
    };
    
    // Store in KV for debugging (with TTL)
    await env.CACHE.put(
      `webhook_log_${logEntry.id}`, 
      JSON.stringify(logEntry),
      { expirationTtl: 86400 } // 24 hours
    );
    
  } catch (error) {
    console.error('Failed to log webhook event:', error);
  }
}

// Main worker handler
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    const url = new URL(request.url);
    const path = url.pathname;

    // Log incoming webhook
    await logWebhookEvent('incoming_webhook', {
      path,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries())
    }, env);

    // Find matching webhook route
    for (const [route, handler] of Object.entries(webhookRoutes)) {
      if (path.startsWith(route)) {
        try {
          return await handler(request, env);
        } catch (error) {
          console.error('Webhook error:', error);
          
          // Log error
          await logWebhookEvent('webhook_error', {
            path,
            error: error.message,
            stack: error.stack
          }, env);
          
          return new Response(JSON.stringify({ 
            error: 'Webhook processing failed',
            message: error.message 
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
      }
    }

    // Default 404 response
    return new Response(JSON.stringify({ 
      error: 'Webhook endpoint not found',
      path 
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  },
};
