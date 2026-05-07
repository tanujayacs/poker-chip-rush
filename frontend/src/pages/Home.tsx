import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% { opacity: 0.45; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.08); }
`;
const float = keyframes`
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: 0 0 32px;
  position: relative;
  overflow: hidden;
`;

const BgGlow = styled.div`
  position: absolute;
  width: 480px; height: 480px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,87,51,0.22) 0%, rgba(212,175,55,0.10) 40%, transparent 70%);
  top: 5%; left: 50%; transform: translateX(-50%);
  pointer-events: none; filter: blur(8px);
  animation: ${pulse} 5s ease-in-out infinite;
`;

/* ── Top bar with info button ── */
const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px 0;
  position: relative;
  z-index: 10;
`;

const InfoBtn = styled.button`
  background: rgba(212,175,55,0.08);
  border: 1px solid rgba(212,175,55,0.3);
  color: var(--gold);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 8px 14px;
  border-radius: 999px;
  display: flex; align-items: center; gap: 6px;
  &:hover { background: rgba(212,175,55,0.18); border-color: var(--gold); }
`;

/* ── Info Panel overlay ── */
const InfoOverlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(5,5,20,0.85);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 20px;
  animation: ${fadeIn} 0.2s ease;
`;

const InfoPanel = styled.div`
  background: var(--bg3);
  border: 1px solid var(--border-strong);
  border-top: 2px solid var(--gold);
  border-radius: var(--radius);
  padding: 28px 24px;
  width: 100%; max-width: 460px;
  max-height: 85vh;
  overflow-y: auto;
`;

const InfoClose = styled.button`
  position: absolute; top: 16px; right: 16px;
  background: var(--bg2); border: 1px solid var(--border-strong);
  color: var(--text-muted); border-radius: 50%;
  width: 32px; height: 32px; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  &:hover { color: var(--text); border-color: var(--gold); }
`;

const InfoHeader = styled.div`
  position: relative;
  margin-bottom: 20px;
  h2 {
    font-size: 20px; font-weight: 800;
    background: var(--grad-gold);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  p { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
`;

const TabRow = styled.div`
  display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap;
`;

const Tab = styled.button<{ $active?: boolean }>`
  padding: 7px 16px;
  border-radius: 999px;
  font-size: 12px; font-weight: 700; letter-spacing: 0.4px;
  background: ${p => p.$active ? 'rgba(212,175,55,0.18)' : 'var(--bg2)'};
  border: 1px solid ${p => p.$active ? 'var(--gold)' : 'var(--border-strong)'};
  color: ${p => p.$active ? 'var(--gold)' : 'var(--text-muted)'};
  &:hover { border-color: var(--gold); color: var(--gold); }
`;

const Section = styled.div`
  animation: ${fadeIn} 0.2s ease;
`;

const SectionTitle = styled.div`
  font-size: 10px; font-weight: 800; color: var(--gold);
  letter-spacing: 1.4px; text-transform: uppercase;
  margin: 16px 0 8px;
`;

const SectionText = styled.p`
  font-size: 13px; color: var(--text-muted); line-height: 1.7;
  margin-bottom: 10px;
`;

const Step = styled.div`
  display: flex; gap: 12px; align-items: flex-start;
  margin-bottom: 12px;
  .num {
    width: 24px; height: 24px; border-radius: 50%;
    background: rgba(212,175,55,0.14); border: 1px solid rgba(212,175,55,0.4);
    color: var(--gold); font-size: 11px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 1px;
  }
  p { font-size: 13px; color: var(--text-muted); line-height: 1.6; }
`;

const FaqItem = styled.div`
  margin-bottom: 14px;
  .q { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .a { font-size: 12px; color: var(--text-muted); line-height: 1.6; }
`;

const ContactBox = styled.a`
  display: flex; align-items: center; gap: 14px;
  background: var(--bg2); border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm); padding: 14px 16px;
  margin-bottom: 10px; text-decoration: none;
  transition: border-color 0.18s;
  .icon { font-size: 22px; }
  .info .label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; }
  .info .val { font-size: 13px; font-weight: 700; color: var(--text); margin-top: 2px; }
  &:hover { border-color: var(--gold); }
`;

/* ── Hero ── */
const Hero = styled.div`
  text-align: center;
  margin: 32px 24px 24px;
  position: relative; z-index: 1;
`;

const LogoWrap = styled.div`
  animation: ${float} 6s ease-in-out infinite;
  margin-bottom: 16px;
  img {
    width: 120px; height: auto;
    filter: drop-shadow(0 8px 32px rgba(255,87,51,0.4))
            drop-shadow(0 2px 12px rgba(212,175,55,0.3));
  }
`;

const AppTitle = styled.h1`
  font-family: 'Unbounded', sans-serif;
  font-size: 26px; font-weight: 800;
  background: linear-gradient(180deg, #fff 30%, #d4af37 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  letter-spacing: 0px; margin-bottom: 10px;
`;

const Slogan = styled.p`
  font-size: 12px; color: var(--text-muted);
  letter-spacing: 2.5px; text-transform: uppercase; font-weight: 500;
`;

/* ── Buttons ── */
const BtnArea = styled.div`
  padding: 0 24px;
  position: relative; z-index: 1;
`;

const BtnPrimary = styled.button`
  width: 100%;
  padding: 17px;
  background: var(--grad-brand);
  color: #150A04;
  font-size: 16px;
  font-weight: 800;
  border-radius: var(--radius);
  margin-bottom: 12px;
  letter-spacing: 0.5px;
  box-shadow: var(--shadow-brand);
  display: flex; align-items: center; justify-content: center; gap: 10px;
  &:hover { transform: translateY(-2px); filter: brightness(1.06); }
  &:active { transform: translateY(0); }
`;

/* Play icon as pure SVG-in-CSS — no emoji ── */
const PlayIcon = styled.span`
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px;
  svg { width: 18px; height: 18px; fill: #150A04; }
`;

const BtnSecondary = styled.button`
  width: 100%;
  padding: 17px;
  background: rgba(212,175,55,0.04);
  color: var(--text);
  font-size: 16px;
  font-weight: 700;
  border-radius: var(--radius);
  border: 1px solid var(--border-strong);
  display: flex; align-items: center; justify-content: space-between;
  &:hover { border-color: var(--gold); color: var(--gold); }
`;

/* ── Card suits decorative ── */
const Suits = styled.div`
  margin: 32px auto 0;
  text-align: center;
  font-size: 26px;
  opacity: 0.18;
  letter-spacing: 14px;
  color: var(--gold);
  position: relative; z-index: 1;
`;

const SloganClosing = styled.p`
  text-align: center;
  font-size: 10px; color: var(--text-dim);
  letter-spacing: 2px; text-transform: uppercase;
  margin-top: 16px;
  position: relative; z-index: 1;
`;

type InfoTab = 'howto' | 'faq' | 'contact';

export default function Home() {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const [infoTab, setInfoTab] = useState<InfoTab>('howto');

  return (
    <Wrap>
      <BgGlow />

      {/* ── Top-right info button ── */}
      <TopBar>
        <InfoBtn onClick={() => setShowInfo(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          Info
        </InfoBtn>
      </TopBar>

      {/* ── Logo ── */}
      <Hero>
        <LogoWrap>
          <img src="/logo.png" alt="PokerChipRush" />
        </LogoWrap>

        {/* ── Title ── */}
        <AppTitle>Poker Chip Rush</AppTitle>

        {/* ── Slogan ── */}
        <Slogan>Play with friends. No chips needed.</Slogan>
      </Hero>

      {/* ── Buttons ── */}
      <BtnArea>
        <BtnPrimary onClick={() => navigate('/create')}>
          <PlayIcon>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </PlayIcon>
          Start a Game
        </BtnPrimary>

        <BtnSecondary onClick={() => navigate('/join')}>
          <span>Join with Code</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </BtnSecondary>
      </BtnArea>

      {/* ── Card suits + closing slogan ── */}
      <Suits>♠ ♥ ♦ ♣</Suits>
      <SloganClosing>POKERCHIPRUSH · HYBRID POKER TRACKER</SloganClosing>

      {/* ── Info Panel ── */}
      {showInfo && (
        <InfoOverlay onClick={() => setShowInfo(false)}>
          <InfoPanel onClick={e => e.stopPropagation()}>
            <InfoHeader>
              <h2>PokerChipRush Info</h2>
              <p>Everything you need to know</p>
              <InfoClose onClick={() => setShowInfo(false)}>✕</InfoClose>
            </InfoHeader>

            <TabRow>
              <Tab $active={infoTab === 'howto'} onClick={() => setInfoTab('howto')}>How to Play</Tab>
              <Tab $active={infoTab === 'faq'} onClick={() => setInfoTab('faq')}>FAQ</Tab>
              <Tab $active={infoTab === 'contact'} onClick={() => setInfoTab('contact')}>Contact</Tab>
            </TabRow>

            {infoTab === 'howto' && (
              <Section>
                <SectionTitle>Setup</SectionTitle>
                <Step><div className="num">1</div><p>One player taps <strong>Start a Game</strong> and chooses to be a Dealer or Player-Dealer.</p></Step>
                <Step><div className="num">2</div><p>Share the 5-character Room Code with friends. They tap <strong>Join with Code</strong> and enter the code.</p></Step>
                <Step><div className="num">3</div><p>The Dealer approves each player in the lobby, sets blinds, then taps <strong>Start Game</strong>.</p></Step>

                <SectionTitle>Gameplay</SectionTitle>
                <Step><div className="num">4</div><p>Players take turns — Fold, Check/Call, Raise, or go All-In. The active player is highlighted.</p></Step>
                <Step><div className="num">5</div><p>Once all bets match, the Dealer's <strong>Advance to Flop/Turn/River</strong> button appears. Press it to deal the next street.</p></Step>
                <Step><div className="num">6</div><p>At Showdown, the Dealer declares the winner(s). Pot is split automatically.</p></Step>
                <Step><div className="num">7</div><p>Start a New Hand or use Rebuys between hands. Press <strong>End Game</strong> to finish and see final standings.</p></Step>
              </Section>
            )}

            {infoTab === 'faq' && (
              <Section>
                <FaqItem>
                  <div className="q">Do I need real poker chips?</div>
                  <div className="a">No! PokerChipRush is a digital chip tracker. Cards are dealt physically at the table — the app just handles chips.</div>
                </FaqItem>
                <FaqItem>
                  <div className="q">How many players can join?</div>
                  <div className="a">Up to 10 players per room.</div>
                </FaqItem>
                <FaqItem>
                  <div className="q">Can I rejoin if I lose connection?</div>
                  <div className="a">Yes — reopen the app and your session should restore automatically if you haven't refreshed.</div>
                </FaqItem>
                <FaqItem>
                  <div className="q">Who controls the game flow?</div>
                  <div className="a">The Dealer (room host) controls advancing phases, declaring winners, rebuys, and ending the game.</div>
                </FaqItem>
                <FaqItem>
                  <div className="q">What happens to players with 0 chips?</div>
                  <div className="a">They're removed at the start of a new hand. The Dealer can issue a rebuy before that.</div>
                </FaqItem>
              </Section>
            )}

            {infoTab === 'contact' && (
              <Section>
                <SectionText>Found a bug? Want to say thanks? Reach out!</SectionText>
                <ContactBox href="mailto:pokerchiprush@gmail.com">
                  <span className="icon">✉️</span>
                  <div className="info">
                    <div className="label">Email</div>
                    <div className="val">pokerchiprush@gmail.com</div>
                  </div>
                </ContactBox>
                <ContactBox href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <span className="icon">🐙</span>
                  <div className="info">
                    <div className="label">GitHub</div>
                    <div className="val">Report a bug / open issue</div>
                  </div>
                </ContactBox>
                <SectionText style={{ marginTop: 12 }}>
                  We read every message. Bug reports help us improve — please include what you did, what happened, and what you expected.
                </SectionText>
              </Section>
            )}
          </InfoPanel>
        </InfoOverlay>
      )}
    </Wrap>
  );
}