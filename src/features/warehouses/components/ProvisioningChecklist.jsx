import React from 'react';
import { Check, Circle, Lock } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

const STEPS = [
  { key: 'identity', label: 'Identity' }, // Reduced label text
  { key: 'location', label: 'Location' },
  { key: 'manager', label: 'Admin Assignment' },
  { key: 'provision', label: 'Provision', lockedUntilReady: true },
];

function StepIcon({ done, locked }) {
  // Using generic Icons but colored using Design System Charts
  if (locked) return <Lock className="h-3 w-3 text-muted-foreground" />;
  if (done) return <Check className="h-3.5 w-3.5 text-chart-3" />; // Chart 3 = Success
  return <Circle className="h-3 w-3 text-muted-foreground/60" />;
}

export function ProvisioningChecklist({ checklist }) {
  const prerequisiteDone = checklist.identity && checklist.location && checklist.manager;

  return (
    // Minimal radius (md) and vertical padding (py-3)
    <div className="w-full rounded-md border border-border bg-card px-4 py-3 shadow-sm sm:px-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Provisioning Checklist
      </h3>
      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-start md:gap-0">
        {STEPS.map((step, index) => {
          const isProvision = step.key === 'provision';
          const done = isProvision ? prerequisiteDone && checklist.canProvision : checklist[step.key];
          const locked = isProvision && !prerequisiteDone;
          const isLast = index === STEPS.length - 1;

          return (
            <div
              key={step.key}
              className={cn('flex min-w-0 flex-1 items-center md:flex-col md:gap-1.5 md:px-1')}
            >
              <div className="flex w-full items-center md:justify-center">
                <span
                  className={cn(
                    // Small circles: h-7 w-7
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
                    done && !locked
                      ? 'border-chart-3/40 bg-chart-3/10' // Done with Chart 3 color
                      : locked
                      ? 'border-border bg-muted/30'
                      : 'border-border bg-muted/30',
                  )}
                >
                  <StepIcon done={done && !locked} locked={locked} />
                </span>
                {!isLast && (
                  <span className="mx-2 h-px flex-1 bg-border md:hidden" aria-hidden />
                )}
              </div>
              <p
                className={cn(
                  // Small labels: text-xs, reduced line height
                  'min-w-0 flex-1 text-xs leading-tight md:flex-none md:text-center',
                  done && !locked ? 'font-medium text-foreground' : 'text-muted-foreground',
                  locked && 'opacity-60',
                )}
              >
                {step.label}
              </p>
              {!isLast && (
                <span
                  // Using Gold/Chart 1 for the progress lines
                  className="mx-auto mt-1.5 hidden h-px w-full max-w-[70%] bg-chart-1 md:block animate-standard ease-standard"
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}