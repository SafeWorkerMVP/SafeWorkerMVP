import { useCallback, useEffect, useState } from 'react';

import api from '../api/api';
import { connectSocket } from '../socket/socket';
import AlarmTable from '../components/AlarmTable.jsx';
import StatCard from '../components/StatCard.jsx';

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const fetchSummary = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');

    try {
      const response = await api.get('/dashboard/summary');
      setSummary(response.data.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Dashboard verileri alınamadı.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    const intervalId = window.setInterval(() => fetchSummary(true), 5000);

    const socket = connectSocket();
    const refreshWithNotice = (message) => {
      setNotice(message);
      fetchSummary(true);
      window.setTimeout(() => setNotice(''), 3000);
    };

    socket.on('alarm:new', () => refreshWithNotice('Yeni alarm bildirimi alındı.'));
    socket.on('dashboard:summary', () => refreshWithNotice('Dashboard özeti yenilendi.'));

    return () => {
      window.clearInterval(intervalId);
      socket.off('alarm:new');
      socket.off('dashboard:summary');
    };
  }, [fetchSummary]);

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>Dashboard Özeti</h2>
          <p>İş güvenliği operasyonlarının genel durumu</p>
        </div>
        {notice && <span className="notice">{notice}</span>}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stat-grid">
        <StatCard label="Toplam Çalışan" value={summary?.totalWorkers} accent="blue" />
        <StatCard label="Aktif Çalışan" value={summary?.activeWorkers} accent="green" />
        <StatCard label="Toplam Cihaz" value={summary?.totalDevices} accent="violet" />
        <StatCard label="Aktif Alarm" value={summary?.activeAlarms} accent="red" />
        <StatCard label="Bugünkü Alarm" value={summary?.todayAlarms} accent="amber" />
        <StatCard label="Ortalama Risk" value={summary?.averageRiskScore} accent="slate" />
      </div>

      <section className="panel">
        <div className="panel-header">
          <h3>Son Alarmlar</h3>
          {loading && <span className="muted">Yükleniyor...</span>}
        </div>
        <AlarmTable alarms={summary?.lastAlarms || []} />
      </section>
    </section>
  );
};

export default DashboardPage;
