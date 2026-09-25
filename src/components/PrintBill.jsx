function PrintBill({ order, items }) {
  const store = {
    name: 'THỰC PHẨM SẠCH THANH HUYỀN',
    phone: '0985337779',

  }

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('vi-VN') + 'đ'
  }

  function BillCopy({ copyName }) {
    return (
      <div className="bill-copy">
        {/* HEADER LEFT */}
        <div className="bill-store-top">
          <div className="store-name">{store.name}</div>
          <div className="store-phone">Điện thoại: {store.phone}</div>
        </div>

        <div className="bill-dots"></div>

        {/* TITLE CENTER */}
        <div className="bill-center">
          <div className="bill-main-title">HÓA ĐƠN BÁN HÀNG</div>
          <div className="bill-copy-name">{copyName}</div>
        </div>

        {/* ORDER INFO */}
        <div className="bill-info-left">
          <p>
            <strong>Mã đơn hàng:</strong> {order.order_code || ''}
          </p>
          <p>
            <strong>Ngày:</strong>{' '}
            {order.created_at
              ? new Date(order.created_at).toLocaleString('vi-VN')
              : ''}
          </p>
        </div>

        <div className="bill-dots"></div>

        {/* CUSTOMER INFO */}
        <div className="bill-info-left">
          <p>
            <strong>Tên khách hàng:</strong> {order.customer_name || ''}
          </p>
          <p>
            <strong>SĐT:</strong> {order.customer_phone || ''}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {order.customer_address || ''}
          </p>
        </div>

        <div className="bill-dots"></div>

        {/* PRODUCT HEADER */}
        <div className="bill-product-header">
          <span>Đơn giá</span>
          <span>SL</span>
          <span>Thành tiền</span>
        </div>

        {/* PRODUCT LIST */}
        {items.map((item) => (
          <div key={item.id} className="bill-item">
            <div className="bill-product-name">{item.product_name}</div>

            <div className="bill-product-row">
              <span>{formatMoney(item.unit_price)}</span>
              <span>{item.quantity || 0}</span>
              <span>{formatMoney(item.total)}</span>
            </div>
          </div>
        ))}

        <div className="bill-dots"></div>

        {/* TOTAL */}
        <div className="bill-row">
          <span>Tổng tiền hàng:</span>
          <span>{formatMoney(order.subtotal)}</span>
        </div>

        <div className="bill-row">
          <span>Phí ship:</span>
          <span>{formatMoney(order.shipping_fee)}</span>
        </div>

        <div className="bill-total">
          <span>Tổng cộng:</span>
          <span>{formatMoney(order.total)}</span>
        </div>

        <div className="bill-dots"></div>

        {/* BANK INFO */}
        <div className="bill-center">
          <strong>THÔNG TIN CHUYỂN KHOẢN</strong>
        </div>

        <div className="bill-info-left">
          <p>
            <strong>Ngân hàng:</strong> {store.bank}
          </p>
          <p>
            <strong>Mã ngân hàng / STK:</strong> {store.accountNumber}
          </p>
          <p>
            <strong>Người nhận:</strong> {store.accountName}
          </p>
        </div>

        <div className="bill-center">
          <img
            src="/qr-bank.png"
            className="bill-qr"
            alt="QR chuyển khoản"
          />
        </div>

        <div className="bill-center bill-transfer-content">
          <p>
            <strong>Nội dung chuyển khoản:</strong>
          </p>
          <p>
            {(order.customer_name || '').toUpperCase()} {order.order_code || ''}
          </p>
        </div>

        <div className="bill-dots"></div>

        <div className="bill-center">
          <p>Cảm ơn quý khách</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>
        {`
          .bill-print-area {
            display: none;
          }

          @media print {
            body * {
              visibility: hidden !important;
            }

            .bill-print-area,
            .bill-print-area * {
              visibility: visible !important;
            }

            .bill-print-area {
              display: block !important;
              position: absolute;
              left: 0;
              top: 0;
              width: 80mm;
            }

            @page {
              size: 80mm auto;
              margin: 2mm;
            }

            .bill-copy {
              width: 76mm;
              padding: 2mm;
              box-sizing: border-box;
              font-family: Arial, sans-serif;
              font-size: 12px;
              color: #000;
            }

            .bill-copy + .bill-copy {
              page-break-before: always;
            }

            .bill-store-top {
              text-align: left;
            }

            .store-name {
              font-size: 16px;
              font-weight: 700;
              text-transform: uppercase;
              line-height: 1.2;
            }

            .store-phone {
              margin-top: 4px;
              font-size: 12px;
            }

            .bill-main-title {
              font-size: 18px;
              font-weight: 700;
              margin-top: 6px;
              margin-bottom: 4px;
            }

            .bill-copy-name {
              font-size: 11px;
              font-weight: 700;
              margin-bottom: 4px;
            }

            .bill-center {
              text-align: center;
            }

            .bill-info-left {
              text-align: left;
            }

            .bill-info-left p {
              margin: 3px 0;
            }

            .bill-dots {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }

            .bill-product-header {
              display: grid;
              grid-template-columns: 1fr 50px 90px;
              gap: 6px;
              font-weight: 700;
              margin-bottom: 6px;
              text-align: left;
            }

            .bill-product-header span:nth-child(2) {
              text-align: center;
            }

            .bill-product-header span:nth-child(3) {
              text-align: right;
            }

            .bill-item {
              margin-bottom: 8px;
            }

            .bill-product-name {
              text-align: left;
              font-weight: 700;
              margin-bottom: 2px;
            }

            .bill-product-row {
              display: grid;
              grid-template-columns: 1fr 50px 90px;
              gap: 6px;
              align-items: center;
            }

            .bill-product-row span:nth-child(1) {
              text-align: left;
            }

            .bill-product-row span:nth-child(2) {
              text-align: center;
            }

            .bill-product-row span:nth-child(3) {
              text-align: right;
            }

            .bill-row {
              display: flex;
              justify-content: space-between;
              margin: 4px 0;
            }

            .bill-total {
              display: flex;
              justify-content: space-between;
              font-size: 16px;
              font-weight: 700;
              margin-top: 6px;
            }

            .bill-qr {
              width: 34mm;
              height: 34mm;
              object-fit: contain;
              margin-top: 8px;
            }

            .bill-transfer-content p {
              margin: 3px 0;
            }

            p {
              margin: 4px 0;
            }
          }
        `}
      </style>

      <div className="bill-print-area">
        <BillCopy copyName="BẢN KHÁCH HÀNG" />
        <BillCopy copyName="BẢN CỬA HÀNG" />
      </div>
    </>
  )
}

export default PrintBill