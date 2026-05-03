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

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: 20px 16px 32px;
`;

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;

const KickedOverlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
  animation: ${fadeIn} 0.2s ease;
  .box {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 32px 24px;
    text-align: center; max-width: 300px;
    h3 { font-size: 22px; margin-bottom: 8px; }
    p { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; }
    button {
      background: var(--accent); color: #0d1117;
      padding: 12px 24px; border-radius: var(--radius-sm); font-weight: 700;
    }
  }
`;

const Loader = styled.div`
  display: flex; align-items: center; justify-content: center;
  height: 100dvh; color: var(--text-muted); font-size: 14px;
  flex-direction: column; gap: 10px;
  .spin { font-size: 28px; animation: spin 1.5s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export default function Lobby() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { myId, myName, isDealer, setMyId, setRoom } = useRoomStore();

  const [room, setLocalRoom] = useState<Room | null>(null);
  const [kicked, setKicked] = useState(false);
  const [editSb, setEditSb] = useState('1');
  const [editBb, setEditBb] = useState('2');

  useEffect(() => {
    if (!socket.connected) socket.connect();
    setMyId(socket.id ?? '');

    const offRoomState = onRoomState(socket, (r) => {
      setLocalRoom(r);
      setRoom(r);
      setEditSb(String(r.smallBlind));
      setEditBb(String(r.bigBlind));
      // jika game sudah mulai, pindah ke game
      if (r.phase !== 'waiting') navigate(`/game/${roomCode}`);
    });

    const offApproved = onApproved(socket, () => {/* nunggu room_state */});
    const offKicked = onKicked(socket, () => setKicked(true));

    const offReconnected = onReconnected(socket, ({ room: r }) => {
      setLocalRoom(r);
      setRoom(r);
      if (r.phase !== 'waiting') navigate(`/game/${roomCode}`);
    });

    // coba reconnect kalau ada nama tersimpan
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
        <h3>😅 Kicked!</h3>
        <p>You were removed from the room by the host.</p>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </KickedOverlay>
  );

  if (!room) return (
    <Loader>
      <span className="spin">⏳</span>
      Connecting to room...
    </Loader>
  );

  const amIDealer = isDealer || room.dealerId === socket.id;

  return (
    <Wrap>
      <RoomLobby
        room={room}
        mySocketId={socket.id ?? ''}
        isDealer={amIDealer}
        onApprove={(id) => roomCode && emitApprovePlayer(socket, roomCode, id)}
        onKick={(id) => roomCode && emitKickPlayer(socket, roomCode, id)}
        onStart={handleStart}
        onUpdateBlinds={(sb, bb) => roomCode && emitUpdateBlinds(socket, roomCode, sb, bb)}
        editSb={editSb}
        editBb={editBb}
        setEditSb={setEditSb}
        setEditBb={setEditBb}
      />
    </Wrap>
  );
}