import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ id, section, onToggleVisibility, onRename }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(section.label);

  const handleRename = () => {
    if (label.trim()) {
      onRename(section.key, label.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setLabel(section.label);
      setIsEditing(false);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 transition"
        title="Drag to reorder"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      <button
        onClick={() => onToggleVisibility(section.key)}
        className={`p-1.5 rounded transition ${
          section.visible
            ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
        }`}
        title={section.visible ? 'Hide section' : 'Show section'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {section.visible ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          )}
        </svg>
      </button>

      <div className="flex-1">
        {isEditing ? (
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            autoFocus
          />
        ) : (
          <span
            className={`text-sm font-medium ${section.visible ? 'text-slate-900' : 'text-slate-400 line-through'}`}
          >
            {section.label}
          </span>
        )}
      </div>

      <button
        onClick={() => {
          if (isEditing) {
            handleRename();
          } else {
            setIsEditing(true);
          }
        }}
        className="p-1 text-slate-400 hover:text-blue-600 transition"
        title={isEditing ? 'Save' : 'Rename'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isEditing ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          )}
        </svg>
      </button>
    </div>
  );
}

export function SectionManager({ sectionConfig, onReorder, onToggleVisibility, onRename }) {
  const [items] = useState(() => sectionConfig.map((s) => s.key));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);
      onReorder(newOrder);
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Section Order & Visibility</h3>
      <p className="text-sm text-slate-600 mb-4">
        Drag sections to reorder. Toggle visibility to show/hide sections in your resume.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sectionConfig.map((section) => (
              <SortableItem
                key={section.key}
                id={section.key}
                section={section}
                onToggleVisibility={onToggleVisibility}
                onRename={onRename}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
