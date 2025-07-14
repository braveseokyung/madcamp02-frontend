import React, { useState } from 'react';

// 탭 배열 타입 정의
interface Tab {
  label: string;
  content: React.ReactNode;
}

const tabs: Tab[] = [
  { label: '사진 업로드', content: '사진 업로드 영역' },
  { label: '친구', content: '친구 목록 영역' },
];

const Third: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <div>
      <h1 style={{ fontSize: 36, marginBottom: 32 }}>뭘 보냐고</h1>
    </div>
  );
};

export default Third;
