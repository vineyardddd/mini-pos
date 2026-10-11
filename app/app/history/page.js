'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function HistoryPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    try {
      setErrorMsg('');
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('sold_at', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Error fetching sales:', error.message);
      setErrorMsg('ไม่สามารถดึงข้อมูลประวัติการขายได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  }

  const totalRevenue = sales.reduce(
    (sum, item) => sum + Number(item.total_price || 0),
    0
  );

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>ประวัติการขาย</h2>

      <div
        style={{
          padding: '1rem',
          background: '#f4f4f5',
          borderRadius: '8px',
          marginBottom: '1rem',
        }}
      >
        <strong>ยอดขายรวมทั้งหมด: </strong>
        <span style={{ fontSize: '1.25rem', color: '#16a34a', fontWeight: 'bold' }}>
          ฿{totalRevenue.toLocaleString()}
        </span>
      </div>

      {errorMsg && (
        <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{errorMsg}</p>
      )}

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : sales.length === 0 ? (
        <p style={{ color: '#71717a' }}>ยังไม่มีประวัติการขาย</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '8px' }}>วันเวลาที่ขาย</th>
              <th style={{ padding: '8px' }}>ชื่อสินค้า</th>
              <th style={{ padding: '8px' }}>จำนวน</th>
              <th style={{ padding: '8px' }}>ยอดรวม</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>
                  {item.sold_at
                    ? new Date(item.sold_at).toLocaleString('th-TH')
                    : '-'}
                </td>
                <td style={{ padding: '8px' }}>{item.product_name || '-'}</td>
                <td style={{ padding: '8px' }}>{item.quantity ?? 0}</td>
                <td style={{ padding: '8px' }}>
                  ฿{Number(item.total_price || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
