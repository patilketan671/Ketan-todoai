export interface Todo {
  text: string;
  done: boolean;
  id: string;
}

export interface Connection {
  from: string;
  to: string;
  color: 'green' | 'yellow';
  step: number;
}

export interface FlowStep {
  id: string;
  label: string;
  subLabel?: string;
  icon?: string;
  color: 'green' | 'yellow';
  x: number;
  y: number;
  step: number;
  shape?: 'circle' | 'square';
}

export interface FlowNode extends Omit<FlowStep, 'shape'> {
  type: 'node' | 'connection' | 'small-node';
  active?: boolean;
  rotation?: number;
  width?: number;
  shape?: 'circle' | 'square';
} 