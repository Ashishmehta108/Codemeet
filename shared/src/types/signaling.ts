export type SignalType = 'offer' | 'answer' | 'ice-candidate';

export interface SignalMessage {
  type: SignalType;
  payload: any;
  senderId: string;
  targetId?: string;
}