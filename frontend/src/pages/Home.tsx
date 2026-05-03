import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 32px 24px;
  position: relative;
  overflow: hidden;
`;

const BgGlow = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0,229,160,0.12) 0%, transparent 70%);
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  animation: ${pulse} 4s ease-in-out infinite;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 56px;
  h1 {
    font-size: 42px;
    font-weight: 800;
    letter-spacing: -1px;
    color: var(--text);
    span { color: var(--accent); }
  }
  p {
    font-size: 14px;
    color: var(--text-muted);
    margin-top: 8px;
    font-weight: 400;
    letter-spacing: 0.5px;
  }
`;

const BtnPrimary = styled.button`
  width: 100%;
  padding: 16px;
  background: var(--accent);
  color: #0d1117;
  font-size: 16px;
  font-weight: 700;
  border-radius: var(--radius);
  margin-bottom: 12px;
  letter-spacing: 0.3px;
  &:hover { background: #00ffb3; transform: translateY(-1px); }
  &:active { transform: translateY(0); }
`;

const BtnSecondary = styled.button`
  width: 100%;
  padding: 16px;
  background: transparent;
  color: var(--text);
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  &:hover { border-color: var(--accent); color: var(--accent); }
`;

const Suits = styled.div`
  margin-top: 48px;
  font-size: 28px;
  opacity: 0.15;
  letter-spacing: 12px;
`;

export default function Home() {
  const navigate = useNavigate();

  return (
    <Wrap>
      <BgGlow />
      <Logo>
        <h1>Poker<span>Chip</span>Rush</h1>
        <p>Play with friends. No chips needed.</p>
      </Logo>

      <div style={{ width: '100%' }}>
        <BtnPrimary onClick={() => navigate('/create')}>
          ▶ &nbsp; Start a Game
        </BtnPrimary>
        <BtnSecondary onClick={() => navigate('/join')}>
          <span>🔗 &nbsp; Join with Code</span>
          <span style={{ fontSize: 20 }}>›</span>
        </BtnSecondary>
      </div>

      <Suits>♠ ♥ ♦ ♣</Suits>
    </Wrap>
  );
}