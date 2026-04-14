import { useState } from 'react';
import type { CategoryTreeNode } from '../../domain/types';

interface CategoryTreeProps {
  tree: CategoryTreeNode[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  variant?: 'light' | 'dark';
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5" aria-hidden="true">
      <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TreeNode({
  node,
  selectedIds,
  onToggle,
  depth,
  variant,
}: {
  node: CategoryTreeNode;
  selectedIds: string[];
  onToggle: (id: string) => void;
  depth: number;
  variant: 'light' | 'dark';
}) {
  const [expanded, setExpanded] = useState(
    // Auto-expand if any child is selected
    node.children.some((c) => selectedIds.includes(c.id)),
  );
  const hasChildren = node.children.length > 0;
  const isSelected = selectedIds.includes(node.id);

  const isDark = variant === 'dark';
  const textColor = isDark ? 'text-white/80' : 'text-on-surface';
  const mutedColor = isDark ? 'text-white/50' : 'text-on-surface-muted';
  const hoverBg = isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-turquoise/[0.04]';
  const checkboxBorder = isDark ? 'border-white/25' : 'border-stroke';
  const checkboxChecked = 'bg-turquoise border-turquoise text-white';

  return (
    <li role="treeitem" aria-expanded={hasChildren ? expanded : undefined}>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer select-none transition-colors duration-150 ${hoverBg}`}
        style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
        onClick={() => onToggle(node.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle(node.id);
          }
        }}
        role="button"
        tabIndex={0}
      >
        {/* Checkbox */}
        <span
          className={`flex items-center justify-center w-4 h-4 rounded border transition-all duration-150 shrink-0 ${
            isSelected ? checkboxChecked : checkboxBorder
          }`}
        >
          {isSelected && <CheckIcon />}
        </span>

        {/* Emoji */}
        {node.emoticon && <span className="text-sm shrink-0">{node.emoticon}</span>}

        {/* Label */}
        <span className={`text-sm font-semibold truncate ${isSelected ? 'text-turquoise' : textColor}`}>
          {node.name}
        </span>

        {/* Expand toggle */}
        {hasChildren && (
          <button
            type="button"
            className={`ml-auto p-0.5 rounded transition-colors duration-150 ${mutedColor} hover:text-turquoise`}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((prev) => !prev);
            }}
            aria-label={expanded ? `Colapsar ${node.name}` : `Expandir ${node.name}`}
          >
            <ChevronIcon expanded={expanded} />
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <ul role="group" className="list-none p-0 m-0">
          {node.children
            .filter((c) => c.isActive)
            .map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                selectedIds={selectedIds}
                onToggle={onToggle}
                depth={depth + 1}
                variant={variant}
              />
            ))}
        </ul>
      )}
    </li>
  );
}

export function CategoryTree({ tree, selectedIds, onToggle, variant = 'light' }: CategoryTreeProps) {
  const activeRoots = tree.filter((node) => node.isActive);

  if (activeRoots.length === 0) return null;

  return (
    <ul role="tree" className="list-none p-0 m-0 space-y-0.5">
      {activeRoots.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          selectedIds={selectedIds}
          onToggle={onToggle}
          depth={0}
          variant={variant}
        />
      ))}
    </ul>
  );
}
