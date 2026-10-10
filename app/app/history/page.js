"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function HistoryPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลประวัติการขายเมื่อโหลดหน้าเว็บ
  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    // ดึงข้อมูลจากตาราง sales และเรียงจากล่าสุดไปเก่าสุด
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('sold_at', { ascending: false });

    if (error) {
      console.error('Error fetching sales:', error);
    } else {
      setSales(data);
    }
    setLoading(false);
  };

  // คำนวณยอดขายรวมทั้งหมดจากข้อมูลใน state
  const grandTotal = sales.reduce((sum, sale) => sum + Number(sale.total_price), 0);

  // ฟังก์ชันจัดรูปแบบวันเวลาให้อ่านง่าย
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>ประวัติการขาย</h2>
