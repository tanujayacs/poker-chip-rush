import styled, { keyframes } from 'styled-components';
import { Room } from '../room/room.types';
import PlayerCard from '../../components/player/PlayerCard';

interface GameTableProps {
  room: Room;
  mySocketId: string;
  isDealer: boolean;       // apakah saya host/dealer
  isDealerPlayer: boolean; // apakah dealer ikut main
  onAction: (action: string, amount?: number) => void;
  onAdvancePhase: () => void;
  onDeclareWinner: () => void;
  onNewHand: () => void;
  onRebuy: () => void;
  onEndGame: () => void;
  onRaiseClick: () => void;
}

const slideUp = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;
const blink = keyframes`0%,100%{opacity:1}50%{opacity:0.4}`;

const TableWrap = styled.div`
  display: flex; flex-direction: column; flex: 1; overflow: hidden;
`;

/* ── Pot bar ── */
const PotBar = styled.div`
  background: linear-gradient(180deg, var(--bg2), rgba(11,11,32,0.6));
  border-bottom: 1px solid var(--border);
  padding: 14px 16px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;
const PotBlock = styled.div`
  .label { font-size: 10px; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px; }
  .value { font-size: 24px; font-weight: 800; font-family: 'DM Mono', monospace; background: var(--grad-gold); -webkit-background-clip: text; background-clip: text; color: transparent; }
`;
const PhaseChip = styled.div`
  padding: 6px 14px; border-radius: 999px;
  background: rgba(212,175,55,0.10); border: 1px solid rgba(212,175,55,0.4);
  color: var(--gold); font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase;
  white-space: nowrap;
`;
const CallBlock = styled.div`
  text-align: right;
  .label { font-size: 10px; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; }
  .value { font-size: 17px; font-weight: 700; font-family: 'DM Mono', monospace; color: var(--text); }
`;

/* ── Players list ── */
const PlayersList = styled.div`
  flex: 1;
  padding: 12px 14px;
  display: flex; flex-direction: column; gap: 9px;
  overflow-y: auto;
`;

/* ── Bottom bar base ── */
const BottomBar = styled.div`
  background: linear-gradient(180deg, rgba(22,21,30,0.99), var(--bg2));
  border-top: 1px solid var(--border-strong);
  padding: 14px;
  flex-shrink: 0;
  animation: ${slideUp} 0.2s ease;
`;

const BarLabel = styled.div`
  font-size: 10px; color: var(--gold); text-align: center;
  letter-spacing: 1.4px; text-transform: uppercase; margin-bottom: 12px; font-weight: 700;
`;

/* ── Action buttons ── */
const Row3 = styled.div`display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 8px;`;
const Row2 = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 8px;`;

const BtnFold = styled.button`
  background: rgba(219,58,52,0.14); border: 1px solid var(--crimson); color: var(--crimson);
  border-radius: var(--radius-sm); padding: 14px; font-size: 14px; font-weight: 800; letter-spacing: 0.5px;
  &:hover { background: rgba(219,58,52,0.28); }
`;
const BtnCheck = styled.button`
  background: rgba(18,183,164,0.14); border: 1px solid var(--mint); color: var(--mint);
  border-radius: var(--radius-sm); padding: 14px; font-size: 14px; font-weight: 800;
  &:hover { background: rgba(18,183,164,0.28); }
`;
const BtnCall = BtnCheck;
const BtnRaise = styled.button`
  background: var(--grad-brand); color: #150A04;
  border-radius: var(--radius-sm); padding: 14px; font-size: 14px; font-weight: 800;
  box-shadow: 0 4px 14px -6px rgba(255,87,51,0.6);
  &:hover { filter: brightness(1.07); }
`;
const BtnAllIn = styled.button`
  width: 100%;
  background: linear-gradient(135deg, rgba(212,175,55,0.14), rgba(255,200,87,0.18));
  border: 1px solid var(--gold); color: var(--gold);
  border-radius: var(--radius-sm); padding: 14px; font-size: 14px; font-weight: 800; letter-spacing: 0.5px;
  &:hover { background: rgba(212,175,55,0.25); }
`;

/* ── Waiting indicator ── */
const WaitingText = styled.div`
  text-align: center;
  font-size: 13px; font-weight: 700; color: var(--text-muted); padding: 4px 0;
  span.name {
    color: var(--gold);
    animation: ${blink} 2s ease-in-out infinite;
    display: inline-block;
  }
  span.sub {
    display: block; font-size: 10px; color: var(--text-dim); margin-top: 3px;
    font-weight: 500; letter-spacing: 0.3px;
  }
`;

/* ── Dealer advance button ── */
const BtnAdvance = styled.button`
  width: 100%;
  background: var(--grad-gold); color: #1A1206;
  border-radius: var(--radius-sm); padding: 14px; font-size: 14px; font-weight: 800; letter-spacing: 0.5px;
  margin-bottom: 8px;
  box-shadow: var(--shadow-gold);
  &:hover { filter: brightness(1.05); }
`;
const BtnBrand = styled.button`
  background: rgba(255,87,51,0.12); border: 1px solid var(--brand); color: var(--brand);
  border-radius: var(--radius-sm); padding: 12px; font-size: 13px; font-weight: 800;
  &:hover { background: rgba(255,87,51,0.22); }
`;
const BtnSecondary = styled.button`
  background: var(--bg3); border: 1px solid var(--border-strong); color: var(--text-muted);
  border-radius: var(--radius-sm); padding: 12px; font-size: 13px; font-weight: 700;
  &:hover { border-color: var(--text-muted); color: var(--text); }
`;

const phaseMap: Record<string, string> = {
  preflop: 'PRE FLOP', flop: 'FLOP', turn: 'TURN', river: 'RIVER', showdown: 'SHOWDOWN',
};
const nextPhaseMap: Record<string, string> = {
  preflop: 'FLOP', flop: 'TURN', turn: 'RIVER', river: 'SHOWDOWN',
};

export function GameTable({
  room, mySocketId, isDealer, isDealerPlayer,
  onAction, onAdvancePhase, onDeclareWinner,
  onNewHand, onRebuy, onEndGame, onRaiseClick,
}: GameTableProps) {
  const myPlayer = room.players.find(p => p.id === mySocketId);
  const activePlayer = room.players[room.activePlayerIndex];
  const bbIndex = (room.sbIndex + 1) % room.players.length;

  // Apakah saya seorang pemain aktif (bukan dealer non-player)
  const iAmAPlayer = !!myPlayer && (isDealerPlayer || !isDealer);

  // Giliran saya?
  const isMyTurn = iAmAPlayer
    && activePlayer?.id === mySocketId
    && room.phase !== 'showdown'
    && room.phase !== 'waiting';

  const toCall = myPlayer ? Math.max(0, room.currentBet - myPlayer.currentBet) : 0;
  const canCheck = toCall === 0;
  const isShowdown = room.phase === 'showdown';
  const isLive = room.phase !== 'waiting' && room.phase !== 'showdown';

  // Apakah saya sedang menunggu giliran orang lain?
  const isWaiting = iAmAPlayer
    && !isMyTurn
    && isLive
    && myPlayer
    && !myPlayer.folded;

  // Dealer bisa advance?
  const canAdvance = isDealer && room.bettingComplete && isLive;

  // Dealer menunggu pemain bet?
  const dealerWaiting = isDealer && !room.bettingComplete && isLive && !isMyTurn;

  // Dealer juga player dan giliran saya: tampilkan bet controls, bukan dealer controls
  // Dealer controls tampil DI BAWAH bet controls (atau menggantikan waiting)

  // ── What to show at the bottom ──
  // Priority:
  //   1. Jika giliran saya → show bet buttons
  //   2. Jika dealer (non-player, atau player tapi bukan giliran saya):
  //      a. showdown → dealer controls
  //      b. canAdvance → advance button
  //      c. dealerWaiting → waiting text (single)
  //   3. Jika player biasa & menunggu → waiting text

  const showBetControls = isMyTurn && myPlayer && !myPlayer.folded && !myPlayer.allIn;
  const showDealerControls = isDealer && isShowdown;
  const showDealerAdvance = isDealer && canAdvance;
  // Waiting: tampil di bet area JIKA saya player tapi bukan giliran saya
  // Dealer non-player juga tampil ini (sebagai info giliran siapa)
  const showWaiting = !showBetControls && isLive && !showDealerControls && !showDealerAdvance;

  return (
    <TableWrap>
      <PotBar>
        <PotBlock>
          <div className="label">Pot</div>
          <div className="value">${room.pot.toFixed(2)}</div>
        </PotBlock>
        <PhaseChip>{phaseMap[room.phase] ?? room.phase}</PhaseChip>
        <CallBlock>
          <div className="label">To Call</div>
          <div className="value">${toCall.toFixed(2)}</div>
        </CallBlock>
      </PotBar>

      <PlayersList>
        {room.players.map((p, i) => (
          <PlayerCard
            key={p.id}
            player={p}
            isActive={i === room.activePlayerIndex && isLive}
            isMe={p.id === mySocketId}
            playerIndex={i}
            sbIndex={room.sbIndex}
            bbIndex={bbIndex}
          />
        ))}
      </PlayersList>

      {/* ── 1. Bet controls (giliran saya) ── */}
      {showBetControls && (
        <BottomBar>
          <BarLabel>{phaseMap[room.phase]} · Your Turn</BarLabel>
          <Row3>
            <BtnFold onClick={() => onAction('fold')}>Fold</BtnFold>
            {canCheck
              ? <BtnCheck onClick={() => onAction('check')}>Check</BtnCheck>
              : <BtnCall onClick={() => onAction('call')}>Call ${toCall.toFixed(2)}</BtnCall>
            }
            <BtnRaise onClick={onRaiseClick}>Raise</BtnRaise>
          </Row3>
          <BtnAllIn onClick={() => onAction('allin')}>
            All In — ${myPlayer!.chips.toFixed(2)}
          </BtnAllIn>
        </BottomBar>
      )}

      {/* ── 2a. Dealer advance (betting selesai, bukan showdown) ── */}
      {showDealerAdvance && (
        <BottomBar>
          <BarLabel>Dealer · All Bets Matched</BarLabel>
          <BtnAdvance onClick={onAdvancePhase}>
            Deal → {nextPhaseMap[room.phase] ?? 'SHOWDOWN'}
          </BtnAdvance>
        </BottomBar>
      )}

      {/* ── 2b. Dealer showdown controls ── */}
      {showDealerControls && (
        <BottomBar>
          <BarLabel>Dealer Controls · Showdown</BarLabel>
          <BtnAdvance onClick={onDeclareWinner}>🏆 Declare Winner</BtnAdvance>
          <Row2 style={{ marginBottom: 8 }}>
            <BtnBrand onClick={onNewHand}>↻ New Hand</BtnBrand>
            <BtnBrand onClick={onRebuy}>＋ Rebuys</BtnBrand>
          </Row2>
          <BtnSecondary
            style={{ width: '100%', color: 'var(--crimson)', borderColor: 'rgba(219,58,52,0.5)' }}
            onClick={onEndGame}
          >
            End Game
          </BtnSecondary>
        </BottomBar>
      )}

      {/* ── 3. Waiting indicator (single, untuk semua kasus menunggu) ── */}
      {showWaiting && (
        <BottomBar>
          <WaitingText>
            {activePlayer
              ? <>Waiting for <span className="name">{activePlayer.name}</span> to act</>
              : 'Waiting…'
            }
            <span className="sub">{phaseMap[room.phase] ?? ''}</span>
          </WaitingText>
        </BottomBar>
      )}
    </TableWrap>
  );
}

export default GameTable;