'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getErrorMessage } from '@/integration/utils';
import {
  useAdminDoctors,
  useAdminHealthAssistants,
} from '@/integration/admin/queries';
import {
  useCreateAdminDoctor,
  useCreateAdminHealthAssistant,
  useSetAdminDoctorActive,
  useSetAdminHealthAssistantActive,
} from '@/integration/admin/mutations';
import type { CreateStaffRequest } from '@/integration/admin/types';

type StaffKind = 'doctor' | 'healthAssistant';

const emptyStaffForm = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
};

function staffDisplayName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim() || 'Unnamed';
}

export default function TeamSettings({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const doctorsQuery = useAdminDoctors(true);
  const haQuery = useAdminHealthAssistants(true);

  return (
    <div>
      <SettingsPageHeader
        title="Team"
        description="Add and revoke doctors and health assistants for this clinic."
      />
      <Tabs defaultValue="doctors" className="gap-6">
        <TabsList>
          <TabsTrigger value="doctors" className="px-5">
            Doctors
          </TabsTrigger>
          <TabsTrigger value="health-assistants" className="px-5">
            Health assistants
          </TabsTrigger>
        </TabsList>

        <TabsContent value="doctors" className="space-y-4">
          <DoctorsPanel
            currentUserId={currentUserId}
            doctors={doctorsQuery.data ?? []}
            isLoading={doctorsQuery.isLoading}
          />
        </TabsContent>

        <TabsContent value="health-assistants" className="space-y-4">
          <HealthAssistantsPanel
            assistants={haQuery.data ?? []}
            isLoading={haQuery.isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DoctorsPanel({
  currentUserId,
  doctors,
  isLoading,
}: {
  currentUserId: string;
  doctors: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    isAdmin: boolean;
  }[];
  isLoading: boolean;
}) {
  const setActive = useSetAdminDoctorActive();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-(--text-secondary)">
          Manage doctor accounts for the clinic.
        </p>
        <Button variant="brand" size="sm" onClick={() => setOpen(true)}>
          Add doctor
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map((doctor) => {
              const isSelf = doctor.id === currentUserId;
              return (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      {staffDisplayName(doctor.firstName, doctor.lastName)}
                      {doctor.isAdmin ? (
                        <Badge variant="secondary">Super admin</Badge>
                      ) : null}
                      {isSelf ? <Badge variant="outline">You</Badge> : null}
                    </span>
                  </TableCell>
                  <TableCell>{doctor.email}</TableCell>
                  <TableCell>
                    <StatusBadge isActive={doctor.isActive} />
                  </TableCell>
                  <TableCell className="text-right">
                    {isSelf ? (
                      <span className="text-xs text-(--text-secondary)">
                        Cannot revoke yourself
                      </span>
                    ) : (
                      <ActiveToggle
                        isActive={doctor.isActive}
                        pending={
                          setActive.isPending &&
                          setActive.variables?.id === doctor.id
                        }
                        onToggle={() =>
                          setActive.mutate(
                            { id: doctor.id, isActive: !doctor.isActive },
                            {
                              onSuccess: () =>
                                toast.success(
                                  doctor.isActive
                                    ? 'Doctor revoked'
                                    : 'Doctor restored'
                                ),
                              onError: (error) =>
                                toast.error(
                                  getErrorMessage(
                                    error,
                                    'Could not update doctor'
                                  )
                                ),
                            }
                          )
                        }
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      <AddStaffDialog open={open} onOpenChange={setOpen} kind="doctor" />
    </>
  );
}

function HealthAssistantsPanel({
  assistants,
  isLoading,
}: {
  assistants: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    staffCode: string;
    isActive: boolean;
  }[];
  isLoading: boolean;
}) {
  const setActive = useSetAdminHealthAssistantActive();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-(--text-secondary)">
          Manage health assistant accounts for the clinic.
        </p>
        <Button variant="brand" size="sm" onClick={() => setOpen(true)}>
          Add health assistant
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Staff code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assistants.map((ha) => (
              <TableRow key={ha.id}>
                <TableCell className="font-medium">
                  {staffDisplayName(ha.firstName, ha.lastName)}
                </TableCell>
                <TableCell>{ha.email}</TableCell>
                <TableCell>{ha.staffCode || '—'}</TableCell>
                <TableCell>
                  <StatusBadge isActive={ha.isActive} />
                </TableCell>
                <TableCell className="text-right">
                  <ActiveToggle
                    isActive={ha.isActive}
                    pending={
                      setActive.isPending && setActive.variables?.id === ha.id
                    }
                    onToggle={() =>
                      setActive.mutate(
                        { id: ha.id, isActive: !ha.isActive },
                        {
                          onSuccess: () =>
                            toast.success(
                              ha.isActive
                                ? 'Health assistant revoked'
                                : 'Health assistant restored'
                            ),
                          onError: (error) =>
                            toast.error(
                              getErrorMessage(
                                error,
                                'Could not update health assistant'
                              )
                            ),
                        }
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <AddStaffDialog
        open={open}
        onOpenChange={setOpen}
        kind="healthAssistant"
      />
    </>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <Badge>Active</Badge>
  ) : (
    <Badge variant="destructive">Revoked</Badge>
  );
}

function ActiveToggle({
  isActive,
  pending,
  onToggle,
}: {
  isActive: boolean;
  pending: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      variant={isActive ? 'outline' : 'brand'}
      size="sm"
      disabled={pending}
      onClick={onToggle}
    >
      {pending ? 'Saving...' : isActive ? 'Revoke' : 'Restore'}
    </Button>
  );
}

function AddStaffDialog({
  open,
  onOpenChange,
  kind,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: StaffKind;
}) {
  const createDoctor = useCreateAdminDoctor();
  const createHa = useCreateAdminHealthAssistant();
  const [form, setForm] = useState(emptyStaffForm);
  const pending = createDoctor.isPending || createHa.isPending;
  const title = kind === 'doctor' ? 'Add doctor' : 'Add health assistant';

  const reset = () => setForm(emptyStaffForm);

  const submit = () => {
    const payload: CreateStaffRequest = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      password: form.password,
    };
    if (
      !payload.firstName ||
      !payload.lastName ||
      !payload.email ||
      !payload.phoneNumber ||
      payload.password.length < 8
    ) {
      toast.error('Fill all fields. Password must be at least 8 characters.');
      return;
    }

    const mutation = kind === 'doctor' ? createDoctor : createHa;
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(
          kind === 'doctor'
            ? 'Doctor added. They must reset this password on first login.'
            : 'Health assistant added. They must reset this password on first login.'
        );
        reset();
        onOpenChange(false);
      },
      onError: (error) =>
        toast.error(getErrorMessage(error, 'Could not add staff member')),
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            They will sign in with this temporary password, then create a new
            one on first login.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor={`${kind}-firstName`}>First name</Label>
              <Input
                id={`${kind}-firstName`}
                value={form.firstName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    firstName: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${kind}-lastName`}>Last name</Label>
              <Input
                id={`${kind}-lastName`}
                value={form.lastName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    lastName: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${kind}-email`}>Email</Label>
            <Input
              id={`${kind}-email`}
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <PhoneInput
              defaultCountry="GH"
              value={form.phoneNumber}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  phoneNumber: value || '',
                }))
              }
              placeholder="+233 24 000 0000"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${kind}-password`}>Temporary password</Label>
            <Input
              id={`${kind}-password`}
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="brand" onClick={submit} disabled={pending}>
            {pending ? 'Saving...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
