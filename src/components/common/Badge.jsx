export default function Badge({
  variant = 'default',
  children,
  size = 'md',
  className = '',
}) {
  const normalizedVariant = String(variant).toLowerCase().trim()
  return (
    <span className={`badge badge-${normalizedVariant} badge-${size} ${className}`}>
      {children}
    </span>
  )
}
