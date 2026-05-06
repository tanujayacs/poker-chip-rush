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

const TableWrap = styled.div`display: flex; flex-direction: column; gap: 0; flex: 1;`;

const PotBar = styled.div`
  background: linear-gradient(180deg, var(--bg2), rgba(11,11,32,0.6));
  border-bottom: 1px solid var(--border);
  padding: 14px 16px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
`;
const PotBlock = styled.div`
  .label { font-size: 10px; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px; }
  .value {
    font-size: 24px; font-weight: 800;
    font-family: 'DM Mono', monospace;
    background: var(--grad-gold);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
`;
const PhaseChip = styled.div`
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(212,175,55,0.10);
  border: 1px solid rgba(212,175,55,0.4);
  color: var(--gold);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
`;
const CallBlock = styled.div`
  text-align: right;
  .label { font-size: 10px; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; }
  .value { font-size: 17px; font-weight: 700; font-family: 'DM Mono', monospace; color: var(--text); }
`;

const TurnLabel = styled.div`
  text-align: center;
  padding: 8px 14px;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
  letter-spacing: 0.4px;
  background: rgba(11,11,32,0.4);
`;

const PlayersList = styled.div`
  flex: 1; padding: 12px 14px;
  display: flex; flex-direction: column; gap: 9px; overflow-y: auto;
`;

const ActionBar = styled.div`
  background: linear-gradient(180deg, rgba(28,27,34,0.95), var(--bg2));
  border-top: 1px solid var(--border-strong);
  padding: 14px;
  animation: ${slideUp} 0.2s ease;
`;

const PhaseLabel = styled.div`
  font-size: 10px;
  color: var(--gold);
  text-align: center;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 12px;
  font-weight: 700;
`;

const Row3 = styled.div`display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 8px;`;
const Row2 = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 8px;`;

/* Crimson — Fold */
const BtnFold = styled.button`
  background: rgba(219,58,52,0.14); border: 1px solid var(--crimson); color: var(--crimson);
  border-radius: var(--radius-sm); padding: 14px; font-size: 14px; font-weight: 800; letter-spacing: 0.5px;
  &:hover { background: rgba(219,58,52,0.28); }
`;
/* Mint — Check / Call */
const BtnCheck = styled.button`
  background: rgba(18,183,164,0.14); border: 1px solid var(--mint); color: var(--mint);
  border-radius: var(--radius-sm); padding: 14px; font-size: 14px; font-weight: 800;
  &:hover { background: rgba(18,183,164,0.28); }
`;
const BtnCall = BtnCheck;
/* Orange — Raise (brand action) */
const BtnRaise = styled.button`
  background: var(--grad-brand); color: #150A04;
  border-radius: var(--radius-sm); padding: 14px; font-size: 14px; font-weight: 800;
  box-shadow: 0 4px 14px -6px rgba(255,87,51,0.6);
  &:hover { filter: brightness(1.07); }
`;
/* Gold — All In */
const BtnAllIn = styled.button`
  width: 100%;
  background: linear-gradient(135deg, rgba(212,175,55,0.14), rgba(255,200,87,0.18));
  border: 1px solid var(--gold); color: var(--gold);
  border-radius: var(--radius-sm); padding: 14px; font-size: 14px; font-weight: 800; letter-spacing: 0.5px;
  &:hover { background: rgba(212,175,55,0.25); }
`;
/* Gold — Advance phase */
const BtnAdvance = styled.button`
  width: 100%;
  background: var(--grad-gold); color: #1A1206;
  border-radius: var(--radius-sm); padding: 14px; font-size: 14px; font-weight: 800; letter-spacing: 0.5px;
  margin-bottom: 8px;
  box-shadow: var(--shadow-gold);
  &:hover { filter: brightness(1.05); }
`;
/* Orange — New Hand / Rebuys (brand admin actions) */
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
  room, mySocketId, isDealer,
  onAction, onAdvancePhase, onDeclareWinner,
  onNewHand, onRebuy, onEndGame, onRaiseClick,
}: GameTableProps) {
  const myPlayer = room.players.find(p => p.id === mySocketId);
  const activePlayer = room.players[room.activePlayerIndex];
  const isMyTurn = activePlayer?.id === mySocketId;
  const toCall = myPlayer ? Math.max(0, room.currentBet - myPlayer.currentBet) : 0;
  const canCheck = toCall === 0;
  const bbIndex = (room.sbIndex + 1) % room.players.length;

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

      <TurnLabel>
        {isMyTurn
          ? '🟠 Your Turn'
          : activePlayer && room.phase !== 'showdown'
          ? `⏳ ${activePlayer.name}'s Turn`
          : room.phase === 'showdown'
          ? '🏁 Showdown — Dealer declares winner'
          : ''}
      </TurnLabel>

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

      {isDealer && (
        <ActionBar>
          <PhaseLabel>Dealer Controls • {phaseMap[room.phase]}</PhaseLabel>
          {room.phase === 'showdown' ? (
            <>
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
            </>
          ) : (
            <>
              <BtnAdvance onClick={onAdvancePhase}>
                Advance → {nextPhaseMap[room.phase] ?? 'SHOWDOWN'}
              </BtnAdvance>
              <Row2>
                <BtnBrand onClick={onRebuy}>＋ Rebuys</BtnBrand>
                <BtnSecondary
                  style={{ color: 'var(--crimson)', borderColor: 'rgba(219,58,52,0.5)' }}
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