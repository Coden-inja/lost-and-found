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
  Eye,
  HeartHandshake,
  UserCheck
} from 'lucide-react';
import './App.css';

const INITIAL_ITEMS = [
  {
    id: 1,
    title: 'Sony WH-1000XM5 Headphones',
    type: 'lost',
    category: 'Electronics',
    location: 'Central Library, 2nd Floor',
    date: '10 mins ago',
    description: 'Black wireless noise-canceling headphones in protective zip case.',
    contact: 'alex.m@university.edu',
    reward: '$50 Reward',
    imageBg: 'linear-gradient(135deg, #a3f2ff22, #5227ff22)'
  },
  {
    id: 2,
    title: 'Leather Bifold Wallet',
    type: 'found',
    category: 'Personal',
    location: 'Student Union Cafeteria',
    date: '45 mins ago',
    description: 'Brown leather wallet with campus transit pass. Handed to security desk.',
    contact: 'security@campus.edu',
    reward: 'No Reward Required',
    imageBg: 'linear-gradient(135deg, #f3ef9622, #ff9ffc22)'
  },
  {
    id: 3,
    title: 'Silver Keychain with 3 Keys',
    type: 'lost',
    category: 'Keys',
    location: 'Science Building Lawn',
    date: '2 hours ago',
    description: 'Includes dorm room key, bike padlock key, and a blue ocean charm.',
    contact: 'sam.k@student.edu',
    reward: '$20 Reward',
    imageBg: 'linear-gradient(135deg, #a3f2ff22, #f3ef9622)'
  },
  {
    id: 4,
    title: 'Golden Retriever (Milo)',
    type: 'reunited',
    category: 'Pets',
    location: 'North Campus Park',
    date: 'Reunited Today',
    description: 'Friendly dog with red collar. Safely re-connected with owner thanks to campus post!',
    contact: 'david.l@gmail.com',
    reward: 'Successfully Reunited!',
    imageBg: 'linear-gradient(135deg, #b497cf22, #a3f2ff22)'
  }
];

export default function App() {
  // Colors strictly matching user screenshot
  const [color1, setColor1] = useState('#a3f2ff');
  const [color2, setColor2] = useState('#ffffff');
  const [color3, setColor3] = useState('#f3ef96');

  // Shader animation parameters
  const [timeSpeed, setTimeSpeed] = useState(0.25);
  const [warpStrength, setWarpStrength] = useState(1.0);
  const [grainAmount, setGrainAmount] = useState(0.08);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showDemoContent, setShowDemoContent] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState(INITIAL_ITEMS);

  // New report form state
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newType, setNewType] = useState('lost');
  const [newCategory, setNewCategory] = useState('Electronics');
  const [newDesc, setNewDesc] = useState('');

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!newTitle || !newLocation) return;
    const newItem = {
      id: Date.now(),
      title: newTitle,
      type: newType,
      category: newCategory,
      location: newLocation,
      date: 'Just now',
      description: newDesc || 'No additional description provided.',
      contact: 'you@campus.edu',
      reward: newType === 'lost' ? '$25 Reward' : 'Found Item',
      imageBg: 'linear-gradient(135deg, #a3f2ff22, #f3ef9622)'
    };
    setItems([newItem, ...items]);
    setShowReportModal(false);
    setNewTitle('');
    setNewLocation('');
    setNewDesc('');
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="landing-wrapper">
      {/* Main Outer Container with Dark Background */}
      <div className="main-card-container">
        
        {/* Floating Header Pill Navbar inside Hero Card */}
        <header className="pill-navbar">
          <div className="nav-left">
            <div className="logo-icon">
              <Sparkles size={18} color="#0a0b10" />
            </div>
            <span className="logo-text">Lost & Found</span>
          </div>

          <nav className="nav-links">
            <a href="#items" className="nav-link active">Browse Items</a>
            <a href="#how-it-works" className="nav-link">How it Works</a>
            <a href="#customize" className="nav-link">Customize Colors</a>
          </nav>

          <div className="nav-right">
            <button className="btn-signup" onClick={() => setShowReportModal(true)}>
              Report Item
            </button>
          </div>
        </header>

        {/* Hero Section Container with Grainient WebGL Shader Background */}
        <section className="hero-card-section">
          <div className="hero-grainient-bg">
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
          </div>

          {/* Hero Content Overlay */}
          <div className="hero-content">
            <div className="version-pill">
              <span className="badge-new">NEW</span>
              <span className="badge-text">Lost & Found System v2.0</span>
            </div>

            <h1 className="hero-heading">
              Reunite with what's yours.<br />
              <span className="hero-heading-sub">Simple, fast, community-driven.</span>
            </h1>

            <p className="hero-subtext">
              Lost something on campus or in your city? Browse reported items, connect with finders, or report a missing belonging in seconds.
            </p>

            {/* Quick Actions Search Bar */}
            <div className="hero-search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search lost keys, wallets, headphones..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button
                className="btn-search-action"
                onClick={() => setShowReportModal(true)}
              >
                <PlusCircle size={16} />
                <span>Post Item</span>
              </button>
            </div>

            <div className="hero-quick-tags">
              <span className="quick-tag-label">Popular searches:</span>
              {['AirPods', 'Water Bottle', 'Keys', 'Student ID', 'Backpack'].map(tag => (
                <button
                  key={tag}
                  className="quick-tag-btn"
                  onClick={() => setSearchQuery(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Right Demo Content Toggle Pill (Matching Image) */}
          <div className="demo-toggle-pill">
            <span>Demo Content</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={showDemoContent}
                onChange={e => setShowDemoContent(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </section>

      </div>

      {/* Color Customizer Bar matching the reference screenshot */}
      <section id="customize" className="customize-bar-section">
        <div className="customize-header">
          <div className="customize-title-group">
            <Palette size={20} className="icon-purple" />
            <h2>Customize Palette</h2>
          </div>
          <span className="customize-subtitle">Matches reference colors: #a3f2ff, #ffffff, #f3ef96</span>
        </div>

        <div className="color-pickers-row">
          <div className="color-card">
            <span className="color-label">Color 1</span>
            <div className="color-picker-box">
              <span className="color-swatch" style={{ background: color1 }} />
              <input
                type="text"
                className="color-hex-input"
                value={color1}
                onChange={e => setColor1(e.target.value)}
              />
              <input
                type="color"
                className="color-native-input"
                value={color1}
                onChange={e => setColor1(e.target.value)}
              />
            </div>
          </div>

          <div className="color-card">
            <span className="color-label">Color 2</span>
            <div className="color-picker-box">
              <span className="color-swatch" style={{ background: color2 }} />
              <input
                type="text"
                className="color-hex-input"
                value={color2}
                onChange={e => setColor2(e.target.value)}
              />
              <input
                type="color"
                className="color-native-input"
                value={color2}
                onChange={e => setColor2(e.target.value)}
              />
            </div>
          </div>

          <div className="color-card">
            <span className="color-label">Color 3</span>
            <div className="color-picker-box">
              <span className="color-swatch" style={{ background: color3 }} />
              <input
                type="text"
                className="color-hex-input"
                value={color3}
                onChange={e => setColor3(e.target.value)}
              />
              <input
                type="color"
                className="color-native-input"
                value={color3}
                onChange={e => setColor3(e.target.value)}
              />
            </div>
          </div>

          <button
            className="btn-reset-colors"
            onClick={() => {
              setColor1('#a3f2ff');
              setColor2('#ffffff');
              setColor3('#f3ef96');
            }}
          >
            Reset to Reference
          </button>
        </div>
      </section>

      {/* Reported Lost & Found Items Section */}
      {showDemoContent && (
        <section id="items" className="items-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Recent Community Reports</h2>
              <p className="section-subtitle">Browse recently reported items or search by keyword.</p>
            </div>

            <div className="filter-pills">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'lost', label: 'Lost' },
                { id: 'found', label: 'Found' },
                { id: 'reunited', label: 'Reunited' }
              ].map(f => (
                <button
                  key={f.id}
                  className={`filter-pill ${activeFilter === f.id ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="items-grid-container">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="item-card-element"
                onClick={() => setSelectedItem(item)}
              >
                <div className="card-banner" style={{ background: item.imageBg }}>
                  <span className={`status-tag status-${item.type}`}>
                    {item.type.toUpperCase()}
                  </span>
                  <span className="reward-tag">{item.reward}</span>
                </div>

                <div className="card-body">
                  <h3 className="item-card-title">{item.title}</h3>
                  <div className="item-location-row">
                    <MapPin size={14} className="icon-blue" />
                    <span>{item.location}</span>
                  </div>
                  <p className="item-card-desc">{item.description}</p>
                </div>

                <div className="card-footer-row">
                  <span className="date-text"><Clock size={12} /> {item.date}</span>
                  <button className="btn-view-details">
                    <span>View</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How it Works Section */}
      <section id="how-it-works" className="steps-section">
        <h2 className="section-title text-center">How Lost & Found Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">1</div>
            <h3>Post Your Report</h3>
            <p>Describe your missing item or what you found with location details.</p>
          </div>

          <div className="step-card">
            <div className="step-num">2</div>
            <h3>Smart Match</h3>
            <p>Our system alerts community members and matches keywords automatically.</p>
          </div>

          <div className="step-card">
            <div className="step-num">3</div>
            <h3>Safe Reunion</h3>
            <p>Verify ownership safely and collect your lost belongings hassle-free.</p>
          </div>
        </div>
      </section>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Report an Item</h3>
              <button className="btn-close-modal" onClick={() => setShowReportModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="modal-form">
              <label className="input-group">
                <span>Item Name / Description</span>
                <input
                  type="text"
                  placeholder="e.g. Blue Hydroflask Water Bottle"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                />
              </label>

              <div className="input-row-2">
                <label className="input-group">
                  <span>Report Type</span>
                  <select value={newType} onChange={e => setNewType(e.target.value)}>
                    <option value="lost">I Lost This</option>
                    <option value="found">I Found This</option>
                  </select>
                </label>

                <label className="input-group">
                  <span>Category</span>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                    <option value="Electronics">Electronics</option>
                    <option value="Personal">Personal Items</option>
                    <option value="Keys">Keys & Accessories</option>
                    <option value="Pets">Pets</option>
                  </select>
                </label>
              </div>

              <label className="input-group">
                <span>Location</span>
                <input
                  type="text"
                  placeholder="e.g. Central Library 2nd Floor"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  required
                />
              </label>

              <label className="input-group">
                <span>Additional Details</span>
                <textarea
                  rows="3"
                  placeholder="Unique features, stickers, brand names..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </label>

              <div className="modal-footer-btns">
                <button type="button" className="btn-cancel" onClick={() => setShowReportModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Publish Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="modal-backdrop" onClick={() => setSelectedItem(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <span className={`status-tag status-${selectedItem.type}`}>
                {selectedItem.type.toUpperCase()}
              </span>
              <button className="btn-close-modal" onClick={() => setSelectedItem(null)}>
                <X size={18} />
              </button>
            </div>

            <h2 className="modal-item-name">{selectedItem.title}</h2>
            
            <div className="modal-meta">
              <span><MapPin size={14} /> {selectedItem.location}</span>
              <span><Clock size={14} /> {selectedItem.date}</span>
            </div>

            <p className="modal-description-body">{selectedItem.description}</p>

            <div className="modal-contact-card">
              <span className="contact-title">Contact Finder/Owner:</span>
              <span className="contact-email">{selectedItem.contact}</span>
            </div>

            <div className="modal-footer-btns">
              <button className="btn-submit" onClick={() => { alert(`Contact request sent to ${selectedItem.contact}!`); setSelectedItem(null); }}>
                Contact Person
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="footer-bar">
        <p>© 2026 Lost & Found System. Powered by Grainient React Bits.</p>
      </footer>
    </div>
  );
}
