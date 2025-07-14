//friendlist.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'; // shadcn/ui에서 필요한 컴포넌트 import
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
interface Friend {
  id: number;
  name: string;
  email: string;
  status: string;
}

const friends = [
  { id: 1, name: '김철수', email: 'chulsoo@email.com', status: '온라인' },
  { id: 2, name: '이영희', email: 'younghee@email.com', status: '오프라인' },
  { id: 3, name: '이희', email: 'younghee@email.com', status: '오프라인' },
  { id: 4, name: 'FS희', email: 'younghee@email.com', status: '오프라인' },
  { id: 5, name: 'S희', email: 'younghee@email.com', status: '오프라인' },
  { id: 6, name: 'EE희', email: 'younghee@email.com', status: '오프라인' },
  { id: 7, name: 'Y영희', email: 'younghee@email.com', status: '오프라인' },
  { id: 8, name: 'I영희', email: 'younghee@email.com', status: '온온라인' },
  { id: 9, name: 'O영희', email: 'younghee@email.com', status: '오프라인' },
  { id: 10, name: 'P영희', email: 'younghee@email.com', status: '오프라인' },
  { id: 11, name: 'A영희', email: 'younghee@email.com', status: '오프라인' },
  { id: 12, name: 'Z영희', email: 'younghee@email.com', status: '오프라인' },
  { id: 13, name: 'X영희', email: 'younghee@email.com', status: '오프라인' },
  { id: 14, name: 'C영희', email: 'younghee@email.com', status: '오프라인' },
  { id: 15, name: 'B영희', email: 'younghee@email.com', status: '오프라인' },
  { id: 16, name: 'H영희', email: 'younghee@email.com', status: '오프라인' },
];

function FriendList() {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-100 rounded-t-lg">
        <span className="text-xl font-bold">닉네임 님의 친구</span>
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

      {/* 친구 리스트 */}
      <div className="grid grid-cols-3 gap-8 p-8 bg-white rounded-b-lg">
        {friends.map((friend) => (
          <button
            key={friend.id}
            className="flex flex-col items-center gap-2 focus:outline-none"
            onClick={() => setSelectedFriend(friend)}
          >
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold">
              {friend.name[0]}
            </div>
            <span className="text-base font-semibold">{friend.name}</span>
          </button>
        ))}
      </div>

      {/* 친구 정보 모달 */}
      <Dialog
        open={!!selectedFriend}
        onOpenChange={() => setSelectedFriend(null)}
      >
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>친구 정보</DialogTitle>
            <DialogClose asChild>
              <button
                className="absolute top-4 right-4 text-2xl"
                aria-label="닫기"
              >
                &times;
              </button>
            </DialogClose>
          </DialogHeader>
          {selectedFriend && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold">
                {selectedFriend.name[0]}
              </div>
              <div className="text-lg font-bold">{selectedFriend.name}</div>
              <div className="text-gray-500">{selectedFriend.email}</div>
              <div className="text-sm text-green-600">
                {selectedFriend.status}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 친구 검색 모달 */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>친구 검색</DialogTitle>
            <DialogClose asChild>
              <button
                className="absolute top-4 right-4 text-2xl"
                aria-label="닫기"
              >
                &times;
              </button>
            </DialogClose>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input placeholder="닉네임, 이메일 등으로 검색" />
            {/* 검색 결과 리스트: 서버에서 받아온 친구 목록 map */}
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {/* 예시: */}
              {/* {searchResults.map(friend => (...))} */}
              <div className="p-3 rounded-md hover:bg-gray-100 cursor-pointer">
                예시 친구1
              </div>
              <div className="p-3 rounded-md hover:bg-gray-100 cursor-pointer">
                예시 친구2
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FriendList;