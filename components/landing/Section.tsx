import type { ReactNode } from "react";

export default function Section({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`px-4 sm:px-6 lg:px-8 ${className}`.trim()}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}
