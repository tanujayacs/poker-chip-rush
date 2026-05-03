import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { socket } from '../lib/socket';
import { useRoomStore } from '../store/useRoomStore';

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: 24px 20px;
`;

const BackBtn = styled.button`
  background: none;
  color: var(--text-muted);
  font-size: 14px;
  padding: 4px 0;
  margin-bottom: 32px;
  width: fit-content;
  &:hover { color: var(--text); }
`;

const Title = styled.h2`
  font-size: 26px;
  font-weight: 800;
  margin-bottom: 4px;
`;

const Sub = styled.p`
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 32px;
`;

const FormGroup = styled.div`margin-bottom: 18px;`;
const Label = styled.label`
  font-size: 13px;
  color: var(--text-muted);
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  letter-spacing: 0.4px;
`;

const BtnPrimary = styled.button`
  width: 100%;
  padding: 16px;
  background: var(--accent);
  color: #0d1117;
  font-size: 16px;
  font-weight: 700;
  border-radius: var(--radius);
  margin-top: 8px;
  &:hover { background: #00ffb3; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ErrorBox = styled.div`
  background: rgba(207, 34, 46, 0.15);
  border: 1px solid var(--red);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  font-size: 13px;
  color: #ff7b7b;
  margin-bottom: 16px;
`;

const CodeInput = styled.input`
  font-family: 'DM Mono', monospace;
  text-transform: uppercase;
  font-size: 22px;
  letter-spacing: 6px;
  text-align: center;
  padding: 16px;
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

    socket.on('waiting_approval', () => {
      navigate(`/lobby/${code.toUpperCase()}`);
    });

    socket.on('join_error', ({ message }: { message: string }) => {
      setError(message);
      setLoading(false);
    });

    return () => {
      socket.off('waiting_approval');
      socket.off('join_error');
    };
  }, [code]);

  const handleJoin = () => {
    if (!code.trim() || !name.trim()) return;
    setError('');
    setLoading(true);
    setMyName(name.trim());
    setIsDealer(false);

    socket.emit('request_join', {
      roomCode: code.toUpperCase(),
      name: name.trim(),
      chips: Number(chips),
    });
  };

  return (
    <Wrap>
      <BackBtn onClick={() => navigate('/')}>← Back</BackBtn>

      <Title>Join a Game</Title>
      <Sub>Enter the room code your dealer gave you</Sub>

      {error && <ErrorBox>⚠ {error}</ErrorBox>}

      <FormGroup>
        <Label>ROOM CODE</Label>
        <CodeInput
          placeholder="XXXXX"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          maxLength={5}
        />
      </FormGroup>

      <FormGroup>
        <Label>YOUR NAME</Label>
        <input
          placeholder="e.g. Andi"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={20}
        />
      </FormGroup>

      <FormGroup>
        <Label>STARTING CHIPS ($)</Label>
        <input
          type="number"
          placeholder="100"
          value={chips}
          onChange={e => setChips(e.target.value)}
          min={1}
        />
      </FormGroup>

      <BtnPrimary
        onClick={handleJoin}
        disabled={!code.trim() || !name.trim() || loading}
      >
        {loading ? 'Joining...' : 'Join Room →'}
      </BtnPrimary>
    </Wrap>
  );
}