/**
 * Crebost API Worker
 * Handles API requests for the Crebost platform
 */

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

// API Routes
const routes = {
  '/api/health': handleHealth,
  '/api/auth': handleAuth,
  '/api/users': handleUsers,
  '/api/content': handleContent,
  '/api/payments': handlePayments,
  '/api/analytics': handleAnalytics,
};

// Health check endpoint
async function handleHealth(request, env) {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'connected',
      cache: 'connected',
      storage: 'connected'
    }
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// Authentication endpoints
async function handleAuth(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  if (path === '/api/auth/session') {
    return handleSession(request, env);
  } else if (path === '/api/auth/login') {
    return handleLogin(request, env);
  } else if (path === '/api/auth/logout') {
    return handleLogout(request, env);
  }
  
  return new Response('Not Found', { status: 404, headers: corsHeaders });
}

// Session management
async function handleSession(request, env) {
  try {
    const sessionToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return new Response(JSON.stringify({ error: 'No session token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check session in KV store
    const session = await env.SESSIONS.get(sessionToken);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ 
      valid: true, 
      session: JSON.parse(session) 
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// User management endpoints
async function handleUsers(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  
  if (method === 'GET') {
    return getUserProfile(request, env);
  } else if (method === 'PUT') {
    return updateUserProfile(request, env);
  }
  
  return new Response('Method not allowed', { status: 405, headers: corsHeaders });
}

// Content management endpoints
async function handleContent(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  
  if (method === 'GET') {
    return getContent(request, env);
  } else if (method === 'POST') {
    return createContent(request, env);
  } else if (method === 'PUT') {
    return updateContent(request, env);
  } else if (method === 'DELETE') {
    return deleteContent(request, env);
  }
  
  return new Response('Method not allowed', { status: 405, headers: corsHeaders });
}

// Payment endpoints
async function handlePayments(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  if (path === '/api/payments/create') {
    return createPayment(request, env);
  } else if (path === '/api/payments/verify') {
    return verifyPayment(request, env);
  }
  
  return new Response('Not Found', { status: 404, headers: corsHeaders });
}

// Analytics endpoints
async function handleAnalytics(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  
  if (method === 'GET') {
    return getAnalytics(request, env);
  } else if (method === 'POST') {
    return trackEvent(request, env);
  }
  
  return new Response('Method not allowed', { status: 405, headers: corsHeaders });
}

// Placeholder implementations
async function handleLogin(request, env) {
  return new Response(JSON.stringify({ message: 'Login endpoint' }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function handleLogout(request, env) {
  return new Response(JSON.stringify({ message: 'Logout endpoint' }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function getUserProfile(request, env) {
  return new Response(JSON.stringify({ message: 'Get user profile' }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function updateUserProfile(request, env) {
  return new Response(JSON.stringify({ message: 'Update user profile' }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function getContent(request, env) {
  return new Response(JSON.stringify({ message: 'Get content' }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function createContent(request, env) {
  return new Response(JSON.stringify({ message: 'Create content' }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function updateContent(request, env) {
  return new Response(JSON.stringify({ message: 'Update content' }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function deleteContent(request, env) {
  return new Response(JSON.stringify({ message: 'Delete content' }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function createPayment(request, env) {
  return new Response(JSON.stringify({ message: 'Create payment' }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function verifyPayment(request, env) {
  return new Response(JSON.stringify({ message: 'Verify payment' }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function getAnalytics(request, env) {
  return new Response(JSON.stringify({ message: 'Get analytics' }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function trackEvent(request, env) {
  return new Response(JSON.stringify({ message: 'Track event' }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// Main worker handler
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    const url = new URL(request.url);
    const path = url.pathname;

    // Find matching route
    for (const [route, handler] of Object.entries(routes)) {
      if (path.startsWith(route)) {
        try {
          return await handler(request, env);
        } catch (error) {
          console.error('Error handling request:', error);
          return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
      }
    }

    // Default 404 response
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  },
};
