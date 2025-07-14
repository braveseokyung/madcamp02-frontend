// NotificationTab.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Notification {
  notification_id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  friendship_id?: number; // 친구 요청 알림에만 포함
}

interface NotificationTabProps {
  userToken: string;
  userId: number;
}

async function deleteNotification(
  user_id: number,
  notification_id: number,
  userToken: string
): Promise<boolean> {
  try {
    await axios.post(
      `${BACKEND_URL}/notification_delete`,
      { user_id, notification_id },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    return true;
  } catch (err) {
    console.error('알림 삭제 오류:', err);
    return false;
  }
}

function NotificationTab({ userToken, userId }: NotificationTabProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // 알림 목록 불러오기
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
    // eslint-disable-next-line
  }, [userToken]);

  // 친구 요청 수락/거절
  const handleFriendRequest = async (
    friendship_id: number | undefined,
    notification_id: number,
    status: 'accepted' | 'pending' | 'rejected'
  ) => {
    if (!friendship_id) return;
    try {
      await axios.patch(
        `${BACKEND_URL}/friendship/${friendship_id}`,
        { status },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      // 성공 시 해당 알림 삭제
      await handleDelete(notification_id);
    } catch (err) {
      alert('친구 요청 처리 실패');
    }
  };

  // 알림 삭제
  const handleDelete = async (notification_id: number) => {
    const success = await deleteNotification(
      userId,
      notification_id,
      userToken
    );
    if (success) {
      setNotifications((prev) =>
        prev.filter((n) => n.notification_id !== notification_id)
      );
    } else {
      alert('알림 삭제 실패');
    }
  };

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
              <div className="font-semibold">
                {noti.type === 'friend_request'
                  ? '친구 요청'
                  : noti.type === 'friend_accept'
                  ? '친구 수락'
                  : '알림'}
              </div>
              <div className="text-sm text-gray-700">{noti.message}</div>
              <div className="text-xs text-gray-400">
                {new Date(noti.created_at).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {noti.type === 'friend_request' && noti.friendship_id ? (
                <>
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-1 rounded"
                    onClick={() =>
                      handleFriendRequest(
                        noti.friendship_id,
                        noti.notification_id,
                        'accepted'
                      )
                    }
                  >
                    수락
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gray-300 hover:bg-red-400 text-black font-bold px-4 py-1 rounded"
                    onClick={() =>
                      handleFriendRequest(
                        noti.friendship_id,
                        noti.notification_id,
                        'rejected'
                      )
                    }
                  >
                    거절
                  </Button>
                </>
              ) : (
                <button
                  className="text-gray-400 hover:text-red-400 text-lg px-2"
                  aria-label="알림 삭제"
                  onClick={() => handleDelete(noti.notification_id)}
                >
                  ×
                </button>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

export default NotificationTab;
