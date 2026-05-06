import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { socket } from '../lib/socket';
import { useRoomStore } from '../store/useRoomStore';

const Wrap = styled.div`display: flex; flex-direction: column; min-height: 100dvh; padding: 24px 20px;`;

const BackBtn = styled.button`
  background: none; color: var(--text-muted); font-size: 14px;
  padding: 4px 0; margin-bottom: 28px; width: fit-content;
  &:hover { color: var(--gold); }
`;

const Title = styled.h2`
  font-size: 28px; font-weight: 800; margin-bottom: 4px;
  background: var(--grad-gold);
  -webkit-background-clip: text; background-clip: text; color: transparent;
`;
const Sub = styled.p`font-size: 13px; color: var(--text-muted); margin-bottom: 30px;`;

const FormGroup = styled.div`margin-bottom: 18px;`;
const Label = styled.label`
  font-size: 11px; color: var(--gold); display: block; margin-bottom: 7px;
  font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
`;

const BtnPrimary = styled.button`
  width: 100%; padding: 16px;
  background: var(--grad-brand); color: #150A04;
  font-size: 16px; font-weight: 800;
  border-radius: var(--radius); margin-top: 10px;
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
    <Wrap>
      <BackBtn onClick={() => navigate('/')}>← Back</BackBtn>

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
    </Wrap>
  );
}