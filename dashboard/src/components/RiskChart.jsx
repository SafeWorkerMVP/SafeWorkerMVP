import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const formatTime = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
};

const RiskChart = ({ data = [] }) => {
  if (!data.length) {
    return <div className="empty-state chart-empty">Veri bulunamadı.</div>;
  }

  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data} margin={{ top: 20, right: 24, bottom: 10, left: 0 }}>
          <CartesianGrid stroke="#dbe4ef" strokeDasharray="4 4" />
          <XAxis dataKey="timestamp" tickFormatter={formatTime} minTickGap={24} />
          <YAxis domain={[0, 100]} />
          <Tooltip
            labelFormatter={(label) =>
              new Intl.DateTimeFormat('tr-TR', {
                dateStyle: 'short',
                timeStyle: 'medium'
              }).format(new Date(label))
            }
            formatter={(value, name) => [value, name === 'riskScore' ? 'Risk Puanı' : name]}
          />
          <Line
            type="monotone"
            dataKey="riskScore"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskChart;
