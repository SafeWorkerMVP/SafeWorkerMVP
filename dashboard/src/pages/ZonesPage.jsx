import { useEffect, useState } from 'react';

import api from '../api/api';
import ZoneTable from '../components/ZoneTable.jsx';

const ZonesPage = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchZones = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/zones');
        setZones(response.data.data || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Bölge listesi alınamadı.');
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, []);

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>Tehlikeli Bölgeler</h2>
          <p>QR kod ile tanımlanan saha bölgeleri</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="panel">
        <div className="panel-header">
          <h3>Bölge Listesi</h3>
          {loading && <span className="muted">Yükleniyor...</span>}
        </div>
        <ZoneTable zones={zones} />
      </section>
    </section>
  );
};

export default ZonesPage;
