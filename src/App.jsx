import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import PrintBill from './components/PrintBill'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginMessage, setLoginMessage] = useState('')

  const [page, setPage] = useState('dashboard')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const [todayOrders, setTodayOrders] = useState([])
  const [todayRevenue, setTodayRevenue] = useState(0)

  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (session) {
      loadTodayOrders()
    }
  }, [session])

  async function loadTodayOrders() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', today.toISOString())
      .order('order_code', {
        ascending: true,
      })

    if (error) {
      console.error('Lỗi tải đơn:', error)
      return
    }

    const orders = data || []

    setTodayOrders(orders)

    const revenue = orders
      .filter((order) => order.order_status !== 'CANCELLED')
      .reduce((sum, order) => {
        return sum + Number(order.total || 0)
      }, 0)

    setTodayRevenue(revenue)
  }

  async function handleLogin(e) {
    e.preventDefault()

    setLoginMessage('Đang đăng nhập...')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoginMessage('Đăng nhập thất bại: ' + error.message)
      return
    }

    setLoginMessage('')
  }

  async function handleLogout() {
    await supabase.auth.signOut()

    setPage('dashboard')
    setSelectedOrder(null)
  }

  if (loading) {
    return (
      <div
        style={{
          padding: 40,
          fontFamily: 'Arial',
        }}
      >
        Đang tải...
      </div>
    )
  }

  if (!session) {
    return (
      <LoginPage
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        message={loginMessage}
        handleLogin={handleLogin}
      />
    )
  }

  if (page === 'new-order') {
    return (
      <NewOrder
        onBack={() => {
          setPage('dashboard')
        }}
        onCreated={() => {
          setPage('dashboard')
          loadTodayOrders()
        }}
      />
    )
  }

  if (page === 'order-detail' && selectedOrder) {
    return (
      <OrderDetail
        order={selectedOrder}
        onBack={() => {
          setSelectedOrder(null)
          setPage('dashboard')
        }}
        onUpdated={async (updatedOrder) => {
          setSelectedOrder(updatedOrder)
          await loadTodayOrders()
        }}
      />
    )
  }

  const delivering = todayOrders.filter(
    (order) => order.order_status === 'DELIVERING'
  ).length

  const unpaid = todayOrders.filter(
    (order) => order.payment_status !== 'PAID'
  ).length

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f7f4',
        padding: 30,
        boxSizing: 'border-box',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 30,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 48,
              }}
            >
              FreshFood
            </h1>

            <p
              style={{
                marginTop: 6,
                color: '#666',
              }}
            >
              Quản lý bán hàng
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: '10px 16px',
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Đăng xuất
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}
        >
          <DashboardCard
            title="Đơn hôm nay"
            value={`${todayOrders.length} đơn`}
          />

          <DashboardCard
            title="Doanh thu hôm nay"
            value={`${todayRevenue.toLocaleString('vi-VN')}đ`}
          />

          <DashboardCard
            title="Đang giao"
            value={`${delivering} đơn`}
          />

          <DashboardCard
            title="Chưa thanh toán"
            value={`${unpaid} đơn`}
          />
        </div>

        <div
          style={{
            textAlign: 'center',
            marginTop: 40,
          }}
        >
          <button
            onClick={() => setPage('new-order')}
            style={{
              padding: '16px 30px',
              background: '#2f855a',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            + Tạo đơn mới
          </button>
        </div>

        <div
          style={{
            marginTop: 45,
          }}
        >
          <h2
            style={{
              textAlign: 'center',
            }}
          >
            Đơn hàng hôm nay
          </h2>

          {todayOrders.length === 0 ? (
            <p
              style={{
                textAlign: 'center',
                color: '#666',
              }}
            >
              Chưa có đơn hàng hôm nay.
            </p>
          ) : (
            <div
              style={{
                background: '#fff',
                borderRadius: 14,
                overflow: 'hidden',
              }}
            >
              {todayOrders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 2fr 1fr 1.4fr auto',
                    gap: 15,
                    padding: 18,
                    borderBottom: '1px solid #eee',
                    alignItems: 'center',
                  }}
                >
                  <strong>{order.order_code}</strong>

                  <div>
                    <strong>{order.customer_name}</strong>

                    <div
                      style={{
                        color: '#777',
                        fontSize: 14,
                        marginTop: 4,
                      }}
                    >
                      {order.customer_phone}
                    </div>
                  </div>

                  <div>
                    {Number(order.total || 0).toLocaleString('vi-VN')}đ
                  </div>

                  <div>
                    {order.payment_status === 'PAID'
                      ? 'Đã thanh toán'
                      : 'Chưa thanh toán'}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedOrder(order)
                      setPage('order-detail')
                    }}
                    style={{
                      padding: '9px 13px',
                      background: '#2f855a',
                      color: '#fff',
                      border: 0,
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    Xem chi tiết
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LoginPage({
  email,
  setEmail,
  password,
  setPassword,
  message,
  handleLogin,
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f7f4',
        padding: 20,
        boxSizing: 'border-box',
        fontFamily: 'Arial',
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: 420,
          maxWidth: '100%',
          background: '#fff',
          padding: 32,
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
          }}
        >
          FreshFood Admin
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <button
          type="submit"
          style={{
            width: '100%',
            padding: 14,
            background: '#2f855a',
            color: '#fff',
            border: 0,
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          Đăng nhập
        </button>

        {message && (
          <p
            style={{
              textAlign: 'center',
            }}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  )
}

function NewOrder({ onBack, onCreated }) {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')

  const [shippingFee, setShippingFee] = useState(0)
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')

  const [products, setProducts] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [items, setItems] = useState([])

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('name')

    if (error) {
      console.error('Lỗi tải sản phẩm:', error)
      return
    }

    setProducts(data || [])
  }

  function addItem() {
    const product = products.find(
      (p) => String(p.id) === String(selectedProductId)
    )

    if (!product) {
      alert('Hãy chọn sản phẩm')
      return
    }

    const qty = Number(quantity)

    if (!qty || qty <= 0) {
      alert('Số lượng phải lớn hơn 0')
      return
    }

    const itemTotal = qty * Number(product.price || 0)

    setItems([
      ...items,
      {
        product_id: product.id,
        product_name: product.name,
        unit: product.unit,
        quantity: qty,
        unit_price: Number(product.price || 0),
        total: itemTotal,
      },
    ])

    setSelectedProductId('')
    setQuantity(1)
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  )

  const total = subtotal + Number(shippingFee || 0)

  async function saveOrder(e) {
    e.preventDefault()

    if (items.length === 0) {
      setMessage('Đơn hàng chưa có sản phẩm')
      return
    }

    setMessage('Đang lưu đơn...')

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          source: 'Zalo',
          shipping_fee: Number(shippingFee || 0),
          subtotal,
          total,
          payment_status: 'UNPAID',
          order_status: 'NEW',
          note,
        },
      ])
      .select()
      .single()

    if (orderError) {
      console.error(orderError)

      setMessage('Lỗi tạo đơn: ' + orderError.message)
      return
    }

    const orderItems = items.map((item) => ({
      order_id: orderData.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      total: item.total,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error(itemsError)

      setMessage(
        'Đã tạo đơn nhưng lỗi lưu sản phẩm: ' + itemsError.message
      )
      return
    }

    setMessage('Tạo đơn thành công')

    setTimeout(() => {
      onCreated()
    }, 700)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f7f4',
        padding: 30,
        boxSizing: 'border-box',
        fontFamily: 'Arial',
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          background: '#fff',
          padding: 30,
          borderRadius: 14,
        }}
      >
        <button
          onClick={onBack}
          style={{
            marginBottom: 20,
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
          }}
        >
          ← Quay lại
        </button>

        <h1>Tạo đơn mới</h1>

        <form onSubmit={saveOrder}>
          <label>Tên khách hàng</label>

          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            style={inputStyle}
          />

          <label>Số điện thoại</label>

          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            required
            style={inputStyle}
          />

          <label>Địa chỉ</label>

          <input
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            required
            style={inputStyle}
          />

          <h2>Sản phẩm</h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr auto',
              gap: 12,
              marginBottom: 20,
            }}
          >
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              style={{
                padding: 12,
              }}
            >
              <option value="">Chọn sản phẩm</option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name}
                  {' - '}
                  {Number(product.price || 0).toLocaleString('vi-VN')}
                  đ/{product.unit}
                </option>
              ))}
            </select>

            <input
              type="number"
              step="0.001"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={{
                padding: 12,
              }}
            />

            <button
              type="button"
              onClick={addItem}
              style={{
                padding: '12px 20px',
                cursor: 'pointer',
              }}
            >
              + Thêm
            </button>
          </div>

          {items.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr auto',
                gap: 12,
                padding: '12px 0',
                borderBottom: '1px solid #ddd',
                alignItems: 'center',
              }}
            >
              <strong>{item.product_name}</strong>

              <div>
                {item.quantity} {item.unit}
              </div>

              <div>
                {Number(item.total).toLocaleString('vi-VN')}đ
              </div>

              <button
                type="button"
                onClick={() => removeItem(index)}
              >
                Xóa
              </button>
            </div>
          ))}

          <div
            style={{
              marginTop: 25,
            }}
          >
            <label>Phí ship</label>

            <input
              type="number"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div
            style={{
              background: '#f5f5f5',
              padding: 20,
              borderRadius: 10,
              marginBottom: 20,
            }}
          >
            <p>
              Tạm tính:{' '}
              <strong>
                {subtotal.toLocaleString('vi-VN')}đ
              </strong>
            </p>

            <p>
              Phí ship:{' '}
              <strong>
                {Number(shippingFee || 0).toLocaleString('vi-VN')}đ
              </strong>
            </p>

            <h2>
              Tổng: {total.toLocaleString('vi-VN')}đ
            </h2>
          </div>

          <label>Ghi chú</label>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              minHeight: 80,
              boxSizing: 'border-box',
              marginBottom: 20,
            }}
          />

          <button
            type="submit"
            style={{
              width: '100%',
              padding: 15,
              background: '#2f855a',
              color: '#fff',
              border: 0,
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            Lưu đơn
          </button>

          {message && <p>{message}</p>}
        </form>
      </div>
    </div>
  )
}

function OrderDetail({
  order,
  onBack,
  onUpdated,
}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const [orderStatus, setOrderStatus] = useState(
    order.order_status || 'NEW'
  )

  const [paymentStatus, setPaymentStatus] = useState(
    order.payment_status || 'UNPAID'
  )

  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)
      .order('id', {
        ascending: true,
      })

    if (error) {
      console.error('Lỗi tải sản phẩm:', error)
      setLoading(false)
      return
    }

    setItems(data || [])
    setLoading(false)
  }

  async function updateStatus() {
    const { data, error } = await supabase
      .from('orders')
      .update({
        order_status: orderStatus,
        payment_status: paymentStatus,
      })
      .eq('id', order.id)
      .select()
      .single()

    if (error) {
      alert('Lỗi cập nhật: ' + error.message)
      return
    }

    alert('Đã cập nhật trạng thái')

    onUpdated(data)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f7f4',
        padding: 30,
        boxSizing: 'border-box',
        fontFamily: 'Arial',
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          background: '#fff',
          padding: 30,
          borderRadius: 14,
        }}
      >
        <button
          onClick={onBack}
          style={{
            marginBottom: 20,
            cursor: 'pointer',
          }}
        >
          ← Quay lại
        </button>

        <h1>Chi tiết đơn hàng</h1>

        <p>
          <strong>Mã đơn:</strong>{' '}
          {order.order_code}
        </p>

        <p>
          <strong>Khách hàng:</strong>{' '}
          {order.customer_name}
        </p>

        <p>
          <strong>SĐT:</strong>{' '}
          {order.customer_phone}
        </p>

        <p>
          <strong>Địa chỉ:</strong>{' '}
          {order.customer_address}
        </p>

        <hr />

        <h2>Sản phẩm</h2>

        {loading ? (
          <p>Đang tải...</p>
        ) : items.length === 0 ? (
          <p>Đơn hàng chưa có sản phẩm.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                gap: 12,
                padding: '12px 0',
                borderBottom: '1px solid #eee',
                alignItems: 'center',
              }}
            >
              <strong>{item.product_name}</strong>

              <div>
                {item.quantity} {item.unit}
              </div>

              <div>
                {Number(item.unit_price || 0).toLocaleString('vi-VN')}đ
              </div>

              <div>
                {Number(item.total || 0).toLocaleString('vi-VN')}đ
              </div>
            </div>
          ))
        )}

        <div
          style={{
            marginTop: 25,
            background: '#f7f7f7',
            padding: 20,
            borderRadius: 10,
          }}
        >
          <p>
            Tạm tính:{' '}
            <strong>
              {Number(order.subtotal || 0).toLocaleString('vi-VN')}đ
            </strong>
          </p>

          <p>
            Phí ship:{' '}
            <strong>
              {Number(order.shipping_fee || 0).toLocaleString('vi-VN')}đ
            </strong>
          </p>

          <h2>
            Tổng:{' '}
            {Number(order.total || 0).toLocaleString('vi-VN')}đ
          </h2>
        </div>

        <div
          style={{
            marginTop: 25,
          }}
        >
          <label>Trạng thái đơn</label>

          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            style={inputStyle}
          >
            <option value="NEW">Mới</option>
            <option value="PREPARING">Chuẩn bị</option>
            <option value="DELIVERING">Đang giao</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          <label>Thanh toán</label>

          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            style={inputStyle}
          >
            <option value="UNPAID">Chưa thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
          </select>

          <button
            onClick={updateStatus}
            style={{
              width: '100%',
              padding: 14,
              background: '#2f855a',
              color: '#fff',
              border: 0,
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            Cập nhật trạng thái
          </button>

          <button
            onClick={() => window.print()}
            style={{
              width: '100%',
              padding: 14,
              background: '#222',
              color: '#fff',
              border: 0,
              borderRadius: 8,
              cursor: 'pointer',
              marginTop: 12,
              fontSize: 16,
            }}
          >
            🖨 In bill
          </button>
        </div>

        <PrintBill
          order={order}
          items={items}
        />
      </div>
    </div>
  )
}

function DashboardCard({
  title,
  value,
}) {
  return (
    <div
      style={{
        background: '#fff',
        padding: 24,
        borderRadius: 14,
        boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          color: '#777',
          margin: 0,
        }}
      >
        {title}
      </p>

      <h2
        style={{
          marginBottom: 0,
        }}
      >
        {value}
      </h2>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: 12,
  marginTop: 6,
  marginBottom: 16,
  boxSizing: 'border-box',
  border: '1px solid #ccc',
  borderRadius: 6,
}

export default App
