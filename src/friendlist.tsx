import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Friend {
  friendshipId: number;
  status: string; // 'pending', 'accepted', 'rejected'
  direction: 'incoming' | 'outgoing';
  requestedAt: string;
  respondedAt: string | null;
  user: {
    userId: number;
    nickname: string;
    profileImageUrl?: string;
  };
}

interface UserSearchResult {
  user_id: number;
  nickname: string;
  email: string;
  profile_image_url?: string;
  is_online?: boolean;
}

interface FriendListProps {
  userToken: string;
  myUserId: number;
}

async function searchByNickname(nickname: string): Promise<UserSearchResult[]> {
  if (!nickname) return [];
  try {
    const res = await axios.get(`${BACKEND_URL}/searchnickname`, {
      params: { nickname },
    });
    return res.data;
  } catch (err) {
    console.error('닉네임 검색 오류:', err);
    return [];
  }
}

async function addFriend(
  requesterid: number,
  receiverid: number
): Promise<void> {
  if (!requesterid || !receiverid) return;
  try {
    await axios.post(`${BACKEND_URL}/friendship_add`, {
      requester_user_id: requesterid,
      receiver_user_id: receiverid,
      status: 'pending',
    });
  } catch (err) {
    console.error('친구 추가 오류:', err);
  }
}

async function addNotification(
  user_id: number,
  type: string,
  message: string
): Promise<void> {
  if (!user_id || !type || !message) return;
  try {
    await axios.post(`${BACKEND_URL}/notification_add`, {
      user_id,
      type,
      message,
    });
  } catch (err) {
    console.error('알림 추가 오류:', err);
  }
}

const FriendList: React.FC<FriendListProps> = ({ userToken, myUserId }) => {
  const [selectedFriend, setSelectedFriend] = useState<UserSearchResult | null>(
    null
  );
  const [showSearch, setShowSearch] = useState(false);

  // 검색 관련 상태
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // 친구 목록 상태
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);

  // 검색 입력 핸들러
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // 검색 버튼 클릭 또는 엔터 시
  const doSearch = async () => {
    setSearchLoading(true);
    const results = await searchByNickname(searchInput);
    setSearchResults(results);
    setSearchLoading(false);
  };

  // 엔터로도 검색 가능
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') doSearch();
  };

  // 친구 추가
  const handleAddFriend = async (
    receiverUserId: number,
    receiverNickname: string
  ) => {
    if (!myUserId) {
      alert('로그인 필요');
      return;
    }
    if (myUserId === receiverUserId) {
      alert('자기 자신에게 친구 요청을 보낼 수 없습니다.');
      return;
    }
    try {
      await addFriend(myUserId, receiverUserId);
      await addNotification(
        receiverUserId,
        'friend_request',
        `${receiverNickname}님께 친구 요청을 보냈습니다.`
      );
      alert('친구 요청이 전송되었습니다!');
      setShowSearch(false);
      fetchFriends();
    } catch (err) {
      alert('친구 추가 요청 실패');
    }
  };

  // 친구 요청 수락/거절
  const handleFriendshipAction = async (
    friendshipId: number,
    status: 'accepted' | 'rejected'
  ) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/friendship/${friendshipId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      fetchFriends();
      alert(
        status === 'accepted'
          ? '친구 요청을 수락했습니다.'
          : '친구 요청을 거절했습니다.'
      );
    } catch (err) {
      alert('처리 실패');
    }
  };

  // 친구 목록 불러오기
  const fetchFriends = async () => {
    setFriendsLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/friends`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      // accepted만 필터
      setFriends(res.data.filter((f: Friend) => f.status === 'accepted'));
    } catch (err) {
      console.error('친구 목록 조회 실패:', err);
    }
    setFriendsLoading(false);
  };

  useEffect(() => {
    if (userToken) fetchFriends();
  }, [userToken]);

  // 검색 결과 클릭 시 친구 정보 모달로 보여주기
  const handleSearchResultClick = (user: UserSearchResult) => {
    setSelectedFriend(user);
    setShowSearch(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-100 rounded-t-lg">
        <span className="text-xl font-bold">내 친구 목록</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSearch(true)}
          className="text-2xl"
          aria-label="친구 검색"
        >
          +
        </Button>
      </div>

      {/* 친구 리스트 (accepted만) */}
      <div className="flex flex-col gap-2 p-8 bg-white rounded-b-lg">
        {friendsLoading && <div>로딩 중...</div>}
        {!friendsLoading && friends.length === 0 && (
          <div className="text-gray-400">친구가 없습니다.</div>
        )}
        {friends.map((friend) => (
          <div
            key={friend.friendshipId}
            className="flex items-center gap-3 p-2 border-b"
          >
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold overflow-hidden">
              {friend.user.profileImageUrl ? (
                <img
                  src={friend.user.profileImageUrl}
                  alt={friend.user.nickname}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{friend.user.nickname[0]}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">{friend.user.nickname}</span>
              <span className="text-xs text-gray-500">친구</span>
            </div>
          </div>
        ))}
      </div>

      {/* 친구 정보 모달 (검색 결과에서 클릭 시) */}
      <Dialog
        open={!!selectedFriend}
        onOpenChange={() => setSelectedFriend(null)}
      >
        <DialogContent className="max-w-xs bg-[#FFFFFF]">
          <DialogHeader>
            <DialogTitle>유저 정보</DialogTitle>
            <DialogClose asChild></DialogClose>
          </DialogHeader>
          {selectedFriend && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold">
                {selectedFriend.nickname[0]}
              </div>
              <div className="text-lg font-bold">{selectedFriend.nickname}</div>
              <div className="text-gray-500">{selectedFriend.email}</div>
              <div className="text-sm text-green-600">
                {selectedFriend.is_online ? '온라인' : '오프라인'}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 친구 검색 모달 */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="max-w-md bg-[#FFFFFF]">
          <DialogHeader>
            <DialogTitle>친구 검색</DialogTitle>
            <DialogClose asChild></DialogClose>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                placeholder="닉네임으로 검색"
                value={searchInput}
                onChange={handleSearchInput}
                onKeyDown={handleSearchKeyDown}
              />
              <Button onClick={doSearch} disabled={searchLoading}>
                검색
              </Button>
            </div>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {searchLoading && <div>검색 중...</div>}
              {!searchLoading && searchResults.length === 0 && (
                <div className="text-gray-400">검색 결과가 없습니다.</div>
              )}
              {searchResults.map((user) => (
                <div
                  key={user.user_id}
                  className="p-3 rounded-md hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold">
                    {user.nickname[0]}
                  </div>
                  <div>
                    <div className="font-semibold">{user.nickname}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <div
                    className={`ml-auto text-xs ${
                      user.is_online ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {user.is_online ? '온라인' : '오프라인'}
                  </div>
                  <Button
                    size="sm"
                    className="ml-2"
                    onClick={() => handleAddFriend(user.user_id, user.nickname)}
                  >
                    친구 추가
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FriendList;
