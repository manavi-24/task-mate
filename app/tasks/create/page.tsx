"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { Calendar, Clock, X } from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "cooking", label: "Cooking" },
  { value: "cleaning", label: "Cleaning" },
  { value: "drying", label: "Drying" },
  { value: "academics", label: "Academics" },
  { value: "others", label: "Others" },
  { value: "other", label: "Other (type)" },
] as const;

const HOSTEL_OPTIONS = [
  { value: "hostel_a", label: "Hostel A" },
  { value: "hostel_b", label: "Hostel B" },
  { value: "hostel_c", label: "Hostel C" },
  { value: "hostel_d", label: "Hostel D" },
  { value: "other", label: "Other (type)" },
] as const;

type FieldErrors = Partial<
  Record<
    | "title"
    | "description"
    | "category"
    | "categoryOther"
    | "price"
    | "hostel"
    | "hostelOther"
    | "roomNumber"
    | "deadline",
    string
  >
>;

export default function CreateTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [category, setCategory] = useState<string>("");
  const [categoryOther, setCategoryOther] = useState<string>("");
  const [hostel, setHostel] = useState<string>("");
  const [hostelOther, setHostelOther] = useState<string>("");

  // Deadline is date-first (time optional)
  const [deadlineDate, setDeadlineDate] = useState<string>("");
  const [deadlineTime, setDeadlineTime] = useState<string>("");

  const resolvedDeadlineIso = useMemo(() => {
    if (!deadlineDate) return null;
    const time = deadlineTime || "23:59";
    const composed = new Date(`${deadlineDate}T${time}:00`);
    if (Number.isNaN(composed.getTime())) return null;
    return composed.toISOString();
  }, [deadlineDate, deadlineTime]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const priceRaw = String(formData.get("price") ?? "").trim();
    const roomNumber = String(formData.get("roomNumber") ?? "").trim();

    const resolvedCategory =
      category === "other" ? categoryOther.trim() : category;
    const resolvedHostel = hostel === "other" ? hostelOther.trim() : hostel;

    // Client-side validation (fast feedback; server will still validate)
    const nextErrors: FieldErrors = {};

    if (title.length < 4) nextErrors.title = "Title must be at least 4 characters";
    if (description.length < 10)
      nextErrors.description = "Description must be at least 10 characters";

    if (!category) nextErrors.category = "Please select a category";
    if (category === "other" && resolvedCategory.length < 2)
      nextErrors.categoryOther = "Please enter a category";

    if (!hostel) nextErrors.hostel = "Please select a hostel";
    if (hostel === "other" && resolvedHostel.length < 2)
      nextErrors.hostelOther = "Please enter your hostel";

    const price = Number(priceRaw);
    if (!Number.isFinite(price) || price < 1) {
      nextErrors.price = "Price must be at least ₹1";
    }

    if (!roomNumber) nextErrors.roomNumber = "Room number is required";

    if (deadlineDate) {
      if (!resolvedDeadlineIso) {
        nextErrors.deadline = "Deadline must be a valid date";
      } else if (new Date(resolvedDeadlineIso).getTime() <= Date.now()) {
        nextErrors.deadline = "Deadline must be in the future";
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setLoading(false);
      return;
    }

    const payload = {
      title,
      description,
      category: resolvedCategory,
      price,
      hostel: resolvedHostel,
      roomNumber,
      deadline: resolvedDeadlineIso, // optional
    };

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    setSuccess("Task posted successfully. Redirecting…");
    // Send user back to dashboard where the task should appear in
    // “Active tasks (All)” immediately.
    router.replace("/dashboard?created=1");
    router.refresh();
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:24px_24px]" />
      </div>

      <div className="relative mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-semibold text-indigo-300">Post a task</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Create a task
          </h1>
          <p className="text-white/60 mt-2">
            Post a micro-task for your hostelmates. Keep it clear and specific.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent shadow-[0_30px_100px_-60px_rgba(99,102,241,0.45)]">
          <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <InlineAlert variant="error" title="Couldn’t create task">
              {error}
            </InlineAlert>
          )}

          {success && (
            <InlineAlert variant="success" title="Success">
              {success}
            </InlineAlert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section: Task info */}
            <section className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Task details
                </h2>
                <p className="text-sm text-white/50">
                  A good title and description help others accept faster.
                </p>
              </div>

              <FormField
                label="Title"
                required
                error={fieldErrors.title}
              >
                <Input
                  name="title"
                  placeholder="e.g. Pick up food from canteen"
                  disabled={loading}
                  hasError={!!fieldErrors.title}
                  autoComplete="off"
                />
              </FormField>

              <FormField
                label="Description"
                required
                hint="Include any constraints (time, items, preferences)."
                error={fieldErrors.description}
              >
                <Textarea
                  name="description"
                  placeholder="Explain what needs to be done, from where, and any instructions…"
                  disabled={loading}
                  hasError={!!fieldErrors.description}
                />
              </FormField>
            </section>

            <div className="h-px bg-white/10" />

            {/* Section: Category + location */}
            <section className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Category & location
                </h2>
                <p className="text-sm text-white/50">
                  Helps people find tasks near them.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  label="Category"
                  required
                  error={fieldErrors.category || fieldErrors.categoryOther}
                >
                  <Select
                    name="categorySelect"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={loading}
                    hasError={
                      !!fieldErrors.category || !!fieldErrors.categoryOther
                    }
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </Select>

                  {category === "other" && (
                    <div className="mt-2">
                      <Input
                        value={categoryOther}
                        onChange={(e) => setCategoryOther(e.target.value)}
                        placeholder="Type category"
                        disabled={loading}
                        hasError={!!fieldErrors.categoryOther}
                        autoComplete="off"
                      />
                    </div>
                  )}
                </FormField>

                <FormField
                  label="Hostel"
                  required
                  error={fieldErrors.hostel || fieldErrors.hostelOther}
                >
                  <Select
                    name="hostelSelect"
                    value={hostel}
                    onChange={(e) => setHostel(e.target.value)}
                    disabled={loading}
                    hasError={
                      !!fieldErrors.hostel || !!fieldErrors.hostelOther
                    }
                  >
                    <option value="" disabled>
                      Select hostel
                    </option>
                    {HOSTEL_OPTIONS.map((h) => (
                      <option key={h.value} value={h.value}>
                        {h.label}
                      </option>
                    ))}
                  </Select>

                  {hostel === "other" && (
                    <div className="mt-2">
                      <Input
                        value={hostelOther}
                        onChange={(e) => setHostelOther(e.target.value)}
                        placeholder="Type hostel name"
                        disabled={loading}
                        hasError={!!fieldErrors.hostelOther}
                        autoComplete="off"
                      />
                    </div>
                  )}
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  label="Room number"
                  required
                  error={fieldErrors.roomNumber}
                >
                  <Input
                    name="roomNumber"
                    placeholder="e.g. 204"
                    disabled={loading}
                    hasError={!!fieldErrors.roomNumber}
                    autoComplete="off"
                  />
                </FormField>

                <FormField
                  label="Deadline (optional)"
                  hint="Pick a date (time optional). Tasks are hidden after the deadline passes."
                  error={fieldErrors.deadline}
                >
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="relative">
                        <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                        <Input
                          name="deadlineDate"
                          type="date"
                          value={deadlineDate}
                          onChange={(e) => setDeadlineDate(e.target.value)}
                          disabled={loading}
                          hasError={!!fieldErrors.deadline}
                          className="pl-9"
                        />
                      </div>

                      <div className="relative">
                        <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                        <Input
                          name="deadlineTime"
                          type="time"
                          value={deadlineTime}
                          onChange={(e) => setDeadlineTime(e.target.value)}
                          disabled={loading || !deadlineDate}
                          hasError={!!fieldErrors.deadline}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-white/45">
                        {deadlineDate
                          ? deadlineTime
                            ? "Deadline set (date + time)."
                            : "Deadline set (end of day)."
                          : "No deadline set."}
                      </p>

                      {deadlineDate ? (
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => {
                            setDeadlineDate("");
                            setDeadlineTime("");
                          }}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition disabled:opacity-60"
                        >
                          <X className="h-3.5 w-3.5" />
                          Clear
                        </button>
                      ) : null}
                    </div>
                  </div>
                </FormField>
              </div>
            </section>

            <div className="h-px bg-white/10" />

            {/* Section: pricing */}
            <section className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white">Pricing</h2>
                <p className="text-sm text-white/50">
                  Set a fair reward to get your task picked up quickly.
                </p>
              </div>

              <FormField
                label="Reward (₹)"
                required
                error={fieldErrors.price}
              >
                <Input
                  name="price"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  placeholder="e.g. 50"
                  disabled={loading}
                  hasError={!!fieldErrors.price}
                />
              </FormField>
            </section>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                disabled={loading}
                onClick={() => router.push("/tasks")}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Post task
              </Button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}
