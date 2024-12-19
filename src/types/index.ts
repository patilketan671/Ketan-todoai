export interface Todo {
  text: string;
  done: boolean;
  id: string;
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

export interface FlowNode {
  x: number;
  y: number;
  id: string;
  type: 'node' | 'connection' | 'small-node';
  label?: string;
  color?: 'green' | 'yellow';
  active?: boolean;
  icon?: string;
  step?: number;
  rotation?: number;
  width?: number;
  shape?: 'circle' | 'square';
} 