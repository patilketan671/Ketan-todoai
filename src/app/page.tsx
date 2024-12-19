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
      // Click
      {
        id: 'click',
        label: 'click',
        icon: '🖱️',
        color: 'green' as const,
        x: baseX,
        y: baseY,
        step: 1,
        shape: 'circle'
      },
      // Toggle
      {
        id: 'toggle',
        label: 'toggle',
        icon: '✓',
        color: 'green' as const,
        x: baseX + 100,
        y: baseY,
        step: 2,
        shape: 'circle'
      },
      // Update
      {
        id: 'update',
        label: 'update',
        icon: '🔄',
        color: 'green' as const,
        x: baseX + 200,
        y: baseY,
        step: 3,
        shape: 'circle'
      }
    ];

    const connections: Connection[] = [
      // Click to toggle
      {
        from: 'click',
        to: 'toggle',
        color: 'green' as const,
        step: 1
      },
      // Toggle to update
      {
        from: 'toggle',
        to: 'update',
        color: 'green' as const,
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
        active: false,
        label: step.label
      });
    });

    // Add connections
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
        id: 'click',
        label: 'click',
        icon: '🖱️',
        color: 'green' as const,
        x: baseX,
        y: baseY,
        step: 1,
        shape: 'circle'
      },
      {
        id: 'remove',
        label: 'remove',
        icon: '❌',
        color: 'green' as const,
        x: baseX + 100,
        y: baseY,
        step: 2,
        shape: 'circle'
      },
      {
        id: 'update',
        label: 'update',
        icon: '🔄',
        color: 'green' as const,
        x: baseX + 200,
        y: baseY,
        step: 3,
        shape: 'circle'
      }
    ];

    const connections: Connection[] = [
      {
        from: 'click',
        to: 'remove',
        color: 'green' as const,
        step: 1
      },
      {
        from: 'remove',
        to: 'update',
        color: 'green' as const,
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
      // Make todo
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
      // Append todo
      {
        id: 'append-todo',
        label: 'append todo',
        color: 'green' as const,
        x: baseX + 100,
        y: baseY,
        step: 2,
        shape: 'circle'
      },
      // Todo item
      {
        id: 'todo-item',
        label: 'todo item',
        icon: '📝',
        color: 'green' as const,
        x: baseX + 200,
        y: baseY,
        step: 3,
        shape: 'circle'
      }
    ];

    const connections: Connection[] = [
      // Make todo to append todo
      {
        from: 'make-todo',
        to: 'append-todo',
        color: 'green' as const,
        step: 1
      },
      // Append todo to todo item
      {
        from: 'append-todo',
        to: 'todo-item',
        color: 'green' as const,
        step: 2
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
    <main className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center relative">
      <header className="fixed top-0 w-full py-4 text-center text-sm text-gray-400 z-10">
        <div className="flex items-center justify-center gap-2">
          <span>Ketan Todo</span>
          <a 
            href="https://twitter.com/patilketan671" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#00ff9d] hover:text-[#00ff9d]/80 transition-colors"
          >
            <svg 
              viewBox="0 0 24 24" 
              className="w-5 h-5 fill-current"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </div>
      </header>

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
            data-node-type={node.nodeType}
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
            onKeyDown={handleKeyPress}
            placeholder="Add new todo"
          />
          <button onClick={addTodo}>→</button>
        </div>
      </div>

      <footer className="fixed bottom-0 w-full py-4 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2">
          <span>2024 @Ketan - All Rights Reserved - Created by Ketan</span>
          <a 
            href="https://twitter.com/patilketan671" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#00ff9d] hover:text-[#00ff9d]/80 transition-colors"
          >
            <svg 
              viewBox="0 0 24 24" 
              className="w-5 h-5 fill-current"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </div>
      </footer>
    </main>
  );
}
