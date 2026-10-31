import type { SVGProps } from 'react'

/**
 * The icon set (Annex A, A3-TW; taste-skill app rules).
 *
 * Drawn here rather than installed: an icon package would be a dependency
 * PRD rule 8 does not allow for something this small, and a handful of paths
 * weigh less than any library's tree-shaken remainder.
 *
 * One family throughout - 24px box, 1.5 stroke, round caps, no fills - so
 * they read as one set. They inherit `currentColor`, which is what lets the
 * same icon sit on a light ground and a dark one without a second copy.
 *
 * Every icon is `aria-hidden`: an icon beside a word is decoration, and an
 * icon alone is given its name by the control's `aria-label`. Nothing here
 * should ever be the only thing announcing a control.
 */

export type IconProps = SVGProps<SVGSVGElement> & {
  /** Edge length in px. 16 beside text, 20 in the navigation. */
  size?: number
}

function Svg({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  )
}

export function SunIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Svg>
  )
}

export function MoonIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    </Svg>
  )
}

export function CartIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 7h13l-1.3 8.2a2 2 0 0 1-2 1.8H9.3a2 2 0 0 1-2-1.7L6 4.8A1 1 0 0 0 5 4H3" />
      <circle cx="10" cy="20" r="1.3" />
      <circle cx="17" cy="20" r="1.3" />
    </Svg>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </Svg>
  )
}

export function OrdersIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 4h14v16l-2.3-1.6L14.4 20 12 18.4 9.6 20l-2.3-1.6L5 20Z" />
      <path d="M9 9h6M9 13h4" />
    </Svg>
  )
}

export function LogOutIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
      <path d="M10 8 6 12l4 4M6 12h9" />
    </Svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  )
}

export function TrashIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M10 4h4M6 7l1 13h10l1-13M10 11v5M14 11v5" />
    </Svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 13 4.5 4.5L19 7" />
    </Svg>
  )
}
