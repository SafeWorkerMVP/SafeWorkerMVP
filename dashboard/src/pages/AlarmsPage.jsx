import { useCallback, useEffect, useState } from 'react';

import api from '../api/api';
import { connectSocket } from '../socket/socket';
import AlarmTable from '../components/AlarmTable.jsx';

const AlarmsPage = () => {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [resolvingId, setResolvingId] = useState(null);

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

  useEffect(() => {
    fetchAlarms();
    const socket = connectSocket();

    socket.on('alarm:new', () => {
      setNotice('Yeni alarm bildirimi alındı.');
      fetchAlarms(true);
      window.setTimeout(() => setNotice(''), 3000);
    });

    return () => {
      socket.off('alarm:new');
    };
  }, [fetchAlarms]);

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
        {notice && <span className="notice">{notice}</span>}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="panel">
        <div className="panel-header">
          <h3>Alarm Geçmişi</h3>
          {loading && <span className="muted">Yükleniyor...</span>}
        </div>
        <AlarmTable
          alarms={alarms}
          showDevice
          onResolve={handleResolve}
          resolvingId={resolvingId}
        />
      </section>
    </section>
  );
};

export default AlarmsPage;
