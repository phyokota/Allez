import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

const TABLE_NAME = 'benchmark_metrics'
const METRIC_OPTIONS = {
  project_v_grade: {
    label: 'Boulder projects',
    responseLabel: 'usable grade responses',
    emptyMessage: 'No project boulder grades were found.',
    prefix: 'V',
    bucketSize: 1,
  },
  max_hang_opencrimp_18mm_10s_kg: {
    label: 'Max hang open crimp',
    responseLabel: 'usable hang responses',
    bucketLabel: '5 kg bins',
    emptyMessage: 'No open-crimp max hang values were found.',
    suffix: ' kg',
    bucketSize: 5,
    compactRangeLabels: true,
  },
  min_edge_opencrimp_mm: {
    label: 'Min edge open crimp',
    responseLabel: 'usable edge responses',
    emptyMessage: 'No open-crimp minimum edge values were found.',
    suffix: ' mm',
    bucketSize: 1,
  },
  max_pullup_reps: {
    label: 'Pull-ups',
    responseLabel: 'usable pull-up responses',
    bucketLabel: '5 rep bins',
    emptyMessage: 'No pull-up rep values were found.',
    suffix: ' reps',
    bucketSize: 5,
    compactRangeLabels: true,
  },
}

const METRIC_COLUMNS = Object.keys(METRIC_OPTIONS).join(', ')
const DASHBOARD_TABS = [
  { id: 'benchmarks', label: 'Benchmarks' },
  { id: 'input', label: 'Input metrics' },
  { id: 'calculator', label: 'Grade calculator' },
  { id: 'distribution', label: 'Distributions' },
]
const BENCHMARK_CARDS = [
  { label: 'Project Grade', icon: 'V' },
  { label: 'Max Hang Secs', icon: '10s' },
  { label: 'Min Edge Crimp', icon: 'mm' },
  { label: 'Max Pull-ups', icon: 'PU' },
]
const RANK_TIERS = [
  { min: 0, max: 1, rank: 'bronze', label: 'V0-V1' },
  { min: 1, max: 2, rank: 'silver', label: 'V1-V2' },
  { min: 2, max: 4, rank: 'gold', label: 'V2-V4' },
  { min: 4, max: 6, rank: 'platinum', label: 'V4-V6' },
  { min: 6, max: 8, rank: 'diamond', label: 'V6-V8' },
  { min: 8, max: 10, rank: 'masters', label: 'V8-V10' },
  { min: 10, max: 12, rank: 'grandmasters', label: 'V10-V12' },
  { min: 12, max: Number.POSITIVE_INFINITY, rank: 'professional', label: 'V12+' },
]

function normalizeMetricValue(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const metricValue = Number.parseFloat(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(metricValue) ? metricValue : null
}

function formatMetricLabel(value, option) {
  const prefix = option.prefix ?? ''
  const suffix = option.suffix ?? ''

  return `${prefix}${value}${suffix}`
}

function formatBinLabel(binStart, option) {
  if (option.bucketSize === 1) {
    return formatMetricLabel(binStart, option)
  }

  const binEnd = binStart + option.bucketSize

  if (option.compactRangeLabels) {
    return `${binStart}-${binEnd}`
  }

  return `${formatMetricLabel(binStart, option)}-${formatMetricLabel(binEnd, option)}`
}

function buildHistogram(rows, selectedMetric, option) {
  const counts = new Map()

  rows.forEach((row) => {
    const value = normalizeMetricValue(row[selectedMetric])

    if (value === null) {
      return
    }

    const binStart = Math.floor(value / option.bucketSize) * option.bucketSize
    counts.set(binStart, (counts.get(binStart) ?? 0) + 1)
  })

  return Array.from(counts, ([binStart, count]) => ({ binStart, count })).sort(
    (a, b) => a.binStart - b.binStart,
  )
}

function getRankForVGrade(value) {
  const grade = normalizeMetricValue(value)

  if (grade === null || grade < 0) {
    return null
  }

  return RANK_TIERS.find((tier) => grade >= tier.min && grade < tier.max)
}

function App() {
  const [rows, setRows] = useState([])
  const [activeTab, setActiveTab] = useState('benchmarks')
  const [selectedMetric, setSelectedMetric] = useState('project_v_grade')
  const [inputGrade, setInputGrade] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadGrades() {
      setIsLoading(true)
      setErrorMessage('')

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(METRIC_COLUMNS)

      if (error) {
        setErrorMessage(error.message)
        setRows([])
      } else {
        setRows(data ?? [])
      }

      setIsLoading(false)
    }

    loadGrades()
  }, [])

  const selectedOption = METRIC_OPTIONS[selectedMetric]
  const histogram = useMemo(
    () => buildHistogram(rows, selectedMetric, selectedOption),
    [rows, selectedMetric, selectedOption],
  )
  const totalResponses = histogram.reduce((sum, bin) => sum + bin.count, 0)
  const highestCount = Math.max(...histogram.map((bin) => bin.count), 0)
  const inputRank = getRankForVGrade(inputGrade)

  return (
    <main className="dashboard">
      <section className="intro">
        <p className="eyebrow">Allez benchmark metrics</p>
        <div className="intro-copy">
          <h1>Metric distribution</h1>
          <p>
            Histograms of climbers' boulder projects, open-crimp strength,
            minimum edge sizes, and pull-ups loaded from the Supabase{' '}
            <code>{TABLE_NAME}</code> table.
          </p>
        </div>

        <div className="tab-toggle" aria-label="Dashboard tab">
          {DASHBOARD_TABS.map((tab) => (
            <button
              className={activeTab === tab.id ? 'active' : ''}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === 'benchmarks' && (
        <section className="benchmarks-panel">
          <div className="panel-header">
            <div>
              <h2>Benchmarks</h2>
              <p>Your current benchmark ranks.</p>
            </div>
          </div>

          <div className="benchmark-grid">
            {BENCHMARK_CARDS.map((benchmark) => (
              <div className="benchmark-card" key={benchmark.label}>
                <span className="benchmark-icon" aria-hidden="true">
                  {benchmark.icon}
                </span>
                <div>
                  <h3>{benchmark.label}</h3>
                  <strong>Unranked</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'distribution' && (
        <>
          <div className="grade-toggle" aria-label="Metric type">
            {Object.entries(METRIC_OPTIONS).map(([value, option]) => (
              <button
                className={value === selectedMetric ? 'active' : ''}
                key={value}
                onClick={() => setSelectedMetric(value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>

          <section className="histogram-panel">
            <div className="panel-header">
              <div>
                <h2>{selectedOption.label}</h2>
                <p>
                  {totalResponses} {selectedOption.responseLabel}
                  {selectedOption.bucketLabel && ` · ${selectedOption.bucketLabel}`}
                </p>
              </div>
              {isLoading && <span className="status">Loading Supabase data</span>}
              {errorMessage && <span className="status error">Supabase error</span>}
            </div>

            {errorMessage && <p className="message">{errorMessage}</p>}

            {!isLoading && !errorMessage && histogram.length === 0 && (
              <p className="message">{selectedOption.emptyMessage}</p>
            )}

            {histogram.length > 0 && (
              <div className="histogram" role="list" aria-label="Metric histogram">
                {histogram.map((bin) => {
                  const barHeight = `${Math.max((bin.count / highestCount) * 100, 4)}%`
                  const metricLabel = formatBinLabel(bin.binStart, selectedOption)

                  return (
                    <div
                      className="histogram-bin"
                      key={bin.binStart}
                      role="listitem"
                    >
                      <span className="bar-count">{bin.count}</span>
                      <div className="bar-track" aria-hidden="true">
                        <div className="bar-fill" style={{ height: barHeight }} />
                      </div>
                      <span className="bar-label">{metricLabel}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
          <section className="summary-grid" aria-label="Histogram summary">
            <div>
              <span>{rows.length}</span>
              <p>rows fetched</p>
            </div>
            <div>
              <span>{histogram.length}</span>
              <p>metric bins</p>
            </div>
            <div>
              <span>{highestCount}</span>
              <p>largest bin</p>
            </div>
          </section>
        </>
      )}

      {activeTab === 'input' && (
        <section className="input-metrics-panel">
          <div className="panel-header">
            <div>
              <h2>Input metrics</h2>
              <p>Enter a V grade to see the matching rank.</p>
            </div>
          </div>

          <div className="rank-form">
            <label htmlFor="v-grade-input">V grade</label>
            <div className="rank-input-row">
              <span aria-hidden="true">V</span>
              <input
                id="v-grade-input"
                inputMode="decimal"
                min="0"
                onChange={(event) => setInputGrade(event.target.value)}
                placeholder="6"
                step="1"
                type="number"
                value={inputGrade}
              />
            </div>
          </div>

          <div className="rank-output" aria-live="polite">
            <span>Rank</span>
            <strong>{inputRank ? inputRank.rank : 'Enter a V grade'}</strong>
            {inputRank && <p>{inputRank.label} climber ranking</p>}
          </div>

          <div className="rank-table" aria-label="Rank tiers">
            {RANK_TIERS.map((tier) => (
              <div
                className={inputRank?.rank === tier.rank ? 'active' : ''}
                key={tier.rank}
              >
                <span>{tier.label}</span>
                <strong>{tier.rank}</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'calculator' && (
        <section className="placeholder-panel">
          <div className="panel-header">
            <div>
              <h2>Grade calculator</h2>
              <p>Grade calculator coming soon.</p>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

export default App
