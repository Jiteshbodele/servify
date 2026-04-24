from dao.models import Transaction


class TransactionDAO:

    @staticmethod
    def create(booking_id: str, seeker_user_id: str, amount: float,
               gateway_order_id: str = '') -> Transaction:
        return Transaction.objects.create(
            booking_id=booking_id, seeker_user_id=seeker_user_id,
            amount=amount, gateway_order_id=gateway_order_id,
        )

    @staticmethod
    def get_by_order_id(gateway_order_id: str):
        return Transaction.objects.filter(gateway_order_id=gateway_order_id).first()

    @staticmethod
    def get_by_id(txn_id: str):
        return Transaction.objects.filter(id=txn_id).first()

    @staticmethod
    def get_by_seeker(seeker_user_id: str):
        return Transaction.objects.filter(seeker_user_id=seeker_user_id).order_by('-created_at')

    @staticmethod
    def mark_success(txn_id: str, gateway_ref: str) -> None:
        Transaction.objects.filter(id=txn_id).update(
            status='success', gateway_ref=gateway_ref
        )

    @staticmethod
    def mark_failed(txn_id: str, reason: str = '') -> None:
        Transaction.objects.filter(id=txn_id).update(
            status='failed', failure_reason=reason
        )

    @staticmethod
    def create_refund(original: Transaction) -> Transaction:
        return Transaction.objects.create(
            booking_id=original.booking_id,
            seeker_user_id=original.seeker_user_id,
            amount=original.amount,
            currency=original.currency,
            type='refund',
            status='refunded',
            gateway_ref=original.gateway_ref,
        )
