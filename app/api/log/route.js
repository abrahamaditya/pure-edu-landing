import { NextResponse } from 'next/server';

function sanitizeString(str, maxLength = 200) {
  if (typeof str !== 'string') return '';
  let clean = str.substring(0, maxLength).trim();
  // Strip HTML tags to prevent XSS
  clean = clean.replace(/<[^>]*>/g, '');
  return clean;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const action = typeof body.action === 'string' ? body.action.trim() : '';
    const eventId = typeof body.eventId === 'string' ? body.eventId.trim() : '';
    const duration = parseInt(body.duration) || 0;

    // 1. Strict Validation: eventId must be a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(eventId)) {
      return NextResponse.json({ success: false, error: "Invalid Event ID format" }, { status: 400 });
    }

    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

    if (!scriptUrl) {
      console.warn("GOOGLE_SCRIPT_URL is not set in environment variables.");
      return NextResponse.json({ success: false, error: "GOOGLE_SCRIPT_URL not configured" }, { status: 500 });
    }

    let payload = {};

    if (action === 'update') {
      payload = {
        action: 'update',
        eventId,
        duration: Math.min(Math.max(0, duration), 86400) // max 24 hours
      };
    } else {
      const path = sanitizeString(body.path, 200);
      const referrer = sanitizeString(body.referrer, 500);
      const screenSize = sanitizeString(body.screenSize, 20);
      const language = sanitizeString(body.language, 10);
      const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
      const visitorId = typeof body.visitorId === 'string' ? body.visitorId.trim() : '';

      // 2. Strict Validation: sessionId & visitorId must be valid UUID formats
      if (!uuidRegex.test(sessionId) || !uuidRegex.test(visitorId)) {
        return NextResponse.json({ success: false, error: "Invalid Session or Visitor ID format" }, { status: 400 });
      }

      // 3. Security Check: Origin/Referer header verification to prevent external spoofing/abuse
      const origin = req.headers.get('origin');
      const referer = req.headers.get('referer');
      const host = req.headers.get('host');

      if (process.env.NODE_ENV === 'production' && origin) {
        try {
          const originHost = new URL(origin).host;
          if (originHost !== host) {
            return NextResponse.json({ success: false, error: "Forbidden origin source" }, { status: 403 });
          }
        } catch (e) {
          return NextResponse.json({ success: false, error: "Malformed origin header" }, { status: 400 });
        }
      }

      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
      const cleanIp = ip.split(',')[0].trim();
      const userAgent = req.headers.get('user-agent') || 'unknown';

      // 4. Resolve Location (Vercel Headers or GeoIP API fallback)
      let location = 'Localhost';
      if (cleanIp !== '127.0.0.1' && cleanIp !== '::1' && cleanIp !== 'localhost') {
        const vercelCity = req.headers.get('x-vercel-ip-city');
        const vercelCountry = req.headers.get('x-vercel-ip-country');
        
        if (vercelCity && vercelCountry) {
          location = `${decodeURIComponent(vercelCity)}, ${vercelCountry}`;
        } else {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1200);
            
            const geoRes = await fetch(`https://ipapi.co/${cleanIp}/json/`, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              if (geoData.city && geoData.country_code) {
                location = `${geoData.city}, ${geoData.country_code}`;
              }
            }
          } catch (e) {
            location = 'Remote / Unknown';
          }
        }
      }

      payload = {
        ip: cleanIp,
        path,
        userAgent: sanitizeString(userAgent, 500),
        referrer,
        eventId,
        screenSize,
        language,
        sessionId,
        visitorId,
        location: sanitizeString(location, 100)
      };
    }

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const resText = await response.text();
    let result;
    try {
      result = JSON.parse(resText);
    } catch (parseErr) {
      console.error("Non-JSON response from Apps Script:", resText.substring(0, 500));
      throw new Error("Web App Apps Script returned HTML. Check deployment settings.");
    }
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error in POST /api/log:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

    if (!scriptUrl) {
      console.warn("GOOGLE_SCRIPT_URL is not set in environment variables.");
      return NextResponse.json({ success: false, error: "GOOGLE_SCRIPT_URL not configured" }, { status: 500 });
    }

    const response = await fetch(scriptUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 0 }, 
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from script: ${response.statusText}`);
    }

    const resText = await response.text();
    let logs;
    try {
      logs = JSON.parse(resText);
    } catch (parseErr) {
      console.error("Non-JSON response from Apps Script:", resText.substring(0, 500));
      throw new Error("Web App Apps Script returned HTML. Check deployment settings.");
    }
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("Error in GET /api/log:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
