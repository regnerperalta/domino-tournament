import type { ModalProps } from '../types/tournament';

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal Window Wrapper Card */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-4 border-colmado-wood bg-colmado-sand p-6 shadow-2xl z-10">
        <header className="flex items-center justify-between border-b-2 border-colmado-wood/20 pb-4 mb-4">
          <h3 className="text-3xl font-black text-colmado-dark uppercase tracking-wide">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="rounded-xl bg-colmado-chili hover:bg-red-700 px-4 py-2 font-black text-white shadow transition-colors"
          >
            CLOSE ×
          </button>
        </header>
        
        <div className="text-colmado-dark">
          {children}
        </div>
      </div>
    </div>
  );
}