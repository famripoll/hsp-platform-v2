'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import {
  Bell,
  Eye,
  GraduationCap,
  Heart,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Star,
} from 'lucide-react'

type Coach = {
  id?: string
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
  profile_id: string | null
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
  stat_obp: string | null
  stat_hr: string | null
  stat_rbi: string | null
  stat_sb: string | null
  stat_era: string | null
  stat_whip: string | null
  stat_velo: string | null
  stat_k: string | null
  subscription_status: string | null
}

type Filters = {
  state: string
  gradYear: string
  position: string
  minGpa: string
  bats: string
  throws: string
  videoAvailable: string
}

type AdvancedFilters = {
  minVelo: string
  maxWhip: string
  maxEra: string
  minK: string
  minAvg: string
  minObp: string
  minHr: string
  minRbi: string
  minSb: string
}

const POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH']
const GRAD_YEARS = ['2025', '2026', '2027', '2028']
const GPA_OPTIONS = [
  { label: 'Any', value: '' },
  { label: '2.0+', value: '2.0' },
  { label: '2.5+', value: '2.5' },
  { label: '3.0+', value: '3.0' },
  { label: '3.5+', value: '3.5' },
]

// Only safe, non-private columns — never include contact/social/family fields
const SAFE_SELECT =
  'id, profile_id, full_name, high_school, city, state, graduation_year, grade, gpa, primary_position, secondary_position, bats, throws, photo_url, stat_avg, stat_obp, stat_hr, stat_rbi, stat_sb, stat_era, stat_whip, stat_velo, stat_k, subscription_status'

const EMPTY_FILTERS: Filters = {
  state: '',
  gradYear: '',
  position: '',
  minGpa: '',
  bats: '',
  throws: '',
  videoAvailable: '',
}

const EMPTY_ADVANCED: AdvancedFilters = {
  minVelo: '',
  maxWhip: '',
  maxEra: '',
  minK: '',
  minAvg: '',
  minObp: '',
  minHr: '',
  minRbi: '',
  minSb: '',
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

// Resolves signed photo URLs + which of these students have video in student_media —
// shared by runSearch (full result set) and fetchWatchlistStudents (watchlist subset)
async function resolvePhotosAndVideo(
  supabase: ReturnType<typeof createClient>,
  results: ProspectStudent[]
): Promise<{ photoMap: Record<string, string>; videoIds: Set<string> }> {
  const photoEntries = await Promise.all(
    results
      .filter((s) => s.photo_url)
      .map(async (s) => {
        const path = s.photo_url!
        if (path.startsWith('http')) return [s.id, path] as const
        const { data: urlData } = await supabase.storage
          .from('profile-photos')
          .createSignedUrl(path, 3600)
        return [s.id, urlData?.signedUrl ?? ''] as const
      })
  )
  const photoMap: Record<string, string> = {}
  for (const [id, url] of photoEntries) {
    if (url) photoMap[id] = url
  }

  const profileIds = results
    .map((s) => s.profile_id)
    .filter((id): id is string => Boolean(id))

  let videoIds = new Set<string>()
  if (profileIds.length > 0) {
    const { data: mediaRows } = await supabase
      .from('student_media')
      .select('profile_id')
      .in('profile_id', profileIds)
    videoIds = new Set(
      ((mediaRows ?? []) as { profile_id: string | null }[])
        .map((m) => m.profile_id)
        .filter((id): id is string => Boolean(id))
    )
  }

  return { photoMap, videoIds }
}

// Shared prospect row — used by both Prospect Search results and Watchlist results
function ProspectCard({
  student,
  photoUrl,
  hasVideo,
  isSaved,
  onToggleWatchlist,
}: {
  student: ProspectStudent
  photoUrl?: string
  hasVideo: boolean
  isSaved: boolean
  onToggleWatchlist: (studentId: string) => void
}) {
  const pitcher = student.primary_position === 'P'
  const initials = getInitials(student.full_name)
  const isPaid = student.subscription_status === 'paid'

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      {/* Avatar */}
      {photoUrl ? (
        <img
          src={photoUrl}
          alt=""
          className="w-9 h-9 rounded-full object-cover shrink-0"
        />
      ) : (
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
          style={{ backgroundColor: '#d93025' }}
        >
          {initials}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Name + position */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-bold text-sm"
            style={{ color: '#0f172a' }}
          >
            {student.full_name ?? '—'}
          </span>
          {student.primary_position && (
            <span
              className="text-xs rounded px-1.5 py-0.5 font-medium shrink-0"
              style={{ backgroundColor: '#F2F3F3', color: '#0f172a' }}
            >
              {student.primary_position}
            </span>
          )}
        </div>

        {/* School, state, grad year */}
        {isPaid ? (
          <p
            className="text-xs truncate mt-0.5"
            style={{ color: '#64748b' }}
          >
            {[
              student.high_school,
              student.state,
              student.graduation_year
                ? `'${student.graduation_year.slice(-2)}`
                : null,
            ]
              .filter(Boolean)
              .join(', ') || '—'}
          </p>
        ) : (
          <p className="flex items-center gap-1 text-xs text-[#64748b] mt-0.5">
            <Lock className="w-3 h-3 shrink-0" />
            School locked by student
          </p>
        )}

        {/* GPA badge + media badges */}
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {isPaid ? (
            student.gpa != null && (
              <span
                className="text-[10px] rounded-full px-2 py-0.5 font-semibold"
                style={{ backgroundColor: '#dcfce7', color: '#166534' }}
              >
                GPA {student.gpa}
              </span>
            )
          ) : (
            <span
              className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 font-medium"
              style={{ backgroundColor: '#F2F3F3', color: '#64748b' }}
            >
              <Lock className="w-2.5 h-2.5" />
              Locked
            </span>
          )}
          {hasVideo && (
            <span
              className="text-[10px] rounded-full px-2 py-0.5 font-medium"
              style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}
            >
              📹 Video
            </span>
          )}
          {student.photo_url && (
            <span
              className="text-[10px] rounded-full px-2 py-0.5 font-medium"
              style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}
            >
              📷 Photo
            </span>
          )}
        </div>

        {/* Stats row — hidden on mobile */}
        {!isPaid ? (
          <p className="hidden sm:flex items-center gap-1 text-xs text-[#64748b] mt-1">
            <Lock className="w-3 h-3 shrink-0" />
            Stats locked by student
          </p>
        ) : (
        <div
          className="hidden sm:flex items-center gap-0 mt-1 text-xs flex-wrap"
          style={{ color: '#64748b' }}
        >
          {pitcher ? (
            <>
              {student.stat_velo && (
                <span>
                  FB{' '}
                  <span
                    className="font-medium"
                    style={{ color: '#0f172a' }}
                  >
                    {student.stat_velo}
                  </span>{' '}
                  mph
                </span>
              )}
              {student.stat_whip && (
                <span>
                  {student.stat_velo && (
                    <span className="mx-1.5">·</span>
                  )}
                  WHIP{' '}
                  <span
                    className="font-medium"
                    style={{ color: '#0f172a' }}
                  >
                    {student.stat_whip}
                  </span>
                </span>
              )}
              {student.stat_era && (
                <span>
                  {(student.stat_velo || student.stat_whip) && (
                    <span className="mx-1.5">·</span>
                  )}
                  ERA{' '}
                  <span
                    className="font-medium"
                    style={{ color: '#0f172a' }}
                  >
                    {student.stat_era}
                  </span>
                </span>
              )}
              {student.stat_k && (
                <span>
                  {(student.stat_velo ||
                    student.stat_whip ||
                    student.stat_era) && (
                    <span className="mx-1.5">·</span>
                  )}
                  K{' '}
                  <span
                    className="font-medium"
                    style={{ color: '#0f172a' }}
                  >
                    {student.stat_k}
                  </span>
                </span>
              )}
            </>
          ) : (
            <>
              {student.stat_avg && (
                <span>
                  AVG{' '}
                  <span
                    className="font-medium"
                    style={{ color: '#0f172a' }}
                  >
                    {student.stat_avg}
                  </span>
                </span>
              )}
              {student.stat_obp && (
                <span>
                  {student.stat_avg && (
                    <span className="mx-1.5">·</span>
                  )}
                  OBP{' '}
                  <span
                    className="font-medium"
                    style={{ color: '#0f172a' }}
                  >
                    {student.stat_obp}
                  </span>
                </span>
              )}
              {student.stat_hr && (
                <span>
                  {(student.stat_avg || student.stat_obp) && (
                    <span className="mx-1.5">·</span>
                  )}
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
                <span>
                  {(student.stat_avg ||
                    student.stat_obp ||
                    student.stat_hr) && (
                    <span className="mx-1.5">·</span>
                  )}
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
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => onToggleWatchlist(student.id)}
          title={isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
          className="p-1.5 rounded-lg transition-colors text-[#64748b] hover:text-[#d93025] hover:bg-red-50"
        >
          <Heart
            className="w-4 h-4"
            {...(isSaved ? { fill: '#d93025', stroke: '#d93025' } : {})}
          />
        </button>
        {isPaid ? (
          <Link
            href={`/dashboard/coach/student/${student.id}`}
            title="View profile"
            className="p-1.5 rounded-lg transition-colors text-[#64748b] hover:text-[#d93025] hover:bg-red-50"
          >
            <Eye className="w-4 h-4" />
          </Link>
        ) : (
          <button
            type="button"
            title="Upgrade required to view profile"
            disabled
            className="p-1.5 rounded-lg text-[#64748b] opacity-40 cursor-not-allowed"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
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
}

export default function CoachDashboardPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [authLoading, setAuthLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [coach, setCoach] = useState<Coach>({})
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(EMPTY_ADVANCED)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [students, setStudents] = useState<ProspectStudent[]>([])
  const [videoProfileIds, setVideoProfileIds] = useState<Set<string>>(new Set())
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [activeTab, setActiveTab] = useState<CoachTabValue>('prospects')
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({})
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set())
  const [watchlistStudents, setWatchlistStudents] = useState<ProspectStudent[]>([])
  const [watchlistLoading, setWatchlistLoading] = useState(false)

  const runSearch = useCallback(
    async (activeFilters: Filters, activeAdvanced: AdvancedFilters) => {
      setSearching(true)

      // Video filter: pre-fetch profile_ids that have at least one media record
      let videoIds: string[] | null = null
      if (activeFilters.videoAvailable === 'Yes') {
        const { data: mediaData } = await supabase
          .from('student_media')
          .select('profile_id')
        videoIds = ((mediaData ?? []) as { profile_id: string | null }[])
          .map((m) => m.profile_id)
          .filter((id): id is string => Boolean(id))
        if (videoIds.length === 0) {
          setStudents([])
          setVideoProfileIds(new Set())
          setSearched(true)
          setSearching(false)
          return
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = supabase
        .from('students')
        .select(`${SAFE_SELECT}, profiles!inner(status)`)
        .eq('profiles.status', 'active')
        .order('full_name', { ascending: true })
        .limit(200)

      if (activeFilters.state) q = q.eq('state', activeFilters.state)
      if (activeFilters.gradYear) q = q.eq('graduation_year', activeFilters.gradYear)
      if (activeFilters.position) q = q.eq('primary_position', activeFilters.position)
      if (activeFilters.minGpa) q = q.gte('gpa', parseFloat(activeFilters.minGpa))
      if (activeFilters.bats) q = q.eq('bats', activeFilters.bats)
      if (activeFilters.throws) q = q.eq('throws', activeFilters.throws)
      if (videoIds !== null) q = q.in('profile_id', videoIds)

      // Advanced filters — pitcher
      if (activeFilters.position === 'P') {
        if (activeAdvanced.minVelo) q = q.gte('stat_velo', parseFloat(activeAdvanced.minVelo))
        if (activeAdvanced.maxWhip) q = q.lte('stat_whip', parseFloat(activeAdvanced.maxWhip))
        if (activeAdvanced.maxEra) q = q.lte('stat_era', parseFloat(activeAdvanced.maxEra))
        if (activeAdvanced.minK) q = q.gte('stat_k', parseInt(activeAdvanced.minK))
      } else {
        if (activeAdvanced.minAvg) q = q.gte('stat_avg', parseFloat(activeAdvanced.minAvg))
        if (activeAdvanced.minObp) q = q.gte('stat_obp', parseFloat(activeAdvanced.minObp))
        if (activeAdvanced.minHr) q = q.gte('stat_hr', parseInt(activeAdvanced.minHr))
        if (activeAdvanced.minRbi) q = q.gte('stat_rbi', parseInt(activeAdvanced.minRbi))
        if (activeAdvanced.minSb) q = q.gte('stat_sb', parseInt(activeAdvanced.minSb))
      }

      const { data } = await q
      const results: ProspectStudent[] = data ?? []
      setStudents(results)

      const { photoMap, videoIds: videoProfileIdSet } = await resolvePhotosAndVideo(supabase, results)
      setPhotoUrls(photoMap)
      setVideoProfileIds(videoProfileIdSet)

      setSearched(true)
      setSearching(false)
    },
    [supabase]
  )

  async function toggleWatchlist(studentId: string) {
    if (!coach.id) return
    const isSaved = watchlistIds.has(studentId)
    if (isSaved) {
      await supabase.from('coach_watchlist').delete().eq('coach_id', coach.id).eq('student_id', studentId)
      setWatchlistIds((prev) => {
        const next = new Set(prev)
        next.delete(studentId)
        return next
      })
    } else {
      await supabase.from('coach_watchlist').insert({ coach_id: coach.id, student_id: studentId })
      setWatchlistIds((prev) => new Set(prev).add(studentId))
    }
  }

  const fetchWatchlistStudents = useCallback(async () => {
    if (watchlistIds.size === 0) {
      setWatchlistStudents([])
      return
    }
    setWatchlistLoading(true)
    const { data } = await supabase
      .from('students')
      .select(`${SAFE_SELECT}, profiles!inner(status)`)
      .eq('profiles.status', 'active')
      .in('id', Array.from(watchlistIds))
    const results: ProspectStudent[] = data ?? []
    setWatchlistStudents(results)

    const { photoMap, videoIds } = await resolvePhotosAndVideo(supabase, results)
    setPhotoUrls((prev) => ({ ...prev, ...photoMap }))
    setVideoProfileIds((prev) => new Set([...prev, ...videoIds]))

    setWatchlistLoading(false)
  }, [supabase, watchlistIds])

  useEffect(() => {
    if (activeTab === 'watchlist') {
      fetchWatchlistStudents()
    }
  }, [activeTab, fetchWatchlistStudents])

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
        .select('id, university, division, state, phone, verified')
        .eq('profile_id', user.id)
        .single()

      setCoach(coachData ?? {})

      if (coachData?.id) {
        const { data: watchlistData } = await supabase
          .from('coach_watchlist')
          .select('student_id')
          .eq('coach_id', coachData.id)
        setWatchlistIds(new Set((watchlistData ?? []).map((w) => w.student_id)))
      }

      setAuthLoading(false)

      await runSearch(EMPTY_FILTERS, EMPTY_ADVANCED)
    }
    init()
  }, [router, supabase, runSearch])

  const isVerified = coach.verified === true
  const isPitcherFilter = filters.position === 'P'

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#d93025] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
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

            {/* ── PROSPECT SEARCH TAB ── */}
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

                {/* Filters Row 1: State, Grad Year, Position */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className={LABEL_CLS}>State</label>
                    <select
                      className={INPUT_CLS}
                      value={filters.state}
                      onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))}
                    >
                      <option value="">Any State / Region</option>
                      <optgroup label="United States — States">
                        {['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </optgroup>
                      <optgroup label="U.S. Territories">
                        {['Puerto Rico','Guam','U.S. Virgin Islands','American Samoa','Northern Mariana Islands'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Caribbean">
                        {['Antigua and Barbuda','Bahamas','Barbados','Cuba','Dominica','Dominican Republic','Grenada','Haiti','Jamaica','Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Trinidad and Tobago'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Central America">
                        {['Belize','Costa Rica','El Salvador','Guatemala','Honduras','Mexico','Nicaragua','Panama'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </optgroup>
                      <optgroup label="South America">
                        {['Argentina','Bolivia','Brazil','Chile','Colombia','Ecuador','Guyana','Paraguay','Peru','Suriname','Uruguay','Venezuela'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </optgroup>
                      <optgroup label="North America">
                        <option value="Canada">Canada</option>
                      </optgroup>
                    </select>
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
                </div>

                {/* Filters Row 2: Min GPA, Bats, Throws, Video Available */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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
                  <div>
                    <label className={LABEL_CLS}>Video Available</label>
                    <select
                      className={INPUT_CLS}
                      value={filters.videoAvailable}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, videoAvailable: e.target.value }))
                      }
                    >
                      <option value="">Any</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>

                {/* Advanced Filters — collapsible */}
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="text-xs font-medium transition-colors"
                    style={{ color: '#64748b' }}
                  >
                    Advanced Filters {showAdvanced ? '▲' : '▼'}
                  </button>

                  {showAdvanced && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {isPitcherFilter ? (
                        <>
                          <div>
                            <label className={LABEL_CLS}>Min Fastball Velocity</label>
                            <input
                              type="number"
                              className={INPUT_CLS}
                              placeholder="e.g. 80"
                              value={advancedFilters.minVelo}
                              onChange={(e) =>
                                setAdvancedFilters((f) => ({ ...f, minVelo: e.target.value }))
                              }
                            />
                          </div>
                          <div>
                            <label className={LABEL_CLS}>Max WHIP</label>
                            <input
                              type="number"
                              className={INPUT_CLS}
                              placeholder="e.g. 1.50"
                              value={advancedFilters.maxWhip}
                              onChange={(e) =>
                                setAdvancedFilters((f) => ({ ...f, maxWhip: e.target.value }))
                              }
                            />
                          </div>
                          <div>
                            <label className={LABEL_CLS}>Max ERA</label>
                            <input
                              type="number"
                              className={INPUT_CLS}
                              placeholder="e.g. 3.00"
                              value={advancedFilters.maxEra}
                              onChange={(e) =>
                                setAdvancedFilters((f) => ({ ...f, maxEra: e.target.value }))
                              }
                            />
                          </div>
                          <div>
                            <label className={LABEL_CLS}>Min Strikeouts</label>
                            <input
                              type="number"
                              className={INPUT_CLS}
                              placeholder="e.g. 20"
                              value={advancedFilters.minK}
                              onChange={(e) =>
                                setAdvancedFilters((f) => ({ ...f, minK: e.target.value }))
                              }
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className={LABEL_CLS}>Min AVG</label>
                            <input
                              type="number"
                              className={INPUT_CLS}
                              placeholder="e.g. .280"
                              value={advancedFilters.minAvg}
                              onChange={(e) =>
                                setAdvancedFilters((f) => ({ ...f, minAvg: e.target.value }))
                              }
                            />
                          </div>
                          <div>
                            <label className={LABEL_CLS}>Min OBP</label>
                            <input
                              type="number"
                              className={INPUT_CLS}
                              placeholder="e.g. .350"
                              value={advancedFilters.minObp}
                              onChange={(e) =>
                                setAdvancedFilters((f) => ({ ...f, minObp: e.target.value }))
                              }
                            />
                          </div>
                          <div>
                            <label className={LABEL_CLS}>Min HR</label>
                            <input
                              type="number"
                              className={INPUT_CLS}
                              placeholder="e.g. 5"
                              value={advancedFilters.minHr}
                              onChange={(e) =>
                                setAdvancedFilters((f) => ({ ...f, minHr: e.target.value }))
                              }
                            />
                          </div>
                          <div>
                            <label className={LABEL_CLS}>Min RBI</label>
                            <input
                              type="number"
                              className={INPUT_CLS}
                              placeholder="e.g. 15"
                              value={advancedFilters.minRbi}
                              onChange={(e) =>
                                setAdvancedFilters((f) => ({ ...f, minRbi: e.target.value }))
                              }
                            />
                          </div>
                          <div>
                            <label className={LABEL_CLS}>Min SB</label>
                            <input
                              type="number"
                              className={INPUT_CLS}
                              placeholder="e.g. 5"
                              value={advancedFilters.minSb}
                              onChange={(e) =>
                                setAdvancedFilters((f) => ({ ...f, minSb: e.target.value }))
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <button
                  type="button"
                  onClick={() => runSearch(filters, advancedFilters)}
                  disabled={searching}
                  className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                  style={{ backgroundColor: '#d93025' }}
                  onMouseEnter={(e) =>
                    !searching && ((e.currentTarget.style.backgroundColor = '#b91c1c'))
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d93025')}
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
                        No prospects found.
                      </p>
                    ) : (
                      <div className="max-h-[520px] overflow-y-auto -mx-1 px-1">
                        {students.map((student) => (
                          <ProspectCard
                            key={student.id}
                            student={student}
                            photoUrl={photoUrls[student.id]}
                            hasVideo={student.profile_id ? videoProfileIds.has(student.profile_id) : false}
                            isSaved={watchlistIds.has(student.id)}
                            onToggleWatchlist={toggleWatchlist}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── WATCHLIST TAB ── */}
            {activeTab === 'watchlist' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold mb-5" style={{ color: '#0f172a' }}>
                  Watchlist
                </h3>
                {watchlistLoading ? (
                  <p className="text-sm text-center py-6" style={{ color: '#64748b' }}>
                    Loading...
                  </p>
                ) : watchlistStudents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Star className="w-10 h-10" style={{ color: '#d1d5db' }} />
                    <p className="text-sm text-center" style={{ color: '#64748b' }}>
                      No saved prospects yet — use the heart icon in Prospect Search to save students here.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[520px] overflow-y-auto -mx-1 px-1">
                    {watchlistStudents.map((student) => (
                      <ProspectCard
                        key={student.id}
                        student={student}
                        photoUrl={photoUrls[student.id]}
                        hasVideo={student.profile_id ? videoProfileIds.has(student.profile_id) : false}
                        isSaved={watchlistIds.has(student.id)}
                        onToggleWatchlist={toggleWatchlist}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── MESSAGES TAB ── */}
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

            {/* ── NOTIFICATIONS TAB ── */}
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
