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
  Palette,
  Building2,
  User,
  Shield,
  AlertCircle
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
    imageGradient: 'linear-gradient(135deg, #10121a, #2a3148)'
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
    imageGradient: 'linear-gradient(135deg, #0d261e, #1a4d3e)'
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
    statusTag: 'REWARD OFFERED',
    imageGradient: 'linear-gradient(135deg, #332600, #664d00)'
  }
];

export default function App() {
  // NOTE: Fake UI role toggle used instead of real auth for hackathon speed.
  const [role, setRole] = useState('student'); // 'student' | 'admin'

  // Reference colors from user screenshot
  const [color1, setColor1] = useState('#a3f2ff');
  const [color2, setColor2] = useState('#ffffff');
  const [color3, setColor3] = useState('#f3ef96');

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

  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [matchCandidates, setMatchCandidates] = useState([]);

  // Items list state
  const [items, setItems] = useState(INITIAL_CAMPUS_ITEMS);

  // Form inputs for new item
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('lost');
  const [formCategory, setFormCategory] = useState('Electronics');
  const [formLocationZone, setFormLocationZone] = useState('Library');
  const [formLat, setFormLat] = useState(22.5192);
  const [formLng, setFormLng] = useState(88.4159);
  const [formDesc, setFormDesc] = useState('');
  const [formProof, setFormProof] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAiTags, setFormAiTags] = useState([]);
  const [isTagging, setIsTagging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        // Map database schema to designer UI card format
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
        setItems(mappedData);
      }
    } catch (err) {
      console.warn('Supabase load fallback to initial seed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Image Upload with Gemini AI Tagging
  const handleImageUpload = async (e) => {
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

  // Submit Report
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle || !formEmail || isSubmitting) return;

    setIsSubmitting(true);

    const newDbRecord = {
      report_type: formType,
      category: formCategory,
      item_name: formTitle,
      description: formDesc || 'Reported by campus community member.',
      location_zone: formLocationZone,
      location_lat: formLat,
      location_lng: formLng,
      item_date: new Date().toISOString().split('T')[0],
      contact_name: formEmail.split('@')[0],
      contact_info: formEmail,
      secret_detail: formProof || 'Verification required.',
      ai_tags: formAiTags,
      status: 'pending'
    };

    try {
      const { data } = await supabase
        .from('item_reports')
        .insert([newDbRecord])
        .select();

      const created = data && data.length > 0 ? data[0] : { ...newDbRecord, id: 'temp-' + Date.now() };

      // Calculate matches
      const matches = calculateMatches(created, items);

      if (matches.length > 0) {
        await supabase
          .from('item_reports')
          .update({ status: 'match_suggested' })
          .eq('id', created.id);
      }

      await fetchReports();
      setShowReportModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving report:', err);
    } finally {
      setIsSubmitting(false);
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

  // Admin Actions
  const handleApproveMatch = async (reportId, matchedId) => {
    try {
      await supabase
        .from('item_reports')
        .update({ status: 'admin_verifying' })
        .in('id', [reportId, matchedId]);
      await fetchReports();
      setSelectedItem(null);
    } catch (err) {
      console.error('Approve match failed:', err);
    }
  };

  const handleResolveMatch = async (reportId, matchedId) => {
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
      await fetchReports();
      setSelectedItem(null);
    } catch (err) {
      console.error('Resolve match failed:', err);
    }
  };

  const handleRejectMatch = async (reportId) => {
    try {
      await supabase
        .from('item_reports')
        .update({ status: 'pending', matched_with: null })
        .eq('id', reportId);
      await fetchReports();
      setSelectedItem(null);
    } catch (err) {
      console.error('Reject match failed:', err);
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
      {/* 1. Fixed Full-Page WebGL Grainient Canvas Background */}
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

      {/* 2. Floating Sticky Pill Navbar */}
      <header className="campus-navbar">
        <div className="nav-brand">
          <div className="brand-logo">
            <Sparkles size={18} color="#0a0b10" />
          </div>
          <div className="brand-title">
            <span className="name">Campus FindHub</span>
            <span className="tag">Official Lost & Found Network</span>
          </div>
        </div>

        <nav className="nav-menu">
          <a href="#explore" className="menu-link active">Explore Items</a>
          <a href="#campus-map" className="menu-link">Campus Map</a>
          <a href="#locations" className="menu-link">Security Desks</a>
          <a href="#how-it-works" className="menu-link">Claim Guidelines</a>
        </nav>

        <div className="nav-actions">
          {/* Fake Role Toggle Switch */}
          <div className="role-toggle-pill">
            <button
              className={`role-toggle-btn ${role === 'student' ? 'active' : ''}`}
              onClick={() => setRole('student')}
            >
              <User size={13} /> Student
            </button>
            <button
              className={`role-toggle-btn ${role === 'admin' ? 'active' : ''}`}
              onClick={() => setRole('admin')}
            >
              <Shield size={13} /> Admin
            </button>
          </div>

          <button
            className="btn-post-report"
            onClick={() => setShowReportModal(true)}
          >
            <PlusCircle size={16} />
            <span>Report Item</span>
          </button>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section className="campus-hero-section">
        <div className="hero-pill-badge">
          <ShieldCheck size={14} className="icon-shield" />
          <span>Mode: {role === 'admin' ? '🛡️ Admin Controls Active' : '🎓 Student Verified Portal'}</span>
        </div>

        <h1 className="hero-main-title">
          Campus Lost & Found System
        </h1>
        <p className="hero-subtitle">
          Reuniting lost belongings across campus libraries, lecture halls, and student centers with instant keyword matching and verified claims.
        </p>

        {/* Live Campus Stats */}
        <div className="hero-stats-row">
          <div className="stat-card">
            <span className="stat-number">94%</span>
            <span className="stat-label">Items Reunited</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-card">
            <span className="stat-number">1,420+</span>
            <span className="stat-label">Verified Claims</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-card">
            <span className="stat-number">&lt; 2 hrs</span>
            <span className="stat-label">Average Return Time</span>
          </div>
        </div>

        {/* Hero Search Hub */}
        <div className="hero-search-hub">
          <div className="search-field">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by keyword, MacBooks, keys, student ID, location..."
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
            <span>File New Report</span>
          </button>
        </div>
      </section>

      {/* 4. Main Lost & Found Feed */}
      <main id="explore" className="campus-feed-section">
        {/* Controls & Category Bar */}
        <div className="feed-controls-header">
          <div className="tabs-type-selector">
            {[
              { id: 'all', label: 'All Items', count: items.length },
              { id: 'lost', label: 'Lost Items', count: items.filter(i => i.type === 'lost' || i.report_type === 'lost').length },
              { id: 'found', label: 'Found Items', count: items.filter(i => i.type === 'found' || i.report_type === 'found').length },
              { id: 'reunited', label: 'Reunited', count: items.filter(i => i.status === 'resolved' || i.type === 'reunited').length }
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
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="campus-item-card"
              onClick={() => {
                setSelectedItem(item);
                setClaimSuccess(false);
                const matches = calculateMatches(item, items);
                setMatchCandidates(matches);
              }}
            >
              <div className="card-header-gradient" style={{ background: item.imageGradient || 'linear-gradient(135deg, #10121a, #2a3148)' }}>
                <div className="badge-row">
                  <span className={`status-pill status-${item.type || item.report_type}`}>
                    {(item.type || item.report_type || 'LOST').toUpperCase()}
                  </span>
                  <span className="tag-pill">{item.statusTag || 'ACTIVE'}</span>
                </div>
                <span className="category-badge"><Tag size={12} /> {item.category}</span>
              </div>

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
                    {item.ai_tags.map((t, idx) => (
                      <span key={idx} className="ai-tag-badge">#{t}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="card-action-footer">
                <span className="reporter-text">Posted by {item.reporter}</span>
                <button className="btn-view-claim">
                  <span>{item.type === 'found' ? 'Claim Item' : 'Details'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="empty-state-box">
            <AlertCircle size={36} className="text-muted" />
            <h3>No items matching your criteria</h3>
            <p>Try clearing your search filters or report a new lost/found item.</p>
            <button className="btn-reset-filters" onClick={() => { setSearchQuery(''); setTypeFilter('all'); setCategoryFilter('All'); setLocationFilter('All Locations'); setSelectedMapZone(''); }}>
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Interactive Leaflet Campus Zone Map */}
      <section id="campus-map" className="campus-map-container-block">
        <div className="map-block-header">
          <h2>🗺️ Heritage Institute of Technology (HIT Kolkata) Zone Map</h2>
          <p>Click any campus zone pin to filter items or explore report distributions.</p>
        </div>
        <CampusMap
          reports={items}
          selectedZone={selectedMapZone}
          onSelectZone={(zoneName) => {
            setSelectedMapZone(prev => prev === zoneName ? '' : zoneName);
          }}
        />
      </section>

      {/* 5. Official Security Desks & Drop-Off Locations */}
      <section id="locations" className="security-desks-section">
        <div className="section-title-block">
          <h2>Official Campus Security Desks</h2>
          <p>Found something? Drop off items at any of these 24/7 verified locations on campus.</p>
        </div>

        <div className="desks-grid">
          <div className="desk-card">
            <div className="desk-icon">
              <Building2 size={24} color="#0a0b10" />
            </div>
            <h3>Main Security Office (Desk A)</h3>
            <p className="desk-location"><MapPin size={14} /> Student Union - Room 102</p>
            <p className="desk-hours"><Clock size={14} /> Open 24/7 &bull; Ext: 4400</p>
            <span className="desk-badge">Primary Collection Hub</span>
          </div>

          <div className="desk-card">
            <div className="desk-icon">
              <Building2 size={24} color="#0a0b10" />
            </div>
            <h3>Central Library Help Desk</h3>
            <p className="desk-location"><MapPin size={14} /> Library Main Entrance (1st Floor)</p>
            <p className="desk-hours"><Clock size={14} /> Mon-Sun: 07:00 AM - 12:00 AM</p>
            <span className="desk-badge">Electronics & IDs</span>
          </div>

          <div className="desk-card">
            <div className="desk-icon">
              <Building2 size={24} color="#0a0b10" />
            </div>
            <h3>Athletic Complex Reception</h3>
            <p className="desk-location"><MapPin size={14} /> Recreation Building Desk</p>
            <p className="desk-hours"><Clock size={14} /> Mon-Fri: 06:00 AM - 10:00 PM</p>
            <span className="desk-badge">Gear & Apparel</span>
          </div>
        </div>
      </section>

      {/* 6. Claim Guidelines / How It Works */}
      <section id="how-it-works" className="guidelines-section">
        <h2 className="section-title-center">Ownership Verification Process</h2>
        
        <div className="guidelines-steps-row">
          <div className="guideline-step">
            <div className="step-circle">1</div>
            <h4>Identify Item</h4>
            <p>Locate the matching item in the live feed or file a missing report.</p>
          </div>
          <div className="step-arrow">&rarr;</div>
          <div className="guideline-step">
            <div className="step-circle">2</div>
            <h4>Provide Proof</h4>
            <p>Submit serial numbers, distinctive markings, or login credentials.</p>
          </div>
          <div className="step-arrow">&rarr;</div>
          <div className="guideline-step">
            <div className="step-circle">3</div>
            <h4>Collect Item</h4>
            <p>Show your Student ID at the designated Campus Security Desk to retrieve.</p>
          </div>
        </div>
      </section>



      {/* 8. Report Lost/Found Modal */}
      {showReportModal && (
        <div className="modal-overlay-bg" onClick={() => setShowReportModal(false)}>
          <div className="modal-panel-card" onClick={e => e.stopPropagation()}>
            <div className="modal-title-row">
              <h3>File Official Campus Item Report</h3>
              <button className="close-btn" onClick={() => setShowReportModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="report-form-layout">
              <div className="form-group-row">
                <label className="form-field">
                  <span>Report Type</span>
                  <select value={formType} onChange={e => setFormType(e.target.value)}>
                    <option value="lost">I Lost An Item</option>
                    <option value="found">I Found An Item</option>
                  </select>
                </label>

                <label className="form-field">
                  <span>Category</span>
                  <select value={formCategory} onChange={e => setFormCategory(e.target.value)}>
                    <option value="Electronics">Electronics</option>
                    <option value="ID & Cards">ID & Cards</option>
                    <option value="Keys & Accessories">Keys & Accessories</option>
                    <option value="Apparel">Apparel</option>
                  </select>
                </label>
              </div>

              <label className="form-field">
                <span>Item Name / Description</span>
                <input
                  type="text"
                  placeholder="e.g. Dell XPS 13 Laptop in Navy Sleeve"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  required
                />
              </label>

              <label className="form-field">
                <span>Campus Location Zone (Select Pin or Dropdown)</span>
                <select value={formLocationZone} onChange={e => setFormLocationZone(e.target.value)}>
                  {CAMPUS_ZONES.map(z => (
                    <option key={z.name} value={z.name}>{z.name}</option>
                  ))}
                </select>
              </label>

              <div style={{ margin: '4px 0' }}>
                <CampusMap
                  mode="select"
                  selectedZone={formLocationZone}
                  onSelectZone={(name, lat, lng) => {
                    setFormLocationZone(name);
                    setFormLat(lat);
                    setFormLng(lng);
                  }}
                />
              </div>

              <label className="form-field">
                <span>Item Details</span>
                <textarea
                  rows="2"
                  placeholder="Color, brand, stickers, unique scratches, or condition..."
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                />
              </label>

              <label className="form-field">
                <span>Ownership Proof Question / Secret Detail</span>
                <input
                  type="text"
                  placeholder="e.g. What serial number / lock pattern / wallpaper is on it?"
                  value={formProof}
                  onChange={e => setFormProof(e.target.value)}
                />
              </label>

              <label className="form-field">
                <span>Your Campus Email</span>
                <input
                  type="email"
                  placeholder="yourname@campus.edu"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  required
                />
              </label>

              {/* Photo Upload with Gemini AI Tagging */}
              <label className="form-field">
                <span>Attach Item Photo (Triggers Gemini AI Auto-Tagging)</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                {isTagging && (
                  <span style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 600 }}>
                    <Sparkles size={13} /> Gemini AI analyzing image...
                  </span>
                )}
                {formAiTags.length > 0 && (
                  <div className="tag-cloud-inline">
                    {formAiTags.map((t, idx) => (
                      <span key={idx} className="ai-tag-badge">#{t}</span>
                    ))}
                  </div>
                )}
              </label>

              <div className="modal-actions-bar">
                <button type="button" className="btn-secondary" onClick={() => setShowReportModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Official Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Item Claim Detail & Match Review Modal */}
      {selectedItem && (
        <div className="modal-overlay-bg" onClick={() => setSelectedItem(null)}>
          <div className="modal-panel-card" onClick={e => e.stopPropagation()}>
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
              <h4><ShieldCheck size={16} /> Proof of Ownership / Secret Detail:</h4>
              <p>{role === 'admin' ? (selectedItem.secret_detail || selectedItem.proofRequired) : '•••• Hidden for verification protection'}</p>
            </div>

            <div className="reporter-contact-card">
              <span>Reported by: <strong>{selectedItem.reporter}</strong></span>
              <span className="contact-link">{selectedItem.contact}</span>
            </div>

            {/* Match candidates section */}
            <div className="matches-review-section">
              <h4>⚡ Calculated Match Candidates</h4>
              {matchCandidates.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>No opposite-type reports scoring ≥ 50% match score.</p>
              ) : (
                matchCandidates.map(({ report, score }) => (
                  <div key={report.id} className="match-candidate-card">
                    <span className="match-percentage-badge">{score}% Match</span>
                    <strong style={{ fontSize: '0.88rem' }}>{report.title || report.item_name}</strong>
                    <p style={{ fontSize: '0.8rem', color: '#4b5563', margin: '4px 0' }}>{report.description}</p>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Location: {report.location || report.location_zone} | Contact: {report.contact || report.contact_info}
                    </div>

                    {role === 'admin' && (
                      <div className="admin-match-actions-row">
                        <button className="btn-approve-match" onClick={() => handleApproveMatch(selectedItem.id, report.id)}>
                          Approve Match
                        </button>
                        <button className="btn-reject-match" onClick={() => handleRejectMatch(selectedItem.id)}>
                          Reject
                        </button>
                        <button className="btn-resolve-match" onClick={() => handleResolveMatch(selectedItem.id, report.id)}>
                          Mark Resolved
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
                  <h4>Claim Request Submitted!</h4>
                  <p>Check your email ({selectedItem.contact}) for pickup verification details at Campus Security Desk A.</p>
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
