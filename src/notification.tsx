import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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

  // 알림 받아오기
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Notification[]>(
        `${BACKEND_URL}/notifications`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
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
      onFriendAccepted?.();
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

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4 py-8 px-4">
      {loading ? (
        // 🔷 로딩 skeleton 추가
        Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="w-3/4 h-4" />
              <Skeleton className="w-1/2 h-3" />
            </CardContent>
          </Card>
        ))
      ) : notifications.length === 0 ? (
        <div className="text-center text-gray-500 text-sm">
          새로운 알림이 없습니다.
        </div>
      ) : (
        notifications.map((noti) => (
          <Card
            key={noti.notification_id}
            className={noti.is_read ? 'bg-gray-100' : 'bg-white'}
          >
            <CardContent className="p-4 flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="text-sm text-gray-800">{noti.message}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(noti.created_at).toLocaleString()}
                </div>
              </div>

              {/* 🔷 버튼영역 */}
              <div className="flex flex-col items-end gap-2">
                {noti.friendships_id && (
                  <Button
                    size="sm"
                    variant="default"
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() =>
                      handleAccept(noti.friendships_id, noti.notification_id)
                    }
                  >
                    수락
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-500 px-2"
                  onClick={() => handleDelete(noti.notification_id)}
                >
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export default NotificationTab;
