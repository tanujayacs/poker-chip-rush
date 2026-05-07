import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { socket } from '../lib/socket';
import { useRoomStore } from '../store/useRoomStore';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ── Full page centering wrapper ── */
const PageWrap = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
  background: linear-gradient(180deg, rgba(11,11,32,0.6) 0%, rgba(5,5,20,0.95) 100%);
`;

/* ── Modal card ── */
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

/* ── X close button top-right ── */
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
  padding-right: 40px; /* avoid overlap with close btn */
`;

const Sub = styled.p`font-size: 13px; color: var(--text-muted); margin-bottom: 22px;`;

const RoleGrid = styled.div`display: flex; flex-direction: column; gap: 12px;`;

const RoleCard = styled.button<{ $active?: boolean }>`
  background: ${p => p.$active
    ? 'linear-gradient(135deg, rgba(255,87,51,0.10), rgba(212,175,55,0.06))'
    : 'var(--bg2)'};
  border: 1.5px solid ${p => p.$active ? 'var(--gold)' : 'var(--border-strong)'};
  color: var(--text);
  border-radius: var(--radius);
  padding: 18px 20px;
  text-align: left;
  font-size: 15px; font-weight: 700;
  display: flex; align-items: center; gap: 14px;
  transition: all 0.2s;
  .icon { font-size: 28px; flex-shrink: 0; }
  .desc { font-size: 12px; color: var(--text-muted); font-weight: 400; margin-top: 3px; }
  &:hover { border-color: var(--gold); transform: translateY(-1px); }
`;

const Divider = styled.div`
  border: none; border-top: 1px solid var(--border);
  margin: 20px 0 16px;
`;

const Label = styled.label`
  font-size: 11px; color: var(--gold); display: block; margin-bottom: 7px;
  font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
`;

const FormGroup = styled.div`margin-bottom: 16px;`;
const Row = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 12px;`;

const BtnPrimary = styled.button`
  width: 100%; padding: 15px;
  background: var(--grad-brand); color: #150A04;
  font-size: 15px; font-weight: 800;
  border-radius: var(--radius); margin-top: 6px;
  letter-spacing: 0.5px;
  box-shadow: var(--shadow-brand);
  display: flex; align-items: center; justify-content: center; gap: 8px;
  &:hover { filter: brightness(1.06); transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

const RoleChip = styled.div`
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.35);
  border-radius: 999px; padding: 6px 14px;
  font-size: 12px; font-weight: 700; color: var(--gold);
  margin-bottom: 16px; cursor: pointer;
  &:hover { background: rgba(212,175,55,0.2); }
`;

type Step = 'role' | 'form';

export default function CreateRoom() {
  const navigate = useNavigate();
  const { setMyId, setMyName, setIsDealer } = useRoomStore();

  const [step, setStep] = useState<Step>('role');
  const [isPlayer, setIsPlayer] = useState(true);
  const [name, setName] = useState('');
  const [chips, setChips] = useState('100');
  const [sb, setSb] = useState('2');
  const [bb, setBb] = useState('4');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    socket.on('room_created', ({ roomCode }: { roomCode: string }) => navigate(`/lobby/${roomCode}`));
    return () => { socket.off('room_created'); };
  }, []);

  const handleCreate = () => {
    if (!name.trim()) return;
    setLoading(true);
    setMyName(name.trim());
    setIsDealer(true);
    socket.once('connect', () => setMyId(socket.id!));
    setMyId(socket.id ?? '');
    socket.emit('create_room', {
      name: name.trim(), isPlayer,
      chips: isPlayer ? Number(chips) : 0,
      smallBlind: Number(sb), bigBlind: Number(bb),
    });
  };

  return (
    <PageWrap>
      <ModalCard>
        {/* X button always closes back to home or back to role selection */}
        <CloseBtn onClick={() => step === 'form' ? setStep('role') : navigate('/')}>✕</CloseBtn>

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

            {/* Show selected role, clickable to change */}
            <RoleChip onClick={() => setStep('role')}>
              {isPlayer ? '🃏 Playing' : '🎰 Dealer only'}
              <span style={{ fontSize: 10, opacity: 0.7 }}>change</span>
            </RoleChip>

            <FormGroup>
              <Label>Your Name</Label>
              <input placeholder="e.g. John Doe" value={name}
                onChange={e => setName(e.target.value)} maxLength={20} />
            </FormGroup>

            {isPlayer && (
              <FormGroup>
                <Label>Starting Chips ($)</Label>
                <input type="number" placeholder="100" value={chips}
                  onChange={e => setChips(e.target.value)} min={1} />
              </FormGroup>
            )}

            <FormGroup>
              <Label>Blinds</Label>
              <Row>
                <div>
                  <Label style={{ fontSize: 10, color: 'var(--text-muted)' }}>Small Blind</Label>
                  <input type="number" value={sb} onChange={e => setSb(e.target.value)} min={0.5} />
                </div>
                <div>
                  <Label style={{ fontSize: 10, color: 'var(--text-muted)' }}>Big Blind</Label>
                  <input type="number" value={bb} onChange={e => setBb(e.target.value)} min={1} />
                </div>
              </Row>
            </FormGroup>

            <BtnPrimary onClick={handleCreate} disabled={!name.trim() || loading}>
              {loading ? 'Creating...' : 'Create Room →'}
            </BtnPrimary>
          </>
        )}
      </ModalCard>
    </PageWrap>
  );
}