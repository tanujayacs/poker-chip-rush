import styled from 'styled-components';
import { Player } from '../../features/room/room.types';

interface PlayerCardProps {
  player: Player;
  isActive?: boolean;
  isMe?: boolean;
  sbIndex?: number;
  bbIndex?: number;
  playerIndex?: number;
  onKick?: () => void;
  showKick?: boolean;
}

const Row = styled.div<{ $active?: boolean; $folded?: boolean; $myTurn?: boolean }>`
  position: relative;
  background: ${p => p.$myTurn
    ? 'linear-gradient(135deg, rgba(255,87,51,0.10), rgba(212,175,55,0.06))'
    : 'var(--bg3)'};
  border: 1.5px solid ${p => p.$active ? 'var(--gold)' : p.$folded ? 'transparent' : 'var(--border)'};
  border-radius: var(--radius);
  padding: 12px 14px;
  opacity: ${p => p.$folded ? 0.42 : 1};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  ${p => p.$active && `box-shadow: 0 0 0 1px rgba(212,175,55,0.25), 0 6px 18px -8px rgba(212,175,55,0.55);`}
`;

const Left = styled.div`display: flex; align-items: center; gap: 12px;`;

const Avatar = styled.div<{ $active?: boolean }>`
  width: 40px; height: 40px;
  background: var(--bg2);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 19px;
  border: 2px solid ${p => p.$active ? 'var(--gold)' : 'var(--border-strong)'};
  flex-shrink: 0;
`;

const Info = styled.div`display: flex; flex-direction: column; gap: 4px;`;

const NameRow = styled.div`
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
`;

const Name = styled.span`
  font-size: 14px; font-weight: 700; color: var(--text);
`;

const Badge = styled.span<{ $color?: string; $bg?: string }>`
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.6px;
  color: ${p => p.$color ?? 'var(--text-muted)'};
  background: ${p => p.$bg ?? 'var(--bg2)'};
  padding: 2px 7px;
  border-radius: 8px;
  text-transform: uppercase;
`;

const TurnBadge = styled(Badge)`
  background: var(--grad-brand);
  color: #150A04;
`;

const Meta = styled.div`
  font-size: 11px;
  color: var(--text-muted);
  display: flex; gap: 8px; align-items: center;
`;

const Right = styled.div`text-align: right; flex-shrink: 0;`;

const Stack = styled.div`
  font-size: 16px;
  font-weight: 700;
  font-family: 'DM Mono', monospace;
  color: var(--text);
`;

const BetAmt = styled.div`
  font-size: 11px;
  color: var(--gold);
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
  &:hover { background: rgba(219,58,52,0.2); color: var(--crimson); }
`;

export function PlayerCard({
  player, isActive = false, isMe = false,
  sbIndex, bbIndex, playerIndex, onKick, showKick = false,
}: PlayerCardProps) {
  const isSB = playerIndex !== undefined && playerIndex === sbIndex;
  const isBB = playerIndex !== undefined && playerIndex === bbIndex;
  const avatar = player.isDealer ? '👑' : player.folded ? '🃏' : player.allIn ? '🔥' : '🂠';

  return (
    <Row $active={isActive} $folded={player.folded} $myTurn={isMe && isActive}>
      <Left>
        <Avatar $active={isActive}>{avatar}</Avatar>
        <Info>
          <NameRow>
            <Name>{player.name}</Name>
            {isMe && <Badge $color="#150A04" $bg="var(--gold-glow)">YOU</Badge>}
            {player.isDealer && <Badge $color="#150A04" $bg="var(--sun)">HOST</Badge>}
            {isActive && !player.folded && <TurnBadge>TURN</TurnBadge>}
          </NameRow>
          <Meta>
            {isSB && <span style={{ color: 'var(--sun)' }}>● SB</span>}
            {isBB && <span style={{ color: 'var(--gold)' }}>● BB</span>}
            {player.folded && <span style={{ color: 'var(--crimson)' }}>FOLDED</span>}
            {player.allIn && !player.folded && <span style={{ color: 'var(--brand)' }}>ALL IN</span>}
          </Meta>
        </Info>
      </Left>

      <Right>
        <Stack>${player.chips.toFixed(2)}</Stack>
        {player.currentBet > 0 && <BetAmt>bet ${player.currentBet.toFixed(2)}</BetAmt>}
      </Right>

      {showKick && !player.isDealer && (
        <KickBtn onClick={onKick}>✕</KickBtn>
      )}
    </Row>
  );
}

export default PlayerCard;