import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

const TABLE_NAME = 'benchmark_metrics'
const METRIC_OPTIONS = {
  max_v_grade: {
    label: 'Max boulder grade',
    responseLabel: 'usable grade responses',
    emptyMessage: 'No max boulder grades were found.',
    prefix: 'V',
    bucketSize: 1,
  },
  max_route_grade: {
    label: 'Max route grade',
    responseLabel: 'usable grade responses',
    emptyMessage: 'No max route grades were found.',
    prefix: '',
    bucketSize: 1,
  },
  project_v_grade: {
    label: 'Boulder projects',
    responseLabel: 'usable grade responses',
    emptyMessage: 'No project boulder grades were found.',
    prefix: 'V',
    bucketSize: 1,
  },
  project_route_grade: {
    label: 'Route projects',
    responseLabel: 'usable grade responses',
    emptyMessage: 'No project route grades were found.',
    prefix: '',
    bucketSize: 1,
  },
  max_hang_halfcrimp_18mm_10s_kg: {
    label: 'Max hang half crimp',
    responseLabel: 'usable hang responses',
    bucketLabel: '5 kg bins',
    emptyMessage: 'No half-crimp max hang values were found.',
    suffix: ' kg',
    bucketSize: 5,
    compactRangeLabels: true,
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
  min_edge_halfcrimp_mm: {
    label: 'Min edge half crimp',
    responseLabel: 'usable edge responses',
    emptyMessage: 'No half-crimp minimum edge values were found.',
    suffix: ' mm',
    bucketSize: 1,
  },
  min_edge_opencrimp_mm: {
    label: 'Min edge open crimp',
    responseLabel: 'usable edge responses',
    emptyMessage: 'No open-crimp minimum edge values were found.',
    suffix: ' mm',
    bucketSize: 1,
  },
}

const METRIC_COLUMNS = Object.keys(METRIC_OPTIONS).join(', ')

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

function App() {
  const [rows, setRows] = useState([])
  const [selectedMetric, setSelectedMetric] = useState('max_v_grade')
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

  return (
    <main className="dashboard">
      <section className="intro">
        <p className="eyebrow">Allez benchmark metrics</p>
        <div className="intro-copy">
          <h1>Metric distribution</h1>
          <p>
            Histograms of climbers' grades, max hangs, and minimum edge sizes
            loaded from the Supabase <code>{TABLE_NAME}</code> table.
          </p>
        </div>

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
      </section>

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
    </main>
  )
}

export default App
