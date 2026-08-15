'use client';

import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ImagePlus, MoreHorizontal, Plus } from 'lucide-react';
import { toast } from 'sonner';
import SettingsPageHeader from '@/components/settings/settings-page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUploadFile } from '@/integration/files/mutations';
import { getErrorMessage } from '@/integration';
import {
  createAdminDeviceGuide,
  deleteAdminDeviceGuide,
  patchAdminDeviceGuide,
} from '@/integration/device-guides/api';
import {
  guideImage,
  slugifyDeviceTitle,
  type DeviceGuide,
} from '@/lib/device-guides';
import {
  ADMIN_DEVICE_GUIDES_QUERY_KEY,
  DEVICE_GUIDES_QUERY_KEY,
  useAdminDeviceGuides,
} from '@/hooks/use-device-guides';
import { useDeviceCatalogStore } from '@/stores/device-catalog-store';

const FIELD_CLASS = 'h-11';
const TEXTAREA_CLASS =
  'w-full rounded-[8px] border border-(--border-light) bg-(--bg-input) px-3 py-2.5 text-sm text-(--text-primary) outline-none focus-visible:ring-2 focus-visible:ring-primary resize-y min-h-[88px]';

function linesToList(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function listToLines(value: string[] | undefined): string {
  return (value || []).join('\n');
}

type EditForm = {
  mode: 'create' | 'edit';
  slug: string;
  title: string;
  shortLabel: string;
  description: string;
  image: string;
  youtubeUrl: string;
  tips: string;
  steps: string;
  isActive: boolean;
  sortOrder: number;
  video?: string;
};

function emptyCreateForm(): EditForm {
  return {
    mode: 'create',
    slug: '',
    title: '',
    shortLabel: '',
    description: '',
    image: '',
    youtubeUrl: '',
    tips: '',
    steps: '',
    isActive: true,
    sortOrder: 0,
  };
}

function toEditForm(guide: DeviceGuide): EditForm {
  return {
    mode: 'edit',
    slug: guide.slug,
    title: guide.title,
    shortLabel: guide.shortLabel,
    description: guide.description,
    image: guideImage(guide),
    youtubeUrl: guide.youtubeUrl || '',
    tips: listToLines(guide.tips),
    steps: listToLines(guide.steps),
    isActive: guide.isActive !== false,
    sortOrder: guide.sortOrder ?? 0,
    video: guide.video,
  };
}

export default function DeviceCatalogSettings() {
  const queryClient = useQueryClient();
  const { data: guides, isLoading } = useAdminDeviceGuides(true);
  const upsertGuide = useDeviceCatalogStore((state) => state.upsertGuide);
  const removeGuide = useDeviceCatalogStore((state) => state.removeGuide);
  const upload = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);

  const sorted = useMemo(
    () => [...guides].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [guides]
  );

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ADMIN_DEVICE_GUIDES_QUERY_KEY,
      }),
      queryClient.invalidateQueries({ queryKey: DEVICE_GUIDES_QUERY_KEY }),
    ]);
  };

  const saveForm = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.shortLabel.trim()) {
      toast.error('Title and short label are required');
      return;
    }

    const slug =
      editing.mode === 'create'
        ? editing.slug.trim() || slugifyDeviceTitle(editing.title)
        : editing.slug;

    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      toast.error('Use a slug like blood-pressure (lowercase with hyphens)');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: editing.title.trim(),
        shortLabel: editing.shortLabel.trim(),
        description: editing.description.trim(),
        imageUrl: editing.image.trim(),
        youtubeUrl: editing.youtubeUrl.trim(),
        tips: linesToList(editing.tips),
        steps: linesToList(editing.steps),
        isActive: editing.isActive,
        sortOrder: editing.sortOrder || sorted.length + 1,
        videoUrl: editing.video,
      };

      const saved =
        editing.mode === 'create'
          ? await createAdminDeviceGuide({ ...payload, slug })
          : await patchAdminDeviceGuide(slug, payload);

      upsertGuide({
        ...saved,
        image: saved.imageUrl || saved.image || editing.image,
        imageUrl: saved.imageUrl || saved.image || editing.image,
      });
      await invalidate();
      toast.success(
        editing.mode === 'create' ? 'Device guide added' : 'Device guide saved'
      );
      setEditing(null);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save device guide'));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (guide: DeviceGuide) => {
    const next = guide.isActive === false;
    try {
      const saved = await patchAdminDeviceGuide(guide.slug, {
        isActive: next,
      });
      upsertGuide({
        ...guide,
        ...saved,
        isActive: next,
      });
      await invalidate();
      toast.success(next ? 'Guide shown' : 'Guide hidden');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update guide'));
    }
  };

  const deleteGuide = async (guide: DeviceGuide) => {
    const confirmed = window.confirm(
      `Delete “${guide.title}”? This cannot be undone.`
    );
    if (!confirmed) return;
    try {
      await deleteAdminDeviceGuide(guide.slug);
      removeGuide(guide.slug);
      await invalidate();
      toast.success('Device guide deleted');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not delete guide'));
    }
  };

  const onImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !editing) return;
    try {
      const uploaded = await upload.mutateAsync(file);
      if (!uploaded.url) {
        toast.error('Upload succeeded but no URL was returned');
        return;
      }
      setEditing((current) =>
        current ? { ...current, image: uploaded.url } : current
      );
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not upload image'));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SettingsPageHeader
          title="Devices"
          description="Photos, YouTube how-tos, and steps shown to patients and health assistants during visits."
        />
        <Button
          type="button"
          variant="brand"
          className="rounded-full shrink-0"
          onClick={() => setEditing(emptyCreateForm())}
        >
          <Plus className="size-4" />
          Add device
        </Button>
      </div>

      {isLoading && sorted.length === 0 ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <section className="rounded-[20px] border border-(--border-stroke) overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[72px]">Photo</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Short label</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[56px] text-right"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-(--text-secondary)"
                  >
                    No devices yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((guide) => (
                  <TableRow key={guide.slug}>
                    <TableCell>
                      <div className="relative size-12 rounded-[8px] overflow-hidden bg-gray-100 border border-(--border-stroke)">
                        {guideImage(guide) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={guideImage(guide)}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-medium text-(--text-primary)">
                          {guide.title}
                        </p>
                        <p className="text-xs text-(--text-secondary) line-clamp-1">
                          {guide.description || guide.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{guide.shortLabel}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          guide.isActive !== false ? 'default' : 'secondary'
                        }
                      >
                        {guide.isActive !== false ? 'Shown' : 'Hidden'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={`Actions for ${guide.title}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() => setEditing(toEditForm(guide))}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => void toggleActive(guide)}
                          >
                            {guide.isActive !== false ? 'Hide' : 'Show'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-700"
                            onClick={() => void deleteGuide(guide)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </section>
      )}

      <Dialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="max-w-xl gap-0 p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-(--border-stroke)">
            <DialogTitle>
              {editing?.mode === 'create'
                ? 'Add device guide'
                : 'Edit device guide'}
            </DialogTitle>
            <DialogDescription>
              Shown to patients and health assistants during visits.
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            <div className="max-h-[min(70vh,640px)] overflow-y-auto px-6 py-5 space-y-6">
              <section className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={upload.isPending}
                  className="group relative size-24 shrink-0 overflow-hidden rounded-[14px] border border-(--border-stroke) bg-(--bg-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
                  aria-label="Upload device photo"
                >
                  {editing.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={editing.image}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="flex size-full flex-col items-center justify-center gap-1 text-(--text-secondary)">
                      <ImagePlus className="size-6" />
                      <span className="text-[11px] font-medium">Photo</span>
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {upload.isPending ? 'Uploading…' : 'Change'}
                  </span>
                </button>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-sm font-medium text-(--text-primary)">
                    Device photo
                  </p>
                  <p className="text-sm text-(--text-secondary)">
                    Clear photo of the meter patients will see in the guide.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-full px-4"
                      disabled={upload.isPending}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {upload.isPending ? 'Uploading…' : 'Upload photo'}
                    </Button>
                    {editing.image ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 rounded-full px-3 text-(--text-secondary)"
                        onClick={() => setEditing({ ...editing, image: '' })}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={onImageUpload}
                  />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-(--text-primary)">
                  Basics
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="device-title">Title</Label>
                    <Input
                      id="device-title"
                      className={FIELD_CLASS}
                      value={editing.title}
                      placeholder="e.g. Digital thermometer"
                      onChange={(event) => {
                        const title = event.target.value;
                        setEditing((current) => {
                          if (!current) return current;
                          if (current.mode !== 'create') {
                            return { ...current, title };
                          }
                          return {
                            ...current,
                            title,
                            slug: slugifyDeviceTitle(title),
                          };
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="device-shortLabel">Short label</Label>
                    <Input
                      id="device-shortLabel"
                      className={FIELD_CLASS}
                      value={editing.shortLabel}
                      placeholder="e.g. Temperature"
                      onChange={(event) =>
                        setEditing({
                          ...editing,
                          shortLabel: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="device-description">Description</Label>
                    <textarea
                      id="device-description"
                      value={editing.description}
                      placeholder="One short sentence about what this device measures."
                      onChange={(event) =>
                        setEditing({
                          ...editing,
                          description: event.target.value,
                        })
                      }
                      rows={2}
                      className={TEXTAREA_CLASS}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-(--text-primary)">
                  How to use
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="device-youtube">YouTube link</Label>
                    <Input
                      id="device-youtube"
                      className={FIELD_CLASS}
                      value={editing.youtubeUrl}
                      onChange={(event) =>
                        setEditing({
                          ...editing,
                          youtubeUrl: event.target.value,
                        })
                      }
                      placeholder="https://www.youtube.com/watch?v=…"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="device-tips">Tips</Label>
                    <textarea
                      id="device-tips"
                      value={editing.tips}
                      placeholder="One tip per line"
                      onChange={(event) =>
                        setEditing({ ...editing, tips: event.target.value })
                      }
                      rows={4}
                      className={TEXTAREA_CLASS}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="device-steps">Steps</Label>
                    <textarea
                      id="device-steps"
                      value={editing.steps}
                      placeholder="One step per line"
                      onChange={(event) =>
                        setEditing({
                          ...editing,
                          steps: event.target.value,
                        })
                      }
                      rows={4}
                      className={TEXTAREA_CLASS}
                    />
                  </div>
                </div>
              </section>

              <section className="flex items-center justify-between gap-4 rounded-[14px] border border-(--border-stroke) bg-(--bg-primary) px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-(--text-primary)">
                    Show during visits
                  </p>
                  <p className="text-xs text-(--text-secondary)">
                    Hidden guides stay in this list but are not offered in
                    calls.
                  </p>
                </div>
                <Switch
                  checked={editing.isActive}
                  onCheckedChange={(checked) =>
                    setEditing({
                      ...editing,
                      isActive: Boolean(checked),
                    })
                  }
                />
              </section>
            </div>
          ) : null}

          <DialogFooter className="border-t border-(--border-stroke) px-6 py-4 sm:justify-end">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
            <Button
              variant="brand"
              className="rounded-full px-5"
              onClick={() => void saveForm()}
              disabled={saving || upload.isPending}
            >
              {saving ? (
                <Spinner />
              ) : editing?.mode === 'create' ? (
                'Add device'
              ) : (
                'Save changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
