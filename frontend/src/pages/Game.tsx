import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { socket } from '../lib/socket';
import { useRoomStore } from '../store/useRoomStore';
import { Room, Player } from '../features/room/room.types';
import { GameTable } from '../features/game/GameTable';
import {
  emitPlayerAction, emitAdvancePhase, emitDeclareWinner,
  emitNewHand, emitRebuy, emitEndGame,
  onGameEnded,
} from '../features/game/game.socket';
import { onRoomState, onKicked, emitReconnect } from '../features/room/room.socket';

/* ─── Modals styled ─── */
const slideUp = keyframes`from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); }`;
const fadeIn = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); }`;

const Wrap = styled.div`display: flex; flex-direction: column; min-height: 100dvh; background: var(--bg);`;

const Header = styled.div`
  background: var(--bg2); border-bottom: 1px solid var(--border);
  padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;
  .name { font-size: 14px; font-weight: 700; color: var(--accent); }
  .hand { font-size: 12px; color: var(--text-muted); }
`;

const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.75);
  display: flex; align-items: flex-end; justify-content: center;
  z-index: 50; padding-bottom: env(safe-area-inset-bottom);
`;
const Sheet = styled.div`
  background: var(--bg2); border: 1px solid var(--border);
  border-radius: var(--radius) var(--radius) 0 0;
  padding: 24px 20px; width: 100%; max-width: 430px;
  animation: ${slideUp} 0.2s ease;
`;
const SheetTitle = styled.h3`font-size: 18px; font-weight: 800; margin-bottom: 4px;`;
const SheetSub = styled.p`font-size: 13px; color: var(--text-muted); margin-bottom: 18px;`;
const InfoGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;
  .box { background: var(--bg3); border-radius: var(--radius-sm); padding: 10px 12px;
    label { font-size: 10px; color: var(--text-muted); display: block; margin-bottom: 3px; }
    strong { font-size: 16px; font-family: 'DM Mono', monospace; }
  }
`;
const BigInput = styled.input`
  font-size: 28px; font-weight: 800; text-align: center;
  padding: 14px; margin-bottom: 6px; border-radius: var(--radius-sm);
`;
const MinMax = styled.p`font-size: 12px; color: var(--text-muted); text-align: center; margin-bottom: 14px;`;
const QuickRow = styled.div`
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 18px;
  button {
    background: var(--bg3); border: 1px solid var(--border); color: var(--text);
    border-radius: var(--radius-sm); padding: 10px; font-size: 12px; font-weight: 600;
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    span { font-size: 10px; color: var(--text-muted); }
    &:hover { border-color: var(--accent); color: var(--accent); }
  }
`;
const ModalBtns = styled.div`display: grid; grid-template-columns: 1fr 2fr; gap: 10px;`;
const BtnCancel = styled.button`
  background: var(--bg3); border: 1px solid var(--border); color: var(--text);
  border-radius: var(--radius-sm); padding: 14px; font-size: 15px; font-weight: 600;
`;
const BtnConfirm = styled.button<{ $danger?: boolean }>`
  background: ${p => p.$danger ? 'var(--red)' : 'var(--accent)'};
  color: ${p => p.$danger ? '#fff' : '#0d1117'};
  border-radius: var(--radius-sm); padding: 14px; font-size: 15px; font-weight: 700;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

/* Winner option */
const WinnerOpt = styled.div<{ $sel?: boolean }>`
  background: ${p => p.$sel ? 'var(--accent-dim)' : 'var(--bg3)'};
  border: 1.5px solid ${p => p.$sel ? 'var(--accent)' : 'var(--border)'};
  border-radius: var(--radius-sm); padding: 14px 16px; cursor: pointer; margin-bottom: 8px;
  display: flex; align-items: center; justify-content: space-between;
  .name { font-size: 15px; font-weight: 600; }
  .chips { font-size: 12px; color: var(--text-muted); font-family: 'DM Mono'; }
  &:hover { border-color: var(--accent); }
`;
const PotBox = styled.div`
  background: var(--bg3); border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 14px;
  label { font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 3px; }
  strong { font-size: 22px; font-family: 'DM Mono'; font-weight: 800; color: var(--accent); }
`;

/* Rebuy */
const StyledSelect = styled.select`
  width: 100%; background: var(--bg3); border: 1px solid var(--border);
  color: var(--text); border-radius: var(--radius-sm); padding: 12px 14px;
  font-size: 15px; font-family: 'Syne', sans-serif; margin-bottom: 12px;
  outline: none; appearance: none;
  &:focus { border-color: var(--accent); }
`;

/* End Game result */
const EndOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.92);
  display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px;
`;
const EndCard = styled.div`
  background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 28px 22px; width: 100%; max-width: 380px; animation: ${fadeIn} 0.3s ease;
  h2 { font-size: 22px; font-weight: 800; text-align: center; margin-bottom: 4px; }
  .sub { font-size: 13px; color: var(--text-muted); text-align: center; margin-bottom: 22px; }
`;
const RankItem = styled.div<{ $rank: number }>`
  display: flex; align-items: center; gap: 10px; background: var(--bg3);
  border: 1px solid ${p => p.$rank === 1 ? 'var(--yellow)' : 'var(--border)'};
  border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 8px;
  .medal { font-size: 20px; width: 28px; }
  .info { flex: 1; .name { font-size: 14px; font-weight: 700; } .chips { font-size: 12px; color: var(--text-muted); font-family: 'DM Mono'; } }
`;
const HomeBtn = styled.button`
  width: 100%; background: var(--accent); color: #0d1117;
  padding: 14px; border-radius: var(--radius); font-size: 15px; font-weight: 700; margin-top: 8px;
  &:hover { background: #00ffb3; }
`;

export default function Game() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { myId, myName, isDealer, setMyId, setRoom } = useRoomStore();

  const [room, setLocalRoom] = useState<Room | null>(null);
  const [showRaise, setShowRaise] = useState(false);
  const [raiseAmt, setRaiseAmt] = useState('');
  const [showWinner, setShowWinner] = useState(false);
  const [selWinners, setSelWinners] = useState<string[]>([]);
  const [showRebuy, setShowRebuy] = useState(false);
  const [rebuyPlayerId, setRebuyPlayerId] = useState('');
  const [rebuyAmt, setRebuyAmt] = useState('');
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [finalPlayers, setFinalPlayers] = useState<Player[] | null>(null);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    setMyId(socket.id ?? '');

    const offState = onRoomState(socket, (r) => { setLocalRoom(r); setRoom(r); });
    const offEnded = onGameEnded(socket, ({ players }) => setFinalPlayers(players));
    const offKicked = onKicked(socket, () => navigate('/'));

    const savedName = myName ?? localStorage.getItem('pcr_name');
    if (savedName && roomCode) emitReconnect(socket, roomCode, savedName);

    return () => { offState(); offEnded(); offKicked(); };
  }, [roomCode]);

  if (finalPlayers) {
    const sorted = [...finalPlayers].sort((a, b) => b.chips - a.chips);
    const medals = ['🥇', '🥈', '🥉'];
    return (
      <EndOverlay>
        <EndCard>
          <h2>🏆 Game Over!</h2>
          <div className="sub">Final standings</div>
          {sorted.map((p, i) => (
            <RankItem key={p.id} $rank={i + 1}>
              <div className="medal">{medals[i] ?? `#${i + 1}`}</div>
              <div className="info">
                <div className="name">
                  {p.name}{p.id === socket.id && <span style={{ color: 'var(--accent)', fontSize: 10, marginLeft: 5 }}>YOU</span>}
                </div>
                <div className="chips">${p.chips.toFixed(2)}</div>
              </div>
            </RankItem>
          ))}
          <HomeBtn onClick={() => navigate('/')}>Back to Home</HomeBtn>
        </EndCard>
      </EndOverlay>
    );
  }

  if (!room) return (
    <Wrap style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Connecting...</div>
    </Wrap>
  );

  const amIDealer = isDealer || room.dealerId === socket.id;
  const myPlayer = room.players.find(p => p.id === socket.id);
  const nonFolded = room.players.filter(p => !p.folded);

  const handleRaiseConfirm = () => {
    const n = Number(raiseAmt);
    if (!n || n <= 0 || !roomCode) return;
    emitPlayerAction(socket, roomCode, 'raise', n);
    setShowRaise(false); setRaiseAmt('');
  };

  const handleDeclare = () => {
    if (!roomCode || selWinners.length === 0) return;
    emitDeclareWinner(socket, roomCode, selWinners);
    setShowWinner(false); setSelWinners([]);
  };

  const handleRebuy = () => {
    if (!roomCode || !rebuyPlayerId || !rebuyAmt) return;
    emitRebuy(socket, roomCode, rebuyPlayerId, Number(rebuyAmt));
    setShowRebuy(false); setRebuyAmt(''); setRebuyPlayerId('');
  };

  return (
    <Wrap>
      <Header>
        <div className="name">PokerChipRush</div>
        <div className="hand">Hand #{room.handNumber}</div>
      </Header>

      <GameTable
        room={room}
        mySocketId={socket.id ?? ''}
        isDealer={amIDealer}
        onAction={(action, amount) => roomCode && emitPlayerAction(socket, roomCode, action as any, amount)}
        onAdvancePhase={() => roomCode && emitAdvancePhase(socket, roomCode)}
        onDeclareWinner={() => setShowWinner(true)}
        onNewHand={() => roomCode && emitNewHand(socket, roomCode)}
        onRebuy={() => setShowRebuy(true)}
        onEndGame={() => setShowEndConfirm(true)}
        onRaiseClick={() => { setRaiseAmt(''); setShowRaise(true); }}
      />

      {/* ─── Raise Modal ─── */}
      {showRaise && myPlayer && (
        <Overlay onClick={() => setShowRaise(false)}>
          <Sheet onClick={e => e.stopPropagation()}>
            <SheetTitle>Raise Amount</SheetTitle>
            <SheetSub>Enter the total amount you want to raise to</SheetSub>
            <InfoGrid>
              <div className="box"><label>CURRENT BET</label><strong>${room.currentBet.toFixed(2)}</strong></div>
              <div className="box"><label>YOUR STACK</label><strong>${myPlayer.chips.toFixed(2)}</strong></div>
            </InfoGrid>
            <BigInput
              type="number" placeholder="0" value={raiseAmt}
              onChange={e => setRaiseAmt(e.target.value)}
              min={room.bigBlind} max={myPlayer.chips} autoFocus
            />
            <MinMax>Min: ${room.bigBlind.toFixed(2)} • Max: ${myPlayer.chips.toFixed(2)}</MinMax>
            <QuickRow>
              <button onClick={() => setRaiseAmt(String(room.bigBlind * 2))}>
                Min Raise<span>${(room.bigBlind * 2).toFixed(2)}</span>
              </button>
              <button onClick={() => setRaiseAmt(String(room.pot))}>
                Pot<span>${room.pot.toFixed(2)}</span>
              </button>
              <button onClick={() => setRaiseAmt(String(myPlayer.chips))}>
                All-In<span>${myPlayer.chips.toFixed(2)}</span>
              </button>
            </QuickRow>
            <ModalBtns>
              <BtnCancel onClick={() => setShowRaise(false)}>Cancel</BtnCancel>
              <BtnConfirm onClick={handleRaiseConfirm} disabled={!raiseAmt || Number(raiseAmt) <= 0}>
                Confirm Raise
              </BtnConfirm>
            </ModalBtns>
          </Sheet>
        </Overlay>
      )}

      {/* ─── Declare Winner Modal ─── */}
      {showWinner && (
        <Overlay onClick={() => setShowWinner(false)}>
          <Sheet onClick={e => e.stopPropagation()}>
            <SheetTitle>🏆 Declare Winner</SheetTitle>
            <SheetSub>Select who won this hand (can be multiple for split pot)</SheetSub>
            <PotBox>
              <label>Total Pot</label>
              <strong>${room.pot.toFixed(2)}</strong>
            </PotBox>
            {nonFolded.map(p => (
              <WinnerOpt
                key={p.id}
                $sel={selWinners.includes(p.id)}
                onClick={() => setSelWinners(prev =>
                  prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]
                )}
              >
                <div>
                  <div className="name">
                    {p.name}
                    {p.id === socket.id && <span style={{ color: 'var(--accent)', fontSize: 10, marginLeft: 5 }}>YOU</span>}
                  </div>
                  <div className="chips">${p.chips.toFixed(2)}</div>
                </div>
                {selWinners.includes(p.id) && <span style={{ color: 'var(--accent)', fontSize: 20 }}>✓</span>}
              </WinnerOpt>
            ))}
            <ModalBtns style={{ marginTop: 12 }}>
              <BtnCancel onClick={() => setShowWinner(false)}>Cancel</BtnCancel>
              <BtnConfirm onClick={handleDeclare} disabled={selWinners.length === 0}>
                Award Pot
              </BtnConfirm>
            </ModalBtns>
          </Sheet>
        </Overlay>
      )}

      {/* ─── Rebuy Modal ─── */}
      {showRebuy && (
        <Overlay onClick={() => setShowRebuy(false)}>
          <Sheet onClick={e => e.stopPropagation()}>
            <SheetTitle>Player Rebuy</SheetTitle>
            <SheetSub>Add chips to a player's stack</SheetSub>
            <StyledSelect value={rebuyPlayerId} onChange={e => setRebuyPlayerId(e.target.value)}>
              <option value="">Choose a player...</option>
              {room.players.map(p => (
                <option key={p.id} value={p.id}>{p.name} — ${p.chips.toFixed(2)}</option>
              ))}
            </StyledSelect>
            <input
              type="number" placeholder="Amount to add"
              value={rebuyAmt} onChange={e => setRebuyAmt(e.target.value)}
              style={{ marginBottom: 20 }}
            />
            <ModalBtns>
              <BtnCancel onClick={() => setShowRebuy(false)}>Cancel</BtnCancel>
              <BtnConfirm onClick={handleRebuy} disabled={!rebuyPlayerId || !rebuyAmt}>
                Add Chips
              </BtnConfirm>
            </ModalBtns>
          </Sheet>
        </Overlay>
      )}

      {/* ─── End Game Confirm ─── */}
      {showEndConfirm && (
        <Overlay onClick={() => setShowEndConfirm(false)}>
          <Sheet onClick={e => e.stopPropagation()}>
            <SheetTitle>End Game Session?</SheetTitle>
            <SheetSub style={{ marginBottom: 24 }}>
              This will show final results for all players. Are you sure?
            </SheetSub>
            <ModalBtns>
              <BtnCancel onClick={() => setShowEndConfirm(false)}>Cancel</BtnCancel>
              <BtnConfirm $danger onClick={() => { setShowEndConfirm(false); roomCode && emitEndGame(socket, roomCode); }}>
                End Game & Settle
              </BtnConfirm>
            </ModalBtns>
          </Sheet>
        </Overlay>
      )}
    </Wrap>
  );
}