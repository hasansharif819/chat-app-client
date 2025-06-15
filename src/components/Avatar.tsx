import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center overflow-hidden`}>
      {src ? (
        <Image 
          src={src}
          alt={name || 'User'}
          width={48}
          height={48}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-gray-600 font-medium">
          {name?.charAt(0).toUpperCase() || 'U'}
        </span>
      )}
    </div>
  );
}