import React, { useState, useEffect } from 'react';
import Grainient from './components/Grainient/Grainient';
import CampusMap from './components/CampusMap';
import { supabase } from './lib/supabase';
import { generateTagsFromImage } from './lib/gemini';
import { calculateMatches } from './lib/matching';
import { CAMPUS_ZONES } from './data/zones';
import {
  Search,
  PlusCircle,
  MapPin,
  Clock,
  Tag,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  Building2,
  User,
  Shield,
  AlertCircle,
  UploadCloud,
  Camera,
  Trash2,
  Layers,
  Activity,
  Zap,
  Check,
  Filter
} from 'lucide-react';
import './App.css';

const CAMPUS_LOCATIONS = [
  'All Locations',
  'Central Library (2nd Floor)',
  'Student Union Cafeteria',
  'Science & Tech Complex',
  'Athletic Center Locker Room',
  'Engineering Quad',
  'Arts & Humanities Hall'
];

const INITIAL_CAMPUS_ITEMS = [
  {
    id: 'f1010000-0000-0000-0000-000000000001',
    item_name: 'Apple MacBook Air M2 (Space Gray)',
    title: 'Apple MacBook Air M2 (Space Gray)',
    report_type: 'lost',
    type: 'lost',
    category: 'Electronics',
    location_zone: 'Library',
    location: 'Central Library (2nd Floor Desk)',
    time: '20 mins ago',
    description: 'Left in quiet study booth 14. Has a green sticker on top cover. Password lock enabled.',
    proofRequired: 'Must confirm sticker design and serial number.',
    secret_detail: 'Green mountain sticker on right palm rest',
    reporter: 'Sarah Jenkins (CS Dept)',
    contact_name: 'Sarah Jenkins',
    contact_info: 's.jenkins@campus.edu',
    contact: 's.jenkins@campus.edu',
    status: 'pending',
    statusTag: 'ACTIVE SEARCH',
    imageGradient: 'linear-gradient(135deg, #10121a, #2a3148)',
    ai_tags: ['apple', 'macbook', 'laptop', 'space gray', 'sticker']
  },
  {
    id: 'f1020000-0000-0000-0000-000000000002',
    item_name: 'Student ID Card - Marcus Vance',
    title: 'Student ID Card - Marcus Vance',
    report_type: 'found',
    type: 'found',
    category: 'ID & Cards',
    location_zone: 'Canteen',
    location: 'Student Union Cafeteria',
    time: '1 hour ago',
    description: 'Found near register #2. Turn in at Security Desk A. Contains campus dining pass.',
    proofRequired: 'Student ID match upon pickup.',
    secret_detail: 'Back of card has red lanyard clip mark',
    reporter: 'Campus Security Desk',
    contact_name: 'Campus Security',
    contact_info: 'security@campus.edu',
    contact: 'security@campus.edu',
    status: 'match_suggested',
    statusTag: 'AT SECURITY DESK',
    imageGradient: 'linear-gradient(135deg, #0d261e, #1a4d3e)',
    ai_tags: ['id card', 'student id', 'marcus', 'canteen']
  },
  {
    id: 'f1030000-0000-0000-0000-000000000003',
    item_name: 'Silver Key Ring (Dorm 402 + Bike Lock)',
    title: 'Silver Key Ring (Dorm 402 + Bike Lock)',
    report_type: 'lost',
    type: 'lost',
    category: 'Keys & Accessories',
    location_zone: 'Academic Block',
    location: 'Engineering Quad Lawn',
    time: '3 hours ago',
    description: 'Set of 3 keys attached to a blue metal carabiner and small flashlight keychain.',
    proofRequired: 'Describe the third smaller key shape.',
    secret_detail: 'Flashlight has faint blue scratch',
    reporter: 'David Ray (MechEng)',
    contact_name: 'David Ray',
    contact_info: 'd.ray@campus.edu',
    contact: 'd.ray@campus.edu',
    status: 'pending',
    statusTag: 'ACTIVE SEARCH',
    imageGradient: 'linear-gradient(135deg, #332600, #664d00)',
    ai_tags: ['keys', 'keychain', 'carabiner', 'silver']
  }
];

export default function App() {
  // Role toggle: 'student' (Default Student Portal) vs 'admin' (Admin Command Center)
  const [role, setRole] = useState('student');

  // Background Colors matching reference screenshot
  const [color1] = useState('#a3f2ff');
  const [color2] = useState('#ffffff');
  const [color3] = useState('#f3ef96');

  // Shader motion parameters
  const [timeSpeed] = useState(0.22);
  const [warpStrength] = useState(0.9);
  const [grainAmount] = useState(0.07);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'lost' | 'found' | 'reunited'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [selectedMapZone, setSelectedMapZone] = useState('');

  // Modals & Selected States
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [matchCandidates, setMatchCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Items List State (Updates Real-Time)
  const [items, setItems] = useState(INITIAL_CAMPUS_ITEMS);

  // Student Report Form States
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('lost');
  const [formCategory, setFormCategory] = useState('Electronics');
  const [formLocationZone, setFormLocationZone] = useState('Library');
  const [formLat, setFormLat] = useState(22.5192);
  const [formLng, setFormLng] = useState(88.4159);
  const [formDesc, setFormDesc] = useState('');
  const [formProof, setFormProof] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formImagePreview, setFormImagePreview] = useState(null);
  const [formAiTags, setFormAiTags] = useState([]);
  const [isTagging, setIsTagging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Fetch reports from Supabase
  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('item_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedData = data.map(item => ({
          ...item,
          title: item.item_name || item.title,
          type: item.report_type || item.type,
          location: item.location_zone || item.location,
          time: item.item_date || 'Recently',
          proofRequired: item.secret_detail || 'Proof of ownership required.',
          reporter: item.contact_name || item.contact_info?.split('@')[0] || 'Community Member',
          contact: item.contact_info || item.contact,
          statusTag: item.status ? item.status.replace('_', ' ').toUpperCase() : 'ACTIVE',
          imageGradient: item.report_type === 'lost'
            ? 'linear-gradient(135deg, #10121a, #2a3148)'
            : 'linear-gradient(135deg, #0d261e, #1a4d3e)'
        }));

        // Merge without overwriting unsaved or newly submitted local real-time reports
        setItems(prevItems => {
          const fetchedIds = new Set(mappedData.map(d => d.id));
          const localOnly = prevItems.filter(p => !fetchedIds.has(p.id) && (p.id?.startsWith('rpt-') || p.id?.startsWith('temp-')));
          return [...localOnly, ...mappedData];
        });
      }
    } catch (err) {
      console.warn('Supabase fetch fallback to local state:', err);
    } finally {
      setLoading(false);
    }
  };

  // Setup Real-Time Subscription & Initial Load
  useEffect(() => {
    fetchReports();

    const subscription = supabase
      .channel('realtime_item_reports')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'item_reports' },
        (payload) => {
          console.log('⚡ Realtime Update Received:', payload);
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Role Switcher Handler
  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    // When switching roles, clear filters so all reports (lost & found) are visible in Admin view immediately
    setTypeFilter('all');
    setSearchQuery('');
    setCategoryFilter('All');
    setSelectedMapZone('');
  };

  // Image Upload with live Gemini AI Auto-Tagging
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setFormImagePreview(base64);

      setIsTagging(true);
      const tags = await generateTagsFromImage(base64, file.type);
      setFormAiTags(tags);
      setIsTagging(false);
    };
    reader.readAsDataURL(file);
  };

  // Submit Student Report Form
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle || !formEmail || isSubmitting) return;

    setIsSubmitting(true);

    const newDbRecord = {
      id: 'rpt-' + Date.now(),
      report_type: formType,
      type: formType,
      category: formCategory,
      item_name: formTitle,
      title: formTitle,
      description: formDesc || 'Reported by student.',
      location_zone: formLocationZone,
      location: formLocationZone,
      location_lat: formLat,
      location_lng: formLng,
      item_date: new Date().toISOString().split('T')[0],
      time: 'Just now',
      contact_name: formEmail.split('@')[0],
      contact_info: formEmail,
      contact: formEmail,
      reporter: formEmail.split('@')[0],
      secret_detail: formProof || 'Proof of ownership required upon pickup.',
      proofRequired: formProof || 'Proof of ownership required.',
      ai_tags: formAiTags,
      image_url: formImagePreview,
      status: 'pending',
      statusTag: formType === 'lost' ? 'ACTIVE SEARCH' : 'AT SECURITY DESK',
      imageGradient: formType === 'lost'
        ? 'linear-gradient(135deg, #10121a, #2a3148)'
        : 'linear-gradient(135deg, #0d261e, #1a4d3e)'
    };

    // 1. Instant local real-time update
    setItems(prevItems => [newDbRecord, ...prevItems]);

    // 2. Clear filters so the new report is at top of feed & admin list
    setTypeFilter('all');
    setSearchQuery('');
    setCategoryFilter('All');
    setSelectedMapZone('');

    try {
      const { data } = await supabase
        .from('item_reports')
        .insert([{
          report_type: formType,
          category: formCategory,
          item_name: formTitle,
          description: formDesc || 'Reported by student.',
          location_zone: formLocationZone,
          location_lat: formLat,
          location_lng: formLng,
          item_date: new Date().toISOString().split('T')[0],
          contact_name: formEmail.split('@')[0],
          contact_info: formEmail,
          secret_detail: formProof || 'Verification required.',
          ai_tags: formAiTags,
          status: 'pending'
        }])
        .select();

      if (data && data.length > 0) {
        const created = data[0];
        setItems(prevItems => prevItems.map(item => item.id === newDbRecord.id ? { ...item, id: created.id } : item));
        
        const matches = calculateMatches(created, items);
        if (matches.length > 0) {
          await supabase
            .from('item_reports')
            .update({ status: 'match_suggested' })
            .eq('id', created.id);
        }
      }
    } catch (err) {
      console.warn('Database save warning (saved to local real-time state):', err);
    } finally {
      setIsSubmitting(false);
      setShowReportModal(false);
      resetForm();
      triggerToast(`🎉 Report for "${formTitle}" posted live! Visible in Student Feed & Admin Portal.`);
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDesc('');
    setFormProof('');
    setFormEmail('');
    setFormImagePreview(null);
    setFormAiTags([]);
  };

  // Admin Portal Actions
  const handleApproveMatch = async (reportId, matchedId) => {
    // Realtime local update
    setItems(prev => prev.map(i => {
      if (i.id === reportId || i.id === matchedId) {
        return { ...i, status: 'admin_verifying', statusTag: 'VERIFYING MATCH' };
      }
      return i;
    }));

    try {
      await supabase
        .from('item_reports')
        .update({ status: 'admin_verifying' })
        .in('id', [reportId, matchedId]);
    } catch (err) {
      console.warn('Admin update error:', err);
    }
  };

  const handleResolveMatch = async (reportId, matchedId) => {
    setItems(prev => prev.map(i => {
      if (i.id === reportId || i.id === matchedId) {
        return { ...i, status: 'resolved', type: 'reunited', statusTag: 'REUNITED' };
      }
      return i;
    }));

    try {
      if (matchedId) {
        await supabase
          .from('item_reports')
          .update({ status: 'resolved', matched_with: matchedId })
          .eq('id', reportId);
        await supabase
          .from('item_reports')
          .update({ status: 'resolved', matched_with: reportId })
          .eq('id', matchedId);
      } else {
        await supabase
          .from('item_reports')
          .update({ status: 'resolved' })
          .eq('id', reportId);
      }
    } catch (err) {
      console.warn('Resolve error:', err);
    }
  };

  const handleRejectMatch = async (reportId) => {
    setItems(prev => prev.map(i => {
      if (i.id === reportId) {
        return { ...i, status: 'pending', statusTag: 'ACTIVE SEARCH' };
      }
      return i;
    }));

    try {
      await supabase
        .from('item_reports')
        .update({ status: 'pending', matched_with: null })
        .eq('id', reportId);
    } catch (err) {
      console.warn('Reject error:', err);
    }
  };

  const filteredItems = items.filter(item => {
    const titleText = (item.title || item.item_name || '').toLowerCase();
    const descText = (item.description || '').toLowerCase();
    const locText = (item.location || item.location_zone || '').toLowerCase();
    const tagsText = Array.isArray(item.ai_tags) ? item.ai_tags.join(' ').toLowerCase() : '';

    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || titleText.includes(q) || descText.includes(q) || locText.includes(q) || tagsText.includes(q);
    const matchesType = typeFilter === 'all' || item.type === typeFilter || item.report_type === typeFilter;
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesZone = !selectedMapZone || item.location_zone === selectedMapZone || item.location?.includes(selectedMapZone);

    return matchesSearch && matchesType && matchesCategory && matchesZone;
  });

  return (
    <div className="campus-app-wrapper">
      {/* 1. Full-Screen Fixed WebGL Grainient Canvas Background */}
      <div className="fullscreen-grainient-bg">
        <Grainient
          color1={color1}
          color2={color2}
          color3={color3}
          timeSpeed={timeSpeed}
          warpStrength={warpStrength}
          grainAmount={grainAmount}
          contrast={1.1}
          gamma={1.0}
          saturation={1.0}
          zoom={0.9}
        />
        <div className="vignette-overlay" />
      </div>

      {/* 2. Floating Navbar */}
      <header className="campus-navbar">
        <div className="nav-brand">
          <div className="brand-logo">
            <Sparkles size={18} color="#0a0b10" />
          </div>
          <div className="brand-title">
            <span className="name">Campus FindHub</span>
            <span className="tag">Official Lost & Found System</span>
          </div>
        </div>

        <nav className="nav-menu">
          <a href="#explore" className="menu-link active">
            {role === 'admin' ? 'All Student Reports' : 'Explore Items'}
          </a>
          <a href="#campus-map" className="menu-link">Campus Map</a>
          <a href="#locations" className="menu-link">Security Desks</a>
          <a href="#how-it-works" className="menu-link">Claim Guidelines</a>
        </nav>

        <div className="nav-actions">
          {/* Student vs Admin Role Switcher */}
          <div className="role-toggle-pill">
            <button
              className={`role-toggle-btn ${role === 'student' ? 'active' : ''}`}
              onClick={() => handleRoleSwitch('student')}
            >
              <User size={13} /> Student Portal
            </button>
            <button
              className={`role-toggle-btn ${role === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleSwitch('admin')}
            >
              <Shield size={13} /> Admin Command
            </button>
          </div>

          <button
            className="btn-post-report"
            onClick={() => setShowReportModal(true)}
          >
            <PlusCircle size={16} />
            <span>File Report</span>
          </button>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-notification-banner">
          <Sparkles size={16} className="text-cyan" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3. Hero Section */}
      <section className="campus-hero-section">
        <div className="hero-pill-badge">
          <ShieldCheck size={14} className="icon-shield" />
          <span>
            {role === 'admin'
              ? '🛡️ Admin Command Mode: Accessing Real-Time Student Reports & Match Probabilities'
              : '🎓 Student Portal: Live Real-Time Lost & Found Reporting'}
          </span>
        </div>

        <h1 className="hero-main-title">
          {role === 'admin' ? 'Admin Real-Time Control Center' : 'Campus Lost & Found System'}
        </h1>
        <p className="hero-subtitle">
          {role === 'admin'
            ? 'Review incoming student reports in real time, analyze AI match probability scores, verify secret ownership proof, and authorize safe item returns.'
            : 'Report lost or found belongings instantly with photo upload & AI auto-tagging. Your report updates live across the campus network.'}
        </p>

        {/* Live Campus Stats */}
        <div className="hero-stats-row">
          <div className="stat-card">
            <span className="stat-number">{items.length}</span>
            <span className="stat-label">Total Reports</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-card">
            <span className="stat-number">{items.filter(i => i.type === 'lost' || i.report_type === 'lost').length}</span>
            <span className="stat-label">Active Lost</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-card">
            <span className="stat-number">{items.filter(i => i.type === 'found' || i.report_type === 'found').length}</span>
            <span className="stat-label">Active Found</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-card">
            <span className="stat-number">94%</span>
            <span className="stat-label">Match Accuracy</span>
          </div>
        </div>

        {/* Search Hub */}
        <div className="hero-search-hub">
          <div className="search-field">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by student report, item title, keywords, or campus zone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>
          <button
            className="search-report-btn"
            onClick={() => setShowReportModal(true)}
          >
            <PlusCircle size={16} />
            <span>{role === 'admin' ? 'New Report' : 'Student Report Form'}</span>
          </button>
        </div>
      </section>

      {/* 4. Main Feed & Reports List */}
      <main id="explore" className="campus-feed-section">
        {role === 'admin' && (
          <div className="admin-banner-bar">
            <div className="admin-banner-left">
              <Shield size={18} className="text-cyan" />
              <div>
                <strong>Admin Mode Active: Real-Time Report Stream</strong>
                <p>Selecting any report below calculates live AI match probabilities against opposite reports.</p>
              </div>
            </div>
            <span className="realtime-live-badge"><Activity size={12} /> Real-Time Sync Active</span>
          </div>
        )}

        {/* Filters Header */}
        <div className="feed-controls-header">
          <div className="tabs-type-selector">
            {[
              { id: 'all', label: 'All Reports', count: items.length },
              { id: 'lost', label: 'Lost Items', count: items.filter(i => (i.type || i.report_type) === 'lost').length },
              { id: 'found', label: 'Found Items', count: items.filter(i => (i.type || i.report_type) === 'found').length },
              { id: 'reunited', label: 'Resolved / Reunited', count: items.filter(i => (i.type || i.report_type) === 'reunited' || i.status === 'resolved').length }
            ].map(t => (
              <button
                key={t.id}
                className={`type-tab ${typeFilter === t.id ? 'active' : ''}`}
                onClick={() => setTypeFilter(t.id)}
              >
                <span>{t.label}</span>
                <span className="tab-count">{t.count}</span>
              </button>
            ))}
          </div>

          <div className="dropdown-filters">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="ID & Cards">ID & Cards</option>
              <option value="Keys & Accessories">Keys & Accessories</option>
              <option value="Apparel">Apparel</option>
            </select>

            <select
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="filter-select"
            >
              {CAMPUS_LOCATIONS.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Item Cards Grid */}
        <div className="campus-items-grid">
          {filteredItems.map(item => {
            const matches = calculateMatches(item, items);
            const topMatchScore = matches.length > 0 ? matches[0].score : 0;

            return (
              <div
                key={item.id}
                className={`campus-item-card ${role === 'admin' ? 'admin-card-style' : ''}`}
                onClick={() => {
                  setSelectedItem(item);
                  setClaimSuccess(false);
                  setMatchCandidates(matches);
                }}
              >
                {item.image_url ? (
                  <div className="card-image-preview-header">
                    <img src={item.image_url} alt={item.title} />
                    <span className={`status-pill status-${item.type || item.report_type}`}>
                      {(item.type || item.report_type || 'LOST').toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <div className="card-header-gradient" style={{ background: item.imageGradient || 'linear-gradient(135deg, #10121a, #2a3148)' }}>
                    <div className="badge-row">
                      <span className={`status-pill status-${item.type || item.report_type}`}>
                        {(item.type || item.report_type || 'LOST').toUpperCase()}
                      </span>
                      <span className="tag-pill">{item.statusTag || 'ACTIVE'}</span>
                    </div>
                    <span className="category-badge"><Tag size={12} /> {item.category}</span>
                  </div>
                )}

                <div className="card-main-content">
                  <h3 className="card-item-title">{item.title || item.item_name}</h3>
                  
                  <div className="card-info-row">
                    <MapPin size={14} className="info-icon text-cyan" />
                    <span>{item.location || item.location_zone}</span>
                  </div>

                  <div className="card-info-row">
                    <Clock size={14} className="info-icon text-muted" />
                    <span>{item.time || item.item_date}</span>
                  </div>

                  <p className="card-description">{item.description}</p>

                  {item.ai_tags && item.ai_tags.length > 0 && (
                    <div className="tag-cloud-inline">
                      {item.ai_tags.slice(0, 4).map((t, idx) => (
                        <span key={idx} className="ai-tag-badge">#{t}</span>
                      ))}
                    </div>
                  )}

                  {/* Admin Match Probability Indicator */}
                  {role === 'admin' && (
                    <div className="admin-match-probability-bar">
                      <Zap size={13} className="icon-zap" />
                      <span>Match Probability: <strong>{topMatchScore}%</strong></span>
                    </div>
                  )}
                </div>

                <div className="card-action-footer">
                  <span className="reporter-text">By {item.reporter}</span>
                  <button className="btn-view-claim">
                    <span>{role === 'admin' ? 'Review Matches' : (item.type === 'found' ? 'Claim Item' : 'Details')}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="empty-state-box">
            <AlertCircle size={36} className="text-muted" />
            <h3>No student reports found matching search criteria</h3>
            <p>Try clearing filters or submit a new report using the Student Reporting Form.</p>
            <button className="btn-reset-filters" onClick={() => { setSearchQuery(''); setTypeFilter('all'); setCategoryFilter('All'); setLocationFilter('All Locations'); setSelectedMapZone(''); }}>
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Campus Map Section */}
      <section id="campus-map" className="campus-map-container-block">
        <div className="map-block-header">
          <h2>🗺️ Campus Location Zones (HIT Kolkata)</h2>
          <p>Click any zone pin to filter student reports or pinpoint incident locations.</p>
        </div>
        <CampusMap
          reports={items}
          selectedZone={selectedMapZone}
          onSelectZone={(zoneName) => {
            setSelectedMapZone(prev => prev === zoneName ? '' : zoneName);
          }}
        />
      </section>

      {/* Security Desks */}
      <section id="locations" className="security-desks-section">
        <div className="section-title-block">
          <h2>Official Campus Security Desks</h2>
          <p>Verified 24/7 drop-off locations across campus for lost & found items.</p>
        </div>

        <div className="desks-grid">
          <div className="desk-card">
            <div className="desk-icon"><Building2 size={24} color="#0a0b10" /></div>
            <h3>Main Security Office (Desk A)</h3>
            <p className="desk-location"><MapPin size={14} /> Student Union - Room 102</p>
            <p className="desk-hours"><Clock size={14} /> Open 24/7 &bull; Ext: 4400</p>
            <span className="desk-badge">Primary Collection Hub</span>
          </div>

          <div className="desk-card">
            <div className="desk-icon"><Building2 size={24} color="#0a0b10" /></div>
            <h3>Central Library Help Desk</h3>
            <p className="desk-location"><MapPin size={14} /> Library Main Entrance (1st Floor)</p>
            <p className="desk-hours"><Clock size={14} /> Mon-Sun: 07:00 AM - 12:00 AM</p>
            <span className="desk-badge">Electronics & IDs</span>
          </div>

          <div className="desk-card">
            <div className="desk-icon"><Building2 size={24} color="#0a0b10" /></div>
            <h3>Athletic Complex Reception</h3>
            <p className="desk-location"><MapPin size={14} /> Recreation Building Desk</p>
            <p className="desk-hours"><Clock size={14} /> Mon-Fri: 06:00 AM - 10:00 PM</p>
            <span className="desk-badge">Gear & Apparel</span>
          </div>
        </div>
      </section>

      {/* Claim Guidelines */}
      <section id="how-it-works" className="guidelines-section">
        <h2 className="section-title-center">Verification & Claim Guidelines</h2>
        <div className="guidelines-steps-row">
          <div className="guideline-step">
            <div className="step-circle">1</div>
            <h4>Submit Student Report</h4>
            <p>File a report with photo upload & ownership proof question.</p>
          </div>
          <div className="step-arrow">&rarr;</div>
          <div className="guideline-step">
            <div className="step-circle">2</div>
            <h4>Real-Time AI Match</h4>
            <p>Our algorithm scores probability matches across all campus submissions.</p>
          </div>
          <div className="step-arrow">&rarr;</div>
          <div className="guideline-step">
            <div className="step-circle">3</div>
            <h4>Verified Pickup</h4>
            <p>Admin verifies secret detail & authorizes item collection at Security Desk.</p>
          </div>
        </div>
      </section>

      {/* Student Portal Report Form Modal */}
      {showReportModal && (
        <div className="modal-overlay-bg" onClick={() => setShowReportModal(false)}>
          <div className="modal-panel-card modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-title-row">
              <div>
                <h3>Student Portal &bull; File Lost / Found Item Report</h3>
                <p className="modal-subtitle-text">Real-time submission with photo upload & AI auto-tagging</p>
              </div>
              <button className="close-btn" onClick={() => setShowReportModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="report-form-layout">
              {/* Type Pill Toggle */}
              <div className="form-type-selector">
                <button
                  type="button"
                  className={`type-select-btn ${formType === 'lost' ? 'active-lost' : ''}`}
                  onClick={() => setFormType('lost')}
                >
                  I Lost An Item
                </button>
                <button
                  type="button"
                  className={`type-select-btn ${formType === 'found' ? 'active-found' : ''}`}
                  onClick={() => setFormType('found')}
                >
                  I Found An Item
                </button>
              </div>

              <div className="form-group-row">
                <label className="form-field">
                  <span>Item Title / Name *</span>
                  <input
                    type="text"
                    placeholder="e.g. Dell XPS 13 Laptop in Navy Sleeve"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Category *</span>
                  <select value={formCategory} onChange={e => setFormCategory(e.target.value)}>
                    <option value="Electronics">Electronics</option>
                    <option value="ID & Cards">ID & Cards</option>
                    <option value="Keys & Accessories">Keys & Accessories</option>
                    <option value="Apparel">Apparel</option>
                  </select>
                </label>
              </div>

              <label className="form-field">
                <span>Campus Location Zone *</span>
                <select value={formLocationZone} onChange={e => setFormLocationZone(e.target.value)}>
                  {CAMPUS_ZONES.map(z => (
                    <option key={z.name} value={z.name}>{z.name}</option>
                  ))}
                </select>
              </label>

              {/* Photo Upload Dropzone Placeholder */}
              <div className="image-upload-dropzone">
                <span className="dropzone-label"><Camera size={16} /> Item Photo Upload Placeholder</span>
                
                {formImagePreview ? (
                  <div className="image-preview-container">
                    <img src={formImagePreview} alt="Uploaded Item Preview" className="uploaded-preview-img" />
                    <button
                      type="button"
                      className="btn-remove-image"
                      onClick={() => { setFormImagePreview(null); setFormAiTags([]); }}
                    >
                      <Trash2 size={14} /> Remove Photo
                    </button>
                  </div>
                ) : (
                  <label className="upload-placeholder-box">
                    <UploadCloud size={32} className="upload-icon text-cyan" />
                    <span className="upload-text">Click or Drag & Drop photo here</span>
                    <span className="upload-hint">Supports PNG, JPG, WebP (Auto-triggers Gemini AI keyword extraction)</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input-hidden" />
                  </label>
                )}

                {isTagging && (
                  <div className="ai-tagging-status">
                    <Sparkles size={14} className="animate-spin" />
                    <span>Gemini AI analyzing photo for keywords...</span>
                  </div>
                )}

                {formAiTags.length > 0 && (
                  <div className="ai-extracted-tags">
                    <span className="tags-header-label">✨ AI Extracted Keywords:</span>
                    <div className="tag-cloud-inline">
                      {formAiTags.map((t, idx) => (
                        <span key={idx} className="ai-tag-badge">#{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <label className="form-field">
                <span>Item Description</span>
                <textarea
                  rows="2"
                  placeholder="Provide color, brand, stickers, unique scratches, or condition..."
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                />
              </label>

              <label className="form-field">
                <span>Proof of Ownership Secret Detail *</span>
                <input
                  type="text"
                  placeholder="e.g. Unique wallpaper description, lock code, serial number, or sticker inside case"
                  value={formProof}
                  onChange={e => setFormProof(e.target.value)}
                />
              </label>

              <label className="form-field">
                <span>Student / Contact Email *</span>
                <input
                  type="email"
                  placeholder="student@campus.edu"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  required
                />
              </label>

              <div className="modal-actions-bar">
                <button type="button" className="btn-secondary" onClick={() => setShowReportModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Publishing Report...' : 'Submit Real-Time Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Detail & Admin Real-Time Match Inspection Panel */}
      {selectedItem && (
        <div className="modal-overlay-bg" onClick={() => setSelectedItem(null)}>
          <div className="modal-panel-card modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-title-row">
              <span className={`status-pill status-${selectedItem.type || selectedItem.report_type}`}>
                {(selectedItem.type || selectedItem.report_type || 'ITEM').toUpperCase()}
              </span>
              <button className="close-btn" onClick={() => setSelectedItem(null)}>
                <X size={18} />
              </button>
            </div>

            <h2 className="item-detail-title">{selectedItem.title || selectedItem.item_name}</h2>
            
            <div className="detail-meta-list">
              <span><MapPin size={14} /> {selectedItem.location || selectedItem.location_zone}</span>
              <span><Clock size={14} /> {selectedItem.time || selectedItem.item_date}</span>
            </div>

            <div className="detail-box">
              <h4>Description:</h4>
              <p>{selectedItem.description}</p>
            </div>

            <div className="detail-box proof-box">
              <h4><ShieldCheck size={16} /> Secret Verification Detail:</h4>
              <p>{role === 'admin' ? (selectedItem.secret_detail || selectedItem.proofRequired) : '•••• Hidden for student verification protection'}</p>
            </div>

            <div className="reporter-contact-card">
              <span>Reported by: <strong>{selectedItem.reporter}</strong></span>
              <span className="contact-link">{selectedItem.contact}</span>
            </div>

            {/* Admin Real-Time Match Probability Review Section */}
            <div className="matches-review-section">
              <h4><Zap size={16} className="text-cyan" /> AI Match Probability Engine ({matchCandidates.length} Candidates)</h4>
              {matchCandidates.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>No opposite-type student reports meeting initial 50% probability threshold.</p>
              ) : (
                matchCandidates.map(({ report, score }) => (
                  <div key={report.id} className="match-candidate-card">
                    <div className="candidate-header-row">
                      <span className="match-percentage-badge">{score}% Match Probability</span>
                      <span className="candidate-category"><Tag size={12} /> {report.category}</span>
                    </div>

                    <strong className="candidate-title">{report.title || report.item_name}</strong>
                    <p className="candidate-desc">{report.description}</p>
                    <div className="candidate-meta">
                      <span>Location: {report.location || report.location_zone}</span> &bull; 
                      <span>Contact: {report.contact || report.contact_info}</span>
                    </div>

                    {role === 'admin' && (
                      <div className="admin-match-actions-row">
                        <button className="btn-approve-match" onClick={() => handleApproveMatch(selectedItem.id, report.id)}>
                          <Check size={14} /> Confirm Match & Notify
                        </button>
                        <button className="btn-reject-match" onClick={() => handleRejectMatch(selectedItem.id)}>
                          <X size={14} /> Reject Match
                        </button>
                        <button className="btn-resolve-match" onClick={() => handleResolveMatch(selectedItem.id, report.id)}>
                          <CheckCircle2 size={14} /> Mark Reunited
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {claimSuccess ? (
              <div className="claim-success-msg" style={{ marginTop: 14 }}>
                <CheckCircle2 size={24} className="text-green" />
                <div>
                  <h4>Claim Verification Request Submitted!</h4>
                  <p>Notification sent to {selectedItem.contact}. Visit Security Desk A for item retrieval.</p>
                </div>
              </div>
            ) : (
              <div className="modal-actions-bar" style={{ marginTop: 14 }}>
                <button className="btn-secondary" onClick={() => setSelectedItem(null)}>
                  Close
                </button>
                <button className="btn-primary" onClick={() => setClaimSuccess(true)}>
                  Submit Claim Verification
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 10. Footer */}
      <footer className="campus-footer">
        <div className="footer-content">
          <p>© 2026 Campus FindHub Lost & Found System &bull; Powered by Grainient WebGL</p>
        </div>
      </footer>
    </div>
  );
}
