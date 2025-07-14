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

interface Participant {
  user_id: number;
  nickname: string;
  profile_image_url?: string | null;
}

interface Contest {
  contest_id: number;
  title: string;
  description: string;
//   target_type: string;
  target_name: string;
  target_image_url: string;
  status: string;
  participants: Participant[];
}

function ContestTab({ userToken }: { userToken: string }) {
  const [contests, setContests] = useState<Contest[]>([]);
  const [selected, setSelected] = useState<Contest | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTargetType, setNewTargetType] = useState('');
  const [newTargetName, setNewTargetName] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch contests
  const fetchContests = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Contest[]>(`${BACKEND_URL}/contests`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setContests(res.data);
    } catch (err) {
      console.error(err);
      alert('콘테스트 목록 조회 실패');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImageFile(file);
  };

  // Add contest with file upload and embedding
  const handleAddContest = async () => {
    if (
      !newTitle.trim() ||
      !newDesc.trim() ||
    //   !newTargetType.trim() ||
      !newTargetName.trim() ||
      !newImageFile
    ) {
      alert('모든 필드를 입력하세요.');
      return;
    }

    const form = new FormData();
    form.append('file', newImageFile);
    // form.append('target_type', newTargetType);
    form.append('target_name', newTargetName);
    form.append('title', newTitle);
    form.append('description', newDesc);
    form.append('status', 'open');

    try {
      await axios.post(`${BACKEND_URL}/contestsadd`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userToken}`,
        },
      });
      setShowAdd(false);
      setNewTitle('');
      setNewDesc('');
      setNewTargetType('');
      setNewTargetName('');
      setNewImageFile(null);
      fetchContests();
    } catch (err) {
      console.error(err);
      alert('콘테스트 추가 실패');
    }
  };

  // Delete contest
  const handleDeleteContest = async (contest_id: number) => {
    if (!window.confirm('정말 이 콘테스트를 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/contests/${contest_id}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setSelected(null);
      fetchContests();
    } catch (err) {
      console.error(err);
      alert('콘테스트 삭제 실패');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header + Add button */}
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

      {/* Contest list */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 p-8 bg-white rounded-b-lg">
        {loading ? (
          <div className="col-span-full text-center text-gray-400">로딩 중...</div>
        ) : contests.length === 0 ? (
          <div className="col-span-full text-center text-gray-400">콘테스트가 없습니다.</div>
        ) : (
          contests.map((contest) => (
            <Card
              key={contest.contest_id}
              className="flex flex-col items-center justify-center gap-3 p-4 h-56 cursor-pointer hover:shadow-lg"
              onClick={() => setSelected(contest)}
            >
              <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                {contest.target_image_url ? (
                  <img
                    src={contest.target_image_url}
                    alt={contest.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-2xl">+</span>
                )}
              </div>
              <div className="text-base font-semibold text-center">{contest.title}</div>
              <div className="text-xs text-gray-500 text-center line-clamp-2">
                {contest.description}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Contest Modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-xs bg-white">
          <DialogHeader>
            <DialogTitle>콘테스트 추가</DialogTitle>
            <DialogClose asChild />
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
            {/* <Input
              placeholder="타겟 타입 (예: animal, human 등)"
              value={newTargetType}
              onChange={(e) => setNewTargetType(e.target.value)}
            /> */}
            <Input
              placeholder="타겟 이름"
              value={newTargetName}
              onChange={(e) => setNewTargetName(e.target.value)}
            />
            <label className="flex flex-col items-center cursor-pointer">
              <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden mb-2">
                {newImageFile ? (
                  <img
                    src={URL.createObjectURL(newImageFile)}
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

      {/* Contest Detail Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selected?.title} 참가자</DialogTitle>
            <DialogClose asChild>
              <button className="absolute top-4 right-4 text-2xl" aria-label="닫기">
                &times;
              </button>
            </DialogClose>
          </DialogHeader>
          <div className="text-xs text-gray-500 mb-2">{selected?.description}</div>
          <div className="grid grid-cols-2 gap-6 py-4">
            {selected?.participants.length ? (
              selected.participants.map((p) => (
                <div key={p.user_id} className="flex flex-col items-center gap-2 bg-gray-50 rounded-lg p-3">
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
              <div className="col-span-2 text-center text-gray-400">아직 참가자가 없습니다.</div>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <Button className="w-full font-bold" onClick={() => {/* 도전 로직 */}}>
              도전!
            </Button>
            <Button
              className="w-full font-bold bg-red-500 hover:bg-red-600 text-white"
              onClick={() => selected && handleDeleteContest(selected.contest_id)}
            >
              삭제
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContestTab;
