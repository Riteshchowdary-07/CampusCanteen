from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Invoice, Order, OrderItem, MenuItem, User, UserRole
from app.schemas import InvoiceOut, OrderItemOut
from app.auth import get_current_user
from app.permissions import verify_invoice_ownership

router = APIRouter(prefix="/invoices", tags=["Invoices & Billing"])

def format_invoice_out(db: Session, inv: Invoice) -> InvoiceOut:
    customer_name = inv.order.user.full_name if (inv.order and inv.order.user) else "Customer"
    customer_email = inv.order.user.email if (inv.order and inv.order.user) else ""
    order_num = inv.order.order_number if inv.order else "ORD-UNKNOWN"
    rzp_pay_id = inv.razorpay_payment_id or (inv.order.razorpay_payment_id if inv.order else None) or "pay_sb_demo_9921"

    items_out = []
    if inv.order and inv.order.items:
        for item in inv.order.items:
            m_item = db.query(MenuItem).filter(MenuItem.id == item.menu_item_id).first()
            m_name = m_item.name if m_item else "Food Item"
            items_out.append(OrderItemOut(
                id=item.id,
                menu_item_id=item.menu_item_id,
                menu_item_name=m_name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=item.subtotal
            ))

    return InvoiceOut(
        id=inv.id,
        invoice_number=inv.invoice_number,
        order_id=inv.order_id,
        order_number=order_num,
        customer_name=customer_name,
        customer_email=customer_email,
        issue_date=inv.issue_date,
        amount=inv.amount,
        tax=inv.tax,
        status=inv.status,
        payment_method=inv.payment_method or "RAZORPAY_SANDBOX",
        razorpay_payment_id=rzp_pay_id,
        items=items_out
    )

@router.get("", response_model=List[InvoiceOut])
def get_invoices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Invoice)
    if current_user.role in (UserRole.STUDENT, UserRole.STAFF):
        query = query.filter(Invoice.user_id == current_user.id)

    invoices = query.order_by(Invoice.issue_date.desc()).all()
    return [format_invoice_out(db, inv) for inv in invoices]

@router.get("/{invoice_id}", response_model=InvoiceOut)
def get_invoice_detail(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    verify_invoice_ownership(current_user, inv)
    return format_invoice_out(db, inv)

@router.get("/{invoice_id}/html", response_class=HTMLResponse)
def generate_printable_invoice_html(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Renders a print-ready itemized PDF/HTML invoice for campus canteen records.
    """
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    verify_invoice_ownership(current_user, inv)
    formatted = format_invoice_out(db, inv)

    subtotal = round(formatted.amount - formatted.tax, 2)

    items_rows = ""
    for item in formatted.items:
        items_rows += f"""
        <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px; font-weight: bold; color: #1e293b;">{item.menu_item_name}</td>
            <td style="padding: 12px; text-align: center; color: #475569;">{item.quantity}</td>
            <td style="padding: 12px; text-align: right; color: #475569;">₹{item.unit_price:.2f}</td>
            <td style="padding: 12px; text-align: right; font-weight: bold; color: #0f172a;">₹{item.subtotal:.2f}</td>
        </tr>
        """

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Invoice {formatted.invoice_number}</title>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #334155; margin: 0; padding: 40px; }}
            .invoice-box {{ max-width: 800px; margin: auto; padding: 40px; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }}
            .header {{ display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }}
            .logo {{ font-size: 24px; font-weight: 900; color: #d97706; text-transform: uppercase; letter-spacing: 1px; }}
            .badge {{ background-color: #dcfce7; color: #166534; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; }}
            .details-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }}
            .details-card {{ background: #f1f5f9; padding: 16px; border-radius: 12px; font-size: 13px; }}
            .details-card strong {{ display: block; color: #0f172a; margin-bottom: 4px; }}
            table {{ width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }}
            th {{ background-color: #f8fafc; color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 12px; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }}
            .summary {{ float: right; width: 300px; font-size: 14px; }}
            .summary-row {{ display: flex; justify-content: space-between; padding: 6px 0; }}
            .summary-row.total {{ border-top: 2px solid #0f172a; font-size: 18px; font-weight: 900; color: #059669; padding-top: 12px; margin-top: 6px; }}
            .print-btn {{ display: block; width: 100%; max-width: 200px; margin: 30px auto 0; padding: 12px; background: #2563eb; color: #ffffff; font-weight: bold; text-align: center; border: none; border-radius: 10px; cursor: pointer; text-decoration: none; }}
            @media print {{ .print-btn {{ display: none; }} body {{ padding: 0; background: white; }} .invoice-box {{ shadow: none; border: none; }} }}
        </style>
    </head>
    <body>
        <div class="invoice-box">
            <div class="header">
                <div>
                    <div class="logo">Campus Canteen</div>
                    <span style="font-size: 12px; color: #64748b;">Smart Pre-Order Tax Invoice</span>
                </div>
                <div>
                    <span class="badge">Paid via {formatted.payment_method}</span>
                </div>
            </div>

            <div class="details-grid">
                <div class="details-card">
                    <strong>Invoice Information</strong>
                    <div>Invoice #: <b>{formatted.invoice_number}</b></div>
                    <div>Order #: <b>{formatted.order_number}</b></div>
                    <div>Date: {formatted.issue_date.strftime("%d %b %Y, %I:%M %p")}</div>
                    <div>Razorpay Payment ID: <code>{formatted.razorpay_payment_id}</code></div>
                </div>
                <div class="details-card">
                    <strong>Billed To</strong>
                    <div>Name: <b>{formatted.customer_name}</b></div>
                    <div>Email: {formatted.customer_email}</div>
                    <div>Institution: Campus University</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Item Description</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Unit Price</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items_rows}
                </tbody>
            </table>

            <div class="summary">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal:.2f}</span>
                </div>
                <div class="summary-row">
                    <span>GST (5%)</span>
                    <span>₹{formatted.tax:.2f}</span>
                </div>
                <div class="summary-row total">
                    <span>Total Paid</span>
                    <span>₹{formatted.amount:.2f}</span>
                </div>
            </div>
            <div style="clear: both;"></div>

            <button class="print-btn" onclick="window.print()">Print / Download PDF</button>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)
