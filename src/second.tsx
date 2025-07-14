import React, { useState } from 'react';
import { Button } from '../../mad02/src/components/ui/button';

// 탭 배열 타입 정의
interface Tab {
  label: string;
  content: React.ReactNode;
}

const tabs: Tab[] = [
  { label: '사진 업로드', content: '사진 업로드 영역' },
  { label: '친구', content: '친구 목록 영역' },
];

const Second: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <div>
      <Button asChild>dfgsfsd</Button>
    </div>
  );
};

export default Second;
