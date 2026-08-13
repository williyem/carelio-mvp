'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import SettingsPageHeader from './settings-page-header';
import { Spinner } from '@/components/ui/spinner';
import {
  DAYS_OF_WEEK,
  defaultAvailability,
  type DayName,
  type DoctorAvailability,
  type TimeRange,
} from '@/stores/availability-store';
import {
  getMyAvailability,
  saveMyAvailability,
} from '@/integration/settings/api';
import { getErrorMessage } from '@/integration';

const DAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function cloneAvailability(value: DoctorAvailability): DoctorAvailability {
  return {
    enabled: value.enabled,
    timezone: value.timezone,
    days: Object.fromEntries(
      Object.entries(value.days).map(([day, ranges]) => [
        day,
        ranges?.map((range) => ({ ...range })) ?? [],
      ])
    ),
  };
}

export default function ScheduleAvailabilitySettings({
  doctorId: _doctorId,
}: {
  doctorId: string;
}) {
  const [draft, setDraft] = useState<DoctorAvailability>(defaultAvailability);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMyAvailability()
      .then((data) => {
        if (!cancelled) setDraft(cloneAvailability(data));
      })
      .catch(() => {
        if (!cancelled) setDraft(defaultAvailability());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedDays = useMemo(
    () =>
      DAYS_OF_WEEK.filter(
        (day) => (draft.days[day]?.length ?? 0) > 0
      ) as DayName[],
    [draft]
  );

  const toggleDay = (day: DayName) => {
    setDraft((prev) => {
      const has = (prev.days[day]?.length ?? 0) > 0;
      const days = { ...prev.days };
      if (has) {
        delete days[day];
      } else {
        days[day] = [{ start: '09:00', end: '17:00' }];
      }
      return { ...prev, days };
    });
  };

  const updateRange = (
    day: DayName,
    index: number,
    key: keyof TimeRange,
    value: string
  ) => {
    setDraft((prev) => {
      const ranges = [...(prev.days[day] ?? [])];
      ranges[index] = { ...ranges[index], [key]: value };
      return { ...prev, days: { ...prev.days, [day]: ranges } };
    });
  };

  const addRange = (day: DayName) => {
    setDraft((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: [...(prev.days[day] ?? []), { start: '13:00', end: '17:00' }],
      },
    }));
  };

  const removeRange = (day: DayName, index: number) => {
    setDraft((prev) => {
      const ranges = (prev.days[day] ?? []).filter((_, i) => i !== index);
      const days = { ...prev.days };
      if (ranges.length === 0) delete days[day];
      else days[day] = ranges;
      return { ...prev, days };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await saveMyAvailability({
        enabled: draft.enabled,
        days: draft.days,
        timezone:
          draft.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setDraft(cloneAvailability(saved));
      setEditing(false);
      toast.success('Availability saved');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save availability'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <SettingsPageHeader
        title="Schedule availability"
        description="Patients and health assistants can only book slots inside these hours."
      />

      <div className="rounded-[20px] border border-(--border-stroke) p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Your availability</h2>
            <p className="text-sm text-(--text-secondary)">
              Working hours used when scheduling a consultation.
            </p>
          </div>
          {editing ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button
                variant="brand"
                className="rounded-full"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Spinner /> : 'Save'}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
          )}
        </div>

        <label className="flex items-start gap-3">
          <Checkbox
            checked={draft.enabled}
            disabled={!editing}
            onCheckedChange={(checked) =>
              setDraft((prev) => ({ ...prev, enabled: Boolean(checked) }))
            }
          />
          <span>
            <span className="block text-sm font-medium">
              Enable working hours
            </span>
            <span className="text-xs text-(--text-secondary)">
              Turn this off to allow booking at any time.
            </span>
          </span>
        </label>

        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((day, index) => {
            const active = selectedDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                disabled={!editing || !draft.enabled}
                onClick={() => toggleDay(day)}
                className={cn(
                  'size-9 rounded-full text-sm font-medium border',
                  active
                    ? 'bg-brand-blue text-white border-brand-blue'
                    : 'bg-white text-(--text-secondary) border-(--border-stroke)'
                )}
              >
                {DAY_SHORT[index]}
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          {selectedDays.map((day) => (
            <div key={day} className="space-y-2">
              {(draft.days[day] ?? []).map((range, index) => (
                <div
                  key={`${day}-${index}`}
                  className="flex items-center gap-3"
                >
                  <div className="w-24 text-sm font-medium">
                    {index === 0 ? day : ''}
                  </div>
                  <input
                    type="time"
                    value={range.start}
                    disabled={!editing}
                    onChange={(e) =>
                      updateRange(day, index, 'start', e.target.value)
                    }
                    className="h-10 rounded-md border border-(--border-stroke) px-2 text-sm"
                  />
                  <span className="text-sm text-(--text-secondary)">to</span>
                  <input
                    type="time"
                    value={range.end}
                    disabled={!editing}
                    onChange={(e) =>
                      updateRange(day, index, 'end', e.target.value)
                    }
                    className="h-10 rounded-md border border-(--border-stroke) px-2 text-sm"
                  />
                  {editing && (
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addRange(day)}
                      >
                        +
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRange(day, index)}
                      >
                        −
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
