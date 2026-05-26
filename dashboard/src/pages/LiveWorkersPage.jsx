import { useCallback, useEffect, useState } from 'react';

import api from '../api/api';
import { connectSocket } from '../socket/socket';
import WorkerStatusTable from '../components/WorkerStatusTable.jsx';

const LiveWorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const fetchWorkers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');

    try {
      const response = await api.get('/dashboard/live-workers');
      setWorkers(response.data.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Canlı çalışan verileri alınamadı.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkers();
    const intervalId = window.setInterval(() => fetchWorkers(true), 5000);
    const socket = connectSocket();
    const refresh = (message) => {
      setNotice(message);
      fetchWorkers(true);
      window.setTimeout(() => setNotice(''), 3000);
    };

    socket.on('sensor:new', () => refresh('Yeni sensör verisi alındı.'));
    socket.on('worker:status', () => refresh('Çalışan durumu güncellendi.'));
    socket.on('alarm:new', () => refresh('Yeni alarm bildirimi alındı.'));

    return () => {
      window.clearInterval(intervalId);
      socket.off('sensor:new');
      socket.off('worker:status');
      socket.off('alarm:new');
    };
  }, [fetchWorkers]);

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>Canlı Çalışanlar</h2>
          <p>Son sensör verileri ve risk durumları</p>
        </div>
        {notice && <span className="notice">{notice}</span>}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="panel">
        <div className="panel-header">
          <h3>Çalışan Durumları</h3>
          {loading && <span className="muted">Yükleniyor...</span>}
        </div>
        <WorkerStatusTable workers={workers} />
      </section>
    </section>
  );
};

export default LiveWorkersPage;
