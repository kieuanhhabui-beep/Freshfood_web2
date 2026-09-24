function PrintBill({ order, items = [] }) {
  // =====================================================
  // CHỈ CẦN SỬA THÔNG TIN CỬA HÀNG Ở ĐÂY
  // =====================================================
  const store = {
    name: 'THỰC PHẨM SẠCH THANH HUYỀN ',
    bank: 'AGRIBANK',
    accountNumber: '1482205527361',
    accountName: 'BUI HA KIEU ANH ',
  }

  // Format tiền Việt Nam
  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('vi-VN') + 'đ'
  }

  // Format ngày giờ
  const formatDate = (value) => {
    if (!value) return ''

    return new Date(value).toLocaleString('vi-VN')
  }

  function BillCopy({ copyName }) {
    return (
      <div className="bill-copy">

        {/* TÊN CỬA HÀNG */}
        <div className="bill-center">
          <h2>{store.name}</h2>
          <strong>{copyName}</strong>
        </div>

        <div className="bill-line" />

        {/* THÔNG TIN ĐƠN */}
        <div className="bill-info">
          <p>
            <strong>Mã đơn:</strong> {order?.order_code}
          </p>

          <p>
            <strong>Ngày:</strong> {formatDate(order?.created_at)}
          </p>
        </div>

        <div className="bill-line" />

        {/* THÔNG TIN KHÁCH */}
        <div className="bill-info">
          <p>
            <strong>Khách hàng:</strong> {order?.customer_name}
          </p>

          <p>
            <strong>SĐT:</strong> {order?.customer_phone}
          </p>

          <p>
            <strong>Địa chỉ:</strong> {order?.customer_address}
          </p>
        </div>

        <div className="bill-line" />

        {/* TIÊU ĐỀ SẢN PHẨM */}
        <div className="bill-row bill-header">
          <span>Sản phẩm</span>
          <span>Thành tiền</span>
        </div>

        <div className="bill-line-small" />

        {/* DANH SÁCH SẢN PHẨM */}
        {items.length === 0 ? (
          <p>Không có sản phẩm.</p>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id || index}
              className="bill-item"
            >
              <strong>{item.product_name}</strong>

              <div className="bill-row bill-item-detail">
                <span>
                  {item.quantity} {item.unit}
                  {' × '}
                  {formatMoney(item.unit_price)}
                </span>

                <span>
                  {formatMoney(item.total)}
                </span>
              </div>
            </div>
          ))
        )}

        <div className="bill-line" />

        {/* TỔNG TIỀN */}
        <div className="bill-row">
          <span>Tạm tính:</span>

          <span>
            {formatMoney(order?.subtotal)}
          </span>
        </div>

        <div className="bill-row">
          <span>Phí ship:</span>

          <span>
            {formatMoney(order?.shipping_fee)}
          </span>
        </div>

        <div className="bill-line-small" />

        <div className="bill-total">
          <span>TỔNG:</span>

          <span>
            {formatMoney(order?.total)}
          </span>
        </div>

        <div className="bill-line" />

        {/* TRẠNG THÁI THANH TOÁN */}
        <div className="bill-center payment-status">

          {order?.payment_status === 'PAID' ? (
            <strong>ĐÃ THANH TOÁN</strong>
          ) : (
            <strong>CHƯA THANH TOÁN</strong>
          )}

        </div>

        <div className="bill-line" />

        {/* THÔNG TIN NGÂN HÀNG */}
        <div className="bill-center">

          <strong>
            THÔNG TIN CHUYỂN KHOẢN
          </strong>

          <p>{store.bank}</p>

          <p>
            STK: <strong>{store.accountNumber}</strong>
          </p>

          <p>
            CTK: <strong>{store.accountName}</strong>
          </p>

          {/* QR */}
          <img
            src="/qr-bank.png"
            className="bill-qr"
            alt="QR chuyển khoản"
          />

          <p>Nội dung chuyển khoản:</p>

          <strong>
            {order?.order_code}
          </strong>

        </div>

        <div className="bill-line" />

        {/* FOOTER */}
        <div className="bill-center bill-footer">
          <p>Cảm ơn quý khách!</p>
        </div>

      </div>
    )
  }

  return (
    <>
      <style>
        {`

        /* =========================================
           BÌNH THƯỜNG KHÔNG HIỂN THỊ BILL
        ========================================= */

        .bill-print-area {
          display: none;
        }


        /* =========================================
           CHỈ HIỂN THỊ KHI BẤM PRINT
        ========================================= */

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

            background: white;
          }


          /* KHỔ GIẤY */

          @page {
            size: 80mm auto;
            margin: 2mm;
          }


          /* BILL */

          .bill-copy {

            width: 76mm;

            padding: 2mm;

            box-sizing: border-box;

            font-family:
              Arial,
              Helvetica,
              sans-serif;

            font-size: 12px;

            line-height: 1.35;

            color: #000;

            background: #fff;
          }


          /* BẢN THỨ 2 */

          .bill-copy + .bill-copy {

            page-break-before: always;
          }


          /* CENTER */

          .bill-center {

            text-align: center;
          }


          /* TÊN SHOP */

          .bill-center h2 {

            margin: 0 0 4px 0;

            font-size: 20px;

            font-weight: 700;
          }


          /* ĐƯỜNG NGĂN */

          .bill-line {

            border-top:
              1px dashed #000;

            margin:
              8px 0;
          }


          .bill-line-small {

            border-top:
              1px dotted #555;

            margin:
              5px 0;
          }


          /* ROW */

          .bill-row {

            display: flex;

            justify-content:
              space-between;

            align-items:
              flex-start;

            gap: 8px;

            margin:
              4px 0;
          }


          .bill-row span:last-child {

            text-align: right;

            white-space: nowrap;
          }


          /* HEADER SẢN PHẨM */

          .bill-header {

            font-weight: bold;
          }


          /* SẢN PHẨM */

          .bill-item {

            margin-bottom: 8px;
          }


          .bill-item-detail {

            font-size: 11px;
          }


          /* TOTAL */

          .bill-total {

            display: flex;

            justify-content:
              space-between;

            font-size: 16px;

            font-weight: bold;

            margin-top: 6px;
          }


          /* QR */

          .bill-qr {

            display: block;

            width: 36mm;

            height: 36mm;

            object-fit: contain;

            margin:
              8px auto;
          }


          /* PAYMENT */

          .payment-status {

            font-size: 14px;
          }


          /* TEXT */

          .bill-copy p {

            margin:
              4px 0;

            word-break:
              break-word;
          }


          /* FOOTER */

          .bill-footer {

            margin-top: 8px;

            font-style: italic;
          }

        }

        `}
      </style>


      <div className="bill-print-area">

        {/* BILL KHÁCH */}

        <BillCopy
          copyName="BẢN KHÁCH HÀNG"
        />


        {/* BILL CỬA HÀNG */}

        <BillCopy
          copyName="BẢN CỬA HÀNG"
        />

      </div>
    </>
  )
}

export default PrintBill