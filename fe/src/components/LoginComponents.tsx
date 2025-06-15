"use client";
import styled from 'styled-components';

interface StyledProps {
  $signIn: boolean;
}

export const Container = styled.div`
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  width: 768px;
  max-width: 95vw;
  min-height: 520px;
`;

export const SignUpContainer = styled.div<{ $signIn: boolean }>`
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
  ${(props: StyledProps) => props.$signIn !== true ? `
    transform: translateX(100%);
    opacity: 1;
    z-index: 5;
  ` : null}
`;

export const SignInContainer = styled.div<{ $signIn: boolean }>`
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  left: 0;
  width: 50%;
  z-index: 2;
  ${(props: StyledProps) => (props.$signIn !== true ? `transform: translateX(100%);` : null)}
`;

export const Form = styled.form`
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 50px;
  height: 100%;
  text-align: center;
`;

export const Title = styled.h1`
  font-weight: bold;
  margin: 0;
  margin-bottom: 20px;
`;

export const Input = styled.input`
  background-color: rgba(248, 250, 252, 0.8);
  border: 2px solid rgba(226, 232, 240, 0.5);
  border-radius: 12px;
  padding: 14px 16px;
  margin: 6px 0;
  width: 100%;
  font-size: 14px;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Button = styled.button`
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  padding: 14px 32px;
  letter-spacing: 0.5px;
  text-transform: none;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-top: 16px;
  box-shadow: 0 4px 15px rgba(147, 197, 253, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(147, 197, 253, 0.4);
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 15px rgba(147, 197, 253, 0.3);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const PurpleButton = styled(Button)`
  background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%);
  box-shadow: 0 4px 15px rgba(167, 139, 250, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(167, 139, 250, 0.4);
    background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 15px rgba(167, 139, 250, 0.3);
  }

  &:focus {
    box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.2);
  }
`;

export const GhostButton = styled(Button)`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: none;

  &:hover {
    background: transparent;
    border-color: rgba(255, 255, 255, 0.8);
    box-shadow: none;
    transform: none;
  }

  &:active {
    background: transparent;
    transform: scale(0.98);
  }

  &:focus {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
`;

export const Paragraph = styled.p`
  font-size: 14px;
  font-weight: 200;
  line-height: 20px;
  letter-spacing: 0.5px;
  margin: 20px 0 30px;
`;

export const Anchor = styled.a`
  color: #333;
  font-size: 14px;
  text-decoration: none;
  margin: 15px 0;
`;

export const OverlayContainer = styled.div<{ $signIn: boolean }>`
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
  ${(props: StyledProps) =>
    props.$signIn !== true ? `transform: translateX(-100%);` : null}
`;

export const Overlay = styled.div<{ $signIn: boolean }>`
  background: linear-gradient(135deg, #a78bfa 0%, #3b82f6 100%);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0 0;
  color: #ffffff;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
  ${(props: StyledProps) => (props.$signIn !== true ? `transform: translateX(50%);` : null)}
`;

export const OverlayPanel = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
`;

export const LeftOverlayPanel = styled(OverlayPanel)<{ $signIn: boolean }>`
  transform: translateX(-20%);
  ${(props: StyledProps) => props.$signIn !== true ? `transform: translateX(0);` : null}
`;

export const RightOverlayPanel = styled(OverlayPanel)<{ $signIn: boolean }>`
  right: 0;
  transform: translateX(0);
  ${(props: StyledProps) => props.$signIn !== true ? `transform: translateX(20%);` : null}
`;

export const GoogleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 2px solid rgba(226, 232, 240, 0.5);
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  padding: 14px 20px;
  letter-spacing: 0.5px;
  text-transform: none;
  transition: all 0.3s ease;
  cursor: pointer;
  margin: 12px 0;
  width: 100%;
  gap: 12px;

  &:hover {
    background-color: rgba(249, 250, 251, 0.95);
    border-color: #d1d5db;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const OrDivider = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin: 20px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #ddd;
  }
  
  &::before {
    margin-right: 16px;
  }
  
  &::after {
    margin-left: 16px;
  }
  
  span {
    color: #666;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;
