import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { socket } from '../lib/socket';
import { useRoomStore } from '../store/useRoomStore';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageWrap = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
`;

const ModalCard = styled.div`
  width: 100%;
  max-width: 420px;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0)), var(--bg3);
  border: 1px solid var(--border-strong);
  border-top: 2px solid var(--gold);
  border-radius: var(--radius);
  padding: 28px 24px 24px;
  position: relative;
  animation: ${fadeIn} 0.22s ease;
  backdrop-filter: blur(8px);
  box-shadow: 0 24px 60px -10px rgba(0,0,0,0.6), var(--shadow-gold);
`;

const CloseBtn = styled.button`
  position: absolute; top: 16px; right: 16px;
  background: var(--bg2); border: 1px solid var(--border-strong);
  color: var(--text-muted); border-radius: 50%;
  width: 32px; height: 32px; font-size: 15px;
  display: flex; align-items: center; justify-content: center;
  &:hover { color: var(--text); border-color: var(--gold); }
`;

const Title = styled.h2`
  font-size: 22px; font-weight: 800; margin-bottom: 4px;
  background: var(--grad-gold);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  padding-right: 40px;
`;
const Sub = styled.p`font-size: 13px; color: var(--text-muted); margin-bottom: 22px;`;

const FormGroup = styled.div`margin-bottom: 16px;`;
const Label = styled.label`
  font-size: 11px; color: var(--gold); display: block; margin-bottom: 7px;
  font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
`;

const BtnPrimary = styled.button`
  width: 100%; padding: 15px;
  background: var(--grad-brand); color: #150A04;
  font-size: 15px; font-weight: 800;
  border-radius: var(--radius); margin-top: 6px;
  box-shadow: var(--shadow-brand);
  &:hover { filter: brightness(1.06); transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

const ErrorBox = styled.div`
  background: rgba(219,58,52,0.12);
  border: 1px solid var(--crimson);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  font-size: 13px;
  color: #ff8e8a;
  margin-bottom: 16px;
`;

const CodeInput = styled.input`
  font-family: 'DM Mono', monospace;
  text-transform: uppercase;
  font-size: 24px;
  letter-spacing: 8px;
  text-align: center;
  padding: 18px;
  color: var(--gold);
  &:focus { color: var(--gold-glow); }
`;

export default function JoinRoom() {
  const navigate = useNavigate();
  const { setMyName, setIsDealer } = useRoomStore();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [chips, setChips] = useState('100');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    socket.on('waiting_approval', () => navigate(`/lobby/${code.toUpperCase()}`));
    socket.on('join_error', ({ message }: { message: string }) => {
      setError(message); setLoading(false);
    });
    return () => { socket.off('waiting_approval'); socket.off('join_error'); };
  }, [code]);

  const handleJoin = () => {
    if (!code.trim() || !name.trim()) return;
    setError(''); setLoading(true);
    setMyName(name.trim()); setIsDealer(false);
    socket.emit('request_join', {
      roomCode: code.toUpperCase(), name: name.trim(), chips: Number(chips),
    });
  };

  return (
    <PageWrap>
      <ModalCard>
        <CloseBtn onClick={() => navigate('/')}>✕</CloseBtn>

        <Title>Join a Game</Title>
        <Sub>Enter the room code your dealer gave you</Sub>

        {error && <ErrorBox>⚠ {error}</ErrorBox>}

        <FormGroup>
          <Label>Room Code</Label>
          <CodeInput placeholder="XXXXX" value={code}
            onChange={e => setCode(e.target.value.toUpperCase())} maxLength={5} />
        </FormGroup>

        <FormGroup>
          <Label>Your Name</Label>
          <input placeholder="e.g. Andi" value={name}
            onChange={e => setName(e.target.value)} maxLength={20} />
        </FormGroup>

        <FormGroup>
          <Label>Starting Chips ($)</Label>
          <input type="number" placeholder="100" value={chips}
            onChange={e => setChips(e.target.value)} min={1} />
        </FormGroup>

        <BtnPrimary onClick={handleJoin}
          disabled={!code.trim() || !name.trim() || loading}>
          {loading ? 'Joining...' : 'Join Room →'}
        </BtnPrimary>
      </ModalCard>
    </PageWrap>
  );
}