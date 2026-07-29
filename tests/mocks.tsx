import { vi } from "vitest";

vi.mock("next/image", () => ({
  default: function MockImage(props: Record<string, unknown>) {
    const { ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- Mock for testing env where next/image is unavailable
    return <img data-mock="next-image" {...rest} />;
  }
}));

import type { ReactNode } from "react";

vi.mock("next/link", () => ({
  default: function MockLink({ href, children, ...props }: Record<string, unknown>) {
    return <a href={href as string} data-mock="next-link" {...props}>{children as ReactNode}</a>;
  }
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() })
}));
