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

/* Step 1 - Role picker */
const RoleGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RoleCard = styled.button<{ $active?: boolean }>`
  background: ${p => p.$active ? 'var(--accent-dim)' : 'var(--bg2)'};
  border: 1.5px solid ${p => p.$active ? 'var(--accent)' : 'var(--border)'};
  color: var(--text);
  border-radius: var(--radius);
  padding: 18px 20px;
  text-align: left;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.15s;
  .icon { font-size: 26px; }
  .desc { font-size: 12px; color: var(--text-muted); font-weight: 400; margin-top: 2px; }
  &:hover { border-color: var(--accent); }
`;

/* Step 2 - Form */
const Label = styled.label`
  font-size: 13px;
  color: var(--text-muted);
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  letter-spacing: 0.4px;
`;

const FormGroup = styled.div`
  margin-bottom: 18px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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

type Step = 'role' | 'form';

export default function CreateRoom() {
  const navigate = useNavigate();
  const { setMyId, setMyName, setIsDealer } = useRoomStore();

  const [step, setStep] = useState<Step>('role');
  const [isPlayer, setIsPlayer] = useState(true);
  const [name, setName] = useState('');
  const [chips, setChips] = useState('100');
  const [sb, setSb] = useState('1');
  const [bb, setBb] = useState('2');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on('room_created', ({ roomCode }) => {
      navigate(`/lobby/${roomCode}`);
    });

    return () => { socket.off('room_created'); };
  }, []);

  const handleCreate = () => {
    if (!name.trim()) return;
    setLoading(true);
    setMyName(name.trim());
    setIsDealer(true);

    socket.emit('create_room', {
      name: name.trim(),
      isPlayer,
      chips: isPlayer ? Number(chips) : 0,
      smallBlind: Number(sb),
      bigBlind: Number(bb),
    });

    socket.once('connect', () => setMyId(socket.id!));
    setMyId(socket.id!);
  };

  return (
    <Wrap>
      <BackBtn onClick={() => step === 'form' ? setStep('role') : navigate('/')}>
        ← Back
      </BackBtn>

      {step === 'role' ? (
        <>
          <Title>Start a Game</Title>
          <Sub>What's your role this session?</Sub>
          <RoleGrid>
            <RoleCard $active={isPlayer} onClick={() => { setIsPlayer(true); setStep('form'); }}>
              <span className="icon">🃏</span>
              <div>
                <div>I'm a Player too</div>
                <div className="desc">You'll join the table and play</div>
              </div>
            </RoleCard>
            <RoleCard $active={!isPlayer} onClick={() => { setIsPlayer(false); setStep('form'); }}>
              <span className="icon">🎰</span>
              <div>
                <div>I'm Just the Dealer</div>
                <div className="desc">You manage the game, no playing</div>
              </div>
            </RoleCard>
          </RoleGrid>
        </>
      ) : (
        <>
          <Title>{isPlayer ? 'Join as Player' : 'Setup Room'}</Title>
          <Sub>{isPlayer ? 'Enter your details to start' : 'Configure the game settings'}</Sub>

          <FormGroup>
            <Label>YOUR NAME</Label>
            <input
              placeholder="e.g. Budi"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={20}
            />
          </FormGroup>

          {isPlayer && (
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
          )}

          <FormGroup>
            <Label>BLINDS</Label>
            <Row>
              <div>
                <Label style={{ fontSize: 11 }}>SMALL BLIND</Label>
                <input type="number" value={sb} onChange={e => setSb(e.target.value)} min={0.5} />
              </div>
              <div>
                <Label style={{ fontSize: 11 }}>BIG BLIND</Label>
                <input type="number" value={bb} onChange={e => setBb(e.target.value)} min={1} />
              </div>
            </Row>
          </FormGroup>

          <BtnPrimary onClick={handleCreate} disabled={!name.trim() || loading}>
            {loading ? 'Creating...' : 'Create Room →'}
          </BtnPrimary>
        </>
      )}
    </Wrap>
  );
}