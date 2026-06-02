'use client';

import { useEffect, useState } from 'react';

export default function TrafficLogger() {
  const [visitorId, setVisitorId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [activeSection, setActiveSection] = useState('home');

  // 1. Initialize visitorId and sessionId on mount
  useEffect(() => {
    const uuid = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    if (typeof window !== 'undefined') {
      let vId = localStorage.getItem('pure_edu_visitor_id');
      if (!vId) {
        vId = uuid();
        localStorage.setItem('pure_edu_visitor_id', vId);
      }
      setVisitorId(vId);

      let sId = sessionStorage.getItem('pure_edu_session_id');
      if (!sId) {
        sId = uuid();
        sessionStorage.setItem('pure_edu_session_id', sId);
      }
      setSessionId(sId);
    }
  }, []);

  // 2. Track scroll position to determine active landing page section
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let throttleTimeout = null;

    const handleScroll = () => {
      if (throttleTimeout) return;

      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;

        const scrollPosition = window.scrollY + window.innerHeight / 3;
        const sections = document.querySelectorAll('section[id]');
        let currentActive = 'home';

        sections.forEach(section => {
          const rect = section.getBoundingClientRect();
          const absoluteTop = window.scrollY + rect.top;
          const absoluteHeight = rect.height;
          const id = section.getAttribute('id');

          if (scrollPosition >= absoluteTop && scrollPosition < absoluteTop + absoluteHeight) {
            currentActive = id;
          }
        });

        setActiveSection(currentActive);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, []);

  // 3. Track visitor entry & exit duration per section
  useEffect(() => {
    if (!visitorId || !sessionId) return;

    const virtualPath = activeSection === 'home' ? '/' : `/#${activeSection}`;

    const uuid = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const eventId = uuid();
    let totalActiveTime = 0;
    let lastActiveStartTime = Date.now();
    let isPageVisible = typeof document !== 'undefined' ? !document.hidden : true;
    let lastSentDuration = 0;

    const getAccumulatedDuration = () => {
      let duration = totalActiveTime;
      if (isPageVisible) {
        duration += Date.now() - lastActiveStartTime;
      }
      return Math.round(duration / 1000);
    };

    const sendDurationUpdate = () => {
      const durationSec = getAccumulatedDuration();
      
      if (durationSec >= 1 && durationSec !== lastSentDuration) {
        lastSentDuration = durationSec;
        fetch('/api/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'update',
            eventId,
            duration: durationSec,
          }),
          keepalive: true,
        }).catch(() => {});
      }
    };

    const handleVisibilityChange = () => {
      if (typeof document === 'undefined') return;
      if (document.hidden) {
        if (isPageVisible) {
          totalActiveTime += Date.now() - lastActiveStartTime;
          isPageVisible = false;
          // Send duration update immediately when tab becomes hidden
          sendDurationUpdate();
        }
      } else {
        if (!isPageVisible) {
          lastActiveStartTime = Date.now();
          isPageVisible = true;
        }
      }
    };

    const logVisitEntry = async () => {
      try {
        const w = typeof window !== 'undefined' ? window.screen.width : 0;
        const h = typeof window !== 'undefined' ? window.screen.height : 0;
        const lang = typeof navigator !== 'undefined' ? navigator.language : '';

        await fetch('/api/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: virtualPath,
            referrer: typeof document !== 'undefined' ? document.referrer || 'direct' : 'direct',
            eventId,
            screenSize: w && h ? `${w}x${h}` : 'unknown',
            language: lang || 'unknown',
            sessionId,
            visitorId,
          }),
        });
      } catch (error) {
        console.error("Section log entry failed:", error);
      }
    };

    const timer = setTimeout(logVisitEntry, 1500);

    window.addEventListener('beforeunload', sendDurationUpdate);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeunload', sendDurationUpdate);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      sendDurationUpdate();
    };
  }, [activeSection, visitorId, sessionId]);

  // 4. Capture global click interactions (Navbar, WA, CTA, Social)
  useEffect(() => {
    if (!visitorId || !sessionId) return;

    const handleDocumentClick = (e) => {
      // Find the closest anchor link or button clicked
      const target = e.target.closest('a, button');
      if (!target) return;

      let clickType = '';
      let clickLabel = '';

      const text = target.textContent?.trim() || '';
      const href = target.getAttribute('href') || '';
      const id = target.getAttribute('id') || '';
      const className = target.className || '';

      // Determine the type of click interaction
      if (target.closest('.navbar') || target.closest('nav')) {
        clickType = 'Navbar';
        clickLabel = text || target.getAttribute('aria-label') || href || 'Link';
      } else if (href.includes('wa.me') || href.includes('whatsapp') || className.includes('whatsapp')) {
        clickType = 'WhatsApp';
        clickLabel = text || 'Chat WhatsApp';
      } else if (href === '#contact' || id === 'cta-mulai-sekarang' || text.toLowerCase().includes('hubungi kami') || text.toLowerCase().includes('mulai sekarang')) {
        clickType = 'CTA Kontak';
        clickLabel = text || 'Hubungi Kami';
      } else if (className.includes('instagram-btn') || href.includes('instagram.com')) {
        clickType = 'Instagram';
        clickLabel = 'Lihat Program IG';
      } else if (className.includes('linktree-btn') || href.includes('linktr.ee')) {
        clickType = 'Linktree';
        clickLabel = 'Akses Semua Informasi';
      }

      if (clickType) {
        const uuid = () => {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        };

        const eventId = uuid();
        const w = typeof window !== 'undefined' ? window.screen.width : 0;
        const h = typeof window !== 'undefined' ? window.screen.height : 0;
        const lang = typeof navigator !== 'undefined' ? navigator.language : '';

        // Fire click interaction event (non-blocking)
        fetch('/api/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: `[Klik] ${clickType}: ${clickLabel}`,
            referrer: typeof document !== 'undefined' ? document.referrer || 'direct' : 'direct',
            eventId,
            screenSize: w && h ? `${w}x${h}` : 'unknown',
            language: lang || 'unknown',
            sessionId,
            visitorId,
          }),
          keepalive: true, // ensures the fetch finishes even if navigating away
        }).catch(() => {});
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [visitorId, sessionId]);

  return null;
}
