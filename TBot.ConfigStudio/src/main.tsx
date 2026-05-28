import React, { useState, useEffect, useCallback } from 'react'
import { 
  Moon, Sun, Monitor, Save, FolderOpen, ChevronRight, ChevronDown,
  Search, HelpCircle, BookOpen, Bot, Settings, RotateCcw, PanelRightClose, PanelRightOpen,
  Circle, CheckCircle, AlertCircle, Info, Trash2, Plus, Copy, LucideIcon
} from 'lucide-react'
import './styles.css'

// Types
type JsonValue = string | number | boolean | null | JsonObject | JsonArray
type JsonObject = { [key: string]: JsonValue }
type JsonArray = JsonValue[]

interface Coordinate {
  Galaxy: number
  System: number
  Position: number
  Type: 'Planet' | 'Moon' | number
}

type Tab = 'editor' | 'hilfe' | 'wiki' | 'botdaten'
type Theme = 'system' | 'light' | 'dark'

// Sample config for demo
const sampleConfig: JsonObject = {
  "General": {
    "Universe": "Xolotlan",
    "Language": "de",
    "Timezone": "Europe/Berlin",
    "Host": "localhost",
    "Port": 8080,
    "UserAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "V": "Virtual"
  },
  "Credentials": {
    "Username": "player@example.com",
    "Password": "secret",
    "BasicAuth": {
      "Username": "admin",
      "Password": "webpass"
    }
  },
  "Defender": {
    "Active": true,
    "Home": { "Galaxy": 3, "System": 336, "Position": 7, "Type": "Planet" },
    "CheckIntervalMin": 1,
    "CheckIntervalMax": 2
  },
  "SleepMode": {
    "Active": true,
    "Begin": 0,
    "End": 6
  },
  "AutoMine": {
    "Active": true,
    "Origin": { "Galaxy": 3, "System": 336, "Position": 7, "Type": "Planet" }
  },
  "Expeditions": {
    "Active": true,
    "Origins": [],
    "MinPrimaryToSend": 20000,
    "MaxExpeditions": 3
  },
  "Proxy": {
    "Enabled": false,
    "Host": "",
    "Port": 0,
    "Type": "HTTP"
  }
}

// Field descriptions
const fieldDescriptions: Record<string, string> = {
  'General.Universe': 'OGame Universumsname (groß geschrieben)',
  'General.Language': 'Sprachcode des Universums (de, en, fr...)',
  'General.Host': 'Hostname wo TBot läuft',
  'General.Port': 'Port der TBot WebUI',
  'Credentials.Username': 'OGame Login Email',
  'Credentials.Password': 'OGame Passwort',
  'BasicAuth.Username': 'BasicAuth für WebUI',
  'SleepMode.Active': 'TBot pausiert im eingestellten Zeitfenster',
  'SleepMode.Begin': 'Stunde wann SleepMode beginnt (0-23)',
  'SleepMode.End': 'Stunde wann SleepMode endet (0-23)',
  'AutoMine.Active': 'Automatischer Minenbau',
  'Expeditions.Active': 'Automatische Expeditionen'
}

// Navigation structure
interface NavItem {
  key: string
  label: string
  subItems?: { key: string; label: string }[]
}

const navStructure: NavItem[] = [
  { key: 'General', label: 'General' },
  { key: 'Credentials', label: 'Credentials', 
    subItems: [
      { key: 'Credentials.BasicAuth', label: 'BasicAuth' }
    ]
  },
  { key: 'Defender', label: 'Defender' },
  { key: 'AutoFleet', label: 'AutoFleet' },
  { key: 'SleepMode', label: 'SleepMode' },
  { key: 'AutoCargo', label: 'AutoCargo' },
  { key: 'AutoRepatriate', label: 'AutoRepatriate' },
  { key: 'AutoMine', label: 'AutoMine' },
  { key: 'AutoResearch', label: 'AutoResearch' },
  { key: 'Expeditions', label: 'Expeditions' },
  { key: 'AutoFarm', label: 'AutoFarm' },
  { key: 'AutoHarvest', label: 'AutoHarvest' },
  { key: 'Proxy', label: 'Proxy' }
]

// Main App
export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('editor')
  const [theme, setTheme] = useState<Theme>('system')
  const [config, setConfig] = useState<JsonObject>(sampleConfig)
  const [originalConfig, setOriginalConfig] = useState<JsonObject>(sampleConfig)
  const [showPreview, setShowPreview] = useState(true)
  const [previewWidth, setPreviewWidth] = useState(380)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState<string>('General')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)

  // Bot data state
  const [botHost, setBotHost] = useState('')
  const [botPort, setBotPort] = useState('')
  const [botUsername, setBotUsername] = useState('')
  const [botPassword, setBotPassword] = useState('')
  const [botLoading, setBotLoading] = useState(false)
  const [botError, setBotError] = useState('')
  const [botData, setBotData] = useState<any>({
    planets: [], moons: [], fleets: [], research: null
  })

  // Theme
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else if (theme === 'light') root.classList.remove('dark')
    else root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches)
  }, [theme])

  // Load config
  const loadConfig = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          try {
            const json = JSON.parse(ev.target?.result as string)
            setConfig(json)
            setOriginalConfig(json)
            if (json.General?.Host) setBotHost(json.General.Host)
            if (json.General?.Port) setBotPort(String(json.General.Port))
          } catch { alert('Invalid JSON') }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }, [])

  const saveConfig = useCallback(() => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'instance_settings.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [config])

  const resetConfig = useCallback(() => setConfig(JSON.parse(JSON.stringify(originalConfig))), [originalConfig])

  const isModified = JSON.stringify(config) !== JSON.stringify(originalConfig)

  const updateConfigValue = useCallback((path: string, value: JsonValue) => {
    setConfig(prev => {
      const newConfig = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj: JsonObject = newConfig
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]] as JsonObject
      obj[keys[keys.length - 1]] = value
      return newConfig
    })
  }, [])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      next.has(section) ? next.delete(section) : next.add(section)
      return next
    })
  }

  const navigateTo = (section: string) => {
    setActiveSection(section)
    setExpandedSections(prev => { const next = new Set(prev); next.add(section); return next })
    const el = document.getElementById(`section-${section}`)
    if (el) window.scrollTo({ top: el.offsetTop - 140, behavior: 'smooth' })
  }

  const ThemeIcon: LucideIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  // Fetch bot data
  const fetchBotData = useCallback(async () => {
    if (!botHost || !botPort) { setBotError('Host und Port erforderlich'); return }
    setBotLoading(true)
    setBotError('')
    const baseUrl = `http://${botHost}:${botPort}`
    const headers: HeadersInit = {}
    if (botUsername && botPassword) {
      headers['Authorization'] = `Basic ${btoa(`${botUsername}:${botPassword}`)}`
    }
    try {
      const [p, m, f, r, u] = await Promise.all([
        fetch(`${baseUrl}/bot/planets`, { headers }).then(r => r?.ok ? r.json() : null).catch(() => null),
        fetch(`${baseUrl}/bot/moons`, { headers }).then(r => r?.ok ? r.json() : null).catch(() => null),
        fetch(`${baseUrl}/bot/fleets`, { headers }).then(r => r?.ok ? r.json() : null).catch(() => null),
        fetch(`${baseUrl}/bot/get-research`, { headers }).then(r => r?.ok ? r.json() : null).catch(() => null),
        fetch(`${baseUrl}/bot/user-infos`, { headers }).then(r => r?.ok ? r.json() : null).catch(() => null)
      ])
      setBotData({ 
        planets: p?.Result || [], 
        moons: m?.Result || [], 
        fleets: f?.Result || [], 
        research: r?.Result || null,
        userInfo: u?.Result || null
      })
    } catch { setBotError('Verbindung fehlgeschlagen') }
    finally { setBotLoading(false) }
  }, [botHost, botPort, botUsername, botPassword])

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <Bot size={24} />
          <h1>TBot Config Studio</h1>
        </div>
        <nav className="header-tabs">
          {(['editor', 'hilfe', 'wiki', 'botdaten'] as Tab[]).map(tab => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'editor' && <Settings size={16} />}
              {tab === 'hilfe' && <HelpCircle size={16} />}
              {tab === 'wiki' && <BookOpen size={16} />}
              {tab === 'botdaten' && <Bot size={16} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
        <div className="header-right">
          {activeTab === 'editor' && (
            <>
              <button className="icon-btn" onClick={loadConfig} title="Öffnen"><FolderOpen size={18} /></button>
              <button className="icon-btn" onClick={saveConfig} title="Speichern"><Save size={18} /></button>
              <button className="icon-btn" onClick={resetConfig} title="Zurücksetzen"><RotateCcw size={18} /></button>
              <button className={`icon-btn ${showPreview ? 'active' : ''}`} onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
              </button>
            </>
          )}
          <button className="icon-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : t === 'light' ? 'system' : 'dark')}>
            <ThemeIcon size={18} />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className={`app-main ${showPreview ? '' : 'full-width'}`}>
        {activeTab === 'editor' && (
          <EditorTab 
            config={config} updateConfigValue={updateConfigValue}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            searchOpen={searchOpen} setSearchOpen={setSearchOpen}
            navStructure={navStructure} activeSection={activeSection}
            setActiveSection={setActiveSection} hoveredNav={hoveredNav} setHoveredNav={setHoveredNav}
            expandedSections={expandedSections} toggleSection={toggleSection}
            navigateTo={navigateTo} fieldDescriptions={fieldDescriptions}
            showPreview={showPreview} previewWidth={previewWidth} setPreviewWidth={setPreviewWidth}
            botData={botData}
          />
        )}
        {activeTab === 'hilfe' && <div className="hilfe-content"><h2>Hilfe</h2><p>TBot Config Studio - HilfeComing soon...</p></div>}
        {activeTab === 'wiki' && <div className="wiki-content"><h2>Wiki</h2><p>TBot Wiki - Coming soon...</p></div>}
        {activeTab === 'botdaten' && (
          <BotDatenTab 
            botHost={botHost} setBotHost={setBotHost} botPort={botPort} setBotPort={setBotPort}
            botUsername={botUsername} setBotUsername={setBotUsername}
            botPassword={botPassword} setBotPassword={setBotPassword}
            fetchBotData={fetchBotData} botLoading={botLoading} botError={botError} botData={botData}
          />
        )}
      </main>

      {/* Status */}
      <footer className="status-bar">
        <div className="status-left">
          {isModified ? <span className="status-modified"><Circle size={8}/> Ungespeichert</span> : <span className="status-saved"><CheckCircle size={8}/> Bereit</span>}
        </div>
        <div className="status-right">{Object.keys(config).length} Bereiche</div>
      </footer>
    </div>
  )
}

// Editor Tab
function EditorTab({ config, updateConfigValue, searchQuery, setSearchQuery, searchOpen, setSearchOpen,
  navStructure, activeSection, setActiveSection, hoveredNav, setHoveredNav,
  expandedSections, toggleSection, navigateTo, fieldDescriptions,
  showPreview, previewWidth, setPreviewWidth, botData }: any) {
  
  const [resizing, setResizing] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizing) setPreviewWidth(Math.max(200, Math.min(800, window.innerWidth - e.clientX)))
    }
    const handleMouseUp = () => setResizing(false)
    if (resizing) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp) }
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp) }
  }, [resizing, setPreviewWidth])

  const filteredNav = searchQuery 
    ? navStructure.filter((i: any) => i.label.toLowerCase().includes(searchQuery.toLowerCase()) || i.key.toLowerCase().includes(searchQuery.toLowerCase()))
    : navStructure

  return (
    <div className="editor-container">
      {/* Horizontal Nav */}
      <div className="editor-nav">
        <div className="nav-search">
          <button className={`search-toggle ${searchOpen ? 'open' : ''}`} onClick={() => setSearchOpen(!searchOpen)}>
            <Search size={16} />
          </button>
          {searchOpen && (
            <input type="text" placeholder="Suchen..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus />
          )}
        </div>
        <div className="nav-items">
          {filteredNav.map((item: any) => (
            <div key={item.key} className="nav-item-wrapper"
              onMouseEnter={() => { setHoveredNav(item.key); if (item.subItems) setOpenSubmenu(item.key) }}
              onMouseLeave={() => { setHoveredNav(null); setOpenSubmenu(null) }}
            >
              <button 
                className={`nav-item ${activeSection === item.key ? 'active' : ''} ${hoveredNav === item.key ? 'hovered' : ''}`}
                onClick={() => navigateTo(item.key)}
              >
                {item.label}
                {item.subItems && <ChevronDown size={14} className="nav-arrow" />}
              </button>
              {item.subItems && openSubmenu === item.key && (
                <div className="nav-submenu">
                  {item.subItems.map((sub: any) => (
                    <button key={sub.key} className="nav-subitem" onClick={() => navigateTo(sub.key)}>
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Editor Content */}
      <div className="editor-content">
        <div className="config-editor" style={{ marginRight: showPreview ? previewWidth : 0 }}>
          {Object.entries(config).map(([sectionKey, sectionValue]) => (
            <div key={sectionKey} id={`section-${sectionKey}`} className="config-section">
              <div className="section-header" onClick={() => toggleSection(sectionKey)}>
                <span>{expandedSections.has(sectionKey) ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}</span>
                <h3>{sectionKey}</h3>
                {sectionValue && typeof sectionValue === 'object' && 'Active' in sectionValue && (
                  <label className="inline-toggle">
                    <input type="checkbox" checked={!!(sectionValue as any).Active} 
                      onChange={e => { e.stopPropagation(); updateConfigValue(`${sectionKey}.Active`, e.target.checked) }}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                )}
              </div>
              {expandedSections.has(sectionKey) && (
                <div className="section-content">
                  <ConfigRenderer 
                    config={sectionValue as JsonObject} 
                    pathPrefix={sectionKey}
                    updateConfigValue={updateConfigValue}
                    fieldDescriptions={fieldDescriptions}
                    botData={botData}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* JSON Preview */}
        {showPreview && (
          <>
            <div className="preview-resize-handle" onMouseDown={() => setResizing(true)} />
            <div className="json-preview" style={{ width: previewWidth }}>
              <pre>{JSON.stringify(config, null, 2)}</pre>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Config Renderer - recursive
function ConfigRenderer({ config, pathPrefix, updateConfigValue, fieldDescriptions, botData }: any) {
  if (!config || typeof config !== 'object') return null

  return (
    <div className="config-fields">
      {Object.entries(config).map(([key, value]) => {
        const fullPath = pathPrefix ? `${pathPrefix}.${key}` : key
        const description = fieldDescriptions[fullPath] || fieldDescriptions[key] || ''
        
        if (value === null) {
          return <div key={key} className="field-row"><span className="field-key">{key}</span><span className="field-null">null</span></div>
        }
        
        if (typeof value === 'boolean') {
          return (
            <div key={key} className="field-row">
              <span className="field-key">{key}</span>
              <label className="toggle-switch">
                <input type="checkbox" checked={value} onChange={e => updateConfigValue(fullPath, e.target.checked)} />
                <span className="slider"></span>
              </label>
              {description && <span className="field-desc">{description}</span>}
            </div>
          )
        }
        
        if (typeof value === 'number') {
          return (
            <div key={key} className="field-row field-number">
              <span className="field-key">{key}</span>
              <input type="number" value={value} onChange={e => updateConfigValue(fullPath, Number(e.target.value))} />
              {description && <span className="field-desc">{description}</span>}
            </div>
          )
        }
        
        if (typeof value === 'string') {
          return (
            <div key={key} className="field-row field-string">
              <span className="field-key">{key}</span>
              <input type="text" value={value} onChange={e => updateConfigValue(fullPath, e.target.value)} />
              {description && <span className="field-desc">{description}</span>}
            </div>
          )
        }
        
        if (Array.isArray(value)) {
          return (
            <div key={key} className="field-array">
              <span className="field-key">{key}</span>
              <div className="array-items">
                {value.map((item, idx) => (
                  <div key={idx} className="array-item">
                    {typeof item === 'object' ? (
                      <CoordinateEditor 
                        value={item} 
                        path={`${fullPath}[${idx}]`}
                        updateConfigValue={updateConfigValue}
                        botData={botData}
                      />
                    ) : (
                      <span>{JSON.stringify(item)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        }
        
        if (typeof value === 'object') {
          const isCoord = 'Galaxy' in value && 'System' in value && 'Position' in value
          if (isCoord) {
            return (
              <div key={key} className="field-coordinate">
                <span className="field-key">{key}</span>
                <CoordinateEditor value={value} path={fullPath} updateConfigValue={updateConfigValue} botData={botData} />
              </div>
            )
          }
          return (
            <div key={key} className="field-nested">
              <span className="field-key">{key}</span>
              <ConfigRenderer config={value} pathPrefix={fullPath} updateConfigValue={updateConfigValue} fieldDescriptions={fieldDescriptions} botData={botData} />
            </div>
          )
        }
        
        return null
      })}
    </div>
  )
}

// Coordinate Editor
function CoordinateEditor({ value, path, updateConfigValue, botData }: any) {
  const coord = value as Coordinate
  const planets = botData?.planets || []
  
  return (
    <div className="coordinate-editor">
      <input type="number" placeholder="Gal" value={coord.Galaxy} onChange={e => updateConfigValue(`${path}.Galaxy`, Number(e.target.value))} />
      <input type="number" placeholder="Sys" value={coord.System} onChange={e => updateConfigValue(`${path}.System`, Number(e.target.value))} />
      <input type="number" placeholder="Pos" value={coord.Position} onChange={e => updateConfigValue(`${path}.Position`, Number(e.target.value))} />
      <select value={coord.Type === 'Planet' ? 'Planet' : coord.Type === 'Moon' ? 'Moon' : String(coord.Type)} 
        onChange={e => updateConfigValue(`${path}.Type`, e.target.value === 'Planet' ? 'Planet' : e.target.value === 'Moon' ? 'Moon' : Number(e.target.value))}>
        <option value="Planet">Planet</option>
        <option value="Moon">Moon</option>
      </select>
      {planets.length > 0 && (
        <select onChange={e => {
          const p = planets.find((x: any) => x.ID === Number(e.target.value))
          if (p) {
            updateConfigValue(`${path}.Galaxy`, p.Coordinate.Galaxy)
            updateConfigValue(`${path}.System`, p.Coordinate.System)
            updateConfigValue(`${path}.Position`, p.Coordinate.Position)
            updateConfigValue(`${path}.Type`, p.Moon ? 'Moon' : 'Planet')
          }
        }}>
          <option value="">Aus Planet wählen...</option>
          {planets.map((p: any) => (
            <option key={p.ID} value={p.ID}>{p.Name} [{p.Coordinate.Galaxy}:{p.Coordinate.System}:{p.Coordinate.Position}]</option>
          ))}
        </select>
      )}
    </div>
  )
}

// Bot Daten Tab
function BotDatenTab({ botHost, setBotHost, botPort, setBotPort, botUsername, setBotUsername, botPassword, setBotPassword, fetchBotData, botLoading, botError, botData }: any) {
  return (
    <div className="botdaten-container">
      <h2>Bot Daten</h2>
      <div className="connection-form">
        <div className="form-group">
          <label>Host</label>
          <input type="text" value={botHost} onChange={e => setBotHost(e.target.value)} placeholder="localhost oder IP" />
        </div>
        <div className="form-group">
          <label>Port</label>
          <input type="number" value={botPort} onChange={e => setBotPort(e.target.value)} placeholder="8080" />
        </div>
        <div className="form-group">
          <label>Username (BasicAuth)</label>
          <input type="text" value={botUsername} onChange={e => setBotUsername(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password (BasicAuth)</label>
          <input type="password" value={botPassword} onChange={e => setBotPassword(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={fetchBotData} disabled={botLoading}>
          {botLoading ? 'Lädt...' : 'Daten laden'}
        </button>
        {botError && <div className="error-msg">{botError}</div>}
      </div>

      {botData.planets.length > 0 && (
        <div className="data-section">
          <h3>Planeten ({botData.planets.length})</h3>
          <div className="cards-grid">
            {botData.planets.map((p: any) => (
              <div key={p.ID} className="data-card planet">
                <div className="card-header">{p.Name}</div>
                <div className="card-body">
                  <div className="coord">{p.Coordinate.Galaxy}:{p.Coordinate.System}:{p.Coordinate.Position}</div>
                  <div className="details">
                    <span>Ø {p.Temperature.Min}° - {p.Temperature.Max}°</span>
                    <span>{p.Fields.Built}/{p.Fields.Total} Felder</span>
                    <span>Ø {p.Diameter / 1000}k</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {botData.moons.length > 0 && (
        <div className="data-section">
          <h3>Monde ({botData.moons.length})</h3>
          <div className="cards-grid">
            {botData.moons.map((m: any) => (
              <div key={m.ID} className="data-card moon">
                <div className="card-header">{m.Name}</div>
                <div className="card-body">
                  <div className="coord">{m.Coordinate.Galaxy}:{m.Coordinate.System}:{m.Coordinate.Position}</div>
                  <div className="details">
                    <span>Ø {m.Diameter / 1000}k</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {botData.userInfo && (
        <div className="data-section">
          <h3>Spieler</h3>
          <div className="user-info">
            <span className="name">{botData.userInfo.PlayerName}</span>
            <span className="points">{botData.userInfo.Points.toLocaleString()} Punkte</span>
            <span className="rank">Rang #{botData.userInfo.Rank}</span>
            <span className="honor">{botData.userInfo.HonourPoints.toLocaleString()} Ehre</span>
          </div>
        </div>
      )}

      {botData.research && (
        <div className="data-section">
          <h3>Forschungen</h3>
          <div className="research-grid">
            {Object.entries(botData.research).map(([key, value]) => (
              <div key={key} className="research-item">
                <span className="tech-name">{key}</span>
                <span className="tech-level">Lv {value as number}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {botData.fleets.length > 0 && (
        <div className="data-section">
          <h3>Flotten ({botData.fleets.length})</h3>
          <div className="fleets-list">
            {botData.fleets.map((f: any, i: number) => (
              <div key={i} className="fleet-card">
                <div className="fleet-route">
                  {f.Origin.Galaxy}:{f.Origin.System}:{f.Origin.Position} → {f.Destination.Galaxy}:{f.Destination.System}:{f.Destination.Position}
                </div>
                <div className="fleet-time">
                  Ankunft: {new Date(f.ArrivalTime).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
