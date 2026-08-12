import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.ComponentProps<'input'> {
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, style, ...props }, ref) => {
    const hasIcon = !!icon;

    return (
      <div
        className={cn(
          // Only position relatively when hosting an icon; otherwise sibling
          // absolute icons (e.g. login/search) paint under this wrapper's bg.
          'flex items-center rounded-[8px] border border-(--border-light) bg-(--bg-input) focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
          hasIcon ? 'relative' : 'px-4',
          'w-full min-w-0 outline-none disabled:cursor-not-allowed disabled:opacity-50 h-[48px] overflow-hidden md:text-sm',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className
        )}
      >
        {hasIcon && (
          <span className="pointer-events-none absolute left-3 z-10 text-(--text-muted)">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          data-slot="input"
          style={style}
          className={cn(
            'flex h-full w-full min-w-0 disabled:cursor-not-allowed disabled:opacity-40 bg-transparent placeholder:text-(--text-muted) placeholder:font-light selection:bg-primary selection:text-primary-foreground outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium text-(--text-primary)',
            'focus-visible:border-ring focus-visible:outline-none',
            hasIcon ? 'pl-9 pr-2' : 'py-[15px]'
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
