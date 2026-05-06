import styled, { css } from 'styled-components';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'gold';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<Variant, ReturnType<typeof css>> = {
  primary: css`
    background: var(--grad-brand);
    color: #150A04;
    border: none;
    box-shadow: var(--shadow-brand);
    &:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
    &:active:not(:disabled) { transform: translateY(0); }
  `,
  gold: css`
    background: var(--grad-gold);
    color: #1A1206;
    border: none;
    box-shadow: var(--shadow-gold);
    &:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
  `,
  secondary: css`
    background: var(--bg3);
    color: var(--text);
    border: 1px solid var(--border-strong);
    &:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); }
  `,
  danger: css`
    background: rgba(219,58,52,0.12);
    color: var(--crimson);
    border: 1px solid rgba(219,58,52,0.55);
    &:hover:not(:disabled) { background: rgba(219,58,52,0.25); }
  `,
  ghost: css`
    background: transparent;
    color: var(--text-muted);
    border: none;
    &:hover:not(:disabled) { color: var(--text); }
  `,
  success: css`
    background: rgba(18,183,164,0.14);
    color: var(--mint);
    border: 1px solid var(--mint);
    &:hover:not(:disabled) { background: rgba(18,183,164,0.28); }
  `,
};

const sizeStyles: Record<Size, ReturnType<typeof css>> = {
  sm: css`padding: 9px 14px; font-size: 13px; border-radius: var(--radius-sm);`,
  md: css`padding: 12px 18px; font-size: 15px; border-radius: var(--radius-sm);`,
  lg: css`padding: 16px 20px; font-size: 16px; border-radius: var(--radius);`,
};

const StyledBtn = styled.button<{
  $variant: Variant; $size: Size; $fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 700;
  font-family: 'Syne', sans-serif;
  cursor: pointer;
  transition: all 0.18s ease;
  width: ${p => p.$fullWidth ? '100%' : 'auto'};
  ${p => variantStyles[p.$variant]}
  ${p => sizeStyles[p.$size]}
  &:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; }
`;

const Spinner = styled.span`
  width: 14px; height: 14px;
  border: 2px solid currentColor; border-top-color: transparent;
  border-radius: 50%; animation: spin 0.7s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export function Button({
  variant = 'primary', size = 'md', fullWidth = false,
  loading = false, children, disabled, ...props
}: ButtonProps) {
  return (
    <StyledBtn $variant={variant} $size={size} $fullWidth={fullWidth}
      disabled={disabled || loading} {...props}>
      {loading && <Spinner />}
      {children}
    </StyledBtn>
  );
}

export default Button;