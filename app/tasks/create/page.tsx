"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const payload = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      price: Number(formData.get("price")),
      hostel: formData.get("hostel"),
      roomNumber: formData.get("roomNumber"),
      deadline: formData.get("deadline"), // ISO datetime string
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

    router.push("/dashboard");
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create Task</h1>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <input
          name="title"
          placeholder="Task title"
          required
          className="w-full p-2 border"
        />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Describe the task clearly"
          required
          className="w-full p-2 border"
        />

        {/* Category Dropdown */}
        <select
          name="category"
          required
          className="w-full p-2 border"
          defaultValue=""
        >
          <option value="" disabled>
            Select category
          </option>
          <option value="cooking">Cooking</option>
          <option value="cleaning">Cleaning</option>
          <option value="drying">Drying</option>
          <option value="academics">Academics</option>
          <option value="others">Others</option>
        </select>

        {/* Price */}
        <input
          name="price"
          type="number"
          placeholder="Price (₹)"
          required
          min={1}
          className="w-full p-2 border"
        />

        {/* Hostel */}
        <input
          name="hostel"
          placeholder="Hostel (e.g. Hostel A)"
          required
          className="w-full p-2 border"
        />

        {/* Room Number */}
        <input
          name="roomNumber"
          placeholder="Room number (e.g. 204)"
          required
          className="w-full p-2 border"
        />

        {/* Deadline with date + time */}
        <div>
          <label className="block text-sm mb-1 text-gray-300">
            Deadline (date & time)
          </label>
          <input
            name="deadline"
            type="datetime-local"
            required
            className="w-full p-2 border"
          />
          <p className="text-xs text-gray-400 mt-1">
            Please select both date and time. Task must be completed before this.
          </p>
        </div>

        {/* Submit */}
        <button
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded"
        >
          {loading ? "Creating..." : "Create Task"}
        </button>
      </form>
    </div>
  );
}
