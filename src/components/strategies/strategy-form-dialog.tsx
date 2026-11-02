import { useForm, useStore } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Textarea } from '@/components/ui/textarea'
import { useCreateStrategy, useUpdateStrategy } from '@/hooks/use-strategy-mutations'
import { MAX_EXAMPLES, TEMPLATE_VARIABLES } from '@/lib/domain'
import { visibleFieldError } from '@/lib/form'
import { STRATEGY_COLORS, STRATEGY_ICONS } from '@/lib/strategies'
import { strategyInputSchema, type StrategyInput } from '@/lib/validation'
import type { Strategy } from '@/server/strategies'
import { ColorPicker, IconPicker } from './appearance-pickers'
import { PromptPreview } from './prompt-preview'
import { TemplateEditor } from './template-editor'

const EXAMPLE_COUNT_OPTIONS = Array.from({ length: MAX_EXAMPLES + 1 }, (_, n) => ({ value: String(n), label: String(n) }))

function toFormValues(strategy: Strategy | null): StrategyInput {
  const color = STRATEGY_COLORS.find((c) => c === strategy?.color) ?? 'strategy-1'
  const icon = STRATEGY_ICONS.find((i) => i === strategy?.icon) ?? 'sparkles'
  return {
    name: strategy?.name ?? '',
    description: strategy?.description ?? '',
    systemPrompt: strategy?.systemPrompt ?? '',
    template: strategy?.template ?? `${TEMPLATE_VARIABLES.task}\n\n`,
    exampleCount: strategy?.exampleCount ?? 0,
    color,
    icon,
  }
}

function StrategyForm({ strategy, onDone }: { strategy: Strategy | null; onDone: () => void }) {
  const create = useCreateStrategy()
  const update = useUpdateStrategy()

  const form = useForm({
    defaultValues: toFormValues(strategy),
    validators: { onChange: strategyInputSchema },
    onSubmit: async ({ value }) => {
      try {
        if (strategy) await update.mutateAsync({ ...value, id: strategy.id })
        else await create.mutateAsync(value)
        onDone()
      } catch {
        // Reported by the mutation hook; keep the dialog open so nothing is lost.
      }
    },
  })
  const submitted = useStore(form.store, (s) => s.submissionAttempts > 0)
  const preview = {
    systemPrompt: useStore(form.store, (s) => s.values.systemPrompt),
    template: useStore(form.store, (s) => s.values.template),
    exampleCount: useStore(form.store, (s) => s.values.exampleCount),
    color: useStore(form.store, (s) => s.values.color),
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="name">
              {(field) => (
                <Field label="Name" error={visibleFieldError(field.state.meta, submitted)}>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g. Socratic"
                    maxLength={40}
                    autoFocus
                  />
                </Field>
              )}
            </form.Field>
            <form.Field name="description">
              {(field) => (
                <Field label="Description" error={visibleFieldError(field.state.meta, submitted)}>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="What makes it different"
                    maxLength={200}
                  />
                </Field>
              )}
            </form.Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
            <div className="space-y-2">
              <Label>Color</Label>
              <form.Field name="color">{(field) => <ColorPicker value={field.state.value} onChange={field.handleChange} />}</form.Field>
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <form.Field name="icon">
                {(field) => <IconPicker value={field.state.value} color={preview.color} onChange={field.handleChange} />}
              </form.Field>
            </div>
          </div>

          <form.Field name="systemPrompt">
            {(field) => (
              <Field
                label="System prompt (optional)"
                description={`Sets behaviour before the task. ${TEMPLATE_VARIABLES.role} and ${TEMPLATE_VARIABLES.examples} work here too.`}
                error={visibleFieldError(field.state.meta, submitted)}
              >
                <Textarea
                  autosize
                  rows={2}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  spellCheck={false}
                  placeholder={`You are ${TEMPLATE_VARIABLES.role}.`}
                  className="min-h-16 font-mono text-xs leading-relaxed"
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="template">
            {(field) => (
              <Field
                label="Prompt template"
                description={`Must include ${TEMPLATE_VARIABLES.task}.`}
                error={visibleFieldError(field.state.meta, submitted)}
              >
                <TemplateEditor value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} />
              </Field>
            )}
          </form.Field>

          <form.Field name="exampleCount">
            {(field) => (
              <div className="space-y-2">
                <Label>Example count</Label>
                <SegmentedControl
                  aria-label="Example count"
                  value={String(field.state.value)}
                  onValueChange={(v) => field.handleChange(Number(v))}
                  options={EXAMPLE_COUNT_OPTIONS}
                />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  How many worked examples are injected into {TEMPLATE_VARIABLES.examples}. They come from the run's custom
                  examples, or are generated for the task.
                </p>
              </div>
            )}
          </form.Field>
        </div>

        <div className="lg:border-l lg:border-border lg:pl-6">
          <PromptPreview systemPrompt={preview.systemPrompt} template={preview.template} exampleCount={preview.exampleCount} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <Button variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" loading={isSubmitting}>
              {strategy ? 'Save changes' : 'Create strategy'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

export function StrategyFormDialog({
  open,
  onOpenChange,
  strategy,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The custom strategy to edit, or null to create one. */
  strategy: Strategy | null
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="2xl"
      title={strategy ? `Edit ${strategy.name}` : 'New strategy'}
      description="Define how a task is turned into a prompt. The preview updates as you type."
    >
      <StrategyForm key={strategy?.id ?? 'new'} strategy={strategy} onDone={() => onOpenChange(false)} />
    </Dialog>
  )
}
