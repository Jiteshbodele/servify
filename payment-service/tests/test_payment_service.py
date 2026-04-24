from django.test import TestCase
from unittest.mock import patch, MagicMock
from rest_framework.exceptions import ValidationError

from service.payment_service import PaymentService


class TestPaymentService(TestCase):

    @patch('service.payment_service._client')
    @patch('service.payment_service.TransactionDAO')
    def test_create_order_success(self, mock_dao, mock_client):
        mock_client.return_value.order.create.return_value = {
            'id': 'order_123', 'amount': 50000, 'currency': 'INR'
        }
        txn = MagicMock()
        txn.id = 'txn-id'
        mock_dao.create.return_value = txn

        result = PaymentService.create_order(
            booking_id='book-id',
            seeker_user_id='seeker-id',
            amount=500.0,
        )
        self.assertIn('razorpay_order_id', result)
        self.assertEqual(result['razorpay_order_id'], 'order_123')

    @patch('service.payment_service._client')
    def test_create_order_razorpay_failure_raises(self, mock_client):
        mock_client.return_value.order.create.side_effect = Exception('API error')
        with self.assertRaises(ValidationError):
            PaymentService.create_order(
                booking_id='book-id',
                seeker_user_id='seeker-id',
                amount=500.0,
            )

    @patch('service.payment_service.publish')
    @patch('service.payment_service.TransactionDAO')
    @patch('service.payment_service._client')
    def test_verify_payment_invalid_signature_raises(self, mock_client, mock_dao, mock_pub):
        import razorpay
        mock_client.return_value.utility.verify_payment_signature.side_effect = \
            razorpay.errors.SignatureVerificationError('bad sig', 'sig')
        with self.assertRaises(ValidationError):
            PaymentService.verify_payment(
                razorpay_order_id='order_123',
                razorpay_payment_id='pay_123',
                razorpay_signature='bad_sig',
            )

    @patch('service.payment_service.TransactionDAO')
    def test_refund_non_success_txn_raises(self, mock_dao):
        txn = MagicMock()
        txn.status = 'pending'
        mock_dao.get_by_id.return_value = txn
        with self.assertRaises(ValidationError):
            PaymentService.refund('txn-id')

    @patch('service.payment_service.TransactionDAO')
    def test_refund_not_found_raises(self, mock_dao):
        mock_dao.get_by_id.return_value = None
        with self.assertRaises(ValidationError):
            PaymentService.refund('nonexistent-id')
