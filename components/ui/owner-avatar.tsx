import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OwnerAvatarProps {
  name: string | null;
  image: string | null;
  className?: string;
}

export function OwnerAvatar({ name, image, className }: OwnerAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={image || undefined} alt={name || 'Anonymous'} />
      <AvatarFallback>
        {name ? name[0].toUpperCase() : 'A'}
      </AvatarFallback>
    </Avatar>
  );
} 