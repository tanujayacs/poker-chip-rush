import styled from 'styled-components';

interface CardProps {
  children: React.ReactNode;
  padding?: string;
  accent?: boolean;
  className?: string;
}

export const CardBase = styled.div<{ $padding?: string; $accent?: boolean }>`
  background:
    linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0)) ,
    var(--bg3);
  border: 1px solid ${p => p.$accent ? 'var(--gold)' : 'var(--border)'};
  border-radius: var(--radius);
  padding: ${p => p.$padding ?? '20px 18px'};
  ${p => p.$accent && 'box-shadow: 0 0 0 1px rgba(212,175,55,0.15), var(--shadow-gold);'}
  backdrop-filter: blur(6px);
`;

export function Card({ children, padding, accent = false, className }: CardProps) {
  return (
    <CardBase $padding={padding} $accent={accent} className={className}>
      {children}
    </CardBase>
  );
}

export const CardTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 12px;
`;

export const CardDivider = styled.hr`
  border: none;
  border-top: 1px solid var(--border);
  margin: 14px 0;
`;

export default Card;