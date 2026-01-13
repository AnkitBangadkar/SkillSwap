import { forwardRef, type ImgHTMLAttributes } from 'react';
import { cn, getInitials, getAvatarColor } from '../../lib/utils';

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, name = '', size = 'md', alt, ...props }, ref) => {
    const sizes = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
    };

    const initials = getInitials(name);
    const bgColor = getAvatarColor(name);

    if (src) {
      return (
        <div
          ref={ref}
          className={cn(
            'relative rounded-full overflow-hidden flex-shrink-0',
            sizes[size],
            className
          )}
        >
          <img
            src={src}
            alt={alt || name}
            className="h-full w-full object-cover"
            {...props}
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-full flex items-center justify-center font-medium text-white flex-shrink-0',
          sizes[size],
          bgColor,
          className
        )}
      >
        {initials}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };
