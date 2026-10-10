"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SellPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State สำหรับฟอร์มขาย
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  // ดึงรายการสินค้าเมื่อโหลดหน้าเพื่อนำมาใส่ใน Dropdown
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  // หาข้อมูลสินค้าที่กำลังเลือกอยู่
  const selectedProduct = products.find(p => p.id === selectedProductId);
  
  // คำนวณยอดรวมอัตโนมัติ
  const totalPrice = selectedProduct ? selectedProduct.price * quantity : 0;

  // ฟังก์ชันจัดการการขายสินค้า
  const handleSell = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      alert('กรุณาเลือกสินค้า');
      return;
    }

    if (quantity <= 0) {
      alert('จำนวนต้องมากกว่า 0');
      return;
    }

    // 1. ตรวจสอบ stock
    if (quantity > selectedProduct.stock) {
      alert(`สินค้าในสต๊อกไม่เพียงพอ (เหลือ ${selectedProduct.stock} ${selectedProduct.unit})`);
      return;
    }

    setSubmitting(true);

    try {
      // 2. บันทึกประวัติการขายลงตาราง sales
      const { error: saleError } = await supabase.from('sales').insert([{
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity: parseInt(quantity, 10),
        total_price: totalPrice,
        sold_at: new Date().toISOString()
      }]);

      if (saleError) throw saleError;

      // 3. อัปเดตตัดสต๊อกในตาราง products
      const newStock = selectedProduct.stock - parseInt(quantity, 10);
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', selectedProduct.id);

      if (updateError) throw updateError;

      // 4. แสดงข้อความสำเร็จและรีเซ็ตฟอร์ม
      alert('บันทึกการขายสำเร็จ!');
      setSelectedProductId('');
      setQuantity(1);
      
      // ดึงข้อมูลสินค้าใหม่เพื่ออัปเดตสต๊อกในหน้าจอ
      fetchProducts();

    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>ทำรายการขาย</h2>

      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '600px', margin: '0 auto' }}>
        {loading ? (
          <p>กำลังโหลดรายการสินค้า...</p>
        ) : (
          <form onSubmit={handleSell} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* เลือกสินค้า */}
            <div>
              <label style={labelStyle}>เลือกสินค้า</label>
              <select 
                value={selectedProductId} 
                onChange={e => setSelectedProductId(e.target.value)} 
                required 
                style={inputStyle}
              >
                <option value="">-- กรุณาเลือกสินค้า --</option>
                {products.map(product => (
                  <option key={product.id} value={product.id} disabled={product.stock === 0}>
                    {product.name} - ราคา {Number(product.price).toLocaleString()} บาท (เหลือ {product.stock} {product.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* ระบุจำนวน */}
            <div>
              <label style={labelStyle}>จำนวน</label>
              <input 
                type="number" 
                value={quantity} 
                onChange={e => setQuantity(e.target.value)} 
                required 
                min="1"
                style={inputStyle} 
              />
            </div>

            {/* สรุปยอดรวม */}
            <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '6px', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>ยอดรวมทั้งสิ้น:</span>
                <span style={{ color: '#2563eb' }}>{totalPrice.toLocaleString()} บาท</span>
              </div>
            </div>

            {/* ปุ่มยืนยัน */}
            <button 
              type="submit" 
              disabled={submitting || !selectedProductId} 
              style={{ 
                ...btnStyle, 
                backgroundColor: (submitting || !selectedProductId) ? '#9ca3af' : '#2563eb',
                cursor: (submitting || !selectedProductId) ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'กำลังบันทึก...' : 'ยืนยันการขาย'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// Inline Styles
const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontWeight: '600',
  color: '#374151'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontSize: '1rem',
  boxSizing: 'border-box'
};

const btnStyle = {
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '12px 24px',
  fontSize: '1.1rem',
  fontWeight: '600',
  marginTop: '1rem'
};
