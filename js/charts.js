/* ==========================================================
   CuDanDeals.vn – Cấu hình biểu đồ dùng chung (Chart.js 4)
   Quy tắc: nét mảnh, cột ≤ 24px bo 4px đầu, đường 2px, lưới mờ 1px,
   chữ dùng màu chữ (không dùng màu dữ liệu), có bảng số liệu thay thế.
   Màu: 1 chuỗi = xanh #2563EB; 2 chuỗi = xanh + cam #EA580C (đã kiểm tra mù màu).
   ========================================================== */
window.CDDChart = (function () {
  const C = { blue: '#2563EB', orange: '#EA580C', grid: '#EEF2F6', ink: '#1E293B', muted: '#64748B' };
  if (window.Chart) {
    Chart.defaults.font.family = "'Be Vietnam Pro', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = C.muted;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;
    Chart.defaults.plugins.legend.labels.color = C.ink;
    Chart.defaults.plugins.tooltip.backgroundColor = '#0F172A';
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.maintainAspectRatio = false;
  }
  const axis = (extra = {}) => ({ grid: { color: C.grid, drawTicks: false }, border: { display: false }, ticks: { padding: 8, color: C.muted }, ...extra });
  const nf = (v) => Number(v).toLocaleString('vi-VN');

  // Cột (dọc hoặc ngang) – 1 chuỗi, không cần chú thích
  function bar(canvas, labels, data, { horizontal = false, label = '', color = C.blue } = {}) {
    if (!window.Chart) return;
    return new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{ label, data, backgroundColor: color, hoverBackgroundColor: '#1D4ED8', maxBarThickness: 24,
        borderRadius: { topLeft: horizontal ? 0 : 4, topRight: 4, bottomRight: horizontal ? 4 : 0, bottomLeft: 0 }, borderSkipped: false }] },
      options: { indexAxis: horizontal ? 'y' : 'x', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${label}: ${nf(c.raw)}` } } },
        scales: { x: axis(horizontal ? { beginAtZero: true } : { grid: { display: false } }), y: axis(horizontal ? { grid: { display: false } } : { beginAtZero: true }) } },
    });
  }

  // Đường – 1 hoặc 2 chuỗi, cùng một trục
  function line(canvas, labels, series) {
    if (!window.Chart) return;
    const colors = [C.blue, C.orange];
    return new Chart(canvas, {
      type: 'line',
      data: { labels, datasets: series.map((s, i) => ({ label: s.label, data: s.data, borderColor: colors[i], backgroundColor: colors[i] + '1A',
        fill: series.length === 1, borderWidth: 2, tension: .35, pointRadius: 0, pointHoverRadius: 5, pointHoverBorderWidth: 2, pointHoverBorderColor: '#fff', pointBackgroundColor: colors[i] })) },
      options: { interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: series.length > 1, position: 'top', align: 'end' }, tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${nf(c.raw)}` } } },
        scales: { x: axis({ grid: { display: false } }), y: axis({ beginAtZero: true }) } },
    });
  }

  // Bảng số liệu thay thế cho biểu đồ (accessibility)
  function table(el, head, rows) {
    el.innerHTML = `<table class="table table-sm small-2 mb-0"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td class="${i ? 'text-end' : ''}">${typeof c === 'number' ? nf(c) : c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }
  return { bar, line, table, C };
})();
