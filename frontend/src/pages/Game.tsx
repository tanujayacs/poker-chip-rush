import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { socket } from '../lib/socket';
import { useRoomStore } from '../store/useRoomStore';
import { Room, Player } from '../features/room/room.types';
import { GameTable } from '../features/game/GameTable';
import {
  emitPlayerAction, emitAdvancePhase, emitDeclareWinner,
  emitNewHand, emitRebuy, emitEndGame, onGameEnded,
} from '../features/game/game.socket';
import { onRoomState, onKicked, emitReconnect } from '../features/room/room.socket';

const slideUp = keyframes`from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); }`;
const fadeIn = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); }`;
const slideDown = keyframes`from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); }`;

const Wrap = styled.div`
  display: flex; flex-direction: column;
  min-height: 100vh; min-height: 100dvh;
`;

const Header = styled.div`
  background: linear-gradient(180deg, var(--bg2), rgba(11,11,32,0.85));
  border-bottom: 1px solid var(--border-strong);
  padding: 10px 14px;
  display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0;
  img { height: 26px; }
  .hand {
    font-size: 11px; color: var(--gold);
    font-family: 'DM Mono', monospace; letter-spacing: 1px;
    background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.3);
    padding: 4px 10px; border-radius: 999px;
  }
`;

/* ── Toast notification ── */
const Toast = styled.div<{ $type?: 'error' | 'info' | 'success' }>`
  position: fixed; top: 14px; left: 50%; transform: translateX(-50%);
  background: ${p =>
    p.$type === 'error' ? 'rgba(219,58,52,0.95)' :
    p.$type === 'success' ? 'rgba(18,183,164,0.95)' :
    'rgba(28,27,34,0.97)'};
  border: 1px solid ${p =>
    p.$type === 'error' ? 'var(--crimson)' :
    p.$type === 'success' ? 'var(--mint)' :
    'var(--border-strong)'};
  color: #fff; font-size: 13px; font-weight: 700;
  padding: 10px 20px; border-radius: 999px;
  z-index: 300; white-space: nowrap;
  animation: ${slideDown} 0.2s ease;
  pointer-events: none;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
`;

/* ── Auto-award banner (shown briefly after auto pot award) ── */
const AwardBanner = styled.div`
  position: fixed; top: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 560px;
  background: linear-gradient(135deg, rgba(212,175,55,0.18), rgba(18,183,164,0.14));
  border-bottom: 2px solid var(--gold);
  padding: 14px 20px;
  text-align: center; z-index: 200;
  animation: ${slideDown} 0.25s ease;
  .title { font-size: 15px; font-weight: 800; color: var(--gold); margin-bottom: 2px; }
  .sub { font-size: 12px; color: var(--text-muted); }
`;

/* ── Pot reminder (shown when showdown but pot > 0) ── */
const PotReminder = styled.div`
  background: rgba(212,175,55,0.08);
  border: 1px solid rgba(212,175,55,0.4);
  border-radius: var(--radius-sm);
  padding: 10px 14px; margin-bottom: 12px;
  text-align: center;
  font-size: 12px; color: var(--gold); font-weight: 700;
  animation: ${slideUp} 0.2s ease;
`;

const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(5,5,20,0.78);
  backdrop-filter: blur(4px);
  display: flex; align-items: flex-end; justify-content: center;
  z-index: 50; padding-bottom: env(safe-area-inset-bottom);
`;
const Sheet = styled.div`
  background: var(--bg3); border: 1px solid var(--border-strong);
  border-top: 2px solid var(--gold);
  border-radius: var(--radius) var(--radius) 0 0;
  padding: 26px 22px; width: 100%; max-width: 560px;
  animation: ${slideUp} 0.22s ease;
`;
const SheetTitle = styled.h3`font-size: 19px; font-weight: 800; margin-bottom: 4px;`;
const SheetSub = styled.p`font-size: 13px; color: var(--text-muted); margin-bottom: 20px;`;

const InfoGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;
  .box {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 11px 13px;
    label { font-size: 10px; color: var(--text-muted); display: block; margin-bottom: 4px; letter-spacing: 0.5px; text-transform: uppercase; }
    strong { font-size: 17px; font-family: 'DM Mono', monospace; }
  }
`;
const BigInput = styled.input`
  font-size: 30px; font-weight: 800; text-align: center;
  padding: 16px; margin-bottom: 6px; border-radius: var(--radius-sm); color: var(--gold);
  border-color: var(--border-strong);
`;
const MinMax = styled.p`font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 16px; font-family: 'DM Mono', monospace;`;
const QuickRow = styled.div`
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 18px;
  button {
    background: var(--bg2); border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm); padding: 11px; font-size: 12px; font-weight: 700;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    color: #fff;
    span { font-size: 10px; color: var(--text-muted); font-family: 'DM Mono'; }
    &:hover { border-color: var(--gold); color: var(--gold); }
  }
`;
const ModalBtns = styled.div`display: grid; grid-template-columns: 1fr 2fr; gap: 10px;`;
const BtnCancel = styled.button`
  background: var(--bg2); border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm); padding: 14px; font-size: 15px; font-weight: 700;
  color: #fff;
`;
const BtnConfirm = styled.button<{ $danger?: boolean }>`
  background: ${p => p.$danger ? 'var(--crimson)' : 'var(--grad-brand)'};
  color: ${p => p.$danger ? '#fff' : '#150A04'};
  border-radius: var(--radius-sm); padding: 14px; font-size: 15px; font-weight: 800;
  box-shadow: ${p => p.$danger ? 'none' : 'var(--shadow-brand)'};
  &:hover { filter: brightness(1.05); }
  &:disabled { opacity: 0.45; cursor: not-allowed; filter: none; box-shadow: none; }
`;

const WinnerOpt = styled.div<{ $sel?: boolean }>`
  background: ${p => p.$sel ? 'linear-gradient(135deg, rgba(212,175,55,0.14), rgba(255,200,87,0.1))' : 'var(--bg2)'};
  border: 1.5px solid ${p => p.$sel ? 'var(--gold)' : 'var(--border)'};
  border-radius: var(--radius-sm); padding: 14px 16px; cursor: pointer; margin-bottom: 8px;
  display: flex; align-items: center; justify-content: space-between;
  .name { font-size: 15px; font-weight: 700; }
  .chips { font-size: 12px; color: var(--text-muted); font-family: 'DM Mono'; margin-top: 2px; }
  &:hover { border-color: var(--gold); }
`;
const PotBox = styled.div`
  background: var(--bg2); border: 1px solid rgba(212,175,55,0.3);
  border-radius: var(--radius-sm); padding: 12px 16px; margin-bottom: 14px;
  label { font-size: 10px; color: var(--text-muted); display: block; margin-bottom: 3px; letter-spacing: 0.5px; text-transform: uppercase; }
  strong { font-size: 24px; font-family: 'DM Mono'; font-weight: 800; background: var(--grad-gold); -webkit-background-clip: text; background-clip: text; color: transparent; }
`;
const StyledSelect = styled.select`
  width: 100%; background: var(--bg2); border: 1px solid var(--border-strong);
  color: var(--text); border-radius: var(--radius-sm); padding: 13px 14px;
  font-size: 15px; margin-bottom: 12px; outline: none; appearance: none;
  &:focus { border-color: var(--gold); }
`;

const EndOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(5,5,20,0.94);
  display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px;
`;
const EndCard = styled.div`
  background: var(--bg3); border: 1px solid var(--border-strong);
  border-top: 3px solid var(--gold); border-radius: var(--radius);
  padding: 30px 24px; width: 100%; max-width: 420px;
  animation: ${fadeIn} 0.3s ease;
  h2 { font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 4px; background: var(--grad-gold); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .sub { font-size: 13px; color: var(--text-muted); text-align: center; margin-bottom: 24px; }
`;
const RankItem = styled.div<{ $rank: number }>`
  display: flex; align-items: center; gap: 12px; background: var(--bg2);
  border: 1px solid ${p => p.$rank === 1 ? 'var(--gold)' : 'var(--border)'};
  ${p => p.$rank === 1 && 'box-shadow: var(--shadow-gold);'}
  border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 8px;
  .medal { font-size: 22px; width: 28px; }
  .info { flex: 1;
    .name { font-size: 14px; font-weight: 700; }
    .chips { font-size: 12px; color: var(--text-muted); font-family: 'DM Mono'; margin-top: 2px; }
  }
`;
const HomeBtn = styled.button`
  width: 100%; background: var(--grad-brand); color: #150A04;
  padding: 14px; border-radius: var(--radius);
  font-size: 15px; font-weight: 800; margin-top: 10px;
  box-shadow: var(--shadow-brand);
  &:hover { filter: brightness(1.06); }
`;

interface ToastState {
  msg: string;
  type: 'error' | 'info' | 'success';
}

export default function Game() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { myName, isDealer, setMyId, setRoom } = useRoomStore();

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
  const [toast, setToast] = useState<ToastState | null>(null);
  const [autoAward, setAutoAward] = useState<{ name: string; pot: number } | null>(null);
  const [potAwarded, setPotAwarded] = useState(false); // apakah pot sudah diberikan di hand ini

  const showToast = (msg: string, type: ToastState['type'] = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!socket.connected) socket.connect();
    setMyId(socket.id ?? '');

    const offState = onRoomState(socket, (r) => {
      setLocalRoom(r);
      setRoom(r);
      // Reset potAwarded flag ketika hand baru dimulai
      if (r.phase === 'preflop') {
        setPotAwarded(false);
      }
    });
    const offEnded = onGameEnded(socket, ({ players }) => setFinalPlayers(players));
    const offKicked = onKicked(socket, () => navigate('/'));

    // Winner declared (manual atau auto)
    socket.on('winner_declared', ({ winnerIds, pot, players, auto }: {
      winnerIds: string[], pot: number, players: Player[], auto: boolean
    }) => {
      setPotAwarded(true);
      if (auto) {
        // Cari nama winner
        const winner = players.find(p => winnerIds.includes(p.id));
        if (winner) {
          setAutoAward({ name: winner.name, pot });
          setTimeout(() => setAutoAward(null), 3500);
        }
      } else {
        // Manual declare - close modal jika masih buka
        setShowWinner(false);
        setSelWinners([]);
      }
    });

    // Error toasts
    socket.on('advance_error', ({ message }: { message: string }) => showToast(message, 'error'));
    socket.on('rebuy_error', ({ message }: { message: string }) => showToast(message, 'error'));
    socket.on('end_error', ({ message }: { message: string }) => showToast(message, 'error'));
    socket.on('start_error', ({ message }: { message: string }) => showToast(message, 'error'));

    const savedName = myName ?? localStorage.getItem('pcr_name');
    if (savedName && roomCode) emitReconnect(socket, roomCode, savedName);

    return () => {
      offState(); offEnded(); offKicked();
      socket.off('winner_declared');
      socket.off('advance_error');
      socket.off('rebuy_error');
      socket.off('end_error');
      socket.off('start_error');
    };
  }, [roomCode]);

  if (finalPlayers) {
    const sorted = [...finalPlayers].sort((a, b) => b.chips - a.chips);
    const medals = ['🥇', '🥈', '🥉'];
    return (
      <EndOverlay>
        <EndCard>
          <h2>Game Over</h2>
          <div className="sub">Final standings</div>
          {sorted.map((p, i) => (
            <RankItem key={p.id} $rank={i + 1}>
              <div className="medal">{medals[i] ?? `#${i + 1}`}</div>
              <div className="info">
                <div className="name">
                  {p.name}
                  {p.id === socket.id && <span style={{ color: 'var(--gold)', fontSize: 10, marginLeft: 6 }}>YOU</span>}
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
    // Modal akan ditutup oleh winner_declared event
  };

  const handleRebuy = () => {
    if (!roomCode || !rebuyPlayerId || !rebuyAmt) return;
    emitRebuy(socket, roomCode, rebuyPlayerId, Number(rebuyAmt));
    setShowRebuy(false); setRebuyAmt(''); setRebuyPlayerId('');
  };

  // Pot reminder: showdown tapi pot > 0 dan belum di-award
  const showPotReminder = amIDealer && room.phase === 'showdown' && room.pot > 0 && !potAwarded;

  return (
    <Wrap style={{ marginTop: '10px' }}>
      {/* Toast */}
      {toast && <Toast $type={toast.type}>{toast.msg}</Toast>}

      {/* Auto-award banner */}
      {autoAward && (
        <AwardBanner>
          <div className="title">🏆 {autoAward.name} wins ${autoAward.pot.toFixed(2)}!</div>
          <div className="sub">All other players folded — pot automatically awarded</div>
        </AwardBanner>
      )}

      <Header>
        <img src="/logo.png" alt="PCR" />
        <div className="hand">HAND #{room.handNumber}</div>
      </Header>

      <GameTable
        room={room}
        mySocketId={socket.id ?? ''}
        isDealer={amIDealer}
        isDealerPlayer={room.dealerIsPlayer}
        onAction={(action, amount) => roomCode && emitPlayerAction(socket, roomCode, action as any, amount)}
        onAdvancePhase={() => roomCode && emitAdvancePhase(socket, roomCode)}
        onDeclareWinner={() => setShowWinner(true)}
        onNewHand={() => {
          // Cek apakah pot sudah diberikan
          if (room.pot > 0 && !potAwarded) {
            showToast('⚠️ Pot belum diberikan ke pemenang!', 'error');
            return;
          }
          roomCode && emitNewHand(socket, roomCode);
        }}
        onRebuy={() => setShowRebuy(true)}
        onEndGame={() => setShowEndConfirm(true)}
        onRaiseClick={() => { setRaiseAmt(''); setShowRaise(true); }}
      />

      {/* Pot reminder (inside dealer controls sheet area) */}
      {showPotReminder && !showWinner && (
        <div style={{ padding: '0 14px 8px', flexShrink: 0 }}>
          <PotReminder>
            ⚠️ The ${room.pot.toFixed(2)} pot has not been awarded yet — press “Declare Winner”!
          </PotReminder>
        </div>
      )}

      {/* ── Raise modal ── */}
      {showRaise && myPlayer && (
        <Overlay onClick={() => setShowRaise(false)}>
          <Sheet onClick={e => e.stopPropagation()}>
            <SheetTitle>Raise Amount</SheetTitle>
            <SheetSub>Enter the amount you want to raise by</SheetSub>
            <InfoGrid>
              <div className="box"><label>Current Bet</label><strong>${room.currentBet.toFixed(2)}</strong></div>
              <div className="box"><label>Your Stack</label><strong>${myPlayer.chips.toFixed(2)}</strong></div>
            </InfoGrid>
            <BigInput
              type="number" placeholder="0" value={raiseAmt}
              onChange={e => setRaiseAmt(e.target.value)}
              min={room.bigBlind} max={myPlayer.chips} autoFocus
            />
            <MinMax>Min ${room.bigBlind.toFixed(2)} • Max ${myPlayer.chips.toFixed(2)}</MinMax>
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

      {/* ── Declare winner modal ── */}
      {showWinner && (
        <Overlay onClick={() => setShowWinner(false)}>
          <Sheet onClick={e => e.stopPropagation()}>
            <SheetTitle>🏆 Declare Winner</SheetTitle>
            <SheetSub>Select who won this hand (multi-select for split pot)</SheetSub>
            <PotBox>
              <label>Total Pot</label>
              <strong>${room.pot.toFixed(2)}</strong>
            </PotBox>
            {nonFolded.map(p => (
              <WinnerOpt key={p.id} $sel={selWinners.includes(p.id)}
                onClick={() => setSelWinners(prev =>
                  prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}>
                <div>
                  <div className="name">
                    {p.name}
                    {p.id === socket.id && <span style={{ color: 'var(--gold)', fontSize: 10, marginLeft: 6 }}>YOU</span>}
                  </div>
                  <div className="chips">${p.chips.toFixed(2)}</div>
                </div>
                {selWinners.includes(p.id) && <span style={{ color: 'var(--gold)', fontSize: 22 }}>✓</span>}
              </WinnerOpt>
            ))}
            <ModalBtns style={{ marginTop: 14 }}>
              <BtnCancel onClick={() => setShowWinner(false)}>Cancel</BtnCancel>
              <BtnConfirm onClick={handleDeclare} disabled={selWinners.length === 0}>
                Award Pot
              </BtnConfirm>
            </ModalBtns>
          </Sheet>
        </Overlay>
      )}

      {/* ── Rebuy modal ── */}
      {showRebuy && (
        <Overlay onClick={() => setShowRebuy(false)}>
          <Sheet onClick={e => e.stopPropagation()}>
            <SheetTitle>＋ Player Rebuy</SheetTitle>
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

      {/* ── End game confirm ── */}
      {showEndConfirm && (
        <Overlay onClick={() => setShowEndConfirm(false)}>
          <Sheet onClick={e => e.stopPropagation()}>
            <SheetTitle>End Game Session?</SheetTitle>
            <SheetSub style={{ marginBottom: 24 }}>
              This will show final results for all players and close the room.
            </SheetSub>
            <ModalBtns>
              <BtnCancel onClick={() => setShowEndConfirm(false)}>Cancel</BtnCancel>
              <BtnConfirm $danger onClick={() => {
                setShowEndConfirm(false);
                roomCode && emitEndGame(socket, roomCode);
              }}>
                End Game & Settle
              </BtnConfirm>
            </ModalBtns>
          </Sheet>
        </Overlay>
      )}
    </Wrap>
  );
}