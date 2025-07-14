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
  target_name: string;
  target_image_url: string;
  status: string;
  participants: Participant[];
}

interface TopRank {
  user_id: number | null;
  similarity_score: number | null;
  user_photo_id: number | null;
  image_url: string | null;
}

function getFullImageUrl(image_url: string | undefined | null) {
  if (!image_url) return '';
  if (/^https?:\/\//.test(image_url)) return image_url;
  return `${BACKEND_URL}${image_url.startsWith('/') ? '' : '/'}${image_url}`;
}

function ContestTab({
  userToken,
  myUserId,
}: {
  userToken: string;
  myUserId: number;
}) {
  const [contests, setContests] = useState<Contest[]>([]);
  const [selected, setSelected] = useState<Contest | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTargetName, setNewTargetName] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // 1~3등 정보
  const [topRanks, setTopRanks] = useState<{
    first: TopRank | null;
    second: TopRank | null;
    third: TopRank | null;
  }>({ first: null, second: null, third: null });
  const [rankLoading, setRankLoading] = useState(false);

  // Fetch contests
  const fetchContests = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Contest[]>(`${BACKEND_URL}/contests`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
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

  // 이미지 선택
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImageFile(file);
  };

  // 콘테스트 추가
  const handleAddContest = async () => {
    if (
      !newTitle.trim() ||
      !newDesc.trim() ||
      !newTargetName.trim() ||
      !newImageFile
    ) {
      alert('모든 필드를 입력하세요.');
      return;
    }

    const form = new FormData();
    form.append('file', newImageFile);
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
      setNewTargetName('');
      setNewImageFile(null);
      fetchContests();
    } catch (err) {
      alert('콘테스트 추가 실패');
    }
  };

  // 콘테스트 삭제
  const handleDeleteContest = async (contest_id: number) => {
    if (!window.confirm('정말 이 콘테스트를 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/contests/${contest_id}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setSelected(null);
      fetchContests();
    } catch (err) {
      alert('콘테스트 삭제 실패');
    }
  };

  // 1~3등 정보 불러오기
  const fetchTopRanks = async (contest_id: number) => {
    setRankLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/contest-top3`, {
        params: { contest_id },
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setTopRanks({
        first: res.data.first,
        second: res.data.second,
        third: res.data.third,
      });
    } catch (err) {
      setTopRanks({ first: null, second: null, third: null });
    }
    setRankLoading(false);
  };

  // 콘테스트 상세 모달 열 때 1~3등 정보도 같이 불러오기
  const handleOpenContest = (contest: Contest) => {
    setSelected(contest);
    fetchTopRanks(contest.contest_id);
  };

  // 도전하기
  const handleChallenge = async (contest: Contest) => {
    try {
      // 1. 내 최신 사진 id
      const latestPhotoRes = await axios.get(
        `${BACKEND_URL}/latest-user-photo-id/${myUserId}`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      const user_photo_id = latestPhotoRes.data.user_photo_id;
      if (!user_photo_id) {
        alert('최근 사진이 없습니다.');
        return;
      }

      // 2. 중복 참가 체크
      const entryCheckRes = await axios.get(
        `${BACKEND_URL}/contest-entry-check`,
        {
          params: { contest_id: contest.contest_id, user_id: myUserId },
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      if (entryCheckRes.data.exists) {
        alert('이미 이 콘테스트에 참가하셨습니다!');
        return;
      }

      // 3. 출품
      await axios.post(
        `${BACKEND_URL}/contest_entry_add`,
        {
          contest_id: contest.contest_id,
          user_id: myUserId,
          user_photo_id,
        },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      // 4. 1,2,3등 자동 업데이트
      await axios.patch(
        `${BACKEND_URL}/update_contest_top3`,
        {
          contest_id: contest.contest_id,
        },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      alert('도전 완료!');
      fetchTopRanks(contest.contest_id);
      fetchContests(); // 참가자 수 등 갱신
    } catch (err) {
      alert('도전 중 오류 발생');
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
              onClick={() => handleOpenContest(contest)}
            >
              <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                {contest.target_image_url ? (
                  <img
                    src={getFullImageUrl(contest.target_image_url)}
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
      {selected && (
        <Dialog open onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-lg bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DialogTitle className="text-2xl font-bold">
                {selected.title}
              </DialogTitle>
              <DialogClose asChild />
            </div>
            <p className="text-sm text-gray-600 mb-6">{selected.description}</p>
            {/* 1~3등 */}
            <h3 className="text-lg font-semibold text-gray-800 mb-2">1~3등</h3>
            {rankLoading ? (
              <div className="text-gray-400">로딩 중...</div>
            ) : (
              <div className="flex gap-4 mb-6">
                {[topRanks.first, topRanks.second, topRanks.third].map(
                  (rank, i) =>
                    rank && rank.user_id ? (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div className="w-20 h-20 rounded-lg bg-gray-200 overflow-hidden border-2 border-yellow-400">
                          {rank.image_url ? (
                            <img
                              src={getFullImageUrl(rank.image_url)}
                              alt={`${i + 1}등`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="flex items-center justify-center w-full h-full text-gray-400 text-xl">
                              ?
                            </span>
                          )}
                        </div>
                        <div className="text-base font-bold">{i + 1}등</div>
                        <div className="text-xs text-gray-500">
                          유사도:{' '}
                          {rank.similarity_score !== null
                            ? Math.round(
                                ((rank.similarity_score + 1) / 2) * 100
                              )
                            : '-'}
                        </div>
                      </div>
                    ) : (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-2 opacity-50"
                      >
                        <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                          -
                        </div>
                        <div className="text-base font-bold">{i + 1}등</div>
                        <div className="text-xs text-gray-400">아직 없음</div>
                      </div>
                    )
                )}
              </div>
            )}

            {/* 참가자 섹션 */}
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              참가자 ({selected.participants.length})
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-6 max-h-64 overflow-y-auto">
              {selected.participants.length > 0 ? (
                selected.participants.map((p) => (
                  <div
                    key={p.user_id}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 mb-2 rounded-full overflow-hidden bg-gray-200">
                      {p.profile_image_url ? (
                        <img
                          src={getFullImageUrl(p.profile_image_url)}
                          alt={p.nickname}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="flex items-center justify-center w-full h-full text-gray-400 text-xl">
                          👤
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {p.nickname}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-gray-400">
                  아직 참가자가 없습니다.
                </div>
              )}
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                className="px-4 py-2"
                onClick={() => handleChallenge(selected)}
              >
                도전하기
              </Button>
              <Button
                variant="destructive"
                className="px-4 py-2"
                onClick={() => handleDeleteContest(selected.contest_id)}
              >
                삭제
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default ContestTab;
