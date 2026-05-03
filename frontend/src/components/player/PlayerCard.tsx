import styled from 'styled-components';
import { Player } from '../../features/room/room.types';

interface PlayerCardProps {
  player: Player;
  isActive?: boolean;      // giliran dia
  isMe?: boolean;          // user sendiri
  sbIndex?: number;        // index small blind
  bbIndex?: number;        // index big blind
  playerIndex?: number;    // index di array players
  onKick?: () => void;     // dealer bisa kick
  showKick?: boolean;
}

const Row = styled.div<{ $active?: boolean; $folded?: boolean; $myTurn?: boolean }>`
  background: ${p => p.$myTurn ? 'rgba(0,229,160,0.07)' : 'var(--bg2)'};
  border: 1.5px solid ${p => p.$active ? 'var(--accent)' : p.$folded ? 'transparent' : 'var(--border)'};
  border-radius: var(--radius);
  padding: 12px 14px;
  opacity: ${p => p.$folded ? 0.38 : 1};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.div`
  width: 38px; height: 38px;
  background: var(--bg3);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  border: 2px solid var(--border);
  flex-shrink: 0;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
`;

const Name = styled.span`
  font-size: 14px;
  font-weight: 700;
`;

const Badge = styled.span<{ $color?: string }>`
  font-size: 10px;
  font-weight: 700;
  color: ${p => p.$color ?? 'var(--text-muted)'};
  background: ${p => p.$color ? `${p.$color}22` : 'var(--bg3)'};
  padding: 1px 6px;
  border-radius: 8px;
`;

const TurnBadge = styled(Badge)`
  background: var(--accent);
  color: #0d1117;
`;

const Meta = styled.div`
  font-size: 11px;
  color: var(--text-muted);
  display: flex;
  gap: 6px;
  align-items: center;
`;

const Right = styled.div`
  text-align: right;
  flex-shrink: 0;
`;

const Stack = styled.div`
  font-size: 15px;
  font-weight: 700;
  font-family: 'DM Mono', monospace;
`;

const BetAmt = styled.div`
  font-size: 11px;
  color: var(--yellow);
  font-family: 'DM Mono', monospace;
  margin-top: 2px;
`;

const KickBtn = styled.button`
  background: none;
  color: var(--text-muted);
  font-size: 16px;
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  &:hover { background: rgba(207,34,46,0.2); color: var(--red); }
`;

export function PlayerCard({
  player,
  isActive = false,
  isMe = false,
  sbIndex,
  bbIndex,
  playerIndex,
  onKick,
  showKick = false,
}: PlayerCardProps) {
  const isSB = playerIndex !== undefined && playerIndex === sbIndex;
  const isBB = playerIndex !== undefined && playerIndex === bbIndex;

  const avatar = player.isDealer ? '👑' : player.folded ? '🃏' : player.allIn ? '🔥' : '😊';

  return (
    <Row $active={isActive} $folded={player.folded} $myTurn={isMe && isActive}>
      <Left>
        <Avatar>{avatar}</Avatar>
        <Info>
          <NameRow>
            <Name>{player.name}</Name>
            {isMe && <Badge $color="var(--accent)">YOU</Badge>}
            {player.isDealer && <Badge $color="var(--yellow)">HOST</Badge>}
            {isActive && !player.folded && <TurnBadge>TURN</TurnBadge>}
          </NameRow>
          <Meta>
            {isSB && <span style={{ color: '#60a5fa' }}>🔵 SB</span>}
            {isBB && <span style={{ color: '#fbbf24' }}>🟡 BB</span>}
            {player.folded && <span style={{ color: 'var(--red)' }}>FOLDED</span>}
            {player.allIn && !player.folded && <span style={{ color: 'var(--yellow)' }}>ALL IN</span>}
          </Meta>
        </Info>
      </Left>

      <Right>
        <Stack>${player.chips.toFixed(2)}</Stack>
        {player.currentBet > 0 && (
          <BetAmt>bet ${player.currentBet.toFixed(2)}</BetAmt>
        )}
      </Right>

      {showKick && !player.isDealer && (
        <KickBtn onClick={onKick}>✕</KickBtn>
      )}
    </Row>
  );
}

export default PlayerCard;