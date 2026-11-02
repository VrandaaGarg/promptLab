import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button, type ButtonProps } from './button'
export type CopyButtonProps = Omit<ButtonProps, 'onClick' | 'children'> & { text: string; onCopy?: () => void; onError?: (error: unknown) => void }
export function CopyButton({ text, onCopy, onError, ...props }: CopyButtonProps) { const [copied, setCopied] = useState(false); const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined); useEffect(() => () => clearTimeout(timer.current), []); return <Button variant="ghost" size="icon-sm" {...props} aria-label={copied ? 'Copied' : 'Copy to clipboard'} onClick={async () => { try { await navigator.clipboard.writeText(text); setCopied(true); onCopy?.(); clearTimeout(timer.current); timer.current = setTimeout(() => setCopied(false), 2000) } catch (error) { onError?.(error) } }}>{copied ? <Check className="size-4" /> : <Copy className="size-4" />}</Button> }
