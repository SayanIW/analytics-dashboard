import React, { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import useCallLogs from '../hooks/useCallLogs'
import useCallsByHour from '../hooks/useCallsByHour'
import { CALLS_API, CONVERSATIONS_API, CONTACTS_API } from '../constants/api'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler
)

function KpiCard({ label, value, accent = 'text-primary', loading }) {
  return (
    <div className="kpi-card p-5 rounded-xl">
      <div className="text-xs text-textMuted uppercase tracking-widest mb-2">{label}</div>
      {loading
        ? <div className="h-8 w-24 rounded placeholder-glow" />
        : <div className={`text-3xl font-bold ${accent}`}>{value ?? '—'}</div>
      }
    </div>
  )
}

export default function Dashboard() {
  const { callLogs, total, loading } = useCallLogs({ page: 1, pageSize: 50 })
  const [webChatsTotal, setWebChatsTotal] = useState(null)
  const [webChatsLoading, setWebChatsLoading] = useState(true)
  const [appointmentsTotal, setAppointmentsTotal] = useState(null)
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const chartRef = useRef(null)

  // Business vs After Hours doughnut — date range
  const todayStr = new Date().toISOString().slice(0, 10)
  const sevenDaysAgoStr = (() => { const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().slice(0, 10) })()
  const [hourStart, setHourStart] = useState(sevenDaysAgoStr)
  const [hourEnd,   setHourEnd]   = useState(todayStr)
  const { business, afterHours, totalCalls: hourTotal, loading: hourLoading, error: hourError, fetchForRange } = useCallsByHour()

  useEffect(() => { fetchForRange(sevenDaysAgoStr, todayStr) }, [])

  useEffect(() => {
    async function fetchWebChatsCount() {
      try {
        const params = new URLSearchParams({
          locationId: CONVERSATIONS_API.LOCATION_ID,
          limit: '1',
          lastMessageType: 'TYPE_LIVE_CHAT'
        })
        const res = await fetch(`${CONVERSATIONS_API.BASE_URL}?${params}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${CONVERSATIONS_API.TOKEN}`,
            version: CONVERSATIONS_API.VERSION
          }
        })
        if (!res.ok) throw new Error()
        const json = await res.json()
        setWebChatsTotal(json.total ?? 0)
      } catch {
        setWebChatsTotal(0)
      } finally {
        setWebChatsLoading(false)
      }
    }

    async function fetchAppointmentsCount() {
      try {
        // Fetch 1 contact just to get the meta.total count
        const params = new URLSearchParams({
          locationId: CONTACTS_API.LOCATION_ID,
          limit: '1'
        })
        const res = await fetch(`${CONTACTS_API.BASE_URL}?${params}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${CONTACTS_API.TOKEN}`,
            version: CONTACTS_API.VERSION
          }
        })
        if (!res.ok) throw new Error()
        const json = await res.json()
        setAppointmentsTotal(json.meta?.total ?? json.count ?? 0)
      } catch {
        setAppointmentsTotal(0)
      } finally {
        setAppointmentsLoading(false)
      }
    }

    fetchWebChatsCount()
    fetchAppointmentsCount()
  }, [])

  const totalDurationMin = Math.round(
    callLogs.reduce((s, c) => s + (c.duration || 0), 0) / 60
  )
  const totalActions = callLogs.reduce(
    (s, c) => s + (c.executedCallActions?.length || 0), 0
  )
  const avgDurationSec = callLogs.length
    ? Math.round(callLogs.reduce((s, c) => s + (c.duration || 0), 0) / callLogs.length)
    : 0

  const labels = callLogs.map(c =>
    new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )

  const getGradient = (chart) => {
    if (!chart?.ctx) return 'rgba(139,92,246,0.2)'
    const gradient = chart.ctx.createLinearGradient(0, 0, 0, chart.height)
    gradient.addColorStop(0, 'rgba(139,92,246,0.35)')
    gradient.addColorStop(1, 'transparent')
    return gradient
  }

  const chartData = {
    labels,
    datasets: [{
      label: 'Call Duration (s)',
      data: callLogs.map(c => c.duration || 0),
      borderColor: '#8b5cf6',
      backgroundColor: (context) => {
        const chart = context.chart
        return getGradient(chart)
      },
      borderWidth: 2,
      pointRadius: 0,
      fill: true,
      tension: 0.4
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#18181b',
        borderColor: '#27272a',
        borderWidth: 1,
        titleColor: '#a1a1aa',
        bodyColor: '#ffffff',
        padding: 10
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#a1a1aa', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#a1a1aa', font: { size: 11 } }
      }
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-1">JarrettFord Dashboard</h1>
        <p className="text-textMuted mb-8">Monitor your AI call performance</p>

        {/* KPI Row 1 */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Total Calls" value={total} accent="text-primary" loading={loading} />
          <KpiCard label="Web Chats" value={webChatsTotal} accent="text-accentGreen" loading={webChatsLoading} />
          <KpiCard label="Total Duration" value={`${totalDurationMin} min`} accent="text-blue-400" loading={loading} />
          <KpiCard label="Actions Triggered" value={totalActions} accent="text-orange-400" loading={loading} />
        </section>

        {/* Line Chart */}
        <section className="kpi-card p-6 rounded-xl mb-6">
          <h3 className="font-semibold mb-3">Calls Completed</h3>
          <div style={{ height: 300 }}>
            {loading
              ? <div className="h-full rounded placeholder-glow" />
              : <Line ref={chartRef} data={chartData} options={chartOptions} />
            }
          </div>
        </section>

        {/* Conversion Funnel + AI Interactions — side by side */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

          {/* LEFT — Conversion Funnel bar chart */}
          <div className="kpi-card p-6 rounded-xl">
            <div className="flex items-center space-x-2 mb-1">
              <i className="fa-solid fa-chart-line text-primary text-lg" />
              <h3 className="font-semibold text-lg">Conversion Funnel</h3>
            </div>
            <p className="text-textMuted text-sm mb-3">Track prospects through your sales pipeline</p>
            <div style={{ height: 320 }}>
              {(loading || webChatsLoading || appointmentsLoading)
                ? <div className="h-full rounded placeholder-glow" />
                : <Bar
                    data={{
                      labels: ['Total Calls', 'Web Chats', 'Appointments'],
                      datasets: [{
                        label: 'Count',
                        data: [total ?? 0, webChatsTotal ?? 0, appointmentsTotal ?? 0],
                        backgroundColor: [
                          'rgba(139,92,246,0.75)',
                          'rgba(190,242,100,0.75)',
                          'rgba(96,165,250,0.75)',
                        ],
                        hoverBackgroundColor: [
                          'rgba(139,92,246,1)',
                          'rgba(190,242,100,1)',
                          'rgba(96,165,250,1)',
                        ],
                        borderRadius: 6,
                        borderSkipped: false,
                        barPercentage: 0.5,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: '#18181b',
                          borderColor: '#27272a',
                          borderWidth: 1,
                          titleColor: '#a1a1aa',
                          bodyColor: '#ffffff',
                          padding: 10,
                          callbacks: { label: ctx => ` ${ctx.parsed.y.toLocaleString()}` }
                        }
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { color: '#a1a1aa', font: { size: 12 } }
                        },
                        y: {
                          grid: { color: 'rgba(255,255,255,0.04)' },
                          ticks: {
                            color: '#a1a1aa',
                            font: { size: 11 },
                            callback: v => v.toLocaleString()
                          },
                          beginAtZero: true
                        }
                      }
                    }}
                  />
              }
            </div>
            {!loading && !webChatsLoading && !appointmentsLoading && (
              <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-bordercolor">
                {[
                  { label: 'Total Calls',   value: total,             color: 'text-primary',      icon: 'fa-phone' },
                  { label: 'Web Chats',      value: webChatsTotal,     color: 'text-accentGreen',  icon: 'fa-comments' },
                  { label: 'Appointments',   value: appointmentsTotal, color: 'text-blue-400',     icon: 'fa-calendar-check' },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center text-center">
                    <div className={`text-2xl font-bold ${s.color}`}>{(s.value ?? 0).toLocaleString()}</div>
                    <div className="flex items-center space-x-1 mt-1">
                      <i className={`fa-solid ${s.icon} text-xs text-textMuted`} />
                      <span className="text-xs text-textMuted">{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — AI Agent Interactions pie chart */}
          <div className="kpi-card p-6 rounded-xl flex flex-col">
            <div className="flex items-center space-x-2 mb-1">
              <i className="fa-solid fa-chart-pie text-primary text-lg" />
              <h3 className="font-semibold text-lg">AI Agent Interactions</h3>
            </div>
            <p className="text-textMuted text-sm mb-3">Distribution of customer interactions by channel</p>
            <div style={{ height: 340 }}>
              {(loading || webChatsLoading)
                ? <div className="w-full h-full rounded placeholder-glow" />
                : (() => {
                    const callVal = total ?? 0
                    const chatVal = webChatsTotal ?? 0
                    const pieTotal = callVal + chatVal
                    const callPct  = pieTotal ? ((callVal / pieTotal) * 100).toFixed(1) : 0
                    const chatPct  = pieTotal ? ((chatVal / pieTotal) * 100).toFixed(1) : 0
                    return (
                      <Pie
                        data={{
                          labels: [
                            `AI Calls: ${callPct}%`,
                            `Web Chats: ${chatPct}%`,
                          ],
                          datasets: [{
                            data: [callVal, chatVal],
                            backgroundColor: [
                              'rgba(139,92,246,0.85)',
                              'rgba(190,242,100,0.85)',
                            ],
                            hoverBackgroundColor: [
                              'rgba(139,92,246,1)',
                              'rgba(190,242,100,1)',
                            ],
                            borderColor: '#18181b',
                            borderWidth: 3,
                            hoverOffset: 10,
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                color: '#a1a1aa',
                                font: { size: 12 },
                                padding: 16,
                                usePointStyle: true,
                                pointStyle: 'circle',
                                pointStyleWidth: 10,
                              }
                            },
                            tooltip: {
                              backgroundColor: '#18181b',
                              borderColor: '#27272a',
                              borderWidth: 1,
                              titleColor: '#a1a1aa',
                              bodyColor: '#ffffff',
                              padding: 10,
                              callbacks: {
                                label: ctx => ` ${ctx.label.split(':')[0]}: ${ctx.parsed.toLocaleString()}`
                              }
                            }
                          }
                        }}
                      />
                    )
                  })()
              }
            </div>
          </div>

        </section>

        {/* Call Timing — Business vs After Hours doughnut */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div className="kpi-card p-6 rounded-xl flex flex-col">
            {/* Header + date range picker */}
            <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-clock text-primary text-lg" />
                  <h3 className="font-semibold text-lg">Call Timing</h3>
                </div>
                <p className="text-textMuted text-sm mt-0.5">Business vs After Hours breakdown</p>
              </div>
              {/* Range inputs + Apply */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <label className="text-xs text-textMuted">From</label>
                  <input
                    type="date"
                    value={hourStart}
                    max={hourEnd || todayStr}
                    onChange={e => setHourStart(e.target.value)}
                    className="text-sm rounded px-2 py-1"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #27272a', color: '#fff' }}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <label className="text-xs text-textMuted">To</label>
                  <input
                    type="date"
                    value={hourEnd}
                    min={hourStart}
                    max={todayStr}
                    onChange={e => setHourEnd(e.target.value)}
                    className="text-sm rounded px-2 py-1"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #27272a', color: '#fff' }}
                  />
                </div>
                <button
                  onClick={() => fetchForRange(hourStart, hourEnd)}
                  disabled={!hourStart || !hourEnd || hourLoading}
                  className="px-3 py-1.5 rounded bg-primary text-white text-xs font-medium hover:bg-primary/80 disabled:opacity-40"
                >
                  {hourLoading ? 'Loading…' : 'Apply'}
                </button>
              </div>
            </div>

            <div style={{ height: 360 }}>
              {hourLoading
                ? <div className="w-48 h-48 rounded-full placeholder-glow" />
                : hourTotal === 0
                  ? <div className="text-textMuted text-sm text-center">
                      <i className="fa-solid fa-circle-info mb-2 text-2xl block" />
                      No calls found for this date
                    </div>
                  : (() => {
                      const bizPct   = ((business   / hourTotal) * 100).toFixed(1)
                      const afterPct = ((afterHours / hourTotal) * 100).toFixed(1)
                      return (
                        <Doughnut
                          data={{
                            labels: [
                              `After Hours (6PM–8AM)`,
                              `Business Hours (8AM–6PM)`,
                            ],
                            datasets: [{
                              data: [afterHours, business],
                              backgroundColor: [
                                'rgba(96,165,250,0.85)',    // blue  — after hours
                                'rgba(113,113,122,0.75)',   // gray  — business hours
                              ],
                              hoverBackgroundColor: [
                                'rgba(96,165,250,1)',
                                'rgba(161,161,170,0.9)',
                              ],
                              borderColor: '#18181b',
                              borderWidth: 3,
                              hoverOffset: 8,
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: '65%',
                            plugins: {
                              legend: {
                                position: 'bottom',
                                labels: {
                                  color: '#a1a1aa',
                                  font: { size: 12 },
                                  padding: 16,
                                  usePointStyle: true,
                                  pointStyle: 'circle',
                                  pointStyleWidth: 10,
                                }
                              },
                              tooltip: {
                                backgroundColor: '#18181b',
                                borderColor: '#27272a',
                                borderWidth: 1,
                                titleColor: '#a1a1aa',
                                bodyColor: '#ffffff',
                                padding: 10,
                                callbacks: {
                                  label: ctx => {
                                    const pct = ((ctx.parsed / hourTotal) * 100).toFixed(1)
                                    return ` ${ctx.label.split('(')[0].trim()}: ${ctx.parsed} calls (${pct}%)`
                                  }
                                }
                              },
                              // Inline percentage labels via custom plugin
                              datalabels: undefined,
                            }
                          }}
                          plugins={[{
                            id: 'sliceLabels',
                            afterDraw(chart) {
                              const { ctx, data } = chart
                              chart.getDatasetMeta(0).data.forEach((arc, i) => {
                                const val = data.datasets[0].data[i]
                                if (!val) return
                                const pct = ((val / hourTotal) * 100).toFixed(1) + '%'
                                const mid = (arc.startAngle + arc.endAngle) / 2
                                const r   = (arc.innerRadius + arc.outerRadius) / 2
                                const x   = arc.x + Math.cos(mid) * r
                                const y   = arc.y + Math.sin(mid) * r
                                ctx.save()
                                ctx.fillStyle = '#ffffff'
                                ctx.font = 'bold 13px Inter, sans-serif'
                                ctx.textAlign = 'center'
                                ctx.textBaseline = 'middle'
                                ctx.fillText(pct, x, y)
                                ctx.restore()
                              })
                            }
                          }]}
                        />
                      )
                    })()
              }
            </div>

            {/* Summary row */}
            {!hourLoading && hourTotal > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-bordercolor">
                <div className="flex flex-col items-center text-center">
                  <div className="text-2xl font-bold text-blue-400">{afterHours}</div>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                    <span className="text-xs text-textMuted">After Hours (6PM–8AM)</span>
                  </div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="text-2xl font-bold text-zinc-400">{business}</div>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-zinc-500 inline-block" />
                    <span className="text-xs text-textMuted">Business Hours (8AM–6PM)</span>
                  </div>
                </div>
              </div>
            )}
            {hourError && <div className="text-red-400 text-xs mt-2">{hourError}</div>}
          </div>

          {/* KPI Row 2 — moved here to fill the right column */}
          <div className="flex flex-col gap-6">
            <KpiCard label="Avg Call Duration" value={`${avgDurationSec}s`} accent="text-purple-400" loading={loading} />
          </div>
        </section>
      </main>
    </div>
  )
}

