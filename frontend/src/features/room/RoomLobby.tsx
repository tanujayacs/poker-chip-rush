import styled from 'styled-components';
import { Room } from './room.types';
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
  .label { font-size: 10px; color: var(--text-muted); letter-spacing: 2px; text-transform: uppercase; }
  .code {
    font-size: 42px;
    font-weight: 800;
    font-family: 'DM Mono', monospace;
    background: var(--grad-gold);
    -webkit-background-clip: text; background-clip: text; color: transparent;
    letter-spacing: 10px;
    margin: 8px 0 6px;
    text-shadow: 0 0 30px rgba(212,175,55,0.25);
  }
  .share { font-size: 12px; color: var(--text-muted); }
`;

const BlindsRow = styled.div`
  display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 14px;
  .pill {
    font-size: 12px; font-weight: 700; padding: 5px 14px; border-radius: 999px;
    background: var(--bg2); border: 1px solid var(--border-strong);
    font-family: 'DM Mono', monospace;
  }
  .sb { color: var(--sun); border-color: rgba(255,215,0,0.35); }
  .bb { color: var(--gold); border-color: rgba(212,175,55,0.4); }
`;

const BlindEditRow = styled.div`
  display: flex; align-items: flex-end; gap: 8px;
  margin-top: 14px; justify-content: center;
  label { font-size: 10px; color: var(--text-muted); display: block; margin-bottom: 4px; letter-spacing: 0.6px; }
  input { width: 78px; padding: 9px 10px; font-size: 14px; text-align: center; }
`;

const WaitingCard = styled.div`
  background: rgba(255,87,51,0.05);
  border: 1px solid rgba(255,87,51,0.25);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px;
  .info { .name { font-size: 14px; font-weight: 600; } .req { font-size: 12px; color: var(--text-muted); margin-top: 2px; font-family: 'DM Mono', monospace; } }
  .btns { display: flex; gap: 6px; }
`;

const ApproveBtn = styled.button`
  background: rgba(18,183,164,0.18); border: 1px solid var(--mint); color: var(--mint);
  border-radius: 8px; width: 34px; height: 34px; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: rgba(18,183,164,0.36); }
`;
const DenyBtn = styled.button`
  background: rgba(219,58,52,0.12); border: 1px solid var(--crimson); color: var(--crimson);
  border-radius: 8px; width: 34px; height: 34px; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: rgba(219,58,52,0.3); }
`;

const WaitingMsg = styled.div`
  text-align: center; color: var(--text-muted); font-size: 14px; padding: 18px 0;
  .spin { display: inline-block; animation: spin 2s linear infinite; margin-right: 6px; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const NeedMoreMsg = styled.p`text-align: center; font-size: 12px; color: var(--text-muted); margin-top: 8px;`;

export function RoomLobby({
  room, mySocketId, isDealer,
  onApprove, onKick, onStart, onUpdateBlinds,
  editSb, editBb, setEditSb, setEditBb,
}: RoomLobbyProps) {
  const canStart = room.players.length >= 2;
  const isApproved = room.players.some(p => p.id === mySocketId);
  const isWaiting = room.waiting.some(p => p.id === mySocketId);

  return (
    <Wrap>
      <Card accent>
        <RoomCodeBox>
          <div className="label">Room Code</div>
          <div className="code">{room.code}</div>
          <div className="share">Share this code with friends</div>
        </RoomCodeBox>
        <BlindsRow>
          <div className="pill sb">SB ${room.smallBlind.toFixed(2)}</div>
          <div className="pill bb">BB ${room.bigBlind.toFixed(2)}</div>
        </BlindsRow>

        {isDealer && (
          <BlindEditRow>
            <div>
              <label>SMALL BLIND</label>
              <input type="number" value={editSb} onChange={e => setEditSb(e.target.value)} min={0.5} />
            </div>
            <div>
              <label>BIG BLIND</label>
              <input type="number" value={editBb} onChange={e => setEditBb(e.target.value)} min={1} />
            </div>
            <Button variant="secondary" size="sm"
              onClick={() => onUpdateBlinds(Number(editSb), Number(editBb))}>
              Save
            </Button>
          </BlindEditRow>
        )}
      </Card>

      <Card>
        <CardTitle>Players ({room.players.length}/10)</CardTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {room.players.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              isMe={p.id === mySocketId}
              showKick={isDealer && !p.isDealer}
              onKick={() => onKick(p.id)}
            />
          ))}
        </div>

        {isDealer && room.waiting.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <CardTitle>Waiting for Approval</CardTitle>
            {room.waiting.map(p => (
              <WaitingCard key={p.id}>
                <div className="info">
                  <div className="name">{p.name}</div>
                  <div className="req">wants ${p.chips.toFixed(2)}</div>
                </div>
                <div className="btns">
                  <ApproveBtn onClick={() => onApprove(p.id)}>✓</ApproveBtn>
                  <DenyBtn onClick={() => onKick(p.id)}>✕</DenyBtn>
                </div>
              </WaitingCard>
            ))}
          </div>
        )}

        {!isDealer && isWaiting && (
          <WaitingMsg>
            <span className="spin">⏳</span> Waiting for host to approve you...
          </WaitingMsg>
        )}

        {!isDealer && isApproved && (
          <WaitingMsg style={{ paddingTop: 8 }}>
            ✅ You're in! Waiting for host to start...
          </WaitingMsg>
        )}
      </Card>

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