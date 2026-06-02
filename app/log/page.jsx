'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  RefreshCw, 
  Globe, 
  Laptop, 
  Tablet, 
  Smartphone, 
  Calendar, 
  ArrowLeft, 
  Eye,
  ShieldCheck,
  TrendingUp,
  Compass,
  Clock,
  Users,
  Activity,
  Info,
  MapPin,
  MousePointerClick,
  HelpCircle,
  MousePointer,
  LogOut,
  Loader2
} from 'lucide-react';

// Helper to parse User-Agent to simple terms
function parseUserAgent(ua) {
  if (!ua || ua === 'unknown') return { device: 'Komputer', os: 'Tidak Diketahui', browser: 'Browser' };

  let device = 'Komputer (Desktop)';
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = 'Tablet';
  } else if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    device = 'HP (Mobile)';
  }

  let os = 'Sistem OS';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'Mac/Apple';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iPhone/iPad';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Browser';
  if (/Edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) browser = 'Google Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari (Apple)';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

  return { device, os, browser };
}

// Map technical section paths to friendly names for non-technical admins
function getFriendlyPathName(path) {
  if (path.startsWith('[Klik]')) {
    const cleanClick = path.replace('[Klik] ', '');
    // Translate click labels nicely
    return cleanClick
      .replace('Navbar: ', 'Klik Menu: ')
      .replace('WhatsApp: ', 'Klik Hubungi WhatsApp: ')
      .replace('CTA Kontak: ', 'Klik Tombol Daftar/Kontak: ')
      .replace('Instagram: ', 'Klik Link Instagram: ')
      .replace('Linktree: ', 'Klik Linktree: ');
  }
  if (path === '/') return 'Halaman Paling Atas (Beranda)';
  const cleanPath = path.replace('/#', '#');
  const mapping = {
    '#home': 'Halaman Paling Atas (Beranda)',
    '#stats': 'Angka Pencapaian PURE',
    '#clients': 'Daftar Sekolah & Mitra Klien',
    '#about': 'Tentang PURE Education',
    '#pillars': '3 Pilar Karakter Utama',
    '#services': 'Layanan Kelas PURE',
    '#program': 'Program Pelatihan PURE',
    '#classes': 'Daftar Workshop & Kelas',
    '#gallery': 'Dokumentasi Foto Kegiatan',
    '#contact': 'Hubungi Kami / Kontak'
  };
  return mapping[cleanPath] || path;
}

// Format duration into friendly Indonesian text
function formatDuration(sec) {
  const s = parseInt(sec) || 0;
  if (s <= 0) return 'Kurang dari 1 detik';
  if (s < 60) return `${s} detik`;
  const m = Math.floor(s / 60);
  const remS = s % 60;
  if (remS === 0) return `${m} menit`;
  return `${m} menit ${remS} detik`;
}

// Format date
function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    
    const options = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false
    };
    return d.toLocaleString('id-ID', options);
  } catch (e) {
    return dateStr;
  }
}

// Extract clean date key (YYYY-MM-DD)
function getDateKey(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
}

export default function PremiumLogDashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPath, setSelectedPath] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'activity', 'journey'

  const [activeTooltip, setActiveTooltip] = useState(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const res = await fetch('/api/logout', {
        method: 'POST',
      });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setLogoutLoading(false);
    }
  };

  const [excludeMe, setExcludeMe] = useState(false);
  const [currentVisitorId, setCurrentVisitorId] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const vId = localStorage.getItem('pure_edu_visitor_id');
      if (vId) {
        setCurrentVisitorId(vId);
      }
    }
  }, []);

  const logsToProcess = useMemo(() => {
    if (excludeMe && currentVisitorId) {
      return logs.filter(l => l.visitorId !== currentVisitorId);
    }
    return logs;
  }, [logs, excludeMe, currentVisitorId]);

  const [trendRange, setTrendRange] = useState('7d');

  const itemsPerPage = 15;

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/log', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      } else {
        setError(data.error || 'Gagal memuat log');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Compute Advanced Metrics based on Sessions
  const metrics = useMemo(() => {
    if (!logsToProcess.length) return {
      pageViews: 0,
      totalSessions: 0,
      bounceRate: 0,
      avgSessionDuration: '0 detik',
      activeNow: 0,
      topPaths: [],
      topReferrers: [],
      topLocations: [],
      topClicks: [],
      devices: { Desktop: 0, Mobile: 0, Tablet: 0 },
      browsers: {},
      systems: {},
      dailyTrend: []
    };

    // Filter logs: Pageviews (section reads) vs Click events
    const pageViewsLogs = logsToProcess.filter(l => !l.path.startsWith('[Klik]'));
    const clicksLogs = logsToProcess.filter(l => l.path.startsWith('[Klik]'));

    const pageViews = pageViewsLogs.length;

    // Group logs by session
    const sessions = {};
    const now = Date.now();
    let activeNowSessions = new Set();

    logsToProcess.forEach(l => {
      const sId = l.sessionId || l.ip;

      if (!sessions[sId]) {
        sessions[sId] = {
          ip: l.ip,
          location: l.location || 'Localhost',
          userAgent: l.userAgent,
          referrer: l.referrer,
          startTime: new Date(l.timestamp).getTime(),
          endTime: new Date(l.timestamp).getTime(),
          pageViewsCount: 0,
          totalDuration: 0,
          pages: []
        };
      }

      const logTime = new Date(l.timestamp).getTime();
      const logDuration = parseInt(l.duration) || 0;

      const isClick = l.path.startsWith('[Klik]');
      if (!isClick) {
        sessions[sId].pageViewsCount += 1;
        sessions[sId].totalDuration += logDuration;
      }
      
      if (logTime < sessions[sId].startTime) sessions[sId].startTime = logTime;
      if (logTime + (logDuration * 1000) > sessions[sId].endTime) {
        sessions[sId].endTime = logTime + (logDuration * 1000);
      }

      sessions[sId].pages.push({
        path: l.path,
        timestamp: l.timestamp,
        duration: logDuration,
        isClick
      });

      if (now - logTime < 5 * 60 * 1000) {
        activeNowSessions.add(sId);
      }
    });

    const totalSessions = Object.keys(sessions).length;

    // Average duration spent per session
    let totalSessionDuration = 0;
    Object.values(sessions).forEach(s => {
      totalSessionDuration += s.totalDuration;
    });
    const avgSessionDurationVal = totalSessions ? Math.round(totalSessionDuration / totalSessions) : 0;
    const avgSessionDuration = formatDuration(avgSessionDurationVal);

    // Bounce Rate: Session with only 1 section viewed AND total duration < 10 seconds (ignoring clicks)
    let bouncedSessions = 0;
    Object.values(sessions).forEach(s => {
      if (s.pageViewsCount === 1 && s.totalDuration < 10) {
        bouncedSessions++;
      }
    });
    const bounceRate = totalSessions ? Math.round((bouncedSessions / totalSessions) * 100) : 0;

    // Top Paths (Section reads only)
    const paths = {};
    pageViewsLogs.forEach(l => {
      paths[l.path] = (paths[l.path] || 0) + 1;
    });
    const topPaths = Object.entries(paths)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top Referrers (1 count per session)
    const referrers = {};
    Object.values(sessions).forEach(s => {
      const ref = s.referrer === 'direct' ? 'Direct Access' : s.referrer;
      referrers[ref] = (referrers[ref] || 0) + 1;
    });
    const topReferrers = Object.entries(referrers)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top Locations (1 count per session)
    const locations = {};
    Object.values(sessions).forEach(s => {
      const loc = s.location || 'Localhost';
      locations[loc] = (locations[loc] || 0) + 1;
    });
    const topLocations = Object.entries(locations)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top Click Interactions
    const clicks = {};
    clicksLogs.forEach(l => {
      const label = l.path.replace('[Klik] ', '');
      clicks[label] = (clicks[label] || 0) + 1;
    });
    const topClicks = Object.entries(clicks)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Systems breakdown (1 count per session)
    const devices = { Desktop: 0, Mobile: 0, Tablet: 0 };
    const browsers = {};
    const systems = {};
    
    Object.values(sessions).forEach(s => {
      const { device, os, browser } = parseUserAgent(s.userAgent);
      devices[device] = (devices[device] || 0) + 1;
      browsers[browser] = (browsers[browser] || 0) + 1;
      systems[os] = (systems[os] || 0) + 1;
    });

    // Daily Trend (last 7 days sessions)
    const trendMap = {};
    Object.values(sessions).forEach(s => {
      const key = getDateKey(s.startTime);
      if (key) {
        trendMap[key] = (trendMap[key] || 0) + 1;
      }
    });
    const dailyTrend = Object.entries(trendMap)
      .map(([date, pageViews]) => ({ date, pageViews }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      pageViews,
      totalSessions,
      bounceRate,
      avgSessionDuration,
      activeNow: activeNowSessions.size,
      topPaths,
      topReferrers,
      topLocations,
      topClicks,
      devices,
      browsers,
      systems,
      dailyTrend,
      sessions
    };
  }, [logsToProcess]);

  const filteredDailyTrend = useMemo(() => {
    if (!metrics.dailyTrend || !metrics.dailyTrend.length) return [];
    
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    
    let cutoff = null;
    if (trendRange === '7d') {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (trendRange === '1m') {
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (trendRange === '3m') {
      cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (trendRange === '6m') {
      cutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    } else if (trendRange === '1y') {
      cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }
    
    if (cutoff === null) {
      return metrics.dailyTrend;
    }
    
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return metrics.dailyTrend.filter(t => t.date >= cutoffStr);
  }, [metrics.dailyTrend, trendRange]);

  // Unique paths filter
  const uniquePaths = useMemo(() => {
    const paths = new Set(logsToProcess.map(l => l.path));
    return ['all', ...Array.from(paths)];
  }, [logsToProcess]);

  // Filter logs for Activity Table
  const filteredLogs = useMemo(() => {
    return logsToProcess.filter(log => {
      const matchesPath = selectedPath === 'all' || log.path === selectedPath;
      const { browser, os, device } = parseUserAgent(log.userAgent);
      const friendlyName = getFriendlyPathName(log.path);
      
      const searchTarget = `${log.path} ${friendlyName} ${log.referrer} ${log.ip} ${log.location || ''} ${browser} ${os} ${device}`.toLowerCase();
      const matchesSearch = searchTarget.includes(searchTerm.toLowerCase());
      
      return matchesPath && matchesSearch;
    });
  }, [logsToProcess, searchTerm, selectedPath]);

  // Paginated logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  // Grouped sessions for User Journey
  const sortedSessions = useMemo(() => {
    if (!metrics.sessions) return [];
    return Object.entries(metrics.sessions)
      .map(([sessionId, sessionData]) => ({
        sessionId,
        ...sessionData
      }))
      .sort((a, b) => b.endTime - a.endTime);
  }, [metrics.sessions]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    if (!searchTerm) return sortedSessions;
    return sortedSessions.filter(s => {
      const { browser, os } = parseUserAgent(s.userAgent);
      const searchTarget = `${s.ip} ${s.location || ''} ${browser} ${os} ${s.referrer} ${s.pages.map(p => getFriendlyPathName(p.path)).join(' ')}`.toLowerCase();
      return searchTarget.includes(searchTerm.toLowerCase());
    });
  }, [sortedSessions, searchTerm]);

  const getDeviceIcon = (device) => {
    switch (device) {
      case 'Tablet': return <Tablet size={16} className="text-orange" />;
      case 'HP (Mobile)': return <Smartphone size={16} className="text-green" />;
      default: return <Laptop size={16} className="text-blue" />;
    }
  };

  const toggleTooltip = (metricName) => {
    if (activeTooltip === metricName) {
      setActiveTooltip(null);
    } else {
      setActiveTooltip(metricName);
    }
  };

  return (
    <div className="log-dashboard-wrapper">
      <style jsx global>{`
        .log-dashboard-wrapper {
          min-height: 100vh;
          background-color: #0B0F19;
          color: #E2E8F0;
          font-family: var(--font-jakarta, 'Plus Jakarta Sans'), sans-serif;
          padding: 40px 4%;
          overflow-x: hidden;
        }

        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        /* Top Header */
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: nowrap;
          gap: 20px;
        }

        .btn-group-responsive {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-top: 6px;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #94A3B8;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: var(--transition);
          margin-bottom: 20px;
        }

        .back-link:hover {
          color: var(--brand-orange);
          transform: translateX(-4px);
        }

        .dash-title-group h1 {
          font-size: 2.4rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
          line-height: 1.25;
        }

        .live-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #10B981;
          background: rgba(16, 185, 129, 0.1);
          padding: 4px 10px;
          border-radius: 100px;
          font-weight: 700;
          vertical-align: middle;
          border: 1px solid rgba(16, 185, 129, 0.2);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10B981;
        }

        .dash-title-group p {
          color: #94A3B8;
          font-size: 0.95rem;
          margin-top: 4px;
        }

        .btn-refresh {
          background: #1E293B;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }

        .btn-refresh:hover {
          border-color: var(--brand-orange);
          color: var(--brand-orange);
          background: #1E293B;
        }

        .btn-logout {
          background: #ef4444;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
          cursor: pointer;
        }

        .btn-logout:hover:not(:disabled) {
          background: #dc2626;
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
          transform: translateY(-2px);
        }
        
        .btn-logout:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .select-trend-range {
          background: #0B0F19;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          color: #94A3B8;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 28px 4px 12px;
          cursor: pointer;
          transition: var(--transition);
          outline: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 10px;
        }

        .select-trend-range:focus,
        .select-trend-range:hover {
          border-color: var(--brand-orange);
          color: white;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        }

        .btn-refresh.spinning svg {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Collapsible Educational Guide Panel */
        .guide-panel {
          background: linear-gradient(135deg, #151D30 0%, #1A243C 100%);
          border-radius: var(--radius-md);
          border: 1px dashed rgba(234, 99, 25, 0.3);
          margin-bottom: 30px;
          overflow: hidden;
          transition: var(--transition);
        }

        .guide-header-btn {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          font-weight: 700;
          font-size: 1rem;
          text-align: left;
        }

        .guide-header-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #FF8C42;
        }

        .guide-content {
          padding: 0 24px 24px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 20px;
        }

        .guide-card {
          background: rgba(11, 15, 25, 0.4);
          padding: 16px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.03);
        }

        .guide-card h4 {
          color: white;
          font-size: 0.9rem;
          margin-bottom: 8px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .guide-card p {
          color: #94A3B8;
          font-size: 0.8rem;
          line-height: 1.5;
        }

        /* Tabs Navigation */
        .dash-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 1px;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }

        .dash-tabs::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        .tab-btn {
          background: transparent;
          border: none;
          color: #94A3B8;
          font-weight: 600;
          font-size: 1rem;
          padding: 12px 20px;
          cursor: pointer;
          position: relative;
          transition: var(--transition);
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .tab-btn:hover {
          color: white;
        }

        .tab-btn.active {
          color: var(--brand-orange);
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--brand-orange);
        }

        /* Core Metrics Grid */
        .metrics-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .metric-card {
          background: #151D30;
          border-radius: var(--radius-md);
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          position: relative;
          transition: var(--transition);
          cursor: pointer;
        }

        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .metric-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--brand-orange);
        }

        .metric-card.green::before { background: var(--brand-green); }
        .metric-card.blue::before { background: #3b82f6; }
        .metric-card.purple::before { background: #8b5cf6; }

        .metric-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(234, 99, 25, 0.15);
          color: var(--brand-orange);
          margin-bottom: 16px;
        }

        .metric-card.green .metric-icon-wrapper {
          background: rgba(72, 135, 101, 0.15);
          color: var(--brand-green);
        }
        .metric-card.blue .metric-icon-wrapper {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }
        .metric-card.purple .metric-icon-wrapper {
          background: rgba(139, 92, 246, 0.15);
          color: #8b5cf6;
        }

        .metric-label-group {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .metric-label {
          font-size: 0.85rem;
          color: #94A3B8;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .btn-info-icon {
          color: #64748B;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          border-radius: 50%;
        }

        .btn-info-icon:hover {
          color: white;
        }

        .metric-value {
          font-size: 2.2rem;
          font-weight: 800;
          color: white;
          margin-top: 6px;
          letter-spacing: -0.02em;
        }

        .metric-info {
          font-size: 0.72rem;
          color: #64748B;
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Tooltip Card Explanation */
        .tooltip-explanation {
          background: #1E293B;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 10px 14px;
          margin-top: 10px;
          font-size: 0.75rem;
          line-height: 1.4;
          color: #CBD5E1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Overview Tab Layout */
        .overview-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          margin-bottom: 30px;
        }

        @media (max-width: 900px) {
          .overview-grid {
            grid-template-columns: 1fr;
          }
        }

        .panel-card {
          background: #151D30;
          border-radius: var(--radius-md);
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          min-width: 0;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding-bottom: 12px;
        }

        .panel-header h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: white;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .panel-desc-helper {
          font-size: 0.78rem;
          color: #64748B;
          margin-top: -15px;
          margin-bottom: 20px;
          display: block;
        }

        /* Trend Visual Chart (CSS & SVG) */
        .chart-container {
          height: 200px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 10px 0 20px;
          position: relative;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chart-bar-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;
          position: relative;
        }

        .chart-bar {
          width: 80%;
          max-width: 32px;
          min-width: 2px;
          background: linear-gradient(180deg, var(--brand-orange) 0%, rgba(234, 99, 25, 0.3) 100%);
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
          transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s ease;
          position: relative;
          cursor: pointer;
        }

        .chart-bar:hover {
          transform: scaleY(1.05);
          filter: brightness(1.1);
        }

        .chart-tooltip {
          position: absolute;
          bottom: 100%;
          background: #1E293B;
          color: white;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          opacity: 0;
          visibility: hidden;
          transition: var(--transition);
          white-space: nowrap;
          pointer-events: none;
          box-shadow: 0 10px 15px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.08);
          z-index: 10;
          transform: translateY(-4px);
        }

        .chart-bar-wrapper:hover .chart-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(-8px);
        }

        .chart-x-label {
          font-size: 0.75rem;
          color: #64748B;
          margin-top: 8px;
          text-align: center;
          font-weight: 600;
        }

        .chart-empty {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748B;
          font-size: 0.9rem;
        }

        /* Top List Rows styling */
        .top-items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .top-item-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
          min-width: 0;
        }

        .top-item-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 600;
          width: 100%;
          min-width: 0;
          gap: 12px;
        }

        .top-item-name {
          color: #E2E8F0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 75%;
          font-weight: 600;
          min-width: 0;
        }

        .top-item-count {
          color: white;
        }

        .progress-bar-bg {
          width: 100%;
          height: 6px;
          background: #1E293B;
          border-radius: 100px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--brand-orange);
          border-radius: 100px;
          transition: width 0.8s ease;
        }

        .progress-bar-fill.green { background: var(--brand-green); }
        .progress-bar-fill.blue { background: #3b82f6; }
        .progress-bar-fill.purple { background: #8b5cf6; }

        /* Distribution Lists */
        .dist-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 600px) {
          .dist-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Filter Controls Custom */
        .filters-panel {
          background: #151D30;
          border-radius: var(--radius-md);
          padding: 20px 24px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-wrapper {
          position: relative;
          flex: 1;
          min-width: 250px;
        }

        .search-icon-svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748B;
        }

        .input-dark {
          width: 100%;
          height: 44px;
          background: #0B0F19;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 30px;
          color: white;
          padding: 0 16px 0 42px;
          font-family: inherit;
          font-size: 0.9rem;
          transition: var(--transition);
        }

        .input-dark:focus {
          outline: none;
          border-color: var(--brand-orange);
          box-shadow: 0 0 0 3px rgba(234, 99, 25, 0.15);
        }

        .select-dark {
          height: 44px;
          background: #0B0F19;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 30px;
          color: white;
          padding: 0 40px 0 20px;
          font-family: inherit;
          font-size: 0.9rem;
          cursor: pointer;
          min-width: 180px;
          transition: var(--transition);
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 16px;
        }

        .select-dark:focus {
          outline: none;
          border-color: var(--brand-orange);
        }

        /* Activity Table Custom */
        .table-dark-container {
          background: #151D30;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 255, 255, 0.04);
          overflow-x: auto;
          margin-bottom: 24px;
        }

        .table-dark {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.88rem;
        }

        .table-dark th {
          background: rgba(0, 0, 0, 0.15);
          color: #94A3B8;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .table-dark td {
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          color: #E2E8F0;
        }

        .table-dark tr:hover {
          background-color: rgba(255, 255, 255, 0.01);
        }

        /* Unmasked raw IP styling */
        .ip-cell-raw {
          font-family: monospace;
          background: #1E293B;
          color: #38BDF8;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid rgba(56, 189, 248, 0.15);
          letter-spacing: 0.03em;
        }

        .badge-path-dark {
          display: inline-block;
          font-family: inherit;
          background: rgba(234, 99, 25, 0.15);
          color: #FF8C42;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 700;
          border: 1px solid rgba(234, 99, 25, 0.25);
          font-size: 0.82rem;
        }

        .badge-path-dark.home {
          background: rgba(16, 185, 129, 0.15);
          color: #10B981;
          border: 1px solid rgba(16, 185, 129, 0.25);
        }

        .badge-path-dark.click-event {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.25);
        }

        .duration-text {
          font-weight: 700;
          color: white;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .location-text {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #F8FAFC;
          font-weight: 600;
        }

        /* User Journey Timeline view styling */
        .journey-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .journey-card {
          background: #151D30;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 255, 255, 0.04);
          overflow: hidden;
          transition: var(--transition);
        }

        .journey-card-header {
          background: rgba(0, 0, 0, 0.12);
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .session-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .session-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          font-weight: 700;
          color: #64748B;
          letter-spacing: 0.05em;
        }

        .session-details-grid {
          display: flex;
          gap: 20px;
          color: #94A3B8;
          font-size: 0.82rem;
          flex-wrap: wrap;
        }

        .session-detail-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .journey-timeline-content {
          padding: 24px;
          position: relative;
        }

        .timeline-track {
          position: absolute;
          left: 36px;
          top: 36px;
          bottom: 36px;
          width: 2px;
          background: #1E293B;
        }

        .timeline-step {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
          position: relative;
        }

        .timeline-step:last-child {
          margin-bottom: 0;
        }

        .timeline-bullet {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #0B0F19;
          border: 2px solid var(--brand-orange);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          color: var(--brand-orange);
          font-size: 0.7rem;
          font-weight: 800;
        }

        .timeline-bullet.click-bullet {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .timeline-step:first-child .timeline-bullet {
          background: var(--brand-orange);
          color: white;
        }

        .timeline-step-details {
          background: #0B0F19;
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-md);
          padding: 12px 18px;
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .timeline-step-details.click-step-details {
          border-left: 3px solid #3b82f6;
        }

        .step-path-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .step-path {
          font-weight: 700;
          color: white;
          font-size: 0.9rem;
        }

        .step-time {
          font-size: 0.75rem;
          color: #64748B;
        }

        .step-stay {
          font-size: 0.8rem;
          color: #E2E8F0;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255,255,255,0.04);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .step-click-indicator {
          font-size: 0.8rem;
          color: #3b82f6;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(59, 130, 246, 0.1);
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        /* Loading / Error States */
        .state-wrapper {
          padding: 80px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #151D30;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 255, 255, 0.04);
          gap: 16px;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(234, 99, 25, 0.1);
          border-top-color: var(--brand-orange);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .btn-page-dark {
          height: 38px;
          padding: 0 16px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #0B0F19;
          color: #94A3B8;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition);
        }

        .btn-page-dark:hover:not(:disabled) {
          border-color: var(--brand-orange);
          color: white;
        }

        .btn-page-dark:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .btn-page-dark.active {
          background: var(--brand-orange);
          color: white;
          border-color: var(--brand-orange);
        }

        @media (max-width: 768px) {
          .log-dashboard-wrapper {
            padding: 24px 16px;
          }
          .dash-title-group h1 {
            font-size: 1.8rem;
          }
          .metric-value {
            font-size: 1.8rem;
          }
          .metrics-summary-grid {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 12px;
          }
          .metric-card {
            padding: 16px;
          }
          .table-dark {
            min-width: 700px;
          }
          .panel-card {
            padding: 16px;
          }
          .dist-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .overview-grid {
            gap: 16px;
            margin-bottom: 20px;
          }
        }

        @media (max-width: 600px) {
          .dash-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            flex-wrap: wrap;
          }
          .btn-group-responsive {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 0;
          }
          .btn-refresh,
          .btn-logout {
            width: 100% !important;
            justify-content: center;
          }
          .filters-panel {
            flex-direction: column;
            align-items: stretch;
            padding: 16px;
            gap: 12px;
          }
          .search-wrapper {
            min-width: 100%;
          }
          .select-dark {
            width: 100%;
          }
          .journey-card-header {
            flex-direction: column;
            align-items: flex-start;
            padding: 16px;
            gap: 12px;
          }
          .session-details-grid {
            flex-direction: column;
            gap: 8px;
            margin-top: 4px;
          }
          .journey-timeline-content {
            padding: 16px;
          }
          .timeline-track {
            left: 28px;
          }
          .timeline-step {
            gap: 12px;
          }
          .timeline-bullet {
            width: 24px;
            height: 24px;
          }
          .timeline-step-details {
            padding: 10px 14px;
          }
        }
      `}</style>

      <div className="dashboard-container">
        <Link href="/" className="back-link">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>

        {/* Header */}
        <div className="dash-header">
          <div className="dash-title-group">
            <h1>Laporan Pengunjung Web PURE Edu</h1>
            <p>Data kunjungan disimpan secara aman dan rapi.</p>
            <div style={{ marginTop: '12px' }}>
              <label className="toggle-exclude-me" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={excludeMe} 
                  onChange={(e) => setExcludeMe(e.checked || e.target.checked)}
                  style={{ cursor: 'pointer', accentColor: '#ea6319', width: '16px', height: '16px' }}
                />
                Sembunyikan Kunjungan Saya (Exclude Me)
              </label>
            </div>
          </div>
          <div className="btn-group-responsive">
            <button 
              className={`btn btn-refresh ${loading ? 'spinning' : ''}`} 
              onClick={fetchLogs}
              disabled={loading}
            >
              <RefreshCw size={16} /> 
              {loading ? 'Memuat...' : 'Perbarui Data'}
            </button>
            <button 
              className="btn btn-logout" 
              onClick={handleLogout}
              disabled={logoutLoading}
            >
              {logoutLoading ? <Loader2 size={16} className="spin" /> : <LogOut size={16} />}
              Keluar
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="state-wrapper" style={{ borderLeft: '4px solid #ef4444' }}>
            <Globe className="text-orange" size={40} style={{ opacity: 0.6 }} />
            <h3 style={{ color: 'white', fontWeight: 700 }}>Gagal Menghubungkan Laporan</h3>
            <p style={{ color: '#94A3B8', maxWidth: '500px', fontSize: '0.9rem' }}>
              Terjadi gangguan koneksi ke basis data laporan. Silakan coba klik tombol di bawah untuk menyambungkan kembali.
            </p>
            <span style={{ color: '#ef4444', fontSize: '0.8rem', fontFamily: 'monospace' }}>Detail: {error}</span>
            <button className="btn btn-blue" onClick={fetchLogs} style={{ marginTop: '12px' }}>Coba Hubungkan Kembali</button>
          </div>
        )}

        {/* Dashboard Tabs */}
        {!error && (
          <div className="dash-tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => { setActiveTab('overview'); setCurrentPage(1); }}
            >
              <Activity size={18} /> Ringkasan Utama
            </button>
            <button 
              className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => { setActiveTab('activity'); setCurrentPage(1); }}
            >
              <Users size={18} /> Daftar Pengunjung Detail
            </button>
            <button 
              className={`tab-btn ${activeTab === 'journey' ? 'active' : ''}`}
              onClick={() => { setActiveTab('journey'); setCurrentPage(1); }}
            >
              <MousePointerClick size={18} /> Alur Membaca Pengunjung
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {!error && loading && logs.length === 0 && (
          <div className="state-wrapper">
            <div className="spinner"></div>
            <p style={{ color: '#94A3B8' }}>Mengambil data kunjungan terbaru dari basis data...</p>
          </div>
        )}

        {/* Dashboard Content */}
        {!error && (!loading || logs.length > 0) && (
          <>
            {/* TAB 1: OVERVIEW & CHARTS */}
            {activeTab === 'overview' && (
              <div className="overview-content">
                {/* Core Metrics Cards with click-to-show explanations */}
                <div className="metrics-summary-grid">
                  <div className="metric-card green" onClick={() => toggleTooltip('sessions')}>
                    <div className="metric-icon-wrapper">
                      <Users size={20} />
                    </div>
                    <div className="metric-label-group">
                      <div className="metric-label">Total Kunjungan Web</div>
                      <button className="btn-info-icon"><HelpCircle size={14} /></button>
                    </div>
                    <div className="metric-value">{metrics.totalSessions}</div>
                    <div className="metric-info">
                      <Info size={12} /> Jumlah kali website Anda dibuka oleh orang
                    </div>
                    {activeTooltip === 'sessions' && (
                      <div className="tooltip-explanation">
                        <strong>Total Kunjungan Web:</strong> Total frekuensi website Anda dibuka. Jika satu orang yang sama membuka web di pagi hari lalu menutupnya, dan membukanya lagi di sore hari, hal tersebut dihitung sebagai 2 kunjungan.
                      </div>
                    )}
                  </div>

                  <div className="metric-card" onClick={() => toggleTooltip('pageviews')}>
                    <div className="metric-icon-wrapper">
                      <Eye size={20} />
                    </div>
                    <div className="metric-label-group">
                      <div className="metric-label">Bagian Halaman Dilihat</div>
                      <button className="btn-info-icon"><HelpCircle size={14} /></button>
                    </div>
                    <div className="metric-value">{metrics.pageViews}</div>
                    <div className="metric-info">
                      <Info size={12} /> Total area halaman yang sempat di-scroll &amp; dibaca
                    </div>
                    {activeTooltip === 'pageviews' && (
                      <div className="tooltip-explanation">
                        <strong>Bagian Halaman Dilihat:</strong> Mengingat website PURE adalah satu halaman penuh, sistem kami mendeteksi area mana saja yang di-scroll dan dibaca oleh pengunjung (misal: Program, Kontak, dll.). Angka ini menunjukkan total berapa kali area-area tersebut dibaca.
                      </div>
                    )}
                  </div>

                  <div className="metric-card blue" onClick={() => toggleTooltip('duration')}>
                    <div className="metric-icon-wrapper">
                      <Clock size={20} />
                    </div>
                    <div className="metric-label-group">
                      <div className="metric-label">Lama Membaca (Rata-Rata)</div>
                      <button className="btn-info-icon"><HelpCircle size={14} /></button>
                    </div>
                    <div className="metric-value" style={{ fontSize: '1.5rem', marginTop: '12px' }}>{metrics.avgSessionDuration}</div>
                    <div className="metric-info">
                      <Info size={12} /> Rata-rata waktu membaca per satu kali kunjungan
                    </div>
                    {activeTooltip === 'duration' && (
                      <div className="tooltip-explanation">
                        <strong>Lama Membaca (Rata-Rata):</strong> Rata-rata durasi waktu yang dihabiskan pengunjung di website Anda, mulai dari pertama kali membuka halaman hingga menutupnya.
                      </div>
                    )}
                  </div>

                  <div className="metric-card purple" onClick={() => toggleTooltip('bounce')}>
                    <div className="metric-icon-wrapper">
                      <Activity size={20} />
                    </div>
                    <div className="metric-label-group">
                      <div className="metric-label">Pengunjung Langsung Pergi</div>
                      <button className="btn-info-icon"><HelpCircle size={14} /></button>
                    </div>
                    <div className="metric-value">{metrics.bounceRate}%</div>
                    <div className="metric-info">
                      <Info size={12} /> Persentase orang yang langsung keluar &lt; 10 detik
                    </div>
                    {activeTooltip === 'bounce' && (
                      <div className="tooltip-explanation">
                        <strong>Pengunjung Langsung Pergi:</strong> Persentase pengunjung yang membuka website Anda tetapi langsung menutupnya dalam waktu kurang dari 10 detik tanpa men-scroll ke area lain. Usahakan angka ini serendah mungkin (idealnya di bawah 50%) sebagai penanda website yang menarik.
                      </div>
                    )}
                  </div>
                </div>
                {/* Upper row: Trend Chart & Top Pages */}
                <div className="overview-grid">
                  {/* CSS-based Bar Chart */}
                  <div className="panel-card">
                    <div className="panel-header" style={{ flexWrap: 'wrap', gap: '8px' }}>
                      <h3><Calendar size={18} className="text-orange" /> Grafik Jumlah Kunjungan Per Hari</h3>
                      <select 
                        className="select-trend-range"
                        value={trendRange}
                        onChange={(e) => setTrendRange(e.target.value)}
                      >
                        <option value="7d">7 Hari Terakhir</option>
                        <option value="1m">1 Bulan Terakhir</option>
                        <option value="3m">3 Bulan Terakhir</option>
                        <option value="6m">6 Bulan Terakhir</option>
                        <option value="1y">1 Tahun Terakhir</option>
                        <option value="all">Semua Waktu</option>
                      </select>
                    </div>
                    <span className="panel-desc-helper">Menampilkan tingkat keramaian pengunjung website Anda dari hari ke hari.</span>
                    {filteredDailyTrend.length === 0 ? (
                      <div className="chart-empty">Belum ada data trend harian.</div>
                    ) : (
                      <div className="chart-container">
                        {filteredDailyTrend.map((t, idx) => {
                          const maxViews = Math.max(...filteredDailyTrend.map(x => x.pageViews), 1);
                          const heightPct = (t.pageViews / maxViews) * 80;
                          const splitDate = t.date.split('-');
                          const shortLabel = splitDate.length === 3 ? `${splitDate[2]}/${splitDate[1]}` : t.date;
                          
                          const showLabel = 
                            filteredDailyTrend.length <= 10 || 
                            (filteredDailyTrend.length <= 31 && idx % 5 === 0) || 
                            (filteredDailyTrend.length <= 95 && idx % 15 === 0) ||
                            (idx % 30 === 0) ||
                            idx === 0 || 
                            idx === filteredDailyTrend.length - 1;

                          return (
                            <div key={idx} className="chart-bar-wrapper">
                              <div className="chart-tooltip">
                                {t.pageViews} Kunjungan ({t.date})
                              </div>
                              <div 
                                className="chart-bar" 
                                style={{ height: `${Math.max(12, heightPct)}%` }}
                              ></div>
                              <div className="chart-x-label">
                                {showLabel ? shortLabel : '•'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Top Sections/Pages */}
                  <div className="panel-card">
                    <div className="panel-header">
                      <h3><TrendingUp size={18} className="text-green" /> Bagian Halaman Paling Sering Dibaca</h3>
                    </div>
                    <span className="panel-desc-helper">Menunjukkan area website yang paling banyak dilihat dan dibaca pengunjung saat di-scroll.</span>
                    
                    <div className="top-items-list">
                      {metrics.topPaths.map((p, idx) => {
                        const maxCount = metrics.topPaths[0]?.count || 1;
                        const pct = (p.count / maxCount) * 100;
                        return (
                          <div key={idx} className="top-item-row">
                            <div className="top-item-info">
                              <span className="top-item-name">
                                {getFriendlyPathName(p.path)}
                              </span>
                              <span className="top-item-count">{p.count} kali dilihat</span>
                            </div>
                            <div className="progress-bar-bg">
                              <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Middle row: Click Interactions & Locations */}
                <div className="overview-grid">
                  {/* Top Click Interactions */}
                  <div className="panel-card">
                    <div className="panel-header">
                      <h3><MousePointer size={18} className="text-blue" /> Tombol yang Paling Sering Diklik</h3>
                    </div>
                    <span className="panel-desc-helper">Menunjukkan tombol mana yang paling banyak ditekan pengunjung untuk pendaftaran/WhatsApp.</span>
                    <div className="top-items-list">
                      {metrics.topClicks.length === 0 ? (
                        <div style={{ color: '#64748B', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
                          Belum ada tombol yang diklik oleh pengunjung.
                        </div>
                      ) : (
                        metrics.topClicks.map((c, idx) => {
                          const maxCount = metrics.topClicks[0]?.count || 1;
                          const pct = (c.count / maxCount) * 100;
                          return (
                            <div key={idx} className="top-item-row">
                              <div className="top-item-info">
                                <span className="top-item-name" style={{ color: '#38BDF8' }}>
                                  {c.label}
                                </span>
                                <span className="top-item-count">{c.count} kali diklik</span>
                              </div>
                              <div className="progress-bar-bg">
                                <div className="progress-bar-fill blue" style={{ width: `${pct}%` }}></div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Top Locations */}
                  <div className="panel-card">
                    <div className="panel-header">
                      <h3><MapPin size={18} className="text-orange" /> Asal Kota Pengunjung</h3>
                    </div>
                    <span className="panel-desc-helper">Perkiraan asal kota tempat tinggal pengunjung ketika membuka web (terdeteksi lewat internet).</span>
                    
                    <div className="top-items-list">
                      {metrics.topLocations.map((l, idx) => {
                        const maxCount = metrics.topLocations[0]?.count || 1;
                        const pct = (l.count / maxCount) * 100;
                        return (
                          <div key={idx} className="top-item-row">
                            <div className="top-item-info">
                              <span className="top-item-name">{l.location}</span>
                              <span className="top-item-count">{l.count} kunjungan</span>
                            </div>
                            <div className="progress-bar-bg">
                              <div className="progress-bar-fill purple" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Lower row: Referrers & Device breakdowns */}
                <div className="overview-grid" style={{ marginTop: '24px' }}>
                  {/* Top Referrers */}
                  <div className="panel-card">
                    <div className="panel-header">
                      <h3><Compass size={18} className="text-blue" /> Sumber Masuk Pengunjung</h3>
                    </div>
                    <span className="panel-desc-helper">Menampilkan info dari mana pengunjung mengetahui link website Anda (lewat medsos atau langsung).</span>
                    
                    <div className="top-items-list">
                      {metrics.topReferrers.map((r, idx) => {
                        const maxCount = metrics.topReferrers[0]?.count || 1;
                        const pct = (r.count / maxCount) * 100;
                        const isDirect = r.referrer === 'direct' || r.referrer === 'Direct Access';
                        return (
                          <div key={idx} className="top-item-row">
                            <div className="top-item-info">
                              <span className="top-item-name" title={r.referrer}>
                                {isDirect ? (
                                  <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Membuka langsung (mengetik link / bookmark / chat)</span>
                                ) : r.referrer}
                              </span>
                              <span className="top-item-count">{r.count} kunjungan</span>
                            </div>
                            <div className="progress-bar-bg">
                              <div className="progress-bar-fill green" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Device Distributions */}
                  <div className="panel-card">
                    <div className="panel-header">
                      <h3><Laptop size={18} style={{ color: '#8b5cf6' }} /> Jenis HP &amp; Komputer yang Dipakai</h3>
                    </div>
                    <span className="panel-desc-helper">Menunjukkan jenis perangkat (gadget) dan aplikasi browser yang dipakai oleh pengunjung.</span>
                    <div className="dist-grid">
                      <div>
                        <h4 style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Browser</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {Object.entries(metrics.browsers)
                            .sort((a,b) => b[1] - a[1])
                            .slice(0, 3)
                            .map(([name, count]) => {
                              const pct = Math.round((count / metrics.pageViews) * 100);
                              return (
                                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                  <span style={{ color: '#94A3B8' }}>{name}</span>
                                  <span style={{ color: 'white', fontWeight: 'bold' }}>{pct}% kunjungan</span>
                                </div>
                              );
                            })
                          }
                        </div>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Gadget/Sistem</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {Object.entries(metrics.systems)
                            .sort((a,b) => b[1] - a[1])
                            .slice(0, 3)
                            .map(([name, count]) => {
                              const pct = Math.round((count / metrics.pageViews) * 100);
                              return (
                                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                  <span style={{ color: '#94A3B8' }}>{name}</span>
                                  <span style={{ color: 'white', fontWeight: 'bold' }}>{pct}% kunjungan</span>
                                </div>
                              );
                            })
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DETAILED ACTIVITY LOG */}
            {activeTab === 'activity' && (
              <div className="activity-content">
                {/* Filters */}
                <div className="filters-panel">
                  <div className="search-wrapper">
                    <Search className="search-icon-svg" size={18} />
                    <input 
                      type="text" 
                      className="input-dark" 
                      placeholder="Cari pengunjung berdasarkan IP, Kota, Sumber Masuk, Browser..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  
                  <select 
                    className="select-dark" 
                    value={selectedPath}
                    onChange={(e) => {
                      setSelectedPath(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">Semua Bagian &amp; Tombol ({uniquePaths.length - 1})</option>
                    {uniquePaths.filter(p => p !== 'all').map(p => (
                      <option key={p} value={p}>{getFriendlyPathName(p)}</option>
                    ))}
                  </select>
                </div>

                {/* Table */}
                <div className="table-dark-container">
                  {filteredLogs.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                      <Globe size={40} style={{ opacity: 0.5, marginBottom: '12px' }} />
                      <p>Tidak ada log kunjungan yang sesuai dengan kriteria pencarian.</p>
                    </div>
                  ) : (
                    <table className="table-dark">
                      <thead>
                        <tr>
                          <th style={{ width: '18%' }}>Waktu Kunjungan</th>
                          <th style={{ width: '18%' }}>Alamat IP</th>
                          <th style={{ width: '18%' }}>Asal Kota</th>
                          <th style={{ width: '22%' }}>Aktivitas (Bagian Web / Tombol)</th>
                          <th style={{ width: '12%' }}>Lama Membaca</th>
                          <th style={{ width: '14%' }}>Alat yang Dipakai (HP/Laptop)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedLogs.map((log, index) => {
                          const { device, os, browser } = parseUserAgent(log.userAgent);
                          const isHomePage = log.path === '/';
                          const hasDuration = parseInt(log.duration) > 0;
                          const isClick = log.path.startsWith('[Klik]');
                          
                          return (
                            <tr key={index}>
                              <td>
                                <span style={{ color: '#94A3B8' }}>{formatDate(log.timestamp)}</span>
                              </td>
                              <td>
                                <span className="ip-cell-raw">
                                  {log.ip || 'Lokal'}
                                </span>
                              </td>
                              <td>
                                <span className="location-text">
                                  <MapPin size={12} className="text-orange" />
                                  {log.location || 'Localhost'}
                                </span>
                              </td>
                              <td>
                                <span className={`badge-path-dark ${isHomePage ? 'home' : ''} ${isClick ? 'click-event' : ''}`}>
                                  {getFriendlyPathName(log.path)}
                                </span>
                              </td>
                              <td>
                                {isClick ? (
                                  <span style={{ color: '#64748B', fontStyle: 'italic', fontSize: '0.8rem' }}>Mengeklik Tombol</span>
                                ) : (
                                  <span className="duration-text" style={{ color: hasDuration ? '#10B981' : '#64748B' }}>
                                    <Clock size={14} />
                                    {hasDuration ? formatDuration(log.duration) : 'Kurang dari 1 detik'}
                                  </span>
                                )}
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {getDeviceIcon(device)}
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{browser}</span>
                                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{os}</span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination */}
                {filteredLogs.length > 0 && totalPages > 1 && (
                  <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                      Menampilkan {Math.min(filteredLogs.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredLogs.length, currentPage * itemsPerPage)} dari total {filteredLogs.length} kunjungan
                    </span>
                    
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="btn-page-dark" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      >
                        Sebelumnya
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                        .map((page, idx, arr) => {
                          const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                          return (
                            <div key={page} style={{ display: 'flex', gap: '6px' }}>
                              {showEllipsis && <span style={{ alignSelf: 'center', color: '#64748B' }}>...</span>}
                              <button 
                                className={`btn-page-dark ${currentPage === page ? 'active' : ''}`}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </button>
                            </div>
                          );
                        })
                      }

                      <button 
                        className="btn-page-dark" 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: USER JOURNEY TIMELINE */}
            {activeTab === 'journey' && (
              <div className="journey-content">
                {/* Search */}
                <div className="filters-panel" style={{ marginBottom: '24px' }}>
                  <div className="search-wrapper">
                    <Search className="search-icon-svg" size={18} />
                    <input 
                      type="text" 
                      className="input-dark" 
                      placeholder="Cari alur berdasarkan IP, Kota, Sumber Masuk, Browser, atau Tombol yang diklik..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
                    Menampilkan {filteredSessions.length} perjalanan kunjungan web
                  </span>
                </div>

                {/* Table / list container */}
                {filteredSessions.length === 0 ? (
                  <div className="state-wrapper">
                    <Users size={40} style={{ opacity: 0.5, marginBottom: '8px' }} />
                    <p style={{ color: '#94A3B8' }}>Tidak ada alur perjalanan pengunjung yang sesuai dengan pencarian.</p>
                  </div>
                ) : (
                  <div className="journey-list">
                    {filteredSessions.slice(0, 10).map((session, sIdx) => {
                      const { device, os, browser } = parseUserAgent(session.userAgent);
                      const totalTime = session.totalDuration;
                      const pathsCount = session.pages.length;
                      
                      // Sort pages by timestamp
                      const chronologicalPages = [...session.pages].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                      return (
                        <div key={session.sessionId} className="journey-card">
                          <div className="journey-card-header">
                            <div className="session-user-info">
                              <span className="session-label">Kunjungan Ke-{sIdx + 1}</span>
                              <span className="ip-cell-raw">{session.ip}</span>
                              
                              <span className="location-text" style={{ fontSize: '0.82rem' }}>
                                <MapPin size={12} className="text-orange" />
                                {session.location}
                              </span>

                              <div className="session-details-grid">
                                <span className="session-detail-item">{getDeviceIcon(device)} {os} • {browser}</span>
                                <span className="session-detail-item"><Eye size={14} /> {pathsCount} Aktivitas Terdeteksi</span>
                                <span className="session-detail-item" style={{ color: totalTime > 0 ? '#10B981' : '#94A3B8' }}>
                                  <Clock size={14} /> Total Membaca: {formatDuration(totalTime)}
                                </span>
                              </div>
                            </div>
                            
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              Sumber Kedatangan: <span style={{ color: '#E2E8F0', fontStyle: (session.referrer === 'direct' || session.referrer === 'direct access') ? 'italic' : 'normal' }}>
                                {session.referrer === 'direct' || session.referrer === 'direct access' ? 'Membuka langsung (mengetik link / bookmark / chat)' : session.referrer}
                              </span>
                            </div>
                          </div>

                          {/* Session Steps Timeline */}
                          <div className="journey-timeline-content">
                            <div className="timeline-track"></div>
                            
                            {chronologicalPages.map((step, pIdx) => {
                              const isStepHome = step.path === '/';
                              return (
                                <div key={pIdx} className="timeline-step">
                                  {/* Step Bullet (different style for clicks vs page views) */}
                                  <div className={`timeline-bullet ${step.isClick ? 'click-bullet' : ''}`}>
                                    {pIdx + 1}
                                  </div>
                                  
                                  {/* Step details card */}
                                  <div className={`timeline-step-details ${step.isClick ? 'click-step-details' : ''}`}>
                                    <div className="step-path-group">
                                      {step.isClick ? (
                                        <span className="step-path">
                                          {getFriendlyPathName(step.path)}
                                        </span>
                                      ) : (
                                        <span className="step-path">
                                          Membaca bagian <span className={`badge-path-dark ${isStepHome ? 'home' : ''}`} style={{ marginLeft: '8px' }}>
                                            {getFriendlyPathName(step.path)}
                                          </span>
                                        </span>
                                      )}
                                      <span className="step-time">Waktu mulai: {formatDate(step.timestamp)}</span>
                                    </div>

                                    {/* Display stay duration for section reads, and click indicator for buttons */}
                                    {step.isClick ? (
                                      <div className="step-click-indicator">
                                        <MousePointerClick size={12} />
                                        Mengeklik Tombol
                                      </div>
                                    ) : (
                                      <div className="step-stay">
                                        <Clock size={12} className="text-orange" />
                                        Lama membaca: {formatDuration(step.duration)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {filteredSessions.length > 10 && (
                      <p style={{ textAlign: 'center', color: '#64748B', fontSize: '0.85rem', marginTop: '10px' }}>
                        * Hanya menampilkan 10 sesi alur terbaru demi kenyamanan tampilan dasbor.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
