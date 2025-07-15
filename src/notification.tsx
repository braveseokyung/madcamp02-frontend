import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Badge } from './components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from './components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './components/ui/tooltip';
import { Separator } from './components/ui/separator';

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
      setNotifications([]);
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
    } catch (err) {
      // 수락 실패 시 Alert Toast 등으로 안내 가능
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
      // 삭제 실패 시 Alert Toast 등으로 안내 가능
    }
  };

  // 친구 요청 알림 판별
  const isFriendRequest = (noti: Notification) => !!noti.friendships_id;
  const getIcon = (noti: Notification) => (isFriendRequest(noti) ? '🤝' : '🔔');
  const getBadge = (noti: Notification) =>
    isFriendRequest(noti) ? (
      <Badge variant="secondary" className="ml-2">
        친구 요청
      </Badge>
    ) : null;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6 mt-10 bg-[#FFFFFF]">
      {/* 로딩/없음 처리 - Alert 활용 */}
      {loading ? (
        <Alert>
          <AlertTitle>로딩 중...</AlertTitle>
          <AlertDescription>알림을 불러오고 있습니다.</AlertDescription>
        </Alert>
      ) : notifications.length === 0 ? (
        <Alert variant="default">
          <AlertTitle>새로운 알림이 없습니다.</AlertTitle>
          <AlertDescription>모든 소식은 확인되었습니다.</AlertDescription>
        </Alert>
      ) : (
        notifications.map((noti) => (
          <Card
            key={noti.notification_id}
            className={`flex items-center gap-4 px-5 py-4 shadow-md rounded-2xl transition
              border-l-4
              ${
                noti.is_read
                  ? 'bg-muted border-slate-200'
                  : 'bg-primary/5 border-blue-600'
              }
            `}
          >
            {/* Avatar with Icon */}
            <CardHeader className="p-0 mr-2">
              <Avatar className="bg-blue-100 text-2xl w-12 h-12">
                <AvatarFallback>{getIcon(noti)}</AvatarFallback>
              </Avatar>
            </CardHeader>

            {/* Message + Time + Type Badge */}
            <CardContent className="py-0 flex flex-col flex-grow justify-center pl-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  {noti.message}
                </span>
                {!noti.is_read && <Badge variant="destructive">새 알림</Badge>}
                {getBadge(noti)}
              </div>
              <span className="text-xs text-gray-400 mt-1">
                {new Date(noti.created_at).toLocaleString()}
              </span>
            </CardContent>

            <div className="flex flex-col gap-2 items-end pl-2 min-w-[80px]">
              {isFriendRequest(noti) && (
                <Button
                  variant="default"
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() =>
                    handleAccept(noti.friendships_id, noti.notification_id)
                  }
                >
                  수락
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-500"
                aria-label="알림 삭제"
                onClick={() => handleDelete(noti.notification_id)}
              >
                ×
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

export default NotificationTab;
