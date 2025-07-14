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
  friendships_id: number;
  status: string;
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

interface SimilarityResult {
  cosine_similarity: number;
  user1_image_url: string;
  user2_image_url: string;
}

interface FriendListProps {
  userToken: string;
  myUserId: number;
  myNickname: string;
}

function getFullImageUrl(image_url: string | undefined | null) {
  if (!image_url) return '';
  // 이미 http로 시작하면 그대로, 아니면 백엔드 주소 붙이기
  if (/^https?:\/\//.test(image_url)) return image_url;
  return `${BACKEND_URL}${image_url.startsWith('/') ? '' : '/'}${image_url}`;
}

async function searchByNickname(
  nickname: string,
  userToken: string
): Promise<UserSearchResult[]> {
  if (!nickname) return [];
  try {
    const res = await axios.get(`${BACKEND_URL}/searchnickname`, {
      params: { nickname },
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return res.data;
  } catch (err) {
    console.error('닉네임 검색 오류:', err);
    return [];
  }
}

async function addFriend(
  requesterid: number,
  receiverid: number,
  userToken: string
): Promise<number | undefined> {
  if (!requesterid || !receiverid) return;
  try {
    const res = await axios.post(
      `${BACKEND_URL}/friendship_add`,
      {
        requester_user_id: requesterid,
        receiver_user_id: receiverid,
        status: 'pending',
      },
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );
    return res.data.friendships_id;
  } catch (err) {
    console.error('친구 추가 오류:', err);
    return;
  }
}

async function addNotification(
  user_id: number,
  message: string,
  friendships_id: number,
  userToken: string
): Promise<void> {
  if (!user_id || !message || !friendships_id) return;
  try {
    await axios.post(
      `${BACKEND_URL}/notification_add`,
      {
        user_id,
        message,
        friendships_id,
      },
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );
  } catch (err) {
    console.error('알림 추가 오류:', err);
  }
}

const FriendList: React.FC<FriendListProps> = ({
  userToken,
  myUserId,
  myNickname,
}) => {
  // 친구 검색 관련
  const [showSearch, setShowSearch] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // 친구 목록
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);

  // 친구 정보 모달
  const [selectedFriend, setSelectedFriend] = useState<UserSearchResult | null>(
    null
  );

  // 유사도 모달
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);
  const [similarity, setSimilarity] = useState<SimilarityResult | null>(null);
  const [simTarget, setSimTarget] = useState<Friend | null>(null);

  // 검색 입력 핸들러
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // 검색 실행
  const doSearch = async () => {
    setSearchLoading(true);
    const results = await searchByNickname(searchInput, userToken);
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
      const friendships_id = await addFriend(
        myUserId,
        receiverUserId,
        userToken
      );
      if (!friendships_id) {
        alert('친구 추가 요청 실패');
        return;
      }
      await addNotification(
        receiverUserId,
        `${myNickname}님이 친구 요청을 보냈습니다.`,
        friendships_id,
        userToken
      );
      alert('친구 요청이 전송되었습니다!');
      setShowSearch(false);
      fetchFriends();
    } catch (err) {
      alert('친구 추가 요청 실패');
    }
  };

  // 친구 목록 불러오기
  const fetchFriends = async () => {
    setFriendsLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/friends`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setFriends(res.data.filter((f: Friend) => f.status === 'accepted'));
    } catch (err) {
      console.error('친구 목록 조회 실패:', err);
    }
    setFriendsLoading(false);
  };

  useEffect(() => {
    if (userToken) fetchFriends();
  }, [userToken]);

  // 친구 클릭 → 최신 사진 유사도 모달
  const handleFriendSimClick = async (friend: Friend) => {
    setSimTarget(friend);
    setSimModalOpen(true);
    setSimLoading(true);
    setSimError(null);
    setSimilarity(null);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/latest-photo-similarity`,
        {
          user_id1: myUserId,
          user_id2: friend.user.userId,
        },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      setSimilarity(res.data);
    } catch (err: any) {
      setSimError(err.response?.data?.error || '유사도 계산 실패');
    }
    setSimLoading(false);
  };

  // 친구 정보 모달 (검색 결과에서 클릭 시)
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
            key={friend.friendships_id}
            className="flex items-center gap-3 p-2 border-b cursor-pointer hover:bg-gray-50"
            onClick={() => handleFriendSimClick(friend)}
            title="최신 사진 닮은 정도 보기"
          >
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold overflow-hidden">
              {friend.user.profileImageUrl ? (
                <img
                  src={getFullImageUrl(friend.user.profileImageUrl)}
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

      {/* 최신 사진 유사도 모달 */}
      <Dialog open={simModalOpen} onOpenChange={setSimModalOpen}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>최신 사진 닮은 정도</DialogTitle>
            <DialogClose asChild></DialogClose>
          </DialogHeader>
          {simLoading ? (
            <div className="py-12 text-center text-gray-400">
              유사도 계산 중...
            </div>
          ) : simError ? (
            <div className="py-12 text-center text-red-500">{simError}</div>
          ) : similarity && simTarget ? (
            <div className="flex flex-col items-center gap-6">
              <div className="flex gap-8 items-end">
                {/* 내 사진 */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-lg bg-gray-200 overflow-hidden mb-2 border-2 border-blue-400">
                    <img
                      src={getFullImageUrl(similarity.user1_image_url)}
                      alt="내 사진"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-base font-bold text-blue-700">나</div>
                </div>
                {/* 유사도 시각화 */}
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-indigo-600">
                    {Math.round(((similarity.cosine_similarity + 1) / 2) * 100)}
                    %
                  </div>
                  <div className="text-xs text-gray-500">닮은 정도</div>
                </div>
                {/* 친구 사진 */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-lg bg-gray-200 overflow-hidden mb-2 border-2 border-green-400">
                    <img
                      src={getFullImageUrl(similarity.user2_image_url)}
                      alt="친구 사진"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-base font-bold text-green-700">
                    {simTarget.user.nickname}
                  </div>
                </div>
              </div>
              <div className="w-full text-center text-sm text-gray-500 mt-2">
                두 사람의 최신 사진 임베딩 벡터 코사인 유사도 기준
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              사진 정보가 없습니다.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FriendList;
