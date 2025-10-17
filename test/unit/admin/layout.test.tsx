/**
 * Admin Layout Tests
 * Tests admin authentication and layout rendering
 */
import { render, screen } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import AdminRootLayout from "@/app/admin/layout";

// Mock dependencies
const mockPush = jest.fn();
const mockUseSession = jest.fn();
const mockUseRouter = jest.fn();
const mockUsePathname = jest.fn();

jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => mockUseRouter(),
  usePathname: () => mockUsePathname(),
}));

jest.mock("@/components/admin/AdminSidebar", () => ({
  AdminSidebar: () => <div data-testid="admin-sidebar">Admin Sidebar</div>,
}));

describe("Admin Layout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  describe("Authentication", () => {
    it("should redirect to login when unauthenticated on admin page", () => {
      mockUsePathname.mockReturnValue("/admin/dashboard");
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: jest.fn(),
      } as any);

      render(
        <AdminRootLayout>
          <div>Admin Content</div>
        </AdminRootLayout>
      );

      expect(mockPush).toHaveBeenCalledWith("/admin/login");
    });

    it("should allow access to login page without session", () => {
      mockUsePathname.mockReturnValue("/admin/login");
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: jest.fn(),
      } as any);

      render(
        <AdminRootLayout>
          <div>Login Form</div>
        </AdminRootLayout>
      );

      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByText("Login Form")).toBeInTheDocument();
    });

    it("should show loading state when session is loading", () => {
      mockUsePathname.mockReturnValue("/admin/dashboard");
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
        update: jest.fn(),
      } as any);

      render(
        <AdminRootLayout>
          <div>Admin Content</div>
        </AdminRootLayout>
      );

      expect(screen.getByText("Betöltés...")).toBeInTheDocument();
    });
  });

  describe("Layout Rendering", () => {
    it("should render sidebar when authenticated on admin page", () => {
      mockUsePathname.mockReturnValue("/admin/dashboard");
      mockUseSession.mockReturnValue({
        data: {
          user: { email: "admin@example.com", role: "ADMIN" },
          expires: "2025-12-31",
        },
        status: "authenticated",
        update: jest.fn(),
      } as any);

      render(
        <AdminRootLayout>
          <div>Admin Content</div>
        </AdminRootLayout>
      );

      expect(screen.getByTestId("admin-sidebar")).toBeInTheDocument();
      expect(screen.getByText("Admin Content")).toBeInTheDocument();
    });

    it("should not render sidebar on login page", () => {
      mockUsePathname.mockReturnValue("/admin/login");
      mockUseSession.mockReturnValue({
        data: {
          user: { email: "admin@example.com", role: "ADMIN" },
          expires: "2025-12-31",
        },
        status: "authenticated",
        update: jest.fn(),
      } as any);

      render(
        <AdminRootLayout>
          <div>Login Form</div>
        </AdminRootLayout>
      );

      expect(screen.queryByTestId("admin-sidebar")).not.toBeInTheDocument();
      expect(screen.getByText("Login Form")).toBeInTheDocument();
    });
  });
});
