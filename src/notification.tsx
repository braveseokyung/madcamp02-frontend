import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Notification {
  notification_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  friendships_id?: number;
}

interface NotificationTabProps {
  userToken: string;
  userId: number;
  onFriendAccepted?: () => void;
}

function NotificationTab({
  userToken,
  userId,
  onFriendAccepted,
}: NotificationTabProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/notifications`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('알림 목록 조회 실패:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userToken) fetchNotifications();
  }, [userToken]);

  // 친구 요청 수락
  const handleAccept = async (
    friendships_id: number | undefined,
    notification_id: number
  ) => {
    if (!friendships_id) return;
    try {
      await axios.patch(
        `${BACKEND_URL}/friendship/${friendships_id}`,
        { status: 'accepted' },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      await handleDelete(notification_id);
      if (onFriendAccepted) onFriendAccepted();
      alert('친구 요청을 수락했습니다!');
    } catch (err) {
      alert('친구 요청 수락 실패');
    }
  };

  // 알림 삭제
  const handleDelete = async (notification_id: number) => {
    try {
      await axios.post(
        `${BACKEND_URL}/notification_delete`,
        { user_id: userId, notification_id },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      setNotifications((prev) =>
        prev.filter((n) => n.notification_id !== notification_id)
      );
    } catch {
      alert('알림 삭제 실패');
    }
  };

  // 친구 요청 알림 판별
  const isFriendRequest = (noti: Notification) => !!noti.friendships_id;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4 mt-8">
      {loading ? (
        <div className="text-center text-gray-400">로딩 중...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-gray-400">새로운 알림이 없습니다.</div>
      ) : (
        notifications.map((noti) => (
          <Card
            key={noti.notification_id}
            className={`flex items-center justify-between px-6 py-4 gap-4 shadow-sm ${
              noti.is_read ? 'bg-gray-100' : 'bg-white'
            }`}
          >
            <div>
              <div className="text-sm text-gray-700">{noti.message}</div>
              <div className="text-xs text-gray-400">
                {new Date(noti.created_at).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isFriendRequest(noti) && (
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-1 rounded"
                  onClick={() =>
                    handleAccept(noti.friendships_id, noti.notification_id)
                  }
                >
                  수락
                </Button>
              )}
              <button
                className="text-gray-400 hover:text-red-400 text-lg px-2"
                aria-label="알림 삭제"
                onClick={() => handleDelete(noti.notification_id)}
              >
                ×
              </button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

export default NotificationTab;
