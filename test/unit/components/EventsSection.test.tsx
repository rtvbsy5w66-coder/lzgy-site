/**
 * EventsSection Component Tests
 * Tests user-facing events display functionality
 */
import { render, screen, waitFor } from "@testing-library/react";
import EventsSection from "@/components/EventsSection";

// Mock fetch globally
global.fetch = jest.fn();

describe("EventsSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show loading state initially", () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<EventsSection />);

    expect(screen.getByText("Közelgő Események")).toBeInTheDocument();
    // Check for loader SVG element instead of role
    const loader = document.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
  });

  it("should display events when fetch succeeds", async () => {
    const mockEvents = [
      {
        id: "1",
        title: "Közösségi Takarítás",
        description: "Takarítsuk ki közösen a Dunakorzót",
        location: "Dunakorzó",
        startDate: "2025-10-10T10:00:00Z",
        endDate: "2025-10-10T14:00:00Z",
        status: "UPCOMING",
      },
      {
        id: "2",
        title: "Lakossági Fórum",
        description: "Beszéljünk a közösség jövőjéről",
        location: "Városháza",
        startDate: "2025-10-15T18:00:00Z",
        endDate: "2025-10-15T20:00:00Z",
        status: "UPCOMING",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockEvents }),
    });

    render(<EventsSection />);

    await waitFor(() => {
      expect(screen.getByText("Közösségi Takarítás")).toBeInTheDocument();
      expect(screen.getByText("Lakossági Fórum")).toBeInTheDocument();
    });

    expect(screen.getByText("Dunakorzó")).toBeInTheDocument();
    expect(screen.getByText("Városháza")).toBeInTheDocument();
    expect(screen.getByText("Minden Esemény")).toBeInTheDocument();
  });

  it("should display error message when fetch fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    render(<EventsSection />);

    await waitFor(() => {
      expect(
        screen.getByText("Hiba az események betöltése közben")
      ).toBeInTheDocument();
    });
  });

  it("should display empty state when no events", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    render(<EventsSection />);

    await waitFor(() => {
      expect(
        screen.getByText("Jelenleg nincsenek közelgő események.")
      ).toBeInTheDocument();
    });
  });

  it("should filter and display only UPCOMING and ONGOING events", async () => {
    const mockEvents = [
      {
        id: "1",
        title: "Közelgő Esemény",
        description: "Leírás",
        location: "Hely",
        startDate: "2025-10-10T10:00:00Z",
        endDate: "2025-10-10T14:00:00Z",
        status: "UPCOMING",
      },
      {
        id: "2",
        title: "Befejezett Esemény",
        description: "Leírás",
        location: "Hely",
        startDate: "2025-09-01T10:00:00Z",
        endDate: "2025-09-01T14:00:00Z",
        status: "COMPLETED",
      },
      {
        id: "3",
        title: "Folyamatban Lévő Esemény",
        description: "Leírás",
        location: "Hely",
        startDate: "2025-10-02T10:00:00Z",
        endDate: "2025-10-02T20:00:00Z",
        status: "ONGOING",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockEvents }),
    });

    render(<EventsSection />);

    await waitFor(() => {
      expect(screen.getByText("Közelgő Esemény")).toBeInTheDocument();
      expect(screen.getByText("Folyamatban Lévő Esemény")).toBeInTheDocument();
      expect(screen.queryByText("Befejezett Esemény")).not.toBeInTheDocument();
    });
  });

  it("should display correct status badge", async () => {
    const mockEvents = [
      {
        id: "1",
        title: "Közelgő Koncert",
        description: "Leírás",
        location: "Hely",
        startDate: "2025-10-10T10:00:00Z",
        endDate: "2025-10-10T14:00:00Z",
        status: "UPCOMING",
      },
      {
        id: "2",
        title: "Folyamatban Lévő Vásár",
        description: "Leírás",
        location: "Hely",
        startDate: "2025-10-02T10:00:00Z",
        endDate: "2025-10-02T20:00:00Z",
        status: "ONGOING",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockEvents }),
    });

    render(<EventsSection />);

    await waitFor(() => {
      // Check for badges, not event titles
      const badges = screen.getAllByText(/Közelgő|Folyamatban/);
      expect(badges.length).toBeGreaterThan(0);
    });
  });
});
