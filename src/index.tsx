import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from '../../mad02/src/reportWebVitals';

// 루트 엘리먼트가 항상 존재함을 TypeScript에 명확히 알리기 위해 non-null 단언 사용
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(<App />);

// 성능 측정 함수 (옵션)
reportWebVitals();
