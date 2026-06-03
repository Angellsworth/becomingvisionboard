"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { LogOut, Mail, Moon, Sun, Monitor, Pencil, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { PalettePicker } from "@/components/palette-picker"

const DISPLAY_NAME_KEY = "becoming-display-name"
const PRONOUNS_KEY = "becoming-pronouns"
const ONE_LINE_KEY = "becoming-one-line"

interface ProfileState {
  displayName: string
  pronouns: string
  oneLine: string
}

export function ProfileForm() {
  const { user, authEnabled, signOut } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<ProfileState>({
    displayName: "",
    pronouns: "",
    oneLine: "",
  })

  useEffect(() => {
    setMounted(true)
    try {
      setState({
        displayName: localStorage.getItem(DISPLAY_NAME_KEY) ?? "",
        pronouns: localStorage.getItem(PRONOUNS_KEY) ?? "",
        oneLine: localStorage.getItem(ONE_LINE_KEY) ?? "",
      })
    } catch {
      // ignore
    }
  }, [])

  const updateField = (key: keyof ProfileState, value: string) => {
    setState((prev) => ({ ...prev, [key]: value }))
    const storageKey =
      key === "displayName" ? DISPLAY_NAME_KEY : key === "pronouns" ? PRONOUNS_KEY : ONE_LINE_KEY
    try {
      localStorage.setItem(storageKey, value)
    } catch {
      // ignore
    }
  }

  const current = (theme === "system" ? resolvedTheme : theme) ?? "light"

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 pt-6 md:pt-10 pb-12 md:pb-16 space-y-10">
      {/* ─── Header ─── */}
      <header>
        <div className="flex items-center gap-3 mb-3 md:mb-4">
          <span className="section-mark" aria-hidden />
          <p className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-primary">Profile</p>
        </div>
        <h1 className="font-display text-5xl md:text-6xl tracking-[0.04em] leading-[1.02] text-foreground">
          Your becoming
        </h1>
        <p className="mt-3 font-serif italic text-base md:text-lg text-foreground/70">
          Make it yours. Edit anything.
        </p>
      </header>

      {/* ─── Identity ─── */}
      <FormSection eyebrow="Identity" title="Who you are right now">
        <EditableField
          label="Display name"
          value={state.displayName}
          onChange={(v) => updateField("displayName", v)}
          placeholder="Angela"
        />
        <EditableField
          label="Pronouns"
          value={state.pronouns}
          onChange={(v) => updateField("pronouns", v)}
          placeholder="she/her"
        />
        <EditableField
          label="One line about yourself"
          value={state.oneLine}
          onChange={(v) => updateField("oneLine", v)}
          placeholder="a gardener of small moments…"
          multiline
        />
        {user?.email && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/40 text-sm">
            <Mail className="w-4 h-4 text-foreground/50 shrink-0" />
            <span className="text-foreground/70 truncate">{user.email}</span>
            <span className="ml-auto text-xs text-foreground/40 tracking-wide uppercase">Sign-in</span>
          </div>
        )}
      </FormSection>

      {/* ─── Palette ─── */}
      <FormSection
        eyebrow="Palette"
        title="The colors you live in"
        whisper="Pick the world you want to open into."
      >
        <PalettePicker />
      </FormSection>

      {/* ─── Theme ─── */}
      <FormSection eyebrow="Light" title="Morning, dusk, or whatever your phone says">
        <div className="grid grid-cols-3 gap-3">
          <ThemeOption
            icon={Sun}
            label="Light"
            active={mounted && current === "light" && theme !== "system"}
            onClick={() => setTheme("light")}
          />
          <ThemeOption
            icon={Moon}
            label="Dark"
            active={mounted && current === "dark" && theme !== "system"}
            onClick={() => setTheme("dark")}
          />
          <ThemeOption
            icon={Monitor}
            label="System"
            active={mounted && theme === "system"}
            onClick={() => setTheme("system")}
          />
        </div>
      </FormSection>

      {/* ─── Sign out ─── */}
      {authEnabled && user && (
        <FormSection eyebrow="Session" title="Step out for now">
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </FormSection>
      )}
    </div>
  )
}

// --- Subcomponents -------------------------------------------------------

interface FormSectionProps {
  eyebrow: string
  title: string
  whisper?: string
  children: React.ReactNode
}

function FormSection({ eyebrow, title, whisper, children }: FormSectionProps) {
  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <p className="text-[11px] tracking-[0.3em] uppercase text-primary">{eyebrow}</p>
        <h2 className="font-serif text-2xl md:text-3xl text-foreground">{title}</h2>
        {whisper && <p className="text-sm text-foreground/60 italic font-serif">{whisper}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

interface EditableFieldProps {
  label: string
  value: string
  onChange: (next: string) => void
  placeholder?: string
  multiline?: boolean
}

function EditableField({ label, value, onChange, placeholder, multiline }: EditableFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  // Sync draft when value changes (e.g., after localStorage hydration).
  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  const commit = () => {
    onChange(draft.trim())
    setEditing(false)
  }
  const cancel = () => {
    setDraft(value)
    setEditing(false)
  }

  return (
    <div className="rounded-xl border border-border bg-card/60 px-4 py-3">
      <p className="text-[10px] tracking-[0.25em] uppercase text-foreground/50 mb-1.5">{label}</p>
      {editing ? (
        <div className="flex items-start gap-2">
          {multiline ? (
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Escape") cancel()
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit()
              }}
              placeholder={placeholder}
              rows={2}
              className="flex-1 bg-transparent text-foreground font-serif text-lg leading-snug resize-none focus:outline-none"
            />
          ) : (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Escape") cancel()
                if (e.key === "Enter") commit()
              }}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-foreground font-serif text-lg focus:outline-none"
            />
          )}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={commit}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground"
            aria-label="Save"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="w-full flex items-start justify-between gap-3 text-left"
        >
          <span
            className={cn(
              "font-serif text-lg leading-snug whitespace-pre-wrap break-words",
              value ? "text-foreground" : "text-foreground/35 italic",
            )}
          >
            {value || placeholder}
          </span>
          <Pencil className="w-4 h-4 text-foreground/30 shrink-0 mt-1" />
        </button>
      )}
    </div>
  )
}

interface ThemeOptionProps {
  icon: typeof Sun
  label: string
  active: boolean
  onClick: () => void
}

function ThemeOption({ icon: Icon, label, active, onClick }: ThemeOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 px-4 py-4 rounded-2xl border transition-all",
        active
          ? "border-primary/60 bg-primary/10 text-foreground shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_18%,transparent)]"
          : "border-border bg-card/60 text-foreground/70 hover:text-foreground hover:bg-card",
      )}
      aria-pressed={active}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs tracking-wide">{label}</span>
    </button>
  )
}
