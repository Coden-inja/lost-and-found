import React, { useState } from 'react';
import Grainient from './components/Grainient/Grainient';
import {
  Search,
  PlusCircle,
  MapPin,
  Clock,
  Tag,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Filter,
  X,
  CheckCircle2,
  Sliders,
  Palette,
  Building2,
  FileText,
  UserCheck,
  PhoneCall,
  Check,
  AlertCircle,
  HelpCircle
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
    id: 1,
    title: 'Apple MacBook Air M2 (Space Gray)',
    type: 'lost',
    category: 'Electronics',
    location: 'Central Library (2nd Floor Desk)',
    time: '20 mins ago',
    description: 'Left in quiet study booth 14. Has a green sticker on top cover. Password lock enabled.',
    proofRequired: 'Must confirm sticker design and serial number.',
    reporter: 'Sarah Jenkins (CS Dept)',
    contact: 's.jenkins@campus.edu',
    statusTag: 'URGENT',
    imageGradient: 'linear-gradient(135deg, #10121a, #2a3148)'
  },
  {
    id: 2,
    title: 'Student ID Card - Marcus Vance',
    type: 'found',
    category: 'ID & Cards',
    location: 'Student Union Cafeteria',
    time: '1 hour ago',
    description: 'Found near register #2. Turn in at Security Desk A. Contains campus dining pass.',
    proofRequired: 'Student ID match upon pickup.',
    reporter: 'Campus Security Desk',
    contact: 'security@campus.edu',
    statusTag: 'AT SECURITY DESK',
    imageGradient: 'linear-gradient(135deg, #0d261e, #1a4d3e)'
  },
  {
    id: 3,
    title: 'Silver Key Ring (Dorm 402 + Bike Lock)',
    type: 'lost',
    category: 'Keys & Accessories',
    location: 'Engineering Quad Lawn',
    time: '3 hours ago',
    description: 'Set of 3 keys attached to a blue metal carabiner and small flashlight keychain.',
    proofRequired: 'Describe the third smaller key shape.',
    reporter: 'David Ray (MechEng)',
    contact: 'd.ray@campus.edu',
    statusTag: 'ACTIVE SEARCH',
    imageGradient: 'linear-gradient(135deg, #332600, #664d00)'
  },
  {
    id: 4,
    title: 'TI-84 Plus CE Graphing Calculator',
    type: 'found',
    category: 'Electronics',
    location: 'Science & Tech Complex Rm 302',
    time: '4 hours ago',
    description: 'Found after Math 201 lecture. Name sticker partially torn on back.',
    proofRequired: 'Specify initial letter on torn back sticker.',
    reporter: 'Prof. Miller',
    contact: 'e.miller@campus.edu',
    statusTag: 'SAFE KEEPING',
    imageGradient: 'linear-gradient(135deg, #1a0d2e, #3a1d66)'
  },
  {
    id: 5,
    title: 'AirPods Pro Gen 2 (MagSafe Case)',
    type: 'reunited',
    category: 'Electronics',
    location: 'Athletic Center Locker Room',
    time: 'Reunited Today',
    description: 'Left near locker #88. Verified via iCloud Find My match.',
    proofRequired: 'Successfully verified by owner.',
    reporter: 'Coach Thompson',
    contact: 'reunited@campus.edu',
    statusTag: 'REUNITED',
    imageGradient: 'linear-gradient(135deg, #2e0d27, #661d57)'
  },
  {
    id: 6,
    title: 'North Face Black Winter Jacket (Size M)',
    type: 'found',
    category: 'Apparel',
    location: 'Arts & Humanities Hall',
    time: 'Yesterday',
    description: 'Left on coat rack in Auditorium 1. Has student bus pass in left pocket.',
    proofRequired: 'Name on bus pass.',
    reporter: 'Arts Hall Custodial',
    contact: 'artshall@campus.edu',
    statusTag: 'AT SECURITY DESK',
    imageGradient: 'linear-gradient(135deg, #0f1d24, #1f3b48)'
  }
];

export default function App() {
  // Reference colors from user screenshot
  const [color1, setColor1] = useState('#a3f2ff');
  const [color2, setColor2] = useState('#ffffff');
  const [color3, setColor3] = useState('#f3ef96');

  // Shader motion parameters
  const [timeSpeed, setTimeSpeed] = useState(0.22);
  const [warpStrength, setWarpStrength] = useState(0.9);
  const [grainAmount, setGrainAmount] = useState(0.07);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'lost' | 'found' | 'reunited'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All Locations');

  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [showStudioModal, setShowStudioModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

  // Items list state
  const [items, setItems] = useState(INITIAL_CAMPUS_ITEMS);

  // Form inputs for new item
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('lost');
  const [formCategory, setFormCategory] = useState('Electronics');
  const [formLocation, setFormLocation] = useState('Central Library (2nd Floor Desk)');
  const [formDesc, setFormDesc] = useState('');
  const [formProof, setFormProof] = useState('');
  const [formEmail, setFormEmail] = useState('');

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!formTitle || !formEmail) return;

    const newItem = {
      id: Date.now(),
      title: formTitle,
      type: formType,
      category: formCategory,
      location: formLocation,
      time: 'Just now',
      description: formDesc || 'Reported by campus community member.',
      proofRequired: formProof || 'Verification required upon claim.',
      reporter: formEmail.split('@')[0],
      contact: formEmail,
      statusTag: formType === 'lost' ? 'ACTIVE SEARCH' : 'FOUND & SECURED',
      imageGradient: formType === 'lost'
        ? 'linear-gradient(135deg, #10121a, #2a3148)'
        : 'linear-gradient(135deg, #0d261e, #1a4d3e)'
    };

    setItems([newItem, ...items]);
    setShowReportModal(false);
    // Reset form
    setFormTitle('');
    setFormDesc('');
    setFormProof('');
    setFormEmail('');
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesLocation = locationFilter === 'All Locations' || item.location.includes(locationFilter.split(' ')[0]);
    return matchesSearch && matchesType && matchesCategory && matchesLocation;
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
          <a href="#locations" className="menu-link">Security Desks</a>
          <a href="#how-it-works" className="menu-link">Claim Guidelines</a>
        </nav>

        <div className="nav-actions">
          <button
            className="btn-customizer"
            onClick={() => setShowStudioModal(true)}
            title="Adjust Shader Colors"
          >
            <Palette size={16} />
            <span>Theme Colors</span>
          </button>
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
          <span>Campus Security Verified Portal</span>
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
              { id: 'lost', label: 'Lost Items', count: items.filter(i => i.type === 'lost').length },
              { id: 'found', label: 'Found Items', count: items.filter(i => i.type === 'found').length },
              { id: 'reunited', label: 'Reunited', count: items.filter(i => i.type === 'reunited').length }
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
              onClick={() => { setSelectedItem(item); setClaimSuccess(false); }}
            >
              <div className="card-header-gradient" style={{ background: item.imageGradient }}>
                <div className="badge-row">
                  <span className={`status-pill status-${item.type}`}>
                    {item.type.toUpperCase()}
                  </span>
                  <span className="tag-pill">{item.statusTag}</span>
                </div>
                <span className="category-badge"><Tag size={12} /> {item.category}</span>
              </div>

              <div className="card-main-content">
                <h3 className="card-item-title">{item.title}</h3>
                
                <div className="card-info-row">
                  <MapPin size={14} className="info-icon text-cyan" />
                  <span>{item.location}</span>
                </div>

                <div className="card-info-row">
                  <Clock size={14} className="info-icon text-muted" />
                  <span>{item.time}</span>
                </div>

                <p className="card-description">{item.description}</p>
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
            <button className="btn-reset-filters" onClick={() => { setSearchQuery(''); setTypeFilter('all'); setCategoryFilter('All'); setLocationFilter('All Locations'); }}>
              Reset Filters
            </button>
          </div>
        )}
      </main>

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

      {/* 7. Theme Customizer Modal */}
      {showStudioModal && (
        <div className="modal-overlay-bg" onClick={() => setShowStudioModal(false)}>
          <div className="modal-panel-card" onClick={e => e.stopPropagation()}>
            <div className="modal-title-row">
              <div className="title-with-icon">
                <Palette size={20} className="text-cyan" />
                <h3>Grainient Background Customizer</h3>
              </div>
              <button className="close-btn" onClick={() => setShowStudioModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p className="modal-subtitle">
              Adjust shader colors live. Default settings match reference colors: <code className="code-tag">#a3f2ff</code>, <code className="code-tag">#ffffff</code>, <code className="code-tag">#f3ef96</code>.
            </p>

            <div className="colors-customizer-grid">
              <div className="color-field">
                <label>Color 1 (Cyan / Light Blue)</label>
                <div className="input-swatch-pair">
                  <span className="swatch" style={{ background: color1 }} />
                  <input
                    type="text"
                    value={color1}
                    onChange={e => setColor1(e.target.value)}
                  />
                  <input
                    type="color"
                    value={color1}
                    onChange={e => setColor1(e.target.value)}
                    className="native-color"
                  />
                </div>
              </div>

              <div className="color-field">
                <label>Color 2 (Pure White)</label>
                <div className="input-swatch-pair">
                  <span className="swatch" style={{ background: color2 }} />
                  <input
                    type="text"
                    value={color2}
                    onChange={e => setColor2(e.target.value)}
                  />
                  <input
                    type="color"
                    value={color2}
                    onChange={e => setColor2(e.target.value)}
                    className="native-color"
                  />
                </div>
              </div>

              <div className="color-field">
                <label>Color 3 (Pastel Yellow)</label>
                <div className="input-swatch-pair">
                  <span className="swatch" style={{ background: color3 }} />
                  <input
                    type="text"
                    value={color3}
                    onChange={e => setColor3(e.target.value)}
                  />
                  <input
                    type="color"
                    value={color3}
                    onChange={e => setColor3(e.target.value)}
                    className="native-color"
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions-bar">
              <button
                className="btn-secondary"
                onClick={() => {
                  setColor1('#a3f2ff');
                  setColor2('#ffffff');
                  setColor3('#f3ef96');
                }}
              >
                Reset to Reference Colors
              </button>
              <button
                className="btn-primary"
                onClick={() => setShowStudioModal(false)}
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}

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
                <span>Campus Location</span>
                <select value={formLocation} onChange={e => setFormLocation(e.target.value)}>
                  {CAMPUS_LOCATIONS.slice(1).map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Item Details</span>
                <textarea
                  rows="3"
                  placeholder="Color, brand, stickers, unique scratches, or condition..."
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                />
              </label>

              <label className="form-field">
                <span>Ownership Proof Question (Required for Verification)</span>
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

              <div className="modal-actions-bar">
                <button type="button" className="btn-secondary" onClick={() => setShowReportModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Official Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Item Claim Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay-bg" onClick={() => setSelectedItem(null)}>
          <div className="modal-panel-card" onClick={e => e.stopPropagation()}>
            <div className="modal-title-row">
              <span className={`status-pill status-${selectedItem.type}`}>
                {selectedItem.type.toUpperCase()}
              </span>
              <button className="close-btn" onClick={() => setSelectedItem(null)}>
                <X size={18} />
              </button>
            </div>

            <h2 className="item-detail-title">{selectedItem.title}</h2>
            
            <div className="detail-meta-list">
              <span><MapPin size={14} /> {selectedItem.location}</span>
              <span><Clock size={14} /> {selectedItem.time}</span>
            </div>

            <div className="detail-box">
              <h4>Description:</h4>
              <p>{selectedItem.description}</p>
            </div>

            <div className="detail-box proof-box">
              <h4><ShieldCheck size={16} /> Proof of Ownership Required:</h4>
              <p>{selectedItem.proofRequired}</p>
            </div>

            <div className="reporter-contact-card">
              <span>Reported by: <strong>{selectedItem.reporter}</strong></span>
              <span className="contact-link">{selectedItem.contact}</span>
            </div>

            {claimSuccess ? (
              <div className="claim-success-msg">
                <CheckCircle2 size={24} className="text-green" />
                <div>
                  <h4>Claim Request Submitted!</h4>
                  <p>Check your email ({selectedItem.contact}) for pickup verification details at Campus Security Desk A.</p>
                </div>
              </div>
            ) : (
              <div className="modal-actions-bar">
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
