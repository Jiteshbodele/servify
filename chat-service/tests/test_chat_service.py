from django.test import TestCase
from unittest.mock import patch, MagicMock
from service.chat_service import ChatService


class TestChatService(TestCase):

    @patch('service.chat_service.MessageDAO')
    @patch('service.chat_service.ChatRoomDAO')
    def test_get_or_create_room_returns_history(self, mock_room_dao, mock_msg_dao):
        room = MagicMock()
        room.id = 'room-id'
        room.booking_id = 'book-id'
        mock_room_dao.get_or_create.return_value = room

        msg = MagicMock()
        msg.id = 'msg-id'
        msg.sender_id = 'user-id'
        msg.sender_name = 'Test User'
        msg.content = 'Hello!'
        msg.is_read = False
        msg.created_at.isoformat.return_value = '2024-01-01T00:00:00'
        mock_msg_dao.get_recent.return_value = [msg]

        result = ChatService.get_or_create_room('book-id')
        self.assertEqual(result['booking_id'], 'book-id')
        self.assertEqual(len(result['messages']), 1)
        self.assertEqual(result['messages'][0]['content'], 'Hello!')

    @patch('service.chat_service.MessageDAO')
    @patch('service.chat_service.ChatRoomDAO')
    def test_save_message_returns_formatted(self, mock_room_dao, mock_msg_dao):
        room = MagicMock()
        room.id = 'room-id'
        mock_room_dao.get_or_create.return_value = room

        msg = MagicMock()
        msg.id = 'msg-id'
        msg.sender_id = 'user-id'
        msg.sender_name = 'Test User'
        msg.content = 'Hello!'
        msg.is_read = False
        msg.created_at.isoformat.return_value = '2024-01-01T00:00:00'
        mock_msg_dao.create.return_value = msg

        result = ChatService.save_message(
            booking_id='book-id',
            sender_id='user-id',
            sender_name='Test User',
            content='Hello!',
        )
        self.assertEqual(result['content'], 'Hello!')
        self.assertEqual(result['sender_name'], 'Test User')
