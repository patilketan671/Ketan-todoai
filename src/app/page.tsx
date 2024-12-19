'use client';

import { useState, useEffect, useRef } from 'react';
import { Todo, FlowStep, FlowNode, Connection } from '@/types';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([
    { text: "Laundry", done: true, id: "1" },
    { text: "Work", done: false, id: "2" },
    { text: "Research", done: false, id: "3" }
  ]);
  const [newTodoText, setNewTodoText] = useState('');
  const [flowNodes, setFlowNodes] = useState<FlowNode[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const todoListRef = useRef<HTMLDivElement>(null);
  const addTodoRef = useRef<HTMLDivElement>(null);

  const createToggleFlow = (todoElement: HTMLElement) => {
    const rect = todoElement.getBoundingClientRect();
    const baseX = rect.right + 100;
    const baseY = rect.top + rect.height / 2;

    const steps: FlowStep[] = [
      // Main set todo node
      { 
        id: 'set-todo',
        label: 'set todo',
        subLabel: 'done',
        icon: '✓',
        color: 'green' as const,
        x: baseX,
        y: baseY,
        step: 1,
        shape: 'circle'
      },
      // Upper branch - list nodes
      {
        id: 'list-1',
        label: 'list',
        color: 'green' as const,
        x: baseX + 80,
        y: baseY - 40,
        step: 2,
        shape: 'circle'
      },
      {
        id: 'constant-1',
        label: 'constant',
        icon: '🔄',
        color: 'yellow' as const,
        x: baseX + 200,
        y: baseY - 40,
        step: 3,
        shape: 'circle'
      },
      // Lower branch - done nodes
      {
        id: 'done-1',
        label: 'done',
        color: 'green' as const,
        x: baseX + 80,
        y: baseY + 40,
        step: 2,
        shape: 'circle'
      },
      {
        id: 'false-node',
        label: 'false',
        color: 'yellow' as const,
        x: baseX + 200,
        y: baseY + 40,
        step: 3,
        shape: 'square'
      }
    ];

    // Additional connections
    const connections = [
      // Upper branch connections
      {
        from: 'set-todo',
        to: 'list-1',
        color: 'green',
        step: 1
      },
      {
        from: 'list-1',
        to: 'constant-1',
        color: 'yellow',
        step: 2
      },
      // Lower branch connections
      {
        from: 'set-todo',
        to: 'done-1',
        color: 'green',
        step: 1
      },
      {
        from: 'done-1',
        to: 'false-node',
        color: 'yellow',
        step: 2
      }
    ];

    return createFlowNodesWithConnections(steps, connections);
  };

  const createFlowNodesWithConnections = (steps: FlowStep[], connections: Connection[]) => {
    const nodes: FlowNode[] = [];
    const nodeMap = new Map(steps.map(step => [step.id, step]));

    // Add all main nodes
    steps.forEach(step => {
      nodes.push({
        ...step,
        type: 'node',
        active: false
      });
    });

    // Add connections and small nodes
    connections.forEach((conn, index) => {
      const fromNode = nodeMap.get(conn.from);
      const toNode = nodeMap.get(conn.to);
      
      if (fromNode && toNode) {
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Main connection line
        nodes.push({
          id: `conn-${index}`,
          type: 'connection',
          x: fromNode.x,
          y: fromNode.y,
          color: conn.color,
          active: false,
          step: conn.step,
          rotation: angle,
          width: distance,
          label: ''
        });

        // Small node in the middle of connection
        nodes.push({
          id: `small-${index}`,
          type: 'small-node',
          x: fromNode.x + dx / 2,
          y: fromNode.y + dy / 2,
          color: conn.color,
          active: false,
          step: conn.step,
          label: ''
        });
      }
    });

    return nodes;
  };

  const createRemoveFlow = (todoElement: HTMLElement) => {
    const rect = todoElement.getBoundingClientRect();
    const baseX = rect.right + 100;
    const baseY = rect.top + rect.height / 2;

    const steps: FlowStep[] = [
      { 
        id: 'remove-child',
        label: 'remove child',
        icon: '❌',
        color: 'green' as const,
        x: baseX,
        y: baseY,
        step: 1,
        shape: 'circle'
      },
      { 
        id: 'event',
        label: 'event',
        icon: '⚡',
        color: 'yellow' as const,
        x: baseX + 120,
        y: baseY,
        step: 2,
        shape: 'circle'
      },
      { 
        id: 'listen',
        label: 'listen',
        icon: '👂',
        color: 'yellow' as const,
        x: baseX + 240,
        y: baseY,
        step: 3,
        shape: 'circle'
      }
    ];

    const connections: Connection[] = [
      {
        from: 'remove-child',
        to: 'event',
        color: 'yellow' as const,
        step: 1
      },
      {
        from: 'event',
        to: 'listen',
        color: 'yellow' as const,
        step: 2
      }
    ];

    return createFlowNodesWithConnections(steps, connections);
  };

  const createAddFlow = () => {
    const addTodoElement = addTodoRef.current;
    if (!addTodoElement) return;

    const rect = addTodoElement.getBoundingClientRect();
    const baseX = rect.right + 100;
    const baseY = rect.top + rect.height / 2;

    const steps: FlowStep[] = [
      { 
        id: 'make-todo',
        label: 'make todo',
        icon: '✏️',
        color: 'green' as const,
        x: baseX,
        y: baseY,
        step: 1,
        shape: 'circle'
      },
      { 
        id: 'listen',
        label: 'listen',
        icon: '👂',
        color: 'green' as const,
        x: baseX + 120,
        y: baseY,
        step: 2,
        shape: 'circle'
      },
      { 
        id: 'set-todo',
        label: 'set todo',
        icon: '✅',
        color: 'green' as const,
        x: baseX + 240,
        y: baseY,
        step: 3,
        shape: 'circle'
      },
      { 
        id: 'constant',
        label: 'constant',
        icon: '🔄',
        color: 'yellow' as const,
        x: baseX + 360,
        y: baseY,
        step: 4,
        shape: 'circle'
      }
    ];

    const connections: Connection[] = [
      {
        from: 'make-todo',
        to: 'listen',
        color: 'green' as const,
        step: 1
      },
      {
        from: 'listen',
        to: 'set-todo',
        color: 'green' as const,
        step: 2
      },
      {
        from: 'set-todo',
        to: 'constant',
        color: 'yellow' as const,
        step: 3
      }
    ];

    return createFlowNodesWithConnections(steps, connections);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateFlow = () => {
      if (currentStep > 0 && flowNodes.length > 0) {
        const maxStep = Math.max(...flowNodes.map(n => n.step || 0));

        // Update active states
        const updatedNodes = flowNodes.map(node => ({
          ...node,
          active: node.step === currentStep
        }));

        if (JSON.stringify(updatedNodes) !== JSON.stringify(flowNodes)) {
          setFlowNodes(updatedNodes);
        }

        // Schedule next step or cleanup
        if (currentStep <= maxStep) {
          timeoutId = setTimeout(() => {
            setCurrentStep(prev => prev + 1);
          }, 800);
        } else {
          timeoutId = setTimeout(() => {
            setFlowNodes([]);
            setCurrentStep(0);
          }, 1000);
        }
      }
    };

    updateFlow();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentStep, flowNodes]);

  const startFlow = (nodes: FlowNode[]) => {
    if (currentStep === 0) {  // Only start if not already running
      setFlowNodes(nodes);
      setCurrentStep(1);
    }
  };

  const addTodo = async () => {
    if (newTodoText.trim() && currentStep === 0) {  // Only add if not animating
      const nodes = createAddFlow();
      if (nodes) {
        startFlow(nodes);
        
        await new Promise(resolve => setTimeout(resolve, 3200));
        
        const newTodo = {
          text: newTodoText,
          done: false,
          id: Date.now().toString()
        };
        
        setTodos(prev => [...prev, newTodo]);
        setNewTodoText('');
      }
    }
  };

  const toggleTodo = (index: number) => {
    const todoElement = todoListRef.current?.children[index] as HTMLElement;
    if (todoElement && currentStep === 0) {  // Only toggle if not animating
      // Update state immediately for better UX
      setTodos(prev => {
        const newTodos = [...prev];
        newTodos[index].done = !newTodos[index].done;
        return newTodos;
      });

      // Show animation
      const nodes = createToggleFlow(todoElement);
      startFlow(nodes);
    }
  };

  const removeTodo = (index: number) => {
    const todoElement = todoListRef.current?.children[index] as HTMLElement;
    if (todoElement && currentStep === 0) {  // Only remove if not animating
      const nodes = createRemoveFlow(todoElement);
      startFlow(nodes);

      todoElement.classList.add('removing');
      setTimeout(() => {
        setTodos(prev => prev.filter((_, i) => i !== index));
      }, 2400);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <main className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
      <div className="flow-background">
        {flowNodes.map(node => (
          <div
            key={node.id}
            className={`flow-node ${node.type} ${node.color} ${node.active ? 'active' : ''} ${node.shape || ''}`}
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              transform: `translate(-50%, -50%) scale(${node.active ? 1 : 0})${node.rotation ? ` rotate(${node.rotation}deg)` : ''}`,
              width: node.type === 'connection' && node.width ? `${node.width}px` : undefined
            }}
          >
            {node.type === 'node' && (
              <>
                {node.icon && <span className="node-icon">{node.icon}</span>}
                {node.label && <span className="node-label">{node.label}</span>}
                {node.subLabel && <span className="node-sublabel">{node.subLabel}</span>}
              </>
            )}
          </div>
        ))}
      </div>
      
      <div className="todo-app">
        <div className="todo-list" ref={todoListRef}>
          {todos.map((todo, index) => (
            <div key={todo.id} className="todo-item group">
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(index)}
              />
              <span className={todo.done ? 'done' : ''}>
                {todo.text}
              </span>
              <button
                onClick={() => removeTodo(index)}
                className="ml-auto text-[#00ff9d] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className="add-todo" ref={addTodoRef}>
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add new todo"
          />
          <button onClick={addTodo}>→</button>
        </div>
      </div>
    </main>
  );
}
