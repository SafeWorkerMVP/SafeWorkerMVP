import { useCallback, useEffect, useRef, useState } from 'react';

import api from '../api/api';
import { connectSocket } from '../socket/socket';
import AlarmTable from '../components/AlarmTable.jsx';

const CRITICAL_ALARM_TYPES = [
  'sos',
  'emergency',
  'manual_emergency',
  'emergency_button',
  'fall_risk',
  'hard_impact',
  'inactivity',
  'danger_zone_entry'
];

const FILTERS = [
  { key: 'all', label: 'Tümü' },
  { key: 'active', label: 'Aktif' },
  { key: 'resolved', label: 'Çözülen' },
  { key: 'critical', label: 'Kritik' },
  { key: 'sos', label: 'SOS' }
];

const isCriticalAlarm = (alarm) => {
  if (!alarm) return false;

  const type = alarm.type?.toString().toLowerCase();
  const riskLevel = alarm.riskLevel?.toString().toLowerCase();
  const riskScore = Number(alarm.riskScore || 0);

  return (
    riskLevel === 'danger' ||
    riskScore >= 61 ||
    CRITICAL_ALARM_TYPES.includes(type)
  );
};

const createAlarmSound = () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return null;

  const audioContext = new AudioContextClass();

  const playTone = (frequency, startTime, duration) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.45, startTime + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  };

  return {
    async playCriticalAlarm() {
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const now = audioContext.currentTime;

      playTone(880, now, 0.22);
      playTone(660, now + 0.28, 0.22);
      playTone(880, now + 0.56, 0.22);
      playTone(660, now + 0.84, 0.22);
    }
  };
};

const AlarmsPage = () => {
  const [alarms, setAlarms] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [criticalNotice, setCriticalNotice] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);

  const alarmSoundRef = useRef(null);
  const criticalNoticeTimerRef = useRef(null);

  const fetchAlarms = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');

    try {
      const response = await api.get('/alarms');
      setAlarms(response.data.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Alarm listesi alınamadı.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const filteredAlarms = alarms.filter((alarm) => {
    const type = alarm.type?.toString().toLowerCase();
    const status = alarm.status?.toString().toLowerCase();

    if (activeFilter === 'active') return status === 'active';
    if (activeFilter === 'resolved') return status === 'resolved';
    if (activeFilter === 'critical') return isCriticalAlarm(alarm);
    if (activeFilter === 'sos') {
      return ['sos', 'emergency', 'manual_emergency', 'emergency_button'].includes(type);
    }

    return true;
  });

  const filterCounts = {
    all: alarms.length,
    active: alarms.filter((alarm) => alarm.status === 'active').length,
    resolved: alarms.filter((alarm) => alarm.status === 'resolved').length,
    critical: alarms.filter((alarm) => isCriticalAlarm(alarm)).length,
    sos: alarms.filter((alarm) =>
      ['sos', 'emergency', 'manual_emergency', 'emergency_button'].includes(
        alarm.type?.toString().toLowerCase()
      )
    ).length
  };

  const enableAudioAlarm = async () => {
    try {
      if (!alarmSoundRef.current) {
        alarmSoundRef.current = createAlarmSound();
      }

      if (!alarmSoundRef.current) {
        setError('Bu tarayıcı sesli alarm özelliğini desteklemiyor.');
        return;
      }

      await alarmSoundRef.current.playCriticalAlarm();
      setAudioEnabled(true);
      setNotice('Sesli alarm aktifleştirildi.');
      window.setTimeout(() => setNotice(''), 3000);
    } catch (_) {
      setError(
        'Sesli alarm aktifleştirilemedi. Tarayıcı izinleri veya ses ayarlarını kontrol edin.'
      );
    }
  };

  const playCriticalSound = async () => {
    if (!audioEnabled || !alarmSoundRef.current) return;

    try {
      await alarmSoundRef.current.playCriticalAlarm();
    } catch (_) {
      setNotice('Kritik alarm geldi ancak tarayıcı sesi engelledi.');
      window.setTimeout(() => setNotice(''), 3000);
    }
  };

  const showCriticalWarning = (alarm) => {
    const alarmType = alarm?.type || 'kritik alarm';
    const alarmMessage = alarm?.message || 'Kritik alarm bildirimi alındı.';

    setCriticalNotice(`${alarmType.toUpperCase()} - ${alarmMessage}`);

    if (criticalNoticeTimerRef.current) {
      window.clearTimeout(criticalNoticeTimerRef.current);
    }

    criticalNoticeTimerRef.current = window.setTimeout(() => {
      setCriticalNotice('');
    }, 10000);
  };

  useEffect(() => {
    fetchAlarms();
    const socket = connectSocket();

    socket.on('alarm:new', (alarm) => {
      setNotice('Yeni alarm bildirimi alındı.');
      fetchAlarms(true);

      if (isCriticalAlarm(alarm)) {
        showCriticalWarning(alarm);
        playCriticalSound();
      }

      window.setTimeout(() => setNotice(''), 3000);
    });

    return () => {
      socket.off('alarm:new');

      if (criticalNoticeTimerRef.current) {
        window.clearTimeout(criticalNoticeTimerRef.current);
      }
    };
  }, [audioEnabled, fetchAlarms]);

  const handleResolve = async (alarmId) => {
    setResolvingId(alarmId);
    setError('');

    try {
      await api.patch(`/alarms/${alarmId}/resolve`);
      setNotice('Alarm çözüldü.');
      await fetchAlarms(true);
      window.setTimeout(() => setNotice(''), 3000);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Alarm çözülemedi.');
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>Alarmlar</h2>
          <p>Aktif ve geçmiş alarm kayıtları</p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className={audioEnabled ? 'secondary-button success' : 'secondary-button'}
            onClick={audioEnabled ? () => setAudioEnabled(false) : enableAudioAlarm}
          >
            {audioEnabled ? 'Sesli Alarmı Kapat' : 'Sesli Alarmı Aktifleştir'}
          </button>
          {notice && <span className="notice">{notice}</span>}
        </div>
      </div>

      {criticalNotice && (
        <div className="critical-alarm-banner">
          <strong>KRİTİK ALARM</strong>
          <span>{criticalNotice}</span>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Alarm Geçmişi</h3>
            <p className="muted">
              Seçili filtre: {FILTERS.find((filter) => filter.key === activeFilter)?.label}
            </p>
          </div>
          {loading && <span className="muted">Yükleniyor...</span>}
        </div>

        <div className="filter-bar">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={
                activeFilter === filter.key
                  ? 'filter-button active'
                  : 'filter-button'
              }
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
              <span>{filterCounts[filter.key]}</span>
            </button>
          ))}
        </div>

        <AlarmTable
          alarms={filteredAlarms}
          showDevice
          onResolve={handleResolve}
          resolvingId={resolvingId}
        />
      </section>
    </section>
  );
};

export default AlarmsPage;