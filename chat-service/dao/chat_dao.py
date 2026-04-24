from dao.models import ChatRoom, Message


class ChatRoomDAO:

    @staticmethod
    def get_or_create(booking_id: str) -> ChatRoom:
        room, _ = ChatRoom.objects.get_or_create(booking_id=booking_id)
        return room

    @staticmethod
    def get_by_booking(booking_id: str):
        return ChatRoom.objects.filter(booking_id=booking_id).first()


class MessageDAO:

    @staticmethod
    def create(room_id: str, sender_id: str,
               sender_name: str, content: str) -> Message:
        return Message.objects.create(
            room_id=room_id, sender_id=sender_id,
            sender_name=sender_name, content=content,
        )

    @staticmethod
    def get_recent(room_id: str, limit: int = 50):
        return Message.objects.filter(room_id=room_id).order_by('-created_at')[:limit]

    @staticmethod
    def mark_read(room_id: str, reader_id: str) -> None:
        Message.objects.filter(room_id=room_id, is_read=False).exclude(
            sender_id=reader_id
        ).update(is_read=True)
