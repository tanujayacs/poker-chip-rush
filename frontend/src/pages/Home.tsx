import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% { opacity: 0.45; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.08); }
`;
const float = keyframes`
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

const Wrap = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 100dvh; padding: 32px 24px;
  position: relative; overflow: hidden;
`;

const BgGlow = styled.div`
  position: absolute;
  width: 380px; height: 380px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,87,51,0.22) 0%, rgba(212,175,55,0.10) 40%, transparent 70%);
  top: 8%; left: 50%; transform: translateX(-50%);
  pointer-events: none; filter: blur(8px);
  animation: ${pulse} 5s ease-in-out infinite;
`;

const LogoWrap = styled.div`
  text-align: center;
  margin-bottom: 56px;
  position: relative; z-index: 1;
  animation: ${float} 6s ease-in-out infinite;
  img {
    width: 180px; height: auto;
    filter: drop-shadow(0 8px 32px rgba(255,87,51,0.4))
            drop-shadow(0 2px 12px rgba(212,175,55,0.3));
  }
  h3 {
    margin-top: 3px;
    font-size: 24px;
    font-weight: 800;
    letter-spacing: 1px;

    background: linear-gradient(180deg, #fff, #d4af37);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    text-shadow: 0 4px 20px rgba(212,175,55,0.25);
  }
  p {
    font-size: 13px;
    color: var(--text-muted);
    margin-top: 18px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
`;

const BtnPrimary = styled.button`
  width: 100%;
  padding: 17px;
  background: var(--grad-brand);
  color: #150A04;
  font-size: 16px;
  font-weight: 800;
  border-radius: var(--radius);
  margin-bottom: 12px;
  letter-spacing: 0.5px;
  box-shadow: var(--shadow-brand);
  &:hover { transform: translateY(-2px); filter: brightness(1.06); }
  &:active { transform: translateY(0); }
`;

const BtnSecondary = styled.button`
  width: 100%;
  padding: 17px;
  background: rgba(212,175,55,0.04);
  color: var(--text);
  font-size: 16px;
  font-weight: 700;
  border-radius: var(--radius);
  border: 1px solid var(--border-strong);
  display: flex; align-items: center; justify-content: space-between;
  &:hover { border-color: var(--gold); color: var(--gold); }
`;

const Suits = styled.div`
  margin-top: 56px;
  font-size: 26px;
  opacity: 0.18;
  letter-spacing: 14px;
  color: var(--gold);
`;

const Footer = styled.div`
  position: absolute; bottom: 18px; left: 0; right: 0;
  text-align: center; font-size: 10px; color: var(--text-dim);
  letter-spacing: 2px;
`;

export default function Home() {
  const navigate = useNavigate();

  return (
    <Wrap>
      <BgGlow />
      <LogoWrap>
        <img src="/logo.png" alt="PokerChipRush" />
        <h3>Poker Chip Rush</h3>
        <p>Play with friends. No chips needed.</p>
      </LogoWrap>

      <div style={{ width: '100%', position: 'relative', zIndex: 1 }}>
        <BtnPrimary onClick={() => navigate('/create')}>
          ▶ &nbsp; Start a Game
        </BtnPrimary>
        <BtnSecondary onClick={() => navigate('/join')}>
          <span>🔗 &nbsp; Join with Code</span>
          <span style={{ fontSize: 20 }}>›</span>
        </BtnSecondary>
      </div>

      <Suits>♠ ♥ ♦ ♣</Suits>
      <Footer>POKERCHIPRUSH · HYBRID POKER TRACKER</Footer>
    </Wrap>
  );
}