# CurationPilot Frontend — Design System

## Color Palette (Warm Pastels)

| Token | Hex | Usage |
|---|---|---|
| `--color-surface` | `#F9F5F0` | Page background — warm ivory |
| `--color-surface-raised` | `#FFFFFF` | Cards, panels, chat bubbles |
| `--color-primary` | `#E8A87C` | Primary actions, active states — soft peach coral |
| `--color-primary-hover` | `#D4956A` | Hover/pressed state for primary elements |
| `--color-primary-soft` | `#FEF0E7` | Soft highlight, selected backgrounds |
| `--color-text` | `#3D3229` | Primary text — warm dark brown |
| `--color-text-muted` | `#8C7E73` | Secondary text, labels, placeholders |
| `--color-border` | `#E8DDD4` | Dividers, input borders |
| `--color-success` | `#7DB5A0` | Success states — soft sage/mint |
| `--color-error` | `#D98B8B` | Error states — soft rose |
| `--color-warning` | `#E4B87C` | Warning/in-progress — soft gold |

## Typography

| Role | Font | Weight | Usage |
|---|---|---|---|
| UI / Body | Inter | 400, 500, 600 | All interface text |
| Monospace | JetBrains Mono | 400 | Skill IDs, logs, technical data |

### Type Scale

| Token | Size | Line Height | Usage |
|---|---|---|---|
| `--text-xs` | 0.75rem (12px) | 1rem | Captions, timestamps |
| `--text-sm` | 0.875rem (14px) | 1.25rem | Secondary text, labels |
| `--text-base` | 1rem (16px) | 1.5rem | Body text, inputs |
| `--text-lg` | 1.125rem (18px) | 1.75rem | Section headers |
| `--text-xl` | 1.5rem (24px) | 2rem | Page title |

## Spacing Scale

| Token | Value |
|---|---|
| `--space-1` | 0.25rem (4px) |
| `--space-2` | 0.5rem (8px) |
| `--space-3` | 0.75rem (12px) |
| `--space-4` | 1rem (16px) |
| `--space-5` | 1.5rem (24px) |
| `--space-6` | 2rem (32px) |
| `--space-8` | 3rem (48px) |

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 4px | Small elements, tags |
| `--radius-md` | 8px | Inputs, buttons |
| `--radius-lg` | 12px | Cards, panels |
| `--radius-xl` | 16px | Chat bubbles, modals |
| `--radius-full` | 9999px | Avatars, pills |

## Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(61,50,41,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 12px rgba(61,50,41,0.08)` | Cards, dropdowns |
| `--shadow-lg` | `0 8px 24px rgba(61,50,41,0.12)` | Modals, popovers |

## Transitions

| Token | Value | Usage |
|---|---|---|
| `--transition-fast` | `150ms ease` | Hover states, toggles |
| `--transition-base` | `250ms ease` | Most animations |
| `--transition-slow` | `400ms ease` | Panel transitions, slides |

## Component Patterns

### Buttons
- **Primary**: `bg: --color-primary`, `color: white`, `radius: --radius-md`
- **Secondary**: `bg: transparent`, `border: --color-border`, `color: --color-text`
- **Ghost**: No border/bg, `color: --color-text-muted`, hover: `bg: --color-primary-soft`

### Inputs
- `border: 1px solid --color-border`
- `radius: --radius-md`
- `padding: --space-2 --space-3`
- Focus: `border-color: --color-primary`, `box-shadow: 0 0 0 3px --color-primary-soft`

### Cards
- `bg: --color-surface-raised`
- `radius: --radius-lg`
- `shadow: --shadow-md`
- `padding: --space-5`

### Chat Bubbles
- System: `bg: --color-surface-raised`, `radius: --radius-xl`
- User: `bg: --color-primary-soft`, `radius: --radius-xl`
