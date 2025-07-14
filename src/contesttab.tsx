//contesttab.tsx
import React, { useState } from 'react';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from './components/ui/dialog';
import { Input } from './components/ui/input';
interface Contest {
  id: number;
  title: string;
  imageUrl: string | null;
  participants: Profile[];
}
interface Profile {
  id: number;
  name: string;
  avatarUrl: string | null;
}

const initialContests: Contest[] = [
  {
    id: 1,
    title: '여름 패션 콘테스트',
    imageUrl: null,
    participants: [
      { id: 1, name: '김철수', avatarUrl: null },
      { id: 2, name: '이영희', avatarUrl: null },
      { id: 2, name: '이영희', avatarUrl: null },
      { id: 2, name: '이영희', avatarUrl: null },
      { id: 2, name: '이영희', avatarUrl: null },
      { id: 2, name: '이영희', avatarUrl: null },
      { id: 2, name: '이영희', avatarUrl: null },
      { id: 2, name: '이영희', avatarUrl: null },
    ],
  },
  // ...다른 콘테스트
];

function ContestTab() {
  const [contests, setContests] = useState<Contest[]>(initialContests);
  const [selected, setSelected] = useState<Contest | null>(null);
  const [showChallenge, setShowChallenge] = useState(false);

  // 추가 모달 상태
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);

  // 콘테스트 추가
  const handleAddContest = () => {
    if (!newTitle.trim()) return;
    setContests([
      ...contests,
      {
        id: Date.now(),
        title: newTitle,
        imageUrl: newImage,
        participants: [],
      },
    ]);
    setShowAdd(false);
    setNewTitle('');
    setNewImage(null);
  };

  // 이미지 업로드
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* 헤더 + 추가 버튼 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-100 rounded-t-lg">
        <span className="text-xl font-bold">콘테스트</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowAdd(true)}
          className="text-2xl"
          aria-label="콘테스트 추가"
        >
          +
        </Button>
      </div>

      {/* 콘테스트 카드 리스트 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 p-8 bg-white rounded-b-lg">
        {contests.map((contest) => (
          <Card
            key={contest.id}
            className="flex flex-col items-center justify-center gap-3 p-4 h-56 cursor-pointer hover:shadow-lg"
            onClick={() => setSelected(contest)}
          >
            <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
              {contest.imageUrl ? (
                <img
                  src={contest.imageUrl}
                  alt={contest.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-2xl">+</span>
              )}
            </div>
            <div className="text-base font-semibold text-center">
              {contest.title}
            </div>
          </Card>
        ))}
      </div>

      {/* 콘테스트 추가 모달 */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-xs bg-[#FFFFFF]">
          <DialogHeader>
            <DialogTitle>콘테스트 추가</DialogTitle>
            <DialogClose asChild></DialogClose>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="콘테스트 제목"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <label className="flex flex-col items-center cursor-pointer">
              <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden mb-2">
                {newImage ? (
                  <img
                    src={newImage}
                    alt="미리보기"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xl">이미지</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <span className="text-sm text-blue-600 font-semibold">
                이미지 선택
              </span>
            </label>
            <Button onClick={handleAddContest} className="w-full font-bold">
              추가
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 콘테스트 상세 모달 (참가자 + 도전 버튼) */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selected?.title} 참가자</DialogTitle>
            <DialogClose asChild>
              <button
                className="absolute top-4 right-4 text-2xl"
                aria-label="닫기"
              >
                &times;
              </button>
            </DialogClose>
          </DialogHeader>
          {/* 참가자 리스트 */}
          <div className="grid grid-cols-2 gap-6 py-4">
            {selected?.participants.map((p) => (
              <div
                key={p.id}
                className="flex flex-col items-center gap-2 bg-gray-50 rounded-lg p-3"
              >
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {p.avatarUrl ? (
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-2xl">👤</span>
                  )}
                </div>
                <div className="font-semibold">{p.name}</div>
              </div>
            ))}
          </div>
          {/* 하단에 도전 버튼 한 개만 고정 */}
          <Button
            className="w-full font-bold mt-2"
            onClick={() => setShowChallenge(true)}
          >
            도전!
          </Button>
        </DialogContent>
      </Dialog>

      {/* 도전 버튼 클릭 시 빈 다이얼로그 */}
      <Dialog open={showChallenge} onOpenChange={setShowChallenge}>
        <DialogContent className="max-w-xs bg-[#FFFFFF]">
          <DialogHeader>
            <DialogTitle>도전하기</DialogTitle>
            <DialogClose asChild></DialogClose>
          </DialogHeader>
          <div className="flex items-center justify-center h-32 text-gray-400">
            (여기에 도전 관련 UI/폼/안내문구 등 추가)
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContestTab;
