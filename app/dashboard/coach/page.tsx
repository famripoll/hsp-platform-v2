'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import LogOutButton from '../student/LogOutButton'
import {
  Bell,
  Eye,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Settings,
  Star,
} from 'lucide-react'

type Coach = {
  university?: string | null
  division?: string | null
  state?: string | null
  phone?: string | null
  verified?: boolean | null
}

type Profile = {
  role: string | null
  status: string | null
  full_name: string | null
  email: string | null
}

type ProspectStudent = {
  id: string
  full_name: string | null
  high_school: string | null
  city: string | null
  state: string | null
  graduation_year: string | null
  grade: string | null
  gpa: number | null
  primary_position: string | null
  secondary_position: string | null
  bats: string | null
  throws: string | null
  photo_url: string | null
  stat_avg: string | null
  stat_hr: string | null
  stat_rbi: string | null
  stat_era: string | null
  stat_whip: string | null
  stat_velo: string | null
  subscription_status: string | null
}

type Filters = {
  state: string
  gradYear: string
  position: string
  minGpa: string
  bats: string
  throws: string
}

const POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH']
const GRAD_YEARS = ['2025', '2026', '2027', '2028']
const GPA_OPTIONS = [
  { label: 'Any', value: '' },
  { label: '2.0+', value: '2.0' },
  { label: '2.5+', value: '2.5' },
  { label: '3.0+', value: '3.0' },
  { label: '3.5+', value: '3.5' },
  { label: '4.0+', value: '4.0' },
]

// Only safe, non-private columns — never include contact/social/family fields
const SAFE_SELECT =
  'id, full_name, high_school, city, state, graduation_year, grade, gpa, primary_position, secondary_position, bats, throws, photo_url, stat_avg, stat_hr, stat_rbi, stat_era, stat_whip, stat_velo, subscription_status'

const EMPTY_FILTERS: Filters = {
  state: '',
  gradYear: '',
  position: '',
  minGpa: '',
  bats: '',
  throws: '',
}

const FALLBACK = 'Not provided'

const LABEL_CLS = 'text-[10px] font-semibold uppercase text-[#64748b] mb-1 block'
const INPUT_CLS =
  'border border-gray-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent bg-white'

const COACH_TABS = [
  { label: 'Prospect Search', value: 'prospects' },
  { label: 'Watchlist',       value: 'watchlist' },
  { label: 'Messages',        value: 'messages' },
  { label: 'Notifications',   value: 'notifications' },
] as const

type CoachTabValue = typeof COACH_TABS[number]['value']

function getInitials(name: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name[0].toUpperCase()
}

export default function CoachDashboardPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [authLoading, setAuthLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [coach, setCoach] = useState<Coach>({})
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [students, setStudents] = useState<ProspectStudent[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [activeTab, setActiveTab] = useState<CoachTabValue>('prospects')

  const runSearch = useCallback(
    async (activeFilters: Filters) => {
      setSearching(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = supabase
        .from('students')
        .select(SAFE_SELECT)
        .order('full_name', { ascending: true })
        .limit(200)

      if (activeFilters.state) q = q.ilike('state', `%${activeFilters.state}%`)
      if (activeFilters.gradYear) q = q.eq('graduation_year', activeFilters.gradYear)
      if (activeFilters.position) q = q.eq('primary_position', activeFilters.position)
      if (activeFilters.minGpa) q = q.gte('gpa', parseFloat(activeFilters.minGpa))
      if (activeFilters.bats) q = q.eq('bats', activeFilters.bats)
      if (activeFilters.throws) q = q.eq('throws', activeFilters.throws)

      const { data } = await q
      setStudents(data ?? [])
      setSearched(true)
      setSearching(false)
    },
    [supabase]
  )

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: prof } = await supabase
        .from('profiles')
        .select('role, status, full_name, email')
        .eq('id', user.id)
        .single()

      if (
        !prof ||
        prof.role !== 'coach' ||
        (prof.status !== 'active' && prof.status !== 'pending')
      ) {
        router.push('/login')
        return
      }

      setProfile(prof)

      const { data: coachData } = await supabase
        .from('coaches')
        .select('university, division, state, phone, verified')
        .eq('profile_id', user.id)
        .single()

      setCoach(coachData ?? {})
      setAuthLoading(false)

      await runSearch(EMPTY_FILTERS)
    }
    init()
  }, [router, supabase, runSearch])

  const isVerified = coach.verified === true

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#d93025] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* Dashboard Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link
            href="/dashboard/coach"
            className="flex items-baseline gap-1 font-black text-xl sm:text-2xl md:text-3xl leading-none hover:opacity-80 hover:scale-105 transition-all duration-200 shrink-0"
          >
            <span className="text-hsp-red">High</span>
            <span className="text-hsp-dark">School</span>
            <span className="text-hsp-dark">Prospect</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard/coach/settings"
              className="flex items-center gap-1 text-sm text-[#0f172a] hover:text-[#d93025] transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <LogOutButton />
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Coach Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p
                    className="text-xs font-semibold uppercase mb-1.5"
                    style={{ color: '#d93025' }}
                  >
                    Coach Profile
                  </p>
                  <h1 className="text-2xl font-bold leading-tight" style={{ color: '#0f172a' }}>
                    {profile?.full_name ?? FALLBACK}
                  </h1>
                </div>
                <span
                  className="text-xs rounded-full px-3 py-1 font-semibold whitespace-nowrap"
                  style={{
                    backgroundColor: isVerified ? '#dcfce7' : '#F2F3F3',
                    color: isVerified ? '#166534' : '#0f172a',
                  }}
                >
                  {isVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-5">
                <div className="rounded-xl p-3" style={{ backgroundColor: '#F2F3F3' }}>
                  <p
                    className="text-[10px] font-semibold uppercase mb-1"
                    style={{ color: '#64748b' }}
                  >
                    University
                  </p>
                  <div className="flex items-start gap-2">
                    <GraduationCap
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: '#64748b' }}
                    />
                    <span
                      className="text-sm font-semibold leading-tight"
                      style={{ color: '#0f172a' }}
                    >
                      {coach.university ?? FALLBACK}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3" style={{ backgroundColor: '#F2F3F3' }}>
                    <p
                      className="text-[10px] font-semibold uppercase mb-1"
                      style={{ color: '#64748b' }}
                    >
                      Division
                    </p>
                    <span
                      className="text-sm font-semibold leading-tight"
                      style={{ color: '#0f172a' }}
                    >
                      {coach.division ?? FALLBACK}
                    </span>
                  </div>
                  <div className="rounded-xl p-3" style={{ backgroundColor: '#F2F3F3' }}>
                    <p
                      className="text-[10px] font-semibold uppercase mb-1"
                      style={{ color: '#64748b' }}
                    >
                      State
                    </p>
                    <div className="flex items-start gap-1">
                      <MapPin
                        className="w-3 h-3 shrink-0 mt-0.5"
                        style={{ color: '#64748b' }}
                      />
                      <span
                        className="text-sm font-semibold leading-tight"
                        style={{ color: '#0f172a' }}
                      >
                        {coach.state ?? FALLBACK}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p
                  className="text-xs font-semibold uppercase mb-1.5"
                  style={{ color: '#d93025' }}
                >
                  Contact
                </p>
                <div className="flex items-center gap-2 text-sm" style={{ color: '#64748b' }}>
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{profile?.email ?? FALLBACK}</span>
                </div>
                <div
                  className="flex items-center gap-2 text-sm mt-1"
                  style={{ color: '#64748b' }}
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>{coach.phone || FALLBACK}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation + Content */}
          <div className="md:col-span-2 flex flex-col gap-6">

            {/* Tab Bar */}
            <div className="bg-white rounded-2xl shadow-sm">
              <nav className="flex flex-wrap justify-center px-2">
                {COACH_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`shrink-0 px-4 py-4 text-sm border-b-2 transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.value
                        ? 'border-[#d93025] text-[#d93025] font-semibold'
                        : 'border-transparent text-[#64748b] hover:text-[#d93025] hover:scale-105'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Prospect Search Tab */}
            {activeTab === 'prospects' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5" style={{ color: '#d93025' }} />
                    <h2 className="text-xl font-bold" style={{ color: '#0f172a' }}>
                      Prospect Search
                    </h2>
                  </div>
                  {searched && !searching && (
                    <span className="text-xs" style={{ color: '#64748b' }}>
                      Showing{' '}
                      <span className="font-semibold" style={{ color: '#0f172a' }}>
                        {students.length}
                      </span>{' '}
                      prospect{students.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className={LABEL_CLS}>State</label>
                    <input
                      type="text"
                      className={INPUT_CLS}
                      placeholder="e.g. CA, Texas"
                      value={filters.state}
                      onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && runSearch(filters)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Graduation Year</label>
                    <select
                      className={INPUT_CLS}
                      value={filters.gradYear}
                      onChange={(e) => setFilters((f) => ({ ...f, gradYear: e.target.value }))}
                    >
                      <option value="">Any</option>
                      {GRAD_YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Position</label>
                    <select
                      className={INPUT_CLS}
                      value={filters.position}
                      onChange={(e) => setFilters((f) => ({ ...f, position: e.target.value }))}
                    >
                      <option value="">Any</option>
                      {POSITIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Min GPA</label>
                    <select
                      className={INPUT_CLS}
                      value={filters.minGpa}
                      onChange={(e) => setFilters((f) => ({ ...f, minGpa: e.target.value }))}
                    >
                      {GPA_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Bats</label>
                    <select
                      className={INPUT_CLS}
                      value={filters.bats}
                      onChange={(e) => setFilters((f) => ({ ...f, bats: e.target.value }))}
                    >
                      <option value="">Any</option>
                      <option value="Right">Right</option>
                      <option value="Left">Left</option>
                      <option value="Switch">Switch</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Throws</label>
                    <select
                      className={INPUT_CLS}
                      value={filters.throws}
                      onChange={(e) => setFilters((f) => ({ ...f, throws: e.target.value }))}
                    >
                      <option value="">Any</option>
                      <option value="Right">Right</option>
                      <option value="Left">Left</option>
                    </select>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  type="button"
                  onClick={() => runSearch(filters)}
                  disabled={searching}
                  className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                  style={{ backgroundColor: '#d93025' }}
                  onMouseEnter={(e) =>
                    !searching && ((e.currentTarget.style.backgroundColor = '#b91c1c'))
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget.style.backgroundColor = '#d93025'))
                  }
                >
                  {searching ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Search Prospects
                </button>

                {/* Results */}
                {(searched || searching) && (
                  <div className="mt-5 border-t border-gray-100 pt-4">
                    {searching ? (
                      <div className="flex justify-center py-8">
                        <div
                          className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                          style={{ borderColor: '#d93025', borderTopColor: 'transparent' }}
                        />
                      </div>
                    ) : students.length === 0 ? (
                      <p className="text-sm text-center py-6" style={{ color: '#64748b' }}>
                        No prospects found matching your filters.
                      </p>
                    ) : (
                      <div className="max-h-[480px] overflow-y-auto -mx-1 px-1">
                        {students.map((student) => {
                          const pitcher = student.primary_position === 'P'
                          const initials = getInitials(student.full_name)
                          return (
                            <div
                              key={student.id}
                              className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
                            >
                              {/* Avatar */}
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden"
                                style={{ backgroundColor: '#d93025' }}
                              >
                                {student.photo_url ? (
                                  <img
                                    src={student.photo_url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  initials
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className="font-semibold text-sm"
                                    style={{ color: '#0f172a' }}
                                  >
                                    {student.full_name ?? '—'}
                                  </span>
                                  {student.primary_position && (
                                    <span
                                      className="text-xs rounded px-1.5 py-0.5 font-medium shrink-0"
                                      style={{
                                        backgroundColor: '#F2F3F3',
                                        color: '#0f172a',
                                      }}
                                    >
                                      {student.primary_position}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs truncate mt-0.5" style={{ color: '#64748b' }}>
                                  {[student.high_school, student.state].filter(Boolean).join(', ') ||
                                    '—'}
                                </p>
                                {/* Stats row — hidden on mobile */}
                                <div
                                  className="hidden sm:flex items-center gap-3 mt-1 flex-wrap"
                                  style={{ color: '#64748b' }}
                                >
                                  {student.graduation_year && (
                                    <span className="text-xs">
                                      <span
                                        className="font-medium"
                                        style={{ color: '#0f172a' }}
                                      >
                                        {student.graduation_year}
                                      </span>{' '}
                                      Grad
                                    </span>
                                  )}
                                  {student.gpa != null && (
                                    <span className="text-xs">
                                      GPA{' '}
                                      <span className="font-medium" style={{ color: '#0f172a' }}>
                                        {student.gpa}
                                      </span>
                                    </span>
                                  )}
                                  {pitcher ? (
                                    <>
                                      {student.stat_era && (
                                        <span className="text-xs">
                                          ERA{' '}
                                          <span
                                            className="font-medium"
                                            style={{ color: '#0f172a' }}
                                          >
                                            {student.stat_era}
                                          </span>
                                        </span>
                                      )}
                                      {student.stat_whip && (
                                        <span className="text-xs">
                                          WHIP{' '}
                                          <span
                                            className="font-medium"
                                            style={{ color: '#0f172a' }}
                                          >
                                            {student.stat_whip}
                                          </span>
                                        </span>
                                      )}
                                      {student.stat_velo && (
                                        <span className="text-xs">
                                          Velo{' '}
                                          <span
                                            className="font-medium"
                                            style={{ color: '#0f172a' }}
                                          >
                                            {student.stat_velo}
                                          </span>
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      {student.stat_avg && (
                                        <span className="text-xs">
                                          AVG{' '}
                                          <span
                                            className="font-medium"
                                            style={{ color: '#0f172a' }}
                                          >
                                            {student.stat_avg}
                                          </span>
                                        </span>
                                      )}
                                      {student.stat_hr && (
                                        <span className="text-xs">
                                          HR{' '}
                                          <span
                                            className="font-medium"
                                            style={{ color: '#0f172a' }}
                                          >
                                            {student.stat_hr}
                                          </span>
                                        </span>
                                      )}
                                      {student.stat_rbi && (
                                        <span className="text-xs">
                                          RBI{' '}
                                          <span
                                            className="font-medium"
                                            style={{ color: '#0f172a' }}
                                          >
                                            {student.stat_rbi}
                                          </span>
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  title="Add to watchlist"
                                  className="p-1.5 rounded-lg transition-colors text-[#64748b] hover:text-[#d93025] hover:bg-red-50"
                                >
                                  <Heart className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  title="View profile"
                                  className="p-1.5 rounded-lg transition-colors text-[#64748b] hover:text-[#d93025] hover:bg-red-50"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  title="Message (coming soon)"
                                  className="hidden sm:block p-1.5 rounded-lg transition-colors text-[#64748b] hover:bg-gray-100"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Watchlist Tab */}
            {activeTab === 'watchlist' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold mb-5" style={{ color: '#0f172a' }}>
                  Watchlist
                </h3>
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Star className="w-10 h-10" style={{ color: '#d1d5db' }} />
                  <p className="text-sm text-center" style={{ color: '#64748b' }}>
                    Saved prospects will appear here.
                  </p>
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold mb-5" style={{ color: '#0f172a' }}>
                  Messages
                </h3>
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <MessageSquare className="w-10 h-10" style={{ color: '#d1d5db' }} />
                  <p className="text-sm text-center" style={{ color: '#64748b' }}>
                    Coach messaging will appear here in a future release.
                  </p>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold mb-5" style={{ color: '#0f172a' }}>
                  Notifications
                </h3>
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Bell className="w-10 h-10" style={{ color: '#d1d5db' }} />
                  <p className="text-sm text-center" style={{ color: '#64748b' }}>
                    Recruiting alerts and account updates will appear here.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
