import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { socket } from '../lib/socket';
import { useRoomStore } from '../store/useRoomStore';
import { Room } from '../features/room/room.types';
import { RoomLobby } from '../features/room/RoomLobby';
import {
  onRoomState, onApproved, onKicked, onReconnected,
  emitApprovePlayer, emitKickPlayer, emitStartGame,
  emitUpdateBlinds, emitReconnect,
} from '../features/room/room.socket';

const Wrap = styled.div`display: flex; flex-direction: column; min-height: 100dvh; padding: 18px 16px 32px;`;

const TopBar = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
  img { height: 32px; }
  .hint { font-size: 10px; color: var(--gold); letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; }
`;

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;

const KickedOverlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.88);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
  animation: ${fadeIn} 0.2s ease;
  .box {
    background: var(--bg3); border: 1px solid var(--border-strong);
    border-radius: var(--radius); padding: 32px 24px;
    text-align: center; max-width: 320px;
    h3 { font-size: 22px; margin-bottom: 8px; color: var(--crimson); }
    p { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; }
    button {
      background: var(--grad-brand); color: #150A04;
      padding: 12px 28px; border-radius: var(--radius-sm); font-weight: 800;
    }
  }
`;

const Loader = styled.div`
  display: flex; align-items: center; justify-content: center;
  height: 100dvh; color: var(--text-muted); font-size: 14px;
  flex-direction: column; gap: 12px;
  .spin { font-size: 30px; animation: spin 1.5s linear infinite; color: var(--gold); }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export default function Lobby() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { myName, isDealer, setMyId, setRoom } = useRoomStore();

  const [room, setLocalRoom] = useState<Room | null>(null);
  const [kicked, setKicked] = useState(false);
  const [editSb, setEditSb] = useState('1');
  const [editBb, setEditBb] = useState('2');

  useEffect(() => {
    if (!socket.connected) socket.connect();
    setMyId(socket.id ?? '');

    const offRoomState = onRoomState(socket, (r) => {
      setLocalRoom(r); setRoom(r);
      setEditSb(String(r.smallBlind)); setEditBb(String(r.bigBlind));
      if (r.phase !== 'waiting') navigate(`/game/${roomCode}`);
    });
    const offApproved = onApproved(socket, () => {});
    const offKicked = onKicked(socket, () => setKicked(true));
    const offReconnected = onReconnected(socket, ({ room: r }) => {
      setLocalRoom(r); setRoom(r);
      if (r.phase !== 'waiting') navigate(`/game/${roomCode}`);
    });

    const savedName = myName ?? localStorage.getItem('pcr_name');
    if (savedName && roomCode) emitReconnect(socket, roomCode, savedName);

    return () => { offRoomState(); offApproved(); offKicked(); offReconnected(); };
  }, [roomCode]);

  const handleStart = () => {
    if (!roomCode) return;
    emitStartGame(socket, roomCode);
    navigate(`/game/${roomCode}`);
  };

  if (kicked) return (
    <KickedOverlay>
      <div className="box">
        <h3>Kicked</h3>
        <p>You were removed from the room by the host.</p>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </KickedOverlay>
  );

  if (!room) return (
    <Loader>
      <div className="spin">⚙</div>
      Be patience, the host is preparing the room...
    </Loader>
  );

  return (
    <Wrap>
      <TopBar>
        <img src="/logo.png" alt="PCR" />
        <div className="hint">Lobby</div>
      </TopBar>

      <RoomLobby
        room={room}
        mySocketId={socket.id ?? ''}
        isDealer={isDealer || room.dealerId === socket.id}
        onApprove={(pid) => roomCode && emitApprovePlayer(socket, roomCode, pid)}
        onKick={(pid) => roomCode && emitKickPlayer(socket, roomCode, pid)}
        onStart={handleStart}
        onUpdateBlinds={(sb, bb) => roomCode && emitUpdateBlinds(socket, roomCode, sb, bb)}
        editSb={editSb} editBb={editBb}
        setEditSb={setEditSb} setEditBb={setEditBb}
      />
    </Wrap>
  );
}