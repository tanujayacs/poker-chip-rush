import styled, { css } from 'styled-components';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
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
    background: var(--accent);
    color: #0d1117;
    border: none;
    &:hover:not(:disabled) { background: #00ffb3; transform: translateY(-1px); }
    &:active:not(:disabled) { transform: translateY(0); }
  `,
  secondary: css`
    background: var(--bg3);
    color: var(--text);
    border: 1px solid var(--border);
    &:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
  `,
  danger: css`
    background: rgba(207,34,46,0.15);
    color: var(--red);
    border: 1px solid var(--red);
    &:hover:not(:disabled) { background: rgba(207,34,46,0.3); }
  `,
  ghost: css`
    background: transparent;
    color: var(--text-muted);
    border: none;
    &:hover:not(:disabled) { color: var(--text); }
  `,
  success: css`
    background: rgba(46,164,79,0.2);
    color: var(--green);
    border: 1px solid var(--green);
    &:hover:not(:disabled) { background: rgba(46,164,79,0.35); }
  `,
};

const sizeStyles: Record<Size, ReturnType<typeof css>> = {
  sm: css`padding: 8px 14px; font-size: 13px; border-radius: var(--radius-sm);`,
  md: css`padding: 12px 18px; font-size: 15px; border-radius: var(--radius-sm);`,
  lg: css`padding: 15px 20px; font-size: 16px; border-radius: var(--radius);`,
};

const StyledBtn = styled.button<{
  $variant: Variant;
  $size: Size;
  $fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 700;
  font-family: 'Syne', sans-serif;
  cursor: pointer;
  transition: all 0.15s ease;
  width: ${p => p.$fullWidth ? '100%' : 'auto'};

  ${p => variantStyles[p.$variant]}
  ${p => sizeStyles[p.$size]}

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const Spinner = styled.span`
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <StyledBtn
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </StyledBtn>
  );
}

export default Button;