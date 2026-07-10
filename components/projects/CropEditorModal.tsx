'use client';

import { useState, useEffect } from 'react';
import { X, Sliders, Save } from 'lucide-react';
import { Project } from '@/types/database';
import { supabase } from '@/lib/supabase';

interface CropEditorModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSaved: () => void;
  isSpanish: boolean;
  notify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function CropEditorModal({
  isOpen,
  project,
  onClose,
  onSaved,
  isSpanish,
  notify,
}: CropEditorModalProps) {
  const [cropY, setCropY] = useState(0.5);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setCropY(project.crop_y !== undefined && project.crop_y !== null ? project.crop_y : 0.5);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ crop_y: cropY })
        .eq('id', project.id);

      if (error) {
        if (
          error.message?.includes('crop_y') ||
          error.code === 'PGRST204' ||
          error.message?.includes('column "crop_y" of relation "projects" does not exist')
        ) {
          notify(
            isSpanish
              ? 'Error: Columna "crop_y" no existe. Ejecuta: ALTER TABLE projects ADD COLUMN crop_y FLOAT DEFAULT 0.5;'
              : 'Error: "crop_y" column does not exist. Run: ALTER TABLE projects ADD COLUMN crop_y FLOAT DEFAULT 0.5;',
            'error'
          );
        } else {
          notify(isSpanish ? 'Error al guardar: ' + error.message : 'Error saving: ' + error.message, 'error');
        }
      } else {
        notify(
          isSpanish
            ? `Alineación de "${project.title}" actualizada`
            : `Crop alignment of "${project.title}" updated`,
          'success'
        );
        onSaved();
        onClose();
      }
    } catch (err: any) {
      notify(err.message || 'Error', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-text">
      <div className="bg-[#050507] border border-yellow-500/40 p-8 rounded-3xl max-w-lg w-full relative shadow-[0_0_60px_rgba(255,204,0,0.15)] font-mono text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors bg-zinc-900 p-2 rounded-full hover:bg-yellow-950/50 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-yellow-950/20 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
            <Sliders size={18} />
          </div>
          <div>
            <h3 className="text-white font-black tracking-tighter text-xl uppercase">
              {isSpanish ? 'AJUSTAR RECORTE' : 'ADJUST IMAGE CROP'}
            </h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">
              {project.title}
            </p>
          </div>
        </div>

        {/* Live Card Preview Box */}
        <div className="mb-6">
          <label className="text-[10px] text-zinc-500 uppercase font-mono mb-2 block tracking-widest">
            {isSpanish ? 'Vista_Previa_Tarjeta_3D' : '3D_Card_Preview'}
          </label>
          <div className="relative w-full aspect-[1.38/0.90] bg-zinc-950 overflow-hidden border border-yellow-500/30 rounded-2xl shadow-[0_0_30px_rgba(255,204,0,0.1)] flex items-center justify-center">
            {project.thumbnail_url ? (
              <img
                src={project.thumbnail_url}
                alt="Crop preview"
                className="w-full h-full object-cover select-none pointer-events-none transition-all duration-75"
                style={{
                  objectPosition: `50% ${cropY * 100}%`,
                }}
              />
            ) : (
              <div className="text-zinc-600 text-xs">NO_IMAGE</div>
            )}
            
            {/* Overlay indicators */}
            <div className="absolute top-3 left-3 text-[8px] font-mono text-yellow-500 bg-black/75 px-2 py-0.5 border border-yellow-500/30 rounded uppercase tracking-widest">
              Live Card
            </div>
            <div className="absolute bottom-3 right-3 text-[8px] font-mono text-zinc-500 bg-black/50 px-2 py-0.5 rounded">
              W:1.38 H:0.90
            </div>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
            <span>{isSpanish ? 'Alineación Vertical' : 'Vertical Alignment'}</span>
            <span className="text-yellow-500 font-bold">{(cropY * 100).toFixed(0)}%</span>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={cropY}
              onChange={(e) => setCropY(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-yellow-500 border border-zinc-800 focus:outline-none"
            />
          </div>

          {/* Slider Labels */}
          <div className="flex justify-between text-[9px] font-mono text-zinc-500 px-1">
            <span>{isSpanish ? '↑ Superior (Cabeza)' : '↑ Top (Head)'}</span>
            <span>{isSpanish ? '• Centro' : '• Center'}</span>
            <span>{isSpanish ? '↓ Inferior (Pies)' : '↓ Bottom (Feet)'}</span>
          </div>

          {/* Quick Presets */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setCropY(0.0)}
              className={`flex-1 py-1.5 border rounded-md text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                cropY === 0.0
                  ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10'
                  : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white bg-zinc-950'
              }`}
            >
              {isSpanish ? 'Superior' : 'Top'} (0%)
            </button>
            <button
              onClick={() => setCropY(0.5)}
              className={`flex-1 py-1.5 border rounded-md text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                cropY === 0.5
                  ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10'
                  : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white bg-zinc-950'
              }`}
            >
              {isSpanish ? 'Centro' : 'Center'} (50%)
            </button>
            <button
              onClick={() => setCropY(1.0)}
              className={`flex-1 py-1.5 border rounded-md text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                cropY === 1.0
                  ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10'
                  : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white bg-zinc-950'
              }`}
            >
              {isSpanish ? 'Inferior' : 'Bottom'} (100%)
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white font-bold tracking-widest py-3.5 rounded-xl transition-all uppercase cursor-pointer text-xs"
          >
            {isSpanish ? 'Cancelar' : 'Cancel'}
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-black tracking-widest py-3.5 rounded-xl hover:from-yellow-500 hover:to-yellow-400 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,204,0,0.2)] uppercase cursor-pointer flex items-center justify-center gap-2 text-xs"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {isSpanish ? 'Guardar' : 'Save'}
          </button>
        </div>

      </div>
    </div>
  );
}
