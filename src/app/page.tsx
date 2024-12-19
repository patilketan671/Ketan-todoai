'use client';

import { useState, useEffect, useRef } from 'react';

interface Todo {
  text: string;
  done: boolean;
  id: string;
}

interface FlowStep {
  id: string;
  label: string;
  subLabel?: string;
  icon?: string;
  color: 'green' | 'yellow';
  x: number;
  y: number;
  step: number;
}

interface FlowNode {
  x: number;
  y: number;
  id: string;
  type: 'node' | 'connection' | 'small-node';
  label?: string;
  color?: 'green' | 'yellow';
  active?: boolean;
  icon?: string;
  step?: number;
}

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

    const steps = [
      { 
        id: 'set-done',
        label: 'set todo',
        subLabel: 'done',
        icon: '✅',
        color: 'green',
        x: baseX,
        y: baseY,
        step: 1
      },
      { 
        id: 'child-set',
        label: 'child set',
        icon: '📝',
        color: 'green',
        x: baseX + 120,
        y: baseY,
        step: 2
      },
      { 
        id: 'listen',
        label: 'listen',
        icon: '👂',
        color: 'yellow',
        x: baseX + 240,
        y: baseY,
        step: 3
      }
    ];

    return createFlowNodes(steps);
  };

  const createRemoveFlow = (todoElement: HTMLElement) => {
    const rect = todoElement.getBoundingClientRect();
    const baseX = rect.right + 100;
    const baseY = rect.top + rect.height / 2;

    const steps = [
      { 
        id: 'remove-child',
        label: 'remove child',
        icon: '❌',
        color: 'green',
        x: baseX,
        y: baseY,
        step: 1
      },
      { 
        id: 'event',
        label: 'event',
        icon: '⚡',
        color: 'yellow',
        x: baseX + 120,
        y: baseY,
        step: 2
      },
      { 
        id: 'listen',
        label: 'listen',
        icon: '👂',
        color: 'yellow',
        x: baseX + 240,
        y: baseY,
        step: 3
      }
    ];

    return createFlowNodes(steps);
  };

  const createFlowNodes = (steps: FlowStep[]) => {
    const nodes: FlowNode[] = [];

    steps.forEach((step, index) => {
      // Main node
      nodes.push({
        ...step,
        type: 'node',
        active: false
      });

      // Connection to next node
      if (index < steps.length - 1) {
        nodes.push({
          x: step.x + 60,
          y: step.y,
          id: `connection-${index}`,
          type: 'connection',
          color: steps[index + 1].color,
          active: false,
          step: step.step
        });

        // Small nodes on connection
        [0.3, 0.7].forEach((pos, i) => {
          nodes.push({
            x: step.x + 60 + (pos * 60),
            y: step.y,
            id: `small-${index}-${i}`,
            type: 'small-node',
            color: steps[index + 1].color,
            active: false,
            step: step.step
          });
        });
      }
    });

    return nodes;
  };

  const createAddFlow = () => {
    const addTodoElement = addTodoRef.current;
    if (!addTodoElement) return;

    const rect = addTodoElement.getBoundingClientRect();
    const baseX = rect.right + 100;
    const baseY = rect.top + rect.height / 2;

    const steps = [
      { 
        id: 'make-todo',
        label: 'make todo',
        icon: '✏️',
        color: 'green',
        x: baseX,
        y: baseY,
        step: 1
      },
      { 
        id: 'listen',
        label: 'listen',
        icon: '👂',
        color: 'green',
        x: baseX + 120,
        y: baseY,
        step: 2
      },
      { 
        id: 'set-todo',
        label: 'set todo',
        icon: '✅',
        color: 'green',
        x: baseX + 240,
        y: baseY,
        step: 3
      },
      { 
        id: 'constant',
        label: 'constant',
        icon: '🔄',
        color: 'yellow',
        x: baseX + 360,
        y: baseY,
        step: 4
      }
    ];

    return createFlowNodes(steps);
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
            className={`flow-node ${node.type} ${node.color} ${node.active ? 'active' : ''}`}
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              transform: `translate(-50%, -50%) scale(${node.active ? 1 : 0})`
            }}
          >
            {node.type === 'node' && (
              <>
                {node.icon && <span className="node-icon">{node.icon}</span>}
                {node.label && <span className="node-label">{node.label}</span>}
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
