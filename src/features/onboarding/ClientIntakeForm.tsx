'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { submitClientIntake } from '@/actions/onboarding';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  type ClientIntakeInput,
  clientIntakeSchema,
  partnershipPackageOptions,
  socialSupportOptions,
} from '@/features/onboarding/ClientIntakeSchema';

type ClientIntakeFormProps = {
  initialValues?: Partial<ClientIntakeInput>;
};

const defaultValues: ClientIntakeInput = {
  additionalSupport: [],
  businessName: '',
  goals: '',
  instagramHandle: '',
  mainPointOfContact: '',
  partnershipPackage: 'SHARING',
};

export const ClientIntakeForm = ({ initialValues }: ClientIntakeFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ClientIntakeInput>({
    defaultValues: {
      ...defaultValues,
      ...initialValues,
      additionalSupport: initialValues?.additionalSupport ?? defaultValues.additionalSupport,
      partnershipPackage: initialValues?.partnershipPackage ?? defaultValues.partnershipPackage,
    },
    resolver: zodResolver(clientIntakeSchema),
  });

  const onSubmit = (values: ClientIntakeInput) => {
    setServerError(null);

    startTransition(async () => {
      const result = await submitClientIntake(values);

      if (!result.success) {
        setServerError(result.error ?? 'Unable to submit intake.');
        return;
      }

      setIsSubmitted(true);
      router.refresh();
    });
  };

  return (
    <div className="vf-card mx-auto w-full max-w-3xl p-6 md:p-8">
      <div className="mb-6 border-b border-border/60 pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Ventura Forward Client Intake</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete your partnership profile to unlock your dashboard.
        </p>
      </div>

      {isSubmitted
        ? (
            <div className="vf-surface border-secondary/30 p-4 text-sm text-foreground">
              Intake submitted successfully. Refresh to continue to your dashboard.
            </div>
          )
        : null}

      {serverError
        ? (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {serverError}
            </div>
          )
        : null}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-8">
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Section 1: Basics</h2>

            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Business legal name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mainPointOfContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Point of Contact</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instagramHandle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram Handle</FormLabel>
                  <FormControl>
                    <Input placeholder="@yourhandle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Section 2: Ventura Forward Partnership Packages
            </h2>

            <FormField
              control={form.control}
              name="partnershipPackage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose one package</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {partnershipPackageOptions.map(option => (
                        <label key={option.value} className="vf-surface flex cursor-pointer gap-3 p-3">
                          <input
                            type="radio"
                            name={field.name}
                            value={option.value}
                            checked={field.value === option.value}
                            onChange={() => field.onChange(option.value)}
                            onBlur={field.onBlur}
                            className="mt-1 size-4 border-border text-primary focus:ring-ring"
                          />
                          <span>
                            <span className="block text-sm font-medium text-foreground">{option.label}</span>
                            <span className="mt-1 block text-xs text-muted-foreground">{option.description}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Section 3: Additional Social Media Support
            </h2>

            <FormField
              control={form.control}
              name="additionalSupport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select all that apply</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {socialSupportOptions.map(option => {
                        const isChecked = field.value.includes(option.value);

                        return (
                          <label key={option.value} className="vf-surface flex cursor-pointer items-center gap-3 px-3 py-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  field.onChange([...field.value, option.value]);
                                  return;
                                }

                                field.onChange(field.value.filter(value => value !== option.value));
                              }}
                              className="size-4 rounded border-border text-primary focus:ring-ring"
                            />
                            <span className="text-sm text-foreground">{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormDescription>Optional: choose the support services you need this cycle.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Section 4: Goals</h2>

            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What are your primary goals for this promo period?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share what outcomes matter most for your promo period."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} className="min-w-44">
              {isPending ? 'Submitting...' : 'Submit Intake'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
