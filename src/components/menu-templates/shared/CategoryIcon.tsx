import { MenuItemIcon } from '../../IconPicker';

type Props = {
  name?: string;
  className?: string;
};

export function CategoryIcon({ name, className = 'w-4 h-4' }: Props) {
  if (!name) return null;
  return <MenuItemIcon name={name} className={className} />;
}
