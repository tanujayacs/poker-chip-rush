import styled, { keyframes } from 'styled-components';
import { Room, Player } from '../room/room.types';
import { Button } from '../../components/ui/Button';
import PlayerCard from '../../components/player/PlayerCard';

interface GameTableProps {
  room: Room;
  mySocketId: string;
  isDealer: boolean;
  onAction: (action: string, amount?: number) => void;
  onAdvancePhase: () => void;
  onDeclareWinner: () => void;
  onNewHand: () => void;
  onRebuy: () => void;
  onEndGame: () => void;
  onRaiseClick: () => void;
}

const slideUp = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;

const TableWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
`;

// ─── Pot & Phase Bar ─────────────────────────────────────────────────────────
const PotBar = styled.div`
  background: var(--bg2);
  border-bottom: 1px solid var(--border);
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const PotBlock = styled.div`
  .label { font-size: 10px; color: var(--text-muted); letter-spacing: 0.5px; text-transform: uppercase; }
  .value { font-size: 22px; font-weight: 800; color: var(--accent); font-family: 'DM Mono', monospace; }
`;
const CallBlock = styled.div`
  text-align: right;
  .label { font-size: 10px; color: var(--text-muted); letter-spacing: 0.5px; text-transform: uppercase; }
  .value { font-size: 17px; font-weight: 700; font-family: 'DM Mono', monospace; }
`;

// ─── Turn Label ──────────────────────────────────────────────────────────────
const TurnLabel = styled.div`
  text-align: center;
  padding: 6px 14px;
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 600;
`;

// ─── Players ─────────────────────────────────────────────────────────────────
const PlayersList = styled.div`
  flex: 1;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
`;

// ─── Action Bar ──────────────────────────────────────────────────────────────
const ActionBar = styled.div`
  background: var(--bg2);
  border-top: 1px solid var(--border);
  padding: 14px;
  animation: ${slideUp} 0.2s ease;
`;

const PhaseLabel = styled.div`
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 10px;
`;

const Row3 = styled.div`display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 8px;`;
const Row2 = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 8px;`;

const BtnFold = styled.button`
  background: rgba(207,34,46,0.15); border: 1px solid var(--red); color: var(--red);
  border-radius: var(--radius-sm); padding: 13px; font-size: 14px; font-weight: 700;
  &:hover { background: rgba(207,34,46,0.3); }
`;
const BtnCheck = styled.button`
  background: var(--bg3); border: 1px solid var(--border); color: var(--text);
  border-radius: var(--radius-sm); padding: 13px; font-size: 14px; font-weight: 700;
  &:hover { border-color: var(--text); }
`;
const BtnCall = styled.button`
  background: rgba(31,111,235,0.2); border: 1px solid var(--blue); color: #60a5fa;
  border-radius: var(--radius-sm); padding: 13px; font-size: 14px; font-weight: 700;
  &:hover { background: rgba(31,111,235,0.35); }
`;
const BtnRaise = styled.button`
  background: rgba(0,229,160,0.1); border: 1px solid var(--accent); color: var(--accent);
  border-radius: var(--radius-sm); padding: 13px; font-size: 14px; font-weight: 700;
  &:hover { background: rgba(0,229,160,0.22); }
`;
const BtnAllIn = styled.button`
  width: 100%;
  background: rgba(210,153,34,0.13); border: 1px solid var(--yellow); color: var(--yellow);
  border-radius: var(--radius-sm); padding: 13px; font-size: 14px; font-weight: 700;
  &:hover { background: rgba(210,153,34,0.28); }
`;
const BtnAdvance = styled.button`
  width: 100%;
  background: var(--accent); color: #0d1117;
  border-radius: var(--radius-sm); padding: 13px; font-size: 14px; font-weight: 700;
  margin-bottom: 8px;
  &:hover { background: #00ffb3; }
`;
const BtnSecondary = styled.button`
  background: var(--bg3); border: 1px solid var(--border); color: var(--text-muted);
  border-radius: var(--radius-sm); padding: 11px; font-size: 13px; font-weight: 600;
  &:hover { border-color: var(--text-muted); color: var(--text); }
`;

const phaseMap: Record<string, string> = {
  preflop: 'PRE FLOP', flop: 'FLOP', turn: 'TURN', river: 'RIVER', showdown: 'SHOWDOWN',
};
const nextPhaseMap: Record<string, string> = {
  preflop: 'FLOP', flop: 'TURN', turn: 'RIVER', river: 'SHOWDOWN',
};

export function GameTable({
  room,
  mySocketId,
  isDealer,
  onAction,
  onAdvancePhase,
  onDeclareWinner,
  onNewHand,
  onRebuy,
  onEndGame,
  onRaiseClick,
}: GameTableProps) {
  const myPlayer = room.players.find(p => p.id === mySocketId);
  const activePlayer = room.players[room.activePlayerIndex];
  const isMyTurn = activePlayer?.id === mySocketId;
  const toCall = myPlayer ? Math.max(0, room.currentBet - myPlayer.currentBet) : 0;
  const canCheck = toCall === 0;
  const bbIndex = (room.sbIndex + 1) % room.players.length;

  return (
    <TableWrap>
      {/* Pot bar */}
      <PotBar>
        <PotBlock>
          <div className="label">Pot</div>
          <div className="value">${room.pot.toFixed(2)}</div>
        </PotBlock>
        <PotBlock style={{ textAlign: 'center' }}>
          <div className="label" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {phaseMap[room.phase] ?? room.phase}
          </div>
        </PotBlock>
        <CallBlock>
          <div className="label">To Call</div>
          <div className="value">${toCall.toFixed(2)}</div>
        </CallBlock>
      </PotBar>

      {/* Turn label */}
      <TurnLabel>
        {isMyTurn
          ? '🟢 Your Turn'
          : activePlayer && room.phase !== 'showdown'
          ? `⏳ ${activePlayer.name}'s Turn`
          : room.phase === 'showdown'
          ? '🏁 Showdown — Dealer declares winner'
          : ''}
      </TurnLabel>

      {/* Players list */}
      <PlayersList>
        {room.players.map((p, i) => (
          <PlayerCard
            key={p.id}
            player={p}
            isActive={i === room.activePlayerIndex && room.phase !== 'showdown'}
            isMe={p.id === mySocketId}
            playerIndex={i}
            sbIndex={room.sbIndex}
            bbIndex={bbIndex}
          />
        ))}
      </PlayersList>

      {/* Player action bar */}
      {isMyTurn && myPlayer && !myPlayer.folded && !myPlayer.allIn && (
        <ActionBar>
          <PhaseLabel>{phaseMap[room.phase]} • Your Turn</PhaseLabel>
          <Row3>
            <BtnFold onClick={() => onAction('fold')}>Fold</BtnFold>
            {canCheck
              ? <BtnCheck onClick={() => onAction('check')}>Check</BtnCheck>
              : <BtnCall onClick={() => onAction('call')}>Call ${toCall.toFixed(2)}</BtnCall>
            }
            <BtnRaise onClick={onRaiseClick}>Raise</BtnRaise>
          </Row3>
          <BtnAllIn onClick={() => onAction('allin')}>
            🚀 All In (${myPlayer.chips.toFixed(2)})
          </BtnAllIn>
        </ActionBar>
      )}

      {/* Dealer control bar */}
      {isDealer && (
        <ActionBar>
          <PhaseLabel>Dealer Controls • {phaseMap[room.phase]}</PhaseLabel>
          {room.phase === 'showdown' ? (
            <>
              <BtnAdvance onClick={onDeclareWinner}>🏆 Declare Winner</BtnAdvance>
              <Row2 style={{ marginBottom: 8 }}>
                <BtnSecondary onClick={onNewHand}>New Hand</BtnSecondary>
                <BtnSecondary onClick={onRebuy}>Rebuys</BtnSecondary>
              </Row2>
              <BtnSecondary
                style={{ width: '100%', color: 'var(--red)', borderColor: 'rgba(207,34,46,0.4)' }}
                onClick={onEndGame}
              >
                End Game
              </BtnSecondary>
            </>
          ) : (
            <>
              <BtnAdvance onClick={onAdvancePhase}>
                Advance → {nextPhaseMap[room.phase] ?? 'SHOWDOWN'}
              </BtnAdvance>
              <Row2>
                <BtnSecondary onClick={onRebuy}>Rebuys</BtnSecondary>
                <BtnSecondary
                  style={{ color: 'var(--red)', borderColor: 'rgba(207,34,46,0.4)' }}
                  onClick={onEndGame}
                >
                  End Game
                </BtnSecondary>
              </Row2>
            </>
          )}
        </ActionBar>
      )}
    </TableWrap>
  );
}

export default GameTable;