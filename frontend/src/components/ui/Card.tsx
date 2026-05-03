import styled from 'styled-components';

interface CardProps {
  children: React.ReactNode;
  padding?: string;
  accent?: boolean; // green border highlight
  className?: string;
}

export const CardBase = styled.div<{ $padding?: string; $accent?: boolean }>`
  background: var(--bg2);
  border: 1px solid ${p => p.$accent ? 'var(--accent)' : 'var(--border)'};
  border-radius: var(--radius);
  padding: ${p => p.$padding ?? '18px 16px'};
  ${p => p.$accent && 'box-shadow: 0 0 0 1px rgba(0,229,160,0.1);'}
`;

export function Card({ children, padding, accent = false, className }: CardProps) {
  return (
    <CardBase $padding={padding} $accent={accent} className={className}>
      {children}
    </CardBase>
  );
}

export const CardTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 12px;
`;

export const CardDivider = styled.hr`
  border: none;
  border-top: 1px solid var(--border);
  margin: 14px 0;
`;

export default Card;