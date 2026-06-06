import uuid
import hmac
import hashlib
from django.conf import settings
from django.db import transaction as db_txn
from rest_framework.exceptions import ValidationError, NotFound
from dao.payment_dao import TransactionDAO
from dao.kafka_dao import publish


def _is_mock():
    return getattr(settings, 'MOCK_PAYMENT', True)


def _client():
    import razorpay
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class PaymentService:

    @staticmethod
    @db_txn.atomic
    def create_order(booking_id: str, seeker_user_id: str, amount: float) -> dict:
        

        if _is_mock():
            # Mock mode — generate a fake Razorpay order without calling the API
            fake_order_id = f"order_MOCK_{uuid.uuid4().hex[:16].upper()}"
            txn = TransactionDAO.create(
                booking_id=booking_id,
                seeker_user_id=seeker_user_id,
                amount=amount,
                gateway_order_id=fake_order_id,
            )
            return {
                'transaction_id':    str(txn.id),
                'razorpay_order_id': fake_order_id,
                'amount':            amount,
                'currency':          'INR',
                'key':               'MOCK_KEY',
                'mock':              True,
                'message':           'Mock payment order created. Use verify endpoint with any values to complete.',
            }

        # Real Razorpay
        try:
            order = _client().order.create({
                'amount':   amount_paise,
                'currency': 'INR',
                'notes':    {'booking_id': booking_id},
            })
        except Exception as e:
            raise ValidationError(f'Could not create payment order: {e}')

        txn = TransactionDAO.create(
            booking_id=booking_id,
            seeker_user_id=seeker_user_id,
            amount=amount,
            gateway_order_id=order['id'],
        )
        return {
            'transaction_id':    str(txn.id),
            'razorpay_order_id': order['id'],
            'amount':            order['amount'],
            'currency':          order['currency'],
            'key':               settings.RAZORPAY_KEY_ID,
            'mock':              False,
        }

    @staticmethod
    @db_txn.atomic
    def verify_payment(razorpay_order_id: str,
                       razorpay_payment_id: str,
                       razorpay_signature: str) -> dict:

        if _is_mock():
            # Mock mode — skip signature verification, just mark as success
            txn = TransactionDAO.get_by_order_id(razorpay_order_id)
            if not txn:
                raise NotFound('Transaction not found.')
            fake_payment_id = razorpay_payment_id or f"pay_MOCK_{uuid.uuid4().hex[:16].upper()}"
            TransactionDAO.mark_success(str(txn.id), fake_payment_id)
            publish('payment.success', {
                'booking_id':     str(txn.booking_id),
                'transaction_id': str(txn.id),
                'seeker_user_id': str(txn.seeker_user_id),
                'amount':         float(txn.amount),
            })
            txn.refresh_from_db()
            result = _fmt(txn)
            result['mock'] = True
            return result

        # Real Razorpay signature verification
        try:
            _client().utility.verify_payment_signature({
                'razorpay_order_id':   razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature':  razorpay_signature,
            })
        except Exception:
            raise ValidationError('Payment signature verification failed.')

        txn = TransactionDAO.get_by_order_id(razorpay_order_id)
        if not txn:
            raise NotFound('Transaction not found.')

        TransactionDAO.mark_success(str(txn.id), razorpay_payment_id)
        publish('payment.success', {
            'booking_id':     str(txn.booking_id),
            'transaction_id': str(txn.id),
            'seeker_user_id': str(txn.seeker_user_id),
            'amount':         float(txn.amount),
        })
        txn.refresh_from_db()
        return _fmt(txn)

    @staticmethod
    @db_txn.atomic
    def refund(txn_id: str) -> dict:
        txn = TransactionDAO.get_by_id(txn_id)
        if not txn or txn.status != 'success':
            raise ValidationError('Transaction not eligible for refund.')

        if _is_mock():
            refund_txn = TransactionDAO.create_refund(txn)
            TransactionDAO.mark_failed(txn_id)
            publish('payment.refunded', {
                'booking_id':     str(txn.booking_id),
                'transaction_id': str(refund_txn.id),
                'amount':         float(txn.amount),
            })
            result = _fmt(refund_txn)
            result['mock'] = True
            return result

        try:
            _client().payment.refund(txn.gateway_ref, {'amount': int(txn.amount * 100)})
        except Exception as e:
            raise ValidationError(f'Refund failed: {e}')

        refund_txn = TransactionDAO.create_refund(txn)
        TransactionDAO.mark_failed(txn_id)
        publish('payment.refunded', {
            'booking_id':     str(txn.booking_id),
            'transaction_id': str(refund_txn.id),
            'amount':         float(txn.amount),
        })
        return _fmt(refund_txn)

    @staticmethod
    def list_by_seeker(seeker_user_id: str) -> list:
        return [_fmt(t) for t in TransactionDAO.get_by_seeker(seeker_user_id)]


def _fmt(t) -> dict:
    return {
        'id':               str(t.id),
        'booking_id':       str(t.booking_id),
        'amount':           float(t.amount),
        'currency':         t.currency,
        'type':             t.type,
        'status':           t.status,
        'gateway_ref':      t.gateway_ref,
        'gateway_order_id': t.gateway_order_id,
        'created_at':       t.created_at.isoformat(),
    }
