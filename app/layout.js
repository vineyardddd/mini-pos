import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Mini POS',
  description: 'ระบบจัดการร้านค้าขนาดเล็ก',
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <nav className="navbar">
          <div className="nav-brand">Mini POS</div>
          <ul className="nav-links">
            <li><Link href="/">สินค้า</Link></li>
            <li><Link href="/sell">ขายสินค้า</Link></li>
            <li><Link href="/history">ประวัติการขาย</Link></li>
          </ul>
        </nav>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  )
}
