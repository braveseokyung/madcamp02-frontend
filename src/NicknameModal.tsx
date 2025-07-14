import React, { useState } from 'react';

interface NicknameModalProps {
  onSubmit: (nickname: string) => void;
}

const NicknameModal: React.FC<NicknameModalProps> = ({ onSubmit }) => {
  const [nickname, setNickname] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      alert('닉네임을 입력하세요.');
      return;
    }
    onSubmit(nickname);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center"
      >
        <h2 className="text-2xl mb-4">닉네임을 입력하세요</h2>
        <input
          className="border p-2 mb-4 rounded"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded"
        >
          등록
        </button>
      </form>
    </div>
  );
};

export default NicknameModal;
