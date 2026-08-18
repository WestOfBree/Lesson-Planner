"use client";

import type { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";

type CollapsiblePanelProps = {
  header: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  containerClassName?: string;
  toggleButtonClassName?: string;
  iconContainerClassName?: string;
  contentClassName?: string;
  ariaLabel?: string;
  useTransition?: boolean;
  transitionClassName?: string;
  expandedClassName?: string;
  collapsedClassName?: string;
};

const CollapsiblePanel = ({
  header,
  isOpen,
  onToggle,
  children,
  containerClassName = "space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4",
  toggleButtonClassName = "flex w-full items-center justify-between text-left",
  iconContainerClassName = "cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-slate-500",
  contentClassName = "space-y-2",
  ariaLabel,
  useTransition = false,
  transitionClassName = "overflow-hidden transition-all duration-300",
  expandedClassName = "max-h-[4000px] opacity-100",
  collapsedClassName = "max-h-0 opacity-0",
}: CollapsiblePanelProps) => {
  const content = <div className={contentClassName}>{children}</div>;

  return (
    <div className={containerClassName}>
      <button
        type="button"
        className={toggleButtonClassName}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        {header}
        <span className={iconContainerClassName}>
          <FontAwesomeIcon icon={isOpen ? faAngleUp : faAngleDown} className="h-4 w-4" />
        </span>
      </button>

      {useTransition ? (
        <div className={`${transitionClassName} ${isOpen ? expandedClassName : collapsedClassName}`}>{content}</div>
      ) : isOpen ? (
        content
      ) : null}
    </div>
  );
};

export default CollapsiblePanel;
