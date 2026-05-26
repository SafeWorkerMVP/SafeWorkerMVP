const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value));
};

const WorkerStatusTable = ({ workers = [] }) => {
  if (!workers.length) {
    return <div className="empty-state">Çalışan kaydı bulunamadı.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Çalışan</th>
            <th>Cihaz</th>
            <th>Son Veri</th>
            <th>Pil</th>
            <th>Bağlantı</th>
            <th>Son Risk</th>
            <th>Risk Seviyesi</th>
            <th>Son Alarm</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((worker) => (
            <tr key={worker.workerId}>
              <td>{worker.workerName}</td>
              <td>{worker.deviceName || '-'}</td>
              <td>{formatDate(worker.lastSeen)}</td>
              <td>{worker.batteryLevel === null ? '-' : `%${worker.batteryLevel}`}</td>
              <td>
                <span className={`connection-badge ${worker.networkStatus || 'offline'}`}>
                  {worker.networkStatus || 'offline'}
                </span>
              </td>
              <td>{worker.latestRiskScore ?? '-'}</td>
              <td>
                <span className={`risk-badge ${worker.latestRiskLevel || 'normal'}`}>
                  {worker.latestRiskLevel || 'normal'}
                </span>
              </td>
              <td>{worker.latestAlarm ? worker.latestAlarm.message : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkerStatusTable;
