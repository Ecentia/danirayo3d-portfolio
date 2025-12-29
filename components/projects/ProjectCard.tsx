'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Project } from '@/types/database';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden cursor-pointer group mb-4 break-inside-avoid"
      onClick={onClick}
    >
      {/* Imagen Thumbnail */}
      <Image
        src={project.thumbnail_url}
        alt={project.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {/* Overlay estilo ArtStation al pasar el ratón */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <h3 className="text-white font-bold text-lg truncate">{project.title}</h3>
      </div>
    </motion.div>
  );
}