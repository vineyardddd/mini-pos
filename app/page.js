"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // State สำหรับฟอร์มเพิ่มสินค้าใหม่
  const [newProduct, setNewProduct] = useState({ sku: '', name: '', price: '', stock: '', unit: '' });

  // State สำหรับการแก้ไขแบบ inline
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ sku: '', name: '', price: '', stock: '', unit: '' });

  // ดึงข้อมูลเมื่อโหลดหน้าเว็บ
  useEffect(() => {
    fetchProducts();
  }, []);

  // ฟังก์ชันดึงรายการสินค้า
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  // ฟังก์ชันเพิ่มสินค้า
  const handleAdd = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('products').insert([{
      sku: newProduct.sku,
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock, 10),
      unit: newProduct.unit
    }]);

    if (error) {
      alert('เพิ่มสินค้าไม่สำเร็จ: ' + error.message);
    } else {
      setNewProduct({ sku: '', name: '', price: '', stock: '', unit: '' });
      fetchProducts();
    }
  };

  // ฟังก์ชันลบสินค้า
  const handleDelete = async (id) => {
    if (confirm('ต้องการลบสินค้านี้ใช่หรือไม่?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        alert('ลบไม่สำเร็จ: ' + error.message);
      } else {
        fetchProducts();
      }
    }
  };

  // เริ่มโหมดแก้ไข
  const startEdit = (product) => {
    setEditingId(product.id);
    setEditForm({
      sku: product.sku,
      name: product.name,
      price: product.price,
      stock: product.stock,
      unit: product.unit
    });
  };

  // ฟังก์ชันบันทึกการแก้ไข
  const handleUpdate = async () => {
    const { error } = await supabase
      .from('products')
      .update({
        sku: editForm.sku,
        name: editForm.name,
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock, 10),
        unit: editForm.unit
      })
      .eq('id', editingId);

    if (error) {
      alert('แก้ไขไม่สำเร็จ: ' + error.message);
    } else {
      setEditingId(null);
      fetchProducts();
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>จัดการสินค้า</h2>

      {/* ฟอร์มเพิ่มสินค้า */}
      <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>เพิ่มสินค้าใหม่</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="SKU" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} required style={inputStyle} />
          <input type="text" placeholder="ชื่อสินค้า" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required style={inputStyle} />
          <input type="number" placeholder="ราคา" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required min="0" step="0.01" style={inputStyle} />
          <input type="number" placeholder="จำนวน (คงเหลือ)" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required min="0" style={inputStyle} />
          <input type="text" placeholder="หน่วย (เช่น ชิ้น)" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} required style={inputStyle} />
          <button type="submit" style={{ ...btnStyle, backgroundColor: '#10b981' }}>+ เพิ่ม</button>
        </form>
      </div>

      {/* ตารางสินค้า */}
      <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={thStyle}>SKU</th>
                <th style={thStyle}>ชื่อสินค้า</th>
                <th style={thStyle}>ราคา</th>
                <th style={thStyle}>คงเหลือ</th>
                <th style={thStyle}>หน่วย</th>
                <th style={thStyle}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '1rem', textAlign: 'center' }}>ไม่มีข้อมูลสินค้าในระบบ</td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    {editingId === product.id ? (
                      // แสดงฟิลด์เมื่อกดแก้ไข
                      <>
                        <td style={tdStyle}><input type="text" value={editForm.sku} onChange={e => setEditForm({...editForm, sku: e.target.value})} style={editInputStyle} /></td>
                        <td style={tdStyle}><input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} style={editInputStyle} /></td>
                        <td style={tdStyle}><input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} style={{...editInputStyle, width: '80px'}} /></td>
                        <td style={tdStyle}><input type="number" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: e.target.value})} style={{...editInputStyle, width: '80px'}} /></td>
                        <td style={tdStyle}><input type="text" value={editForm.unit} onChange={e => setEditForm({...editForm, unit: e.target.value})} style={{...editInputStyle, width: '80px'}} /></td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={handleUpdate} style={{ ...btnStyle, backgroundColor: '#3b82f6', padding: '4px 8px', fontSize: '0.9rem' }}>บันทึก</button>
                            <button onClick={() => setEditingId(null)} style={{ ...btnStyle, backgroundColor: '#6b7280', padding: '4px 8px', fontSize: '0.9rem' }}>ยกเลิก</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // แสดงผลปกติ
                      <>
                        <td style={tdStyle}>{product.sku}</td>
                        <td style={tdStyle}>{product.name}</td>
                        <td style={tdStyle}>{Number(product.price).toLocaleString()}</td>
                        <td style={tdStyle}>{product.stock}</td>
                        <td style={tdStyle}>{product.unit}</td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => startEdit(product)} style={{ ...btnStyle, backgroundColor: '#f59e0b', padding: '4px 8px', fontSize: '0.9rem' }}>แก้ไข</button>
                            <button onClick={() => handleDelete(product.id)} style={{ ...btnStyle, backgroundColor: '#ef4444', padding: '4px 8px', fontSize: '0.9rem' }}>ลบ</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Inline Styles เล็กน้อยเพื่อความสะอาดตาของโค้ด UI
const inputStyle = {
  padding: '8px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  flex: '1',
  minWidth: '120px'
};

const editInputStyle = {
  padding: '4px',
  border: '1px solid #9ca3af',
  borderRadius: '4px',
  width: '100%'
};

const btnStyle = {
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '8px 16px',
  cursor: 'pointer',
  fontWeight: '500'
};

const thStyle = {
  padding: '12px',
  borderBottom: '2px solid #e5e7eb',
  color: '#4b5563',
  fontWeight: '600'
};

const tdStyle = {
  padding: '12px'
};
