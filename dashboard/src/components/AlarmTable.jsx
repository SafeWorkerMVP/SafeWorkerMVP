const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value));
};

const getWorkerName = (alarm) => alarm?.workerId?.name || '-';
const getDeviceName = (alarm) => alarm?.deviceId?.deviceName || '-';

const AlarmTable = ({ alarms = [], showDevice = false, onResolve, resolvingId }) => {
  if (!alarms.length) {
    return <div className="empty-state">Alarm kaydı bulunamadı.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Tip</th>
            <th>Çalışan</th>
            {showDevice && <th>Cihaz</th>}
            <th>Mesaj</th>
            <th>Risk</th>
            <th>Durum</th>
            <th>Tarih</th>
            {onResolve && <th>İşlem</th>}
          </tr>
        </thead>
        <tbody>
          {alarms.map((alarm) => (
            <tr key={alarm._id}>
              <td className="mono">{alarm.type}</td>
              <td>{getWorkerName(alarm)}</td>
              {showDevice && <td>{getDeviceName(alarm)}</td>}
              <td>{alarm.message}</td>
              <td>
                <span className="score-pill">{alarm.riskScore}</span>
              </td>
              <td>
                <span className={`status-badge ${alarm.status}`}>{alarm.status}</span>
              </td>
              <td>{formatDate(alarm.createdAt)}</td>
              {onResolve && (
                <td>
                  {alarm.status === 'active' ? (
                    <button
                      className="button button-small"
                      type="button"
                      disabled={resolvingId === alarm._id}
                      onClick={() => onResolve(alarm._id)}
                    >
                      {resolvingId === alarm._id ? 'İşleniyor' : 'Çözüldü'}
                    </button>
                  ) : (
                    <span className="muted">-</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlarmTable;
