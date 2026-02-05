import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdrop, modalPanel } from './motionPresets.js';

/**
 * Modal wrapper: backdrop fade + panel scale. Exit animation when open becomes false.
 */
export function MotionModal({ open, onClose, children, className = '' }) {
  return (
    <AnimatePresence>
      {open && (
      <motion.div
        initial={modalBackdrop.initial}
        animate={modalBackdrop.animate}
        exit={modalBackdrop.exit}
        transition={modalBackdrop.transition}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-default"
        style={{ backgroundColor: 'var(--backdrop)' }}
        onClick={onClose}
        aria-modal="true"
        role="dialog"
        aria-label="Dialog"
      >
        <motion.div
          initial={modalPanel.initial}
          animate={modalPanel.animate}
          exit={modalPanel.exit}
          transition={modalPanel.transition}
          className={className}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
