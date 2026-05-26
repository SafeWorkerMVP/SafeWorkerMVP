const StatCard = ({ label, value, accent = 'blue' }) => {
  return (
    <section className={`stat-card stat-${accent}`}>
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </section>
  );
};

export default StatCard;
