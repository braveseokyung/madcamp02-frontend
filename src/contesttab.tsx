import React, { useEffect, useState } from 'react';
import axios from 'axios';
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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Contest {
  contest_id: number;
  title: string;
  description: string;
  target_type: string;
  target_name: string;
  target_photo_id: number;
  status: string;
  image_url?: string | null;
  participants: Participant[];
}

interface Participant {
  user_id: number;
  nickname: string;
  profile_image_url?: string | null;
}

function ContestTab() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [selected, setSelected] = useState<Contest | null>(null);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTargetType, setNewTargetType] = useState('');
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetPhotoId, setNewTargetPhotoId] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 콘테스트 목록 불러오기
  const fetchContests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/contests`);
      setContests(res.data);
    } catch (err) {
      alert('콘테스트 목록 조회 실패');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContests();
    // eslint-disable-next-line
  }, []);

  // 콘테스트 추가
  const handleAddContest = async () => {
    if (
      !newTitle.trim() ||
      !newDesc.trim() ||
      !newTargetType.trim() ||
      !newTargetName.trim() ||
      !newTargetPhotoId
    ) {
      alert('모든 필드를 입력하세요.');
      return;
    }
    try {
      const res = await axios.post(`${BACKEND_URL}/contestsadd`, {
        target_type: newTargetType,
        target_name: newTargetName,
        target_photo_id: Number(newTargetPhotoId),
        title: newTitle,
        description: newDesc,
        status: 'open',
      });
      setShowAdd(false);
      setNewTitle('');
      setNewDesc('');
      setNewTargetType('');
      setNewTargetName('');
      setNewTargetPhotoId('');
      setNewImage(null);
      fetchContests();
    } catch (err) {
      alert('콘테스트 추가 실패');
    }
  };

  // 콘테스트 삭제
  const handleDeleteContest = async (contest_id: number) => {
    if (!window.confirm('정말 이 콘테스트를 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/contests/${contest_id}`);
      setSelected(null);
      fetchContests();
    } catch (err) {
      alert('콘테스트 삭제 실패');
    }
  };

  // 이미지 업로드 미리보기 (DB 저장은 별도 API 필요)
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
        {loading ? (
          <div className="col-span-full text-center text-gray-400">
            로딩 중...
          </div>
        ) : contests.length === 0 ? (
          <div className="col-span-full text-center text-gray-400">
            콘테스트가 없습니다.
          </div>
        ) : (
          contests.map((contest) => (
            <Card
              key={contest.contest_id}
              className="flex flex-col items-center justify-center gap-3 p-4 h-56 cursor-pointer hover:shadow-lg"
              onClick={() => setSelected(contest)}
            >
              <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                {contest.image_url ? (
                  <img
                    src={contest.image_url}
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
              <div className="text-xs text-gray-500 text-center line-clamp-2">
                {contest.description}
              </div>
            </Card>
          ))
        )}
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
            <Input
              placeholder="설명"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <Input
              placeholder="타겟 타입 (예: animal, human 등)"
              value={newTargetType}
              onChange={(e) => setNewTargetType(e.target.value)}
            />
            <Input
              placeholder="타겟 이름"
              value={newTargetName}
              onChange={(e) => setNewTargetName(e.target.value)}
            />
            <Input
              placeholder="타겟 사진 ID"
              type="number"
              value={newTargetPhotoId}
              onChange={(e) => setNewTargetPhotoId(e.target.value)}
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
                이미지 선택(미리보기만)
              </span>
            </label>
            <Button onClick={handleAddContest} className="w-full font-bold">
              추가
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 콘테스트 상세 모달 (참가자 + 도전 버튼 + 삭제 버튼) */}
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
          <div className="text-xs text-gray-500 mb-2">
            {selected?.description}
          </div>
          {/* 참가자 리스트 */}
          <div className="grid grid-cols-2 gap-6 py-4">
            {selected?.participants?.length ? (
              selected.participants.map((p) => (
                <div
                  key={p.user_id}
                  className="flex flex-col items-center gap-2 bg-gray-50 rounded-lg p-3"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {p.profile_image_url ? (
                      <img
                        src={p.profile_image_url}
                        alt={p.nickname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-2xl">👤</span>
                    )}
                  </div>
                  <div className="font-semibold">{p.nickname}</div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-gray-400">
                아직 참가자가 없습니다.
              </div>
            )}
          </div>
          {/* 하단에 도전/삭제 버튼 */}
          <div className="flex gap-2 mt-2">
            <Button
              className="w-full font-bold"
              onClick={() => setShowChallenge(true)}
            >
              도전!
            </Button>
            <Button
              className="w-full font-bold bg-red-500 hover:bg-red-600 text-white"
              onClick={() =>
                selected && handleDeleteContest(selected.contest_id)
              }
            >
              삭제
            </Button>
          </div>
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
