const ZoneTable = ({ zones = [] }) => {
  if (!zones.length) {
    return <div className="empty-state">Bölge kaydı bulunamadı.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Bölge Adı</th>
            <th>QR Kod</th>
            <th>Risk Seviyesi</th>
            <th>Açıklama</th>
            <th>Aktiflik</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => (
            <tr key={zone._id}>
              <td>{zone.zoneName}</td>
              <td className="mono">{zone.qrCode}</td>
              <td>
                <span className={`zone-badge ${zone.riskLevel}`}>{zone.riskLevel}</span>
              </td>
              <td>{zone.description || '-'}</td>
              <td>
                <span className={`status-badge ${zone.isActive ? 'active' : 'resolved'}`}>
                  {zone.isActive ? 'active' : 'passive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ZoneTable;
