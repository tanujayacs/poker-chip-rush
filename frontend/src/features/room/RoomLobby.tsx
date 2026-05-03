import styled from 'styled-components';
import { Room, Player } from './room.types';
import { Card, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import PlayerCard from '../../components/player/PlayerCard';

interface RoomLobbyProps {
  room: Room;
  mySocketId: string;
  isDealer: boolean;
  onApprove: (playerId: string) => void;
  onKick: (playerId: string) => void;
  onStart: () => void;
  onUpdateBlinds: (sb: number, bb: number) => void;
  editSb: string;
  editBb: string;
  setEditSb: (v: string) => void;
  setEditBb: (v: string) => void;
}

const Wrap = styled.div`display: flex; flex-direction: column; gap: 14px;`;

const RoomCodeBox = styled.div`
  text-align: center;
  .label { font-size: 11px; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; }
  .code {
    font-size: 38px;
    font-weight: 800;
    font-family: 'DM Mono', monospace;
    color: var(--accent);
    letter-spacing: 9px;
    margin: 6px 0 6px;
  }
  .share { font-size: 12px; color: var(--text-muted); }
`;

const BlindsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 10px;
  .pill {
    font-size: 13px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 20px;
    background: var(--bg3);
    border: 1px solid var(--border);
  }
  .sb { color: #60a5fa; border-color: #60a5fa44; }
  .bb { color: #fbbf24; border-color: #fbbf2444; }
`;

const BlindEditRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-top: 12px;
  justify-content: center;
  label { font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px; }
  input { width: 70px; padding: 8px 10px; font-size: 14px; text-align: center; }
`;

const WaitingCard = styled.div`
  background: rgba(0,229,160,0.04);
  border: 1px solid rgba(0,229,160,0.18);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  .info { .name { font-size: 14px; font-weight: 600; } .req { font-size: 12px; color: var(--text-muted); margin-top: 2px; } }
  .btns { display: flex; gap: 6px; }
`;

const ApproveBtn = styled.button`
  background: rgba(46,164,79,0.2); border: 1px solid var(--green); color: var(--green);
  border-radius: 6px; width: 32px; height: 32px; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: rgba(46,164,79,0.4); }
`;
const DenyBtn = styled.button`
  background: rgba(207,34,46,0.12); border: 1px solid var(--red); color: var(--red);
  border-radius: 6px; width: 32px; height: 32px; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: rgba(207,34,46,0.3); }
`;

const WaitingMsg = styled.div`
  text-align: center; color: var(--text-muted); font-size: 14px; padding: 16px 0;
  .spin { display: inline-block; animation: spin 2s linear infinite; margin-right: 6px; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const NeedMoreMsg = styled.p`text-align: center; font-size: 12px; color: var(--text-muted); margin-top: 6px;`;

export function RoomLobby({
  room,
  mySocketId,
  isDealer,
  onApprove,
  onKick,
  onStart,
  onUpdateBlinds,
  editSb,
  editBb,
  setEditSb,
  setEditBb,
}: RoomLobbyProps) {
  const canStart = room.players.length >= 2;
  const isApproved = room.players.some(p => p.id === mySocketId);
  const isWaiting = room.waiting.some(p => p.id === mySocketId);

  return (
    <Wrap>
      {/* Room Code */}
      <Card>
        <RoomCodeBox>
          <div className="label">Room Code</div>
          <div className="code">{room.code}</div>
          <div className="share">Share this code with friends</div>
        </RoomCodeBox>
        <BlindsRow>
          <div className="pill sb">SB: ${room.smallBlind.toFixed(2)}</div>
          <div className="pill bb">BB: ${room.bigBlind.toFixed(2)}</div>
        </BlindsRow>

        {isDealer && (
          <BlindEditRow>
            <div>
              <label>Small Blind</label>
              <input type="number" value={editSb} onChange={e => setEditSb(e.target.value)} min={0.5} />
            </div>
            <div>
              <label>Big Blind</label>
              <input type="number" value={editBb} onChange={e => setEditBb(e.target.value)} min={1} />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onUpdateBlinds(Number(editSb), Number(editBb))}
            >
              Save
            </Button>
          </BlindEditRow>
        )}
      </Card>

      {/* Players */}
      <Card>
        <CardTitle>Players ({room.players.length}/10)</CardTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {room.players.map((p, i) => (
            <PlayerCard
              key={p.id}
              player={p}
              isMe={p.id === mySocketId}
              showKick={isDealer && !p.isDealer}
              onKick={() => onKick(p.id)}
            />
          ))}
        </div>

        {/* Waiting section — dealer sees approve/deny */}
        {isDealer && room.waiting.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <CardTitle>Waiting for Approval</CardTitle>
            {room.waiting.map(p => (
              <WaitingCard key={p.id}>
                <div className="info">
                  <div className="name">{p.name}</div>
                  <div className="req">Wants to join with ${p.chips.toFixed(2)}</div>
                </div>
                <div className="btns">
                  <ApproveBtn onClick={() => onApprove(p.id)}>✓</ApproveBtn>
                  <DenyBtn onClick={() => onKick(p.id)}>✕</DenyBtn>
                </div>
              </WaitingCard>
            ))}
          </div>
        )}

        {/* Player waiting for approval */}
        {!isDealer && isWaiting && (
          <WaitingMsg>
            <span className="spin">⏳</span> Waiting for host to approve you...
          </WaitingMsg>
        )}

        {/* Player approved, waiting for start */}
        {!isDealer && isApproved && (
          <WaitingMsg style={{ paddingTop: 8 }}>
            ✅ You're in! Waiting for host to start...
          </WaitingMsg>
        )}
      </Card>

      {/* Start Game Button */}
      {isDealer && (
        <div>
          <Button variant="primary" size="lg" fullWidth onClick={onStart} disabled={!canStart}>
            ▶ Start Game
          </Button>
          {!canStart && <NeedMoreMsg>Need at least 2 players to start</NeedMoreMsg>}
        </div>
      )}
    </Wrap>
  );
}

export default RoomLobby;