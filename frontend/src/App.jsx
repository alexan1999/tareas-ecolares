
import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { apiFetch } from './lib/api'

const weekDays = [
  { value: 'Lun', label: 'Lunes' },
  { value: 'Mar', label: 'Martes' },
  { value: 'Mie', label: 'Miercoles' },
  { value: 'Jue', label: 'Jueves' },
  { value: 'Vie', label: 'Viernes' },
]

const palette = [
  '#FF6B6B',
  '#FF9F1C',
  '#2EC4B6',
  '#6A4C93',
  '#1B9AAA',
  '#F72585',
  '#4361EE',
  '#06D6A0',
]

function toLocalDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toDateKey(value) {
  if (!value) return ''
  if (value instanceof Date) return toLocalDateKey(value)
  return String(value).slice(0, 10)
}

function toMinutes(value) {
  if (!value) return null
  const parts = String(value).slice(0, 5).split(':')
  if (parts.length !== 2) return null
  const hours = Number(parts[0])
  const minutes = Number(parts[1])
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return hours * 60 + minutes
}

function formatHour(value) {
  if (!value) return ''
  return String(value).slice(0, 5)
}

function getTareaStatus(tarea) {
  const todayKey = toDateKey(new Date())
  const completada = tarea.completada === true || tarea.completada === 'true'
  if (completada) return 'completada'
  const due = toDateKey(tarea.fecha_entrega)
  if (due && due < todayKey) return 'vencida'
  return 'pendiente'
}

function buildCalendarDays(year, month) {
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []

  for (let i = 0; i < startOffset; i += 1) {
    days.push(null)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(year, month, day))
  }

  while (days.length % 7 !== 0) {
    days.push(null)
  }

  return days
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })
  const [view, setView] = useState('dashboard')
  const [authMode, setAuthMode] = useState('login')

  const [banner, setBanner] = useState(null)
  const [loading, setLoading] = useState(false)

  const [periodos, setPeriodos] = useState([])
  const [materias, setMaterias] = useState([])
  const [tareas, setTareas] = useState([])
  const [horarios, setHorarios] = useState([])

  const [selectedPeriodId, setSelectedPeriodId] = useState('all')
  const [showOnlyPending, setShowOnlyPending] = useState(false)

  const today = new Date()
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth())
  const [calendarYear, setCalendarYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState(toLocalDateKey(today))

  const [loginForm, setLoginForm] = useState({ correo: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    nombre: '',
    correo: '',
    password: '',
  })

  const [periodoForm, setPeriodoForm] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
  })
  const [editingPeriodoId, setEditingPeriodoId] = useState(null)

  const [materiaForm, setMateriaForm] = useState({
    nombre: '',
    profesor: '',
    id_periodo: '',
  })
  const [editingMateriaId, setEditingMateriaId] = useState(null)

  const [tareaForm, setTareaForm] = useState({
    titulo: '',
    descripcion: '',
    hora_entrega: '',
    fecha_entrega: '',
    id_materia: '',
  })
  const [editingTareaId, setEditingTareaId] = useState(null)
  const [tareaFilters, setTareaFilters] = useState({
    search: '',
    status: 'all',
    materiaId: 'all',
    from: '',
    to: '',
  })

  const [horarioForm, setHorarioForm] = useState({
    dia_semana: 'Lun',
    hora_inicio: '',
    hora_fin: '',
    id_materia: '',
  })
  const [editingHorarioId, setEditingHorarioId] = useState(null)

  const api = (path, options) => apiFetch(path, { ...options, token })

  const notify = (type, text) => {
    setBanner({ type, text })
    window.setTimeout(() => setBanner(null), 3500)
  }

  const validatePeriodo = () => {
    if (!periodoForm.fecha_inicio || !periodoForm.fecha_fin) return true
    if (periodoForm.fecha_inicio > periodoForm.fecha_fin) {
      notify('error', 'La fecha de inicio no puede ser mayor a la fecha fin')
      return false
    }
    return true
  }

  const validateHorario = () => {
    if (!horarioForm.hora_inicio || !horarioForm.hora_fin) return true
    if (horarioForm.hora_inicio >= horarioForm.hora_fin) {
      notify('error', 'La hora de inicio debe ser menor a la hora fin')
      return false
    }
    return true
  }

  useEffect(() => {
    if (!token) return
    loadAll()
  }, [token])

  const materiaById = useMemo(() => {
    const map = new Map()
    materias.forEach((materia) => {
      map.set(materia.id_materia, materia)
    })
    return map
  }, [materias])

  const tareasEnriquecidas = useMemo(() => {
    return tareas.map((tarea) => {
      const materia = materiaById.get(tarea.id_materia)
      return {
        ...tarea,
        materiaNombre: materia?.nombre || tarea.materia || 'Sin materia',
        id_periodo: materia?.id_periodo,
        descripcion_limpia: tarea.descripcion,
      }
    })
  }, [tareas, materiaById])

  const activePeriodId =
    selectedPeriodId === 'all' ? null : Number(selectedPeriodId)

  const visibleMaterias = useMemo(() => {
    if (!activePeriodId) return materias
    return materias.filter((materia) => materia.id_periodo === activePeriodId)
  }, [materias, activePeriodId])

  const visibleTareas = useMemo(() => {
    if (!activePeriodId) return tareasEnriquecidas
    return tareasEnriquecidas.filter(
      (tarea) => tarea.id_periodo === activePeriodId
    )
  }, [tareasEnriquecidas, activePeriodId])

  const filteredTareas = useMemo(() => {
    let result = [...visibleTareas]
    const todayKey = toDateKey(new Date())

    if (tareaFilters.search.trim()) {
      const term = tareaFilters.search.toLowerCase()
      result = result.filter((tarea) => {
        const haystack = [
          tarea.titulo,
          tarea.descripcion_limpia || tarea.descripcion,
          tarea.materiaNombre,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(term)
      })
    }

    if (tareaFilters.materiaId !== 'all') {
      const materiaId = Number(tareaFilters.materiaId)
      result = result.filter((tarea) => tarea.id_materia === materiaId)
    }

    if (tareaFilters.from) {
      result = result.filter(
        (tarea) => toDateKey(tarea.fecha_entrega) >= tareaFilters.from
      )
    }

    if (tareaFilters.to) {
      result = result.filter(
        (tarea) => toDateKey(tarea.fecha_entrega) <= tareaFilters.to
      )
    }

    if (tareaFilters.status !== 'all') {
      result = result.filter((tarea) => {
        const due = toDateKey(tarea.fecha_entrega)
        const completada = tarea.completada === true || tarea.completada === 'true'
        if (tareaFilters.status === 'completada') return completada
        if (tareaFilters.status === 'pendiente') {
          return !completada && (!due || due >= todayKey)
        }
        if (tareaFilters.status === 'vencida') {
          return !completada && due && due < todayKey
        }
        return true
      })
    }

    return result
  }, [visibleTareas, tareaFilters])

  const groupedTareas = useMemo(() => {
    const groups = new Map()
    filteredTareas.forEach((tarea) => {
      const key = toDateKey(tarea.fecha_entrega) || 'Sin fecha'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(tarea)
    })
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredTareas])

  const visibleHorarios = useMemo(() => {
    if (!activePeriodId) return horarios
    return horarios.filter((horario) => horario.id_periodo === activePeriodId)
  }, [horarios, activePeriodId])

  const tasksByDate = useMemo(() => {
    const map = new Map()
    visibleTareas.forEach((tarea) => {
      const key = toDateKey(tarea.fecha_entrega)
      if (!key) return
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(tarea)
    })
    return map
  }, [visibleTareas])

  const calendarDays = useMemo(
    () => buildCalendarDays(calendarYear, calendarMonth),
    [calendarYear, calendarMonth]
  )

  const selectedDateTasks = tasksByDate.get(selectedDate) || []

  const agendaTasks = useMemo(() => {
    const base = selectedDateTasks.slice()
    const filtered = showOnlyPending
      ? base.filter((tarea) => getTareaStatus(tarea) === 'pendiente')
      : base
    return filtered.sort((a, b) => {
      const aTime = toMinutes(a.hora_entrega) ?? 9999
      const bTime = toMinutes(b.hora_entrega) ?? 9999
      return aTime - bTime
    })
  }, [selectedDateTasks, showOnlyPending])

  const stats = useMemo(() => {
    const todayKey = toDateKey(new Date())
    let total = 0
    let completadas = 0
    let pendientes = 0
    let vencidas = 0

    visibleTareas.forEach((tarea) => {
      total += 1
      const completada = tarea.completada === true || tarea.completada === 'true'
      if (completada) {
        completadas += 1
      } else {
        const due = toDateKey(tarea.fecha_entrega)
        if (due && due < todayKey) {
          vencidas += 1
        } else {
          pendientes += 1
        }
      }
    })

    return { total, completadas, pendientes, vencidas }
  }, [visibleTareas])

  const materiaStats = useMemo(() => {
    const map = new Map()
    visibleTareas.forEach((tarea) => {
      const id = tarea.id_materia
      if (!map.has(id)) {
        map.set(id, { total: 0, completadas: 0, pendientes: 0, vencidas: 0 })
      }
      const stat = map.get(id)
      stat.total += 1
      const status = getTareaStatus(tarea)
      if (status === 'completada') stat.completadas += 1
      if (status === 'pendiente') stat.pendientes += 1
      if (status === 'vencida') stat.vencidas += 1
    })
    return map
  }, [visibleTareas])

  const colorForMateria = (id) => {
    if (!id) return palette[0]
    const index = Math.abs(Number(id)) % palette.length
    return palette[index]
  }

  async function loadAll() {
    setLoading(true)
    try {
      const [periodosData, materiasData, tareasData, horariosData] =
        await Promise.all([
          api('/periodos'),
          api('/materias'),
          api('/tareas'),
          api('/horarios'),
        ])

      setPeriodos(periodosData)
      setMaterias(materiasData)
      setTareas(tareasData)
      setHorarios(horariosData)

      if (
        selectedPeriodId !== 'all' &&
        !periodosData.some(
          (periodo) => periodo.id_periodo === Number(selectedPeriodId)
        )
      ) {
        setSelectedPeriodId('all')
      }
    } catch (error) {
      notify('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: loginForm,
      })
      setToken(data.token)
      setUser(data.usuario)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.usuario))
      notify('success', 'Bienvenido de nuevo')
      setLoginForm({ correo: '', password: '' })
    } catch (error) {
      notify('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: registerForm,
      })
      notify('success', 'Registro exitoso, inicia sesion')
      setRegisterForm({ nombre: '', correo: '', password: '' })
      setAuthMode('login')
    } catch (error) {
      notify('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const handlePeriodoSubmit = async (event) => {
    if (!validatePeriodo()) return
    event.preventDefault()
    setLoading(true)
    try {
      if (editingPeriodoId) {
        await api(`/periodos/${editingPeriodoId}`, {
          method: 'PUT',
          body: periodoForm,
        })
        notify('success', 'Periodo actualizado')
      } else {
        await api('/periodos', { method: 'POST', body: periodoForm })
        notify('success', 'Periodo creado')
      }
      setPeriodoForm({ nombre: '', fecha_inicio: '', fecha_fin: '' })
      setEditingPeriodoId(null)
      await loadAll()
    } catch (error) {
      notify('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodoEdit = (periodo) => {
    setPeriodoForm({
      nombre: periodo.nombre,
      fecha_inicio: periodo.fecha_inicio?.slice(0, 10) || '',
      fecha_fin: periodo.fecha_fin?.slice(0, 10) || '',
    })
    setEditingPeriodoId(periodo.id_periodo)
    setView('periodos')
  }

  const handlePeriodoDelete = async (id) => {
    if (!window.confirm('Eliminar este periodo?')) return
    setLoading(true)
    try {
      await api(`/periodos/${id}`, { method: 'DELETE' })
      notify('success', 'Periodo eliminado')
      await loadAll()
    } catch (error) {
      notify('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMateriaSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const payload = {
        nombre: materiaForm.nombre,
        profesor: materiaForm.profesor,
        id_periodo: Number(materiaForm.id_periodo),
      }
      if (editingMateriaId) {
        await api(`/materias/${editingMateriaId}`, {
          method: 'PUT',
          body: payload,
        })
        notify('success', 'Materia actualizada')
      } else {
        await api('/materias', { method: 'POST', body: payload })
        notify('success', 'Materia creada')
      }
      setMateriaForm({ nombre: '', profesor: '', id_periodo: '' })
      setEditingMateriaId(null)
      await loadAll()
    } catch (error) {
      notify('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMateriaEdit = (materia) => {
    setMateriaForm({
      nombre: materia.nombre,
      profesor: materia.profesor || '',
      id_periodo: String(materia.id_periodo),
    })
    setEditingMateriaId(materia.id_materia)
    setView('materias')
  }

  const handleMateriaDelete = async (id) => {
    if (!window.confirm('Eliminar esta materia?')) return
    setLoading(true)
    try {
      await api(`/materias/${id}`, { method: 'DELETE' })
      notify('success', 'Materia eliminada')
      await loadAll()
    } catch (error) {
      notify('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTareaSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const payload = {
        titulo: tareaForm.titulo,
        descripcion: tareaForm.descripcion,
        hora_entrega: tareaForm.hora_entrega || null,
        fecha_entrega: tareaForm.fecha_entrega,
        id_materia: Number(tareaForm.id_materia),
      }
      if (editingTareaId) {
        await api(`/tareas/${editingTareaId}`, {
          method: 'PUT',
          body: payload,
        })
        notify('success', 'Tarea actualizada')
      } else {
        await api('/tareas', { method: 'POST', body: payload })
        notify('success', 'Tarea creada')
      }
      setTareaForm({
        titulo: '',
        descripcion: '',
        hora_entrega: '',
        fecha_entrega: '',
        id_materia: '',
      })
      setEditingTareaId(null)
      await loadAll()
    } catch (error) {
      notify('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTareaEdit = (tarea) => {
    setTareaForm({
      titulo: tarea.titulo,
      descripcion: tarea.descripcion_limpia || tarea.descripcion || '',
      hora_entrega: tarea.hora_entrega || '',
      fecha_entrega: tarea.fecha_entrega?.slice(0, 10) || '',
      id_materia: String(tarea.id_materia),
    })
    setEditingTareaId(tarea.id_tarea)
    setView('tareas')
  }

  const handleTareaDelete = async (id) => {
    if (!window.confirm('Eliminar esta tarea?')) return
    setLoading(true)
    try {
      await api(`/tareas/${id}`, { method: 'DELETE' })
      notify('success', 'Tarea eliminada')
      await loadAll()
    } catch (error) {
      notify('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTareaCompletar = async (id) => {
    setLoading(true)
    try {
      await api(`/tareas/${id}/completar`, { method: 'PATCH' })
      notify('success', 'Tarea marcada como completada')
      await loadAll()
    } catch (error) {
      notify('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleHorarioSubmit = async (event) => {
    if (!validateHorario()) return
    event.preventDefault()
    setLoading(true)
    try {
      const payload = {
        dia_semana: horarioForm.dia_semana,
        hora_inicio: horarioForm.hora_inicio,
        hora_fin: horarioForm.hora_fin,
        id_materia: Number(horarioForm.id_materia),
      }
      if (editingHorarioId) {
        await api(`/horarios/${editingHorarioId}`, {
          method: 'PUT',
          body: payload,
        })
        notify('success', 'Horario actualizado')
      } else {
        await api('/horarios', { method: 'POST', body: payload })
        notify('success', 'Horario creado')
      }
      setHorarioForm({
        dia_semana: 'Lun',
        hora_inicio: '',
        hora_fin: '',
        id_materia: '',
      })
      setEditingHorarioId(null)
      await loadAll()
    } catch (error) {
      notify('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleHorarioEdit = (horario) => {
    setHorarioForm({
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio?.slice(0, 5) || '',
      hora_fin: horario.hora_fin?.slice(0, 5) || '',
      id_materia: String(horario.id_materia),
    })
    setEditingHorarioId(horario.id_horario)
    setView('horarios')
  }

  const handleHorarioDelete = async (id) => {
    if (!window.confirm('Eliminar este horario?')) return
    setLoading(true)
    try {
      await api(`/horarios/${id}`, { method: 'DELETE' })
      notify('success', 'Horario eliminado')
      await loadAll()
    } catch (error) {
      notify('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const changeMonth = (direction) => {
    const next = new Date(calendarYear, calendarMonth + direction, 1)
    setCalendarYear(next.getFullYear())
    setCalendarMonth(next.getMonth())
  }

  const exportCalendar = () => {
    if (!visibleTareas.length) {
      notify('error', 'No hay tareas para exportar')
      return
    }

    const rows = [
      ['Fecha', 'Titulo', 'Materia', 'Estado', 'Descripcion'],
      ...visibleTareas
        .slice()
        .sort((a, b) => {
          const aDate = toDateKey(a.fecha_entrega)
          const bDate = toDateKey(b.fecha_entrega)
          return aDate.localeCompare(bDate)
        })
        .map((tarea) => [
          toDateKey(tarea.fecha_entrega),
          tarea.titulo,
          tarea.materiaNombre,
          tarea.completada ? 'Completada' : 'Pendiente',
          tarea.descripcion_limpia || tarea.descripcion || '',
        ]),
    ]

    const escapeCsv = (value) => {
      const text = String(value ?? '')
      if (text.includes('"') || text.includes(',') || text.includes('\n')) {
        return `"${text.replace(/"/g, '""')}"`
      }
      return text
    }

    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const periodLabel = selectedPeriodId === 'all' ? 'todos' : selectedPeriodId
    link.href = url
    link.download = `calendario_tareas_${periodLabel}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  if (!token) {
    return (
      <div className="auth">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-kicker">
              <span className="chip">
                <span className="chip-icon" aria-hidden="true">◇</span>
                Campus Sync
              </span>
              <span className="chip outline">
                <span className="chip-icon" aria-hidden="true">◆</span>
                Edicion 2026
              </span>
            </div>
            <p className="eyebrow">Tareas Escolares</p>
            <h1>Organiza tu semestre con claridad</h1>
            <p>
              Registra periodos, materias, tareas y horarios en un solo lugar.
            </p>
            <div className="auth-pills">
              <span>
                <span className="chip-icon" aria-hidden="true">⌘</span>
                Calendario inteligente
              </span>
              <span>
                <span className="chip-icon" aria-hidden="true">◈</span>
                Horario con colores
              </span>
              <span>
                <span className="chip-icon" aria-hidden="true">✦</span>
                Filtros avanzados
              </span>
            </div>
          </div>

          <div className="auth-tabs">
            <button
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => setAuthMode('login')}
            >
              Iniciar sesion
            </button>
            <button
              className={authMode === 'register' ? 'active' : ''}
              onClick={() => setAuthMode('register')}
            >
              Crear cuenta
            </button>
          </div>

          {authMode === 'login' ? (
            <form className="form" onSubmit={handleLogin}>
              <label>
                Correo
                <input
                  type="email"
                  required
                  value={loginForm.correo}
                  onChange={(event) =>
                    setLoginForm({ ...loginForm, correo: event.target.value })
                  }
                />
              </label>
              <label>
                Contrasena
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm({
                      ...loginForm,
                      password: event.target.value,
                    })
                  }
                />
              </label>
              <button className="primary" disabled={loading}>
                {loading ? 'Ingresando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form className="form" onSubmit={handleRegister}>
              <label>
                Nombre
                <input
                  type="text"
                  required
                  value={registerForm.nombre}
                  onChange={(event) =>
                    setRegisterForm({
                      ...registerForm,
                      nombre: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Correo
                <input
                  type="email"
                  required
                  value={registerForm.correo}
                  onChange={(event) =>
                    setRegisterForm({
                      ...registerForm,
                      correo: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Contrasena
                <input
                  type="password"
                  required
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm({
                      ...registerForm,
                      password: event.target.value,
                    })
                  }
                />
              </label>
              <button className="primary" disabled={loading}>
                {loading ? 'Creando...' : 'Crear cuenta'}
              </button>
            </form>
          )}
        </div>

        {banner && <div className={`banner ${banner.type}`}>{banner.text}</div>}
      </div>
    )
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">TS</span>
          <div>
            <p className="brand-title">Tareas</p>
            <p className="brand-sub">Escolares</p>
          </div>
        </div>

        <nav>
          <button
            className={view === 'dashboard' ? 'active' : ''}
            onClick={() => setView('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={view === 'tareas' ? 'active' : ''}
            onClick={() => setView('tareas')}
          >
            Tareas
          </button>
          <button
            className={view === 'periodos' ? 'active' : ''}
            onClick={() => setView('periodos')}
          >
            Periodos
          </button>
          <button
            className={view === 'materias' ? 'active' : ''}
            onClick={() => setView('materias')}
          >
            Materias
          </button>
          <button
            className={view === 'horarios' ? 'active' : ''}
            onClick={() => setView('horarios')}
          >
            Horarios
          </button>
        </nav>

        <div className="profile">
          <div>
            <p className="profile-name">{user?.nombre}</p>
            <p className="profile-email">{user?.correo}</p>
          </div>
          <button className="ghost" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="main-header">
          <div>
            <p className="eyebrow">Panel principal</p>
            <h1>Hola, {user?.nombre}</h1>
            <p>Organiza tu carga academica con claridad.</p>
          </div>
          <div className="header-actions">
            <label>
              Periodo activo
              <select
                value={selectedPeriodId}
                onChange={(event) => setSelectedPeriodId(event.target.value)}
              >
                <option value="all">Todos</option>
                {periodos.map((periodo) => (
                  <option key={periodo.id_periodo} value={periodo.id_periodo}>
                    {periodo.nombre}
                  </option>
                ))}
              </select>
            </label>
            <button className="ghost" type="button" onClick={exportCalendar}>
              Exportar calendario
            </button>
            <button
              className="ghost"
              type="button"
              onClick={() => setShowOnlyPending((prev) => !prev)}
            >
              {showOnlyPending ? 'Ver todas' : 'Ver solo pendientes'}
            </button>
            <button className="ghost" onClick={loadAll} disabled={loading}>
              {loading ? 'Actualizando...' : 'Refrescar'}
            </button>
          </div>
        </header>

        {view === 'dashboard' && (
          <section className="dashboard">
            <div className="stats">
              <article>
                <p>Total tareas</p>
                <h2>{stats.total}</h2>
              </article>
              <article>
                <p>Pendientes</p>
                <h2>{stats.pendientes}</h2>
              </article>
              <article>
                <p>Completadas</p>
                <h2>{stats.completadas}</h2>
              </article>
              <article>
                <p>Vencidas</p>
                <h2>{stats.vencidas}</h2>
              </article>
            </div>

            <div className="calendar-section">
              <div className="calendar">
                <div className="calendar-header">
                  <button onClick={() => changeMonth(-1)}>{'<'}</button>
                  <h3>
                    {new Date(calendarYear, calendarMonth).toLocaleDateString(
                      'es-MX',
                      { month: 'long', year: 'numeric' }
                    )}
                  </h3>
                  <button onClick={() => changeMonth(1)}>{'>'}</button>
                </div>
                <div className="calendar-grid">
                  {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map((day) => (
                    <div key={day} className="calendar-day-label">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, index) => {
                    if (!day) {
                      return (
                        <div key={`empty-${index}`} className="calendar-cell" />
                      )
                    }
                    const key = toDateKey(day)
                    const entries = tasksByDate.get(key) || []
                    const isSelected = selectedDate === key
                    return (
                      <button
                        key={key}
                        className={`calendar-cell ${
                          isSelected ? 'selected' : ''
                        }`}
                        onClick={() => setSelectedDate(key)}
                      >
                        <span>{day.getDate()}</span>
                        {entries.length > 0 && (
                          <div className="calendar-dots">
                            {entries.slice(0, 3).map((entry) => (
                              <span
                                key={entry.id_tarea}
                                style={{
                                  background: colorForMateria(entry.id_materia),
                                }}
                              />
                            ))}
                          </div>
                        )}
                        {entries.length > 0 && (
                          <small>
                            {entries.length} tarea
                            {entries.length > 1 ? 's' : ''}
                          </small>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="calendar-detail">
                <h3>Agenda del dia</h3>
                <p className="muted">{selectedDate}</p>
                {agendaTasks.length === 0 ? (
                  <p className="empty">
                    {showOnlyPending
                      ? 'No hay pendientes para esta fecha.'
                      : 'Sin tareas para esta fecha.'}
                  </p>
                ) : (
                  <div className="task-list">
                    {agendaTasks.map((tarea) => (
                      <article key={tarea.id_tarea}>
                        <div>
                          <h4>{tarea.titulo}</h4>
                          <p>{tarea.materiaNombre}</p>
                          {tarea.descripcion_limpia && (
                            <small>{tarea.descripcion_limpia}</small>
                          )}
                          {tarea.hora_entrega && (
                            <small>Hora: {formatHour(tarea.hora_entrega)}</small>
                          )}
                          <small>
                            Entrega: {tarea.fecha_entrega?.slice(0, 10)}
                          </small>
                        </div>
                        <span className={`pill ${getTareaStatus(tarea)}`}>
                          {getTareaStatus(tarea) === 'completada'
                            ? 'Completada'
                            : getTareaStatus(tarea) === 'vencida'
                              ? 'Vencida'
                              : 'Pendiente'}
                        </span>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {view === 'periodos' && (
          <section className="grid">
            <div className="card">
              <h3>{editingPeriodoId ? 'Editar periodo' : 'Nuevo periodo'}</h3>
              <form className="form" onSubmit={handlePeriodoSubmit}>
                <label>
                  Nombre
                  <input
                    type="text"
                    required
                    value={periodoForm.nombre}
                    onChange={(event) =>
                      setPeriodoForm({
                        ...periodoForm,
                        nombre: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Fecha inicio
                  <input
                    type="date"
                    required
                    value={periodoForm.fecha_inicio}
                    onChange={(event) =>
                      setPeriodoForm({
                        ...periodoForm,
                        fecha_inicio: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Fecha fin
                  <input
                    type="date"
                    required
                    value={periodoForm.fecha_fin}
                    onChange={(event) =>
                      setPeriodoForm({
                        ...periodoForm,
                        fecha_fin: event.target.value,
                      })
                    }
                  />
                </label>
                <button className="primary" disabled={loading}>
                  {editingPeriodoId ? 'Guardar cambios' : 'Crear periodo'}
                </button>
              </form>
            </div>

            <div className="card list">
              <h3>Periodos registrados</h3>
              {periodos.length === 0 ? (
                <p className="empty">Aun no tienes periodos.</p>
              ) : (
                periodos.map((periodo) => (
                  <article key={periodo.id_periodo}>
                    <div>
                      <h4>{periodo.nombre}</h4>
                      <p>
                        {periodo.fecha_inicio?.slice(0, 10)} -{' '}
                        {periodo.fecha_fin?.slice(0, 10)}
                      </p>
                    </div>
                    <div className="actions">
                      <button
                        className="ghost"
                        onClick={() => handlePeriodoEdit(periodo)}
                      >
                        Editar
                      </button>
                      <button
                        className="danger"
                        onClick={() => handlePeriodoDelete(periodo.id_periodo)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {view === 'materias' && (
          <section className="grid">
            <div className="card">
              <h3>{editingMateriaId ? 'Editar materia' : 'Nueva materia'}</h3>
              <form className="form" onSubmit={handleMateriaSubmit}>
                <label>
                  Nombre
                  <input
                    type="text"
                    required
                    value={materiaForm.nombre}
                    onChange={(event) =>
                      setMateriaForm({
                        ...materiaForm,
                        nombre: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Profesor
                  <input
                    type="text"
                    value={materiaForm.profesor}
                    onChange={(event) =>
                      setMateriaForm({
                        ...materiaForm,
                        profesor: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Periodo
                  <select
                    required
                    value={materiaForm.id_periodo}
                    onChange={(event) =>
                      setMateriaForm({
                        ...materiaForm,
                        id_periodo: event.target.value,
                      })
                    }
                  >
                    <option value="">Selecciona un periodo</option>
                    {periodos.map((periodo) => (
                      <option key={periodo.id_periodo} value={periodo.id_periodo}>
                        {periodo.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="primary" disabled={loading}>
                  {editingMateriaId ? 'Guardar cambios' : 'Crear materia'}
                </button>
              </form>
            </div>

            <div className="card list">
              <h3>Materias registradas</h3>
              {visibleMaterias.length === 0 ? (
                <p className="empty">Sin materias en este periodo.</p>
              ) : (
                visibleMaterias.map((materia) => (
                  <article key={materia.id_materia}>
                    <div>
                      <h4>{materia.nombre}</h4>
                      <p>{materia.profesor || 'Sin profesor asignado'}</p>
                      <small>
                        Periodo: {
                          periodos.find(
                            (periodo) => periodo.id_periodo === materia.id_periodo
                          )?.nombre
                        }
                      </small>
                      <div className="materia-meta">
                        <span
                          className="materia-dot"
                          style={{
                            background: colorForMateria(materia.id_materia),
                          }}
                        />
                        <span>
                          {
                            (materiaStats.get(materia.id_materia) || {})
                              .total || 0
                          }{' '}
                          tareas
                        </span>
                        <span>
                          {
                            (materiaStats.get(materia.id_materia) || {})
                              .completadas || 0
                          }{' '}
                          completadas
                        </span>
                      </div>
                    </div>
                    <div className="actions">
                      <button
                        className="ghost"
                        onClick={() => handleMateriaEdit(materia)}
                      >
                        Editar
                      </button>
                      <button
                        className="danger"
                        onClick={() => handleMateriaDelete(materia.id_materia)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {view === 'tareas' && (
          <section className="grid">
            <div className="card">
              <h3>{editingTareaId ? 'Editar tarea' : 'Nueva tarea'}</h3>
              <form className="form" onSubmit={handleTareaSubmit}>
                <label>
                  Titulo
                  <input
                    type="text"
                    required
                    value={tareaForm.titulo}
                    onChange={(event) =>
                      setTareaForm({
                        ...tareaForm,
                        titulo: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Descripcion
                  <textarea
                    rows="3"
                    value={tareaForm.descripcion}
                    onChange={(event) =>
                      setTareaForm({
                        ...tareaForm,
                        descripcion: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Hora entrega
                  <input
                    type="time"
                    value={tareaForm.hora_entrega}
                    onChange={(event) =>
                      setTareaForm({
                        ...tareaForm,
                        hora_entrega: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Fecha entrega
                  <input
                    type="date"
                    required
                    value={tareaForm.fecha_entrega}
                    onChange={(event) =>
                      setTareaForm({
                        ...tareaForm,
                        fecha_entrega: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Materia
                  <select
                    required
                    value={tareaForm.id_materia}
                    onChange={(event) =>
                      setTareaForm({
                        ...tareaForm,
                        id_materia: event.target.value,
                      })
                    }
                  >
                    <option value="">Selecciona una materia</option>
                    {visibleMaterias.map((materia) => (
                      <option key={materia.id_materia} value={materia.id_materia}>
                        {materia.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="primary" disabled={loading}>
                  {editingTareaId ? 'Guardar cambios' : 'Crear tarea'}
                </button>
              </form>
            </div>

            <div className="card list">
              <h3>Listado de tareas</h3>
              <div className="filters">
                <input
                  type="text"
                  placeholder="Buscar por titulo, materia o descripcion"
                  value={tareaFilters.search}
                  onChange={(event) =>
                    setTareaFilters({
                      ...tareaFilters,
                      search: event.target.value,
                    })
                  }
                />
                <select
                  value={tareaFilters.status}
                  onChange={(event) =>
                    setTareaFilters({
                      ...tareaFilters,
                      status: event.target.value,
                    })
                  }
                >
                  <option value="all">Todas</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="completada">Completadas</option>
                  <option value="vencida">Vencidas</option>
                </select>
                <select
                  value={tareaFilters.materiaId}
                  onChange={(event) =>
                    setTareaFilters({
                      ...tareaFilters,
                      materiaId: event.target.value,
                    })
                  }
                >
                  <option value="all">Todas las materias</option>
                  {visibleMaterias.map((materia) => (
                    <option key={materia.id_materia} value={materia.id_materia}>
                      {materia.nombre}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={tareaFilters.from}
                  onChange={(event) =>
                    setTareaFilters({
                      ...tareaFilters,
                      from: event.target.value,
                    })
                  }
                />
                <input
                  type="date"
                  value={tareaFilters.to}
                  onChange={(event) =>
                    setTareaFilters({
                      ...tareaFilters,
                      to: event.target.value,
                    })
                  }
                />
                <button
                  className="ghost"
                  type="button"
                  onClick={() =>
                    setTareaFilters({
                      search: '',
                      status: 'all',
                      materiaId: 'all',
                      from: '',
                      to: '',
                    })
                  }
                >
                  Limpiar
                </button>
              </div>
              {groupedTareas.length === 0 ? (
                <p className="empty">Sin tareas para mostrar.</p>
              ) : (
                groupedTareas.map(([dateKey, tareasDia]) => (
                  <div key={dateKey} className="task-group">
                    <h4 className="task-date">{dateKey}</h4>
                    {tareasDia.map((tarea) => (
                      <article key={tarea.id_tarea}>
                        <div>
                          <h4>{tarea.titulo}</h4>
                          <p>
                            {tarea.materiaNombre} ·{' '}
                            {tarea.fecha_entrega?.slice(0, 10)}
                            {tarea.hora_entrega
                              ? ` · ${formatHour(tarea.hora_entrega)}`
                              : ''}
                          </p>
                          {tarea.descripcion_limpia && (
                            <small>{tarea.descripcion_limpia}</small>
                          )}
                        </div>
                        <div className="actions">
                          {!tarea.completada && (
                            <button
                              className="ghost"
                              onClick={() => handleTareaCompletar(tarea.id_tarea)}
                            >
                              Completar
                            </button>
                          )}
                          <button
                            className="ghost"
                            onClick={() => handleTareaEdit(tarea)}
                          >
                            Editar
                          </button>
                          <button
                            className="danger"
                            onClick={() => handleTareaDelete(tarea.id_tarea)}
                          >
                            Eliminar
                          </button>
                        </div>
                        <span className={`pill ${getTareaStatus(tarea)}`}>
                          {getTareaStatus(tarea) === 'completada'
                            ? 'Completada'
                            : getTareaStatus(tarea) === 'vencida'
                              ? 'Vencida'
                              : 'Pendiente'}
                        </span>
                      </article>
                    ))}
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {view === 'horarios' && (
          <section className="grid">
            <div className="card">
              <h3>{editingHorarioId ? 'Editar horario' : 'Nuevo horario'}</h3>
              <form className="form" onSubmit={handleHorarioSubmit}>
                <label>
                  Dia
                  <select
                    value={horarioForm.dia_semana}
                    onChange={(event) =>
                      setHorarioForm({
                        ...horarioForm,
                        dia_semana: event.target.value,
                      })
                    }
                  >
                    {weekDays.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Hora inicio
                  <input
                    type="time"
                    required
                    value={horarioForm.hora_inicio}
                    onChange={(event) =>
                      setHorarioForm({
                        ...horarioForm,
                        hora_inicio: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Hora fin
                  <input
                    type="time"
                    required
                    value={horarioForm.hora_fin}
                    onChange={(event) =>
                      setHorarioForm({
                        ...horarioForm,
                        hora_fin: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Materia
                  <select
                    required
                    value={horarioForm.id_materia}
                    onChange={(event) =>
                      setHorarioForm({
                        ...horarioForm,
                        id_materia: event.target.value,
                      })
                    }
                  >
                    <option value="">Selecciona una materia</option>
                    {visibleMaterias.map((materia) => (
                      <option key={materia.id_materia} value={materia.id_materia}>
                        {materia.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="primary" disabled={loading}>
                  {editingHorarioId ? 'Guardar cambios' : 'Crear horario'}
                </button>
              </form>
            </div>

            <div className="card list">
              <h3>Horario semanal</h3>
              <div className="schedule-grid">
                <div className="schedule-times">
                  {Array.from({ length: 12 }).map((_, index) => {
                    const hour = 7 + index
                    return (
                      <div key={hour} className="schedule-time">
                        {String(hour).padStart(2, '0')}:00
                      </div>
                    )
                  })}
                </div>
                <div className="schedule-days">
                  {weekDays.map((day) => (
                    <div key={day.value} className="schedule-column">
                      <div className="schedule-label">{day.label}</div>
                      <div className="schedule-track">
                        {visibleHorarios
                          .filter((horario) => horario.dia_semana === day.value)
                          .map((horario) => {
                            const start = toMinutes(horario.hora_inicio)
                            const end = toMinutes(horario.hora_fin)
                            const offset = start ? (start - 420) / 10 : 0
                            const height = end && start ? (end - start) / 10 : 0
                            return (
                              <button
                                key={horario.id_horario}
                                className="schedule-block"
                                style={{
                                  top: `${offset}px`,
                                  height: `${Math.max(height, 24)}px`,
                                  borderLeftColor: colorForMateria(
                                    horario.id_materia
                                  ),
                                }}
                                onClick={() => handleHorarioEdit(horario)}
                                type="button"
                              >
                                <strong>{horario.materia}</strong>
                                <span>
                                  {formatHour(horario.hora_inicio)} -{' '}
                                  {formatHour(horario.hora_fin)}
                                </span>
                              </button>
                            )
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {banner && <div className={`banner ${banner.type}`}>{banner.text}</div>}
      </main>
    </div>
  )
}

export default App











