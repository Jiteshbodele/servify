from dao.chat_dao import ChatRoomDAO, MessageDAO


class ChatService:

    @staticmethod
    def get_or_create_room(booking_id: str) -> dict:
        room = ChatRoomDAO.get_or_create(booking_id)
        msgs = MessageDAO.get_recent(str(room.id))
        return {
            'room_id':    str(room.id),
            'booking_id': str(room.booking_id),
            'messages':   [_fmt_msg(m) for m in reversed(list(msgs))],
        }

    @staticmethod
    def save_message(booking_id: str, sender_id: str,
                     sender_name: str, content: str) -> dict:
        room = ChatRoomDAO.get_or_create(booking_id)
        msg  = MessageDAO.create(
            room_id=str(room.id),
            sender_id=sender_id,
            sender_name=sender_name,
            content=content,
        )
        return _fmt_msg(msg)

    @staticmethod
    def mark_read(booking_id: str, reader_id: str) -> None:
        room = ChatRoomDAO.get_by_booking(booking_id)
        if room:
            MessageDAO.mark_read(str(room.id), reader_id)


def _fmt_msg(m) -> dict:
    return {
        'id':          str(m.id),
        'sender_id':   str(m.sender_id),
        'sender_name': m.sender_name,
        'content':     m.content,
        'is_read':     m.is_read,
        'created_at':  m.created_at.isoformat(),
    }
